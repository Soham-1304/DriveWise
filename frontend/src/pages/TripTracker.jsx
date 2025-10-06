import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiGet } from '../utils/api'
import useTripTracker from '../hooks/useTripTracker'

export default function TripTracker() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [tripName, setTripName] = useState('')
  const [lastTrip, setLastTrip] = useState(null)
  const [error, setError] = useState('')
  
  const { startTrip, endTrip, tripId, isTracking } = useTripTracker(user)

  useEffect(() => {
    if (user) {
      fetchVehicles()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function fetchVehicles() {
    try {
      const response = await apiGet('/fleet/')
      const vehiclesData = Array.isArray(response) ? response : []
      setVehicles(vehiclesData)
      if (vehiclesData.length > 0) {
        setSelectedVehicle(vehiclesData[0]._id)
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError('Failed to load vehicles')
      setVehicles([])
    }
  }

  async function handleStartTrip() {
    if (!selectedVehicle) {
      setError('Please select a vehicle')
      return
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setError('')
    try {
      await startTrip(selectedVehicle, tripName || 'Untitled Trip')
    } catch (err) {
      setError('Failed to start trip: ' + err.message)
    }
  }

  async function handleEndTrip() {
    setError('')
    try {
      const trip = await endTrip(selectedVehicle)
      setLastTrip(trip)
      setTripName('')
    } catch (err) {
      setError('Failed to end trip: ' + err.message)
    }
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow-md text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicles available</h3>
        <p className="text-gray-600 mb-4">Add a vehicle first to start tracking trips</p>
        <a
          href="/vehicles"
          className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Go to Vehicles
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Trip</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!isTracking ? (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-6">Start a New Trip</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Vehicle *
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.fuelType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Name (optional)
              </label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g., Morning Commute"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="pt-4">
              <button
                onClick={handleStartTrip}
                className="w-full px-6 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Trip
                </div>
              </button>
              <p className="mt-3 text-xs text-gray-500 text-center">
                We'll track your location only during this trip. You can stop anytime.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Trip in Progress</h3>
            <p className="text-gray-600 mt-2">Tracking your location...</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Trip ID:</span>
              <span className="text-sm text-gray-600 font-mono">{tripId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Vehicle:</span>
              <span className="text-sm text-gray-600">
                {vehicles.find(v => v._id === selectedVehicle)?.make} {vehicles.find(v => v._id === selectedVehicle)?.model}
              </span>
            </div>
          </div>

          <button
            onClick={handleEndTrip}
            className="w-full px-6 py-4 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              End Trip
            </div>
          </button>
        </div>
      )}

      {lastTrip && (
        <div className="mt-6 bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Trip Completed! 🎉</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-green-700 font-medium">Distance</p>
              <p className="text-lg font-bold text-green-900">{lastTrip.distanceKm} km</p>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Duration</p>
              <p className="text-lg font-bold text-green-900">{Math.round(lastTrip.durationSec / 60)} min</p>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Avg Speed</p>
              <p className="text-lg font-bold text-green-900">{lastTrip.avgSpeed} km/h</p>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Efficiency</p>
              <p className="text-lg font-bold text-green-900">{lastTrip.efficiencyScore}/100</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm text-green-700">
              <span className="font-medium">{lastTrip.fuelType === 'EV' ? 'Energy' : 'Fuel'} Used:</span>{' '}
              {lastTrip.estimatedUsed} {lastTrip.fuelType === 'EV' ? 'kWh' : 'L'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

