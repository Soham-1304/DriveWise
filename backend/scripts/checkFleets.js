import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function checkFleets() {
  await client.connect();
  const db = client.db();

  console.log('\n=== Fleets ===');
  const fleets = await db.collection('fleets').find({}).sort({createdAt: -1}).limit(10).toArray();
  fleets.forEach(f => {
    console.log(`Fleet: ${f.name || f.companyName}`);
    console.log(`  ID: ${f._id}`);
    console.log(`  Code: ${f.code}`);
    console.log(`  Admin: ${f.adminUserId}`);
    console.log('');
  });

  // Check specific fleets
  console.log('=== Checking Bharath Admin Fleet ===');
  const bharathFleet = await db.collection('fleets').findOne({ 
    _id: new ObjectId('68e3da9e24518a1f79f57874') 
  });
  console.log('Bharath fleet:', JSON.stringify(bharathFleet, null, 2));

  console.log('\n=== Checking Rayan Driver Fleet ===');
  const rayanFleet = await db.collection('fleets').findOne({ 
    _id: new ObjectId('68e259f9aa1ff6f282d6291b') 
  });
  console.log('Rayan fleet:', JSON.stringify(rayanFleet, null, 2));

  await client.close();
}

checkFleets();
