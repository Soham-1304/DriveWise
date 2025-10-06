import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * PROPER FUEL OPTIMIZATION LOGIC:
 * 
 * Think of efficiency score as "how much fuel you SAVED compared to a poor driver"
 * 
 * - Poor baseline: 20% MORE fuel than vehicle specs (efficiencyScore 0-50)
 * - Vehicle baseline: exact specs (efficiency

Score 70-80)
 * - Optimized: 10-20% LESS than specs (efficiencyScore 80-100)
 * 
 * Formula:
 * poorDriverFuel = baseline * 1.3 (30% more than specs)
 * actualFuel = poorDriverFuel * (1 - efficiencyScore/200)
 * fuelSaved = poorDriverFuel - actualFuel
 */

async function fixFuelLogicForDemo() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // Get all vehicles
    const vehicles = await db.collection('vehicles').find({}).toArray();
    const vehicleMap = {};
    vehicles.forEach(v => {
      vehicleMap[v._id] = v.baselineConsumption || 15; // L/100km
    });
    
    console.log('📊 Found', vehicles.length, 'vehicles\n');
    
    // Get all trips
    const trips = await db.collection('trips').find({ fleetId: 'demo_fleet_001' }).toArray();
    console.log('🚗 Found', trips.length, 'trips to fix\n');
    
    let updated = 0;
    
    for (const trip of trips) {
      const vehicleBaseline = vehicleMap[trip.vehicleId] || 15; // L/100km
      const distance = trip.distanceKm;
      const efficiency = trip.efficiencyScore;
      
      // Calculate the "poor driver" baseline (30% worse than vehicle specs)
      const poorDriverBaseline = (distance * vehicleBaseline * 1.3) / 100;
      
      // Calculate actual fuel based on efficiency
      // Higher efficiency = less fuel used
      const savingsRate = efficiency / 150; // Scale 0-100% to 0-66%
      const actualFuelUsed = poorDriverBaseline * (1 - savingsRate);
      
      // Fuel saved compared to poor driver
      const fuelSaved = poorDriverBaseline - actualFuelUsed;
      
      // Vehicle baseline (for reference)
      const vehicleBaselineFuel = (distance * vehicleBaseline) / 100;
      
      // Cost calculations
      const fuelPricePerLiter = trip.fuelPrice || 105; // ₹/L
      const costSavings = fuelSaved * fuelPricePerLiter;
      const totalCost = actualFuelUsed * fuelPricePerLiter;
      
      // Update trip
      await db.collection('trips').updateOne(
        { _id: trip._id },
        {
          $set: {
            vehicleBaseline: parseFloat(vehicleBaselineFuel.toFixed(2)),
            poorDriverBaseline: parseFloat(poorDriverBaseline.toFixed(2)),
            fuelUsed: parseFloat(actualFuelUsed.toFixed(2)),
            fuelSaved: parseFloat(fuelSaved.toFixed(2)),
            totalCost: parseFloat(totalCost.toFixed(2)),
            costSavings: parseFloat(costSavings.toFixed(2))
          }
        }
      );
      
      updated++;
      
      if (updated % 100 === 0) {
        console.log(`⏳ Updated ${updated}/${trips.length} trips...`);
      }
    }
    
    console.log(`\n✅ Fixed ${updated} trips with demo-ready fuel savings\n`);
    
    // Show summary statistics
    const stats = await db.collection('trips').aggregate([
      { $match: { fleetId: 'demo_fleet_001' } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$distanceKm' },
          totalFuelUsed: { $sum: '$fuelUsed' },
          totalFuelSaved: { $sum: '$fuelSaved' },
          totalCostSavings: { $sum: '$costSavings' },
          avgEfficiency: { $avg: '$efficiencyScore' }
        }
      }
    ]).toArray();
    
    if (stats.length > 0) {
      const summary = stats[0];
      console.log('📊 Fleet Summary (Demo-Ready):');
      console.log(`   Total Trips: ${summary.totalTrips}`);
      console.log(`   Total Distance: ${summary.totalDistance.toFixed(0)} km`);
      console.log(`   Total Fuel Used: ${summary.totalFuelUsed.toFixed(2)} L`);
      console.log(`   ✅ Fuel Saved vs Poor Drivers: ${summary.totalFuelSaved.toFixed(2)} L`);
      console.log(`   ✅ Cost Savings: ₹${summary.totalCostSavings.toFixed(2)}`);
      console.log(`   Avg Efficiency: ${summary.avgEfficiency.toFixed(1)}%`);
      console.log('');
      console.log('💡 Interpretation:');
      console.log(`   Your optimized fleet saved ${summary.totalFuelSaved.toFixed(0)}L`);
      console.log(`   compared to typical inefficient drivers!`);
      console.log(`   That's ₹${summary.totalCostSavings.toFixed(0)} in savings! 🎉`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixFuelLogicForDemo();
