/**
 * API Utilities for Authenticated Requests
 * 
 * This file provides helper functions for making API calls
 * with Firebase authentication tokens
 */

import axios from '../lib/axios';
import { auth } from '../firebase';

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Make an authenticated API request using axios
 */
export async function apiRequest(endpoint, options = {}) {
  // Get Firebase token
  const token = await getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };
  
  try {
    const response = await axios(endpoint, config);
    return response.data;
  } catch (error) {
    console.error('API request error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message || 'API request failed');
  }
}

/**
 * GET request helper
 */
export async function apiGet(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    data,
  });
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    data,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

export default { apiRequest, apiGet, apiPost, apiPut, apiDelete };
