import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function verifyFleetMove() {
  await client.connect();
  const db = client.db();

  console.log('\n=== Verification ===');
  
  const driver = await db.collection('users').findOne({ email: 'rayannn@test.com' });
  const admin = await db.collection('users').findOne({ email: 'bharath@gmail.com' });
  
  console.log(`Rayan (driver) fleet ID: ${driver?.fleetId}`);
  console.log(`Bharath (admin) fleet ID: ${admin?.fleetId}`);
  
  if (driver?.fleetId === admin?.fleetId) {
    console.log('\n✅ SUCCESS! Rayan is now in Bharath\'s fleet!');
    console.log('\nBharath should now see Rayan in the Drivers panel.');
  } else {
    console.log('\n❌ MISMATCH! They are still in different fleets.');
  }

  await client.close();
}

verifyFleetMove();
