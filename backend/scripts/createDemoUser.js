/**
 * Demo Testing Helper
 * 
 * This creates a test token bypass for demo purposes
 * Run this to test endpoints without authentication
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DEMO_USER_ID = 'user_rajesh.kumar';
const DEMO_FLEET_ID = 'demo_fleet_001';

async function createDemoUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Check if demo user exists
    const existingUser = await db.collection('users').findOne({ _id: DEMO_USER_ID });
    
    if (!existingUser) {
      await db.collection('users').insertOne({
        _id: DEMO_USER_ID,
        userId: DEMO_USER_ID, // Add userId field for fleet.js compatibility
        email: 'rajesh.kumar@fleet.com',
        name: 'Rajesh Kumar',
        role: 'fleet_admin', // Changed to fleet_admin for full access
        fleetId: DEMO_FLEET_ID,
        createdAt: new Date()
      });
      console.log('✅ Demo admin user created');
    } else if (existingUser.role !== 'fleet_admin' || !existingUser.userId) {
      // Update to fleet_admin and add userId if missing
      await db.collection('users').updateOne(
        { _id: DEMO_USER_ID },
        { $set: { role: 'fleet_admin', userId: DEMO_USER_ID } }
      );
      console.log('✅ Demo user updated to fleet_admin with userId field');
    } else {
      console.log('✅ Demo admin user already exists');
    }
    
    console.log(`\n📝 Demo Login Info:`);
    console.log(`   Email: rajesh.kumar@fleet.com`);
    console.log(`   Role: fleet_admin`);
    console.log(`   Fleet ID: ${DEMO_FLEET_ID}`);
    console.log(`\n🔑 For frontend testing, use this in localStorage:`);
    console.log(`   localStorage.setItem('fleetId', '${DEMO_FLEET_ID}');`);
    console.log(`   localStorage.setItem('userRole', 'fleet_admin');\n`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createDemoUser();
