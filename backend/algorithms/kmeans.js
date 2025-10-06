/**
 * K-Means Clustering Algorithm
 * 
 * Algorithm: Unsupervised learning for grouping POIs
 * Time Complexity: O(n * k * iterations)
 * Space Complexity: O(n + k)
 * 
 * Use Case: Clustering petrol pumps/charging stations along route for CASUAL mode
 */

/**
 * Calculate Euclidean distance between two points
 */
function distance(p1, p2) {
  return Math.sqrt((p1.lat - p2.lat) ** 2 + (p1.lng - p2.lng) ** 2);
}

/**
 * K-Means clustering algorithm
 * @param {Array} points - Array of { lat, lng, ...metadata }
 * @param {Number} k - Number of clusters
 * @param {Number} maxIterations - Maximum iterations
 * @returns {Array} Cluster centroids with assigned points
 */
export function kmeans(points, k, maxIterations = 100) {
  if (points.length === 0) return [];
  if (points.length <= k) {
    // If fewer points than clusters, return each point as its own cluster
    return points.map(p => ({
      centroid: { lat: p.lat, lng: p.lng },
      points: [p]
    }));
  }

  // Initialize centroids randomly
  let centroids = [];
  const usedIndices = new Set();
  for (let i = 0; i < k; i++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * points.length);
    } while (usedIndices.has(idx));
    usedIndices.add(idx);
    centroids.push({ lat: points[idx].lat, lng: points[idx].lng });
  }

  let clusters = [];
  let iteration = 0;

  while (iteration < maxIterations) {
    // Assign points to nearest centroid
    clusters = Array.from({ length: k }, () => []);

    for (const point of points) {
      let minDist = Infinity;
      let clusterIdx = 0;

      for (let i = 0; i < k; i++) {
        const dist = distance(point, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          clusterIdx = i;
        }
      }

      clusters[clusterIdx].push(point);
    }

    // Recalculate centroids
    let changed = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;

      const newCentroid = {
        lat: clusters[i].reduce((sum, p) => sum + p.lat, 0) / clusters[i].length,
        lng: clusters[i].reduce((sum, p) => sum + p.lng, 0) / clusters[i].length
      };

      if (distance(centroids[i], newCentroid) > 0.0001) {
        changed = true;
      }
      centroids[i] = newCentroid;
    }

    if (!changed) break;
    iteration++;
  }

  // Return clusters with centroids
  return clusters.map((clusterPoints, idx) => ({
    centroid: centroids[idx],
    points: clusterPoints,
    size: clusterPoints.length
  })).filter(c => c.size > 0);
}

/**
 * Find optimal POI stops along a route
 * @param {Array} routeGeometry - Array of [lat, lng] coordinates
 * @param {Array} pois - Array of POI objects with { lat, lng, type, name }
 * @param {Number} maxDistance - Max distance from route to consider POI (km)
 * @returns {Array} Clustered POIs near route
 */
export function findPOIsAlongRoute(routeGeometry, pois, maxDistance = 2) {
  // Filter POIs within maxDistance of route
  const nearbyPOIs = pois.filter(poi => {
    return routeGeometry.some(coord => {
      const dist = haversineDistance(
        { lat: coord[0], lng: coord[1] },
        { lat: poi.lat, lng: poi.lng }
      );
      return dist <= maxDistance;
    });
  });

  if (nearbyPOIs.length === 0) return [];

  // Cluster nearby POIs
  const k = Math.min(5, Math.ceil(nearbyPOIs.length / 3)); // 5 clusters max
  return kmeans(nearbyPOIs, k);
}

/**
 * Haversine distance for geospatial calculations
 */
function haversineDistance(coord1, coord2) {
  const R = 6371;
  const toRad = Math.PI / 180;
  const dLat = (coord2.lat - coord1.lat) * toRad;
  const dLng = (coord2.lng - coord1.lng) * toRad;
  const lat1 = coord1.lat * toRad;
  const lat2 = coord2.lat * toRad;

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}
