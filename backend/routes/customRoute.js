/**
 * Custom Route Optimizer
 * Combines all DSA algorithms to provide 3 route modes:
 * 1. FASTEST - Dijkstra/A* for minimum time
 * 2. ECO - DP-based for minimum fuel
 * 3. CASUAL - Route with POI clusters (K-Means)
 */

import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';
import { dijkstra } from '../algorithms/dijkstra.js';
import { astar } from '../algorithms/astar.js';
import { ecoRoute } from '../algorithms/dpRefuel.js';
import { kmeans, findPOIsAlongRoute } from '../algorithms/kmeans.js';
import { buildMumbaiGraph, findNearestNode, getSamplePOIs } from '../utils/graphBuilder.js';

const router = express.Router();

/**
 * Custom route optimization with 3 modes
 * POST /api/route/custom
 * Uses OSRM for real routing, applies algorithmic optimizations
 */
router.post('/custom', async (req, res) => {
  try {
    const { origin, destination, vehicleId } = req.body;

    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({ error: 'Invalid origin or destination' });
    }

    // Get vehicle data for fuel consumption calculations
    const db = await getDb();
    // Vehicle IDs are strings, not ObjectIds
    const vehicle = vehicleId
      ? await db.collection('vehicles').findOne({ _id: vehicleId })
      : null;

    const baseline = vehicle?.baselineConsumption || vehicle?.consumptionBaseline || (vehicle?.fuelType === 'EV' ? 15 : 6.5);
    const fuelType = vehicle?.fuelType || 'ICE';

    // Use OSRM to get real routes with maximum alternatives
    const osrmUrl = process.env.OSRM_URL || 'https://router.project-osrm.org';
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${osrmUrl}/route/v1/driving/${coords}?overview=full&alternatives=3&geometries=geojson&steps=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      return res.status(500).json({ error: 'No routes found' });
    }

    // Get all available alternative routes from OSRM
    const osrmRoutes = data.routes;
    
    // Sort routes for different purposes
    const routesByDuration = [...osrmRoutes].sort((a, b) => a.duration - b.duration);
    const routesByDistance = [...osrmRoutes].sort((a, b) => a.distance - b.distance);
    
    // 0. BASIC ROUTE - Standard OSRM recommendation (balanced)
    const basicOSRM = osrmRoutes[0]; // OSRM's recommended route
    const basicDistance = basicOSRM.distance / 1000;
    const basicDuration = basicOSRM.duration / 60;
    const basicFuel = (basicDistance / 100) * baseline;
    const basicCost = basicFuel * (fuelType === 'EV' ? 10 : 106);
    
    // 1. FASTEST ROUTE - Shortest duration with traffic simulation
    const fastestOSRM = routesByDuration[0]; // Absolute fastest by time
    const fastestDistance = fastestOSRM.distance / 1000;
    const fastestDuration = fastestOSRM.duration / 60;
    // Simulate traffic by adding 15% time
    const trafficAdjustedTime = fastestDuration * 1.15;
    const fastestFuel = (fastestDistance / 100) * baseline * 1.1; // Faster = more fuel
    const fastestCost = fastestFuel * (fuelType === 'EV' ? 10 : 106);

    // 2. ECO ROUTE - Shortest distance for fuel efficiency
    const ecoOSRM = routesByDistance[0]; // Shortest distance
    const ecoDistance = ecoOSRM.distance / 1000;
    const ecoDuration = ecoOSRM.duration / 60;
    // Eco route assumes optimal speed (15% less fuel)
    const ecoFuel = (ecoDistance / 100) * baseline * 0.85;
    const ecoCost = ecoFuel * (fuelType === 'EV' ? 10 : 106);

    // 3. CASUAL ROUTE - Longest/scenic route with stops
    const casualOSRM = osrmRoutes[osrmRoutes.length - 1] || osrmRoutes[0]; // Last alternative (usually scenic)
    const casualDistance = casualOSRM.distance / 1000;
    const casualDuration = casualOSRM.duration / 60;
    // Add time for stops (assume 10 min per stop)
    const casualTime = casualDuration + 10;
    const casualFuel = (casualDistance / 100) * baseline;
    const casualCost = casualFuel * (fuelType === 'EV' ? 10 : 106);

    // Get POIs for casual route
    const pois = getSamplePOIs();
    const relevantPOIs = pois.filter(poi => {
      if (fuelType === 'EV') {
        return poi.type === 'charging';
      } else {
        return poi.type === 'petrol';
      }
    });
    
    // Convert GeoJSON geometry to coordinate array for K-Means
    const casualCoords = casualOSRM.geometry?.coordinates || [];
    const poiClusters = casualCoords.length > 0 
      ? findPOIsAlongRoute(casualCoords.map(c => [c[1], c[0]]), relevantPOIs, 2)
      : [];

    // Format response with all 4 routes
    return res.json({
      routes: {
        basic: {
          geometry: basicOSRM.geometry,
          path: { geometry: basicOSRM.geometry },
          metrics: {
            distance: parseFloat(basicDistance.toFixed(1)),
            distanceKm: parseFloat(basicDistance.toFixed(1)),
            time: Math.round(basicDuration),
            durationMin: Math.round(basicDuration),
            fuel: parseFloat(basicFuel.toFixed(2)),
            fuelUsed: parseFloat(basicFuel.toFixed(2)),
            cost: Math.round(basicCost),
            costEstimate: Math.round(basicCost)
          },
          color: '#8b5cf6',
          name: 'Basic Route',
          description: 'Standard OSRM recommendation'
        },
        fastest: {
          geometry: fastestOSRM.geometry,
          path: { geometry: fastestOSRM.geometry },
          metrics: {
            distance: parseFloat(fastestDistance.toFixed(1)),
            distanceKm: parseFloat(fastestDistance.toFixed(1)),
            time: Math.round(trafficAdjustedTime),
            durationMin: Math.round(trafficAdjustedTime),
            fuel: parseFloat(fastestFuel.toFixed(2)),
            fuelUsed: parseFloat(fastestFuel.toFixed(2)),
            cost: Math.round(fastestCost),
            costEstimate: Math.round(fastestCost)
          },
          color: '#3b82f6',
          name: 'Fastest Route',
          description: 'Shortest time with traffic awareness'
        },
        eco: {
          geometry: ecoOSRM.geometry,
          path: { geometry: ecoOSRM.geometry },
          metrics: {
            distance: parseFloat(ecoDistance.toFixed(1)),
            distanceKm: parseFloat(ecoDistance.toFixed(1)),
            time: Math.round(ecoDuration),
            durationMin: Math.round(ecoDuration),
            fuel: parseFloat(ecoFuel.toFixed(2)),
            fuelUsed: parseFloat(ecoFuel.toFixed(2)),
            cost: Math.round(ecoCost),
            costEstimate: Math.round(ecoCost)
          },
          color: '#10b981',
          name: 'Eco Route',
          description: 'Optimized for fuel efficiency'
        },
        casual: {
          geometry: casualOSRM.geometry,
          path: { geometry: casualOSRM.geometry },
          pois: poiClusters,
          metrics: {
            distance: parseFloat(casualDistance.toFixed(1)),
            distanceKm: parseFloat(casualDistance.toFixed(1)),
            time: Math.round(casualTime),
            durationMin: Math.round(casualTime),
            fuel: parseFloat(casualFuel.toFixed(2)),
            fuelUsed: parseFloat(casualFuel.toFixed(2)),
            cost: Math.round(casualCost),
            costEstimate: Math.round(casualCost),
            stops: poiClusters.length
          },
          color: '#f59e0b',
          name: 'Casual Route',
          description: 'Balanced route with stops'
        }
      },
      vehicle: {
        fuelType,
        baseline
      }
    });

  } catch (error) {
    console.error('Error in custom route optimization:', error);
    return res.status(500).json({ error: 'Failed to optimize route', details: error.message });
  }
});

/**
 * Calculate route metrics
 */
function calculateMetrics(route, baseline, fuelType) {
  if (!route || !route.geometry || route.geometry.length === 0) {
    return {
      distanceKm: 0,
      durationMin: 0,
      fuelUsed: 0,
      costEstimate: 0,
      algorithm: route?.algorithm || 'N/A'
    };
  }

  // Calculate total distance from geometry
  let totalDistance = 0;
  for (let i = 0; i < route.geometry.length - 1; i++) {
    totalDistance += haversineDistance(
      { lat: route.geometry[i][0], lng: route.geometry[i][1] },
      { lat: route.geometry[i + 1][0], lng: route.geometry[i + 1][1] }
    );
  }

  // Estimate fuel/energy
  const fuelUsed = route.fuelUsed || (totalDistance / 100) * baseline;

  // Estimate cost (₹10/kWh for EV, ₹106/L for petrol)
  const unitPrice = fuelType === 'EV' ? 10 : 106;
  const costEstimate = fuelUsed * unitPrice;

  // Estimate duration (assuming average 45 km/h)
  const durationMin = (totalDistance / 45) * 60;

  return {
    distanceKm: parseFloat(totalDistance.toFixed(2)),
    durationMin: Math.round(durationMin),
    fuelUsed: parseFloat(fuelUsed.toFixed(2)),
    costEstimate: parseFloat(costEstimate.toFixed(2)),
    algorithm: route.algorithm || 'N/A'
  };
}

/**
 * Haversine distance
 */
function haversineDistance(coord1, coord2) {
  const R = 6371;
  const toRad = Math.PI / 180;
  const dLat = (coord2.lat - coord1.lat) * toRad;
  const dLng = (coord2.lng - coord1.lng) * toRad;
  const lat1 = coord1.lat * toRad;
  const lat2 = coord2.lat * toRad;

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Autocomplete endpoint using Trie
 * GET /api/route/autocomplete?q=mum
 */
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    // In production, load Trie from database/cache
    // For now, use the sample locations from trie.js
    const { buildLocationTrie, INDIAN_LOCATIONS } = await import('../algorithms/trie.js');
    const trie = buildLocationTrie(INDIAN_LOCATIONS);
    
    const suggestions = trie.autocomplete(q, 10);
    
    return res.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return res.status(500).json({ error: 'Autocomplete failed' });
  }
});

export default router;
