import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Truck, 
  LayoutDashboard, 
  Car, 
  Users, 
  MapPin, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  Trophy,
  Fuel,
  AlertTriangle
} from 'lucide-react'
import { useState } from 'react'

export default function FleetAdminLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
    { name: 'Drivers', href: '/admin/drivers', icon: Users },
    { name: 'Live Tracking', href: '/admin/tracking', icon: MapPin },
    { 
      name: 'Analytics', 
      icon: BarChart3,
      submenu: [
        { name: 'Fleet Performance', href: '/admin/fleet-performance', icon: TrendingUp },
        { name: 'Driver Ranking', href: '/admin/driver-ranking', icon: Trophy },
        { name: 'Fuel Analytics', href: '/admin/fuel-analytics', icon: Fuel },
        { name: 'Anomaly Alerts', href: '/admin/anomaly-alerts', icon: AlertTriangle },
      ]
    },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FleetOptimizer</h1>
              <p className="text-xs text-blue-200">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                // Analytics dropdown
                <div className="mb-1">
                  <div className="flex items-center gap-3 px-4 py-3 text-blue-100">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="ml-6 space-y-0.5">
                    {item.submenu.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.href}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm
                          ${isActive 
                            ? 'bg-white/20 text-white font-semibold' 
                            : 'text-blue-100 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span>{subItem.name}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                // Regular nav item
                <NavLink
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${isActive 
                      ? 'bg-white/20 text-white font-semibold' 
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-blue-200">Fleet Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-200 hover:bg-red-500/20 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
