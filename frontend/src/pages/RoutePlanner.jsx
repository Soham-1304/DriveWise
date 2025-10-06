import { useState, useEffect, useRef, useCallback } from 'react'
import { auth } from '../firebase'
import axios from '../lib/axios'
import { MapContainer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import PremiumTileLayer from '../components/PremiumTileLayer'
import POIMarker from '../components/POIMarker'
import { searchLocations } from '../services/geocoding'
import { calculateRouteBounds } from '../services/overpassAPI'
import { useDebounce } from 'use-debounce'

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const originIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const destIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Auto-fit map
function MapUpdater({ routes, origin, dest }) {
  const map = useMap()
  
  useEffect(() => {
    if (routes && origin.lat && dest.lat) {
      const bounds = L.latLngBounds([
        [parseFloat(origin.lat), parseFloat(origin.lng)],
        [parseFloat(dest.lat), parseFloat(dest.lng)]
      ])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [routes, origin, dest, map])
  
  return null
}

export default function RoutePlanner() {
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [origin, setOrigin] = useState({ lat: '', lng: '', name: '' })
  const [dest, setDest] = useState({ lat: '', lng: '', name: '' })
  const [allRoutes, setAllRoutes] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Search
  const [originSearch, setOriginSearch] = useState('')
  const [destSearch, setDestSearch] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destSuggestions, setDestSuggestions] = useState([])
  const [showOriginDrop, setShowOriginDrop] = useState(false)
  const [showDestDrop, setShowDestDrop] = useState(false)
  
  // POIs
  const [pois, setPois] = useState([])
  const [showPOIs, setShowPOIs] = useState(true)
  const [loadingPOIs, setLoadingPOIs] = useState(false)
  
  // Trip Tracking
  const [tripActive, setTripActive] = useState(false)
  const [currentPos, setCurrentPos] = useState(null)
  const [tripData, setTripData] = useState(null)
  const [speed, setSpeed] = useState(0)
  const [distanceTraveled, setDistanceTraveled] = useState(0)
  const [fuelConsumed, setFuelConsumed] = useState(0)
  const [efficiencyScore, setEfficiencyScore] = useState(100)
  const [telemetryBuffer, setTelemetryBuffer] = useState([])
  const [lastTelemetrySend, setLastTelemetrySend] = useState(Date.now())
  const watchId = useRef(null)
  const prevPosRef = useRef(null)
  const prevSpeedRef = useRef(0)

  useEffect(() => {
    fetchVehicles()
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    }
  }, [])
  
  // Reload POIs when selected route changes
  useEffect(() => {
    if (selected && allRoutes.length > 0 && showPOIs) {
      loadPOIsForRoutes(allRoutes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, showPOIs])

  async function fetchVehicles() {
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await axios.get('/api/fleet/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const vehs = Array.isArray(res.data) ? res.data : []
      setVehicles(vehs)
      if (vehs.length > 0) setSelectedVehicle(vehs[0]._id)
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setVehicles([])
    }
  }

  // Debounce search queries
  const [debouncedOriginSearch] = useDebounce(originSearch, 300)
  const [debouncedDestSearch] = useDebounce(destSearch, 300)

  // Search with new geocoding service
  const searchLocation = useCallback(async (query, isOrigin) => {
    if (query.length < 2) {
      if (isOrigin) {
        setOriginSuggestions([])
        setShowOriginDrop(false)
      } else {
        setDestSuggestions([])
        setShowDestDrop(false)
      }
      return
    }

    try {
      // Use new geocoding service (Mapbox/Nominatim)
      const results = await searchLocations(query, {
        limit: 5,
        types: ['place', 'address', 'poi']
      })
      
      if (isOrigin) {
        setOriginSuggestions(results)
        setShowOriginDrop(true)
      } else {
        setDestSuggestions(results)
        setShowDestDrop(true)
      }
    } catch (err) {
      console.error('Search error:', err)
      // Fallback to old API if geocoding fails
      try {
        const token = await auth.currentUser.getIdToken()
        const res = await axios.get(`/api/route/autocomplete?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (isOrigin) {
          setOriginSuggestions(res.data.suggestions || [])
          setShowOriginDrop(true)
        } else {
          setDestSuggestions(res.data.suggestions || [])
          setShowDestDrop(true)
        }
      } catch (fallbackErr) {
        console.error('Fallback search error:', fallbackErr)
      }
    }
  }, [])

  // Trigger search on debounced value change
  useEffect(() => {
    // Don't search if the input matches the already selected location
    if (debouncedOriginSearch && debouncedOriginSearch !== origin.name) {
      searchLocation(debouncedOriginSearch, true)
    } else if (debouncedOriginSearch === origin.name) {
      setOriginSuggestions([])
      setShowOriginDrop(false)
    }
  }, [debouncedOriginSearch, searchLocation, origin.name])

  useEffect(() => {
    // Don't search if the input matches the already selected location
    if (debouncedDestSearch && debouncedDestSearch !== dest.name) {
      searchLocation(debouncedDestSearch, false)
    } else if (debouncedDestSearch === dest.name) {
      setDestSuggestions([])
      setShowDestDrop(false)
    }
  }, [debouncedDestSearch, searchLocation, dest.name])

  function pickLocation(sug, isOrigin) {
    if (isOrigin) {
      setOrigin({ lat: sug.lat, lng: sug.lng, name: sug.name })
      setOriginSearch(sug.name)
      setOriginSuggestions([])
      setShowOriginDrop(false)
    } else {
      setDest({ lat: sug.lat, lng: sug.lng, name: sug.name })
      setDestSearch(sug.name)
      setDestSuggestions([])
      setShowDestDrop(false)
    }
  }

  // Get current location using GPS
  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      // Reverse geocode to get address name
      try {
        const res = await axios.get('/api/geocode/reverse', {
          params: { lat, lng }
        })
        
        const locationName = res.data.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        
        setOrigin({ lat, lng, name: locationName })
        setOriginSearch(locationName)
      } catch (err) {
        console.error('Reverse geocoding error:', err)
        // Fallback to coordinates if reverse geocoding fails
        const locationName = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        setOrigin({ lat, lng, name: locationName })
        setOriginSearch(locationName)
      }
    } catch (err) {
      console.error('Location error:', err)
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access.')
      } else if (err.code === 2) {
        setError('Location unavailable. Please try again.')
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again.')
      } else {
        setError('Failed to get current location')
      }
    } finally {
      setLoading(false)
    }
  }

  async function findRoutes(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setAllRoutes([])
    setSelected(null)

    try {
      const token = await auth.currentUser.getIdToken()
      const veh = vehicles.find(v => v._id === selectedVehicle)
      if (!veh) throw new Error('Select a vehicle')

      // Get both OSRM and Smart routes
      const [osrmRes, smartRes] = await Promise.all([
        axios.post('/api/route/optimize', {
          origin: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
          destination: { lat: parseFloat(dest.lat), lng: parseFloat(dest.lng) },
          vehicleId: selectedVehicle
        }, { headers: { Authorization: `Bearer ${token}` } }),
        
        axios.post('/api/route/custom', {
          origin: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
          destination: { lat: parseFloat(dest.lat), lng: parseFloat(dest.lng) },
          vehicleId: selectedVehicle
        }, { headers: { Authorization: `Bearer ${token}` } })
      ])

      const cost = veh.fuelType === 'EV' ? 10 : 100

      const routes = [
        {
          id: 'osrm',
          name: 'Basic Route',
          desc: 'Standard OSRM',
          color: '#8b5cf6',
          data: osrmRes.data.best,
          metrics: {
            distance: osrmRes.data.best.distanceKm?.toFixed(1) || '0',
            time: Math.round(osrmRes.data.best.durationMin) || 0,
            fuel: osrmRes.data.best.estimatedUsed?.toFixed(2) || '0',
            cost: Math.round((osrmRes.data.best.estimatedUsed || 0) * cost)
          }
        },
        {
          id: 'fastest',
          name: '🚀 Fastest',
          desc: 'A* Algorithm',
          color: '#3b82f6',
          data: smartRes.data.routes.fastest,
          metrics: {
            distance: smartRes.data.routes.fastest.metrics.distance?.toFixed(1) || '0',
            time: Math.round(smartRes.data.routes.fastest.metrics.time) || 0,
            fuel: smartRes.data.routes.fastest.metrics.fuel?.toFixed(2) || '0',
            cost: Math.round(smartRes.data.routes.fastest.metrics.cost) || 0
          }
        },
        {
          id: 'eco',
          name: '🌱 Eco',
          desc: 'Min Fuel (DP)',
          color: '#10b981',
          data: smartRes.data.routes.eco,
          metrics: {
            distance: smartRes.data.routes.eco.metrics.distance?.toFixed(1) || '0',
            time: Math.round(smartRes.data.routes.eco.metrics.time) || 0,
            fuel: smartRes.data.routes.eco.metrics.fuel?.toFixed(2) || '0',
            cost: Math.round(smartRes.data.routes.eco.metrics.cost) || 0
          }
        },
        {
          id: 'casual',
          name: '🛑 Casual',
          desc: 'With Stops',
          color: '#f59e0b',
          data: smartRes.data.routes.casual,
          metrics: {
            distance: smartRes.data.routes.casual.metrics.distance?.toFixed(1) || '0',
            time: Math.round(smartRes.data.routes.casual.metrics.time) || 0,
            fuel: smartRes.data.routes.casual.metrics.fuel?.toFixed(2) || '0',
            cost: Math.round(smartRes.data.routes.casual.metrics.cost) || 0
          }
        }
      ]

      setAllRoutes(routes)
      setSelected(routes[0])
      
      // Fetch POIs along the routes
      await loadPOIsForRoutes(routes)
    } catch (err) {
      console.error('Route error:', err)
      setError('Failed to find routes. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load POIs along routes - ROUTE-SPECIFIC POI TYPES
  async function loadPOIsForRoutes(routes) {
    if (!routes || routes.length === 0) return
    
    setLoadingPOIs(true)
    try {
      // Get all route coordinates for bounds calculation
      const allCoords = []
      routes.forEach(route => {
        const geom = route.data?.geometry || route.data?.path?.geometry
        if (geom?.coordinates) {
          geom.coordinates.forEach(coord => {
            allCoords.push({ lat: coord[1], lng: coord[0] })
          })
        }
      })
      
      if (allCoords.length === 0) {
        console.warn('No route coordinates found')
        return
      }
      
      // Calculate total route distance to determine if it's long-distance
      const routeDistance = selected?.metrics?.distance || 0
      const isLongDistance = routeDistance > 100 // > 100km is considered long distance
      
      // Import the enhanced POI fetching
      const { fetchPOIs, fetchPOIsForLongRoute } = await import('../services/overpassAPI')
      
      // Get current vehicle for fuel type
      const veh = vehicles.find(v => v._id === selectedVehicle)
      
      // Define POI types based on selected route MODE
      let poiTypes = []
      
      if (selected?.id === 'fastest') {
        // Fastest: Speed cameras, tolls, traffic signals, rest areas, hospitals
        poiTypes = ['speed_camera', 'toll', 'traffic_signals', 'rest_area', 'hospital']
        console.log('🏎️ Loading Fastest route POIs: Speed cameras, tolls, signals, rest stops, hospitals')
      } else if (selected?.id === 'eco') {
        // Eco: Charging/fuel stations, rest areas, parks/nature, hospitals (eco-friendly + safety)
        poiTypes = veh?.fuelType === 'EV' 
          ? ['charging', 'rest_area', 'park', 'hospital'] 
          : ['fuel', 'rest_area', 'park', 'hospital']
        console.log('🌱 Loading Eco route POIs: Energy-efficient stops, nature spots, hospitals')
      } else if (selected?.id === 'casual') {
        // Casual: Tourism, food, viewpoints, restrooms, parking, hospitals (leisure + safety)
        poiTypes = ['food', 'tourism', 'viewpoint', 'restroom', 'parking', 'rest_area', 'hospital']
        console.log('🏖️ Loading Casual route POIs: Restaurants, attractions, scenic views, restrooms, hospitals')
      } else {
        // Basic: Just essentials - fuel/charging, rest areas, hospitals, emergency
        poiTypes = veh?.fuelType === 'EV' 
          ? ['charging', 'rest_area', 'hospital', 'emergency'] 
          : ['fuel', 'rest_area', 'hospital', 'emergency']
        console.log('🛣️ Loading Basic route POIs: Essentials only (fuel, rest, hospitals, emergency)')
      }
      
      let fetchedPOIs = []
      
      if (isLongDistance) {
        // For long routes, use segmented fetching to cover entire route
        console.log(`📍 Long-distance route detected (${routeDistance} km) - using segmented POI loading`)
        const routeGeometry = selected?.data?.geometry?.coordinates || []
        fetchedPOIs = await fetchPOIsForLongRoute(routeGeometry, poiTypes)
      } else {
        // For short routes, use simple bounds-based fetching
        const bounds = calculateRouteBounds(allCoords)
        fetchedPOIs = await fetchPOIs(bounds, poiTypes)
      }
      
      // Filter POIs to only show those along the route (within corridor)
      const corridorWidth = isLongDistance ? 5 : 2 // Wider corridor for long routes (5km vs 2km)
      const routePOIs = fetchedPOIs.filter(poi => {
        const poiLat = poi.lat || poi.latitude
        const poiLng = poi.lng || poi.lon || poi.longitude
        
        if (!poiLat || !poiLng) return false
        
        return allCoords.some(coord => {
          const distance = calculateDistance(poiLat, poiLng, coord.lat, coord.lng)
          return distance <= corridorWidth
        })
      })
      
      console.log(`✅ Loaded ${routePOIs.length} POIs along route (${fetchedPOIs.length} total fetched)`)
      setPois(routePOIs)
    } catch (err) {
      console.error('POI loading error:', err)
      setPois([]) // Clear POIs on error
    } finally {
      setLoadingPOIs(false)
    }
  }

  // Calculate distance between two points (Haversine formula in km)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.asin(Math.sqrt(a))
    return R * c
  }

  // Calculate fuel/energy consumption based on speed and acceleration
  function calculateFuelConsumption(distance, currentSpeed, prevSpeed, vehicle) {
    if (!distance || distance <= 0) return 0
    
    // Get vehicle baseline consumption (L/100km or kWh/100km)
    const baseline = vehicle?.consumptionBaseline || (vehicle?.fuelType === 'EV' ? 15 : 6.5)
    
    // Speed efficiency factor
    let speedFactor = 1.0
    if (currentSpeed > 80) speedFactor = 1.15 // Highway speeds increase consumption
    else if (currentSpeed > 60) speedFactor = 1.0 // Optimal range
    else if (currentSpeed > 40) speedFactor = 0.95 // Efficient city speeds
    else if (currentSpeed > 20) speedFactor = 1.05 // Stop-and-go traffic
    else speedFactor = 1.2 // Very low speeds (idling)
    
    // Acceleration factor (harsh acceleration increases consumption)
    const acceleration = Math.abs(currentSpeed - prevSpeed) / 5 // per 5 seconds
    const accelFactor = 1.0 + (acceleration > 10 ? 0.15 : acceleration > 5 ? 0.08 : 0.02)
    
    // Calculate consumption for this distance segment
    const consumption = baseline * (distance / 100) * speedFactor * accelFactor
    return consumption
  }

  // Send telemetry data to backend
  async function sendTelemetry(buffer) {
    if (!buffer || buffer.length === 0 || !tripData) return
    
    try {
      const token = await auth.currentUser.getIdToken()
      await axios.post('/api/trip/telemetry', {
        tripId: tripData.tripId,
        points: buffer
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      console.log(`📡 Sent ${buffer.length} telemetry points to backend`)
    } catch (err) {
      console.error('Telemetry send error:', err)
    }
  }

  async function startTrip() {
    if (!selected) {
      setError('Please select a route first')
      return
    }

    // Request location permission first
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    try {
      // Get initial position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      })

      const initialPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      // Get current vehicle data
      const vehicle = vehicles.find(v => v._id === selectedVehicle)

      const token = await auth.currentUser.getIdToken()
      const res = await axios.post('/api/trip/start', {
        vehicleId: selectedVehicle,
        routeId: selected.id,
        plannedDistance: selected.metrics?.distance || 0,
        startFuelLevel: 100,
        startCoords: initialPos
      }, { headers: { Authorization: `Bearer ${token}` } })

      setTripData(res.data)
      setCurrentPos(initialPos)
      prevPosRef.current = initialPos
      prevSpeedRef.current = 0
      setTripActive(true)
      setDistanceTraveled(0)
      setFuelConsumed(0)
      setEfficiencyScore(100)
      setTelemetryBuffer([])
      setLastTelemetrySend(Date.now())
      
      console.log('🚗 Trip started! Tracking GPS...')
      
      // Start watching position with high accuracy
      watchId.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
          setCurrentPos(newPos)
          
          // Update speed (m/s to km/h)
          const currentSpeed = pos.coords.speed !== null && pos.coords.speed >= 0 
            ? (pos.coords.speed * 3.6) 
            : 0
          setSpeed(currentSpeed.toFixed(1))
          
          // Calculate distance traveled from previous position
          if (prevPosRef.current) {
            const dist = calculateDistance(
              prevPosRef.current.lat,
              prevPosRef.current.lng,
              newPos.lat,
              newPos.lng
            )
            
            if (dist > 0.001) { // Only update if moved more than 1 meter
              setDistanceTraveled(prev => prev + dist)
              
              // Calculate fuel consumption for this segment
              const segmentFuel = calculateFuelConsumption(
                dist, 
                currentSpeed, 
                prevSpeedRef.current, 
                vehicle
              )
              setFuelConsumed(prev => prev + segmentFuel)
              
              // Update efficiency score based on speed efficiency
              const optimalSpeed = currentSpeed >= 40 && currentSpeed <= 60
              setEfficiencyScore(prev => {
                if (optimalSpeed) return Math.min(100, prev + 0.1)
                else if (currentSpeed > 80) return Math.max(0, prev - 0.3)
                else return Math.max(0, prev - 0.1)
              })
              
              // Add to telemetry buffer
              const telemetryPoint = {
                lat: newPos.lat,
                lng: newPos.lng,
                speed: currentSpeed,
                ts: new Date().toISOString()
              }
              
              setTelemetryBuffer(prev => {
                const newBuffer = [...prev, telemetryPoint]
                
                // Send telemetry every 10 seconds or when buffer has 10+ points
                const timeSinceLastSend = Date.now() - lastTelemetrySend
                if (newBuffer.length >= 10 || timeSinceLastSend >= 10000) {
                  sendTelemetry(newBuffer)
                  setLastTelemetrySend(Date.now())
                  return []
                }
                
                return newBuffer
              })
            }
          }
          
          prevPosRef.current = newPos
          prevSpeedRef.current = currentSpeed
        },
        (err) => console.error('GPS error:', err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      )
    } catch (err) {
      console.error('Trip start error:', err)
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access to track trip.')
      } else {
        setError('Failed to start trip. Please try again.')
      }
    }
  }

  async function endTrip() {
    if (!tripData) return

    try {
      // Send any remaining telemetry
      if (telemetryBuffer.length > 0) {
        await sendTelemetry(telemetryBuffer)
        setTelemetryBuffer([])
      }
      
      // Stop GPS tracking
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
      }

      const token = await auth.currentUser.getIdToken()
      const response = await axios.post('/api/trip/end', {
        tripId: tripData.tripId,
        vehicleId: selectedVehicle,
        endFuelLevel: 80,
        endCoords: currentPos || { lat: parseFloat(dest.lat), lng: parseFloat(dest.lng) }
      }, { headers: { Authorization: `Bearer ${token}` } })

      // Show detailed summary
      const trip = response.data.trip
      if (trip) {
        const plannedDist = Number(trip.plannedDistanceKm || selected?.metrics?.distance || 0)
        const actualDist = Number(trip.distanceKm || 0)
        const extraDist = Number(trip.extraDistanceKm || 0)
        const adherence = Number(trip.routeAdherence || 100)
        const behavior = trip.drivingBehavior || {}
        
        alert(
          `🎉 TRIP COMPLETED - FUEL OPTIMIZATION REPORT\n` +
          `═══════════════════════════════════════════════\n\n` +
          `� DISTANCE\n` +
          `   Actual: ${actualDist.toFixed(2)} km\n` +
          `   Planned: ${plannedDist.toFixed(1)} km\n` +
          (extraDist > 0 ? `   ⚠️  Extra: ${extraDist.toFixed(2)} km (deviation)\n` : '') +
          `   Route Adherence: ${adherence.toFixed(1)}%\n\n` +
          `⛽ FUEL CONSUMPTION\n` +
          `   Used: ${trip.estimatedUsed?.toFixed(2)} ${trip.fuelType === 'EV' ? 'kWh' : 'L'}\n` +
          `   Saved vs. worst-case: ${trip.fuelSaved?.toFixed(2)} ${trip.fuelType === 'EV' ? 'kWh' : 'L'}\n` +
          `   Efficiency: ${(actualDist / trip.estimatedUsed).toFixed(2)} ${trip.fuelType === 'EV' ? 'km/kWh' : 'km/L'}\n\n` +
          `⚡ EFFICIENCY SCORE: ${trip.efficiencyScore}/100\n` +
          (trip.efficiencyScore >= 80 ? '   � Excellent!' : 
           trip.efficiencyScore >= 60 ? '   👍 Good!' : '   ⚠️  Needs Improvement') + `\n\n` +
          `🚗 DRIVING BEHAVIOR\n` +
          `   Speed Score: ${behavior.speedScore || 0}/100\n` +
          `   Smoothness: ${behavior.smoothnessScore || 0}/100\n` +
          `   Optimal Speed: ${behavior.optimalSpeedPercentage || 0}% of time\n` +
          `   High Speed (>80): ${behavior.highSpeedPercentage || 0}%\n\n` +
          `⏱️  TIME & SPEED\n` +
          `   Duration: ${Math.floor(trip.durationSec / 60)} min\n` +
          `   Avg Speed: ${trip.avgSpeed?.toFixed(1)} km/h\n` +
          `   Max Speed: ${trip.maxSpeed?.toFixed(1)} km/h\n\n` +
          `💡 TIP: ${
            behavior.speedScore < 60 ? 'Try maintaining 40-60 km/h for better efficiency' :
            behavior.smoothnessScore < 60 ? 'Avoid harsh acceleration and braking' :
            extraDist > 5 ? 'Follow the planned route to save fuel' :
            'Great job! Keep up the efficient driving!'
          }`
        )
      } else {
        alert(`Trip ended! Distance traveled: ${distanceTraveled.toFixed(2)} km`)
      }
      
      // Reset states
      setTripActive(false)
      setCurrentPos(null)
      setTripData(null)
      setSpeed(0)
      setDistanceTraveled(0)
      setFuelConsumed(0)
      setEfficiencyScore(100)
      setTelemetryBuffer([])
      prevPosRef.current = null
      prevSpeedRef.current = 0
    } catch (err) {
      console.error('Trip end error:', err)
      setError('Failed to end trip')
    }
  }

  function useSample() {
    setOrigin({ lat: '18.9401', lng: '72.8352', name: 'Mumbai CST' })
    setDest({ lat: '19.1136', lng: '72.8697', name: 'Andheri' })
    setOriginSearch('Mumbai CST')
    setDestSearch('Andheri')
  }

  const hasRoutes = allRoutes.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🗺️ Route Planner</h2>
        <p className="text-gray-600">Find the best route with AI-powered fuel optimization</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Input Form - Modern Minimalist Design */}
      <form onSubmit={findRoutes} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Vehicle */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">🚗 Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm hover:shadow-md text-gray-900 font-medium"
              required
            >
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.make} {v.model}</option>
              ))}
            </select>
          </div>

          {/* Origin Search */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">📍 From</label>
            <input
              type="text"
              value={originSearch}
              onChange={(e) => setOriginSearch(e.target.value)}
              onFocus={() => originSearch.length >= 2 && setShowOriginDrop(true)}
              onBlur={() => setTimeout(() => setShowOriginDrop(false), 100)}
              placeholder="Thane, Thane Taluka, Th"
              className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm hover:shadow-md text-gray-900 font-medium placeholder:text-gray-400"
              required
            />
            <button
              type="button"
              onClick={useCurrentLocation}
              className="absolute right-2 top-9 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm text-xs font-medium flex items-center gap-1"
              title="Use Current Location"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              GPS
            </button>
            {showOriginDrop && originSuggestions.length > 0 && (
              <div className="absolute z-[1000] w-full mt-2 bg-white/95 backdrop-blur-lg border-0 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                {originSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pickLocation(sug, true)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50/80 transition-all first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-green-500">📍</span> {sug.name}
                    </div>
                    <div className="text-xs text-gray-400 ml-6">{sug.lat.toFixed(4)}, {sug.lng.toFixed(4)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Search */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">🎯 To</label>
            <input
              type="text"
              value={destSearch}
              onChange={(e) => setDestSearch(e.target.value)}
              onFocus={() => destSearch.length >= 2 && setShowDestDrop(true)}
              onBlur={() => setTimeout(() => setShowDestDrop(false), 100)}
              placeholder="Andheri, Masjid Galli, An"
              className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm hover:shadow-md text-gray-900 font-medium placeholder:text-gray-400"
              required
            />
            {showDestDrop && destSuggestions.length > 0 && (
              <div className="absolute z-[1000] w-full mt-2 bg-white/95 backdrop-blur-lg border-0 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                {destSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pickLocation(sug, false)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50/80 transition-all first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-red-500">🎯</span> {sug.name}
                    </div>
                    <div className="text-xs text-gray-400 ml-6">{sug.lat.toFixed(4)}, {sug.lng.toFixed(4)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sample Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={useSample}
              className="w-full px-4 py-3.5 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all font-medium shadow-sm hover:shadow-md border-0"
            >
              📍 Sample
            </button>
          </div>

          {/* Find Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !origin.lat || !dest.lat}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 font-semibold shadow-md hover:shadow-lg border-0"
            >
              {loading ? '🔍 Finding...' : '🔍 Find Routes'}
            </button>
          </div>
        </div>
      </form>

      {/* Live Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🗺️ Live Map
            {tripActive && (
              <span className="ml-2 px-3 py-1 bg-green-500 text-white text-sm rounded-full animate-pulse">
                GPS Tracking Active
              </span>
            )}
          </h3>
          {tripActive && (
            <p className="text-sm text-gray-600">
              📍 Current position shown in blue
            </p>
          )}
        </div>
        
        {/* Map - ALWAYS VISIBLE */}
        <div 
          className="rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-500 bg-gray-100" 
          style={{ height: '600px', minHeight: '600px' }}
        >
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
          >
          <PremiumTileLayer showSelector={true} />
          <MapUpdater routes={allRoutes} origin={origin} dest={dest} />

          {origin.lat && (
            <Marker position={[parseFloat(origin.lat), parseFloat(origin.lng)]} icon={originIcon}>
              <Popup><strong>From:</strong> {origin.name}</Popup>
            </Marker>
          )}

          {dest.lat && (
            <Marker position={[parseFloat(dest.lat), parseFloat(dest.lng)]} icon={destIcon}>
              <Popup><strong>To:</strong> {dest.name}</Popup>
            </Marker>
          )}
          
          {/* Current Position during trip */}
          {tripActive && currentPos && (
            <Marker position={[currentPos.lat, currentPos.lng]} icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            })}>
              <Popup>
                <strong>\ud83d\udccd Current Location</strong><br/>
                Distance: {distanceTraveled.toFixed(2)} km
              </Popup>
            </Marker>
          )}

          {allRoutes.map(route => {
            const isActive = selected?.id === route.id
            
            // Only show the selected route
            if (!isActive) return null
            
            const geom = route.data?.geometry || route.data?.path?.geometry

            if (!geom?.coordinates) return null

            // Optimize rendering for long routes by simplifying geometry
            const coords = geom.coordinates
            const shouldSimplify = coords.length > 500 // Simplify if > 500 points
            
            let displayCoords = coords
            if (shouldSimplify) {
              // Sample every Nth point to reduce rendering load
              const step = Math.ceil(coords.length / 300) // Keep ~300 points max
              displayCoords = coords.filter((_, index) => index % step === 0 || index === coords.length - 1)
              console.log(`🎨 Simplified route: ${coords.length} → ${displayCoords.length} points`)
            }

            return (
              <Polyline
                key={route.id}
                positions={displayCoords.map(c => [c[1], c[0]])}
                color={route.color}
                weight={8}
                opacity={1}
                smoothFactor={2} // Increase smoothing for performance
              />
            )
          })}

          {selected?.id === 'casual' && selected.data?.pois?.map((poi, i) => {
            // Safety check for coordinates
            if (!poi.lat || !poi.lng) return null
            
            return (
              <Marker key={i} position={[poi.lat, poi.lng]}>
                <Popup>
                  <strong>{poi.name}</strong><br />
                  {poi.type}
                </Popup>
              </Marker>
            )
          })}

          {/* Real POI markers from Overpass API */}
          {showPOIs && pois.slice(0, 100).map((poi) => {  // Limit to 100 POIs to prevent lag
            // Safety check: ensure coordinates exist
            const lat = poi.lat || poi.latitude
            const lng = poi.lng || poi.lon || poi.longitude
            
            if (!lat || !lng) {
              console.warn('POI missing coordinates:', poi)
              return null
            }
            
            return (
              <POIMarker
                key={poi.id}
                poi={{ ...poi, lat, lng }}
                onClick={(clickedPoi) => console.log('POI clicked:', clickedPoi)}
              />
            )
          })}
        </MapContainer>
      </div>
      </div>

      {/* POI Controls */}
      {allRoutes.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPOIs(!showPOIs)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                showPOIs
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              {showPOIs ? '👁️ Hide POIs' : '👁️‍🗨️ Show POIs'}
            </button>
            {loadingPOIs && (
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading POIs...
              </span>
            )}
            {pois.length > 0 && (
              <span className="text-sm text-gray-600">
                {pois.length} points of interest nearby
              </span>
            )}
          </div>
        </div>
      )}

      {/* Route Cards */}
      {hasRoutes && (
        <>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Route</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {allRoutes.map(route => {
              const isActive = selected?.id === route.id
              
              return (
                <button
                  key={route.id}
                  onClick={() => setSelected(route)}
                  className={`text-left p-6 rounded-2xl transition-all transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-4 border-blue-500 shadow-2xl'
                      : 'bg-white border-2 border-gray-200 hover:border-blue-300 shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg text-gray-900">{route.name}</h4>
                    {isActive && (
                      <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                        ✓ Selected
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-4">{route.desc}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Distance</span>
                      <span className="font-bold text-gray-900">{route.metrics.distance} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Time</span>
                      <span className="font-bold text-gray-900">{route.metrics.time} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fuel</span>
                      <span className="font-bold text-gray-900">{route.metrics.fuel} L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cost</span>
                      <span className="font-bold text-green-600">₹{route.metrics.cost}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 h-3 rounded-full" style={{ backgroundColor: route.color + '40' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: '100%', backgroundColor: route.color }} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Trip Actions */}
          {selected && !tripActive && (
            <button
              onClick={startTrip}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-xl hover:from-green-600 hover:to-emerald-700 transition shadow-2xl"
            >
              🚀 Start Trip with {selected.name}
            </button>
          )}

          {tripActive && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl shadow-xl">
                <div className="flex items-center mb-4">
                  <svg className="h-8 w-8 text-green-600 animate-pulse mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-green-900">🚗 Trip in Progress</h3>
                    <p className="text-sm text-green-700">Route: {selected?.name} • GPS Tracking Active</p>
                  </div>
                </div>
                
                {/* Live Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white rounded-xl p-4 shadow-md border border-green-200">
                    <div className="text-xs text-gray-500 mb-1">Distance</div>
                    <div className="text-2xl font-bold text-gray-900">{distanceTraveled.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">km</div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-md border border-blue-200">
                    <div className="text-xs text-gray-500 mb-1">Speed</div>
                    <div className="text-2xl font-bold text-blue-600">{speed || 0}</div>
                    <div className="text-xs text-gray-600">km/h</div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-md border border-orange-200">
                    <div className="text-xs text-gray-500 mb-1">Fuel Used</div>
                    <div className="text-2xl font-bold text-orange-600">{fuelConsumed.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">
                      {vehicles.find(v => v._id === selectedVehicle)?.fuelType === 'EV' ? 'kWh' : 'L'}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-md border border-purple-200">
                    <div className="text-xs text-gray-500 mb-1">Efficiency</div>
                    <div className="text-2xl font-bold text-purple-600">{Math.round(efficiencyScore)}</div>
                    <div className="text-xs text-gray-600">/100</div>
                  </div>
                </div>
                
                {/* Efficiency Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Efficiency Score</span>
                    <span className={`font-semibold ${
                      efficiencyScore >= 80 ? 'text-green-600' : 
                      efficiencyScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {efficiencyScore >= 80 ? '🌟 Excellent' : 
                       efficiencyScore >= 60 ? '👍 Good' : '⚠️ Needs Improvement'}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        efficiencyScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                        efficiencyScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' : 
                        'bg-gradient-to-r from-red-500 to-rose-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, efficiencyScore))}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Maintain 40-60 km/h for optimal efficiency
                  </p>
                </div>
              </div>
              
              <button
                onClick={endTrip}
                className="w-full py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-bold text-xl hover:from-red-600 hover:to-rose-700 transition shadow-2xl transform hover:scale-105"
              >
                ⏹️ End Trip & View Summary
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
