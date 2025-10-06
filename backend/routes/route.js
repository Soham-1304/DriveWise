import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

const router = express.Router();

// Route optimization using OSRM
router.post('/optimize', async (req, res) => {
  try {
    const { origin, destination, vehicleId } = req.body;
    
    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({ error: 'Invalid origin or destination' });
    }
    
    const osrmUrl = process.env.OSRM_URL || 'https://router.project-osrm.org';
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${osrmUrl}/route/v1/driving/${coords}?overview=full&alternatives=true&geometries=geojson`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      return res.status(500).json({ error: 'No routes found' });
    }
    
    // Get vehicle baseline consumption
    const db = await getDb();
    // Vehicle IDs are strings, not ObjectIds
    const vehicle = vehicleId 
      ? await db.collection('vehicles').findOne({ _id: vehicleId })
      : null;
    
    const baseline = vehicle?.baselineConsumption || vehicle?.consumptionBaseline || (vehicle?.fuelType === 'EV' ? 15 : 6.5);
    const fuelType = vehicle?.fuelType || 'ICE';
    
    // Evaluate each route
    const evaluatedRoutes = data.routes.map(route => {
      const distKm = route.distance / 1000;
      const avgSpeed = (distKm) / (route.duration / 3600 || 1);
      const speedFactor = avgSpeed > 70 ? 1.08 : avgSpeed < 25 ? 1.05 : 1.0;
      const estimatedUsed = baseline * (distKm / 100) * speedFactor;
      
      return {
        distanceKm: parseFloat(distKm.toFixed(2)),
        durationSec: route.duration,
        durationMin: Math.round(route.duration / 60),
        estimatedUsed: parseFloat(estimatedUsed.toFixed(2)),
        geometry: route.geometry
      };
    });
    
    // Sort by estimated usage
    evaluatedRoutes.sort((a, b) => a.estimatedUsed - b.estimatedUsed);
    
    const best = evaluatedRoutes[0];
    const alternatives = evaluatedRoutes.slice(1);
    
    // Calculate savings if there are alternatives
    const savings = alternatives.length > 0 
      ? parseFloat((alternatives[0].estimatedUsed - best.estimatedUsed).toFixed(2))
      : 0;
    
    return res.json({
      best,
      alternatives,
      savings,
      savingsPercent: alternatives.length > 0 
        ? parseFloat(((savings / alternatives[0].estimatedUsed) * 100).toFixed(1))
        : 0,
      fuelType
    });
  } catch (error) {
    console.error('Error optimizing route:', error);
    return res.status(500).json({ error: 'Failed to optimize route' });
  }
});

export default router;
