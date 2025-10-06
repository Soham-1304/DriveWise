import admin from 'firebase-admin';

let initialized = false;

export function initializeFirebase() {
  if (!initialized) {
    const serviceAccount = process.env.FIREBASE_ADMIN_SA;
    if (!serviceAccount) {
      throw new Error('FIREBASE_ADMIN_SA environment variable is not set');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount))
    });
    initialized = true;
    console.log('✓ Firebase Admin initialized');
  }
}

export async function verifyToken(req, res, next) {
  // Skip verification if already authenticated by testAuth
  if (req.authenticated && req.user) {
    return next();
  }
  
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  
  if (!match) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    
    // 🎯 DEMO ACCOUNT MAPPING
    // Map demo accounts to their respective roles in demo fleet
    if (decoded.email === 'sohamiscoding@gmail.com') {
      console.log('🎯 Demo admin account detected:', decoded.email);
      req.user = {
        ...decoded,
        uid: 'soham_dev', // Demo fleet admin user ID
        email: 'sohamiscoding@gmail.com',
        fleetId: 'demo_fleet_001',
        role: 'fleet_admin'
      };
    } else if (decoded.email === 'sohamkarandikar007@gmail.com') {
      console.log('🚗 Demo driver account detected:', decoded.email);
      req.user = {
        ...decoded,
        uid: 'soham_driver', // Demo driver user ID
        email: 'sohamkarandikar007@gmail.com',
        fleetId: 'demo_fleet_001',
        role: 'driver'
      };
    } else {
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
