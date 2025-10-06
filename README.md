# 🚗 FuelOptimizer - Intelligent Fleet Management System# Fuel Optimizer - 1-Day Prototype

A comprehensive fuel optimization and fleet management platform built with React, Node.js, MongoDB, and Firebase. The system provides real-time route optimization, GPS tracking, driver analytics, and fuel efficiency monitoring for fleet operations.A fuel/energy consumption optimizer that helps drivers and fleet managers track trips, optimize routes, and reduce fuel costs.

---## 🚀 Quick Start

## 📋 Table of Contents### Prerequisites

- [Features Overview](#features-overview)- Node.js 18+ installed

- [Technology Stack](#technology-stack)- Firebase project created

- [System Architecture](#system-architecture)- MongoDB Atlas M0 cluster created

- [Core Features](#core-features)- Vercel account (for deployment)

- [Data Structures & Algorithms](#data-structures--algorithms)

- [Database Design (MongoDB)](#database-design-mongodb)### Setup Instructions

- [Authentication & Security (Firebase)](#authentication--security-firebase)

- [Advanced JavaScript Features](#advanced-javascript-features)#### 1. Firebase Setup

- [API Endpoints](#api-endpoints)

- [Setup & Installation](#setup--installation)1. Go to [Firebase Console](https://console.firebase.google.com/)

- [Usage Guide](#usage-guide)2. Create a new project

3. Enable Authentication (Email/Password and Google)

---4. Create a web app and copy the config

5. Generate a service account key (Project Settings > Service Accounts > Generate New Private Key)

## 🎯 Features Overview

#### 2. MongoDB Setup

### **For Fleet Administrators**

- 📊 Real-time fleet analytics dashboard1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

- 🚙 Vehicle management with fuel consumption tracking2. Create a free M0 cluster

- 👥 Driver management with performance metrics3. Create a database user

- 🗺️ Live GPS tracking of active trips4. Whitelist your IP (or use 0.0.0.0/0 for development)

- 📈 Fuel efficiency analytics and trends5. Get the connection string

- 🎯 Driver performance comparison

#### 3. Backend Setup

### **For Drivers**

- 🛣️ Intelligent route planning (Fastest/Greenest/Shortest/Custom)```bash

- 📍 Real-time GPS tracking during tripscd backend

- ⛽ Live fuel consumption monitoringnpm install

- 📊 Personal trip history and statistics

- 🏆 Efficiency scoring and feedback# Create .env file

- 🎮 Interactive map with route visualizationcp .env.example .env

```

---

Edit `.env` with your credentials:

## 🛠️ Technology Stack

```

### **Frontend**MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fuel_db

- **React 18** - Component-based UI frameworkFIREBASE_ADMIN_SA={"type":"service_account",...}

- **React Router v6** - Client-side routingOSRM_URL=https://router.project-osrm.org

- **Axios** - HTTP client for API callsPORT=3000

- **Leaflet.js** - Interactive maps and geolocation```

- **Recharts** - Data visualization (charts & graphs)

- **Lucide React** - Modern icon libraryCreate MongoDB indexes:

- **Tailwind CSS** - Utility-first styling

````bash

### **Backend**# Connect to MongoDB using mongosh or MongoDB Compass

- **Node.js** - JavaScript runtimeuse fuel_db;

- **Express.js** - Web application frameworkdb.vehicles.createIndex({ userId: 1 });

- **MongoDB** - NoSQL databasedb.trips.createIndex({ vehicleId: 1, startTime: -1 });

- **Firebase Admin SDK** - Authentication & authorizationdb.trips.createIndex({ userId: 1, startTime: -1 });

db.telemetry.createIndex({ tripId: 1, createdAt: 1 });

### **External APIs**db.telemetry.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

- **OSRM (Open Source Routing Machine)** - Route optimization```

- **OpenStreetMap** - Map tiles and geocoding

- **Mapbox** - Premium map tilesStart the backend:



### **Authentication**```bash

- **Firebase Authentication** - User managementnpm run dev

- **JWT Tokens** - Secure API access```

- **Role-based Access Control** - Admin/Driver permissions

#### 4. Frontend Setup

---

```bash

## 🏗️ System Architecturecd frontend

npm install

````

┌─────────────────────────────────────────────────────────────┐

│ React Frontend (Port 5173) │Edit `src/firebase.js` with your Firebase config:

│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │

│ │ Driver │ │ Fleet │ │ Maps │ │```javascript

│ │ Dashboard │ │ Admin │ │ & Routes │ │const firebaseConfig = {

│ └──────────────┘ └──────────────┘ └──────────────┘ │ apiKey: "YOUR_API_KEY",

└─────────────────────────────────────────────────────────────┘ authDomain: "YOUR_PROJECT.firebaseapp.com",

                            ↕ HTTP/REST API  projectId: "YOUR_PROJECT_ID",

┌─────────────────────────────────────────────────────────────┐ storageBucket: "YOUR_PROJECT.appspot.com",

│ Express.js Backend (Port 3000) │ messagingSenderId: "YOUR_SENDER_ID",

│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ appId: "YOUR_APP_ID",

│ │ Auth │ │ Trips │ │ Fleet │ │};

│ │ Middleware │ │ Routes │ │ Routes │ │```

│ └──────────────┘ └──────────────┘ └──────────────┘ │

└─────────────────────────────────────────────────────────────┘Start the frontend:

                            ↕

┌─────────────────────────────────────────────────────────────┐```bash

│ MongoDB Atlas Database │npm run dev

│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │```

│ │ users │ │ trips │ │ telemetry │ │

│ │ vehicles │ │ fleets │ │ trips_raw │ │Visit: `http://localhost:5173`

│ └──────────────┘ └──────────────┘ └──────────────┘ │

└─────────────────────────────────────────────────────────────┘## 📁 Project Structure

                            ↕

┌─────────────────────────────────────────────────────────────┐```

│ Firebase Authentication Service │fuel-prototype/

└─────────────────────────────────────────────────────────────┘├── frontend/

````│ ├── src/

│   │   ├── components/     # Reusable components

---│   │   ├── pages/          # Page components

│   │   ├── hooks/          # Custom React hooks

## ✨ Core Features│   │   ├── firebase.js     # Firebase configuration

│   │   ├── App.jsx         # Main app component

### 🗺️ **1. Intelligent Route Planning**│   │   └── main.jsx        # Entry point

│   ├── package.json

**Multiple Route Optimization Strategies:**│   └── vite.config.js

- **Fastest Route** - Minimizes travel time using highway preferences│

- **Greenest Route** - Optimizes for fuel efficiency (EV/Hybrid friendly)└── backend/

- **Shortest Route** - Minimizes total distance    ├── routes/             # API route handlers

- **Custom Route** - User-defined waypoints    ├── middleware/         # Auth middleware

    ├── db.js              # MongoDB connection

**Route Algorithms:**    ├── index.js           # Express server

- Uses OSRM API for route calculation    └── package.json

- Implements Dijkstra's shortest path algorithm```

- Real-time traffic consideration

- Turn-by-turn navigation instructions## 🔧 Tech Stack



**Features:****Frontend:**

- Interactive map with route preview

- Distance and duration estimates- React 18 (Vite)

- Elevation profile visualization- Tailwind CSS

- Alternative route suggestions- Firebase Auth

- React Router

### 📍 **2. Real-Time GPS Tracking**- Leaflet (maps)

- Chart.js

**Live Telemetry Collection:**- Axios

- GPS coordinates (latitude/longitude)

- Speed tracking (km/h)**Backend:**

- Timestamp synchronization

- Battery/fuel level monitoring- Node.js + Express

- MongoDB Atlas

**Data Processing:**- Firebase Admin SDK

- Haversine formula for distance calculation- OSRM (routing)

- Speed averaging algorithms

- Route adherence detection## 🎯 Core Features

- Harsh acceleration/braking detection

### ✅ Implemented

**Implementation:**

```javascript- Firebase Authentication (Email + Google)

// Haversine Distance Calculation- Vehicle profile management

function haversine(coord1, coord2) {- Trip tracking with GPS

  const R = 6371; // Earth's radius in km- Telemetry data collection

  const dLat = (coord2.lat - coord1.lat) * toRad;- Trip analytics and summaries

  const dLng = (coord2.lng - coord1.lng) * toRad;- Route optimization (OSRM)

  const a = Math.sin(dLat/2) ** 2 + - Dashboard with KPIs

            Math.cos(lat1) * Math.cos(lat2) *

            Math.sin(dLng/2) ** 2;### 🚧 To Be Implemented

  return 2 * R * Math.asin(Math.sqrt(a));

}- Dashboard UI with charts

```- Trip detail maps

- CSV export

### ⛽ **3. Fuel Efficiency Analytics**- Fleet admin panel

- Demo video recording

**Real-Time Monitoring:**

- Fuel consumption tracking (L/km or kWh/km)## 📊 API Endpoints

- Efficiency scoring (0-100)

- Fuel saved vs. worst-case scenario### Vehicles

- Cost savings calculation

- `POST /api/vehicles` - Create vehicle

**Efficiency Score Calculation:**- `GET /api/vehicles` - List vehicles

```javascript- `GET /api/vehicles/:id` - Get vehicle

// Multi-factor efficiency algorithm- `PUT /api/vehicles/:id` - Update vehicle

efficiencyScore = (- `DELETE /api/vehicles/:id` - Delete vehicle

  speedScore * 0.3 +          // Optimal speed maintenance

  smoothnessScore * 0.3 +     // Smooth acceleration/braking### Trips

  routeAdherenceScore * 0.2 + // Staying on planned route

  distanceEfficiency * 0.2    // Minimizing extra distance- `POST /api/trip/start` - Start trip

)- `POST /api/trip/telemetry` - Send telemetry data

```- `POST /api/trip/end` - End trip

- `GET /api/trips` - List trips

**Analytics Dashboard:**- `GET /api/trips/:id` - Get trip details

- Pie charts for efficiency distribution

- Bar charts for driver comparison### Analytics

- Line graphs for monthly trends

- Top performers leaderboard- `GET /api/analytics/summary` - Get summary stats



### 🚗 **4. Trip Management**### Route



**Trip Lifecycle:**- `POST /api/route/optimize` - Optimize route

````

START → GPS TRACKING → TELEMETRY COLLECTION → END → ANALYSIS## 🚀 Deployment

````

### Deploy Backend to Vercel

**Trip States:**

- `running` - Active trip in progress```bash

- `finished` - Completed tripcd backend

- `cancelled` - Manually stopped tripnpm install -g vercel

vercel

**Data Collection:**```

- Start/end coordinates

- Total distance traveledSet environment variables in Vercel dashboard:

- Duration (seconds)

- Average/max speed- `MONGODB_URI`

- Fuel consumed- `FIREBASE_ADMIN_SA`

- Driving behavior metrics- `OSRM_URL`



**Trip Summary Includes:**### Deploy Frontend to Firebase

- Distance: Actual vs. Planned

- Route adherence percentage```bash

- Fuel efficiency scorecd frontend

- Driving behavior breakdownnpm run build

- Detailed telemetry playbackfirebase login

firebase init hosting

### 📊 **5. Fleet Analytics Dashboard**firebase deploy --only hosting

````

**Key Metrics:**

- Total fleet fuel consumption## 📝 Next Steps

- Average efficiency scores

- Active vs. idle vehicles1. Complete Dashboard UI with charts and trip visualization

- Monthly trend analysis2. Implement trip detail page with Leaflet maps

- Driver performance rankings3. Add CSV export functionality

4. Build fleet admin interface

**Visualizations:**5. Record 2-3 minute demo video

- **Pie Chart** - Fleet efficiency distribution (Excellent/Good/Poor)6. Polish UI/UX

- **Bar Chart** - Top 5 most efficient drivers7. Add error boundaries and loading states

- **Line Chart** - Monthly fuel consumption trends8. Implement driver coaching tips

- **Data Table** - Detailed driver statistics9. Add fuel/charging station integration

**Real-Time Updates:**## 📄 License

- Auto-refresh every 10 seconds

- WebSocket-ready architectureMIT

- Live trip status updates

## 👥 Contributors

### 🗺️ **6. Live Fleet Tracking**

Built for SEM Project - Fuel/Energy Consumption Optimizer

**Features:**

- Real-time vehicle positions on map
- Start (green) and current (blue) position markers
- Polyline visualization of driven path
- Click-to-focus on individual trips
- Auto-bounds adjustment for optimal view

**Trip Cards Display:**

- Vehicle name and driver info
- Current speed and distance
- Trip duration counter
- GPS points collected
- Route type indicator

**Map Interactions:**

- Zoom/pan controls
- Popup information on markers
- Route path highlighting
- Multiple map tile layers

### 👥 **7. Driver Management**

**Fleet Admin Capabilities:**

- View all drivers in fleet
- Assign vehicles to drivers
- Monitor active trips
- View individual trip histories
- Track performance metrics

**Driver Statistics:**

- Total trips completed
- Active trip status
- Total distance driven
- Average efficiency score
- Vehicle assignment status

**Driver Trip History Page:**

- Complete trip log with filters
- Statistics dashboard
- Efficiency-based filtering (All/Excellent/Good/Poor)
- Detailed trip breakdowns
- Performance trends

---

## 🧮 Data Structures & Algorithms

### **1. Graph Algorithms**

**Dijkstra's Shortest Path** (via OSRM)

- Used for route optimization
- Finds minimum-cost path between nodes
- Considers edge weights (distance, time, fuel)

**A\* Pathfinding** (OSRM implementation)

- Heuristic-based search algorithm
- Faster than Dijkstra for specific destinations
- Uses geographic distance as heuristic

### **2. Geospatial Algorithms**

**Haversine Formula**

```javascript
// Great-circle distance between two points on Earth
distance = 2 * R * arcsin(√(sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)))
```

- **Use Cases:**
  - Distance calculation between GPS points
  - Route adherence checking
  - Proximity detection

**Bounding Box Calculations**

```javascript
// Map bounds for displaying routes
bounds = L.latLngBounds(coordinateArray);
map.fitBounds(bounds, { padding: [50, 50] });
```

### **3. Data Structures Used**

**Arrays**

- Telemetry point storage: `[{lat, lng, speed, timestamp}, ...]`
- Route coordinate arrays: `[[lat1, lng1], [lat2, lng2], ...]`
- Trip history lists

**Objects/Hash Maps**

```javascript
// Driver statistics mapping
driverStats = {
  userId1: { totalTrips: 10, activeTrips: 1 },
  userId2: { totalTrips: 15, activeTrips: 0 },
};
```

**Queues**

- Telemetry buffer for batch processing
- Real-time event processing

**Time Series Data**

```javascript
// Telemetry time series
telemetry: [
  { timestamp: "2025-10-06T10:00:00Z", lat: 19.076, lng: 72.8777, speed: 45 },
  { timestamp: "2025-10-06T10:00:05Z", lat: 19.0762, lng: 72.878, speed: 47 },
];
```

### **4. Sorting & Filtering Algorithms**

**Trip Sorting**

```javascript
// MongoDB sort (uses Timsort internally)
trips.sort({ startTime: -1 }); // Latest first
```

**Driver Ranking**

```javascript
// Efficiency-based sorting
drivers.sort((a, b) => b.avgEfficiency - a.avgEfficiency);
```

**Filter Implementation**

```javascript
// Efficiency category filtering
const filtered = trips.filter((trip) => {
  if (filter === "excellent") return trip.efficiencyScore >= 80;
  if (filter === "good")
    return trip.efficiencyScore >= 60 && trip.efficiencyScore < 80;
  if (filter === "poor") return trip.efficiencyScore < 60;
  return true;
});
```

### **5. Aggregation Algorithms**

**Statistical Calculations**

```javascript
// Average efficiency
avgEfficiency =
  trips.reduce((sum, t) => sum + t.efficiencyScore, 0) / trips.length;

// Total distance
totalDistance = trips.reduce((sum, t) => sum + t.distanceKm, 0);

// Fuel saved summation
totalSaved = trips.reduce((sum, t) => sum + t.fuelSaved, 0);
```

**MongoDB Aggregation Pipeline**

```javascript
db.collection("trips").aggregate([
  { $match: { fleetId: "abc123" } },
  {
    $group: {
      _id: "$userId",
      totalDistance: { $sum: "$distanceKm" },
      avgEfficiency: { $avg: "$efficiencyScore" },
    },
  },
  { $sort: { avgEfficiency: -1 } },
]);
```

---

## 🗄️ Database Design (MongoDB)

### **Collection Schemas**

#### **1. users**

```javascript
{
  _id: ObjectId,
  userId: String,              // Firebase UID
  email: String,
  name: String,
  phone: String,
  role: String,                // 'driver' | 'fleet_admin'
  fleetId: String,             // Reference to fleet
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `userId` (unique)
- `fleetId` + `role`

#### **2. vehicles**

```javascript
{
  _id: ObjectId,
  fleetId: String,
  make: String,                // 'Tesla', 'Toyota', etc.
  model: String,               // 'Model 3', 'Innova', etc.
  year: Number,
  licensePlate: String,
  fuelType: String,            // 'ICE', 'EV', 'Hybrid'
  fuelConsumption: Number,     // L/100km or kWh/100km
  assignedDriverId: String,    // userId of assigned driver
  status: String,              // 'active', 'maintenance', 'deleted'
  createdAt: Date
}
```

**Indexes:**

- `fleetId` + `status`
- `assignedDriverId`

#### **3. trips**

```javascript
{
  _id: ObjectId,
  tripId: String,
  userId: String,
  vehicleId: String,
  routeId: String,             // 'fastest', 'greenest', 'shortest'
  startTime: Date,
  endTime: Date,
  distanceKm: Number,
  plannedDistanceKm: Number,
  extraDistanceKm: Number,
  routeAdherence: Number,      // Percentage
  durationSec: Number,
  avgSpeed: Number,
  maxSpeed: Number,
  estimatedUsed: Number,       // Fuel consumed
  fuelSaved: Number,
  efficiencyScore: Number,     // 0-100
  drivingBehavior: {
    speedScore: Number,
    smoothnessScore: Number,
    deviationScore: Number,
    optimalSpeedPercentage: Number,
    highSpeedPercentage: Number,
    harshAccelCount: Number
  },
  fuelType: String,
  createdAt: Date
}
```

**Indexes:**

- `userId` + `startTime` (desc)
- `vehicleId`
- `efficiencyScore`

#### **4. trips_raw**

```javascript
{
  _id: ObjectId,
  vehicleId: String,
  userId: String,
  name: String,
  routeId: String,
  plannedDistance: Number,
  startTime: Date,
  startFuelLevel: Number,
  startCoords: { lat: Number, lng: Number },
  status: String,              // 'running', 'finished', 'cancelled'
  createdAt: Date
}
```

**Indexes:**

- `userId` + `status`
- `vehicleId` + `status`

#### **5. telemetry**

```javascript
{
  _id: ObjectId,
  tripId: String,
  lat: Number,
  lng: Number,
  speed: Number,               // km/h
  heading: Number,             // Degrees
  altitude: Number,            // Meters
  accuracy: Number,            // Meters
  createdAt: Date
}
```

**Indexes:**

- `tripId` + `createdAt`
- Geospatial index on `{lat, lng}` for proximity queries

#### **6. fleets**

```javascript
{
  _id: ObjectId,
  name: String,
  code: String,                // Unique join code
  adminId: String,             // Fleet owner
  createdAt: Date
}
```

**Indexes:**

- `code` (unique)
- `adminId`

### **Database Optimization Techniques**

**1. Indexing Strategy**

- Compound indexes for frequent queries
- Partial indexes for status-based queries
- TTL indexes for telemetry cleanup (optional)

**2. Aggregation Pipeline**

```javascript
// Fleet analytics aggregation
db.trips.aggregate([
  { $match: { userId: { $in: driverIds } } },
  {
    $group: {
      _id: "$userId",
      totalTrips: { $sum: 1 },
      totalDistance: { $sum: "$distanceKm" },
      avgEfficiency: { $avg: "$efficiencyScore" },
      totalFuelSaved: { $sum: "$fuelSaved" },
    },
  },
  { $sort: { avgEfficiency: -1 } },
  { $limit: 10 },
]);
```

**3. Document Embedding vs Referencing**

- **Embedded**: `drivingBehavior` within trips (frequently accessed together)
- **Referenced**: `userId`, `vehicleId` (separate collections, normalized)

**4. Query Optimization**

```javascript
// Efficient pagination
db.trips.find({ userId: "abc" }).sort({ startTime: -1 }).limit(20).skip(0);

// Projection to reduce data transfer
db.trips.find(
  { userId: "abc" },
  { efficiencyScore: 1, distanceKm: 1, startTime: 1 }
);
```

---

## 🔐 Authentication & Security (Firebase)

### **Authentication Flow**

```
┌─────────────────────────────────────────────────────────────┐
│  1. User Login (Email/Password)                             │
│     ↓                                                        │
│  2. Firebase Authentication                                 │
│     ↓                                                        │
│  3. Generate ID Token (JWT)                                 │
│     ↓                                                        │
│  4. Frontend stores token                                   │
│     ↓                                                        │
│  5. Include token in API requests (Bearer Authorization)    │
│     ↓                                                        │
│  6. Backend verifies token with Firebase Admin SDK          │
│     ↓                                                        │
│  7. Extract user info (UID, email)                          │
│     ↓                                                        │
│  8. Check user role in MongoDB                              │
│     ↓                                                        │
│  9. Authorize access to resources                           │
└─────────────────────────────────────────────────────────────┘
```

### **Firebase Implementation**

**Frontend (Firebase Client SDK):**

```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();

// Include in API requests
axios.get("/api/trips", {
  headers: { Authorization: `Bearer ${token}` },
});
```

**Backend (Firebase Admin SDK):**

```javascript
import admin from "firebase-admin";

// Initialize with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Verification middleware
async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
}
```

### **Role-Based Access Control (RBAC)**

**User Roles:**

- `fleet_admin` - Full fleet management access
- `driver` - Personal trip tracking access

**Authorization Checks:**

```javascript
// Check if user is fleet admin
const userProfile = await db
  .collection("users")
  .findOne({ userId: req.user.uid });
if (userProfile.role !== "fleet_admin") {
  return res.status(403).json({ error: "Admin access required" });
}

// Verify resource ownership
const trip = await db.collection("trips").findOne({ _id: tripId });
if (trip.userId !== req.user.uid && userProfile.role !== "fleet_admin") {
  return res.status(403).json({ error: "Access denied" });
}
```

**Protected Routes (Frontend):**

```javascript
function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(userRole)) return <Navigate to="/" />;

  return children;
}
```

### **Security Best Practices**

1. **Token Expiration** - ID tokens expire after 1 hour
2. **HTTPS Only** - Encrypted communication
3. **Input Validation** - Sanitize all user inputs
4. **SQL Injection Prevention** - MongoDB query parameterization
5. **CORS Configuration** - Restrict allowed origins
6. **Rate Limiting** - Prevent API abuse
7. **Environment Variables** - Secure credential storage

---

## 💻 Advanced JavaScript Features

### **1. ES6+ Syntax**

**Arrow Functions:**

```javascript
const calculateDistance = (p1, p2) => haversine(p1, p2);

const processTrips = trips.map((trip) => ({
  ...trip,
  efficiency: calculateEfficiency(trip),
}));
```

**Destructuring:**

```javascript
// Object destructuring
const { userId, vehicleId, startTime } = trip;
const { lat, lng } = coordinates;

// Array destructuring
const [latitude, longitude] = position;

// Parameter destructuring
function createTrip({ userId, vehicleId, routeId }) {
  // ...
}
```

**Template Literals:**

```javascript
const message = `Trip completed!
Distance: ${distance.toFixed(2)} km
Efficiency: ${efficiencyScore}/100
Fuel saved: ${fuelSaved.toFixed(2)} L`;
```

**Spread Operator:**

```javascript
// Object merging
const enhancedTrip = { ...trip, telemetryCount: points.length };

// Array concatenation
const allPoints = [...startPoints, ...endPoints];
```

**Default Parameters:**

```javascript
async function fetchTrips(limit = 20, offset = 0) {
  // ...
}
```

### **2. Async/Await Patterns**

**Parallel API Calls:**

```javascript
const [drivers, vehicles, trips] = await Promise.all([
  axios.get("/api/auth/drivers"),
  axios.get("/api/fleet/"),
  axios.get("/api/trips"),
]);
```

**Sequential Processing:**

```javascript
for (const trip of activeTrips) {
  const telemetry = await fetchTelemetry(trip.tripId);
  const route = await calculateRoute(telemetry);
  await saveRoute(route);
}
```

**Error Handling:**

```javascript
try {
  const response = await axios.post("/api/trip/start", data);
  setTripData(response.data);
} catch (error) {
  console.error("Trip start failed:", error);
  setError(error.response?.data?.error || "Failed to start trip");
}
```

### **3. Array Methods**

**Map (Transformation):**

```javascript
const routePath = telemetryPoints.map((p) => [p.lat, p.lng]);
const tripIds = trips.map((t) => t._id);
```

**Filter (Selection):**

```javascript
const excellentTrips = trips.filter((t) => t.efficiencyScore >= 80);
const activeDrivers = drivers.filter((d) => d.status === "active");
```

**Reduce (Aggregation):**

```javascript
const totalDistance = trips.reduce((sum, t) => sum + t.distanceKm, 0);

const avgEfficiency =
  trips.reduce((sum, t) => sum + t.efficiencyScore, 0) / trips.length;

const statsByDriver = trips.reduce((acc, trip) => {
  if (!acc[trip.userId]) acc[trip.userId] = [];
  acc[trip.userId].push(trip);
  return acc;
}, {});
```

**Find & FindIndex:**

```javascript
const currentTrip = trips.find((t) => t.status === "running");
const driverIndex = drivers.findIndex((d) => d.userId === selectedId);
```

**Some & Every:**

```javascript
const hasActiveTrip = trips.some((t) => t.status === "running");
const allCompleted = trips.every((t) => t.status === "finished");
```

### **4. React Hooks**

**useState:**

```javascript
const [trips, setTrips] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
```

**useEffect:**

```javascript
useEffect(() => {
  fetchTrips();
  const interval = setInterval(fetchTrips, 10000); // Auto-refresh
  return () => clearInterval(interval); // Cleanup
}, []); // Dependency array
```

**useNavigate:**

```javascript
const navigate = useNavigate();
navigate(`/admin/drivers/${driverId}/trips`);
```

**useParams:**

```javascript
const { driverId, tripId } = useParams();
```

**Custom Hooks:**

```javascript
// useAuth hook
function useAuth() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        setUserRole(profile.role);
      }
    });
    return unsubscribe;
  }, []);

  return { user, userRole };
}
```

---

## 🌐 API Endpoints

### **Authentication Routes** (`/api/auth/`)

| Method | Endpoint    | Description       | Auth Required | Role        |
| ------ | ----------- | ----------------- | ------------- | ----------- |
| POST   | `/register` | Register new user | No            | -           |
| POST   | `/login`    | Login user        | No            | -           |
| GET    | `/profile`  | Get user profile  | Yes           | Any         |
| GET    | `/drivers`  | Get fleet drivers | Yes           | fleet_admin |

### **Trip Routes** (`/api/trips/`)

| Method | Endpoint            | Description            | Auth Required | Role        |
| ------ | ------------------- | ---------------------- | ------------- | ----------- |
| POST   | `/start`            | Start new trip         | Yes           | driver      |
| POST   | `/telemetry`        | Submit GPS data        | Yes           | driver      |
| POST   | `/end`              | End active trip        | Yes           | driver      |
| GET    | `/`                 | Get user trips         | Yes           | Any         |
| GET    | `/active`           | Get active fleet trips | Yes           | fleet_admin |
| GET    | `/:id`              | Get trip details       | Yes           | Any         |
| GET    | `/driver/:driverId` | Get driver trips       | Yes           | fleet_admin |

### **Fleet Routes** (`/api/fleet/`)

| Method | Endpoint              | Description        | Auth Required | Role        |
| ------ | --------------------- | ------------------ | ------------- | ----------- |
| GET    | `/`                   | Get fleet vehicles | Yes           | Any         |
| POST   | `/`                   | Add vehicle        | Yes           | fleet_admin |
| PUT    | `/:id`                | Update vehicle     | Yes           | fleet_admin |
| DELETE | `/:id`                | Delete vehicle     | Yes           | fleet_admin |
| GET    | `/analytics/overview` | Fleet analytics    | Yes           | fleet_admin |

---

## 🚀 Setup & Installation

### **Prerequisites**

- Node.js v18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Firebase project with Authentication enabled
- Git

### **1. Clone Repository**

```bash
git clone https://github.com/yourusername/FuelOptimizer.git
cd FuelOptimizer
```

### **2. Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/fuel_db
FIREBASE_ADMIN_SA={"type":"service_account",...}
OSRM_URL=https://router.project-osrm.org
PORT=3000
EOF

# Start server
node index.js
```

### **3. Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (if needed)
# Update vite.config.js proxy settings

# Start development server
npm run dev
```

### **4. Access Application**

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 📖 Usage Guide

### **For Fleet Administrators**

**1. Register as Fleet Admin:**

```
→ Go to /register
→ Enter details (email, name, phone)
→ Select role: "Fleet Administrator"
→ Click Register
```

**2. Add Vehicles:**

```
→ Navigate to Vehicles page
→ Click "Add New Vehicle"
→ Fill details (make, model, fuel type, consumption)
→ Submit
```

**3. Invite Drivers:**

```
→ Go to Drivers page
→ Copy fleet code
→ Share code with drivers
```

**4. Monitor Fleet:**

```
→ Dashboard: View overall analytics
→ Live Tracking: See active trips in real-time
→ Analytics: Review efficiency trends
→ Drivers: Check individual performance
```

### **For Drivers**

**1. Join Fleet:**

```
→ Register with fleet code
→ Select role: "Driver"
→ Complete registration
```

**2. Plan Route:**

```
→ Go to Route Planner
→ Enter destination
→ Choose route type (Fastest/Greenest/Shortest)
→ Review route preview
```

**3. Start Trip:**

```
→ Click "Start Trip"
→ Allow GPS permissions
→ Drive following the route
→ Monitor real-time stats
```

**4. End Trip:**

```
→ Click "Stop Trip"
→ Review trip summary
→ View efficiency score
→ Check trip history
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Contributors

- **Soham Karandikar** - Full Stack Developer

---

**Made with ❤️ and ⚡ by Soham Karandikar**
