import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndFixUserProfile() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('fueloptimizer');
    
    console.log('📊 Checking user profiles...\n');
    
    // Check all users
    const users = await db.collection('users').find({}).toArray();
    console.log('Current users:', JSON.stringify(users, null, 2));
    
    // Check if user_rajesh.kumar exists (needed for test auth)
    const testUser = await db.collection('users').findOne({ userId: 'user_rajesh.kumar' });
    
    if (!testUser) {
      console.log('\n❌ Test user (user_rajesh.kumar) not found!');
      console.log('Creating test user profile...');
      
      const testUserProfile = {
        userId: 'user_rajesh.kumar',
        email: 'rajesh.kumar@fleet.com',
        role: 'fleet_admin',
        fleetId: 'demo_fleet_001',
        name: 'Rajesh Kumar',
        phone: '+91-9876543210',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('users').insertOne(testUserProfile);
      console.log('✅ Created test user profile');
    } else {
      console.log('\n✅ Test user (user_rajesh.kumar) exists:', testUser);
    }
    
    // Also keep the sohamiscoding@gmail.com profile with same userId
    const sohamUser = await db.collection('users').findOne({ email: 'sohamiscoding@gmail.com' });
    if (sohamUser) {
      console.log('\n✅ Soham user profile exists:', sohamUser);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkAndFixUserProfile().catch(console.error);
