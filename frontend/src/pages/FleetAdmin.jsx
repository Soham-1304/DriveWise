import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import axios from '../lib/axios'

export default function FleetAdmin() {
  const [vehicles, setVehicles] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchFleetData()
  }, [])

  async function fetchFleetData() {
    try {
      const token = await auth.currentUser.getIdToken()
      const headers = { Authorization: `Bearer ${token}` }

      const [vehiclesRes, tripsRes] = await Promise.all([
        axios.get('/vehicles', { headers }),
        axios.get('/trips?limit=100', { headers })
      ])

      setVehicles(vehiclesRes.data.vehicles || [])
      setTrips(tripsRes.data.trips || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching fleet data:', err)
      setVehicles([])
      setTrips([])
      setLoading(false)
    }
  }

  function exportToCSV() {
    const filteredTrips = trips.filter(trip => {
      const tripDate = new Date(trip.startTime).toISOString().split('T')[0]
      return tripDate >= dateRange.start && tripDate <= dateRange.end
    })

    if (filteredTrips.length === 0) {
      alert('No trips found in selected date range')
      return
    }

    // CSV headers
    const headers = [
      'Date',
      'Time',
      'Vehicle',
      'Distance (km)',
      'Duration (min)',
      'Avg Speed (km/h)',
      'Fuel/Energy Used',
      'Efficiency Score',
      'Fuel Type'
    ]

    // CSV rows
    const rows = filteredTrips.map(trip => {
      const vehicle = vehicles.find(v => v._id === trip.vehicleId)
      const date = new Date(trip.startTime)
      
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown',
        trip.distanceKm,
        Math.round(trip.durationSec / 60),
        trip.avgSpeed,
        trip.estimatedUsed,
        trip.efficiencyScore,
        trip.fuelType
      ]
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `trips_${dateRange.start}_to_${dateRange.end}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate fleet stats
  const fleetStats = (vehicles || []).map(vehicle => {
    const vehicleTrips = (trips || []).filter(t => t.vehicleId === vehicle._id)
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + t.distanceKm, 0)
    const totalFuel = vehicleTrips.reduce((sum, t) => sum + t.estimatedUsed, 0)
    const avgEfficiency = vehicleTrips.length > 0
      ? vehicleTrips.reduce((sum, t) => sum + t.efficiencyScore, 0) / vehicleTrips.length
      : 0
    const lastTrip = vehicleTrips.length > 0 ? vehicleTrips[0] : null

    return {
      vehicle,
      tripCount: vehicleTrips.length,
      totalDistance: totalDistance.toFixed(1),
      totalFuel: totalFuel.toFixed(1),
      avgEfficiency: Math.round(avgEfficiency),
      lastTrip
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Fleet Admin</h2>
        <button
          onClick={exportToCSV}
          disabled={trips.length === 0}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Date Range Filter for Export */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-sm font-semibold mb-3">Export Date Range</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Vehicles</h3>
          <p className="text-3xl font-bold text-gray-900">{vehicles.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Trips</h3>
          <p className="text-3xl font-bold text-gray-900">{trips.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Distance</h3>
          <p className="text-3xl font-bold text-gray-900">
            {trips.reduce((sum, t) => sum + t.distanceKm, 0).toFixed(0)} km
          </p>
        </div>
      </div>

      {/* Vehicle Table */}
      {fleetStats.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Fuel/Energy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Trip
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fleetStats.map((stat) => (
                  <tr key={stat.vehicle._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {stat.vehicle.make} {stat.vehicle.model}
                      </div>
                      <div className="text-xs text-gray-500">{stat.vehicle.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        stat.vehicle.fuelType === 'EV' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {stat.vehicle.fuelType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.tripCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.totalDistance} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.totalFuel} {stat.vehicle.fuelType === 'EV' ? 'kWh' : 'L'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {stat.avgEfficiency}/100
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stat.avgEfficiency >= 80 ? 'bg-green-500' :
                              stat.avgEfficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stat.avgEfficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.lastTrip 
                        ? new Date(stat.lastTrip.startTime).toLocaleDateString()
                        : 'No trips'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicles in fleet</h3>
          <p className="text-gray-600 mb-4">Add vehicles to start managing your fleet</p>
          <a
            href="/vehicles"
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Add Vehicles
          </a>
        </div>
      )}
    </div>
  )
}

