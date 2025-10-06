import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createDriverProfile() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // Check if profile already exists
    const existing = await db.collection('users').findOne({ 
      email: 'sohamkarandikar007@gmail.com' 
    });
    
    if (existing) {
      console.log('⚠️  Profile already exists for sohamkarandikar007@gmail.com');
      console.log('   Current role:', existing.role);
      console.log('   userId:', existing.userId);
      console.log('\n   Updating to driver role...\n');
      
      await db.collection('users').updateOne(
        { email: 'sohamkarandikar007@gmail.com' },
        {
          $set: {
            role: 'driver',
            name: 'Soham Karandikar',
            phone: '+91-9876543211',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Updated existing profile to driver role\n');
    } else {
      // Create new driver profile
      const driverProfile = {
        userId: 'soham_driver',
        email: 'sohamkarandikar007@gmail.com',
        name: 'Soham Karandikar',
        role: 'driver',
        fleetId: 'demo_fleet_001',
        phone: '+91-9876543211',
        assignedVehicles: [], // Will be assigned by fleet admin
        createdAt: new Date(),
        updatedAt: new Date(),
        driverStats: {
          totalTrips: 0,
          totalDistance: 0,
          avgEfficiency: 0,
          totalFuelSaved: 0
        }
      };
      
      await db.collection('users').insertOne(driverProfile);
      console.log('✅ Created new driver profile\n');
    }
    
    // Show final profile
    const profile = await db.collection('users').findOne({ 
      email: 'sohamkarandikar007@gmail.com' 
    });
    
    console.log('📋 Driver Profile:');
    console.log(JSON.stringify(profile, null, 2));
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Login to driver app with: sohamkarandikar007@gmail.com');
    console.log('   2. Fleet admin (sohamiscoding@gmail.com) can assign vehicles');
    console.log('   3. Driver can start trips and track routes');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createDriverProfile();
