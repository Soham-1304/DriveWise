import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function moveDriverToFleet() {
  await client.connect();
  const db = client.db();

  const driverEmail = 'rayannn@test.com';
  const targetFleetId = '68e3da9e24518a1f79f57874'; // Bharath's fleet

  console.log('\n🔄 Moving driver to correct fleet...');
  
  // Update driver's fleetId
  const result = await db.collection('users').updateOne(
    { email: driverEmail },
    { $set: { fleetId: targetFleetId } }
  );

  if (result.modifiedCount > 0) {
    console.log(`✅ Successfully moved ${driverEmail} to fleet ${targetFleetId}`);
    
    // Show updated driver info
    const driver = await db.collection('users').findOne({ email: driverEmail });
    console.log('\n📋 Updated Driver Info:');
    console.log(`   Email: ${driver.email}`);
    console.log(`   Name: ${driver.name}`);
    console.log(`   Fleet ID: ${driver.fleetId}`);
    
    // Show fleet details (try both string and ObjectId)
    let fleet = await db.collection('fleets').findOne({ _id: targetFleetId });
    if (!fleet) {
      const { ObjectId } = await import('mongodb');
      fleet = await db.collection('fleets').findOne({ _id: new ObjectId(targetFleetId) });
    }
    console.log('\n🏢 Fleet Details:');
    console.log(`   Name: ${fleet.name}`);
    console.log(`   Code: ${fleet.code}`);
    console.log(`   Admin: ${fleet.adminUserId}`);
    
    console.log('\n✅ Driver should now appear in Bharath\'s drivers panel!');
  } else {
    console.log('❌ No changes made. Driver might not exist.');
  }

  await client.close();
}

moveDriverToFleet();
