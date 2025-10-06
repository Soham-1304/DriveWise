/**
 * Assign trips to driver for demo
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function assignTripsToDriver() {
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db();
    
    // Get total trips
    const totalTrips = await db.collection('trips').countDocuments({ 
      fleetId: 'demo_fleet_001' 
    });
    
    console.log(`\nFound ${totalTrips} trips in demo_fleet_001`);
    
    // Split trips between admin and driver (70% to driver, 30% to admin)
    const driverTripCount = Math.floor(totalTrips * 0.7);
    
    // Get random trips to assign to driver
    const allTrips = await db.collection('trips')
      .find({ fleetId: 'demo_fleet_001' })
      .toArray();
    
    // Shuffle and split
    const shuffled = allTrips.sort(() => 0.5 - Math.random());
    const driverTrips = shuffled.slice(0, driverTripCount);
    const driverTripIds = driverTrips.map(t => t._id);
    
    // Update trips to assign to driver
    const result = await db.collection('trips').updateMany(
      { _id: { $in: driverTripIds } },
      { $set: { userId: 'soham_driver' } }
    );
    
    console.log(`✓ Assigned ${result.modifiedCount} trips to soham_driver`);
    console.log(`✓ Remaining ${totalTrips - result.modifiedCount} trips stay with soham_dev (admin)`);
    
    // Update driver stats
    const driverTripsData = await db.collection('trips').aggregate([
      { $match: { userId: 'soham_driver' } },
      { $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalDistance: { $sum: '$distanceKm' },
        avgEfficiency: { $avg: '$efficiency' },
        totalFuelSaved: { $sum: '$fuelSavedLiters' }
      }}
    ]).toArray();
    
    const stats = driverTripsData[0] || {
      totalTrips: 0,
      totalDistance: 0,
      avgEfficiency: 0,
      totalFuelSaved: 0
    };
    
    await db.collection('users').updateOne(
      { userId: 'soham_driver' },
      { $set: { driverStats: stats } }
    );
    
    console.log('\n📊 Driver Stats Updated:');
    console.log(`   Total Trips: ${stats.totalTrips}`);
    console.log(`   Total Distance: ${stats.totalDistance?.toFixed(1) || 0} km`);
    console.log(`   Avg Efficiency: ${stats.avgEfficiency?.toFixed(1) || 0}%`);
    console.log(`   Total Fuel Saved: ${stats.totalFuelSaved?.toFixed(1) || 0}L`);
    
    console.log('\n✅ Trips assigned! Driver rankings should now show data.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

assignTripsToDriver();
