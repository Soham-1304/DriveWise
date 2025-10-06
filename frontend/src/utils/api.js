/**
 * API Utilities for Authenticated Requests
 * 
 * This file provides helper functions for making API calls
 * with Firebase authentication tokens
 */

import { auth } from '../firebase';

const API_BASE_URL = 'http://localhost:3000/api';

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
 * Make an authenticated API request
 */
export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Get Firebase token and add to headers
  try {
    const token = await getAuthToken();
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw new Error('Authentication required');
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
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
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

export default { apiRequest, apiGet, apiPost, apiPut, apiDelete };
