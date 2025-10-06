import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase, verifyToken } from './middleware/auth.js';
import testAuth from './middleware/testAuth.js';
import { getDb } from './db.js';
import vehiclesRouter from './routes/vehicles.js';
import tripsRouter from './routes/trips.js';
import analyticsRouter from './routes/analytics.js';
import routeRouter from './routes/route.js';
import customRouteRouter from './routes/customRoute.js';
import geocodingRouter from './routes/geocoding.js';
import authRouter from './routes/auth.js';
import fleetRouter from './routes/fleet.js';
import fleetAnalyticsRouter from './routes/fleetAnalytics.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - Allow Frontend Origins
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Production Firebase URL
  /\.web\.app$/, // Firebase hosting domains
  /\.firebaseapp\.com$/ // Firebase app domains
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway in development, log warning
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Test-Key']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Initialize Firebase
initializeFirebase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth required)
app.use('/api/geocode', geocodingRouter);

// Protected routes (with test auth bypass)
// Note: More specific routes (fleetAnalyticsRouter) must come BEFORE generic routes (fleetRouter)
// to prevent the /:id catch-all from intercepting analytics routes
app.use('/api/auth', testAuth, verifyToken, authRouter);
app.use('/api/fleet', testAuth, verifyToken, fleetAnalyticsRouter); // Advanced fleet analytics (MUST be first)
app.use('/api/fleet', testAuth, verifyToken, fleetRouter); // Generic fleet routes (MUST be after analytics)
app.use('/api/pois', testAuth, verifyToken, fleetAnalyticsRouter); // POIs geospatial queries  
app.use('/api/vehicles', testAuth, verifyToken, vehiclesRouter);
app.use('/api/trip', testAuth, verifyToken, tripsRouter);
app.use('/api/trips', testAuth, verifyToken, tripsRouter);
app.use('/api/analytics', testAuth, verifyToken, analyticsRouter);
app.use('/api/analytics', testAuth, verifyToken, fleetAnalyticsRouter); // Advanced analytics
app.use('/api/route', testAuth, verifyToken, routeRouter);
app.use('/api/route', testAuth, verifyToken, customRouteRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await getDb();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
