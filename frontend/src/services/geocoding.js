/**
 * Geocoding Service
 * Supports both Mapbox Geocoding API and OpenStreetMap Nominatim
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const NOMINATIM_URL = import.meta.env.VITE_NOMINATIM_URL || 'https://nominatim.openstreetmap.org'

/**
 * Search locations using Mapbox Geocoding API (if token available)
 * Falls back to Nominatim if no token
 */
export async function searchLocations(query, options = {}) {
  const {
    limit = 5,
    types = ['place', 'address', 'poi'],
    proximity = null, // { lng, lat }
    bbox = null, // [minLng, minLat, maxLng, maxLat]
  } = options

  // Try Mapbox first if token is available
  if (MAPBOX_TOKEN && MAPBOX_TOKEN !== 'your_mapbox_token_here') {
    try {
      return await searchMapbox(query, { limit, types, proximity, bbox })
    } catch (error) {
      console.warn('Mapbox geocoding failed, falling back to Nominatim:', error)
    }
  }

  // Fallback to Nominatim
  return await searchNominatim(query, { limit, bbox })
}

/**
 * Mapbox Geocoding API
 */
async function searchMapbox(query, options) {
  const { limit, types, proximity, bbox } = options
  
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    limit: limit.toString(),
    types: types.join(','),
  })
  
  if (proximity) {
    params.append('proximity', `${proximity.lng},${proximity.lat}`)
  }
  
  if (bbox) {
    params.append('bbox', bbox.join(','))
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  return data.features.map(feature => ({
    id: feature.id,
    name: feature.place_name,
    lat: feature.center[1],
    lng: feature.center[0],
    type: feature.place_type[0],
    context: feature.context || [],
    bbox: feature.bbox,
  }))
}

/**
 * OpenStreetMap Nominatim API
 */
async function searchNominatim(query, options) {
  const { limit, bbox } = options
  
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: limit.toString(),
    addressdetails: '1',
  })
  
  if (bbox) {
    params.append('viewbox', bbox.join(','))
    params.append('bounded', '1')
  }

  const url = `${NOMINATIM_URL}/search?${params}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FuelOptimizer/2.0',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  return data.map(item => ({
    id: item.place_id,
    name: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    type: item.type,
    address: item.address,
    bbox: item.boundingbox ? [
      parseFloat(item.boundingbox[2]), // minLng
      parseFloat(item.boundingbox[0]), // minLat
      parseFloat(item.boundingbox[3]), // maxLng
      parseFloat(item.boundingbox[1]), // maxLat
    ] : null,
  }))
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat, lng) {
  // Try Mapbox first
  if (MAPBOX_TOKEN && MAPBOX_TOKEN !== 'your_mapbox_token_here') {
    try {
      return await reverseGeocodeMapbox(lat, lng)
    } catch (error) {
      console.warn('Mapbox reverse geocoding failed:', error)
    }
  }

  // Fallback to Nominatim
  return await reverseGeocodeNominatim(lat, lng)
}

/**
 * Mapbox Reverse Geocoding
 */
async function reverseGeocodeMapbox(lat, lng) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (data.features.length === 0) {
    return null
  }

  const feature = data.features[0]
  
  return {
    id: feature.id,
    name: feature.place_name,
    lat,
    lng,
    type: feature.place_type[0],
  }
}

/**
 * Nominatim Reverse Geocoding
 */
async function reverseGeocodeNominatim(lat, lng) {
  const url = `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FuelOptimizer/2.0',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  return {
    id: data.place_id,
    name: data.display_name,
    lat,
    lng,
    type: data.type,
    address: data.address,
  }
}

/**
 * Get autocomplete suggestions (debounced search)
 */
export function createAutocompleteSearch(callback, debounceMs = 300) {
  let timeoutId = null
  
  return function search(query, options) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    if (query.length < 2) {
      callback([])
      return
    }
    
    timeoutId = setTimeout(async () => {
      try {
        const results = await searchLocations(query, options)
        callback(results)
      } catch (error) {
        console.error('Autocomplete error:', error)
        callback([])
      }
    }, debounceMs)
  }
}
