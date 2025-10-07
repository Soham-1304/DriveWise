<div align="center"># 🚗 FuelOptimizer - Intelligent Fleet Management System# Fuel Optimizer - 1-Day Prototype

# 🚗 FuelOptimizerA comprehensive fuel optimization and fleet management platform built with React, Node.js, MongoDB, and Firebase. The system provides real-time route optimization, GPS tracking, driver analytics, and fuel efficiency monitoring for fleet operations.A fuel/energy consumption optimizer that helps drivers and fleet managers track trips, optimize routes, and reduce fuel costs.

### Intelligent Fleet Management & Route Optimization System---## 🚀 Quick Start

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge)](https://fueloptimiser.web.app)## 📋 Table of Contents### Prerequisites

[![Backend API](https://img.shields.io/badge/API-Live-green?style=for-the-badge)](https://fuel-optimizer-backend.vercel.app)

[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)- [Features Overview](#features-overview)- Node.js 18+ installed

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)

[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)- [Technology Stack](#technology-stack)- Firebase project created

[![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

- [System Architecture](#system-architecture)- MongoDB Atlas M0 cluster created

**A comprehensive fuel optimization and fleet management platform built with React, Node.js, MongoDB, and Firebase.**

- [Core Features](#core-features)- Vercel account (for deployment)

[🚀 Live Demo](https://fueloptimiser.web.app) · [📖 Documentation](#-documentation) · [🛠️ Tech Stack](#-technology-stack) · [⚡ Quick Start](#-quick-start)

- [Data Structures & Algorithms](#data-structures--algorithms)

</div>

- [Database Design (MongoDB)](#database-design-mongodb)### Setup Instructions

---

- [Authentication & Security (Firebase)](#authentication--security-firebase)

## 🌐 Live Applications

- [Advanced JavaScript Features](#advanced-javascript-features)#### 1. Firebase Setup

| Platform | URL | Status |

|----------|-----|--------|- [API Endpoints](#api-endpoints)

| **Frontend** | [fueloptimiser.web.app](https://fueloptimiser.web.app) | 🟢 Live |

| **Backend API** | [fuel-optimizer-backend.vercel.app](https://fuel-optimizer-backend.vercel.app) | 🟢 Live |- [Setup & Installation](#setup--installation)1. Go to [Firebase Console](https://console.firebase.google.com/)

---- [Usage Guide](#usage-guide)2. Create a new project

## ✨ Features3. Enable Authentication (Email/Password and Google)

### 🎯 For Fleet Administrators---4. Create a web app and copy the config

<table>5. Generate a service account key (Project Settings > Service Accounts > Generate New Private Key)

<tr>

<td width="50%">## 🎯 Features Overview

#### 📊 **Dashboard & Analytics**#### 2. MongoDB Setup

- Real-time fleet overview

- Fuel efficiency trends### **For Fleet Administrators**

- Driver performance metrics

- Cost analysis & reports- 📊 Real-time fleet analytics dashboard1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

#### 🚙 **Vehicle Management**- 🚙 Vehicle management with fuel consumption tracking2. Create a free M0 cluster

- Vehicle registration & tracking

- Fuel consumption monitoring- 👥 Driver management with performance metrics3. Create a database user

- Maintenance schedules

- Real-time GPS location- 🗺️ Live GPS tracking of active trips4. Whitelist your IP (or use 0.0.0.0/0 for development)

</td>- 📈 Fuel efficiency analytics and trends5. Get the connection string

<td width="50%">

- 🎯 Driver performance comparison

#### 👥 **Driver Management**

- Driver assignment & profiles#### 3. Backend Setup

- Performance comparison

- Efficiency scoring### **For Drivers**

- Live trip monitoring

- 🛣️ Intelligent route planning (Fastest/Greenest/Shortest/Custom)```bash

#### 📈 **Advanced Analytics**

- Fuel savings calculations- 📍 Real-time GPS tracking during tripscd backend

- Route optimization insights

- Anomaly detection alerts- ⛽ Live fuel consumption monitoringnpm install

- Custom reports

- 📊 Personal trip history and statistics

</td>

</tr>- 🏆 Efficiency scoring and feedback# Create .env file

</table>

- 🎮 Interactive map with route visualizationcp .env.example .env

### 🚀 For Drivers

`````

<table>

<tr>---

<td width="50%">

Edit `.env` with your credentials:

#### 🗺️ **Intelligent Route Planning**

- **Fastest Route** - Minimum time using Dijkstra## 🛠️ Technology Stack

- **Eco Route** - Maximum fuel efficiency with DP

- **Casual Route** - Scenic with POI suggestions```

- **Custom Route** - Manual waypoint selection

### **Frontend**MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fuel_db

#### 📍 **Real-time Tracking**

- Live GPS monitoring- **React 18** - Component-based UI frameworkFIREBASE_ADMIN_SA={"type":"service_account",...}

- Turn-by-turn navigation

- Speed & distance tracking- **React Router v6** - Client-side routingOSRM_URL=https://router.project-osrm.org

- Fuel consumption in real-time

- **Axios** - HTTP client for API callsPORT=3000

</td>

<td width="50%">- **Leaflet.js** - Interactive maps and geolocation```



#### 📊 **Personal Analytics**- **Recharts** - Data visualization (charts & graphs)

- Trip history & statistics

- Efficiency scoring (0-100)- **Lucide React** - Modern icon libraryCreate MongoDB indexes:

- Fuel savings achievements

- Performance trends- **Tailwind CSS** - Utility-first styling



#### 🎮 **Interactive Features**````bash

- Interactive map with Leaflet.js

- POI markers (fuel stations, restaurants)### **Backend**# Connect to MongoDB using mongosh or MongoDB Compass

- Route comparison

- Live telemetry updates- **Node.js** - JavaScript runtimeuse fuel_db;



</td>- **Express.js** - Web application frameworkdb.vehicles.createIndex({ userId: 1 });

</tr>

</table>- **MongoDB** - NoSQL databasedb.trips.createIndex({ vehicleId: 1, startTime: -1 });



---- **Firebase Admin SDK** - Authentication & authorizationdb.trips.createIndex({ userId: 1, startTime: -1 });



## 🛠️ Technology Stackdb.telemetry.createIndex({ tripId: 1, createdAt: 1 });



### **Frontend**### **External APIs**db.telemetry.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL



```- **OSRM (Open Source Routing Machine)** - Route optimization```

React 18          - Component-based UI framework

React Router v6   - Client-side routing- **OpenStreetMap** - Map tiles and geocoding

Axios             - HTTP client for API calls

Leaflet.js        - Interactive maps and geolocation- **Mapbox** - Premium map tilesStart the backend:

Recharts          - Data visualization (charts & graphs)

Lucide React      - Modern icon library

Tailwind CSS      - Utility-first styling

Firebase          - Authentication & hosting### **Authentication**```bash

`````

- **Firebase Authentication** - User managementnpm run dev

### **Backend**

- **JWT Tokens** - Secure API access```

```````

Node.js 18+       - JavaScript runtime- **Role-based Access Control** - Admin/Driver permissions

Express.js        - Web application framework

MongoDB Atlas     - NoSQL database (M0 cluster)#### 4. Frontend Setup

Firebase Admin    - Server-side authentication

OSRM API          - Real-time routing engine---

Vercel            - Serverless deployment

``````bash



### **Algorithms & Data Structures**## 🏗️ System Architecturecd frontend



```npm install

Dijkstra          - Fastest route pathfinding

A* Search         - Heuristic-based routing````

Dynamic Programming - Fuel cost optimization

K-Means Clustering - POI grouping┌─────────────────────────────────────────────────────────────┐

Graph Builder     - Road network representation

Priority Queue    - Efficient node selection│ React Frontend (Port 5173) │Edit `src/firebase.js` with your Firebase config:

```````

│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │

---

│ │ Driver │ │ Fleet │ │ Maps │ │```javascript

## 🏗️ System Architecture

│ │ Dashboard │ │ Admin │ │ & Routes │ │const firebaseConfig = {

`````

┌─────────────────────────────────────────────────────────────┐│ └──────────────┘ └──────────────┘ └──────────────┘ │ apiKey: "YOUR_API_KEY",

│                    Client (React App)                       │

│         https://fueloptimiser.web.app (Firebase)           │└─────────────────────────────────────────────────────────────┘ authDomain: "YOUR_PROJECT.firebaseapp.com",

└─────────────────────────────────────────────────────────────┘

                            │                            ↕ HTTP/REST API  projectId: "YOUR_PROJECT_ID",

                            │ HTTPS/REST API

                            ▼┌─────────────────────────────────────────────────────────────┐ storageBucket: "YOUR_PROJECT.appspot.com",

┌─────────────────────────────────────────────────────────────┐

│              Backend API (Node.js/Express)                  ││ Express.js Backend (Port 3000) │ messagingSenderId: "YOUR_SENDER_ID",

│    https://fuel-optimizer-backend.vercel.app (Vercel)     │

│                                                             ││ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ appId: "YOUR_APP_ID",

│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │

│  │   Routes     │  │  Algorithms  │  │ Middleware   │    ││ │ Auth │ │ Trips │ │ Fleet │ │};

│  │  /api/fleet  │  │  Dijkstra    │  │ Auth Check   │    │

│  │  /api/route  │  │  A* Search   │  │ CORS Config  │    ││ │ Middleware │ │ Routes │ │ Routes │ │```

│  │  /api/trip   │  │  DP Refuel   │  │ Error Handler│    │

│  └──────────────┘  └──────────────┘  └──────────────┘    ││ └──────────────┘ └──────────────┘ └──────────────┘ │

└─────────────────────────────────────────────────────────────┘

            │                           │└─────────────────────────────────────────────────────────────┘Start the frontend:

            │ MongoDB Driver            │ Firebase Admin SDK

            ▼                           ▼                            ↕

┌──────────────────────┐    ┌─────────────────────────┐

│   MongoDB Atlas      │    │   Firebase Auth         │┌─────────────────────────────────────────────────────────────┐```bash

│   (Database)         │    │   (User Management)     │

│                      │    │                         ││ MongoDB Atlas Database │npm run dev

│  • vehicles          │    │  • Email/Password       │

│  • drivers           │    │  • Google OAuth         ││ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │```

│  • trips             │    │  • JWT Tokens           │

│  • telemetry         │    └─────────────────────────┘│ │ users │ │ trips │ │ telemetry │ │

│  • anomalies         │

│  • fleets            ││ │ vehicles │ │ fleets │ │ trips_raw │ │Visit: `http://localhost:5173`

└──────────────────────┘

```│ └──────────────┘ └──────────────┘ └──────────────┘ │



---└─────────────────────────────────────────────────────────────┘## 📁 Project Structure



## ⚡ Quick Start                            ↕



### Prerequisites┌─────────────────────────────────────────────────────────────┐```



- Node.js 18+ installed│ Firebase Authentication Service │fuel-prototype/

- MongoDB Atlas account (free M0 cluster)

- Firebase project created└─────────────────────────────────────────────────────────────┘├── frontend/

- Vercel account (for deployment)

````│ ├── src/

### 1️⃣ Clone the Repository

│   │   ├── components/     # Reusable components

```bash

git clone https://github.com/yourusername/FuelOptimizer.git---│   │   ├── pages/          # Page components

cd FuelOptimizer

```│   │   ├── hooks/          # Custom React hooks



### 2️⃣ Backend Setup## ✨ Core Features│   │   ├── firebase.js     # Firebase configuration



```bash│   │   ├── App.jsx         # Main app component

cd backend

npm install### 🗺️ **1. Intelligent Route Planning**│   │   └── main.jsx        # Entry point



# Create .env file│   ├── package.json

cp .env.example .env

```**Multiple Route Optimization Strategies:**│   └── vite.config.js



Edit `.env` with your credentials:- **Fastest Route** - Minimizes travel time using highway preferences│



```env- **Greenest Route** - Optimizes for fuel efficiency (EV/Hybrid friendly)└── backend/

MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fuel_db

FIREBASE_ADMIN_SA={"type":"service_account",...}- **Shortest Route** - Minimizes total distance    ├── routes/             # API route handlers

OSRM_URL=https://router.project-osrm.org

PORT=3000- **Custom Route** - User-defined waypoints    ├── middleware/         # Auth middleware

`````

    ├── db.js              # MongoDB connection

Create MongoDB indexes:

**Route Algorithms:** ├── index.js # Express server

````javascript

// Connect to MongoDB and run:- Uses OSRM API for route calculation    └── package.json

db.trips.createIndex({ vehicleId: 1, startTime: -1 });

db.trips.createIndex({ driverId: 1, startTime: -1 });- Implements Dijkstra's shortest path algorithm```

db.trips.createIndex({ fleetId: 1, startTime: -1 });

db.telemetry.createIndex({ tripId: 1, timestamp: 1 });- Real-time traffic consideration

db.anomalies.createIndex({ tripId: 1, timestamp: -1 });

```- Turn-by-turn navigation instructions## 🔧 Tech Stack



Start the backend:



```bash**Features:****Frontend:**

npm run dev

# Server runs at http://localhost:3000- Interactive map with route preview

````

- Distance and duration estimates- React 18 (Vite)

### 3️⃣ Frontend Setup

- Elevation profile visualization- Tailwind CSS

```bash

cd frontend- Alternative route suggestions- Firebase Auth

npm install

- React Router

# Create .env file

cp .env.example .env### 📍 **2. Real-Time GPS Tracking**- Leaflet (maps)

```

- Chart.js

Edit `.env` with your Firebase config:

**Live Telemetry Collection:**- Axios

```env

VITE_FIREBASE_API_KEY=your_api_key- GPS coordinates (latitude/longitude)

VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

VITE_FIREBASE_PROJECT_ID=your-project-id- Speed tracking (km/h)**Backend:**

VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com

VITE_FIREBASE_MESSAGING_SENDER_ID=123456789- Timestamp synchronization

VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

VITE_API_URL=http://localhost:3000- Battery/fuel level monitoring- Node.js + Express

```

- MongoDB Atlas

Start the frontend:

**Data Processing:**- Firebase Admin SDK

````bash

npm run dev- Haversine formula for distance calculation- OSRM (routing)

# App runs at http://localhost:5173

```- Speed averaging algorithms



### 4️⃣ Access the Application- Route adherence detection## 🎯 Core Features



- **Frontend**: http://localhost:5173- Harsh acceleration/braking detection

- **Backend API**: http://localhost:3000

- **API Health Check**: http://localhost:3000/health### ✅ Implemented



---**Implementation:**



## 📖 Documentation```javascript- Firebase Authentication (Email + Google)



### 📚 Available Documentation// Haversine Distance Calculation- Vehicle profile management



| Document | Description |function haversine(coord1, coord2) {- Trip tracking with GPS

|----------|-------------|

| [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) | Complete technical deep-dive: DSA algorithms, MongoDB schemas, Firebase integration, system architecture |  const R = 6371; // Earth's radius in km- Telemetry data collection

| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick answers to common questions: Where is DSA used? MongoDB collections? API endpoints? |

| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Step-by-step deployment instructions for Firebase and Vercel |  const dLat = (coord2.lat - coord1.lat) * toRad;- Trip analytics and summaries



### 🔗 Key API Endpoints  const dLng = (coord2.lng - coord1.lng) * toRad;- Route optimization (OSRM)



#### Fleet Management  const a = Math.sin(dLat/2) ** 2 + - Dashboard with KPIs

````

POST /api/fleet/vehicles - Register new vehicle Math.cos(lat1) _ Math.cos(lat2) _

GET /api/fleet/vehicles - List all vehicles

PUT /api/fleet/vehicles/:id - Update vehicle Math.sin(dLng/2) \*\* 2;### 🚧 To Be Implemented

DELETE /api/fleet/vehicles/:id - Remove vehicle

return 2 _ R _ Math.asin(Math.sqrt(a));

POST /api/fleet/drivers - Register new driver

GET /api/fleet/drivers - List all drivers}- Dashboard UI with charts

PUT /api/fleet/drivers/:id - Update driver

`````- Trip detail maps



#### Route Planning- CSV export

```

POST   /api/route/optimize        - Get optimized route (Dijkstra + OSRM)### ⛽ **3. Fuel Efficiency Analytics**- Fleet admin panel

POST   /api/route/custom          - Generate custom route with algorithm selection

GET    /api/route/poi             - Find nearby POIs (fuel stations, restaurants)- Demo video recording

```

**Real-Time Monitoring:**

#### Trip Management

```- Fuel consumption tracking (L/km or kWh/km)## 📊 API Endpoints

POST   /api/trip/start            - Start a new trip

POST   /api/trip/:id/telemetry    - Send GPS telemetry data- Efficiency scoring (0-100)

POST   /api/trip/:id/end          - End trip and calculate summary

GET    /api/trip/driver/:id       - Get driver's trip history- Fuel saved vs. worst-case scenario### Vehicles

GET    /api/trip/active           - Get active trips

```- Cost savings calculation



#### Analytics- `POST /api/vehicles` - Create vehicle

```

GET    /api/analytics/fuel-efficiency   - Fleet fuel efficiency trends**Efficiency Score Calculation:**- `GET /api/vehicles` - List vehicles

GET    /api/analytics/driver-performance - Driver comparison metrics

GET    /api/analytics/cost-savings      - Calculate fuel cost savings```javascript- `GET /api/vehicles/:id` - Get vehicle

GET    /api/anomalies                   - Get detected anomalies

```// Multi-factor efficiency algorithm- `PUT /api/vehicles/:id` - Update vehicle



---efficiencyScore = (- `DELETE /api/vehicles/:id` - Delete vehicle



## 🧮 Algorithm Implementation  speedScore * 0.3 +          // Optimal speed maintenance



### 1. **Dijkstra's Algorithm** - Fastest Route  smoothnessScore * 0.3 +     // Smooth acceleration/braking### Trips



```javascript  routeAdherenceScore * 0.2 + // Staying on planned route

// Location: /backend/algorithms/dijkstra.js

// Time Complexity: O((V+E) log V)  distanceEfficiency * 0.2    // Minimizing extra distance- `POST /api/trip/start` - Start trip

// Space Complexity: O(V)

)- `POST /api/trip/telemetry` - Send telemetry data

// Finds shortest path using priority queue

export function dijkstra(graph, start, end) {```- `POST /api/trip/end` - End trip

  const distances = {};

  const previous = {};- `GET /api/trips` - List trips

  const pq = new PriorityQueue();

  **Analytics Dashboard:**- `GET /api/trips/:id` - Get trip details

  // Initialize and process nodes

  // Returns optimal path with minimum travel time- Pie charts for efficiency distribution

}

```- Bar charts for driver comparison### Analytics



### 2. **A* Search** - Heuristic Pathfinding- Line graphs for monthly trends



```javascript- Top performers leaderboard- `GET /api/analytics/summary` - Get summary stats

// Location: /backend/algorithms/astar.js

// Time Complexity: O(b^d) with good heuristic

// Space Complexity: O(V)

### 🚗 **4. Trip Management**### Route

// Uses Haversine distance as heuristic

export function astar(graph, start, end, heuristic) {

  // g-score: actual distance from start

  // h-score: estimated distance to goal**Trip Lifecycle:**- `POST /api/route/optimize` - Optimize route

  // f-score = g-score + h-score

}````

```

START → GPS TRACKING → TELEMETRY COLLECTION → END → ANALYSIS## 🚀 Deployment

### 3. **Dynamic Programming** - Fuel Optimization

````

```javascript

// Location: /backend/algorithms/dpRefuel.js### Deploy Backend to Vercel

// Time Complexity: O(n × m)

// Space Complexity: O(n × m)**Trip States:**



// Minimizes fuel cost with optimal refueling strategy- `running` - Active trip in progress```bash

export function dpRefuel(segments, fuelStations) {

  // DP table: dp[i][j] = min cost to reach segment i with fuel j- `finished` - Completed tripcd backend

  // Returns refueling plan with minimum total cost

}- `cancelled` - Manually stopped tripnpm install -g vercel

```

vercel

### 4. **K-Means Clustering** - POI Grouping

**Data Collection:**```

```javascript

// Location: /backend/algorithms/kmeans.js- Start/end coordinates

// Time Complexity: O(n × k × i)

// Space Complexity: O(n + k)- Total distance traveledSet environment variables in Vercel dashboard:



// Groups nearby POIs for casual route- Duration (seconds)

export function kmeans(points, k, maxIterations = 100) {

  // Iteratively refines cluster centroids- Average/max speed- `MONGODB_URI`

  // Returns k clusters of nearby points

}- Fuel consumed- `FIREBASE_ADMIN_SA`

```

- Driving behavior metrics- `OSRM_URL`

---



## 💾 Database Design

**Trip Summary Includes:**### Deploy Frontend to Firebase

### MongoDB Collections

- Distance: Actual vs. Planned

#### **vehicles**

```javascript- Route adherence percentage```bash

{

  _id: ObjectId,- Fuel efficiency scorecd frontend

  fleetId: ObjectId,

  registrationNumber: String,- Driving behavior breakdownnpm run build

  make: String,

  model: String,- Detailed telemetry playbackfirebase login

  fuelType: String,  // 'Petrol', 'Diesel', 'EV'

  consumptionBaseline: Number,  // km/L or km/kWhfirebase init hosting

  status: String,  // 'active', 'maintenance', 'inactive'

  createdAt: Date### 📊 **5. Fleet Analytics Dashboard**firebase deploy --only hosting

}

`````

#### **trips\*\***Key Metrics:\*\*

````javascript

{- Total fleet fuel consumption## 📝 Next Steps

  _id: ObjectId,

  vehicleId: ObjectId,- Average efficiency scores

  driverId: ObjectId,

  fleetId: ObjectId,- Active vs. idle vehicles1. Complete Dashboard UI with charts and trip visualization

  route: {

    origin: { name: String, lat: Number, lng: Number },- Monthly trend analysis2. Implement trip detail page with Leaflet maps

    destination: { name: String, lat: Number, lng: Number },

    type: String  // 'fastest', 'eco', 'casual', 'custom'- Driver performance rankings3. Add CSV export functionality

  },

  distance: Number,  // km4. Build fleet admin interface

  duration: Number,  // minutes

  fuelConsumed: Number,**Visualizations:**5. Record 2-3 minute demo video

  efficiencyScore: Number,  // 0-100

  status: String,  // 'planned', 'active', 'completed'- **Pie Chart** - Fleet efficiency distribution (Excellent/Good/Poor)6. Polish UI/UX

  startTime: Date,

  endTime: Date- **Bar Chart** - Top 5 most efficient drivers7. Add error boundaries and loading states

}

```- **Line Chart** - Monthly fuel consumption trends8. Implement driver coaching tips



#### **telemetry**- **Data Table** - Detailed driver statistics9. Add fuel/charging station integration

```javascript

{**Real-Time Updates:**## 📄 License

  _id: ObjectId,

  tripId: ObjectId,- Auto-refresh every 10 seconds

  timestamp: Date,

  location: { lat: Number, lng: Number },- WebSocket-ready architectureMIT

  speed: Number,  // km/h

  fuelLevel: Number,- Live trip status updates

  rpm: Number,

  throttle: Number## 👥 Contributors

}

```### 🗺️ **6. Live Fleet Tracking**



#### **anomalies**Built for SEM Project - Fuel/Energy Consumption Optimizer

```javascript

{**Features:**

  _id: ObjectId,

  tripId: ObjectId,- Real-time vehicle positions on map

  type: String,  // 'harsh_braking', 'rapid_acceleration', 'overspeeding'- Start (green) and current (blue) position markers

  severity: String,  // 'low', 'medium', 'high'- Polyline visualization of driven path

  timestamp: Date,- Click-to-focus on individual trips

  location: { lat: Number, lng: Number },- Auto-bounds adjustment for optimal view

  details: Mixed

}**Trip Cards Display:**

````

- Vehicle name and driver info

---- Current speed and distance

- Trip duration counter

## 🔒 Authentication & Security- GPS points collected

- Route type indicator

- **Firebase Authentication** - Email/Password and Google OAuth

- **JWT Tokens** - Secure API access with bearer tokens**Map Interactions:**

- **Role-based Access** - Admin vs Driver permissions

- **Environment Variables** - Secrets stored securely- Zoom/pan controls

- **HTTPS Only** - All API calls encrypted- Popup information on markers

- **CORS Configuration** - Restricted origins- Route path highlighting

- Multiple map tile layers

---

### 👥 **7. Driver Management**

## 🚀 Deployment

**Fleet Admin Capabilities:**

### Frontend (Firebase Hosting)

- View all drivers in fleet

```bash- Assign vehicles to drivers

cd frontend- Monitor active trips

npm run build- View individual trip histories

firebase deploy --only hosting- Track performance metrics

```

**Driver Statistics:**

**Live URL**: https://fueloptimiser.web.app

- Total trips completed

### Backend (Vercel)- Active trip status

- Total distance driven

````bash- Average efficiency score

cd backend- Vehicle assignment status

vercel --prod

```**Driver Trip History Page:**



**Live URL**: https://fuel-optimizer-backend.vercel.app- Complete trip log with filters

- Statistics dashboard

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)- Efficiency-based filtering (All/Excellent/Good/Poor)

- Detailed trip breakdowns

---- Performance trends



## 📊 Performance Metrics---



- **Route Calculation**: < 2 seconds for 100km routes## 🧮 Data Structures & Algorithms

- **Map Rendering**: 60 FPS with 1000+ POI markers

- **Telemetry Processing**: 10 updates/second### **1. Graph Algorithms**

- **API Response Time**: < 500ms average

- **Database Queries**: Indexed for O(log n) lookup**Dijkstra's Shortest Path** (via OSRM)

- **Bundle Size**:

  - Frontend: ~1.2 MB (gzipped: ~334 KB)- Used for route optimization

  - Backend: Serverless (cold start < 1s)- Finds minimum-cost path between nodes

- Considers edge weights (distance, time, fuel)

---

**A\* Pathfinding** (OSRM implementation)

## 🎯 Use Cases

- Heuristic-based search algorithm

### Fleet Administrator- Faster than Dijkstra for specific destinations

1. Log in → View dashboard with fleet overview- Uses geographic distance as heuristic

2. Add vehicles and assign drivers

3. Monitor active trips in real-time### **2. Geospatial Algorithms**

4. Analyze fuel efficiency trends

5. Generate cost reports**Haversine Formula**



### Driver```javascript

1. Log in → View personal dashboard// Great-circle distance between two points on Earth

2. Plan route (select algorithm: Fastest/Eco/Casual)distance = 2 * R * arcsin(√(sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)))

3. Start trip → Enable GPS tracking```

4. Monitor live fuel consumption

5. End trip → View efficiency score and savings- **Use Cases:**

  - Distance calculation between GPS points

---  - Route adherence checking

  - Proximity detection

## 🤝 Contributing

**Bounding Box Calculations**

Contributions are welcome! Please follow these steps:

```javascript

1. Fork the repository// Map bounds for displaying routes

2. Create a feature branch (`git checkout -b feature/AmazingFeature`)bounds = L.latLngBounds(coordinateArray);

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)map.fitBounds(bounds, { padding: [50, 50] });

4. Push to the branch (`git push origin feature/AmazingFeature`)```

5. Open a Pull Request

### **3. Data Structures Used**

---

**Arrays**

## 📝 License

- Telemetry point storage: `[{lat, lng, speed, timestamp}, ...]`

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.- Route coordinate arrays: `[[lat1, lng1], [lat2, lng2], ...]`

- Trip history lists

---

**Objects/Hash Maps**

## 👨‍💻 Author

```javascript

**Soham Karandikar**// Driver statistics mapping

driverStats = {

- GitHub: [@sohamkarandikar](https://github.com/sohamkarandikar)  userId1: { totalTrips: 10, activeTrips: 1 },

- Email: sohamkarandikar007@gmail.com  userId2: { totalTrips: 15, activeTrips: 0 },

};

---```



## 🙏 Acknowledgments**Queues**



- **OpenStreetMap** - Map data- Telemetry buffer for batch processing

- **OSRM** - Routing engine- Real-time event processing

- **Firebase** - Authentication & hosting

- **MongoDB Atlas** - Database hosting**Time Series Data**

- **Vercel** - Backend deployment

- **Leaflet.js** - Interactive maps```javascript

- **Recharts** - Data visualization// Telemetry time series

telemetry: [

---  { timestamp: "2025-10-06T10:00:00Z", lat: 19.076, lng: 72.8777, speed: 45 },

  { timestamp: "2025-10-06T10:00:05Z", lat: 19.0762, lng: 72.878, speed: 47 },

<div align="center">];

````

**⭐ Star this repository if you found it helpful!**

### **4. Sorting & Filtering Algorithms**

Made with ❤️ and ☕ by Soham Karandikar

**Trip Sorting**

</div>

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
