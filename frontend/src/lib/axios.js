import axios from 'axios'

// Get the base URL from environment variables
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Log for debugging
console.log('🔧 Axios Base URL configured as:', baseURL)
console.log('🔧 Environment:', import.meta.env.MODE)

// Create axios instance with base URL from environment variables
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
  // Note: withCredentials removed - we use Bearer tokens, not cookies
})

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`
    console.log('🌐 API Request:', config.method?.toUpperCase(), fullUrl)
    console.log('🔑 Headers:', config.headers)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default axiosInstance
