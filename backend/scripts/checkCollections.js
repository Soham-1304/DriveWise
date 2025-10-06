import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('fueloptimizer');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check trips
    const tripCount = await db.collection('trips').countDocuments();
    console.log(`\nTotal trips: ${tripCount}`);
    
    if (tripCount > 0) {
      // Get unique fleetIds
      const fleetIds = await db.collection('trips').distinct('fleetId');
      console.log('Fleet IDs in trips:', fleetIds);
      
      // Get sample trip
      const sample = await db.collection('trips').findOne();
      console.log('\nSample trip:', JSON.stringify(sample, null, 2).substring(0, 500));
    }
    
    // Check users
    const users = await db.collection('users').find({}).toArray();
    console.log(`\nUsers (${users.length}):`, users.map(u => ({ email: u.email, role: u.role, fleetId: u.fleetId })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkCollections().catch(console.error);
