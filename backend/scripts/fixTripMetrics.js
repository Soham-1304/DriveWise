import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * This script adds proper fuel calculations to existing trips:
 * 1. Calculate baseline fuel consumption (what vehicle SHOULD use)
 * 2. Calculate actual fuel used (already exists)
 * 3. Calculate fuel saved = baseline - actual (positive = good driving)
 * 4. Add cost savings based on fuel price
 * 5. Add route information and location data
 */

async function fixTripMetrics() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // Get all vehicles to know their baseline consumption
    const vehicles = await db.collection('vehicles').find({}).toArray();
    const vehicleMap = {};
    vehicles.forEach(v => {
      vehicleMap[v._id] = v.baselineConsumption || 15; // L/100km
    });
    
    console.log('📊 Found', vehicles.length, 'vehicles\n');
    
    // Get all trips
    const trips = await db.collection('trips').find({ fleetId: 'demo_fleet_001' }).toArray();
    console.log('🚗 Found', trips.length, 'trips to update\n');
    
    let updated = 0;
    
    for (const trip of trips) {
      const baselineConsumption = vehicleMap[trip.vehicleId] || 15; // L/100km
      const distance = trip.distanceKm;
      
      // Calculate what the vehicle SHOULD have consumed (baseline)
      const baselineFuelUsed = (distance * baselineConsumption) / 100;
      
      // Actual fuel used (already in trip)
      const actualFuelUsed = trip.fuelUsed;
      
      // Fuel saved = baseline - actual
      // Positive value = good driving (used less than baseline)
      // Negative value = poor driving (used more than baseline)
      const fuelSaved = baselineFuelUsed - actualFuelUsed;
      
      // Cost calculations
      const fuelPricePerLiter = trip.fuelPrice || 105; // ₹/L
      const costSavings = fuelSaved * fuelPricePerLiter;
      const totalCost = actualFuelUsed * fuelPricePerLiter;
      
      // Add location data (sample - you can enhance this)
      const locations = [
        { area: 'Andheri', city: 'Mumbai' },
        { area: 'Bandra', city: 'Mumbai' },
        { area: 'Powai', city: 'Mumbai' },
        { area: 'Thane', city: 'Mumbai' },
        { area: 'Dadar', city: 'Mumbai' },
        { area: 'Kurla', city: 'Mumbai' }
      ];
      
      const startLocation = locations[Math.floor(Math.random() * locations.length)];
      const endLocation = locations[Math.floor(Math.random() * locations.length)];
      
      // Route types based on efficiency
      let routeType = 'balanced';
      if (trip.efficiencyScore >= 80) {
        routeType = 'eco';
      } else if (trip.efficiencyScore < 60) {
        routeType = 'fastest';
      }
      
      // Update trip with new fields
      await db.collection('trips').updateOne(
        { _id: trip._id },
        {
          $set: {
            // Fuel calculations
            baselineFuelUsed: parseFloat(baselineFuelUsed.toFixed(2)),
            fuelSaved: parseFloat(fuelSaved.toFixed(2)),
            
            // Cost calculations
            totalCost: parseFloat(totalCost.toFixed(2)),
            costSavings: parseFloat(costSavings.toFixed(2)),
            
            // Location data
            startLocation: {
              address: `${startLocation.area}, ${startLocation.city}`,
              coordinates: {
                lat: 19.0760 + (Math.random() * 0.2 - 0.1),
                lng: 72.8777 + (Math.random() * 0.2 - 0.1)
              }
            },
            endLocation: {
              address: `${endLocation.area}, ${endLocation.city}`,
              coordinates: {
                lat: 19.0760 + (Math.random() * 0.2 - 0.1),
                lng: 72.8777 + (Math.random() * 0.2 - 0.1)
              }
            },
            
            // Route information
            routeType, // 'eco', 'balanced', 'fastest'
            routeInfo: {
              type: routeType,
              predictedFuel: baselineFuelUsed,
              actualFuel: actualFuelUsed,
              savings: fuelSaved,
              waypointsCount: Math.floor(distance / 10) + 1
            }
          }
        }
      );
      
      updated++;
      
      if (updated % 100 === 0) {
        console.log(`⏳ Updated ${updated}/${trips.length} trips...`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} trips with proper metrics\n`);
    
    // Show summary statistics
    const stats = await db.collection('trips').aggregate([
      { $match: { fleetId: 'demo_fleet_001' } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalFuelSaved: { $sum: '$fuelSaved' },
          totalCostSavings: { $sum: '$costSavings' },
          avgEfficiency: { $avg: '$efficiencyScore' },
          totalDistance: { $sum: '$distanceKm' }
        }
      }
    ]).toArray();
    
    if (stats.length > 0) {
      const summary = stats[0];
      console.log('📊 Fleet Summary:');
      console.log(`   Total Trips: ${summary.totalTrips}`);
      console.log(`   Total Distance: ${summary.totalDistance.toFixed(0)} km`);
      console.log(`   Total Fuel Saved: ${summary.totalFuelSaved.toFixed(2)} L`);
      console.log(`   Total Cost Savings: ₹${summary.totalCostSavings.toFixed(2)}`);
      console.log(`   Avg Efficiency: ${summary.avgEfficiency.toFixed(1)}%`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixTripMetrics();
