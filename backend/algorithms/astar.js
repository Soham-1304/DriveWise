/**
 * A* Search Algorithm
 * 
 * Algorithm: Heuristic-based pathfinding (Dijkstra + heuristic)
 * Heuristic: Haversine distance (straight-line distance to goal)
 * Time Complexity: O((V + E) log V) - faster than Dijkstra in practice
 * Space Complexity: O(V)
 * 
 * Use Case: Finding FASTEST route with better performance than Dijkstra
 */

import PriorityQueue from './PriorityQueue.js';

/**
 * Haversine distance heuristic
 * @param {Array} coord1 - [lat, lng]
 * @param {Array} coord2 - [lat, lng]
 * @returns {Number} Distance in km
 */
function heuristic(coord1, coord2) {
  const R = 6371; // Earth radius in km
  const toRad = Math.PI / 180;
  const dLat = (coord2[0] - coord1[0]) * toRad;
  const dLng = (coord2[1] - coord1[1]) * toRad;
  const lat1 = coord1[0] * toRad;
  const lat2 = coord2[0] * toRad;

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * A* pathfinding algorithm
 * @param {Object} graph - Adjacency list with coords { nodeId: [{ to: nodeId, weight: number, coords: [lat, lng] }] }
 * @param {String} start - Start node ID
 * @param {String} end - End node ID
 * @param {Object} nodeCoords - Map of nodeId -> [lat, lng]
 * @returns {Object} { path: [nodeIds], distance: number, geometry: [[lat, lng]] }
 */
export function astar(graph, start, end, nodeCoords) {
  const gScore = {}; // Cost from start to node
  const fScore = {}; // gScore + heuristic
  const previous = {};
  const visited = new Set();
  const pq = new PriorityQueue();

  // Initialize
  for (const node in graph) {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
  }
  gScore[start] = 0;
  fScore[start] = heuristic(nodeCoords[start], nodeCoords[end]);
  pq.insert(start, fScore[start]);

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

      const tentativeGScore = gScore[current] + neighbor.weight;

      if (tentativeGScore < gScore[neighbor.to]) {
        previous[neighbor.to] = { node: current, coords: neighbor.coords };
        gScore[neighbor.to] = tentativeGScore;
        fScore[neighbor.to] = tentativeGScore + heuristic(nodeCoords[neighbor.to], nodeCoords[end]);
        pq.insert(neighbor.to, fScore[neighbor.to]);
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
    distance: gScore[end],
    geometry,
    algorithm: 'A*'
  };
}
