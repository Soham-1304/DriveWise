/**
 * Geocoding API Routes
 * Forward and reverse geocoding using Nominatim (OpenStreetMap)
 */

import express from 'express';

const router = express.Router();

/**
 * Reverse Geocoding - Convert coordinates to address
 * GET /api/geocode/reverse?lat=19.0760&lng=72.8777
 */
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing lat or lng parameter' });
    }

    // Use Nominatim reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FuelOptimizer/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract meaningful address
    const address = data.address || {};
    let name = '';

    if (address.road) {
      name = address.road;
      if (address.suburb) name += `, ${address.suburb}`;
      else if (address.neighbourhood) name += `, ${address.neighbourhood}`;
      else if (address.city) name += `, ${address.city}`;
    } else if (address.suburb) {
      name = address.suburb;
      if (address.city) name += `, ${address.city}`;
    } else if (address.city) {
      name = address.city;
    } else if (address.town) {
      name = address.town;
    } else if (address.village) {
      name = address.village;
    } else {
      name = data.display_name || 'Current Location';
    }

    return res.json({
      name,
      displayName: data.display_name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address: data.address
    });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return res.status(500).json({ 
      error: 'Failed to reverse geocode',
      name: `Location (${req.query.lat}, ${req.query.lng})`
    });
  }
});

/**
 * Forward Geocoding - Convert address to coordinates
 * GET /api/geocode/search?q=Mumbai
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    // Use Nominatim search
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FuelOptimizer/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    const suggestions = data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.address
    }));

    return res.json({ suggestions });

  } catch (error) {
    console.error('Forward geocoding error:', error);
    return res.status(500).json({ 
      error: 'Failed to geocode',
      suggestions: []
    });
  }
});

export default router;
