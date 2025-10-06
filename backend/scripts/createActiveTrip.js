/**
 * Create an active trip with real-time telemetry for demo
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function createActiveTrip() {
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db();
    
    // Find a vehicle assigned to soham_driver
    const vehicle = await db.collection('vehicles').findOne({ 
      userId: 'soham_driver',
      fleetId: 'demo_fleet_001'
    });
    
    if (!vehicle) {
      console.log('⚠️ No vehicle found for soham_driver');
      console.log('Creating vehicle assignment...');
      
      // Update a vehicle to assign it to the driver
      await db.collection('vehicles').updateOne(
        { _id: 'vehicle_001' },
        { $set: { userId: 'soham_driver' } }
      );
      
      console.log('✓ Assigned vehicle_001 to soham_driver');
    }
    
    const vehicleId = vehicle?._id || 'vehicle_001';
    const tripId = `trip_active_${Date.now()}`;
    
    // Create active trip in trips_raw
    const startTime = new Date(Date.now() - 5 * 60 * 1000); // Started 5 minutes ago
    
    const activeTrip = {
      _id: tripId,
      vehicleId: vehicleId,
      userId: 'soham_driver',
      fleetId: 'demo_fleet_001',
      status: 'running',
      startTime: startTime,
      routeId: 'route_eco_001',
      routeType: 'eco',
      plannedDistance: 35.5,
      startLocation: 'Thane, Mumbai',
      endLocation: 'Badlapur, Mumbai'
    };
    
    await db.collection('trips_raw').insertOne(activeTrip);
    console.log(`✓ Created active trip: ${tripId}`);
    
    // Generate telemetry path from Thane to Badlapur
    const telemetryPoints = [];
    const startLat = 19.2183;  // Thane
    const startLng = 72.9781;
    const endLat = 19.1559;    // Badlapur
    const endLng = 73.2650;
    
    // Create 20 telemetry points along the route
    const numPoints = 20;
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;
      
      // Add some realistic variation
      const latNoise = (Math.random() - 0.5) * 0.002;
      const lngNoise = (Math.random() - 0.5) * 0.002;
      
      const point = {
        tripId: tripId,
        lat: lat + latNoise,
        lng: lng + lngNoise,
        speed: 35 + Math.random() * 25, // 35-60 km/h
        heading: Math.atan2(endLng - startLng, endLat - startLat) * 180 / Math.PI,
        createdAt: new Date(startTime.getTime() + i * 15000) // 15 sec intervals
      };
      
      telemetryPoints.push(point);
    }
    
    await db.collection('telemetry').insertMany(telemetryPoints);
    console.log(`✓ Created ${telemetryPoints.length} telemetry points`);
    
    console.log('\n📊 Active Trip Summary:');
    console.log(`   Trip ID: ${tripId}`);
    console.log(`   Vehicle: ${vehicleId}`);
    console.log(`   Driver: soham_driver (Soham Karandikar)`);
    console.log(`   Route: Thane → Badlapur (35.5 km)`);
    console.log(`   Duration: 5 minutes (ongoing)`);
    console.log(`   Telemetry Points: ${telemetryPoints.length}`);
    console.log(`   Current Position: ${telemetryPoints[telemetryPoints.length-1].lat.toFixed(4)}, ${telemetryPoints[telemetryPoints.length-1].lng.toFixed(4)}`);
    console.log('\n✅ Active trip created! Refresh the Live Tracking page to see it.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createActiveTrip();
