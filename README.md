# DriveWise

Fleet management system with AI route optimization, real-time GPS tracking, and fuel efficiency monitoring.

🔗 **Live:** [fueloptimiser.web.app](https://fueloptimiser.web.app)

---

## Features

- **Fleet Dashboard** - Real-time analytics, vehicle/driver management
- **Smart Routing** - Dijkstra, A*, Dynamic Programming algorithms  
- **GPS Tracking** - Live location monitoring during trips
- **Fuel Analytics** - Consumption tracking, efficiency scoring

---

## Tech Stack

React • Node.js • MongoDB • Firebase • Leaflet.js

---

## Setup

```bash
git clone https://github.com/Soham-1304/DriveWise.git
cd DriveWise

# Backend
cd backend && npm install
cp .env.example .env  # Add MongoDB + Firebase credentials
npm run dev

# Frontend
cd frontend && npm install  
cp .env.example .env  # Add Firebase config
npm run dev
```

---

## Algorithms

- **Dijkstra** - Fastest route
- **A*** - Heuristic pathfinding
- **Dynamic Programming** - Fuel optimization
- **K-Means** - POI clustering

---

## Documentation

See [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) for deep dive.

---

**Author:** Soham Karandikar | [GitHub](https://github.com/Soham-1304)
