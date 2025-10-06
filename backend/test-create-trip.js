// Test script to manually create a trip
// Run with: node test-create-trip.js

import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'fueloptimizer';

async function createTestTrip() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Get first user
    const user = await db.collection('users').findOne({});
    if (!user) {
      console.error('❌ No users found in database');
      return;
    }
    
    console.log('👤 Found user:', user.email, 'with userId:', user.userId);
    
    // Get first vehicle
    const vehicle = await db.collection('vehicles').findOne({});
    if (!vehicle) {
      console.error('❌ No vehicles found in database');
      return;
    }
    
    console.log('🚗 Found vehicle:', vehicle.make, vehicle.model);
    
    // Create test trip
    const testTrip = {
      tripId: 'test-trip-' + Date.now(),
      vehicleId: vehicle._id.toString(),
      userId: user.userId,
      routeId: 'fastest',
      startTime: new Date(Date.now() - 3600000), // 1 hour ago
      endTime: new Date(),
      distanceKm: 15.5,
      plannedDistanceKm: 15.0,
      extraDistanceKm: 0.5,
      routeAdherence: 96.7,
      durationSec: 1800, // 30 minutes
      avgSpeed: 31.0,
      maxSpeed: 60.0,
      estimatedUsed: 1.2,
      fuelSaved: 0.3,
      efficiencyScore: 85,
      drivingBehavior: {
        speedScore: 90,
        smoothnessScore: 80,
        deviationScore: 85,
        optimalSpeedPercentage: 75,
        highSpeedPercentage: 5,
        harshAccelCount: 2
      },
      fuelType: vehicle.fuelType || 'ICE',
      createdAt: new Date()
    };
    
    const result = await db.collection('trips').insertOne(testTrip);
    console.log('✅ Test trip created with ID:', result.insertedId);
    console.log('   Trip details:', {
      userId: testTrip.userId,
      vehicleId: testTrip.vehicleId,
      distance: testTrip.distanceKm,
      efficiency: testTrip.efficiencyScore
    });
    
    // Verify it can be queried
    const foundTrip = await db.collection('trips').findOne({ userId: user.userId });
    console.log('✅ Trip can be queried:', foundTrip ? 'YES' : 'NO');
    
    if (foundTrip) {
      console.log('   Found trip ID:', foundTrip._id);
      console.log('   User ID matches:', foundTrip.userId === user.userId);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestTrip();
