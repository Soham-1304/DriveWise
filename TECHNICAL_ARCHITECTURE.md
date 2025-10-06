# FuelOptimizer - Technical Architecture Documentation

## 📋 Table of Contents

1. [Data Structures & Algorithms (DSA) Implementation](#dsa-implementation)
2. [MongoDB Integration](#mongodb-integration)
3. [Firebase Authentication](#firebase-integration)
4. [System Architecture](#system-architecture)

---

## 🧮 DSA Implementation

### Overview

Our project implements **5 core DSA algorithms** for route optimization and fleet management.

### 1. **Dijkstra's Algorithm** - Fastest Route

**Location:** `/backend/algorithms/dijkstra.js`

**Purpose:** Find the shortest path (minimum time) between two points

**How it works:**

- Builds a weighted graph from Mumbai road network
- Uses a priority queue (min-heap) to select the node with minimum distance
- Tracks visited nodes to avoid cycles
- Returns optimal path with minimum travel time

**Code Structure:**

```javascript
export function dijkstra(graph, start, end) {
  const distances = {}; // Track shortest distance to each node
  const previous = {}; // Track path
  const pq = new PriorityQueue(); // Min-heap for efficiency

  // Initialize distances to infinity
  for (const node in graph) {
    distances[node] = node === start ? 0 : Infinity;
  }

  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue().element;

    if (current === end) break; // Found destination

    // Check all neighbors
    for (const neighbor in graph[current]) {
      const distance = distances[current] + graph[current][neighbor];

      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = current;
        pq.enqueue(neighbor, distance);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = end;
  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return { path, distance: distances[end] };
}
```

**Time Complexity:** O((V + E) log V) where V = vertices, E = edges
**Space Complexity:** O(V)

**Used in:**

- `POST /api/route/custom` - Fastest route option
- Real-time route planning for drivers

---

### 2. **A\* (A-Star) Algorithm** - Intelligent Pathfinding

**Location:** `/backend/algorithms/astar.js`

**Purpose:** Find optimal path using heuristics (faster than Dijkstra for known destinations)

**How it works:**

- Combines actual distance (g-score) with estimated distance to goal (h-score)
- Uses heuristic function (Haversine distance) to guide search
- Explores most promising nodes first
- Guarantees optimal path if heuristic is admissible

**Code Structure:**

```javascript
export function astar(graph, start, end, heuristic) {
  const openSet = new PriorityQueue(); // Nodes to explore
  const cameFrom = {}; // Path tracking
  const gScore = {}; // Actual distance from start
  const fScore = {}; // gScore + heuristic

  // Initialize scores
  for (const node in graph) {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
  }

  gScore[start] = 0;
  fScore[start] = heuristic(start, end);
  openSet.enqueue(start, fScore[start]);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue().element;

    if (current === end) {
      return reconstructPath(cameFrom, current);
    }

    for (const neighbor in graph[current]) {
      const tentativeGScore = gScore[current] + graph[current][neighbor];

      if (tentativeGScore < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, end);

        if (!openSet.contains(neighbor)) {
          openSet.enqueue(neighbor, fScore[neighbor]);
        }
      }
    }
  }

  return null; // No path found
}
```

**Heuristic Function (Haversine):**

```javascript
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

**Time Complexity:** O(b^d) where b = branching factor, d = depth (much better with good heuristic)
**Space Complexity:** O(b^d)

**Used in:**

- Alternative to Dijkstra when destination is known
- Traffic-aware routing

---

### 3. **Dynamic Programming** - Fuel Optimization

**Location:** `/backend/algorithms/dpRefuel.js`

**Purpose:** Find route that minimizes fuel consumption using optimal refueling strategy

**How it works:**

- Breaks route into segments
- Uses DP table to store minimum fuel for each segment
- Considers fuel station locations and fuel prices
- Optimizes refuel amounts at each station

**Code Structure:**

```javascript
export function ecoRoute(segments, fuelStations, tankCapacity, currentFuel) {
  const n = segments.length;
  const dp = Array(n + 1).fill(Infinity);
  const refuel = Array(n + 1).fill(0);

  dp[0] = 0; // Starting point

  // For each segment
  for (let i = 0; i < n; i++) {
    const segmentFuel = segments[i].fuelNeeded;

    // Try refueling at each station before this segment
    for (const station of fuelStations) {
      if (station.position <= i) {
        const fuelNeeded = segmentFuel - currentFuel;
        const refuelAmount = Math.min(fuelNeeded, tankCapacity);
        const cost = refuelAmount * station.price;

        if (dp[station.position] + cost < dp[i + 1]) {
          dp[i + 1] = dp[station.position] + cost;
          refuel[i + 1] = refuelAmount;
        }
      }
    }
  }

  return {
    minCost: dp[n],
    refuelPlan: refuel,
    savings: baselineCost - dp[n],
  };
}
```

**Time Complexity:** O(n × m) where n = segments, m = fuel stations
**Space Complexity:** O(n)

**Used in:**

- `POST /api/route/custom` - ECO route option
- Fuel savings calculations

---

### 4. **K-Means Clustering** - POI Grouping

**Location:** `/backend/algorithms/kmeans.js`

**Purpose:** Group Points of Interest (POIs) along route for casual/scenic routes

**How it works:**

- Clusters nearby POIs (restaurants, fuel stations, rest stops)
- Uses Euclidean distance to group similar locations
- Iteratively refines cluster centers
- Suggests optimal stops along the route

**Code Structure:**

```javascript
export function kmeans(points, k, maxIterations = 100) {
  // Initialize k random centroids
  let centroids = initializeCentroids(points, k);
  let clusters = [];
  let iterations = 0;

  while (iterations < maxIterations) {
    // Assign points to nearest centroid
    clusters = Array(k)
      .fill()
      .map(() => []);

    for (const point of points) {
      const nearestCentroid = findNearestCentroid(point, centroids);
      clusters[nearestCentroid].push(point);
    }

    // Calculate new centroids
    const newCentroids = clusters.map((cluster) => {
      if (cluster.length === 0) return centroids[clusters.indexOf(cluster)];

      const avgLat =
        cluster.reduce((sum, p) => sum + p.lat, 0) / cluster.length;
      const avgLng =
        cluster.reduce((sum, p) => sum + p.lng, 0) / cluster.length;

      return { lat: avgLat, lng: avgLng };
    });

    // Check for convergence
    if (centroidsEqual(centroids, newCentroids)) break;

    centroids = newCentroids;
    iterations++;
  }

  return { centroids, clusters };
}

function findNearestCentroid(point, centroids) {
  let minDist = Infinity;
  let nearest = 0;

  centroids.forEach((centroid, i) => {
    const dist = euclideanDistance(point, centroid);
    if (dist < minDist) {
      minDist = dist;
      nearest = i;
    }
  });

  return nearest;
}
```

**Time Complexity:** O(n × k × i) where n = points, k = clusters, i = iterations
**Space Complexity:** O(n + k)

**Used in:**

- `POST /api/route/custom` - Casual route with POI stops
- Finding nearby fuel stations/rest stops

---

### 5. **Graph Construction** - Road Network

**Location:** `/backend/utils/graphBuilder.js`

**Purpose:** Build weighted graph from geographical data for pathfinding algorithms

**How it works:**

- Creates nodes from latitude/longitude coordinates
- Adds edges with weights (distance, time, fuel cost)
- Builds adjacency list representation
- Supports dynamic graph updates

**Code Structure:**

```javascript
export function buildMumbaiGraph() {
  const graph = {};

  // Major nodes (intersections/landmarks)
  const nodes = [
    { id: "thane", lat: 19.2183, lng: 72.9781 },
    { id: "bandra", lat: 19.0596, lng: 72.8295 },
    { id: "andheri", lat: 19.1136, lng: 72.8697 },
    // ... more nodes
  ];

  // Build adjacency list
  for (const node of nodes) {
    graph[node.id] = {};
  }

  // Add edges with weights
  const edges = [
    { from: "thane", to: "andheri", distance: 15, time: 25, fuel: 1.2 },
    { from: "andheri", to: "bandra", distance: 8, time: 15, fuel: 0.6 },
    // ... more edges
  ];

  for (const edge of edges) {
    // Bidirectional edges
    graph[edge.from][edge.to] = {
      distance: edge.distance,
      time: edge.time,
      fuelCost: edge.fuel,
    };
    graph[edge.to][edge.from] = {
      distance: edge.distance,
      time: edge.time,
      fuelCost: edge.fuel,
    };
  }

  return graph;
}

export function findNearestNode(lat, lng, graph) {
  let nearest = null;
  let minDist = Infinity;

  for (const nodeId in graph) {
    const node = getNodeCoordinates(nodeId);
    const dist = haversine(lat, lng, node.lat, node.lng);

    if (dist < minDist) {
      minDist = dist;
      nearest = nodeId;
    }
  }

  return nearest;
}
```

**Data Structure:** Adjacency List (Map/Object)

```javascript
{
  'node1': { 'node2': { distance: 10, time: 5 }, 'node3': { distance: 15, time: 8 } },
  'node2': { 'node1': { distance: 10, time: 5 }, 'node4': { distance: 12, time: 6 } },
  // ...
}
```

---

## 📊 MongoDB Integration

### Database Schema

#### 1. **Users Collection**

```javascript
{
  _id: ObjectId("..."),
  userId: "soham_driver",           // Firebase UID
  email: "soham@example.com",
  name: "Soham Karandikar",
  role: "driver" | "fleet_admin",
  fleetId: "demo_fleet_001",        // String reference to fleet
  phone: "+91-9876543210",
  assignedVehicles: ["vehicle_001"],
  driverStats: {
    totalTrips: 856,
    totalDistance: 55640.3,
    avgEfficiency: 85.2,
    totalFuelSaved: 3845.7
  },
  createdAt: ISODate("2025-10-06"),
  updatedAt: ISODate("2025-10-06")
}
```

**Indexes:**

- `userId` (unique)
- `email` (unique)
- `fleetId` (for fleet queries)
- `role` (for role-based filtering)

**Code Location:** `/backend/routes/auth.js`

#### 2. **Fleets Collection**

```javascript
{
  _id: "demo_fleet_001",            // String ID
  name: "Demo Fleet",
  companyName: "ABC Transport",
  code: "FLEET-MGF9IJQE-Z2V",       // Unique fleet code for driver registration
  adminUserId: "soham_dev",
  status: "active",
  createdAt: ISODate("2025-10-06")
}
```

**Indexes:**

- `code` (unique) - For driver registration
- `adminUserId` - For admin lookups

**Code Location:** `/backend/routes/auth.js`

#### 3. **Vehicles Collection**

```javascript
{
  _id: "vehicle_001",               // String ID (NOT ObjectId!)
  name: "Tata Ace",
  model: "Tata Ace Gold",
  year: "2020",
  registrationNumber: "MH01AB1234",
  fleetId: "demo_fleet_001",
  userId: "soham_driver",           // Assigned driver (NOT assignedDriverId)
  fuelType: "Diesel" | "Petrol" | "CNG" | "EV",
  baselineConsumption: 18,          // L/100km or kWh/100km
  status: "active",
  createdAt: ISODate("2025-10-06")
}
```

**Important:**

- Vehicle IDs are **STRINGS**, not ObjectIds
- Driver assignment uses `userId` field
- Baseline consumption is in L/100km (ICE) or kWh/100km (EV)

**Indexes:**

- `fleetId` (for fleet vehicle queries)
- `userId` (for driver vehicle lookups)

**Code Location:** `/backend/routes/fleet.js`

#### 4. **Trips Collection**

```javascript
{
  _id: ObjectId("..."),
  userId: "soham_driver",
  vehicleId: "vehicle_001",         // String reference
  fleetId: "demo_fleet_001",
  startTime: ISODate("2025-10-28T12:17:23Z"),
  endTime: ISODate("2025-10-28T13:59:23Z"),
  status: "completed" | "running" | "cancelled",

  // Route information
  routeType: "eco" | "balanced" | "fastest",
  startLocation: {
    address: "Thane, Mumbai",
    coordinates: { lat: 19.2183, lng: 72.9781 }
  },
  endLocation: {
    address: "Badlapur, Mumbai",
    coordinates: { lat: 19.1559, lng: 73.2650 }
  },

  // Metrics
  distanceKm: 35.5,
  fuelUsed: 2.84,                   // Actual fuel used
  baselineFuelUsed: 6.39,           // Expected fuel (baseline)
  poorDriverBaseline: 8.31,         // 30% worse than baseline
  fuelSaved: 5.47,                  // Savings vs poor driver

  efficiencyScore: 81.3,            // 0-100 score
  avgSpeed: 42.9,                   // km/h

  // Driving behavior
  drivingBehavior: {
    harshBraking: 1,
    harshAcceleration: 0,
    idleTime: 82                    // seconds
  },

  // Cost
  fuelPrice: 109.79,                // ₹/L or ₹/kWh
  totalCost: 312.19,                // Total trip cost
  costSavings: 655.13,              // Savings vs poor driver

  createdAt: ISODate("2025-10-28")
}
```

**Indexes:**

- Compound: `{ userId: 1, startTime: -1 }` - For driver trip history
- Compound: `{ fleetId: 1, status: 1 }` - For fleet active trips
- `vehicleId` - For vehicle trip history

**Code Location:** `/backend/routes/trips.js`

#### 5. **Telemetry Collection** (Real-time tracking)

```javascript
{
  tripId: "trip_active_1728234567890",
  lat: 19.1234,
  lng: 72.8567,
  speed: 45.2,                      // km/h
  heading: 135,                     // degrees
  createdAt: ISODate("2025-10-28T12:30:15Z")
}
```

**Indexes:**

- Compound: `{ tripId: 1, createdAt: 1 }` - For trip telemetry queries

**Code Location:** `/backend/routes/trips.js` (active trips endpoint)

#### 6. **Trips_Raw Collection** (Active trips)

```javascript
{
  _id: "trip_active_1728234567890",
  vehicleId: "vehicle_001",
  userId: "soham_driver",
  fleetId: "demo_fleet_001",
  status: "running",
  startTime: ISODate("2025-10-28T12:17:23Z"),
  routeId: "route_eco_001",
  routeType: "eco",
  plannedDistance: 35.5,
  startLocation: "Thane, Mumbai",
  endLocation: "Badlapur, Mumbai"
}
```

**Used for:** Live tracking of in-progress trips

---

### MongoDB Aggregation Pipelines

#### 1. **Driver Rankings**

**Location:** `/backend/routes/fleetAnalytics.js` - Line 151

```javascript
const ranking = await db
  .collection("trips")
  .aggregate([
    // Filter trips by fleet and date
    {
      $match: {
        fleetId: fleetId,
        startTime: { $gte: cutoffDate },
        status: "completed",
      },
    },

    // Group by driver
    {
      $group: {
        _id: "$userId",
        totalTrips: { $sum: 1 },
        avgEfficiency: { $avg: "$efficiencyScore" },
        totalDistance: { $sum: "$distanceKm" },
        totalFuel: { $sum: "$fuelUsed" },
        harshBraking: { $sum: "$drivingBehavior.harshBraking" },
        harshAcceleration: { $sum: "$drivingBehavior.harshAcceleration" },
      },
    },

    // Join with users collection
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "userId", // Fixed: was '_id'
        as: "driver",
      },
    },
    { $unwind: "$driver" },

    // Calculate scores
    {
      $addFields: {
        safetyScore: {
          $max: [
            0,
            {
              $subtract: [
                100,
                {
                  $add: [
                    { $multiply: ["$harshBraking", 2] },
                    { $multiply: ["$harshAcceleration", 2] },
                  ],
                },
              ],
            },
          ],
        },
        overallScore: {
          $add: [
            { $multiply: ["$avgEfficiency", 0.6] }, // 60% weight
            {
              $multiply: [
                {
                  $max: [
                    /* safety calc */
                  ],
                },
                0.4,
              ],
            }, // 40% weight
          ],
        },
      },
    },

    // Sort by overall score
    { $sort: { overallScore: -1 } },
    { $limit: parseInt(limit) },
  ])
  .toArray();
```

**Purpose:** Rank drivers by performance (efficiency + safety)

#### 2. **Fleet Performance**

**Location:** `/backend/routes/fleetAnalytics.js` - Line 47

```javascript
const performance = await db
  .collection("trips")
  .aggregate([
    {
      $match: {
        fleetId: fleetId,
        startTime: { $gte: cutoffDate },
        status: "completed",
      },
    },

    // Group by vehicle
    {
      $group: {
        _id: "$vehicleId",
        totalTrips: { $sum: 1 },
        avgFuelEfficiency: { $avg: "$efficiencyScore" },
        totalDistance: { $sum: "$distanceKm" },
        fuelSavedLiters: { $sum: "$fuelSaved" },
        avgSpeed: { $avg: "$avgSpeed" },
      },
    },

    // Calculate safety score from driving behavior
    {
      $addFields: {
        safetyScore: {
          $subtract: [
            100,
            {
              $add: [
                { $multiply: [{ $ifNull: ["$harshBraking", 0] }, 5] },
                { $multiply: [{ $ifNull: ["$harshAcceleration", 0] }, 3] },
              ],
            },
          ],
        },
      },
    },

    // Sort by efficiency
    { $sort: { avgFuelEfficiency: -1 } },
  ])
  .toArray();
```

**Purpose:** Analyze vehicle performance metrics

---

### Key MongoDB Operations

#### 1. **Vehicle Lookup (String ID)**

```javascript
// CORRECT - Vehicle IDs are strings
const vehicle = await db.collection("vehicles").findOne({
  _id: vehicleId, // NOT: new ObjectId(vehicleId)
});
```

**Files with this fix:**

- `/backend/routes/fleet.js`
- `/backend/routes/route.js`
- `/backend/routes/customRoute.js`
- `/backend/routes/trips.js`

#### 2. **Driver Assignment**

```javascript
// Check both old and new field names
const driverId = vehicle?.userId || vehicle?.assignedDriverId;
const driver = driverId
  ? await db.collection("users").findOne({ userId: driverId })
  : null;
```

**Location:** `/backend/routes/trips.js` - Line 336

---

## 🔐 Firebase Authentication

### Firebase Setup

**Location:** `/backend/middleware/auth.js`

### 1. **Firebase Admin SDK Initialization**

```javascript
import admin from "firebase-admin";

function initializeFirebase() {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_ADMIN_SA ||
      Buffer.from(process.env.FIREBASE_ADMIN_SA_BASE64, "base64").toString(
        "utf-8"
      )
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  console.log("✓ Firebase Admin initialized");
}
```

**Environment Variables:**

- `FIREBASE_ADMIN_SA` - Service account JSON (direct)
- `FIREBASE_ADMIN_SA_BASE64` - Base64 encoded service account (for deployment)

### 2. **Token Verification Middleware**

```javascript
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);

    // Demo account mapping (for testing)
    if (decoded.email === "sohamiscoding@gmail.com") {
      req.user = {
        uid: "soham_dev",
        email: decoded.email,
        role: "fleet_admin",
        fleetId: "demo_fleet_001",
      };
    } else if (decoded.email === "sohamkarandikar007@gmail.com") {
      req.user = {
        uid: "soham_driver",
        email: decoded.email,
        role: "driver",
        fleetId: "demo_fleet_001",
      };
    } else {
      // Regular user - use Firebase UID
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
```

**Used in:** All protected routes

### 3. **Frontend Firebase Setup**

**Location:** `/frontend/src/firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 4. **Authentication Flow**

#### Registration (Frontend)

**Location:** `/frontend/src/contexts/AuthContext.jsx`

```javascript
const signUp = async (email, password, role, fleetData) => {
  // 1. Create Firebase user
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // 2. Get Firebase ID token
  const token = await userCredential.user.getIdToken();

  // 3. Create user profile in MongoDB
  const response = await axios.post(
    "/api/auth/register",
    {
      email,
      role,
      fleetData,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return {
    user: userCredential.user,
    role: response.data.role,
    fleetId: response.data.fleetId,
    fleetCode: response.data.fleetCode, // Only for fleet admin
  };
};
```

#### Login (Frontend)

**Location:** `/frontend/src/contexts/AuthContext.jsx`

```javascript
const signIn = async (email, password) => {
  // 1. Sign in with Firebase
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  // 2. Get Firebase ID token
  const token = await userCredential.user.getIdToken();

  // 3. Fetch user profile from MongoDB
  const response = await axios.get("/api/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 4. Store user data in context
  setUserRole(response.data.role);
  setFleetId(response.data.fleetId);
  setFleetCode(response.data.fleetCode); // For admins

  return {
    user: userCredential.user,
    role: response.data.role,
    fleetId: response.data.fleetId,
  };
};
```

#### Protected API Requests

**Location:** `/frontend/src/utils/api.js`

```javascript
import { auth } from "../firebase";

export async function apiGet(endpoint) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const response = await axios.get(`/api${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}
```

---

## 🏗️ System Architecture

### Request Flow

#### 1. **Route Optimization Request**

```
Frontend (Driver App)
    ↓ POST /api/route/optimize
    ↓ { origin, destination, vehicleId }
    ↓
Firebase Auth Middleware
    ↓ Verify JWT token
    ↓ Extract user ID
    ↓
MongoDB - Get Vehicle Data
    ↓ db.collection('vehicles').findOne({ _id: vehicleId })
    ↓ Get baselineConsumption
    ↓
OSRM API - Get Real Routes
    ↓ Fetch 3 alternative routes
    ↓
DSA Algorithms Applied
    ↓
    ├── Dijkstra → Fastest Route (min time)
    ├── DP → ECO Route (min fuel)
    └── K-Means → Casual Route (with POIs)
    ↓
Response with 3 Routes
    ↓ { eco, balanced, fastest }
    ↓
Frontend - Display Routes on Map
```

#### 2. **Live Tracking Flow**

```
Driver App
    ↓ Start Trip
    ↓
Create Active Trip (trips_raw)
    ↓ { status: 'running', vehicleId, userId }
    ↓
Send Telemetry Every 5 sec
    ↓ POST /api/trips/telemetry
    ↓ { lat, lng, speed, heading }
    ↓
Save to MongoDB (telemetry)
    ↓
Fleet Admin Dashboard
    ↓ GET /api/trips/active (every 10 sec)
    ↓
Aggregation Pipeline
    ↓ Join: trips_raw + telemetry + vehicles + users
    ↓ Calculate: distance, fuel, route path
    ↓
Display on Live Map
```

---

## 📈 Performance Optimizations

### 1. **MongoDB Indexes**

```javascript
// Users
db.users.createIndex({ userId: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ fleetId: 1 });

// Trips
db.trips.createIndex({ userId: 1, startTime: -1 });
db.trips.createIndex({ fleetId: 1, status: 1 });
db.trips.createIndex({ vehicleId: 1 });

// Telemetry
db.telemetry.createIndex({ tripId: 1, createdAt: 1 });
```

### 2. **Algorithm Optimizations**

- **Priority Queue** in Dijkstra/A\* - O(log n) insertions instead of O(n)
- **Memoization** in DP - Store computed results to avoid recalculation
- **Early Termination** in A\* - Stop when destination is reached
- **K-Means Convergence** - Stop when centroids stabilize

### 3. **Caching Strategy**

- Fleet code stored in AuthContext (no repeated DB queries)
- Graph data cached in memory (buildMumbaiGraph called once)
- OSRM responses cached for 5 minutes

---

## 🔍 Key Files Reference

### DSA Implementation

- `/backend/algorithms/dijkstra.js` - Shortest path (time)
- `/backend/algorithms/astar.js` - Heuristic pathfinding
- `/backend/algorithms/dpRefuel.js` - Fuel optimization
- `/backend/algorithms/kmeans.js` - POI clustering
- `/backend/utils/graphBuilder.js` - Graph construction

### MongoDB Integration

- `/backend/db.js` - Database connection
- `/backend/routes/auth.js` - User/Fleet management
- `/backend/routes/fleet.js` - Vehicle CRUD
- `/backend/routes/trips.js` - Trip tracking
- `/backend/routes/fleetAnalytics.js` - Aggregation pipelines

### Firebase Integration

- `/backend/middleware/auth.js` - Token verification
- `/frontend/src/firebase.js` - Firebase config
- `/frontend/src/contexts/AuthContext.jsx` - Auth state
- `/frontend/src/utils/api.js` - Authenticated requests

### Route Optimization

- `/backend/routes/route.js` - Main optimization endpoint
- `/backend/routes/customRoute.js` - Custom route with DSA

---

## 📝 Summary

### DSA Usage

1. **Dijkstra** - Fastest route (minimum time)
2. **A\*** - Intelligent pathfinding with heuristics
3. **Dynamic Programming** - Fuel cost optimization
4. **K-Means** - POI clustering for scenic routes
5. **Graph Algorithms** - Road network representation

### MongoDB Usage

- **6 Collections:** users, fleets, vehicles, trips, telemetry, trips_raw
- **Aggregation Pipelines:** Driver rankings, fleet performance
- **String IDs:** vehicles, fleets (NOT ObjectIds)
- **Compound Indexes:** Optimized queries for trip history

### Firebase Usage

- **Authentication:** Email/password with JWT tokens
- **Token Verification:** Middleware on all protected routes
- **User Mapping:** Firebase UID → MongoDB user profile
- **Demo Accounts:** Special handling for test accounts

**All three technologies work together seamlessly to provide route optimization, real-time tracking, and fleet management! 🚀**
