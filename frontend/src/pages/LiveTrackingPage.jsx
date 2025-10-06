import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from '../lib/axios'
import { MapContainer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import PremiumTileLayer from '../components/PremiumTileLayer'
import { 
  Car, 
  Navigation, 
  Clock,
  Fuel,
  AlertCircle,
  TrendingUp,
  MapPin,
  Play,
  Square
} from 'lucide-react'

// Custom car icon for current position
const activeCarIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34], 
  shadowSize: [41, 41]
})

// Start position marker (green)
const startIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34], 
  shadowSize: [41, 41]
})

// End position marker (red)
const endIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34], 
  shadowSize: [41, 41]
})

// Map bounds updater
function MapBoundsUpdater({ selectedTrip }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedTrip?.routePath && selectedTrip.routePath.length > 0) {
      const bounds = L.latLngBounds(selectedTrip.routePath)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [selectedTrip, map])
  
  return null
}

export default function LiveTrackingPage() {
  const { user } = useAuth()
  const [activeTrips, setActiveTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchActiveTrips()
    // Refresh every 10 seconds
    const interval = setInterval(fetchActiveTrips, 10000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchActiveTrips = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      
      // Fetch all running trips
      const response = await axios.get('/api/trips/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      setActiveTrips(response.data.trips || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching active trips:', err)
      setError('Failed to load active trips')
      setLoading(false)
    }
  }

  const getTripDuration = (startTime) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now - start
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <p className="text-center text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchActiveTrips}
          className="mx-auto block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  // Calculate center point for map
  const mapCenter = activeTrips.length > 0 && activeTrips[0].lastPosition
    ? [activeTrips[0].lastPosition.lat, activeTrips[0].lastPosition.lng]
    : [20.5937, 78.9629] // Default India center

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚗 Live Fleet Tracking</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring of all active trips</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {activeTrips.length} Active {activeTrips.length === 1 ? 'Trip' : 'Trips'}
            </div>
          </div>
          <button 
            onClick={fetchActiveTrips}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Trips List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Active Trips</h3>
          
          {activeTrips.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No active trips</p>
              <p className="text-sm text-gray-500">All vehicles are idle</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {activeTrips.map((trip) => (
                <div
                  key={trip._id}
                  onClick={() => setSelectedTrip(trip._id === selectedTrip?._id ? null : trip)}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition hover:shadow-lg ${
                    selectedTrip?._id === trip._id 
                      ? 'border-blue-500 shadow-lg' 
                      : 'border-gray-200'
                  }`}
                >
                  {/* Trip Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{trip.vehicleName || 'Vehicle'}</p>
                        <p className="text-xs text-gray-500">{trip.driverName || 'Unknown Driver'}</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>

                  {/* Trip Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Duration</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{getTripDuration(trip.startTime)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Navigation className="w-3 h-3" />
                        <span>Distance</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {trip.currentDistance?.toFixed(1) || '0.0'} km
                      </p>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="text-xs text-gray-600">
                    <p className="truncate">Route: {trip.routeId || 'Unknown'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Live Map</h3>
            <div className="rounded-xl overflow-hidden border-2 border-gray-300" style={{ height: '600px' }}>
              <MapContainer
                center={mapCenter}
                zoom={selectedTrip ? 13 : 5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <PremiumTileLayer showSelector={true} />
                <MapBoundsUpdater selectedTrip={selectedTrip} />

                {/* Show markers and routes for all trips or just selected */}
                {activeTrips.map((trip) => {
                  const isSelected = selectedTrip?._id === trip._id
                  const showDetails = !selectedTrip || isSelected
                  
                  if (!showDetails) return null
                  
                  return (
                    <div key={trip._id}>
                      {/* Start Marker (Green) */}
                      {trip.startPosition && (
                        <Marker
                          position={[trip.startPosition.lat, trip.startPosition.lng]}
                          icon={startIcon}
                        >
                          <Popup>
                            <div className="p-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Play className="w-4 h-4 text-green-600" />
                                <p className="font-bold text-gray-900">Trip Start</p>
                              </div>
                              <p className="text-sm text-gray-600">{trip.vehicleName}</p>
                              <p className="text-xs text-gray-500">Started: {new Date(trip.startTime).toLocaleTimeString()}</p>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {/* Current Position Marker (Blue) */}
                      {trip.lastPosition && (
                        <Marker
                          position={[trip.lastPosition.lat, trip.lastPosition.lng]}
                          icon={activeCarIcon}
                          eventHandlers={{
                            click: () => setSelectedTrip(trip)
                          }}
                        >
                          <Popup>
                            <div className="p-2">
                              <p className="font-bold text-gray-900 mb-1">{trip.vehicleName || 'Vehicle'}</p>
                              <p className="text-sm text-gray-600 mb-2">{trip.driverName || 'Unknown Driver'}</p>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Duration:</span>
                                  <span className="font-semibold">{getTripDuration(trip.startTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Distance:</span>
                                  <span className="font-semibold">{trip.currentDistance?.toFixed(1) || '0.0'} km</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Speed:</span>
                                  <span className="font-semibold">{trip.currentSpeed?.toFixed(0) || '0'} km/h</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">GPS Points:</span>
                                  <span className="font-semibold">{trip.telemetryCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {/* Route Polyline (driven path) */}
                      {trip.routePath && trip.routePath.length > 1 && (
                        <Polyline
                          positions={trip.routePath}
                          color={isSelected ? "#3b82f6" : "#10b981"}
                          weight={isSelected ? 5 : 3}
                          opacity={isSelected ? 0.8 : 0.5}
                        />
                      )}
                    </div>
                  )
                })}
              </MapContainer>
            </div>

            {/* Selected Trip Details */}
            {selectedTrip && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Trip Details: {selectedTrip.vehicleName || 'Vehicle'}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Driver</p>
                    <p className="font-semibold text-gray-900">{selectedTrip.driverName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Current Speed</p>
                    <p className="font-semibold text-gray-900">{selectedTrip.currentSpeed?.toFixed(0) || '0'} km/h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fuel Used</p>
                    <p className="font-semibold text-orange-600">
                      {selectedTrip.currentFuelUsed?.toFixed(2) || '0.00'} L
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Efficiency</p>
                    <p className={`font-semibold ${
                      (selectedTrip.currentEfficiency || 100) >= 80 ? 'text-green-600' :
                      (selectedTrip.currentEfficiency || 100) >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedTrip.currentEfficiency?.toFixed(0) || '100'}/100
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
