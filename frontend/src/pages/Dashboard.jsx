import { useState, useEffect, useCallback } from 'react'
import { auth } from '../firebase'
import axios from '../lib/axios'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [trips, setTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const token = await auth.currentUser.getIdToken()
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch vehicles
      const vehiclesRes = await axios.get('/vehicles', { headers })
      setVehicles(vehiclesRes.data.vehicles || [])

      // Fetch analytics
      const analyticsParams = new URLSearchParams({ days: days.toString() })
      if (selectedVehicle) {
        analyticsParams.append('vehicleId', selectedVehicle)
      }
      const analyticsRes = await axios.get(`/analytics/summary?${analyticsParams}`, { headers })
      setAnalytics(analyticsRes.data)

      // Fetch trips
      const tripsParams = new URLSearchParams({ limit: '10' })
      if (selectedVehicle) {
        tripsParams.append('vehicleId', selectedVehicle)
      }
      const tripsRes = await axios.get(`/trips?${tripsParams}`, { headers })
      setTrips(tripsRes.data.trips || [])

      setLoading(false)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
      setLoading(false)
      // Set empty arrays and default analytics to prevent errors
      setVehicles([])
      setTrips([])
      setAnalytics({
        totalTrips: 0,
        totalDistance: 0,
        totalFuelUsed: 0,
        avgConsumption: 0,
        avgEfficiencyScore: 0,
        costPerKm: 0,
        fuelType: 'ICE'
      })
    }
  }, [selectedVehicle, days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function viewTripDetails(tripId) {
    try {
      const token = await auth.currentUser.getIdToken()
      const response = await axios.get(`/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedTrip(response.data)
    } catch (err) {
      console.error('Error fetching trip details:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
        <button 
          onClick={fetchData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex gap-2">
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.make} {v.model}
              </option>
            ))}
          </select>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {analytics && analytics.totalTrips > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Trips</h3>
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalTrips}</p>
            <p className="text-xs text-gray-500 mt-1">{analytics?.totalDistance?.toFixed(1) || '0.0'} km total</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Avg Consumption</h3>
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics?.avgConsumption?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics?.fuelType === 'EV' ? 'kWh/100km' : 'L/100km'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Cost per km</h3>
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{analytics?.costPerKm?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">Total: ₹{((analytics?.costPerKm || 0) * (analytics?.totalDistance || 0)).toFixed(0)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Efficiency Score</h3>
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics?.avgEfficiencyScore || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-md text-center mb-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No trip data yet</h3>
          <p className="text-gray-600 mb-4">Start tracking trips to see your analytics</p>
          <a
            href="/track"
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Track a Trip
          </a>
        </div>
      )}

      {/* Recent Trips */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trips</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {trips && trips.length > 0 ? (
            trips.map((trip) => (
            <div key={trip._id} className="p-6 hover:bg-gray-50 transition cursor-pointer" onClick={() => viewTripDetails(trip._id)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trip.fuelType === 'EV' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {trip.fuelType}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(trip.startTime).toLocaleDateString()} at {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="font-semibold">{trip.distanceKm} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-semibold">{Math.round(trip.durationSec / 60)} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Speed</p>
                        <p className="font-semibold">{trip.avgSpeed} km/h</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{trip.fuelType === 'EV' ? 'Energy' : 'Fuel'}</p>
                        <p className="font-semibold">{trip.estimatedUsed} {trip.fuelType === 'EV' ? 'kWh' : 'L'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Efficiency</p>
                        <p className="font-semibold">{trip.efficiencyScore}/100</p>
                      </div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No trips yet. Start tracking your first trip!</p>
            </div>
          )}
        </div>
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedTrip(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Trip Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedTrip.startTime).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600">Distance</p>
                  <p className="text-xl font-bold">{selectedTrip.distanceKm} km</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="text-xl font-bold">{Math.round(selectedTrip.durationSec / 60)} min</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600">Avg Speed</p>
                  <p className="text-xl font-bold">{selectedTrip.avgSpeed} km/h</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600">Efficiency</p>
                  <p className="text-xl font-bold">{selectedTrip.efficiencyScore}/100</p>
                </div>
              </div>

              {selectedTrip.routePoints && selectedTrip.routePoints.length > 1 && (
                <div className="rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <MapContainer
                    center={[selectedTrip.routePoints[0].lat, selectedTrip.routePoints[0].lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Polyline
                      positions={selectedTrip.routePoints.map(p => [p.lat, p.lng])}
                      color="#14b8a6"
                      weight={4}
                    />
                  </MapContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
