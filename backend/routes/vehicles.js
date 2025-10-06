import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

const router = express.Router();

// Create a new vehicle
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { make, model, year, fuelType, batteryCapacityKWh, consumptionBaseline } = req.body;
    
    const vehicle = {
      userId: req.user.uid,
      make,
      model,
      year: parseInt(year),
      fuelType, // 'EV' or 'ICE'
      batteryCapacityKWh: batteryCapacityKWh ? parseFloat(batteryCapacityKWh) : null,
      consumptionBaseline: parseFloat(consumptionBaseline) || (fuelType === 'EV' ? 15 : 6.5),
      createdAt: new Date()
    };

    const result = await db.collection('vehicles').insertOne(vehicle);
    return res.status(201).json({ vehicleId: result.insertedId, ...vehicle });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// List all vehicles for the user
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const vehicles = await db.collection('vehicles')
      .find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .toArray();
    
    return res.json({ vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get a specific vehicle
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(req.params.id),
      userId: req.user.uid
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    return res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Update a vehicle
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { make, model, year, fuelType, batteryCapacityKWh, consumptionBaseline } = req.body;
    
    const updateData = {
      make,
      model,
      year: parseInt(year),
      fuelType,
      batteryCapacityKWh: batteryCapacityKWh ? parseFloat(batteryCapacityKWh) : null,
      consumptionBaseline: parseFloat(consumptionBaseline),
      updatedAt: new Date()
    };

    const result = await db.collection('vehicles').updateOne(
      { _id: new ObjectId(req.params.id), userId: req.user.uid },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    return res.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete a vehicle
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection('vehicles').deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.user.uid
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    return res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
