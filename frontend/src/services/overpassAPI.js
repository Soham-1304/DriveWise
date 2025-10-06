/**
 * Overpass API Integration for Real POI Data
 * Fetches fuel stations, charging stations, restaurants, and restrooms
 * from OpenStreetMap database
 */

const OVERPASS_URL = import.meta.env.VITE_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter'

/**
 * Build Overpass QL query for POIs with enhanced categories
 */
function buildOverpassQuery(bounds, poiTypes) {
  const { south, west, north, east } = bounds
  const bbox = `${south},${west},${north},${east}`
  
  const queries = []
  
  // Fuel stations
  if (poiTypes.includes('fuel')) {
    queries.push(`node["amenity"="fuel"](${bbox});`)
    queries.push(`way["amenity"="fuel"](${bbox});`)
  }
  
  // EV charging stations
  if (poiTypes.includes('charging')) {
    queries.push(`node["amenity"="charging_station"](${bbox});`)
    queries.push(`way["amenity"="charging_station"](${bbox});`)
  }
  
  // Food & Restaurants (Enhanced for Casual)
  if (poiTypes.includes('food')) {
    queries.push(`node["amenity"~"restaurant|cafe|fast_food|food_court|ice_cream"](${bbox});`)
    queries.push(`way["amenity"~"restaurant|cafe|fast_food|food_court"](${bbox});`)
  }
  
  // Restrooms/Toilets
  if (poiTypes.includes('restroom')) {
    queries.push(`node["amenity"="toilets"](${bbox});`)
    queries.push(`way["amenity"="toilets"](${bbox});`)
  }
  
  // Parking
  if (poiTypes.includes('parking')) {
    queries.push(`node["amenity"="parking"](${bbox});`)
    queries.push(`way["amenity"="parking"](${bbox});`)
  }
  
  // Tourist Attractions & Sightseeing (NEW for Casual)
  if (poiTypes.includes('tourism')) {
    queries.push(`node["tourism"~"attraction|viewpoint|museum|artwork|gallery"](${bbox});`)
    queries.push(`way["tourism"~"attraction|viewpoint|museum"](${bbox});`)
  }
  
  // Scenic Viewpoints (NEW for Casual)
  if (poiTypes.includes('viewpoint')) {
    queries.push(`node["tourism"="viewpoint"](${bbox});`)
  }
  
  // Rest Areas (NEW for all routes)
  if (poiTypes.includes('rest_area')) {
    queries.push(`node["highway"="rest_area"](${bbox});`)
    queries.push(`way["highway"="rest_area"](${bbox});`)
    queries.push(`node["highway"="services"](${bbox});`)
  }
  
  // Speed Cameras (Enhanced for Fastest)
  if (poiTypes.includes('speed_camera')) {
    queries.push(`node["highway"="speed_camera"](${bbox});`)
  }
  
  // Toll booths
  if (poiTypes.includes('toll')) {
    queries.push(`node["barrier"="toll_booth"](${bbox});`)
    queries.push(`node["amenity"="toll_booth"](${bbox});`)
  }
  
  // Traffic signals (NEW for Fastest)
  if (poiTypes.includes('traffic_signals')) {
    queries.push(`node["highway"="traffic_signals"](${bbox});`)
  }
  
  // Hospitals (for ALL routes)
  if (poiTypes.includes('hospital')) {
    queries.push(`node["amenity"="hospital"](${bbox});`)
    queries.push(`way["amenity"="hospital"](${bbox});`)
  }
  
  // Emergency services (police, pharmacy)
  if (poiTypes.includes('emergency')) {
    queries.push(`node["amenity"~"clinic|pharmacy|police"](${bbox});`)
    queries.push(`way["amenity"~"police"](${bbox});`)
  }
  
  // Parks & Nature (NEW for ECO route)
  if (poiTypes.includes('park')) {
    queries.push(`node["leisure"="park"](${bbox});`)
    queries.push(`way["leisure"="park"](${bbox});`)
    queries.push(`node["natural"="tree"](${bbox});`)
  }
  
  return `
    [out:json][timeout:30];
    (
      ${queries.join('\n      ')}
    );
    out body;
    >;
    out skel qt;
  `
}

/**
 * Fetch POIs from Overpass API
 * @param {Object} bounds - {north, south, east, west}
 * @param {Array} poiTypes - ['fuel', 'charging', 'food', 'restroom', 'parking']
 * @returns {Promise<Array>} Array of POI objects
 */
export async function fetchPOIs(bounds, poiTypes = ['fuel', 'charging', 'food']) {
  try {
    const query = buildOverpassQuery(bounds, poiTypes)
    
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    })
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Transform OSM data to our POI format
    return data.elements
      .filter(element => {
        // Filter out elements without proper coordinates or tags
        return element.lat && element.lon && element.tags
      })
      .map(element => {
        const type = determinePOIType(element.tags)
        const tags = element.tags
        
        // Generate a proper name from tags
        let name = tags.name || tags['name:en']
        
        // For viewpoints without names, use description or nearby landmarks
        if (!name && type === 'viewpoint') {
          name = tags.description || tags.note || 'Scenic Viewpoint'
        }
        
        // For parks without names, use leisure type
        if (!name && type === 'park') {
          name = tags.leisure === 'park' ? 'Park' : 'Natural Area'
        }
        
        // For tourism spots without names, use tourism type
        if (!name && type === 'tourism') {
          const tourismType = tags.tourism
          name = tourismType ? `${tourismType.charAt(0).toUpperCase()}${tourismType.slice(1)}` : 'Tourist Attraction'
        }
        
        // Fallback to default names
        if (!name) {
          name = getDefaultName(type)
        }
        
        return {
          id: element.id,
          lat: element.lat,
          lng: element.lon,
          name,
          type,
          amenity: tags.amenity,
          brand: tags.brand,
          operator: tags.operator,
          opening_hours: tags.opening_hours,
          wheelchair: tags.wheelchair === 'yes',
          tags: tags,
        }
      })
  } catch (error) {
    console.error('Error fetching POIs:', error)
    // Return fallback POIs if API fails
    return getFallbackPOIs()
  }
}

/**
 * Determine POI type from OSM tags
 */
function determinePOIType(tags) {
  if (!tags) return 'other'
  
  if (tags.amenity === 'fuel') return 'fuel'
  if (tags.amenity === 'charging_station') return 'charging'
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'fast_food' || tags.amenity === 'food_court' || tags.amenity === 'ice_cream') return 'food'
  if (tags.amenity === 'toilets') return 'restroom'
  if (tags.amenity === 'parking') return 'parking'
  if (tags.highway === 'speed_camera') return 'speed_camera'
  if (tags.barrier === 'toll_booth' || tags.amenity === 'toll_booth') return 'toll'
  if (tags.highway === 'traffic_signals') return 'traffic_signals'
  if (tags.tourism === 'attraction' || tags.tourism === 'museum' || tags.tourism === 'artwork' || tags.tourism === 'gallery') return 'tourism'
  if (tags.tourism === 'viewpoint') return 'viewpoint'
  if (tags.highway === 'rest_area' || tags.highway === 'services') return 'rest_area'
  if (tags.amenity === 'hospital') return 'hospital'
  if (tags.amenity === 'clinic' || tags.amenity === 'pharmacy' || tags.amenity === 'police') return 'emergency'
  if (tags.leisure === 'park' || tags.natural === 'tree') return 'park'
  return 'other'
}

/**
 * Get default name based on type
 */
function getDefaultName(type) {
  const defaults = {
    fuel: 'Fuel Station',
    charging: 'EV Charging Station',
    food: 'Restaurant',
    restroom: 'Restroom',
    parking: 'Parking',
    speed_camera: 'Speed Camera',
    toll: 'Toll Booth',
    traffic_signals: 'Traffic Signal',
    tourism: 'Tourist Attraction',
    viewpoint: 'Scenic Viewpoint',
    rest_area: 'Rest Area',
    hospital: 'Hospital',
    emergency: 'Emergency Service',
    park: 'Park',
    other: 'Point of Interest',
  }
  return defaults[type] || 'POI'
}

/**
 * Get fallback POIs if API fails (Mumbai sample data)
 */
function getFallbackPOIs() {
  return [
    {
      id: 'fallback-1',
      lat: 19.0760,
      lng: 72.8777,
      name: 'Sample Fuel Station',
      type: 'fuel',
      amenity: 'fuel',
    },
    {
      id: 'fallback-2',
      lat: 19.0896,
      lng: 72.8656,
      name: 'Sample Restaurant',
      type: 'food',
      amenity: 'restaurant',
    },
    {
      id: 'fallback-3',
      lat: 19.0551,
      lng: 72.8970,
      name: 'Sample Charging Station',
      type: 'charging',
      amenity: 'charging_station',
    },
  ]
}

/**
 * Calculate distance between two points in km
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate bounds from array of coordinates
 */
export function calculateRouteBounds(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return null
  }

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  coordinates.forEach(coord => {
    const lat = coord.lat
    const lng = coord.lng
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  })

  return {
    south: minLat,
    north: maxLat,
    west: minLng,
    east: maxLng,
  }
}

/**
 * Find nearest POI to a location
 */
export function findNearestPOI(lat, lng, pois) {
  if (!pois || pois.length === 0) return null
  
  let nearest = null
  let minDistance = Infinity
  
  for (const poi of pois) {
    const distance = calculateDistance(lat, lng, poi.lat, poi.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearest = { ...poi, distance }
    }
  }
  
  return nearest
}

/**
 * Filter POIs along a route path
 * @param {Array} routePath - Array of {lat, lng} coordinates
 * @param {Array} pois - Array of POI objects
 * @param {number} maxDistanceKm - Maximum distance from route (default 2km)
 */
export function filterPOIsAlongRoute(routePath, pois, maxDistanceKm = 2) {
  return pois.filter(poi => {
    // Check if POI is within maxDistanceKm of any point on route
    return routePath.some(point => {
      const distance = calculateDistance(point.lat, point.lng, poi.lat, poi.lng)
      return distance <= maxDistanceKm
    })
  })
}

/**
 * Divide long route into segments for better POI coverage
 * This ensures POIs are fetched along the ENTIRE route, not just start/end
 * @param {Array} routeCoordinates - Array of [lng, lat] from route geometry
 * @param {number} _segmentSizeKm - Size of each segment in km (default 50km)
 * @returns {Array} Array of bounds objects for each segment
 */
export function divideRouteIntoSegments(routeCoordinates) {
  if (!routeCoordinates || routeCoordinates.length === 0) return []
  
  const segments = []
  // Limit to max 10 segments to avoid rate limiting
  const maxSegments = 10
  const pointsPerSegment = Math.ceil(routeCoordinates.length / maxSegments)
  
  for (let i = 0; i < routeCoordinates.length; i += pointsPerSegment) {
    const segmentCoords = routeCoordinates.slice(i, i + pointsPerSegment)
    
    if (segmentCoords.length === 0) continue
    
    // Calculate bounds for this segment
    let minLat = Infinity, maxLat = -Infinity
    let minLng = Infinity, maxLng = -Infinity
    
    segmentCoords.forEach(coord => {
      const lat = coord[1] // [lng, lat] format
      const lng = coord[0]
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
    })
    
    // Add padding to ensure POIs near route are included
    const latPadding = 0.05 // ~5km padding
    const lngPadding = 0.05
    
    segments.push({
      south: minLat - latPadding,
      north: maxLat + latPadding,
      west: minLng - lngPadding,
      east: maxLng + lngPadding,
      segmentIndex: segments.length,
    })
  }
  
  return segments
}

/**
 * Fetch POIs for long routes by dividing into segments
 * This prevents midway gaps in POI coverage
 * @param {Array} routeCoordinates - Route geometry coordinates
 * @param {Array} poiTypes - Types of POIs to fetch
 * @param {number} maxPOIsPerSegment - Limit POIs per segment (default 50)
 * @returns {Promise<Array>} Combined array of POIs from all segments
 */
export async function fetchPOIsForLongRoute(routeCoordinates, poiTypes) {
  try {
    const segments = divideRouteIntoSegments(routeCoordinates)
    
    if (segments.length === 0) return []
    
    console.log(`🗺️ Fetching POIs for ${segments.length} route segments (max 10 to avoid rate limits)...`)
    
    // Fetch POIs for each segment with delay to avoid rate limiting
    const allPOIs = []
    const uniquePOIIds = new Set()
    
    for (let i = 0; i < segments.length; i++) {
      try {
        // Add longer delay between requests to avoid rate limiting (1.5s)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        
        const segmentPOIs = await fetchPOIs(segments[i], poiTypes)
        
        // Remove duplicates and limit per segment (max 15 POIs per segment)
        const segmentLimit = 15
        let addedCount = 0
        segmentPOIs.forEach(poi => {
          if (!uniquePOIIds.has(poi.id) && addedCount < segmentLimit) {
            uniquePOIIds.add(poi.id)
            allPOIs.push(poi)
            addedCount++
          }
        })
        
        console.log(`  ✓ Segment ${i + 1}/${segments.length}: Added ${addedCount}/${segmentPOIs.length} POIs (total: ${allPOIs.length})`)
      } catch (err) {
        console.warn(`  ⚠️ Segment ${i + 1} failed:`, err.message)
        
        // If rate limited, stop fetching more segments
        if (err.message.includes('Too Many Requests') || err.message.includes('429')) {
          console.warn(`🛑 Rate limited at segment ${i + 1}. Stopping further requests. Using ${allPOIs.length} POIs.`)
          break
        }
        continue
      }
    }
    
    console.log(`✅ Total POIs loaded: ${allPOIs.length} from ${segments.length} segments`)
    return allPOIs
  } catch (error) {
    console.error('Error fetching POIs for long route:', error)
    return []
  }
}
