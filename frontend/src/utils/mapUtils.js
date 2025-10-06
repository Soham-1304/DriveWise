/**
 * Map Utilities
 * Helper functions for route animations, bearing calculations, and map operations
 */

/**
 * Calculate bearing between two points
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon)
  
  const brng = (Math.atan2(y, x) * 180) / Math.PI
  return (brng + 360) % 360
}

/**
 * Interpolate between two points
 * @param {number} fraction - Value between 0 and 1
 */
export function interpolatePosition(lat1, lng1, lat2, lng2, fraction) {
  const lat = lat1 + (lat2 - lat1) * fraction
  const lng = lng1 + (lng2 - lng1) * fraction
  return { lat, lng }
}

/**
 * Decode polyline string to coordinates
 * @param {string} encoded - Encoded polyline string
 * @returns {Array} Array of [lat, lng] pairs
 */
export function decodePolyline(encoded) {
  if (!encoded) return []
  
  const poly = []
  let index = 0
  const len = encoded.length
  let lat = 0
  let lng = 0

  while (index < len) {
    let b
    let shift = 0
    let result = 0
    
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    
    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    
    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    poly.push([lat / 1e5, lng / 1e5])
  }

  return poly
}

/**
 * Convert route geometry to Leaflet format
 */
export function formatRouteGeometry(geometry) {
  if (!geometry) return []
  
  // Handle GeoJSON LineString
  if (geometry.type === 'LineString' && geometry.coordinates) {
    return geometry.coordinates.map(coord => [coord[1], coord[0]]) // Swap to [lat, lng]
  }
  
  // Handle encoded polyline
  if (typeof geometry === 'string') {
    return decodePolyline(geometry)
  }
  
  // Handle array of coordinates
  if (Array.isArray(geometry)) {
    return geometry.map(coord => {
      if (Array.isArray(coord)) {
        return coord.length === 2 ? [coord[1], coord[0]] : coord
      }
      return [coord.lat, coord.lng]
    })
  }
  
  return []
}

/**
 * Calculate route bounds
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
    const [lat, lng] = Array.isArray(coord) ? coord : [coord.lat, coord.lng]
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
 * Animate marker along route
 * @param {Array} routeCoordinates - Array of [lat, lng] pairs
 * @param {Function} onUpdate - Callback with current position and bearing
 * @param {number} durationMs - Total animation duration in ms
 * @returns {Function} Stop function
 */
export function animateAlongRoute(routeCoordinates, onUpdate, durationMs = 10000) {
  if (!routeCoordinates || routeCoordinates.length < 2) {
    return () => {}
  }

  let startTime = null
  let animationId = null
  let stopped = false

  function animate(timestamp) {
    if (stopped) return

    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const fraction = Math.min(elapsed / durationMs, 1)

    // Find current segment
    const totalSegments = routeCoordinates.length - 1
    const currentSegmentIndex = Math.floor(fraction * totalSegments)
    const segmentFraction = (fraction * totalSegments) % 1

    if (currentSegmentIndex >= totalSegments) {
      // Animation complete
      const lastIdx = routeCoordinates.length - 1
      onUpdate({
        lat: routeCoordinates[lastIdx][0],
        lng: routeCoordinates[lastIdx][1],
        bearing: 0,
        progress: 1,
      })
      return
    }

    const [lat1, lng1] = routeCoordinates[currentSegmentIndex]
    const [lat2, lng2] = routeCoordinates[currentSegmentIndex + 1]

    const position = interpolatePosition(lat1, lng1, lat2, lng2, segmentFraction)
    const bearing = calculateBearing(lat1, lng1, lat2, lng2)

    onUpdate({
      ...position,
      bearing,
      progress: fraction,
    })

    if (fraction < 1) {
      animationId = requestAnimationFrame(animate)
    }
  }

  animationId = requestAnimationFrame(animate)

  return () => {
    stopped = true
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}

/**
 * Calculate distance along route from start to position
 * @param {Array} routeCoordinates - Array of [lat, lng]
 * @param {Object} currentPosition - {lat, lng}
 * @returns {number} Distance in km
 */
export function calculateDistanceAlongRoute(routeCoordinates, currentPosition) {
  // Find nearest point on route
  let minDistance = Infinity
  let nearestIndex = 0

  routeCoordinates.forEach((coord, index) => {
    const [lat, lng] = coord
    const distance = calculateDistance(currentPosition.lat, currentPosition.lng, lat, lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestIndex = index
    }
  })

  // Sum distances from start to nearest point
  let totalDistance = 0
  for (let i = 0; i < nearestIndex; i++) {
    const [lat1, lng1] = routeCoordinates[i]
    const [lat2, lng2] = routeCoordinates[i + 1]
    totalDistance += calculateDistance(lat1, lng1, lat2, lng2)
  }

  return totalDistance
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  
  if (mins === 0) {
    return `${hours} hr`
  }
  
  return `${hours} hr ${mins} min`
}

/**
 * Format distance in km
 */
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  
  return `${km.toFixed(1)} km`
}
