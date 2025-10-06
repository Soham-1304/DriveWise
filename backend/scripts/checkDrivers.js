import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkDrivers() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('fueloptimizer');
    
    console.log('👥 Checking drivers...\n');
    
    // Check users collection
    const users = await db.collection('users').find({}).toArray();
    console.log(`Users in collection (${users.length}):`);
    users.forEach(u => {
      console.log(`  - ${u.userId} (${u.email}) - ${u.role} - Fleet: ${u.fleetId}`);
    });
    
    // Check trips to see what userIds exist
    console.log('\n📊 Checking trips for driver userIds...');
    const driverIds = await db.collection('trips').distinct('userId');
    console.log(`\nUnique driver userIds in trips (${driverIds.length}):`);
    driverIds.forEach(id => console.log(`  - ${id}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkDrivers().catch(console.error);
