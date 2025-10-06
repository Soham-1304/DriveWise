// Clean up old and unnecessary trips from the database
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'fuel_db';

async function cleanOldTrips() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Show current state
    console.log('\n📊 BEFORE CLEANUP:');
    const tripsBefore = await db.collection('trips').countDocuments();
    const tripsRawBefore = await db.collection('trips_raw').countDocuments();
    const telemetryBefore = await db.collection('telemetry').countDocuments();
    
    console.log(`   - trips collection: ${tripsBefore} documents`);
    console.log(`   - trips_raw collection: ${tripsRawBefore} documents`);
    console.log(`   - telemetry collection: ${telemetryBefore} documents`);
    
    // Delete all trips (both collections)
    console.log('\n🗑️  Deleting all trips...');
    const deleteTrips = await db.collection('trips').deleteMany({});
    console.log(`   ✓ Deleted ${deleteTrips.deletedCount} trip summaries`);
    
    const deleteTripsRaw = await db.collection('trips_raw').deleteMany({});
    console.log(`   ✓ Deleted ${deleteTripsRaw.deletedCount} raw trip metadata`);
    
    const deleteTelemetry = await db.collection('telemetry').deleteMany({});
    console.log(`   ✓ Deleted ${deleteTelemetry.deletedCount} telemetry points`);
    
    // Show final state
    console.log('\n📊 AFTER CLEANUP:');
    const tripsAfter = await db.collection('trips').countDocuments();
    const tripsRawAfter = await db.collection('trips_raw').countDocuments();
    const telemetryAfter = await db.collection('telemetry').countDocuments();
    
    console.log(`   - trips collection: ${tripsAfter} documents`);
    console.log(`   - trips_raw collection: ${tripsRawAfter} documents`);
    console.log(`   - telemetry collection: ${telemetryAfter} documents`);
    
    console.log('\n✅ Cleanup complete! All old trips removed.');
    console.log('💡 You can now start fresh trips and they will appear in your Trip History.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanOldTrips();
