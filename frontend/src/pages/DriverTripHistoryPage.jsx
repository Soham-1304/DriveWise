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
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-700' }
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Poor', color: 'bg-red-100 text-red-700' }
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
          onClick={() => navigate('/admin/drivers')}
          className="mx-auto block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {driver?.name || driver?.email || 'Driver'}'s Trip History
          </h1>
          <p className="text-gray-600 mt-1">{driver?.email}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Car className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalTrips}</div>
          <div className="text-sm text-gray-600">Total Trips</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeTrips}</div>
          <div className="text-sm text-gray-600">Active Trips</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Navigation className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {trips.reduce((sum, t) => sum + (t.distanceKm || 0), 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Total Distance (km)</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {trips.length > 0 
              ? (trips.reduce((sum, t) => sum + (t.efficiencyScore || 0), 0) / trips.length).toFixed(0)
              : 0}
          </div>
          <div className="text-sm text-gray-600">Avg Efficiency</div>
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No trips found</p>
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
              <div key={trip._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Trip Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{trip.name || 'Untitled Trip'}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(trip.startTime).toLocaleDateString()} at {new Date(trip.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Trip Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <Navigation className="w-3 h-3" />
                          Distance
                        </div>
                        <p className="font-bold text-gray-900">{trip.distanceKm?.toFixed(1) || '0.0'} km</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <Clock className="w-3 h-3" />
                          Duration
                        </div>
                        <p className="font-bold text-gray-900">
                          {trip.durationSec 
                            ? `${Math.floor(trip.durationSec / 60)}m ${trip.durationSec % 60}s`
                            : '0m'
                          }
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <Fuel className="w-3 h-3" />
                          Fuel Saved
                        </div>
                        <p className="font-bold text-green-600">{trip.fuelSaved?.toFixed(2) || '0.00'} L</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
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
