import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * FIX THE CORE PROBLEM:
 * The fuelUsed calculation was inverted!
 * 
 * CORRECT LOGIC:
 * - Baseline: What vehicle should use (e.g., 15 L/100km)
 * - Efficiency 100% = uses exactly baseline
 * - Efficiency 80% = uses 80% of baseline (SAVES 20%)
 * - Efficiency 50% = uses 50% MORE than baseline (wastes fuel)
 * 
 * Formula: actualFuel = baseline * (2 - efficiency/100)
 * - At 100%: baseline * (2 - 1) = baseline
 * - At 80%: baseline * (2 - 0.8) = baseline * 1.2 (20% more)
 * - At 50%: baseline * (2 - 0.5) = baseline * 1.5 (50% more)
 */

async function recalculateFuelMetrics() {
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
    console.log('🚗 Found', trips.length, 'trips to recalculate\n');
    
    let updated = 0;
    
    for (const trip of trips) {
      const baselineConsumption = vehicleMap[trip.vehicleId] || 15; // L/100km
      const distance = trip.distanceKm;
      const efficiency = trip.efficiencyScore;
      
      // Calculate what the vehicle SHOULD consume at baseline (perfect conditions)
      const baselineFuelUsed = (distance * baselineConsumption) / 100;
      
      // Calculate actual fuel based on driving efficiency
      // Efficiency < 100% means worse driving = MORE fuel used
      // Efficiency > 100% means better driving = LESS fuel used
      const efficiencyFactor = 2 - (efficiency / 100);
      const actualFuelUsed = baselineFuelUsed * efficiencyFactor;
      
      // Fuel saved = baseline - actual
      // Positive = good (used less than baseline)
      // Negative = bad (used more than baseline)
      const fuelSaved = baselineFuelUsed - actualFuelUsed;
      
      // Cost calculations
      const fuelPricePerLiter = trip.fuelPrice || 105; // ₹/L
      const costSavings = fuelSaved * fuelPricePerLiter;
      const totalCost = actualFuelUsed * fuelPricePerLiter;
      
      // Update trip
      await db.collection('trips').updateOne(
        { _id: trip._id },
        {
          $set: {
            baselineFuelUsed: parseFloat(baselineFuelUsed.toFixed(2)),
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
    
    console.log(`\n✅ Recalculated ${updated} trips with CORRECT fuel logic\n`);
    
    // Show summary statistics
    const stats = await db.collection('trips').aggregate([
      { $match: { fleetId: 'demo_fleet_001' } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalFuelUsed: { $sum: '$fuelUsed' },
          totalFuelSaved: { $sum: '$fuelSaved' },
          totalCostSavings: { $sum: '$costSavings' },
          avgEfficiency: { $avg: '$efficiencyScore' },
          totalDistance: { $sum: '$distanceKm' }
        }
      }
    ]).toArray();
    
    if (stats.length > 0) {
      const summary = stats[0];
      console.log('📊 Fleet Summary (Corrected):');
      console.log(`   Total Trips: ${summary.totalTrips}`);
      console.log(`   Total Distance: ${summary.totalDistance.toFixed(0)} km`);
      console.log(`   Total Fuel Used: ${summary.totalFuelUsed.toFixed(2)} L`);
      console.log(`   Total Fuel Saved: ${summary.totalFuelSaved.toFixed(2)} L`);
      console.log(`   Total Cost Savings: ₹${summary.totalCostSavings.toFixed(2)}`);
      console.log(`   Avg Efficiency: ${summary.avgEfficiency.toFixed(1)}%`);
      console.log('');
      
      if (summary.totalFuelSaved < 0) {
        console.log('⚠️  Note: Negative fuel saved means fleet is using MORE fuel than baseline');
        console.log('   This is expected with avg efficiency < 100%');
        console.log('   To show positive savings, increase efficiency scores in trips');
      } else {
        console.log('✅ Positive fuel savings! Fleet is performing better than baseline');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

recalculateFuelMetrics();
