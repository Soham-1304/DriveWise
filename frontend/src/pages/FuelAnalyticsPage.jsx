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
      const data = await apiGet('/vehicles');
      // Backend returns { vehicles: [...] }
      const vehiclesList = data.vehicles || [];
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
      
      const data = await apiGet('/analytics/fuel-trend', { vehicleId: selectedVehicle });
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Fuel Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track fuel consumption trends and efficiency over time</p>
        </div>

        {/* Vehicle Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.name} - {v.model}</option>
              ))}
            </select>
          </div>
          <button
            onClick={downloadCSV}
            disabled={!trendData.length}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Fuel (Last Month)</p>
                <h3 className="text-3xl font-bold text-blue-600">{latestMonth?.totalFuel || 0}L</h3>
                <div className="flex items-center mt-2 text-sm">
                  {fuelChange > 0 ? <TrendingUp className="w-4 h-4 text-red-500 mr-1" /> : <TrendingDown className="w-4 h-4 text-green-500 mr-1" />}
                  <span className={fuelChange > 0 ? 'text-red-500' : 'text-green-500'}>{Math.abs(fuelChange)}%</span>
                </div>
              </div>
              <Fuel className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Efficiency</p>
                <h3 className="text-3xl font-bold text-green-600">{latestMonth?.avgEfficiency || 0}%</h3>
                <div className="flex items-center mt-2 text-sm">
                  {efficiencyChange > 0 ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
                  <span className={efficiencyChange > 0 ? 'text-green-500' : 'text-red-500'}>{Math.abs(efficiencyChange)}%</span>
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Fuel per KM</p>
                <h3 className="text-3xl font-bold text-orange-600">{latestMonth?.fuelPerKm?.toFixed(2) || 0}</h3>
                <p className="text-gray-400 text-xs mt-2">Liters per kilometer</p>
              </div>
              <BarChart3 className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Trips</p>
                <h3 className="text-3xl font-bold text-purple-600">{trendData.reduce((sum, d) => sum + (d.tripCount || 0), 0)}</h3>
                <p className="text-gray-400 text-xs mt-2">Last 6 months</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Fuel Consumption Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Fuel Consumption Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalFuel" stroke="#3B82F6" strokeWidth={2} name="Total Fuel (L)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Fuel Efficiency Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgEfficiency" fill="#10B981" name="Efficiency %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Details Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total Fuel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fuel/KM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trendData.map((month, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{month.month}</td>
                    <td className="px-6 py-4 text-gray-700">{month.totalFuel} L</td>
                    <td className="px-6 py-4 text-gray-700">{month.fuelPerKm?.toFixed(3)} L/km</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        month.avgEfficiency >= 80 ? 'bg-green-100 text-green-800' :
                        month.avgEfficiency >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {month.avgEfficiency}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{month.tripCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {trendData.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No fuel trend data available for this vehicle.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuelAnalyticsPage;
