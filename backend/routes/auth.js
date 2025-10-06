import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// Register new user (Fleet Admin or Driver)
router.post('/register', async (req, res) => {
  try {
    const db = await getDb();
    const { email, role, fleetData } = req.body;
    const userId = req.user.uid;

    if (!['fleet_admin', 'driver'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    let userProfile;

    if (role === 'fleet_admin') {
      // Generate fleet code
      const fleetCode = `FLEET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
      // Create fleet and admin profile
      const fleet = {
        name: fleetData.companyName,
        companyName: fleetData.companyName,
        code: fleetCode,
        adminUserId: userId,
        createdAt: new Date(),
        status: 'active'
      };

      const fleetResult = await db.collection('fleets').insertOne(fleet);
      const fleetId = fleetResult.insertedId.toString();

      userProfile = {
        userId,
        email,
        role: 'fleet_admin',
        fleetId,
        name: fleetData.name || email.split('@')[0],
        phone: fleetData.phone || '',
        createdAt: new Date()
      };
      
      // Store fleet code to return
      userProfile.fleetCode = fleetCode;
    } else {
      // Driver profile - find fleet by code
      const fleet = await db.collection('fleets').findOne({ code: fleetData.fleetCode });
      
      if (!fleet) {
        return res.status(404).json({ error: 'Invalid fleet code. Please check with your fleet admin.' });
      }
      
      userProfile = {
        userId,
        email,
        role: 'driver',
        fleetId: fleet._id.toString(),
        name: fleetData.name || email.split('@')[0],
        phone: fleetData.phone || '',
        licenseNumber: fleetData.licenseNumber || '',
        assignedVehicles: [], // Will be populated by fleet admin
        createdAt: new Date()
      };
    }

    // Remove fleetCode from profile before saving (we only return it, don't store it)
    const fleetCode = userProfile.fleetCode;
    delete userProfile.fleetCode;
    
    await db.collection('users').insertOne(userProfile);
    
    return res.json({ 
      success: true, 
      role,
      fleetId: userProfile.fleetId,
      fleetCode: fleetCode || undefined // Only for fleet admins
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.uid;

    const userProfile = await db.collection('users').findOne({ userId });

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const response = {
      userId: userProfile.userId,
      email: userProfile.email,
      role: userProfile.role,
      fleetId: userProfile.fleetId,
      name: userProfile.name,
      phone: userProfile.phone,
      companyName: userProfile.companyName,
      assignedVehicles: userProfile.assignedVehicles || []
    };

    // If fleet admin, get the fleet code from the fleet collection
    if (userProfile.role === 'fleet_admin' && userProfile.fleetId) {
      const fleet = await db.collection('fleets').findOne({ 
        $or: [
          { _id: userProfile.fleetId },
          { adminUserId: userId }
        ]
      });
      if (fleet) {
        response.fleetCode = fleet.code;
      }
    }

    return res.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.uid;
    const { name, phone, companyName } = req.body;

    const updateData = { name, phone, updatedAt: new Date() };
    
    // Only update companyName if user is fleet admin
    if (companyName !== undefined) {
      const user = await db.collection('users').findOne({ userId });
      if (user && user.role === 'fleet_admin') {
        updateData.companyName = companyName;
        // Also update fleet collection
        await db.collection('fleets').updateOne(
          { _id: new (await import('mongodb')).ObjectId(user.fleetId) },
          { $set: { companyName, name: companyName } }
        );
      }
    }

    await db.collection('users').updateOne(
      { userId },
      { $set: updateData }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all drivers in fleet (Fleet Admin only)
router.get('/drivers', async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.uid;

    // Get the admin's profile to get fleetId
    const adminProfile = await db.collection('users').findOne({ userId });
    
    if (!adminProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (adminProfile.role !== 'fleet_admin') {
      return res.status(403).json({ error: 'Only fleet admins can view drivers' });
    }

    // Get all drivers in this fleet with their trip statistics
    const drivers = await db.collection('users').aggregate([
      {
        $match: {
          fleetId: adminProfile.fleetId,
          role: 'driver'
        }
      },
      {
        $lookup: {
          from: 'trips',
          let: { driverId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$driverId'] },
                    { $eq: ['$fleetId', adminProfile.fleetId] }
                  ]
                }
              }
            }
          ],
          as: 'trips'
        }
      },
      {
        $addFields: {
          totalTrips: { $size: '$trips' },
          activeTrips: {
            $size: {
              $filter: {
                input: '$trips',
                as: 'trip',
                cond: { $eq: ['$$trip.status', 'active'] }
              }
            }
          },
          completedTrips: {
            $size: {
              $filter: {
                input: '$trips',
                as: 'trip',
                cond: { $eq: ['$$trip.status', 'completed'] }
              }
            }
          },
          totalDistance: {
            $sum: '$trips.distanceKm'
          },
          totalFuel: {
            $sum: '$trips.fuelUsed'
          },
          avgEfficiency: {
            $cond: {
              if: { $gt: [{ $size: '$trips' }, 0] },
              then: { $avg: '$trips.efficiencyScore' },
              else: 0
            }
          },
          totalEarnings: {
            $multiply: [{ $sum: '$trips.distanceKm' }, 12]
          },
          // Get most used vehicle
          primaryVehicleId: {
            $arrayElemAt: [
              {
                $map: {
                  input: { $slice: [
                    {
                      $sortArray: {
                        input: {
                          $map: {
                            input: {
                              $setUnion: '$trips.vehicleId'
                            },
                            as: 'vid',
                            in: {
                              vehicleId: '$$vid',
                              count: {
                                $size: {
                                  $filter: {
                                    input: '$trips',
                                    as: 'trip',
                                    cond: { $eq: ['$$trip.vehicleId', '$$vid'] }
                                  }
                                }
                              }
                            }
                          }
                        },
                        sortBy: { count: -1 }
                      }
                    }, 1]
                  },
                  as: 'v',
                  in: '$$v.vehicleId'
                }
              }, 0]
          },
          lastTripDate: { $max: '$trips.endTime' }
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'primaryVehicleId',
          foreignField: '_id',
          as: 'vehicleInfo'
        }
      },
      {
        $addFields: {
          primaryVehicle: {
            $cond: {
              if: { $gt: [{ $size: '$vehicleInfo' }, 0] },
              then: { $arrayElemAt: ['$vehicleInfo.model', 0] },
              else: 'Not Assigned'
            }
          }
        }
      },
      {
        $project: {
          trips: 0,  // Remove the trips array from output to reduce payload
          vehicleInfo: 0,
          primaryVehicleId: 0
        }
      },
      { $sort: { totalTrips: -1 } }
    ]).toArray();

    return res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// Get fleet code (Fleet Admin only)
router.get('/fleet-code', async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.uid;

    // Get the admin's profile
    const adminProfile = await db.collection('users').findOne({ userId });
    
    if (!adminProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (adminProfile.role !== 'fleet_admin') {
      return res.status(403).json({ error: 'Only fleet admins can view fleet code' });
    }

    // Handle demo fleet ID (string) vs regular fleet ID (ObjectId)
    let fleet;
    if (adminProfile.fleetId === 'demo_fleet_001') {
      // Demo fleet - use string ID
      fleet = await db.collection('fleets').findOne({ 
        fleetId: 'demo_fleet_001'
      });
      // If not found by fleetId, try _id as string
      if (!fleet) {
        fleet = await db.collection('fleets').findOne({ 
          _id: 'demo_fleet_001'
        });
      }
    } else {
      // Regular fleet - use ObjectId
      const { ObjectId } = await import('mongodb');
      fleet = await db.collection('fleets').findOne({ 
        _id: new ObjectId(adminProfile.fleetId)
      });
    }

    if (!fleet) {
      return res.status(404).json({ error: 'Fleet not found' });
    }

    return res.json({ fleetCode: fleet.code || 'DEMO2024' });
  } catch (error) {
    console.error('Error fetching fleet code:', error);
    return res.status(500).json({ error: 'Failed to fetch fleet code' });
  }
});

export default router;
