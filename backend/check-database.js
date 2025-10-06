// Check what data exists in the database
import { MongoClient } from 'mongodb';

import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'fuel_db'; // Extract from URI or use fuel_db

async function checkDatabase() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Check all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📦 Collections:');
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`   - ${coll.name}: ${count} documents`);
    }
    
    // Check trips
    console.log('\n🚗 Trip Documents:');
    const trips = await db.collection('trips').find({}).limit(5).toArray();
    if (trips.length === 0) {
      console.log('   No trips found');
    } else {
      trips.forEach(trip => {
        console.log(`   - Trip ${trip._id}:`);
        console.log(`     userId: ${trip.userId}`);
        console.log(`     vehicleId: ${trip.vehicleId}`);
        console.log(`     distance: ${trip.distanceKm}km`);
        console.log(`     efficiency: ${trip.efficiencyScore}`);
      });
    }
    
    // Check trips_raw
    console.log('\n📋 Raw Trip Metadata:');
    const tripsRaw = await db.collection('trips_raw').find({}).limit(5).toArray();
    if (tripsRaw.length === 0) {
      console.log('   No raw trips found');
    } else {
      tripsRaw.forEach(trip => {
        console.log(`   - Trip ${trip.tripId}:`);
        console.log(`     userId: ${trip.userId}`);
        console.log(`     status: ${trip.status}`);
        console.log(`     startTime: ${trip.startTime}`);
      });
    }
    
    // Check vehicles
    console.log('\n🚙 Vehicles:');
    const vehicles = await db.collection('vehicles').find({}).limit(3).toArray();
    if (vehicles.length === 0) {
      console.log('   No vehicles found');
    } else {
      vehicles.forEach(vehicle => {
        console.log(`   - ${vehicle.make} ${vehicle.model} (${vehicle._id})`);
        console.log(`     userId: ${vehicle.userId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkDatabase();
