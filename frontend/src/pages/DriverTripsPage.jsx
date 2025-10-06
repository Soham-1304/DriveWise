import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from '../lib/axios'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Fuel,
  TrendingUp,
  Navigation,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function DriverTripsPage() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [expandedTrip, setExpandedTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, excellent, good, poor

  useEffect(() => {
    fetchTrips()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTrips = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      const response = await axios.get('/api/trips?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('🚗 Trip history response:', response.data)
      
      // Also fetch debug info
      try {
        const debugResponse = await axios.get('/api/trips/debug/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        console.log('🔍 DEBUG INFO:', debugResponse.data)
        console.log('   Current User ID:', debugResponse.data.currentUser)
        console.log('   Total Trips in DB:', debugResponse.data.totalTrips)
        if (debugResponse.data.totalTrips > 0) {
          console.log('   Sample trip userIds:', debugResponse.data.trips.map(t => t.userId))
        }
      } catch (debugErr) {
        console.log('Debug endpoint failed (this is okay):', debugErr.message)
      }
      
      setTrips(response.data.trips || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching trips:', err)
      console.error('Error response:', err.response?.data)
      setError('Failed to load trip history')
      setLoading(false)
    }
  }

  const getEfficiencyColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getEfficiencyBadge = (score) => {
    if (score >= 80) return { text: '🌟 Excellent', color: 'bg-green-500' }
    if (score >= 60) return { text: '👍 Good', color: 'bg-yellow-500' }
    return { text: '⚠️ Poor', color: 'bg-red-500' }
  }

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true
    if (filter === 'excellent') return trip.efficiencyScore >= 80
    if (filter === 'good') return trip.efficiencyScore >= 60 && trip.efficiencyScore < 80
    if (filter === 'poor') return trip.efficiencyScore < 60
    return true
  })

  const stats = {
    totalTrips: trips.length,
    totalDistance: trips.reduce((sum, t) => sum + (t.distanceKm || 0), 0),
    totalFuelSaved: trips.reduce((sum, t) => sum + (t.fuelSaved || 0), 0),
    avgEfficiency: trips.length > 0 
      ? trips.reduce((sum, t) => sum + (t.efficiencyScore || 0), 0) / trips.length 
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <p className="text-center text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchTrips}
            className="mx-auto block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Trip History</h2>
        <p className="text-gray-600">View your completed trips and fuel efficiency analytics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Distance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDistance.toFixed(0)} km</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Fuel className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fuel Saved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFuelSaved.toFixed(1)} L</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgEfficiency)}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({trips.length})
            </button>
            <button
              onClick={() => setFilter('excellent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'excellent' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌟 Excellent ({trips.filter(t => t.efficiencyScore >= 80).length})
            </button>
            <button
              onClick={() => setFilter('good')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'good' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👍 Good ({trips.filter(t => t.efficiencyScore >= 60 && t.efficiencyScore < 80).length})
            </button>
            <button
              onClick={() => setFilter('poor')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'poor' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚠️ Poor ({trips.filter(t => t.efficiencyScore < 60).length})
            </button>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No trips found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTrips.map((trip) => {
              const badge = getEfficiencyBadge(trip.efficiencyScore)
              const isExpanded = expandedTrip === trip._id

              return (
                <div key={trip._id} className="p-6">
                  {/* Trip Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${badge.color}`} />
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {new Date(trip.startTime).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(trip.startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-lg border ${getEfficiencyColor(trip.efficiencyScore)}`}>
                        <span className="text-sm font-bold">{badge.text}</span>
                        <span className="ml-2 text-lg font-bold">{trip.efficiencyScore}/100</span>
                      </div>
                      <button
                        onClick={() => setExpandedTrip(isExpanded ? null : trip._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Trip Summary */}
                  <div className="grid md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Distance</p>
                      <p className="text-lg font-bold text-gray-900">{trip.distanceKm?.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="text-lg font-bold text-gray-900">{Math.floor((trip.durationSec || 0) / 60)} min</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fuel Used</p>
                      <p className="text-lg font-bold text-orange-600">
                        {trip.estimatedUsed?.toFixed(2)} {trip.fuelType === 'EV' ? 'kWh' : 'L'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fuel Saved</p>
                      <p className="text-lg font-bold text-green-600">
                        {trip.fuelSaved?.toFixed(2)} {trip.fuelType === 'EV' ? 'kWh' : 'L'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Avg Speed</p>
                      <p className="text-lg font-bold text-gray-900">{trip.avgSpeed?.toFixed(0)} km/h</p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Route Adherence */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Route Performance</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Planned Distance</p>
                            <p className="text-sm font-bold text-gray-900">{trip.plannedDistanceKm?.toFixed(1)} km</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Extra Distance</p>
                            <p className={`text-sm font-bold ${trip.extraDistanceKm > 1 ? 'text-red-600' : 'text-green-600'}`}>
                              {trip.extraDistanceKm?.toFixed(2)} km
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Route Adherence</p>
                            <p className="text-sm font-bold text-gray-900">{trip.routeAdherence?.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Driving Behavior */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Driving Behavior</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Speed Score</span>
                              <span className="font-bold text-gray-900">{trip.drivingBehavior?.speedScore}/100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all" 
                                style={{ width: `${trip.drivingBehavior?.speedScore || 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Smoothness</span>
                              <span className="font-bold text-gray-900">{trip.drivingBehavior?.smoothnessScore}/100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all" 
                                style={{ width: `${trip.drivingBehavior?.smoothnessScore || 0}%` }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Optimal Speed (40-60 km/h)</p>
                              <p className="text-sm font-bold text-green-600">
                                {trip.drivingBehavior?.optimalSpeedPercentage?.toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">High Speed (&gt;80 km/h)</p>
                              <p className="text-sm font-bold text-red-600">
                                {trip.drivingBehavior?.highSpeedPercentage?.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
