import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkFleetData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('fueloptimizer');
    
    console.log('🏢 Checking fleet data...\n');
    
    // Check fleets collection
    const fleets = await db.collection('fleets').find({}).toArray();
    console.log(`Fleets (${fleets.length}):`);
    fleets.forEach(f => {
      console.log(`  - ID: ${f._id || f.fleetId}`);
      console.log(`    Name: ${f.name}`);
      console.log(`    Code: ${f.code}`);
      console.log(`    Admin: ${f.adminUserId}`);
      console.log('');
    });
    
    // Check trips to see what fleetId they use
    const fleetIds = await db.collection('trips').distinct('fleetId');
    console.log(`Fleet IDs used in trips: ${fleetIds.join(', ')}`);
    
    // Check vehicles
    const vehicleFleetIds = await db.collection('vehicles').distinct('fleetId');
    console.log(`Fleet IDs used in vehicles: ${vehicleFleetIds.join(', ')}`);
    
    // Check users
    const userFleetIds = await db.collection('users').distinct('fleetId');
    console.log(`Fleet IDs used in users: ${userFleetIds.join(', ')}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkFleetData().catch(console.error);
