import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

const router = express.Router();

// Haversine distance calculation
function haversine(coord1, coord2) {
  const R = 6371; // Earth's radius in km
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

// Start a new trip
router.post('/start', async (req, res) => {
  try {
    const db = await getDb();
    const { vehicleId, name, routeId, plannedDistance, startFuelLevel, startCoords } = req.body;
    
    const trip = {
      vehicleId,
      userId: req.user.uid,
      name: name || 'Untitled Trip',
      routeId, // Store which route type was selected (fastest/eco/casual/basic)
      plannedDistance: plannedDistance || 0, // Store planned distance for comparison
      startTime: new Date(),
      startFuelLevel: startFuelLevel || 100,
      startCoords,
      status: 'running',
      createdAt: new Date()
    };
    
    const result = await db.collection('trips_raw').insertOne(trip);
    return res.json({ tripId: result.insertedId.toString() });
  } catch (error) {
    console.error('Error starting trip:', error);
    return res.status(500).json({ error: 'Failed to start trip' });
  }
});

// Ingest telemetry data
router.post('/telemetry', async (req, res) => {
  try {
    const db = await getDb();
    const { tripId, points } = req.body;
    
    if (!Array.isArray(points) || !tripId || points.length === 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    const docs = points.map(p => ({
      tripId,
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lng),
      speed: p.speed ? parseFloat(p.speed) : 0,
      createdAt: new Date(p.ts || Date.now())
    }));
    
    await db.collection('telemetry').insertMany(docs);
    return res.json({ inserted: docs.length });
  } catch (error) {
    console.error('Error inserting telemetry:', error);
    return res.status(500).json({ error: 'Failed to insert telemetry' });
  }
});

// End a trip and compute summary
router.post('/end', async (req, res) => {
  try {
    const db = await getDb();
    const { tripId, vehicleId, endFuelLevel, endCoords } = req.body;
    
    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }
    
    console.log('🏁 Ending trip:', tripId);
    
    // Get trip metadata
    const tripRaw = await db.collection('trips_raw').findOne({ 
      _id: new ObjectId(tripId) 
    });
    
    console.log('📋 Trip raw data found:', tripRaw ? 'YES' : 'NO');
    
    // Fetch telemetry points
    const points = await db.collection('telemetry')
      .find({ tripId })
      .sort({ createdAt: 1 })
      .toArray();
    
    console.log(`📡 Telemetry points found: ${points.length}`);
    
    // If we have telemetry data, compute detailed summary
    if (points.length >= 2) {
      // Compute distance via haversine
      let dist = 0;
      let maxSpeed = 0;
      let speeds = [];
      
      for (let i = 1; i < points.length; i++) {
        dist += haversine(points[i - 1], points[i]);
        if (points[i].speed) {
          speeds.push(points[i].speed);
          maxSpeed = Math.max(maxSpeed, points[i].speed);
        }
      }
      
      const duration = (new Date(points[points.length - 1].createdAt) - new Date(points[0].createdAt)) / 1000;
      
      // Load vehicle baseline
      const vehicle = await db.collection('vehicles').findOne({ 
        _id: vehicleId 
      });
      
      const baseline = vehicle?.baselineConsumption || (vehicle?.fuelType === 'EV' ? 15 : 6.5);
      const plannedDistance = tripRaw?.plannedDistance || 0;
      
      // Calculate route deviation
      const extraDistance = Math.max(0, dist - plannedDistance);
      const routeAdherence = plannedDistance > 0 ? (plannedDistance / dist) * 100 : 100;
      
      // Analyze driving behavior
      const avgSpeed = dist / (duration / 3600 || 1);
      const optimalSpeedPoints = speeds.filter(s => s >= 40 && s <= 60).length;
      const highSpeedPoints = speeds.filter(s => s > 80).length;
      const lowSpeedPoints = speeds.filter(s => s > 0 && s < 20).length;
      
      // Speed efficiency factor
      const speedFactor = avgSpeed > 80 ? 1.15 : 
                         avgSpeed > 60 ? 1.0 : 
                         avgSpeed > 40 ? 0.95 : 
                         avgSpeed > 20 ? 1.05 : 1.2;
      
      // Calculate acceleration variance (smooth driving indicator)
      let accelVariance = 0;
      for (let i = 1; i < speeds.length; i++) {
        accelVariance += Math.abs(speeds[i] - speeds[i-1]);
      }
      accelVariance = speeds.length > 1 ? accelVariance / speeds.length : 0;
      
      // Driving behavior score components
      const speedScore = (optimalSpeedPoints / Math.max(1, speeds.length)) * 100;
      const smoothnessScore = Math.max(0, 100 - (accelVariance * 2));
      const deviationScore = Math.max(0, 100 - (extraDistance * 5));
      
      // Overall efficiency score (weighted average)
      const efficiencyScore = Math.round(
        speedScore * 0.4 + 
        smoothnessScore * 0.4 + 
        deviationScore * 0.2
      );
      
      // Estimate energy/fuel used
      const estimatedUsed = baseline * (dist / 100) * speedFactor;
      
      // Calculate potential savings vs worst-case
      const worstCaseUsed = baseline * (dist / 100) * 1.3; // 30% worse
      const fuelSaved = worstCaseUsed - estimatedUsed;
      
      const tripSummary = {
        tripId,
        vehicleId,
        userId: req.user.uid,
        routeId: tripRaw?.routeId || 'unknown',
        startTime: points[0].createdAt,
        endTime: points[points.length - 1].createdAt,
        
        // Distance metrics
        distanceKm: parseFloat(dist.toFixed(2)),
        plannedDistanceKm: parseFloat(plannedDistance.toFixed(2)),
        extraDistanceKm: parseFloat(extraDistance.toFixed(2)),
        routeAdherence: parseFloat(routeAdherence.toFixed(1)),
        
        // Time metrics
        durationSec: duration,
        
        // Speed metrics
        avgSpeed: parseFloat(avgSpeed.toFixed(2)),
        maxSpeed: parseFloat(maxSpeed.toFixed(2)),
        
        // Efficiency metrics
        estimatedUsed: parseFloat(estimatedUsed.toFixed(2)),
        fuelSaved: parseFloat(fuelSaved.toFixed(2)),
        efficiencyScore: Math.max(0, Math.min(100, efficiencyScore)),
        
        // Driving behavior breakdown
        drivingBehavior: {
          speedScore: Math.round(speedScore),
          smoothnessScore: Math.round(smoothnessScore),
          deviationScore: Math.round(deviationScore),
          optimalSpeedPercentage: parseFloat(((optimalSpeedPoints / Math.max(1, speeds.length)) * 100).toFixed(1)),
          highSpeedPercentage: parseFloat(((highSpeedPoints / Math.max(1, speeds.length)) * 100).toFixed(1)),
          harshAccelCount: Math.round(accelVariance)
        },
        
        fuelType: vehicle?.fuelType || 'ICE',
        createdAt: new Date()
      };
      
      await db.collection('trips').insertOne(tripSummary);
      await db.collection('trips_raw').updateOne(
        { _id: new ObjectId(tripId) },
        { $set: { status: 'finished', endTime: new Date() } }
      );
      
      console.log('✅ Trip completed with analytics:', {
        distance: tripSummary.distanceKm,
        efficiency: tripSummary.efficiencyScore,
        deviation: tripSummary.extraDistanceKm
      });
      
      return res.json({ trip: tripSummary });
    } else {
      // No telemetry data - create minimal trip summary
      console.log('⚠️ No telemetry data, creating minimal trip summary');
      
      const vehicle = await db.collection('vehicles').findOne({ 
        _id: vehicleId 
      });
      
      const minimalTrip = {
        tripId,
        vehicleId,
        userId: req.user.uid,
        routeId: tripRaw?.routeId || 'unknown',
        startTime: tripRaw?.startTime || new Date(),
        endTime: new Date(),
        distanceKm: 0,
        plannedDistanceKm: tripRaw?.plannedDistance || 0,
        extraDistanceKm: 0,
        routeAdherence: 100,
        durationSec: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        estimatedUsed: 0,
        fuelSaved: 0,
        efficiencyScore: 50, // Default score
        drivingBehavior: {
          speedScore: 50,
          smoothnessScore: 50,
          deviationScore: 50,
          optimalSpeedPercentage: 0,
          highSpeedPercentage: 0,
          harshAccelCount: 0
        },
        fuelType: vehicle?.fuelType || 'ICE',
        createdAt: new Date()
      };
      
      await db.collection('trips').insertOne(minimalTrip);
      await db.collection('trips_raw').updateOne(
        { _id: new ObjectId(tripId) },
        { $set: { status: 'finished', endTime: new Date(), endFuelLevel, endCoords } }
      );
      
      console.log('✅ Minimal trip summary created');
      
      return res.json({ 
        trip: minimalTrip,
        message: 'Trip ended successfully (minimal data - no GPS tracking)'
      });
    }
  } catch (error) {
    console.error('Error ending trip:', error);
    return res.status(500).json({ error: 'Failed to end trip' });
  }
});

// Get active (running) trips
router.get('/active', async (req, res) => {
  try {
    const db = await getDb();
    
    // Get user profile to find fleetId
    const userProfile = await db.collection('users').findOne({ userId: req.user.uid });
    
    if (!userProfile || userProfile.role !== 'fleet_admin') {
      return res.status(403).json({ error: 'Only fleet admins can view active trips' });
    }

    // Get all vehicles in fleet
    const vehicles = await db.collection('vehicles')
      .find({ fleetId: userProfile.fleetId, status: { $ne: 'deleted' } })
      .toArray();

    const vehicleIds = vehicles.map(v => v._id.toString());

    // Find all running trips for these vehicles
    const activeTrips = await db.collection('trips_raw')
      .find({ 
        vehicleId: { $in: vehicleIds },
        status: 'running'
      })
      .sort({ startTime: -1 })
      .toArray();

    // Enhance with telemetry path and vehicle/driver info
    const tripsWithDetails = await Promise.all(activeTrips.map(async (trip) => {
      // Get ALL telemetry points for this trip (for path drawing)
      const telemetryPoints = await db.collection('telemetry')
        .find({ tripId: trip._id.toString() })
        .sort({ createdAt: 1 })
        .toArray();

      // Get latest telemetry point
      const latestPoint = telemetryPoints.length > 0 
        ? telemetryPoints[telemetryPoints.length - 1]
        : null;

      // Calculate distance from telemetry
      let totalDistance = 0;
      for (let i = 1; i < telemetryPoints.length; i++) {
        const prev = telemetryPoints[i - 1];
        const curr = telemetryPoints[i];
        const dist = Math.sqrt(
          Math.pow(curr.lat - prev.lat, 2) + 
          Math.pow(curr.lng - prev.lng, 2)
        ) * 111; // Rough km conversion
        totalDistance += dist;
      }

      // Get vehicle info
      const vehicle = vehicles.find(v => v._id.toString() === trip.vehicleId);

      // Get driver info - check both userId and assignedDriverId for compatibility
      const driverId = vehicle?.userId || vehicle?.assignedDriverId;
      const driver = driverId 
        ? await db.collection('users').findOne({ userId: driverId })
        : null;

      // Build route path from telemetry
      const routePath = telemetryPoints.map(p => [p.lat, p.lng]);

      return {
        ...trip,
        lastPosition: latestPoint ? { lat: latestPoint.lat, lng: latestPoint.lng } : null,
        startPosition: telemetryPoints.length > 0 ? { lat: telemetryPoints[0].lat, lng: telemetryPoints[0].lng } : null,
        currentSpeed: latestPoint?.speed || 0,
        vehicleName: vehicle ? `${vehicle.name || vehicle.make} ${vehicle.model}` : 'Unknown Vehicle',
        driverName: driver?.name || driver?.email || 'Unknown Driver',
        currentDistance: totalDistance,
        currentFuelUsed: totalDistance * (vehicle?.baselineConsumption || vehicle?.fuelConsumption || 0.08),
        currentEfficiency: 100, // Will be calculated on trip end
        routePath: routePath,
        telemetryCount: telemetryPoints.length
      };
    }));

    return res.json({ trips: tripsWithDetails });
  } catch (error) {
    console.error('Error fetching active trips:', error);
    return res.status(500).json({ error: 'Failed to fetch active trips' });
  }
});

// Get all trips for a user
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { vehicleId, limit = 20 } = req.query;
    
    console.log('🔍 Fetching trips for user:', req.user.uid, 'Role:', req.user.role);
    
    // Fleet admins see all fleet data, drivers see only their data
    const filter = {};
    if (req.user.role === 'fleet_admin' && req.user.fleetId) {
      filter.fleetId = req.user.fleetId;
      console.log('🏢 Fleet admin - filtering by fleetId:', req.user.fleetId);
    } else {
      filter.userId = req.user.uid;
      console.log('👤 Driver - filtering by userId:', req.user.uid);
    }
    
    if (vehicleId) {
      filter.vehicleId = vehicleId;
    }
    
    console.log('🔍 Filter:', JSON.stringify(filter));
    
    const trips = await db.collection('trips')
      .find(filter)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    console.log(`📊 Found ${trips.length} trips`);
    
    return res.json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get trip details
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const trip = await db.collection('trips').findOne({
      _id: new ObjectId(req.params.id),
      userId: req.user.uid
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Get telemetry points
    const points = await db.collection('telemetry')
      .find({ tripId: trip.tripId })
      .sort({ createdAt: 1 })
      .toArray();
    
    return res.json({ ...trip, routePoints: points });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Debug endpoint - get all trips (remove in production)
router.get('/debug/all', async (req, res) => {
  try {
    const db = await getDb();
    const allTrips = await db.collection('trips')
      .find({})
      .limit(10)
      .toArray();
    
    console.log('🔍 DEBUG: Total trips in DB:', allTrips.length);
    allTrips.forEach(trip => {
      console.log(`  - Trip ${trip._id}: userId=${trip.userId}, vehicleId=${trip.vehicleId}`);
    });
    
    return res.json({ 
      totalTrips: allTrips.length,
      trips: allTrips,
      currentUser: req.user.uid
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch debug data' });
  }
});

// Get trip statistics for a specific driver (for fleet admin)
router.get('/driver/:driverId', async (req, res) => {
  try {
    const db = await getDb();
    const { driverId } = req.params;
    
    // Verify user is a fleet admin
    const userProfile = await db.collection('users').findOne({ userId: req.user.uid });
    if (!userProfile || userProfile.role !== 'fleet_admin') {
      return res.status(403).json({ error: 'Only fleet admins can view driver trips' });
    }

    // Verify driver belongs to same fleet
    const driverProfile = await db.collection('users').findOne({ userId: driverId });
    if (!driverProfile || driverProfile.fleetId !== userProfile.fleetId) {
      return res.status(403).json({ error: 'Driver not in your fleet' });
    }

    // Count active trips
    const activeTrips = await db.collection('trips_raw')
      .countDocuments({ userId: driverId, status: 'running' });

    // Count completed trips
    const totalTrips = await db.collection('trips')
      .countDocuments({ userId: driverId });

    // Get all completed trips for this driver
    const trips = await db.collection('trips')
      .find({ userId: driverId })
      .sort({ startTime: -1 })
      .limit(100)
      .toArray();

    return res.json({ 
      totalTrips, 
      activeTrips,
      trips 
    });
  } catch (error) {
    console.error('Error fetching driver trips:', error);
    return res.status(500).json({ error: 'Failed to fetch driver trips' });
  }
});

export default router;
