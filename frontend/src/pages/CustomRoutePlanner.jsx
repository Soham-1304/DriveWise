import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import axios from '../lib/axios'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for POIs
const createPOIIcon = (type) => {
  const colors = {
    petrol: '#ef4444',
    charging: '#10b981',
    restaurant: '#f59e0b'
  };
  return L.divIcon({
    html: `<div style="background:${colors[type]};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    className: 'custom-poi-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export default function CustomRoutePlanner() {
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [origin, setOrigin] = useState({ lat: '', lng: '' })
  const [destination, setDestination] = useState({ lat: '', lng: '' })
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedMode, setSelectedMode] = useState('fastest')
  const [showPOIs, setShowPOIs] = useState(true)
  const [autocompleteOrigin, setAutocompleteOrigin] = useState([])
  const [autocompleteDest, setAutocompleteDest] = useState([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestSuggestions, setShowDestSuggestions] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    try {
      const token = await auth.currentUser.getIdToken()
      const response = await axios.get('/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const vehiclesData = response.data.vehicles || []
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

  async function handleAutocomplete(query, isOrigin) {
    if (query.length < 2) {
      if (isOrigin) setAutocompleteOrigin([])
      else setAutocompleteDest([])
      return
    }

    try {
      const token = await auth.currentUser.getIdToken()
      const response = await axios.get(`/api/route/autocomplete?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (isOrigin) {
        setAutocompleteOrigin(response.data.suggestions || [])
      } else {
        setAutocompleteDest(response.data.suggestions || [])
      }
    } catch (err) {
      console.error('Autocomplete error:', err)
    }
  }

  function selectSuggestion(suggestion, isOrigin) {
    if (isOrigin) {
      setOrigin({ lat: suggestion.lat.toString(), lng: suggestion.lng.toString() })
      setAutocompleteOrigin([])
      setShowOriginSuggestions(false)
    } else {
      setDestination({ lat: suggestion.lat.toString(), lng: suggestion.lng.toString() })
      setAutocompleteDest([])
      setShowDestSuggestions(false)
    }
  }

  async function handleOptimize(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = await auth.currentUser.getIdToken()
      const response = await axios.post(
        '/api/route/custom',
        {
          origin: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
          destination: { lat: parseFloat(destination.lat), lng: parseFloat(destination.lng) },
          vehicleId: selectedVehicle
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRouteData(response.data)
      setSelectedMode('fastest')
    } catch (err) {
      console.error('Error optimizing route:', err)
      setError('Failed to optimize route. Please check coordinates.')
    } finally {
      setLoading(false)
    }
  }

  function useSampleLocations() {
    // Mumbai CST to Andheri
    setOrigin({ lat: '18.9401', lng: '72.8352' })
    setDestination({ lat: '19.1136', lng: '72.8697' })
  }

  const currentRoute = routeData?.routes?.[selectedMode]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">🧠 Smart Route Optimizer</h2>
        <p className="text-gray-600 mt-1">Advanced algorithms: A*, Dijkstra, Dynamic Programming, K-Means Clustering</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6 space-y-6">
            <form onSubmit={handleOptimize} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {vehicles && vehicles.length > 0 ? (
                    vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.make} {v.model} ({v.fuelType})
                      </option>
                    ))
                  ) : (
                    <option value="">No vehicles</option>
                  )}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <input
                  type="text"
                  placeholder="Search location..."
                  onChange={(e) => {
                    handleAutocomplete(e.target.value, true)
                    setShowOriginSuggestions(true)
                  }}
                  onFocus={() => setShowOriginSuggestions(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-2"
                />
                {showOriginSuggestions && autocompleteOrigin.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {autocompleteOrigin.map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectSuggestion(sug, true)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        📍 {sug.name}
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    type="number"
                    step="any"
                    value={origin.lat}
                    onChange={(e) => setOrigin({ ...origin, lat: e.target.value })}
                    placeholder="Latitude"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    value={origin.lng}
                    onChange={(e) => setOrigin({ ...origin, lng: e.target.value })}
                    placeholder="Longitude"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  placeholder="Search location..."
                  onChange={(e) => {
                    handleAutocomplete(e.target.value, false)
                    setShowDestSuggestions(true)
                  }}
                  onFocus={() => setShowDestSuggestions(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-2"
                />
                {showDestSuggestions && autocompleteDest.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {autocompleteDest.map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectSuggestion(sug, false)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        📍 {sug.name}
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    type="number"
                    step="any"
                    value={destination.lat}
                    onChange={(e) => setDestination({ ...destination, lat: e.target.value })}
                    placeholder="Latitude"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    value={destination.lng}
                    onChange={(e) => setDestination({ ...destination, lng: e.target.value })}
                    placeholder="Longitude"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={useSampleLocations}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                📍 Use Sample (Mumbai)
              </button>

              <button
                type="submit"
                disabled={loading || !selectedVehicle}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50"
              >
                {loading ? '🔄 Computing...' : '🚀 Optimize Routes'}
              </button>
            </form>

            {routeData && (
              <div className="pt-4 border-t">
                <label className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    checked={showPOIs}
                    onChange={(e) => setShowPOIs(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Show stops (K-Means clusters)</span>
                </label>
                <p className="text-xs text-gray-500">
                  💡 Algorithms: {routeData.algorithms?.[selectedMode]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Map + Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mode Selection */}
          {routeData && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="grid grid-cols-3 gap-3">
                {['fastest', 'eco', 'casual'].map(mode => {
                  const route = routeData.routes[mode]
                  return (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`p-4 rounded-lg border-2 transition ${
                        selectedMode === mode
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-left">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 rounded-full" style={{ background: route.color }}></div>
                          <h3 className="font-semibold text-sm">{route.name}</h3>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>⏱️ {route.metrics.durationMin} min</p>
                          <p>⛽ {route.metrics.fuelUsed} {routeData.vehicle.fuelType === 'EV' ? 'kWh' : 'L'}</p>
                          <p>💰 ₹{route.metrics.costEstimate}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Metrics Comparison Table */}
          {routeData && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Route</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Distance</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Time</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Fuel/Energy</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Cost</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Algorithm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {['fastest', 'eco', 'casual'].map(mode => {
                    const route = routeData.routes[mode]
                    return (
                      <tr key={mode} className={selectedMode === mode ? 'bg-primary-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: route.color }}></div>
                            <span>{route.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{route.metrics.distanceKm} km</td>
                        <td className="px-4 py-3">{route.metrics.durationMin} min</td>
                        <td className="px-4 py-3">{route.metrics.fuelUsed} {routeData.vehicle.fuelType === 'EV' ? 'kWh' : 'L'}</td>
                        <td className="px-4 py-3">₹{route.metrics.costEstimate}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{route.metrics.algorithm}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '500px' }}>
            {routeData && currentRoute ? (
              <MapContainer
                center={[parseFloat(origin.lat), parseFloat(origin.lng)]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                
                {/* Origin and Destination Markers */}
                <Marker position={[parseFloat(origin.lat), parseFloat(origin.lng)]}>
                  <Popup>🟢 Origin</Popup>
                </Marker>
                <Marker position={[parseFloat(destination.lat), parseFloat(destination.lng)]}>
                  <Popup>🔴 Destination</Popup>
                </Marker>

                {/* Route Polyline */}
                {currentRoute.geometry && currentRoute.geometry.length > 0 && (
                  <Polyline
                    positions={currentRoute.geometry}
                    color={currentRoute.color}
                    weight={5}
                    opacity={0.8}
                  />
                )}

                {/* POI Markers (for casual mode) */}
                {showPOIs && selectedMode === 'casual' && currentRoute.pois && currentRoute.pois.map((cluster, idx) => {
                  if (!cluster.points || cluster.points.length === 0) return null
                  const representativePOI = cluster.points[0]
                  return (
                    <Marker
                      key={idx}
                      position={[representativePOI.lat, representativePOI.lng]}
                      icon={createPOIIcon(representativePOI.type)}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold mb-1">{representativePOI.name}</p>
                          <p className="text-xs text-gray-600">
                            {representativePOI.type === 'charging' && `⚡ ${representativePOI.power} • ₹${representativePOI.price}/kWh`}
                            {representativePOI.type === 'petrol' && `⛽ ₹${representativePOI.price}/L`}
                            {representativePOI.type === 'restaurant' && `🍽️ ${representativePOI.cuisine}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Cluster: {cluster.points.length} nearby</p>
                        </div>
                      </Popup>
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                        {representativePOI.name}
                      </Tooltip>
                    </Marker>
                  )
                })}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-lg">Enter locations to see optimized routes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
