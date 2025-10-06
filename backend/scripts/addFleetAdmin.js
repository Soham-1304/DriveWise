import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function addFleetAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('fueloptimizer');
    
    console.log('👤 Adding fleet admin...\n');
    
    // Check if admin already exists
    const existing = await db.collection('users').findOne({ userId: 'soham_dev' });
    
    if (existing) {
      console.log('✅ Fleet admin already exists:', existing);
    } else {
      // Add fleet admin
      const adminProfile = {
        userId: 'soham_dev',
        email: 'sohamiscoding@gmail.com',
        role: 'fleet_admin',
        fleetId: 'demo_fleet_001',
        name: 'Soham Karandikar',
        phone: '+91-9876543210',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('users').insertOne(adminProfile);
      console.log('✅ Created fleet admin profile');
    }
    
    // Show all users
    const users = await db.collection('users').find({}).toArray();
    console.log(`\n👥 Total users: ${users.length}`);
    console.log('\nFleet Admin:');
    users.filter(u => u.role === 'fleet_admin').forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - ${u.userId}`);
    });
    console.log('\nDrivers:');
    users.filter(u => u.role === 'driver').forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - ${u._id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

addFleetAdmin().catch(console.error);
