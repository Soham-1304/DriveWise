import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// Get analytics summary
router.get('/summary', async (req, res) => {
  try {
    const db = await getDb();
    const { vehicleId, days = 7 } = req.query;
    
    // Fleet admins see all fleet data, drivers see only their data
    const filter = {};
    if (req.user.role === 'fleet_admin' && req.user.fleetId) {
      filter.fleetId = req.user.fleetId;
    } else {
      filter.userId = req.user.uid;
    }
    
    if (vehicleId) {
      filter.vehicleId = vehicleId;
    }
    
    // Filter by date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    filter.startTime = { $gte: startDate };
    
    const trips = await db.collection('trips')
      .find(filter)
      .toArray();
    
    if (trips.length === 0) {
      return res.json({
        totalTrips: 0,
        totalDistance: 0,
        totalFuelUsed: 0,
        avgConsumption: 0,
        avgEfficiencyScore: 0,
        costPerKm: 0
      });
    }
    
    const totalDistance = trips.reduce((sum, t) => sum + t.distanceKm, 0);
    const totalFuelUsed = trips.reduce((sum, t) => sum + t.estimatedUsed, 0);
    const avgConsumption = (totalFuelUsed / totalDistance) * 100;
    const avgEfficiencyScore = trips.reduce((sum, t) => sum + (t.efficiencyScore || 0), 0) / trips.length;
    
    // Assume average fuel/electricity cost (can be customized per user/vehicle)
    const avgCostPerUnit = trips[0].fuelType === 'EV' ? 10 : 100; // ₹10/kWh or ₹100/L
    const totalCost = totalFuelUsed * avgCostPerUnit;
    const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;
    
    return res.json({
      totalTrips: trips.length,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      totalFuelUsed: parseFloat(totalFuelUsed.toFixed(2)),
      avgConsumption: parseFloat(avgConsumption.toFixed(2)),
      avgEfficiencyScore: Math.round(avgEfficiencyScore),
      costPerKm: parseFloat(costPerKm.toFixed(2)),
      fuelType: trips[0].fuelType
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
