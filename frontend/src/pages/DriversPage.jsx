import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../utils/api'
import { Users, UserPlus, Copy, Check, Car, MapPin, TrendingUp } from 'lucide-react'

export default function DriversPage() {
  const { user, fleetCode } = useAuth()
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      if (!user) return

      // Fetch drivers with enriched statistics
      const driversRes = await apiGet('/auth/drivers')
      const driversList = Array.isArray(driversRes) ? driversRes : []
      setDrivers(driversList)

      // Fetch vehicles to show all fleet vehicles
      const vehiclesRes = await apiGet('/fleet/')
      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : [])

      // Driver stats are now embedded in the driver objects
      // No need for separate stats fetching

      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setLoading(false)
    }
  }

  const copyFleetCode = () => {
    if (fleetCode) {
      navigator.clipboard.writeText(fleetCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getDriverVehicle = (driverId) => {
    return vehicles.find(v => v.assignedDriverId === driverId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-1">View and manage drivers in your fleet</p>
        </div>

        {/* Fleet Code Card */}
        {fleetCode && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-700">Add New Drivers</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Share this code with drivers to join your fleet
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-300 font-mono text-sm font-bold text-gray-900">
                {fleetCode}
              </div>
              <button
                onClick={copyFleetCode}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drivers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => {
          return (
            <div key={driver.userId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Active
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {driver.name || 'No Name'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{driver.email}</p>

              {driver.phone && (
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  📱 {driver.phone}
                </p>
              )}

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Primary Vehicle:</span>
                  </div>
                  <span className="text-gray-900 font-semibold">
                    {driver.primaryVehicle || 'Not Assigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Active Trips:</span>
                  </div>
                  <span className={driver.activeTrips > 0 ? "text-green-600 font-semibold" : "text-gray-500"}>
                    {driver.activeTrips || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Total Trips:</span>
                  </div>
                  <span className="text-gray-900 font-semibold">
                    {driver.totalTrips || 0}
                  </span>
                </div>

                {/* New Rich Metrics */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Distance Driven:</span>
                  <span className="text-gray-900 font-semibold">
                    {driver.totalDistance?.toFixed(1) || 0} km
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fuel Consumed:</span>
                  <span className="text-gray-900 font-semibold">
                    {driver.totalFuel?.toFixed(1) || 0} L
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Efficiency:</span>
                  <span className={`font-semibold ${
                    (driver.avgEfficiency || 0) >= 80 ? 'text-green-600' :
                    (driver.avgEfficiency || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {driver.avgEfficiency?.toFixed(1) || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="text-green-600 font-bold">
                    ₹{(driver.totalEarnings || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => navigate(`/admin/drivers/${driver.userId}/trips`)}
                  className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition text-sm"
                >
                  View Trip History
                </button>
              </div>
            </div>
          )
        })}

        {drivers.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No drivers in your fleet yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Share your fleet code with drivers to get started
            </p>
            {fleetCode && (
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-300">
                <span className="font-mono font-bold text-gray-900">{fleetCode}</span>
                <button
                  onClick={copyFleetCode}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      {drivers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Fleet Overview</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{drivers.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {drivers.filter(d => getDriverVehicle(d.userId)).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Assigned Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600 mt-1">Active Trips</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600 mt-1">Completed Trips</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
