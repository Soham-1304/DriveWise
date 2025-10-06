/**
 * Dijkstra's Shortest Path Algorithm
 * 
 * Algorithm: Classic shortest path using distance as weight
 * Time Complexity: O((V + E) log V) with priority queue
 * Space Complexity: O(V)
 * 
 * Use Case: Finding FASTEST route (minimum time)
 */

import PriorityQueue from './PriorityQueue.js';

/**
 * Find shortest path using Dijkstra's algorithm
 * @param {Object} graph - Adjacency list { nodeId: [{ to: nodeId, weight: number, coords: [lat, lng] }] }
 * @param {String} start - Start node ID
 * @param {String} end - End node ID
 * @returns {Object} { path: [nodeIds], distance: number, geometry: [[lat, lng]] }
 */
export function dijkstra(graph, start, end) {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const pq = new PriorityQueue();

  // Initialize distances
  for (const node in graph) {
    distances[node] = Infinity;
  }
  distances[start] = 0;
  pq.insert(start, 0);

  while (!pq.isEmpty()) {
    const { element: current } = pq.extractMin();

    if (visited.has(current)) continue;
    visited.add(current);

    // Found destination
    if (current === end) break;

    // Explore neighbors
    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) continue;

      const newDist = distances[current] + neighbor.weight;
      if (newDist < distances[neighbor.to]) {
        distances[neighbor.to] = newDist;
        previous[neighbor.to] = { node: current, coords: neighbor.coords };
        pq.insert(neighbor.to, newDist);
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
    distance: distances[end],
    geometry,
    algorithm: 'Dijkstra'
  };
}

/**
 * Calculate edge weight based on time (distance / speed)
 * @param {Number} distanceKm - Distance in kilometers
 * @param {Number} speedKmh - Average speed in km/h
 * @returns {Number} Time in minutes
 */
export function calculateTimeWeight(distanceKm, speedKmh = 50) {
  return (distanceKm / speedKmh) * 60; // minutes
}
