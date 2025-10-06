import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function mapDemoAccount() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db('fueloptimizer');
    
    // Create/update user profile for sohamiscoding@gmail.com
    const demoUserProfile = {
      userId: 'user_rajesh.kumar', // This matches the demo fleet admin
      email: 'sohamiscoding@gmail.com', // Your actual Firebase email
      role: 'fleet_admin',
      fleetId: 'demo_fleet_001',
      name: 'Soham Karandikar',
      phone: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Upsert the user profile
    const result = await db.collection('users').updateOne(
      { email: 'sohamiscoding@gmail.com' },
      { $set: demoUserProfile },
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      console.log('✓ Created new user profile for sohamiscoding@gmail.com');
    } else {
      console.log('✓ Updated existing user profile for sohamiscoding@gmail.com');
    }
    
    console.log('\nUser Profile:', demoUserProfile);
    console.log('\n✅ Demo account mapping complete!');
    console.log('You can now log in with sohamiscoding@gmail.com and access the demo fleet.');
    
  } catch (error) {
    console.error('Error mapping demo account:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

mapDemoAccount().catch(console.error);
