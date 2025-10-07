import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Fuel, Calendar, BarChart3, Download } from 'lucide-react';
import { apiGet } from '../utils/api';

const FuelAnalyticsPage = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [vehicles, setVehicles] = useState([]);

    const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet('/fleet/');
      // Backend returns array of vehicles directly
      const vehiclesList = Array.isArray(data) ? data : [];
      setVehicles(vehiclesList);
      if (vehiclesList.length > 0) {
        setSelectedVehicle(vehiclesList[0]._id);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFuelTrend = useCallback(async () => {
    if (!selectedVehicle) return;
    
    try {
      setLoading(true);
      
      const data = await apiGet('/fleet/advanced/fuel-trend', { vehicleId: selectedVehicle });
      setTrendData(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      fetchFuelTrend();
    }
  }, [fetchFuelTrend, selectedVehicle]);

  const downloadCSV = () => {
    const csvContent = [
      ['Month', 'Total Fuel (L)', 'Fuel per KM', 'Efficiency %', 'Trips'],
      ...trendData.map(d => [d.month, d.totalFuel, d.fuelPerKm, d.avgEfficiency, d.tripCount])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-trend-${selectedVehicle}.csv`;
    a.click();
  };

  if (loading && !trendData.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  const latestMonth = trendData[trendData.length - 1];
  const previousMonth = trendData[trendData.length - 2];
  const fuelChange = latestMonth && previousMonth 
    ? ((latestMonth.totalFuel - previousMonth.totalFuel) / previousMonth.totalFuel * 100).toFixed(1) 
    : 0;
  const efficiencyChange = latestMonth && previousMonth
    ? ((latestMonth.avgEfficiency - previousMonth.avgEfficiency)).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Fuel Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Track fuel consumption trends and efficiency over time</p>
        </div>

        {/* Vehicle Selector */}
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-dark-700/50 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-400" />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="bg-dark-700 border border-dark-600 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.name} - {v.model}</option>
              ))}
            </select>
          </div>
          <button
            onClick={downloadCSV}
            disabled={!trendData.length}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 shadow-lg shadow-orange-500/30"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 backdrop-blur-xl border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border-l-4 border-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Fuel (Last Month)</p>
                <h3 className="text-3xl font-bold text-blue-400">{latestMonth?.totalFuel || 0}L</h3>
                <div className="flex items-center mt-2 text-sm">
                  {fuelChange > 0 ? <TrendingUp className="w-4 h-4 text-red-400 mr-1" /> : <TrendingDown className="w-4 h-4 text-green-400 mr-1" />}
                  <span className={fuelChange > 0 ? 'text-red-400' : 'text-green-400'}>{Math.abs(fuelChange)}%</span>
                </div>
              </div>
              <Fuel className="w-12 h-12 text-blue-400 opacity-20" />
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border-l-4 border-green-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Efficiency</p>
                <h3 className="text-3xl font-bold text-green-400">{latestMonth?.avgEfficiency || 0}%</h3>
                <div className="flex items-center mt-2 text-sm">
                  {efficiencyChange > 0 ? <TrendingUp className="w-4 h-4 text-green-400 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-400 mr-1" />}
                  <span className={efficiencyChange > 0 ? 'text-green-400' : 'text-red-400'}>{Math.abs(efficiencyChange)}%</span>
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-green-400 opacity-20" />
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border-l-4 border-orange-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Fuel per KM</p>
                <h3 className="text-3xl font-bold text-orange-400">{latestMonth?.fuelPerKm?.toFixed(2) || 0}</h3>
                <p className="text-gray-500 text-xs mt-2">Liters per kilometer</p>
              </div>
              <BarChart3 className="w-12 h-12 text-orange-400 opacity-20" />
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border-l-4 border-purple-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trips</p>
                <h3 className="text-3xl font-bold text-purple-400">{trendData.reduce((sum, d) => sum + (d.tripCount || 0), 0)}</h3>
                <p className="text-gray-500 text-xs mt-2">Last 6 months</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Fuel Consumption Chart */}
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-dark-700/50 p-6 mb-6">
          <h2 className="text-xl font-bold text-orange-400 mb-4">Fuel Consumption Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Line type="monotone" dataKey="totalFuel" stroke="#f97316" strokeWidth={3} name="Total Fuel (L)" dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Chart */}
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-dark-700/50 p-6 mb-6">
          <h2 className="text-xl font-bold text-orange-400 mb-4">Fuel Efficiency Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="avgEfficiency" fill="url(#efficiencyGradient)" name="Efficiency %" />
              <defs>
                <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Details Table */}
        <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-dark-700/50 overflow-hidden">
          <div className="px-6 py-4 bg-dark-700/50 border-b border-dark-600">
            <h2 className="text-xl font-bold text-orange-400">Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total Fuel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fuel/KM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Trips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {trendData.map((month, index) => (
                  <tr key={index} className="hover:bg-dark-700/30 transition">
                    <td className="px-6 py-4 font-medium text-white">{month.month}</td>
                    <td className="px-6 py-4 text-gray-300">{month.totalFuel} L</td>
                    <td className="px-6 py-4 text-gray-300">{month.fuelPerKm?.toFixed(3)} L/km</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        month.avgEfficiency >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        month.avgEfficiency >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {month.avgEfficiency}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{month.tripCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {trendData.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No fuel trend data available for this vehicle.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuelAnalyticsPage;
