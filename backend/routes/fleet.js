import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

const router = express.Router();

// Get all vehicles for fleet admin's fleet
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    
    // Get user profile to find fleetId
    const userProfile = await db.collection('users').findOne({ userId: req.user.uid });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    let filter = {};
    
    if (userProfile.role === 'fleet_admin') {
      // Fleet admin sees all vehicles in their fleet
      filter = { fleetId: userProfile.fleetId };
    } else if (userProfile.role === 'driver') {
      // Driver sees assigned vehicles OR vehicles they're driving
      // Vehicle IDs are strings, not ObjectIds
      const assignedVehicleIds = userProfile.assignedVehicles || [];
      
      // Also find vehicles where userId matches this driver
      const driverVehicles = await db.collection('vehicles')
        .find({ 
          $or: [
            { _id: { $in: assignedVehicleIds } },
            { userId: userProfile.userId }
          ],
          fleetId: userProfile.fleetId
        })
        .sort({ createdAt: -1 })
        .toArray();
      
      return res.json(driverVehicles);
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const vehicles = await db.collection('vehicles')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Add new vehicle (Fleet Admin only)
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    
    // Get user profile
    const userProfile = await db.collection('users').findOne({ userId: req.user.uid });
    
    if (!userProfile || userProfile.role !== 'fleet_admin') {
      return res.status(403).json({ error: 'Only fleet admins can add vehicles' });
    }

    const {
      make,
      model,
      year,
      registrationNumber,
      fuelType,
      batteryCapacityKWh,
      consumptionBaseline,
      assignedDriverId
    } = req.body;

    const vehicle = {
      fleetId: userProfile.fleetId,
      make,
      model,
      year: parseInt(year),
      registrationNumber,
      fuelType,
      batteryCapacityKWh: fuelType === 'EV' ? parseFloat(batteryCapacityKWh) : null,
      consumptionBaseline: parseFloat(consumptionBaseline),
      assignedDriverId: assignedDriverId || null,
      status: 'active', // active, maintenance, inactive
      createdAt: new Date(),
      createdBy: req.user.uid
    };

    const result = await db.collection('vehicles').insertOne(vehicle);

    // If assigned to driver, update driver's assignedVehicles
    if (assignedDriverId) {
      await db.collection('users').updateOne(
        { userId: assignedDriverId, fleetId: userProfile.fleetId },
        { $addToSet: { assignedVehicles: result.insertedId.toString() } }
      );
    }

    return res.json({ 
      success: true, 
      vehicleId: result.insertedId.toString() 
    });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Update vehicle (Fleet Admin only)
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const vehicleId = req.params.id;
    
    // Get user profile
    const userProfile = await db.collection('users').findOne({ userId: req.user.uid });
    
    if (!userProfile || userProfile.role !== 'fleet_admin') {
      return res.status(403).json({ error: 'Only fleet admins can update vehicles' });
    }

    const {
      make,
      model,
      year,
      registrationNumber,
      fuelType,
      batteryCapacityKWh,
      consumptionBaseline,
      assignedDriverId,
      status
    } = req.body;

    // Get current vehicle to check previous assignment
    // Vehicle IDs are strings, not ObjectIds
    const currentVehicle = await db.collection('vehicles').findOne({
      _id: vehicleId,
      fleetId: userProfile.fleetId
    });

    if (!currentVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const updateData = {
      name: make || model, // Use make as name
      model,
      year: year ? parseInt(year) : currentVehicle.year,
      registrationNumber,
      fuelType,
      batteryCapacityKWh: fuelType === 'EV' ? parseFloat(batteryCapacityKWh) : null,
      baselineConsumption: parseFloat(consumptionBaseline), // Match DB field
      userId: assignedDriverId || null, // Match DB field for driver assignment
      status: status || 'active',
      updatedAt: new Date()
    };

    // Vehicle IDs are strings, not ObjectIds
    await db.collection('vehicles').updateOne(
      { _id: vehicleId, fleetId: userProfile.fleetId },
      { $set: updateData }
    );

    // Handle driver assignment changes (using userId field from DB)
    const oldDriverId = currentVehicle.userId || currentVehicle.assignedDriverId;
    if (oldDriverId !== assignedDriverId) {
      // Remove from old driver
      if (oldDriverId) {
        await db.collection('users').updateOne(
          { userId: oldDriverId },
          { $pull: { assignedVehicles: vehicleId } }
        );
      }
      
      // Add to new driver
      if (assignedDriverId) {
        await db.collection('users').updateOne(
          { userId: assignedDriverId, fleetId: userProfile.fleetId },
          { $addToSet: { assignedVehicles: vehicleId } }
        );
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete vehicle (Fleet Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const vehicleId = req.params.id;
    
    // Get user profile
    const userProfile = await db.collection('users').findOne({ userId: req.user.uid });
    
    if (!userProfile || userProfile.role !== 'fleet_admin') {
      return res.status(403).json({ error: 'Only fleet admins can delete vehicles' });
    }

    // Get vehicle to find assigned driver
    // Vehicle IDs are strings, not ObjectIds
    const vehicle = await db.collection('vehicles').findOne({
      _id: vehicleId,
      fleetId: userProfile.fleetId
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Remove from driver's assignedVehicles (check both userId and assignedDriverId)
    const assignedDriverId = vehicle.userId || vehicle.assignedDriverId;
    if (assignedDriverId) {
      await db.collection('users').updateOne(
        { userId: assignedDriverId },
        { $pull: { assignedVehicles: vehicleId } }
      );
    }

    // Soft delete - just mark as inactive
    await db.collection('vehicles').updateOne(
      { _id: vehicleId, fleetId: userProfile.fleetId },
      { $set: { status: 'deleted', deletedAt: new Date() } }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// Get vehicle details
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const vehicleId = req.params.id;
    
    // Get user profile
    const userProfile = await db.collection('users').findOne({ userId: req.user.uid });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Vehicle IDs are strings, not ObjectIds
    const vehicle = await db.collection('vehicles').findOne({
      _id: vehicleId
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check access permissions
    if (userProfile.role === 'driver') {
      const hasAccess = userProfile.assignedVehicles?.includes(vehicleId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this vehicle' });
      }
    } else if (userProfile.role === 'fleet_admin') {
      if (vehicle.fleetId !== userProfile.fleetId) {
        return res.status(403).json({ error: 'Vehicle not in your fleet' });
      }
    }

    return res.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Get fleet analytics (Fleet Admin only)
router.get('/analytics/overview', async (req, res) => {
  try {
    const db = await getDb();
    
    // Get user profile
    const userProfile = await db.collection('users').findOne({ userId: req.user.uid });
    
    if (!userProfile || userProfile.role !== 'fleet_admin') {
      return res.status(403).json({ error: 'Only fleet admins can view analytics' });
    }

    const fleetId = userProfile.fleetId;

    // Get all vehicles in fleet
    const vehicles = await db.collection('vehicles')
      .find({ fleetId, status: { $ne: 'deleted' } })
      .toArray();

    const vehicleIds = vehicles.map(v => v._id.toString());

    // Get all trips for this fleet's vehicles
    const trips = await db.collection('trips')
      .find({ vehicleId: { $in: vehicleIds } })
      .sort({ startTime: -1 })
      .toArray();

    // Calculate overall fleet statistics
    const totalTrips = trips.length;
    const totalDistance = trips.reduce((sum, t) => sum + (t.distanceKm || 0), 0);
    const totalFuelSaved = trips.reduce((sum, t) => sum + (t.fuelSaved || 0), 0);
    const totalFuelUsed = trips.reduce((sum, t) => sum + (t.estimatedUsed || 0), 0);
    const avgEfficiency = totalTrips > 0 
      ? trips.reduce((sum, t) => sum + (t.efficiencyScore || 0), 0) / totalTrips 
      : 0;

    // Calculate cost savings (assuming $1.5 per liter for fuel)
    const fuelCostPerLiter = 1.5;
    const costSavings = totalFuelSaved * fuelCostPerLiter;

    // Efficiency distribution
    const excellentTrips = trips.filter(t => t.efficiencyScore >= 80).length;
    const goodTrips = trips.filter(t => t.efficiencyScore >= 60 && t.efficiencyScore < 80).length;
    const poorTrips = trips.filter(t => t.efficiencyScore < 60).length;

    // Top performing drivers (by efficiency)
    const driverStats = {};
    trips.forEach(trip => {
      if (!driverStats[trip.userId]) {
        driverStats[trip.userId] = {
          userId: trip.userId,
          trips: 0,
          totalDistance: 0,
          totalFuelSaved: 0,
          totalEfficiency: 0
        };
      }
      driverStats[trip.userId].trips += 1;
      driverStats[trip.userId].totalDistance += trip.distanceKm || 0;
      driverStats[trip.userId].totalFuelSaved += trip.fuelSaved || 0;
      driverStats[trip.userId].totalEfficiency += trip.efficiencyScore || 0;
    });

    const driverRankings = Object.values(driverStats).map(d => ({
      ...d,
      avgEfficiency: d.trips > 0 ? d.totalEfficiency / d.trips : 0
    })).sort((a, b) => b.avgEfficiency - a.avgEfficiency);

    // Get driver names
    const driverIds = driverRankings.map(d => d.userId);
    const drivers = await db.collection('users')
      .find({ userId: { $in: driverIds } })
      .toArray();

    const driverMap = {};
    drivers.forEach(d => {
      driverMap[d.userId] = d.name || d.email;
    });

    const topDrivers = driverRankings.slice(0, 5).map(d => ({
      name: driverMap[d.userId] || 'Unknown',
      email: drivers.find(dr => dr.userId === d.userId)?.email || '',
      trips: d.trips,
      avgEfficiency: Math.round(d.avgEfficiency),
      totalDistance: parseFloat(d.totalDistance.toFixed(1)),
      totalFuelSaved: parseFloat(d.totalFuelSaved.toFixed(2))
    }));

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrips = trips.filter(t => new Date(t.startTime) >= sixMonthsAgo);
    const monthlyTrends = {};

    monthlyTrips.forEach(trip => {
      const month = new Date(trip.startTime).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = {
          month,
          trips: 0,
          distance: 0,
          fuelSaved: 0,
          fuelUsed: 0,
          avgEfficiency: 0
        };
      }
      monthlyTrends[month].trips += 1;
      monthlyTrends[month].distance += trip.distanceKm || 0;
      monthlyTrends[month].fuelSaved += trip.fuelSaved || 0;
      monthlyTrends[month].fuelUsed += trip.estimatedUsed || 0;
      monthlyTrends[month].avgEfficiency += trip.efficiencyScore || 0;
    });

    const trends = Object.values(monthlyTrends).map(m => ({
      ...m,
      avgEfficiency: m.trips > 0 ? Math.round(m.avgEfficiency / m.trips) : 0
    }));

    return res.json({
      overview: {
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'active').length,
        totalDrivers: drivers.length,
        totalTrips,
        totalDistance: parseFloat(totalDistance.toFixed(1)),
        totalFuelSaved: parseFloat(totalFuelSaved.toFixed(2)),
        totalFuelUsed: parseFloat(totalFuelUsed.toFixed(2)),
        avgEfficiency: Math.round(avgEfficiency),
        costSavings: parseFloat(costSavings.toFixed(2))
      },
      efficiencyDistribution: {
        excellent: excellentTrips,
        good: goodTrips,
        poor: poorTrips
      },
      topDrivers,
      monthlyTrends: trends
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
