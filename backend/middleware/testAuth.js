/**
 * Test Authentication Bypass for Demo
 * 
 * This middleware bypasses JWT verification when using demo credentials
 * ONLY FOR TESTING - REMOVE IN PRODUCTION
 */

const testAuth = (req, res, next) => {
  // Check if it's a test request
  const testKey = req.headers['x-test-key'];
  
  if (testKey === 'DEMO_TEST_2024') {
    // Inject demo user credentials and SKIP further auth checks
    req.user = {
      uid: 'soham_dev',
      email: 'sohamiscoding@gmail.com',
      role: 'fleet_admin',
      fleetId: 'demo_fleet_001'
    };
    // Mark as authenticated to bypass verifyToken
    req.authenticated = true;
  }
  
  // Always continue to next middleware
  next();
};

export default testAuth;
