/**
 * Advanced MongoDB Aggregation Pipelines for Fleet Analytics
 * 
 * This file contains production-ready aggregation queries
 * Copy these into backend/routes/analytics.js or use as reference
 */

import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * 1. FLEET PERFORMANCE DASHBOARD
 * GET /api/fleet/performance
 * 
 * Purpose: Vehicle-wise performance comparison for fleet managers
 * Complexity: O(n) where n = number of trips
 * Indexes used: { fleetId: 1, status: 1, startTime: -1 }
 */
router.get('/performance', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const { fleetId, startDate, endDate } = req.query;
    
    const matchCriteria = { fleetId: fleetId || req.user.fleetId };
    if (startDate || endDate) {
      matchCriteria.startTime = {};
      if (startDate) matchCriteria.startTime.$gte = new Date(startDate);
      if (endDate) matchCriteria.startTime.$lte = new Date(endDate);
    }
    
    const performance = await db.collection('trips').aggregate([
      { $match: matchCriteria },
      { $group: {
          _id: '$vehicleId',
          totalTrips: { $sum: 1 },
          avgFuelEfficiency: { $avg: '$efficiencyScore' },
          totalDistance: { $sum: '$distanceKm' },
          totalFuelUsed: { $sum: '$fuelUsed' },
          totalFuelCost: { $sum: { $multiply: ['$fuelUsed', { $ifNull: ['$fuelPrice', 100] }] }},
          avgSpeed: { $avg: '$avgSpeed' },
          harshBrakingTotal: { $sum: '$drivingBehavior.harshBraking' },
          harshAccelerationTotal: { $sum: '$drivingBehavior.harshAcceleration' },
          lastTripDate: { $max: '$startTime' }
        }},
      { $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicle'
        }},
      { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true }},
      { $addFields: {
          actualConsumption: {
            $cond: {
              if: { $gt: ['$totalDistance', 0] },
              then: { $multiply: [{ $divide: ['$totalFuelUsed', '$totalDistance'] }, 100] },
              else: 0
            }
          },
          baselineConsumption: { $ifNull: ['$vehicle.baselineConsumption', 0] },
          costPerKm: {
            $cond: {
              if: { $gt: ['$totalDistance', 0] },
              then: { $divide: ['$totalFuelCost', '$totalDistance'] },
              else: 0
            }
          },
          safetyScore: {
            $max: [0, {
              $subtract: [100, {
                $add: [
                  { $multiply: ['$harshBrakingTotal', 2] },
                  { $multiply: ['$harshAccelerationTotal', 2] }
                ]
              }]
            }]
          }
        }},
      { $addFields: {
          fuelSavedLiters: {
            $subtract: [
              { $multiply: [{ $divide: ['$baselineConsumption', 100] }, '$totalDistance'] },
              '$totalFuelUsed'
            ]
          }
        }},
      { $addFields: {
          savingsPercent: {
            $cond: {
              if: { $and: [
                { $gt: ['$baselineConsumption', 0] },
                { $gt: ['$actualConsumption', 0] }
              ]},
              then: {
                $multiply: [
                  { $divide: [
                    { $subtract: ['$baselineConsumption', '$actualConsumption'] },
                    '$baselineConsumption'
                  ]},
                  100
                ]
              },
              else: 0
            }
          }
        }},
      { $project: {
          _id: 0,
          vehicleId: '$_id',
          vehicleName: '$vehicle.name',
          model: '$vehicle.model',
          fuelType: '$vehicle.fuelType',
          registrationNumber: '$vehicle.registrationNumber',
          totalTrips: 1,
          totalDistance: { $round: ['$totalDistance', 2] },
          lastTripDate: 1,
          totalFuelUsed: { $round: ['$totalFuelUsed', 2] },
          actualConsumption: { $round: ['$actualConsumption', 2] },
          baselineConsumption: { $round: ['$baselineConsumption', 2] },
          fuelSavedLiters: { $round: ['$fuelSavedLiters', 2] },
          savingsPercent: { $round: ['$savingsPercent', 1] },
          totalFuelCost: { $round: ['$totalFuelCost', 0] },
          costPerKm: { $round: ['$costPerKm', 2] },
          avgFuelEfficiency: { $round: ['$avgFuelEfficiency', 1] },
          avgSpeed: { $round: ['$avgSpeed', 1] },
          safetyScore: { $max: [0, { $min: [100, { $round: ['$safetyScore', 0] }] }]},
          harshBraking: '$harshBrakingTotal',
          harshAcceleration: '$harshAccelerationTotal'
        }},
      { $sort: { avgFuelEfficiency: -1 } }
    ]).toArray();
    
    res.json({ success: true, count: performance.length, data: performance });
  } catch (error) {
    console.error('Fleet performance error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 2. DRIVER EFFICIENCY RANKING
 * GET /api/fleet/drivers/ranking
 * 
 * Purpose: Rank drivers by overall performance score
 * Complexity: O(n log n) due to sorting
 * Indexes used: { fleetId: 1, startTime: -1 }
 */
router.get('/drivers/ranking', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const { fleetId, limit = 10, period = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
    
    const ranking = await db.collection('trips').aggregate([
      { $match: { 
          fleetId: fleetId || req.user.fleetId,
          startTime: { $gte: cutoffDate },
          status: 'completed'
        }},
      { $group: {
          _id: '$userId',
          totalTrips: { $sum: 1 },
          avgEfficiency: { $avg: '$efficiencyScore' },
          totalDistance: { $sum: '$distanceKm' },
          totalFuel: { $sum: '$fuelUsed' },
          avgSpeed: { $avg: '$avgSpeed' },
          harshBraking: { $sum: '$drivingBehavior.harshBraking' },
          harshAcceleration: { $sum: '$drivingBehavior.harshAcceleration' },
          idling: { $sum: '$drivingBehavior.idling' },
          speeding: { $sum: '$drivingBehavior.speeding' }
        }},
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'userId',
          as: 'driver'
        }},
      { $unwind: '$driver' },
      { $addFields: {
          safetyScore: {
            $max: [0, {
              $subtract: [100, {
                $add: [
                  { $multiply: ['$harshBraking', 2] },
                  { $multiply: ['$harshAcceleration', 2] },
                  { $multiply: ['$speeding', 3] }
                ]
              }]
            }]
          },
          ecoScore: '$avgEfficiency',
          overallScore: {
            $add: [
              { $multiply: ['$avgEfficiency', 0.6] },
              { $multiply: [{
                $max: [0, {
                  $subtract: [100, {
                    $add: [
                      { $multiply: ['$harshBraking', 2] },
                      { $multiply: ['$harshAcceleration', 2] }
                    ]
                  }]
                }]
              }, 0.4]}
            ]
          },
          avgTripDistance: {
            $cond: {
              if: { $gt: ['$totalTrips', 0] },
              then: { $divide: ['$totalDistance', '$totalTrips'] },
              else: 0
            }
          }
        }},
      { $project: {
          _id: 0,
          driverId: '$_id',
          name: '$driver.name',
          email: '$driver.email',
          phone: '$driver.phone',
          totalTrips: 1,
          totalDistance: { $round: ['$totalDistance', 1] },
          avgTripDistance: { $round: ['$avgTripDistance', 1] },
          totalFuel: { $round: ['$totalFuel', 2] },
          avgSpeed: { $round: ['$avgSpeed', 1] },
          avgEfficiency: { $round: ['$avgEfficiency', 1] },
          safetyScore: { $round: ['$safetyScore', 0] },
          ecoScore: { $round: ['$ecoScore', 1] },
          overallScore: { $round: ['$overallScore', 1] },
          harshBraking: 1,
          harshAcceleration: 1,
          idling: 1,
          speeding: 1,
          grade: {
            $switch: {
              branches: [
                { case: { $gte: ['$overallScore', 90] }, then: 'A+' },
                { case: { $gte: ['$overallScore', 80] }, then: 'A' },
                { case: { $gte: ['$overallScore', 70] }, then: 'B' },
                { case: { $gte: ['$overallScore', 60] }, then: 'C' },
                { case: { $gte: ['$overallScore', 50] }, then: 'D' }
              ],
              default: 'F'
            }
          }
        }},
      { $sort: { overallScore: -1 } },
      { $limit: parseInt(limit) }
    ]).toArray();
    
    res.json({
      success: true,
      period: `Last ${period} days`,
      count: ranking.length,
      data: ranking
    });
  } catch (error) {
    console.error('Driver ranking error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 3. MONTHLY FUEL TREND
 * GET /api/analytics/fuel-trend
 * 
 * Purpose: Month-over-month fuel consumption analysis
 * Complexity: O(n)
 * Indexes used: { vehicleId: 1, startTime: -1 }
 */
router.get('/fuel-trend', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const { vehicleId, months = 6 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - parseInt(months));
    
    const matchCriteria = {
      startTime: { $gte: cutoffDate },
      status: 'completed'
    };
    
    if (vehicleId) {
      matchCriteria.vehicleId = vehicleId;
    } else if (req.user.role === 'driver') {
      matchCriteria.userId = req.user.uid;
    } else if (req.user.fleetId) {
      matchCriteria.fleetId = req.user.fleetId;
    }
    
    const trend = await db.collection('trips').aggregate([
      { $match: matchCriteria },
      { $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' }
          },
          totalFuel: { $sum: '$fuelUsed' },
          totalDistance: { $sum: '$distanceKm' },
          avgEfficiency: { $avg: '$efficiencyScore' },
          tripCount: { $sum: 1 },
          totalCost: { $sum: { $multiply: ['$fuelUsed', { $ifNull: ['$fuelPrice', 100] }] }}
        }},
      { $addFields: {
          monthName: {
            $let: {
              vars: {
                monthsInString: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              },
              in: { $arrayElemAt: ['$$monthsInString', '$_id.month'] }
            }
          },
          fuelPerKm: {
            $cond: {
              if: { $gt: ['$totalDistance', 0] },
              then: { $divide: ['$totalFuel', '$totalDistance'] },
              else: 0
            }
          },
          costPerKm: {
            $cond: {
              if: { $gt: ['$totalDistance', 0] },
              then: { $divide: ['$totalCost', '$totalDistance'] },
              else: 0
            }
          }
        }},
      { $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthLabel: { $concat: ['$monthName', ' ', { $toString: '$_id.year' }] },
          totalFuel: { $round: ['$totalFuel', 2] },
          totalDistance: { $round: ['$totalDistance', 1] },
          fuelPerKm: { $round: [{ $multiply: ['$fuelPerKm', 100] }, 2] },
          avgEfficiency: { $round: ['$avgEfficiency', 1] },
          tripCount: 1,
          totalCost: { $round: ['$totalCost', 0] },
          costPerKm: { $round: ['$costPerKm', 2] }
        }},
      { $sort: { year: 1, month: 1 } }
    ]).toArray();
    
    res.json({
      success: true,
      period: `Last ${months} months`,
      count: trend.length,
      data: trend
    });
  } catch (error) {
    console.error('Fuel trend error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. NEARBY POIs - Geospatial Query
 * GET /api/pois/nearby
 * 
 * Purpose: Find nearby fuel stations, restaurants, rest stops
 * Complexity: O(log n) with geospatial index
 * Indexes used: { location: '2dsphere' }
 */
router.get('/nearby-pois', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const { lat, lng, type, maxDistance = 5000, limit = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    const matchCriteria = {};
    if (type) matchCriteria.type = type;
    
    const pois = await db.collection('pois').aggregate([
      { $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: matchCriteria
        }},
      { $addFields: {
          distanceKm: { $divide: ['$distance', 1000] }
        }},
      { $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          type: 1,
          address: 1,
          fuelPrice: 1,
          amenities: 1,
          rating: 1,
          location: 1,
          distance: { $round: ['$distance', 0] },
          distanceKm: { $round: ['$distanceKm', 2] }
        }},
      { $sort: type === 'fuel_station' ? { fuelPrice: 1 } : { distance: 1 } },
      { $limit: parseInt(limit) }
    ]).toArray();
    
    res.json({
      success: true,
      count: pois.length,
      searchCenter: { lat: parseFloat(lat), lng: parseFloat(lng) },
      maxDistance: parseInt(maxDistance),
      data: pois
    });
  } catch (error) {
    console.error('Nearby POIs error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 5. ANOMALY DETECTION (3-Sigma Rule)
 * GET /api/analytics/anomalies
 * 
 * Purpose: Detect unusual fuel consumption patterns
 * Algorithm: Statistical outlier detection using standard deviation
 * Complexity: O(n)
 */
router.get('/anomalies', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const { fleetId, threshold = 3 } = req.query;
    
    // Calculate fleet statistics
    const stats = await db.collection('trips').aggregate([
      { $match: { 
          fleetId: fleetId || req.user.fleetId,
          status: 'completed'
        }},
      { $group: {
          _id: null,
          avgEfficiency: { $avg: '$efficiencyScore' },
          stdDev: { $stdDevPop: '$efficiencyScore' },
          count: { $sum: 1 }
        }}
    ]).toArray();
    
    if (!stats.length || stats[0].count < 10) {
      return res.json({
        success: true,
        message: 'Not enough data for anomaly detection (minimum 10 trips required)',
        data: []
      });
    }
    
    const { avgEfficiency, stdDev } = stats[0];
    const lowerBound = avgEfficiency - (threshold * stdDev);
    const upperBound = avgEfficiency + (threshold * stdDev);
    
    // Find anomalies
    const anomalies = await db.collection('trips').aggregate([
      { $match: {
          fleetId: fleetId || req.user.fleetId,
          status: 'completed',
          $or: [
            { efficiencyScore: { $lt: lowerBound } },
            { efficiencyScore: { $gt: upperBound } }
          ]
        }},
      { $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'driver'
        }},
      { $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicle'
        }},
      { $unwind: '$driver' },
      { $unwind: '$vehicle' },
      { $addFields: {
          zScore: {
            $divide: [
              { $subtract: ['$efficiencyScore', avgEfficiency] },
              stdDev
            ]
          },
          severity: {
            $switch: {
              branches: [
                { case: { $gte: [{ $abs: { $divide: [{ $subtract: ['$efficiencyScore', avgEfficiency] }, stdDev] } }, 5] }, then: 'critical' },
                { case: { $gte: [{ $abs: { $divide: [{ $subtract: ['$efficiencyScore', avgEfficiency] }, stdDev] } }, 4] }, then: 'high' },
                { case: { $gte: [{ $abs: { $divide: [{ $subtract: ['$efficiencyScore', avgEfficiency] }, stdDev] } }, 3] }, then: 'medium' }
              ],
              default: 'low'
            }
          }
        }},
      { $project: {
          _id: 0,
          tripId: '$_id',
          driverName: '$driver.name',
          vehicleName: '$vehicle.name',
          startTime: 1,
          efficiencyScore: { $round: ['$efficiencyScore', 1] },
          expectedRange: {
            lower: { $round: [lowerBound, 1] },
            upper: { $round: [upperBound, 1] }
          },
          zScore: { $round: ['$zScore', 2] },
          severity: 1,
          distanceKm: { $round: ['$distanceKm', 1] },
          fuelUsed: { $round: ['$fuelUsed', 2] }
        }},
      { $sort: { zScore: 1 } },
      { $limit: 50 }
    ]).toArray();
    
    res.json({
      success: true,
      statistics: {
        avgEfficiency: Math.round(avgEfficiency * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10,
        threshold,
        bounds: {
          lower: Math.round(lowerBound * 10) / 10,
          upper: Math.round(upperBound * 10) / 10
        }
      },
      count: anomalies.length,
      data: anomalies
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
