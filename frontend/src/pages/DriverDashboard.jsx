import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../lib/axios'
import { 
  Car, 
  MapPin, 
  Navigation, 
  Fuel,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Clock
} from 'lucide-react'

export default function DriverDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [assignedVehicle, setAssignedVehicle] = useState(null)
  const [recentTrips, setRecentTrips] = useState([])
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalDistance: 0,
    totalFuelSaved: 0,
    avgEfficiency: 0,
    totalDrivingTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDriverData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDriverData = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken()
      
      // Fetch profile
      const profileRes = await axios.get('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setProfile(profileRes.data)
      
      // Fetch assigned vehicle
      const vehiclesRes = await axios.get('/api/fleet/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []
      setAssignedVehicle(vehicles[0] || null)

      // Fetch trip history
      const tripsRes = await axios.get('/api/trips?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const trips = tripsRes.data.trips || []
      console.log('📊 Recent trips fetched:', trips.length, trips)
      setRecentTrips(trips)

      // Calculate stats from all trips
      const allTripsRes = await axios.get('/api/trips?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const allTrips = allTripsRes.data.trips || []
      console.log('📈 All trips fetched:', allTrips.length, allTrips)
      
      const calculatedStats = {
        totalTrips: allTrips.length,
        totalDistance: allTrips.reduce((sum, t) => sum + (t.distanceKm || 0), 0),
        totalFuelSaved: allTrips.reduce((sum, t) => sum + (t.fuelSaved || 0), 0),
        avgEfficiency: allTrips.length > 0 
          ? allTrips.reduce((sum, t) => sum + (t.efficiencyScore || 0), 0) / allTrips.length 
          : 0,
        totalDrivingTime: allTrips.reduce((sum, t) => sum + (t.durationSec || 0), 0)
      }
      setStats(calculatedStats)

      setLoading(false)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
      setLoading(false)
    }
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
            onClick={fetchDriverData}
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.name || user?.email?.split('@')[0]}!
        </h2>
        <p className="text-blue-100 text-lg">Ready to start your next delivery?</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Vehicle Card */}
          {assignedVehicle ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Your Assigned Vehicle</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-10 h-10 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-gray-900 truncate">
                    {assignedVehicle.make} {assignedVehicle.model}
                  </p>
                  <p className="text-lg text-gray-600 font-mono font-bold mt-1">
                    {assignedVehicle.registrationNumber}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Fuel className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{assignedVehicle.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span>{assignedVehicle.consumptionBaseline} km/L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Trip Button */}
              <button 
                onClick={() => navigate('/driver/route-planner')}
                disabled={!assignedVehicle}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Navigation className="w-6 h-6" />
                Start New Trip
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">No vehicle assigned yet</p>
              <p className="text-sm text-gray-600">Contact your fleet administrator to get a vehicle assigned</p>
            </div>
          )}

          {/* Recent Trips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Trips</h3>
              <button
                onClick={() => navigate('/driver/history')}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All →
              </button>
            </div>
            
            {recentTrips.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">No trips yet</p>
                <p className="text-sm text-gray-500">Start your first trip to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTrips.map((trip) => (
                  <div 
                    key={trip._id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate('/driver/history')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          trip.efficiencyScore >= 80 ? 'bg-green-500' :
                          trip.efficiencyScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="font-semibold text-gray-900 text-sm">
                          {new Date(trip.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-blue-600">
                        {trip.efficiencyScore}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-500">Distance:</span>
                        <p className="font-semibold text-gray-900">{trip.distanceKm?.toFixed(1)} km</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-semibold text-gray-900">{Math.floor((trip.durationSec || 0) / 60)} min</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Saved:</span>
                        <p className="font-semibold text-green-600">{trip.fuelSaved?.toFixed(2)} {trip.fuelType === 'EV' ? 'kWh' : 'L'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Quick Links */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Performance</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Avg Efficiency</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.avgEfficiency > 0 ? Math.round(stats.avgEfficiency) : '-'}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      stats.avgEfficiency >= 80 ? 'bg-green-600' :
                      stats.avgEfficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, stats.avgEfficiency)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Trips</span>
                  <span className="text-sm font-bold text-gray-900">{stats.totalTrips}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Distance</span>
                  <span className="text-sm font-bold text-gray-900">{stats.totalDistance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fuel Saved</span>
                  <span className="text-sm font-bold text-green-600">
                    {stats.totalFuelSaved.toFixed(2)} {assignedVehicle?.fuelType === 'EV' ? 'kWh' : 'L'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3 mx-auto">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 text-center">
                {Math.floor(stats.totalDrivingTime / 3600)}h
              </p>
              <p className="text-xs text-gray-600 text-center mt-1">Driving Time</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-3 mx-auto">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 text-center">
                {stats.avgEfficiency > 0 ? Math.round(stats.avgEfficiency) : '-'}
              </p>
              <p className="text-xs text-gray-600 text-center mt-1">Avg. Efficiency</p>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Contact your fleet administrator for support or vehicle assignment.
            </p>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
