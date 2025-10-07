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
      const response = await axios.get('/trips?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('🚗 Trip history response:', response.data)
      
      // Also fetch debug info
      try {
        const debugResponse = await axios.get('/trips/debug/all', {
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
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30'
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    return 'text-red-400 bg-red-500/20 border-red-500/30'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-xl rounded-lg p-6 max-w-md">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-center text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchTrips}
            className="mx-auto block px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30"
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Trip History</h2>
        <p className="text-gray-400">View your completed trips and fuel efficiency analytics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Trips</p>
              <p className="text-2xl font-bold text-white">{stats.totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Distance</p>
              <p className="text-2xl font-bold text-white">{stats.totalDistance.toFixed(0)} km</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <Fuel className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Fuel Saved</p>
              <p className="text-2xl font-bold text-white">{stats.totalFuelSaved.toFixed(1)} L</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Efficiency</p>
              <p className="text-2xl font-bold text-white">{Math.round(stats.avgEfficiency)}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-300">Filter:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-dark-700/50 text-gray-300 hover:bg-dark-700 border border-dark-600/50'
              }`}
            >
              All ({trips.length})
            </button>
            <button
              onClick={() => setFilter('excellent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'excellent' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-dark-700/50 text-gray-300 hover:bg-dark-700 border border-dark-600/50'
              }`}
            >
              🌟 Excellent ({trips.filter(t => t.efficiencyScore >= 80).length})
            </button>
            <button
              onClick={() => setFilter('good')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'good' 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30' 
                  : 'bg-dark-700/50 text-gray-300 hover:bg-dark-700 border border-dark-600/50'
              }`}
            >
              👍 Good ({trips.filter(t => t.efficiencyScore >= 60 && t.efficiencyScore < 80).length})
            </button>
            <button
              onClick={() => setFilter('poor')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'poor' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30' 
                  : 'bg-dark-700/50 text-gray-300 hover:bg-dark-700 border border-dark-600/50'
              }`}
            >
              ⚠️ Poor ({trips.filter(t => t.efficiencyScore < 60).length})
            </button>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300">No trips found</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-700/50">
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
                        <h3 className="font-bold text-white">
                          {new Date(trip.startTime).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p className="text-sm text-gray-400">
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
                        className="p-2 hover:bg-dark-700/30 rounded-lg transition"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Trip Summary */}
                  <div className="grid md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Distance</p>
                      <p className="text-lg font-bold text-white">{trip.distanceKm?.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="text-lg font-bold text-white">{Math.floor((trip.durationSec || 0) / 60)} min</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fuel Used</p>
                      <p className="text-lg font-bold text-orange-400">
                        {trip.estimatedUsed?.toFixed(2)} {trip.fuelType === 'EV' ? 'kWh' : 'L'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fuel Saved</p>
                      <p className="text-lg font-bold text-green-400">
                        {trip.fuelSaved?.toFixed(2)} {trip.fuelType === 'EV' ? 'kWh' : 'L'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Avg Speed</p>
                      <p className="text-lg font-bold text-white">{trip.avgSpeed?.toFixed(0)} km/h</p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-dark-700/50 space-y-4">
                      {/* Route Adherence */}
                      <div className="bg-dark-700/30 border border-dark-600/50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Route Performance</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Planned Distance</p>
                            <p className="text-sm font-bold text-white">{trip.plannedDistanceKm?.toFixed(1)} km</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Extra Distance</p>
                            <p className={`text-sm font-bold ${trip.extraDistanceKm > 1 ? 'text-red-400' : 'text-green-400'}`}>
                              {trip.extraDistanceKm?.toFixed(2)} km
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Route Adherence</p>
                            <p className="text-sm font-bold text-white">{trip.routeAdherence?.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Driving Behavior */}
                      <div className="bg-dark-700/30 border border-dark-600/50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Driving Behavior</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Speed Score</span>
                              <span className="font-bold text-white">{trip.drivingBehavior?.speedScore}/100</span>
                            </div>
                            <div className="w-full bg-dark-600/50 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all" 
                                style={{ width: `${trip.drivingBehavior?.speedScore || 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Smoothness</span>
                              <span className="font-bold text-white">{trip.drivingBehavior?.smoothnessScore}/100</span>
                            </div>
                            <div className="w-full bg-dark-600/50 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all" 
                                style={{ width: `${trip.drivingBehavior?.smoothnessScore || 0}%` }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-dark-600/50">
                            <div>
                              <p className="text-xs text-gray-500">Optimal Speed (40-60 km/h)</p>
                              <p className="text-sm font-bold text-green-400">
                                {trip.drivingBehavior?.optimalSpeedPercentage?.toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">High Speed (&gt;80 km/h)</p>
                              <p className="text-sm font-bold text-red-400">
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
