/**
 * Sample Data Generator for MongoDB Analytics Demo
 * 
 * This script generates realistic sample data for:
 * - Fleet vehicles
 * - Drivers
 * - Trips with various efficiency scores
 * - Anomalies for demonstration
 * 
 * Run: node scripts/generateSampleData.js
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Sample data configurations
const FLEET_ID = 'demo_fleet_001';
const VEHICLE_MODELS = [
  { name: 'Tata Ace', model: 'Tata Ace Gold', fuelType: 'Diesel', baselineConsumption: 18 },
  { name: 'Mahindra Bolero', model: 'Bolero Pickup', fuelType: 'Diesel', baselineConsumption: 14 },
  { name: 'Maruti Eeco', model: 'Eeco 5-Seater', fuelType: 'Petrol', baselineConsumption: 16 },
  { name: 'Ashok Leyland', model: 'Dost+', fuelType: 'Diesel', baselineConsumption: 12 },
  { name: 'Force Traveller', model: 'Traveller 3350', fuelType: 'Diesel', baselineConsumption: 10 },
  { name: 'Isuzu D-Max', model: 'D-Max V-Cross', fuelType: 'Diesel', baselineConsumption: 13 },
];

const DRIVER_NAMES = [
  { name: 'Soham Karandikar', email: 'sohamiscoding@gmail.com', skill: 'excellent' }, // Fleet Admin
  { name: 'Amit Singh', email: 'amit.singh@fleet.com', skill: 'good' },
  { name: 'Priya Sharma', email: 'priya.sharma@fleet.com', skill: 'excellent' },
  { name: 'Vikram Patel', email: 'vikram.patel@fleet.com', skill: 'average' },
  { name: 'Suresh Reddy', email: 'suresh.reddy@fleet.com', skill: 'good' },
  { name: 'Manoj Gupta', email: 'manoj.gupta@fleet.com', skill: 'poor' },
  { name: 'Anita Desai', email: 'anita.desai@fleet.com', skill: 'excellent' },
  { name: 'Rahul Verma', email: 'rahul.verma@fleet.com', skill: 'average' },
];

function generateUserId(email) {
  // Special case for the fleet admin
  if (email === 'sohamiscoding@gmail.com') {
    return 'soham_dev';
  }
  return `user_${email.split('@')[0]}`;
}

function generateVehicleId(index) {
  return `vehicle_${String(index + 1).padStart(3, '0')}`;
}

function generateTripData(driver, vehicle, monthsAgo, tripIndex) {
  const baseEfficiency = {
    'excellent': 85,
    'good': 75,
    'average': 65,
    'poor': 55,
  }[driver.skill];

  // Add some randomness
  const efficiency = Math.max(40, Math.min(95, baseEfficiency + (Math.random() * 20 - 10)));
  
  const distance = 30 + Math.random() * 70; // 30-100 km
  const fuelUsedPerKm = vehicle.baselineConsumption / 100;
  const efficiencyMultiplier = efficiency / 100;
  const fuelUsed = (distance * fuelUsedPerKm) / efficiencyMultiplier;
  
  const harshBraking = driver.skill === 'poor' ? Math.floor(Math.random() * 8) : 
                       driver.skill === 'average' ? Math.floor(Math.random() * 4) : 
                       Math.floor(Math.random() * 2);
  
  const harshAcceleration = driver.skill === 'poor' ? Math.floor(Math.random() * 6) : 
                            driver.skill === 'average' ? Math.floor(Math.random() * 3) : 
                            Math.floor(Math.random() * 2);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsAgo);
  startDate.setDate(Math.floor(Math.random() * 28) + 1);
  startDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
  
  const endDate = new Date(startDate);
  const tripDurationHours = distance / (40 + Math.random() * 20); // 40-60 km/h avg
  endDate.setHours(endDate.getHours() + Math.floor(tripDurationHours));
  endDate.setMinutes(endDate.getMinutes() + Math.floor((tripDurationHours % 1) * 60));

  return {
    _id: new ObjectId(),
    userId: generateUserId(driver.email),
    vehicleId: generateVehicleId(VEHICLE_MODELS.indexOf(vehicle)),
    fleetId: FLEET_ID,
    startTime: startDate,
    endTime: endDate,
    distanceKm: parseFloat(distance.toFixed(2)),
    fuelUsed: parseFloat(fuelUsed.toFixed(2)),
    fuelPrice: 95 + Math.random() * 15, // ₹95-110 per liter
    efficiencyScore: parseFloat(efficiency.toFixed(1)),
    avgSpeed: parseFloat((30 + Math.random() * 40).toFixed(1)),
    drivingBehavior: {
      harshBraking,
      harshAcceleration,
      idleTime: Math.floor(Math.random() * 300), // seconds
    },
    status: 'completed',
    createdAt: startDate,
  };
}

async function generateSampleData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // Clear existing demo data
    console.log('🗑️  Clearing existing demo data...');
    await db.collection('users').deleteMany({});
    await db.collection('vehicles').deleteMany({ fleetId: FLEET_ID });
    await db.collection('trips').deleteMany({ fleetId: FLEET_ID });
    await db.collection('fleets').deleteMany({ _id: FLEET_ID });
    console.log('✅ Cleared\n');

    // Create fleet document
    console.log('🚚 Creating fleet...');
    await db.collection('fleets').insertOne({
      _id: FLEET_ID,
      code: 'DEMO2024',
      name: 'Demo Fleet',
      adminUserId: 'soham_dev',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Created fleet: DEMO2024\n');

    // Create users (first one is fleet admin, rest are drivers)
    console.log('👥 Creating users...');
    const users = DRIVER_NAMES.map((driver, index) => ({
      userId: generateUserId(driver.email),
      email: driver.email,
      name: driver.name,
      role: index === 0 ? 'fleet_admin' : 'driver', // First user is admin
      fleetId: FLEET_ID,
      phone: index === 0 ? '+91-9876543210' : '',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await db.collection('users').insertMany(users);
    console.log(`✅ Created ${users.length} users (1 admin, ${users.length - 1} drivers)\n`);

    // Create vehicles
    console.log('🚗 Creating vehicles...');
    const vehicles = VEHICLE_MODELS.map((v, index) => ({
      _id: generateVehicleId(index),
      userId: generateUserId(DRIVER_NAMES[index % DRIVER_NAMES.length].email),
      fleetId: FLEET_ID,
      name: v.name,
      model: v.model,
      registrationNumber: `MH-12-${String(1000 + index).slice(-4)}`,
      fuelType: v.fuelType,
      baselineConsumption: v.baselineConsumption,
      status: 'active',
      createdAt: new Date(),
    }));
    await db.collection('vehicles').insertMany(vehicles);
    console.log(`✅ Created ${vehicles.length} vehicles\n`);

    // Create trips (last 6 months)
    console.log('📊 Generating trips (last 6 months)...');
    const trips = [];
    
    for (let month = 0; month < 6; month++) {
      // Each driver makes 15-25 trips per month
      for (const driver of DRIVER_NAMES) {
        const numTrips = 15 + Math.floor(Math.random() * 10);
        const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
        
        for (let i = 0; i < numTrips; i++) {
          trips.push(generateTripData(driver, VEHICLE_MODELS.find(v => v.name === vehicle.name), month, i));
        }
      }
    }
    
    await db.collection('trips').insertMany(trips);
    console.log(`✅ Created ${trips.length} trips\n`);

    // Create some anomalies (extremely low/high efficiency trips)
    console.log('⚠️  Creating anomaly examples...');
    const anomalyTrips = [];
    
    // Create 3 critical anomalies (very low efficiency)
    for (let i = 0; i < 3; i++) {
      const driver = DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)];
      const vehicle = VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)];
      const trip = generateTripData(driver, vehicle, 0, i);
      trip.efficiencyScore = 30 + Math.random() * 10; // 30-40% (critical)
      trip.drivingBehavior.harshBraking = 15 + Math.floor(Math.random() * 10);
      trip.drivingBehavior.harshAcceleration = 12 + Math.floor(Math.random() * 8);
      anomalyTrips.push(trip);
    }
    
    // Create 2 excellent anomalies (very high efficiency)
    for (let i = 0; i < 2; i++) {
      const driver = DRIVER_NAMES[0]; // Best driver
      const vehicle = VEHICLE_MODELS[0];
      const trip = generateTripData(driver, vehicle, 0, i + 10);
      trip.efficiencyScore = 92 + Math.random() * 5; // 92-97% (excellent)
      trip.drivingBehavior.harshBraking = 0;
      trip.drivingBehavior.harshAcceleration = 0;
      anomalyTrips.push(trip);
    }
    
    await db.collection('trips').insertMany(anomalyTrips);
    console.log(`✅ Created ${anomalyTrips.length} anomaly trips\n`);

    // Generate statistics
    console.log('========================================');
    console.log('📊 SAMPLE DATA GENERATION COMPLETE!');
    console.log('========================================\n');
    
    const stats = {
      drivers: await db.collection('users').countDocuments({ fleetId: FLEET_ID }),
      vehicles: await db.collection('vehicles').countDocuments({ fleetId: FLEET_ID }),
      trips: await db.collection('trips').countDocuments({ fleetId: FLEET_ID }),
    };
    
    console.log('📈 Statistics:');
    console.log(`  Drivers: ${stats.drivers}`);
    console.log(`  Vehicles: ${stats.vehicles}`);
    console.log(`  Trips: ${stats.trips}`);
    console.log(`  Anomalies: 5 (3 critical, 2 excellent)\n`);
    
    // Sample efficiency distribution
    const efficiencyDistribution = await db.collection('trips').aggregate([
      { $match: { fleetId: FLEET_ID } },
      { $group: {
          _id: null,
          avgEfficiency: { $avg: '$efficiencyScore' },
          minEfficiency: { $min: '$efficiencyScore' },
          maxEfficiency: { $max: '$efficiencyScore' },
        }
      }
    ]).toArray();
    
    if (efficiencyDistribution.length > 0) {
      const dist = efficiencyDistribution[0];
      console.log('⚡ Efficiency Distribution:');
      console.log(`  Average: ${dist.avgEfficiency.toFixed(1)}%`);
      console.log(`  Minimum: ${dist.minEfficiency.toFixed(1)}%`);
      console.log(`  Maximum: ${dist.maxEfficiency.toFixed(1)}%\n`);
    }
    
    console.log('========================================');
    console.log('🎯 NEXT STEPS:');
    console.log('========================================\n');
    console.log('1. Backend is running on port 3000');
    console.log('2. Test endpoints:');
    console.log('   - GET /api/fleet/performance?fleetId=demo_fleet_001');
    console.log('   - GET /api/fleet/drivers/ranking?fleetId=demo_fleet_001');
    console.log('   - GET /api/analytics/fuel-trend?vehicleId=vehicle_001');
    console.log('   - GET /api/analytics/anomalies?fleetId=demo_fleet_001\n');
    console.log('3. Login credentials for demo:');
    console.log('   Email: rajesh.kumar@fleet.com');
    console.log('   FleetID: demo_fleet_001\n');
    console.log('4. Start frontend: cd frontend && npm run dev\n');
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run the script
generateSampleData();
