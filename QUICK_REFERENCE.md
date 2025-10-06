# Quick Reference Guide - DSA, MongoDB & Firebase

## 🎯 Quick Answers

### "Where is DSA used in our project?"

**5 DSA algorithms implemented:**

1. **Dijkstra's Algorithm** (`/backend/algorithms/dijkstra.js`)

   - **What:** Finds fastest route (minimum time)
   - **Where:** `/api/route/custom` endpoint - Fastest route option
   - **How:** Priority queue + weighted graph
   - **Complexity:** O((V+E) log V)

2. **A\* Algorithm** (`/backend/algorithms/astar.js`)

   - **What:** Smart pathfinding with heuristics
   - **Where:** Alternative to Dijkstra for known destinations
   - **How:** g-score + h-score (Haversine distance)
   - **Complexity:** O(b^d) with good heuristic

3. **Dynamic Programming** (`/backend/algorithms/dpRefuel.js`)

   - **What:** Minimizes fuel cost with optimal refueling
   - **Where:** `/api/route/custom` endpoint - ECO route option
   - **How:** DP table for segment-wise fuel optimization
   - **Complexity:** O(n × m) where n=segments, m=stations

4. **K-Means Clustering** (`/backend/algorithms/kmeans.js`)

   - **What:** Groups nearby POIs (restaurants, fuel stations)
   - **Where:** `/api/route/custom` endpoint - Casual route option
   - **How:** Iterative centroid refinement
   - **Complexity:** O(n × k × i)

5. **Graph Construction** (`/backend/utils/graphBuilder.js`)
   - **What:** Builds road network as weighted graph
   - **Where:** Foundation for all routing algorithms
   - **How:** Adjacency list representation
   - **Data Structure:** `{ node1: { node2: weight, node3: weight }, ... }`

**Main API Endpoint:** `POST /api/route/custom` or `POST /api/route/optimize`

---

### "Where is MongoDB used?"

**6 Collections:**

1. **users** - User profiles (drivers & admins)

   ```javascript
   {
     userId, email, role, fleetId, name, driverStats;
   }
   ```

   - Files: `/backend/routes/auth.js`
   - Indexes: `userId`, `email`, `fleetId`, `role`

2. **fleets** - Fleet organizations

   ```javascript
   {
     _id, name, code, adminUserId;
   }
   ```

   - Files: `/backend/routes/auth.js`
   - Indexes: `code` (unique), `adminUserId`

3. **vehicles** - Fleet vehicles

   ```javascript
   {
     _id: "vehicle_001", name, userId, baselineConsumption;
   }
   ```

   - **IMPORTANT:** IDs are STRINGS, not ObjectIds!
   - Files: `/backend/routes/fleet.js`
   - Indexes: `fleetId`, `userId`

4. **trips** - Completed trips

   ```javascript
   {
     userId, vehicleId, distanceKm, fuelUsed, efficiencyScore;
   }
   ```

   - Files: `/backend/routes/trips.js`
   - Indexes: `{ userId: 1, startTime: -1 }`, `{ fleetId: 1, status: 1 }`

5. **trips_raw** - Active/running trips

   ```javascript
   { _id, vehicleId, userId, status: "running" }
   ```

   - Files: `/backend/routes/trips.js`

6. **telemetry** - Real-time GPS tracking
   ```javascript
   {
     tripId, lat, lng, speed, createdAt;
   }
   ```
   - Files: `/backend/routes/trips.js`
   - Indexes: `{ tripId: 1, createdAt: 1 }`

**Main Connection:** `/backend/db.js`

**Aggregation Pipelines:**

- Driver Rankings: `/backend/routes/fleetAnalytics.js` (Line 151)
- Fleet Performance: `/backend/routes/fleetAnalytics.js` (Line 47)

---

### "Where is Firebase used?"

**Firebase Authentication:**

1. **Backend - Token Verification**

   - File: `/backend/middleware/auth.js`
   - Function: `verifyToken()`
   - What it does:
     ```javascript
     const decoded = await admin.auth().verifyIdToken(token);
     req.user = { uid: decoded.uid, email: decoded.email };
     ```

2. **Frontend - Auth Context**

   - File: `/frontend/src/contexts/AuthContext.jsx`
   - Functions: `signIn()`, `signUp()`, `signOut()`
   - What it does:

     ```javascript
     // Sign up
     const userCredential = await createUserWithEmailAndPassword(
       auth,
       email,
       password
     );
     const token = await userCredential.user.getIdToken();

     // Use token for API calls
     axios.post("/api/auth/register", data, {
       headers: { Authorization: `Bearer ${token}` },
     });
     ```

3. **API Requests**
   - File: `/frontend/src/utils/api.js`
   - Functions: `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`
   - What it does:
     ```javascript
     const token = await auth.currentUser.getIdToken();
     axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
     ```

**Firebase Config:**

- Frontend: `/frontend/src/firebase.js`
- Backend: `/backend/middleware/auth.js`

**Environment Variables:**

- Frontend: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.
- Backend: `FIREBASE_ADMIN_SA` or `FIREBASE_ADMIN_SA_BASE64`

---

## 🔗 How They Work Together

### Example: Route Optimization Request

```
1. USER CLICKS "GET ROUTES" (Frontend)
   ↓
2. FIREBASE: Get auth token
   const token = await user.getIdToken();
   ↓
3. API CALL: Send to backend
   POST /api/route/optimize
   Headers: { Authorization: "Bearer <token>" }
   Body: { origin, destination, vehicleId }
   ↓
4. BACKEND: Verify Firebase token (auth.js)
   const decoded = await admin.auth().verifyIdToken(token);
   ↓
5. MONGODB: Get vehicle data
   const vehicle = await db.collection('vehicles').findOne({ _id: vehicleId });
   const baseline = vehicle.baselineConsumption;
   ↓
6. DSA: Run algorithms
   - Dijkstra → Fastest route
   - DP → ECO route
   - K-Means → Casual route
   ↓
7. RESPONSE: Return 3 route options
   { eco: {...}, balanced: {...}, fastest: {...} }
   ↓
8. FRONTEND: Display routes on map
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Frontend  │
│  (React +   │
│  Firebase)  │
└──────┬──────┘
       │ JWT Token
       ↓
┌─────────────────────────────────┐
│         Backend (Express)       │
│  ┌────────────────────────────┐ │
│  │ Firebase Middleware        │ │
│  │ (Verify Token)             │ │
│  └────────┬───────────────────┘ │
│           ↓                      │
│  ┌────────────────────────────┐ │
│  │ MongoDB Queries            │ │
│  │ - Get user/vehicle/trip    │ │
│  │ - Run aggregations         │ │
│  └────────┬───────────────────┘ │
│           ↓                      │
│  ┌────────────────────────────┐ │
│  │ DSA Algorithms             │ │
│  │ - Dijkstra, A*, DP, K-Means│ │
│  │ - Graph processing         │ │
│  └────────┬───────────────────┘ │
│           ↓                      │
│  ┌────────────────────────────┐ │
│  │ Response                   │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
       │
       ↓
┌─────────────┐
│   MongoDB   │
│  Database   │
└─────────────┘
```

---

## 🎓 For Presentation

### Slide 1: DSA Implementation

**Say:** "We implemented 5 core DSA algorithms:"

1. Dijkstra for fastest routes - O((V+E) log V) complexity
2. A\* with Haversine heuristic for smart pathfinding
3. Dynamic Programming for fuel cost optimization
4. K-Means for POI clustering
5. Graph data structure for road network

**Show:** `/backend/algorithms/` folder, graph visualization

---

### Slide 2: MongoDB Integration

**Say:** "MongoDB stores 6 collections with optimized indexes:"

- Users, Fleets, Vehicles, Trips, Telemetry
- Aggregation pipelines for driver rankings and fleet performance
- Compound indexes for fast queries

**Show:** MongoDB Compass with collections, aggregation pipeline code

---

### Slide 3: Firebase Authentication

**Say:** "Firebase handles secure authentication:"

- Email/password auth with JWT tokens
- Token verification middleware on all API routes
- Frontend context for auth state management

**Show:** Login flow, token in network tab, middleware code

---

### Slide 4: System Integration

**Say:** "All three technologies work seamlessly:"

1. Frontend (React) uses Firebase for auth
2. Backend (Express) verifies Firebase tokens
3. MongoDB stores data
4. DSA algorithms process route optimization
5. Results sent back to frontend

**Show:** Request flow diagram, live demo

---

## 🚀 Quick Demo Script

1. **Show DSA:**

   - Open `/backend/algorithms/dijkstra.js`
   - Point to priority queue implementation
   - Show graph construction in graphBuilder.js

2. **Show MongoDB:**

   - Open MongoDB Compass
   - Show collections: users, vehicles, trips
   - Run aggregation: db.trips.aggregate([...])

3. **Show Firebase:**

   - Login to app → Open Network tab
   - Show Authorization header with JWT token
   - Show Firebase Console with registered users

4. **Show Integration:**
   - Click "Get Routes" button
   - Network tab: POST /api/route/optimize with token
   - Backend logs: Token verified → MongoDB query → DSA runs
   - Frontend: 3 routes displayed

---

## 📝 Code Snippets for Presentation

### DSA Example (Dijkstra)

```javascript
// Priority Queue for efficient node selection
pq.enqueue(start, 0);

while (!pq.isEmpty()) {
  const current = pq.dequeue().element;
  if (current === end) break;

  // Check all neighbors
  for (const neighbor in graph[current]) {
    const distance = distances[current] + graph[current][neighbor];
    if (distance < distances[neighbor]) {
      distances[neighbor] = distance;
      pq.enqueue(neighbor, distance);
    }
  }
}
```

### MongoDB Example (Aggregation)

```javascript
await db.collection("trips").aggregate([
  { $match: { fleetId: "demo_fleet_001", status: "completed" } },
  {
    $group: {
      _id: "$userId",
      totalTrips: { $sum: 1 },
      avgEfficiency: { $avg: "$efficiencyScore" },
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "userId",
      as: "driver",
    },
  },
  { $sort: { avgEfficiency: -1 } },
]);
```

### Firebase Example (Auth)

```javascript
// Verify token
const decoded = await admin.auth().verifyIdToken(token);

// Set user in request
req.user = {
  uid: decoded.uid,
  email: decoded.email,
};
```

---

## ✅ Checklist for Demo

- [ ] MongoDB Compass open with collections visible
- [ ] VS Code open with algorithm files
- [ ] Browser with app running
- [ ] Network tab open to show API calls
- [ ] Postman/curl ready for API testing
- [ ] Firebase Console showing users

---

**Full details in:** `/TECHNICAL_ARCHITECTURE.md`
