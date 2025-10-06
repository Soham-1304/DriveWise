/**
 * Dynamic Programming for Eco-Friendly Route Optimization
 * 
 * Algorithm: DP for minimum fuel consumption path
 * Concept: Modify edge weights by fuel consumption factors (slope, speed, vehicle efficiency)
 * Time Complexity: O(V * E)
 * Space Complexity: O(V)
 * 
 * Use Case: Finding ECO-FRIENDLY route (minimum fuel/energy)
 */

import PriorityQueue from './PriorityQueue.js';

/**
 * Calculate fuel consumption for an edge
 * @param {Number} distanceKm - Distance in km
 * @param {Number} avgSpeed - Average speed in km/h
 * @param {Number} baseline - Vehicle baseline consumption (L/100km or kWh/100km)
 * @param {Number} elevationChange - Elevation change in meters (optional)
 * @returns {Number} Fuel/energy consumed
 */
function calculateFuelConsumption(distanceKm, avgSpeed, baseline, elevationChange = 0) {
  // Base consumption
  let consumption = (distanceKm / 100) * baseline;

  // Speed factor (higher speeds = more consumption)
  let speedFactor = 1.0;
  if (avgSpeed > 80) {
    speedFactor = 1.15; // 15% more at highway speeds
  } else if (avgSpeed > 60) {
    speedFactor = 1.08; // 8% more at moderate speeds
  } else if (avgSpeed < 30) {
    speedFactor = 1.12; // 12% more in traffic
  }

  // Elevation factor (uphill = more fuel)
  let elevationFactor = 1.0;
  if (elevationChange > 50) {
    elevationFactor = 1.2; // 20% more going uphill
  } else if (elevationChange < -50) {
    elevationFactor = 0.9; // 10% less going downhill
  }

  return consumption * speedFactor * elevationFactor;
}

/**
 * Find eco-friendly route using modified Dijkstra with fuel weights
 * @param {Object} graph - Adjacency list with edge metadata
 * @param {String} start - Start node ID
 * @param {String} end - End node ID
 * @param {Object} vehicle - Vehicle data { fuelType, consumptionBaseline }
 * @returns {Object} { path, fuelUsed, geometry }
 */
export function ecoRoute(graph, start, end, vehicle) {
  const baseline = vehicle?.consumptionBaseline || (vehicle?.fuelType === 'EV' ? 15 : 6.5);
  const fuelUsed = {};
  const previous = {};
  const visited = new Set();
  const pq = new PriorityQueue();

  // Initialize
  for (const node in graph) {
    fuelUsed[node] = Infinity;
  }
  fuelUsed[start] = 0;
  pq.insert(start, 0);

  while (!pq.isEmpty()) {
    const { element: current } = pq.extractMin();

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === end) break;

    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) continue;

      // Calculate fuel consumption for this edge
      const edgeFuel = calculateFuelConsumption(
        neighbor.distance || neighbor.weight,
        neighbor.avgSpeed || 50,
        baseline,
        neighbor.elevationChange || 0
      );

      const newFuel = fuelUsed[current] + edgeFuel;

      if (newFuel < fuelUsed[neighbor.to]) {
        fuelUsed[neighbor.to] = newFuel;
        previous[neighbor.to] = { node: current, coords: neighbor.coords };
        pq.insert(neighbor.to, newFuel);
      }
    }
  }

  // Reconstruct path
  const path = [];
  const geometry = [];
  let current = end;

  while (current) {
    path.unshift(current);
    if (previous[current]) {
      geometry.unshift(previous[current].coords);
    }
    current = previous[current]?.node;
  }

  return {
    path,
    fuelUsed: fuelUsed[end],
    geometry,
    algorithm: 'DP-Eco'
  };
}

/**
 * DP for optimal refueling stops
 * @param {Array} stations - Array of { position: km, price: number }
 * @param {Number} tankCapacity - Tank capacity
 * @param {Number} totalDistance - Total distance
 * @returns {Array} Optimal refuel positions
 */
export function optimalRefuelStops(stations, tankCapacity, totalDistance) {
  const n = stations.length;
  const dp = Array(n + 1).fill(Infinity);
  const stops = Array(n + 1).fill([]);
  dp[0] = 0;

  for (let i = 0; i < n; i++) {
    if (dp[i] === Infinity) continue;

    for (let j = i + 1; j <= n; j++) {
      const nextStation = j < n ? stations[j] : { position: totalDistance, price: 0 };
      const currentStation = i === 0 ? { position: 0, price: 0 } : stations[i - 1];
      const distance = nextStation.position - currentStation.position;

      if (distance <= tankCapacity) {
        const cost = dp[i] + (j < n ? nextStation.price : 0);
        if (cost < dp[j]) {
          dp[j] = cost;
          stops[j] = [...stops[i], j < n ? j : null].filter(x => x !== null);
        }
      }
    }
  }

  return {
    minCost: dp[n],
    stops: stops[n].map(idx => stations[idx])
  };
}
