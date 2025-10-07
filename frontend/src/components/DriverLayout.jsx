import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Car, 
  LayoutDashboard, 
  Navigation, 
  History, 
  Settings, 
  LogOut,
  Menu,
  X,
  Trophy
} from 'lucide-react'
import { useState } from 'react'

export default function DriverLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/driver', icon: LayoutDashboard },
    { name: 'Start Trip', href: '/driver/route-planner', icon: Navigation },
    { name: 'Trip History', href: '/driver/history', icon: History },
    { name: 'Achievements', href: '/driver/achievements', icon: Trophy },
    { name: 'Settings', href: '/driver/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 text-white shadow-2xl border-r border-dark-700/50
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center backdrop-blur-xl border border-orange-500/30">
              <Car className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FuelOptimizer</h1>
              <p className="text-xs text-gray-400">Driver Portal</p>
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
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/driver'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${isActive 
                  ? 'bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30' 
                  : 'text-gray-300 hover:bg-dark-700/50 hover:text-orange-400'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-orange-500/30">
              <span className="text-sm font-semibold text-orange-400">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.email}</p>
              <p className="text-xs text-gray-400">Driver</p>
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
        <header className="bg-dark-800/30 backdrop-blur-xl border-b border-dark-700/30 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-dark-700/50 rounded-lg transition"
            >
              <Menu className="w-6 h-6 text-gray-400" />
            </button>
            <h2 className="text-lg font-semibold text-gray-300 hidden sm:block">
              Welcome back, {user?.displayName || user?.email?.split('@')[0]}
            </h2>
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
