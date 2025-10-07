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
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // No need to pass fleetId - backend gets it from req.user
      const data = await apiGet('/fleet/advanced/performance', {
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
      className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-dark-700/50 hover:border-orange-500/30 transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold mt-1" style={{ color }}>{value}</h3>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              {trend > 0 ? <TrendingUp className="w-4 h-4 text-green-400 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-400 mr-1" />}
              <span className={trend > 0 ? 'text-green-400' : 'text-red-400'}>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <IconComponent className="w-12 h-12 opacity-20" style={{ color }} />
      </div>
    </motion.div>
  );

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div></div>;
  if (error) return <div className="p-6"><div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /><span>Error: {error}</span></div></div>;

  const totalVehicles = performance.length;
  const avgEfficiency = performance.reduce((sum, p) => sum + (p.avgFuelEfficiency || 0), 0) / totalVehicles || 0;
  const totalFuelSaved = performance.reduce((sum, p) => sum + (p.fuelSavedLiters || 0), 0);
  const totalSavings = performance.reduce((sum, p) => sum + (p.costSavings || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Fleet Performance Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time vehicle performance analytics</p>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-lg shadow-lg p-4 mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-dark-700/50 border border-dark-600/50 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-400" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-dark-700/50 border border-dark-600/50 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="avgFuelEfficiency">Efficiency</option>
              <option value="totalDistance">Distance</option>
              <option value="fuelSavedLiters">Fuel Saved</option>
              <option value="safetyScore">Safety Score</option>
            </select>
          </div>
          <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="px-4 py-2 bg-dark-700/50 hover:bg-orange-500/20 border border-dark-600/50 hover:border-orange-500/30 text-gray-300 rounded-md transition">
            {sortOrder === 'desc' ? '↓ High to Low' : '↑ Low to High'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard icon={Award} label="Fleet Vehicles" value={totalVehicles} color="#3B82F6" />
          <StatCard icon={TrendingUp} label="Avg Efficiency" value={`${avgEfficiency.toFixed(1)}%`} trend={avgEfficiency > 75 ? 5 : -3} color="#10B981" />
          <StatCard icon={Fuel} label="Total Fuel Saved" value={`${totalFuelSaved.toFixed(0)}L`} color="#F59E0B" />
          <StatCard icon={DollarSign} label="Cost Savings" value={`₹${totalSavings.toFixed(0)}`} color="#8B5CF6" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-dark-900/50 border-b border-dark-700/50"><h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Vehicle Performance Details</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fuel Saved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {sortedPerformance.map((vehicle, index) => (
                  <motion.tr key={vehicle._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-dark-700/30 transition">
                    <td className="px-6 py-4"><span className={`font-bold ${index === 0 ? 'text-green-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-orange-400' : 'text-gray-400'}`}>#{index + 1}</span></td>
                    <td className="px-6 py-4"><div><p className="font-medium text-white">{vehicle.vehicleName || 'Unknown'}</p><p className="text-sm text-gray-400">{vehicle.model}</p></div></td>
                    <td className="px-6 py-4 text-gray-300">{vehicle.totalTrips}</td>
                    <td className="px-6 py-4"><span className="font-medium text-white">{vehicle.avgFuelEfficiency?.toFixed(1)}%</span></td>
                    <td className="px-6 py-4 text-gray-300">{vehicle.totalDistance?.toFixed(0)} km</td>
                    <td className="px-6 py-4"><span className={`font-medium ${vehicle.fuelSavedLiters > 0 ? 'text-green-400' : 'text-red-400'}`}>{vehicle.fuelSavedLiters > 0 ? '+' : ''}{vehicle.fuelSavedLiters?.toFixed(1)}L</span></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.safetyScore >= 90 ? 'bg-green-500/20 border border-green-500/30 text-green-400' : vehicle.safetyScore >= 70 ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>{vehicle.safetyScore?.toFixed(0)}</span></td>
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
