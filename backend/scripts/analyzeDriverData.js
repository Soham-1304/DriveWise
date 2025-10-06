import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function analyzeDriverData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('fueloptimizer');
    
    console.log('📊 Analyzing Driver Data...\n');
    
    // Get sample trip
    const sampleTrip = await db.collection('trips').findOne({ fleetId: 'demo_fleet_001' });
    console.log('Sample Trip Structure:');
    console.log(JSON.stringify(sampleTrip, null, 2));
    
    console.log('\n---\n');
    
    // Get driver statistics
    const driverStats = await db.collection('trips').aggregate([
      { $match: { fleetId: 'demo_fleet_001' } },
      { $group: {
        _id: '$driverId',
        driverName: { $first: '$driverName' },
        totalTrips: { $sum: 1 },
        totalDistance: { $sum: '$distance' },
        totalFuel: { $sum: '$fuelUsed' },
        avgEfficiency: { $avg: '$efficiencyScore' },
        vehicles: { $addToSet: '$vehicleId' }
      }},
      { $sort: { totalTrips: -1 } }
    ]).toArray();
    
    console.log('Driver Statistics:');
    driverStats.forEach(stat => {
      console.log(`\n${stat.driverName || stat._id}:`);
      console.log(`  - Trips: ${stat.totalTrips}`);
      console.log(`  - Distance: ${stat.totalDistance.toFixed(1)} km`);
      console.log(`  - Fuel Used: ${stat.totalFuel.toFixed(2)} L`);
      console.log(`  - Avg Efficiency: ${stat.avgEfficiency.toFixed(1)}%`);
      console.log(`  - Vehicles Used: ${stat.vehicles.length}`);
    });
    
    console.log('\n---\n');
    
    // Get vehicle assignments
    const vehicleData = await db.collection('trips').aggregate([
      { $match: { fleetId: 'demo_fleet_001' } },
      { $group: {
        _id: { driverId: '$driverId', vehicleId: '$vehicleId' },
        driverName: { $first: '$driverName' },
        vehicleName: { $first: '$vehicleName' },
        trips: { $sum: 1 }
      }},
      { $sort: { trips: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    console.log('Top Driver-Vehicle Assignments:');
    vehicleData.forEach(v => {
      console.log(`${v.driverName} → ${v.vehicleName}: ${v.trips} trips`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

analyzeDriverData().catch(console.error);
