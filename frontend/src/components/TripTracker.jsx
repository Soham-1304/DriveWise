import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { AnimatePresence } from 'framer-motion'
import { Navigation, TrendingUp, Clock, MapPin, X } from 'lucide-react'

/**
 * Custom Car Marker Icon with rotation
 */
function createCarIcon(color, rotation = 0) {
  const iconHtml = `
    <div style="
      transform: rotate(${rotation}deg);
      transition: transform 0.3s ease-out;
    ">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <!-- Car body -->
        <path d="M8 18L10 12H30L32 18V28H28V26H12V28H8V18Z" fill="${color}" stroke="white" stroke-width="2"/>
        <!-- Windshield -->
        <path d="M12 18L14 14H26L28 18H12Z" fill="rgba(255,255,255,0.3)"/>
        <!-- Wheels -->
        <circle cx="13" cy="26" r="2.5" fill="#333" stroke="white" stroke-width="1"/>
        <circle cx="27" cy="26" r="2.5" fill="#333" stroke="white" stroke-width="1"/>
        <!-- Headlights -->
        <circle cx="11" cy="14" r="1.5" fill="#FFD700" opacity="0.8"/>
        <circle cx="29" cy="14" r="1.5" fill="#FFD700" opacity="0.8"/>
      </svg>
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-car-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

/**
 * Map component to center on current position
 */
function MapController({ center, zoom }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true, duration: 0.5 })
    }
  }, [center, zoom, map])
  
  return null
}

/**
 * Calculate bearing between two points
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)
  const bearing = ((θ * 180) / Math.PI + 360) % 360

  return bearing
}

/**
 * Calculate distance between two points (Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
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
 * TripTracker Component - Live GPS tracking with car icon
 */
export default function TripTracker({ route, onClose }) {
  const [currentPosition, setCurrentPosition] = useState(null)
  const [previousPosition, setPreviousPosition] = useState(null)
  const [bearing, setBearing] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [distanceTraveled, setDistanceTraveled] = useState(0)
  const [distanceRemaining, setDistanceRemaining] = useState(0)
  const [eta, setEta] = useState(null)
  const watchIdRef = useRef(null)
  const totalDistanceRef = useRef(0)

  // Get route geometry coordinates
  const routeCoords = route?.data?.geometry?.coordinates || []
  const routePath = routeCoords.map(coord => [coord[1], coord[0]]) // Convert [lng, lat] to [lat, lng]
  const destination = routePath.length > 0 ? routePath[routePath.length - 1] : null

  // Start GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setCurrentPosition(newPos)

        // Calculate bearing if we have previous position
        if (previousPosition) {
          const newBearing = calculateBearing(
            previousPosition.lat,
            previousPosition.lng,
            newPos.lat,
            newPos.lng
          )
          setBearing(newBearing)

          // Calculate distance traveled
          const distance = calculateDistance(
            previousPosition.lat,
            previousPosition.lng,
            newPos.lat,
            newPos.lng
          )
          setDistanceTraveled(prev => prev + distance)
          totalDistanceRef.current += distance
        }

        // Calculate speed (km/h)
        if (position.coords.speed !== null) {
          setSpeed((position.coords.speed * 3.6).toFixed(1)) // m/s to km/h
        }

        // Calculate distance remaining to destination
        if (destination) {
          const remaining = calculateDistance(
            newPos.lat,
            newPos.lng,
            destination[0],
            destination[1]
          )
          setDistanceRemaining(remaining)

          // Calculate ETA
          if (position.coords.speed && position.coords.speed > 0) {
            const timeSeconds = (remaining * 1000) / position.coords.speed
            const etaTime = new Date(Date.now() + timeSeconds * 1000)
            setEta(etaTime)
          }
        }

        setPreviousPosition(newPos)
      },
      (error) => {
        console.error('GPS error:', error)
        alert('Failed to get GPS location. Please enable location access.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    )

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [previousPosition, destination])

  const mapCenter = currentPosition || (routePath.length > 0 ? routePath[0] : [19.0760, 72.8777])
  const carColor = route?.color || '#3b82f6'

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      >
        <div
          className="bg-white w-full h-full md:max-w-6xl md:h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="w-8 h-8 animate-pulse" />
              <div>
                <h2 className="text-2xl font-bold">{route?.name || 'Trip Tracking'}</h2>
                <p className="text-sm text-blue-100">Live GPS Navigation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <div className="text-2xl font-bold text-gray-900">{speed}</div>
              <div className="text-xs text-gray-500">km/h</div>
            </div>
            <div className="text-center">
              <MapPin className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <div className="text-2xl font-bold text-gray-900">{distanceTraveled.toFixed(1)}</div>
              <div className="text-xs text-gray-500">km traveled</div>
            </div>
            <div className="text-center">
              <Navigation className="w-5 h-5 mx-auto text-purple-600 mb-1" />
              <div className="text-2xl font-bold text-gray-900">{distanceRemaining.toFixed(1)}</div>
              <div className="text-xs text-gray-500">km remaining</div>
            </div>
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto text-orange-600 mb-1" />
              <div className="text-2xl font-bold text-gray-900">
                {eta ? eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
              <div className="text-xs text-gray-500">ETA</div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            {currentPosition ? (
              <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                
                <MapController center={mapCenter} zoom={15} />

                {/* Route Polyline */}
                {routePath.length > 0 && (
                  <Polyline
                    positions={routePath}
                    color={carColor}
                    weight={6}
                    opacity={0.7}
                  />
                )}

                {/* Car Marker */}
                <Marker
                  position={[currentPosition.lat, currentPosition.lng]}
                  icon={createCarIcon(carColor, bearing)}
                />

                {/* Destination Marker */}
                {destination && (
                  <Marker position={destination} />
                )}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Navigation className="w-16 h-16 mx-auto text-blue-600 animate-pulse mb-4" />
                  <p className="text-xl font-semibold text-gray-700">Getting your location...</p>
                  <p className="text-sm text-gray-500 mt-2">Please enable GPS</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition shadow-lg"
            >
              End Trip
            </button>
            <button
              onClick={() => {
                if (currentPosition && mapCenter) {
                  // Recenter map
                  setCurrentPosition({ ...currentPosition })
                }
              }}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
            >
              <Navigation className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
