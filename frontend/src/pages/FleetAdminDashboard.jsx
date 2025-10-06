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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${color}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <p className="text-center text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mx-auto block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
          <h1 className="text-3xl font-bold text-gray-900">⛽ Fleet Fuel Analytics</h1>
          <p className="text-gray-600 mt-1">Monitor fuel efficiency and cost savings across your fleet</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/vehicles')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
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
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={DollarSign}
          label="Cost Savings"
          value={`$${overview.costSavings.toFixed(0)}`}
          subtitle="Based on fuel saved"
          color="text-emerald-600"
          bgColor="bg-emerald-100"
        />
        <StatCard
          icon={Award}
          label="Fleet Efficiency"
          value={`${overview.avgEfficiency}/100`}
          subtitle={`${overview.totalTrips} trips completed`}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Distance"
          value={`${overview.totalDistance.toFixed(0)} km`}
          subtitle={`${overview.activeVehicles} active vehicles`}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Efficiency Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{efficiencyDistribution.excellent}</p>
              <p className="text-xs text-gray-600">Excellent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{efficiencyDistribution.good}</p>
              <p className="text-xs text-gray-600">Good</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{efficiencyDistribution.poor}</p>
              <p className="text-xs text-gray-600">Needs Work</p>
            </div>
          </div>
        </div>

        {/* Top Drivers Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-gray-600" />
            Top 5 Drivers by Efficiency
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="efficiency" fill="#6366f1" name="Efficiency Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      {monthlyTrends && monthlyTrends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            6-Month Fuel Savings Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="fuelSaved" stroke="#10b981" strokeWidth={2} name="Fuel Saved (L)" />
              <Line yAxisId="right" type="monotone" dataKey="avgEfficiency" stroke="#6366f1" strokeWidth={2} name="Avg Efficiency" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Drivers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Top Performing Drivers
          </h3>
          <button 
            onClick={() => navigate('/admin/drivers')}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All →
          </button>
        </div>
        {topDrivers && topDrivers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Rank</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Driver</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Trips</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Efficiency</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Distance</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Fuel Saved</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.map((driver, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-900">{driver.name}</p>
                      <p className="text-xs text-gray-500">{driver.email}</p>
                    </td>
                    <td className="py-4 text-gray-900 font-medium">{driver.trips}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          driver.avgEfficiency >= 80 ? 'bg-green-100 text-green-700' :
                          driver.avgEfficiency >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {driver.avgEfficiency}/100
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-900">{driver.totalDistance} km</td>
                    <td className="py-4 font-bold text-green-600">{driver.totalFuelSaved} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No driver data available yet</p>
          </div>
        )}
      </div>

      {/* Fleet Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <Car className="w-8 h-8 text-blue-600 mb-3" />
          <p className="text-sm text-gray-600 mb-1">Fleet Size</p>
          <p className="text-3xl font-bold text-gray-900">{overview.totalVehicles}</p>
          <p className="text-xs text-gray-600 mt-2">{overview.activeVehicles} active vehicles</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <Users className="w-8 h-8 text-green-600 mb-3" />
          <p className="text-sm text-gray-600 mb-1">Active Drivers</p>
          <p className="text-3xl font-bold text-gray-900">{overview.totalDrivers}</p>
          <p className="text-xs text-gray-600 mt-2">Across all vehicles</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
          <p className="text-sm text-gray-600 mb-1">Total Trips</p>
          <p className="text-3xl font-bold text-gray-900">{overview.totalTrips}</p>
          <p className="text-xs text-gray-600 mt-2">{overview.totalDistance.toFixed(0)} km driven</p>
        </div>
      </div>
    </div>
  )
}
