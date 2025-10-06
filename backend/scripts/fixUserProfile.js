import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function fixUserProfile() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('fueloptimizer');
    
    console.log('🔧 Fixing user profile...\n');
    
    // Delete old user profile
    await db.collection('users').deleteMany({});
    console.log('✅ Cleared old user profiles');
    
    // Create proper user profile for Soham
    const sohamProfile = {
      userId: 'soham_dev',
      email: 'sohamiscoding@gmail.com',
      role: 'fleet_admin',
      fleetId: 'demo_fleet_001',
      name: 'Soham Karandikar',
      phone: '+91-9876543210',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('users').insertOne(sohamProfile);
    console.log('✅ Created Soham\'s user profile');
    console.log('\nProfile:', JSON.stringify(sohamProfile, null, 2));
    
    console.log('\n📝 Next step: Update backend/middleware/auth.js');
    console.log('Change uid from "user_rajesh.kumar" to "soham_dev"');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixUserProfile().catch(console.error);
