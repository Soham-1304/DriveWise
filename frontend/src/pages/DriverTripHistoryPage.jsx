import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../lib/axios'
import { 
  ArrowLeft, 
  Car, 
  Calendar,
  Navigation,
  Fuel,
  TrendingUp,
  Clock,
  MapPin,
  Award,
  AlertCircle
} from 'lucide-react'

export default function DriverTripHistoryPage() {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [driver, setDriver] = useState(null)
  const [trips, setTrips] = useState([])
  const [stats, setStats] = useState({ totalTrips: 0, activeTrips: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    fetchDriverTrips()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId])

  const fetchDriverTrips = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      
      // Fetch driver profile
      const driverRes = await axios.get(`/api/auth/drivers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const drivers = Array.isArray(driverRes.data) ? driverRes.data : []
      const driverData = drivers.find(d => d.userId === driverId)
      setDriver(driverData || null)
      
      // Fetch trips for this driver
      const tripsRes = await axios.get(`/api/trips/driver/${driverId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      setTrips(tripsRes.data.trips || [])
      setStats({
        totalTrips: tripsRes.data.totalTrips || 0,
        activeTrips: tripsRes.data.activeTrips || 0
      })
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching driver trips:', err)
      setError('Failed to load driver trip history')
      setLoading(false)
    }
  }

  const getEfficiencyBadge = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500/20 border border-green-500/30 text-green-400' }
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' }
    return { label: 'Poor', color: 'bg-red-500/20 border border-red-500/30 text-red-400' }
  }

  const filteredTrips = trips.filter(trip => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'excellent') return trip.efficiencyScore >= 80
    if (selectedFilter === 'good') return trip.efficiencyScore >= 60 && trip.efficiencyScore < 80
    if (selectedFilter === 'poor') return trip.efficiencyScore < 60
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-xl rounded-lg p-6 max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-center text-red-300 mb-4">{error}</p>
        <button
          onClick={() => navigate('/admin/drivers')}
          className="mx-auto block px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30"
        >
          Back to Drivers
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/drivers')}
          className="p-2 hover:bg-dark-700/30 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            {driver?.name || driver?.email || 'Driver'}'s Trip History
          </h1>
          <p className="text-gray-400 mt-1">{driver?.email}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
          <div className="flex items-center justify-between mb-2">
            <Car className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalTrips}</div>
          <div className="text-sm text-gray-400">Total Trips</div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.activeTrips}</div>
          <div className="text-sm text-gray-400">Active Trips</div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
          <div className="flex items-center justify-between mb-2">
            <Navigation className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {trips.reduce((sum, t) => sum + (t.distanceKm || 0), 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Total Distance (km)</div>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {trips.length > 0 
              ? (trips.reduce((sum, t) => sum + (t.efficiencyScore || 0), 0) / trips.length).toFixed(0)
              : 0}
          </div>
          <div className="text-sm text-gray-400">Avg Efficiency</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'excellent', 'good', 'poor'].map(filter => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedFilter === filter
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                : 'bg-dark-700/50 text-gray-300 hover:bg-dark-700 border border-dark-600/50'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter !== 'all' && (
              <span className="ml-2 text-xs">
                ({trips.filter(t => {
                  if (filter === 'excellent') return t.efficiencyScore >= 80
                  if (filter === 'good') return t.efficiencyScore >= 60 && t.efficiencyScore < 80
                  if (filter === 'poor') return t.efficiencyScore < 60
                  return false
                }).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-12 text-center">
            <Car className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300 mb-2">No trips found</p>
            <p className="text-sm text-gray-500">
              {selectedFilter !== 'all' 
                ? 'Try selecting a different filter'
                : 'This driver hasn\'t completed any trips yet'
              }
            </p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const badge = getEfficiencyBadge(trip.efficiencyScore)
            return (
              <div key={trip._id} className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 hover:border-orange-500/30 p-6 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Trip Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{trip.name || 'Untitled Trip'}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(trip.startTime).toLocaleDateString()} at {new Date(trip.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Trip Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Navigation className="w-3 h-3" />
                          Distance
                        </div>
                        <p className="font-bold text-white">{trip.distanceKm?.toFixed(1) || '0.0'} km</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Clock className="w-3 h-3" />
                          Duration
                        </div>
                        <p className="font-bold text-white">
                          {trip.durationSec 
                            ? `${Math.floor(trip.durationSec / 60)}m ${trip.durationSec % 60}s`
                            : '0m'
                          }
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Fuel className="w-3 h-3" />
                          Fuel Saved
                        </div>
                        <p className="font-bold text-green-400">{trip.fuelSaved?.toFixed(2) || '0.00'} L</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Award className="w-3 h-3" />
                          Efficiency
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                          {trip.efficiencyScore || 0}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Badge */}
                  <div className={`px-6 py-3 rounded-lg ${badge.color} font-bold text-center`}>
                    {badge.label}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
