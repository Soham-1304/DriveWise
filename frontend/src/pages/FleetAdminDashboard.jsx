import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../utils/api'
import { 
  Car, 
  Users, 
  TrendingUp, 
  Fuel,
  Award,
  AlertCircle,
  DollarSign,
  BarChart3,
  TrendingDown,
  Sparkles
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export default function FleetAdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAnalytics = async () => {
    try {
      if (!user) return
      
      const response = await apiGet('/fleet/analytics/overview')
      
      setAnalytics(response)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
      setLoading(false)
    }
  }

  const StatCard = ({ icon, label, value, subtitle, color, bgColor, trend }) => {
    const IconComponent = icon
    return (
      <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6 hover:shadow-orange-500/20 hover:border-orange-500/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${bgColor} rounded-lg flex items-center justify-center shadow-lg`}>
            <IconComponent className={`w-6 h-6 ${color}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-center text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mx-auto block px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/50"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    )
  }

  const { overview, efficiencyDistribution, topDrivers, monthlyTrends } = analytics

  // Prepare chart data
  const efficiencyPieData = [
    { name: 'Excellent (80+)', value: efficiencyDistribution.excellent, color: '#10b981' },
    { name: 'Good (60-79)', value: efficiencyDistribution.good, color: '#f59e0b' },
    { name: 'Poor (<60)', value: efficiencyDistribution.poor, color: '#ef4444' }
  ]

  const driverBarData = topDrivers.map(d => ({
    name: d.name.split(' ')[0] || d.email.split('@')[0],
    efficiency: d.avgEfficiency,
    fuelSaved: d.totalFuelSaved
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">⛽ Fleet Fuel Analytics</h1>
          <p className="text-gray-400 mt-1">Monitor fuel efficiency and cost savings across your fleet</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/vehicles')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/50"
          >
            Manage Fleet
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Fuel}
          label="Total Fuel Saved"
          value={`${overview.totalFuelSaved.toFixed(1)} L`}
          subtitle={`${overview.totalFuelUsed.toFixed(1)} L consumed`}
          color="text-green-400"
          bgColor="from-green-500/20 to-green-600/20"
        />
        <StatCard
          icon={DollarSign}
          label="Cost Savings"
          value={`$${overview.costSavings.toFixed(0)}`}
          subtitle="Based on fuel saved"
          color="text-emerald-400"
          bgColor="from-emerald-500/20 to-emerald-600/20"
        />
        <StatCard
          icon={Award}
          label="Fleet Efficiency"
          value={`${overview.avgEfficiency}/100`}
          subtitle={`${overview.totalTrips} trips completed`}
          color="text-orange-400"
          bgColor="from-orange-500/20 to-orange-600/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Distance"
          value={`${overview.totalDistance.toFixed(0)} km`}
          subtitle={`${overview.activeVehicles} active vehicles`}
          color="text-blue-400"
          bgColor="from-blue-500/20 to-blue-600/20"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Efficiency Distribution Pie Chart */}
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
          <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Trip Efficiency Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={efficiencyPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {efficiencyPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{efficiencyDistribution.excellent}</p>
              <p className="text-xs text-gray-400">Excellent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{efficiencyDistribution.good}</p>
              <p className="text-xs text-gray-400">Good</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{efficiencyDistribution.poor}</p>
              <p className="text-xs text-gray-400">Needs Work</p>
            </div>
          </div>
        </div>

        {/* Top Drivers Bar Chart */}
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
          <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            Top 5 Drivers by Efficiency
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="efficiency" fill="url(#orangeGradient)" name="Efficiency Score" />
              <defs>
                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      {monthlyTrends && monthlyTrends.length > 0 && (
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
          <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            6-Month Fuel Savings Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Line yAxisId="left" type="monotone" dataKey="fuelSaved" stroke="#10b981" strokeWidth={3} name="Fuel Saved (L)" dot={{ fill: '#10b981', r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="avgEfficiency" stroke="#f97316" strokeWidth={3} name="Avg Efficiency" dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Drivers Table */}
      <div className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Top Performing Drivers
          </h3>
          <button 
            onClick={() => navigate('/admin/drivers')}
            className="text-sm text-orange-400 hover:text-orange-300 font-semibold transition-colors"
          >
            View All →
          </button>
        </div>
        {topDrivers && topDrivers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700 text-left">
                  <th className="pb-3 text-sm font-semibold text-gray-400">Rank</th>
                  <th className="pb-3 text-sm font-semibold text-gray-400">Driver</th>
                  <th className="pb-3 text-sm font-semibold text-gray-400">Trips</th>
                  <th className="pb-3 text-sm font-semibold text-gray-400">Efficiency</th>
                  <th className="pb-3 text-sm font-semibold text-gray-400">Distance</th>
                  <th className="pb-3 text-sm font-semibold text-gray-400">Fuel Saved</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.map((driver, index) => (
                  <tr key={index} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition">
                    <td className="py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                        index === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-700' : 'bg-gradient-to-br from-gray-600 to-gray-800'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-white">{driver.name}</p>
                      <p className="text-xs text-gray-400">{driver.email}</p>
                    </td>
                    <td className="py-4 text-gray-300 font-medium">{driver.trips}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          driver.avgEfficiency >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          driver.avgEfficiency >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {driver.avgEfficiency}/100
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">{driver.totalDistance} km</td>
                    <td className="py-4 font-bold text-green-400">{driver.totalFuelSaved} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No driver data available yet</p>
          </div>
        )}
      </div>

      {/* Fleet Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 shadow-lg">
          <Car className="w-8 h-8 text-blue-400 mb-3" />
          <p className="text-sm text-gray-400 mb-1">Fleet Size</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{overview.totalVehicles}</p>
          <p className="text-xs text-gray-500 mt-2">{overview.activeVehicles} active vehicles</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 shadow-lg">
          <Users className="w-8 h-8 text-green-400 mb-3" />
          <p className="text-sm text-gray-400 mb-1">Active Drivers</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{overview.totalDrivers}</p>
          <p className="text-xs text-gray-500 mt-2">Across all vehicles</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 backdrop-blur-xl border border-orange-500/30 rounded-xl p-6 shadow-lg">
          <TrendingUp className="w-8 h-8 text-orange-400 mb-3" />
          <p className="text-sm text-gray-400 mb-1">Total Trips</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">{overview.totalTrips}</p>
          <p className="text-xs text-gray-500 mt-2">{overview.totalDistance.toFixed(0)} km driven</p>
        </div>
      </div>
    </div>
  )
}
