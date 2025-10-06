import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Fuel, DollarSign, Award, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { apiGet } from '../utils/api';

const FleetPerformancePage = () => {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [sortBy, setSortBy] = useState('avgFuelEfficiency');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      const fleetId = localStorage.getItem('fleetId');
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const data = await apiGet('/fleet/performance', {
        fleetId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      setPerformance(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const sortedPerformance = [...performance].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const StatCard = ({ icon: IconComponent, label, value, trend, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold mt-1" style={{ color }}>{value}</h3>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              {trend > 0 ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
              <span className={trend > 0 ? 'text-green-500' : 'text-red-500'}>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <IconComponent className="w-12 h-12 opacity-20" style={{ color }} />
      </div>
    </motion.div>
  );

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div></div>;
  if (error) return <div className="p-6"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /><span>Error: {error}</span></div></div>;

  const totalVehicles = performance.length;
  const avgEfficiency = performance.reduce((sum, p) => sum + (p.avgFuelEfficiency || 0), 0) / totalVehicles || 0;
  const totalFuelSaved = performance.reduce((sum, p) => sum + (p.fuelSavedLiters || 0), 0);
  const totalSavings = performance.reduce((sum, p) => sum + (p.costSavings || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Fleet Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time vehicle performance analytics</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2">
              <option value="avgFuelEfficiency">Efficiency</option>
              <option value="totalDistance">Distance</option>
              <option value="fuelSavedLiters">Fuel Saved</option>
              <option value="safetyScore">Safety Score</option>
            </select>
          </div>
          <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            {sortOrder === 'desc' ? '↓ High to Low' : '↑ Low to High'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard icon={Award} label="Fleet Vehicles" value={totalVehicles} color="#3B82F6" />
          <StatCard icon={TrendingUp} label="Avg Efficiency" value={`${avgEfficiency.toFixed(1)}%`} trend={avgEfficiency > 75 ? 5 : -3} color="#10B981" />
          <StatCard icon={Fuel} label="Total Fuel Saved" value={`${totalFuelSaved.toFixed(0)}L`} color="#F59E0B" />
          <StatCard icon={DollarSign} label="Cost Savings" value={`₹${totalSavings.toFixed(0)}`} color="#8B5CF6" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b"><h2 className="text-xl font-bold text-gray-800">Vehicle Performance Details</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fuel Saved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedPerformance.map((vehicle, index) => (
                  <motion.tr key={vehicle._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><span className={`font-bold ${index === 0 ? 'text-green-600' : index === 1 ? 'text-blue-600' : index === 2 ? 'text-orange-600' : 'text-gray-600'}`}>#{index + 1}</span></td>
                    <td className="px-6 py-4"><div><p className="font-medium text-gray-900">{vehicle.vehicleName || 'Unknown'}</p><p className="text-sm text-gray-500">{vehicle.model}</p></div></td>
                    <td className="px-6 py-4 text-gray-700">{vehicle.totalTrips}</td>
                    <td className="px-6 py-4"><span className="font-medium">{vehicle.avgFuelEfficiency?.toFixed(1)}%</span></td>
                    <td className="px-6 py-4 text-gray-700">{vehicle.totalDistance?.toFixed(0)} km</td>
                    <td className="px-6 py-4"><span className={`font-medium ${vehicle.fuelSavedLiters > 0 ? 'text-green-600' : 'text-red-600'}`}>{vehicle.fuelSavedLiters > 0 ? '+' : ''}{vehicle.fuelSavedLiters?.toFixed(1)}L</span></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.safetyScore >= 90 ? 'bg-green-100 text-green-800' : vehicle.safetyScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{vehicle.safetyScore?.toFixed(0)}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {performance.length === 0 && !loading && (
          <div className="text-center py-12"><p className="text-gray-500 text-lg">No performance data available.</p></div>
        )}
      </div>
    </div>
  );
};

export default FleetPerformancePage;
