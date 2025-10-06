import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // Check all users
    const users = await db.collection('users').find({}).toArray();
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    if (users.length > 0) {
      console.log('User details:');
      users.forEach(user => {
        console.log(`  - userId: ${user.userId || user._id}`);
        console.log(`    email: ${user.email}`);
        console.log(`    name: ${user.name}`);
        console.log(`    role: ${user.role}`);
        console.log(`    fleetId: ${user.fleetId}`);
        console.log('');
      });
    }
    
    // Check fleets
    const fleets = await db.collection('fleets').find({}).toArray();
    console.log(`\n🚚 Total fleets: ${fleets.length}`);
    fleets.forEach(f => console.log(`  - ${f._id} (${f.code}) - ${f.name}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected');
  }
}

checkUsers();
