/**
 * Sample Road Network Graph Builder
 * 
 * For prototype: Uses sample Mumbai road network
 * For production: Would parse real OSM data
 */

/**
 * Sample Mumbai road network
 * Each node represents an intersection/landmark
 * Each edge has: distance (km), avgSpeed (km/h), elevationChange (m)
 */
export function buildMumbaiGraph() {
  const nodes = {
    'cst': { lat: 18.9401, lng: 72.8352, name: 'CST Station' },
    'flora_fountain': { lat: 18.9323, lng: 72.8313, name: 'Flora Fountain' },
    'gateway': { lat: 18.9220, lng: 72.8347, name: 'Gateway of India' },
    'worli': { lat: 19.0176, lng: 72.8119, name: 'Worli' },
    'bandra': { lat: 19.0596, lng: 72.8295, name: 'Bandra' },
    'andheri': { lat: 19.1136, lng: 72.8697, name: 'Andheri' },
    'juhu': { lat: 19.0990, lng: 72.8268, name: 'Juhu Beach' },
    'powai': { lat: 19.1176, lng: 72.9060, name: 'Powai' },
    'bkc': { lat: 19.0653, lng: 72.8699, name: 'BKC' },
    'churchgate': { lat: 18.9322, lng: 72.8264, name: 'Churchgate' }
  };

  // Adjacency list: { from: [{ to, distance, avgSpeed, elevationChange, coords }] }
  const edges = {
    'cst': [
      { to: 'flora_fountain', distance: 1.2, avgSpeed: 25, elevationChange: 5, coords: [18.9323, 72.8313] },
      { to: 'gateway', distance: 2.5, avgSpeed: 30, elevationChange: -10, coords: [18.9220, 72.8347] }
    ],
    'flora_fountain': [
      { to: 'cst', distance: 1.2, avgSpeed: 25, elevationChange: -5, coords: [18.9401, 72.8352] },
      { to: 'churchgate', distance: 0.8, avgSpeed: 20, elevationChange: 0, coords: [18.9322, 72.8264] },
      { to: 'gateway', distance: 1.5, avgSpeed: 28, elevationChange: -8, coords: [18.9220, 72.8347] }
    ],
    'churchgate': [
      { to: 'flora_fountain', distance: 0.8, avgSpeed: 20, elevationChange: 0, coords: [18.9323, 72.8313] },
      { to: 'worli', distance: 5.2, avgSpeed: 45, elevationChange: 15, coords: [19.0176, 72.8119] }
    ],
    'gateway': [
      { to: 'cst', distance: 2.5, avgSpeed: 30, elevationChange: 10, coords: [18.9401, 72.8352] },
      { to: 'flora_fountain', distance: 1.5, avgSpeed: 28, elevationChange: 8, coords: [18.9323, 72.8313] },
      { to: 'worli', distance: 6.8, avgSpeed: 50, elevationChange: 20, coords: [19.0176, 72.8119] }
    ],
    'worli': [
      { to: 'churchgate', distance: 5.2, avgSpeed: 45, elevationChange: -15, coords: [18.9322, 72.8264] },
      { to: 'gateway', distance: 6.8, avgSpeed: 50, elevationChange: -20, coords: [18.9220, 72.8347] },
      { to: 'bandra', distance: 4.5, avgSpeed: 55, elevationChange: 10, coords: [19.0596, 72.8295] },
      { to: 'bkc', distance: 3.2, avgSpeed: 50, elevationChange: 5, coords: [19.0653, 72.8699] }
    ],
    'bandra': [
      { to: 'worli', distance: 4.5, avgSpeed: 55, elevationChange: -10, coords: [19.0176, 72.8119] },
      { to: 'juhu', distance: 4.8, avgSpeed: 40, elevationChange: 8, coords: [19.0990, 72.8268] },
      { to: 'andheri', distance: 7.2, avgSpeed: 60, elevationChange: 15, coords: [19.1136, 72.8697] },
      { to: 'bkc', distance: 2.1, avgSpeed: 45, elevationChange: 3, coords: [19.0653, 72.8699] }
    ],
    'bkc': [
      { to: 'worli', distance: 3.2, avgSpeed: 50, elevationChange: -5, coords: [19.0176, 72.8119] },
      { to: 'bandra', distance: 2.1, avgSpeed: 45, elevationChange: -3, coords: [19.0596, 72.8295] },
      { to: 'powai', distance: 5.5, avgSpeed: 55, elevationChange: 25, coords: [19.1176, 72.9060] },
      { to: 'andheri', distance: 6.0, avgSpeed: 58, elevationChange: 12, coords: [19.1136, 72.8697] }
    ],
    'juhu': [
      { to: 'bandra', distance: 4.8, avgSpeed: 40, elevationChange: -8, coords: [19.0596, 72.8295] },
      { to: 'andheri', distance: 3.5, avgSpeed: 50, elevationChange: 5, coords: [19.1136, 72.8697] }
    ],
    'andheri': [
      { to: 'bandra', distance: 7.2, avgSpeed: 60, elevationChange: -15, coords: [19.0596, 72.8295] },
      { to: 'juhu', distance: 3.5, avgSpeed: 50, elevationChange: -5, coords: [19.0990, 72.8268] },
      { to: 'powai', distance: 4.2, avgSpeed: 52, elevationChange: 18, coords: [19.1176, 72.9060] },
      { to: 'bkc', distance: 6.0, avgSpeed: 58, elevationChange: -12, coords: [19.0653, 72.8699] }
    ],
    'powai': [
      { to: 'andheri', distance: 4.2, avgSpeed: 52, elevationChange: -18, coords: [19.1136, 72.8697] },
      { to: 'bkc', distance: 5.5, avgSpeed: 55, elevationChange: -25, coords: [19.0653, 72.8699] }
    ]
  };

  return { nodes, edges };
}

/**
 * Find nearest node to coordinates
 */
export function findNearestNode(lat, lng, nodes) {
  let nearest = null;
  let minDist = Infinity;

  for (const [id, node] of Object.entries(nodes)) {
    const dist = Math.sqrt(
      (node.lat - lat) ** 2 + (node.lng - lng) ** 2
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = id;
    }
  }

  return nearest;
}

/**
 * Sample POIs (Petrol pumps, charging stations, restaurants)
 */
export function getSamplePOIs() {
  return [
    // Petrol Pumps
    { type: 'petrol', name: 'HP Petrol Pump - Fort', lat: 18.9350, lng: 72.8320, price: 106.31 },
    { type: 'petrol', name: 'Reliance Petrol - Worli', lat: 19.0150, lng: 72.8150, price: 105.95 },
    { type: 'petrol', name: 'Indian Oil - Bandra', lat: 19.0580, lng: 72.8280, price: 106.15 },
    { type: 'petrol', name: 'Shell Petrol - Andheri', lat: 19.1150, lng: 72.8710, price: 106.50 },
    { type: 'petrol', name: 'HP - Powai', lat: 19.1180, lng: 72.9070, price: 106.20 },
    
    // EV Charging Stations
    { type: 'charging', name: 'Tata Power Charging - BKC', lat: 19.0650, lng: 72.8690, price: 12, power: '50kW' },
    { type: 'charging', name: 'Ather Grid - Bandra', lat: 19.0600, lng: 72.8310, price: 10, power: '30kW' },
    { type: 'charging', name: 'ChargePoint - Powai', lat: 19.1170, lng: 72.9050, price: 11, power: '60kW' },
    { type: 'charging', name: 'Fortum Charge - Worli', lat: 19.0160, lng: 72.8130, price: 13, power: '50kW' },
    
    // Restaurants
    { type: 'restaurant', name: 'Cafe Mondegar', lat: 18.9280, lng: 72.8310, cuisine: 'Continental' },
    { type: 'restaurant', name: 'Bademiya - Colaba', lat: 18.9210, lng: 72.8320, cuisine: 'Indian' },
    { type: 'restaurant', name: 'The Bombay Canteen', lat: 19.0175, lng: 72.8120, cuisine: 'Indian' },
    { type: 'restaurant', name: 'Bastian - Bandra', lat: 19.0610, lng: 72.8315, cuisine: 'Seafood' },
    { type: 'restaurant', name: 'Social - Powai', lat: 19.1165, lng: 72.9045, cuisine: 'Multi-cuisine' },
    { type: 'restaurant', name: 'Salt Water Cafe - Bandra', lat: 19.0595, lng: 72.8290, cuisine: 'Cafe' }
  ];
}
