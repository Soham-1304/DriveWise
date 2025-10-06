/**
 * Test All Analytics Endpoints
 * 
 * This script tests all 5 MongoDB aggregation endpoints
 * Run: node scripts/testEndpoints.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const FLEET_ID = 'demo_fleet_001';
const VEHICLE_ID = 'vehicle_001';
const TEST_HEADERS = {
  'Content-Type': 'application/json',
  'X-Test-Key': 'DEMO_TEST_2024' // Test auth bypass key
};

// Note: Using test auth bypass for demo purposes
const endpoints = [
  {
    name: 'Fleet Performance',
    url: `/api/fleet/performance?fleetId=${FLEET_ID}`,
    description: 'Vehicle-wise performance comparison'
  },
  {
    name: 'Driver Ranking',
    url: `/api/fleet/drivers/ranking?fleetId=${FLEET_ID}`,
    description: 'Driver efficiency leaderboard'
  },
  {
    name: 'Fuel Trend',
    url: `/api/analytics/fuel-trend?vehicleId=${VEHICLE_ID}`,
    description: 'Monthly fuel consumption trends'
  },
  {
    name: 'Nearby POIs',
    url: `/api/fleet/nearby-pois?lat=19.076&lng=72.8777&maxDistance=5000`, // Fixed URL
    description: 'Geospatial POI search'
  },
  {
    name: 'Anomaly Detection',
    url: `/api/analytics/anomalies?fleetId=${FLEET_ID}`,
    description: 'Statistical outlier detection'
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Testing: ${endpoint.name}`);
  console.log(`Description: ${endpoint.description}`);
  console.log(`URL: ${endpoint.url}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const response = await fetch(`${BASE_URL}${endpoint.url}`, {
      headers: TEST_HEADERS
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}\n`);
      return { name: endpoint.name, status: 'FAILED', error: errorText };
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      console.log(`✅ Success! Returned ${data.length} records`);
      
      if (data.length > 0) {
        console.log(`\n📋 Sample Record:`);
        console.log(JSON.stringify(data[0], null, 2).substring(0, 500) + '...');
      } else {
        console.log(`⚠️  Warning: No data returned (this might be expected for POIs)`);
      }
    } else {
      console.log(`✅ Success! Returned object`);
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    }
    
    return { name: endpoint.name, status: 'SUCCESS', count: Array.isArray(data) ? data.length : 1 };
    
  } catch (error) {
    console.log(`❌ Request Failed: ${error.message}\n`);
    return { name: endpoint.name, status: 'ERROR', error: error.message };
  }
}

async function testAll() {
  console.log('\n🚀 TESTING ALL ANALYTICS ENDPOINTS');
  console.log('====================================\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Fleet ID: ${FLEET_ID}`);
  console.log(`Vehicle ID: ${VEHICLE_ID}\n`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(60)}\n`);
  
  results.forEach(result => {
    const icon = result.status === 'SUCCESS' ? '✅' : '❌';
    const details = result.count !== undefined ? `(${result.count} records)` : '';
    console.log(`${icon} ${result.name.padEnd(20)} - ${result.status} ${details}`);
  });
  
  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Total: ${successCount}/${totalCount} endpoints working`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 ALL ENDPOINTS ARE WORKING! Ready for demo!\n');
  } else {
    console.log('\n⚠️  Some endpoints need attention. Check errors above.\n');
  }
}

// Run tests
testAll().catch(console.error);
