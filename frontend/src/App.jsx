import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import FleetAdminLayout from './components/FleetAdminLayout'
import DriverLayout from './components/DriverLayout'
import FleetAdminDashboard from './pages/FleetAdminDashboard'
import DriverDashboard from './pages/DriverDashboard'
import DriverTripsPage from './pages/DriverTripsPage'
import TripTracker from './pages/TripTracker'
import RoutePlanner from './pages/RoutePlanner'

// Import real pages
import VehiclesPage from './pages/VehiclesPage'
import DriversPage from './pages/DriversPage'
import DriverTripHistoryPage from './pages/DriverTripHistoryPage'
import SettingsPage from './pages/SettingsPage'
import LiveTrackingPage from './pages/LiveTrackingPage'

// Import new analytics pages
import FleetPerformancePage from './pages/FleetPerformancePage'
import DriverRankingPage from './pages/DriverRankingPage'
import FuelAnalyticsPage from './pages/FuelAnalyticsPage'
import AnomalyAlertsPage from './pages/AnomalyAlertsPage'

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'fleet_admin') {
      return <Navigate to="/admin/dashboard" />
    } else if (userRole === 'driver') {
      return <Navigate to="/driver" />
    }
    return <Navigate to="/login" />
  }

  return children
}

function AppRoutes() {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          !user ? <Login /> : 
          userRole === 'fleet_admin' ? <Navigate to="/admin/dashboard" /> :
          userRole === 'driver' ? <Navigate to="/driver" /> :
          <Navigate to="/login" />
        } 
      />
      <Route 
        path="/register" 
        element={
          !user ? <Register /> : 
          userRole === 'fleet_admin' ? <Navigate to="/admin/dashboard" /> :
          userRole === 'driver' ? <Navigate to="/driver" /> :
          <Navigate to="/login" />
        } 
      />

      {/* Fleet Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['fleet_admin']}>
            <FleetAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<FleetAdminDashboard />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="drivers/:driverId/trips" element={<DriverTripHistoryPage />} />
        <Route path="tracking" element={<LiveTrackingPage />} />
        <Route path="analytics" element={<FleetAdminDashboard />} />
        <Route path="fleet-performance" element={<FleetPerformancePage />} />
        <Route path="driver-ranking" element={<DriverRankingPage />} />
        <Route path="fuel-analytics" element={<FuelAnalyticsPage />} />
        <Route path="anomaly-alerts" element={<AnomalyAlertsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Driver routes */}
      <Route
        path="/driver/*"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DriverDashboard />} />
        <Route path="route-planner" element={<RoutePlanner />} />
        <Route path="start-trip" element={<TripTracker />} />
        <Route path="history" element={<DriverTripsPage />} />
        <Route path="achievements" element={<div className="text-center py-12"><h2 className="text-2xl font-bold mb-4">Achievements</h2><p className="text-gray-600">Coming soon</p></div>} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Default redirect based on role */}
      <Route 
        path="/" 
        element={
          user ? (
            userRole === 'fleet_admin' ? <Navigate to="/admin/dashboard" /> :
            userRole === 'driver' ? <Navigate to="/driver" /> :
            <Navigate to="/login" />
          ) : (
            <Navigate to="/login" />
          )
        } 
      />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
