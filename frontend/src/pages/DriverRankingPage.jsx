import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Shield, Zap, Award, Medal, AlertCircle } from 'lucide-react';
import { apiGet } from '../utils/api';

const DriverRankingPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDriverRanking = useCallback(async () => {
    try {
      setLoading(true);
      const fleetId = localStorage.getItem('fleetId');
      
      const data = await apiGet('/fleet/drivers/ranking', { fleetId });
      setDrivers(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverRanking();
  }, [fetchDriverRanking]);

  const getRankBadge = (rank) => {
    if (rank === 0) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50', label: '🥇 Champion' };
    if (rank === 1) return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50', label: '🥈 Runner-up' };
    if (rank === 2) return { icon: Medal, color: 'text-orange-500', bg: 'bg-orange-50', label: '🥉 3rd Place' };
    return { icon: Award, color: 'text-blue-500', bg: 'bg-blue-50', label: `#${rank + 1}` };
  };

  const getEfficiencyBadge = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 75) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 60) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div></div>;
  if (error) return <div className="p-6"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center"><AlertCircle className="w-5 h-5 mr-2" /><span>Error: {error}</span></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Driver Leaderboard 🏆</h1>
          <p className="text-gray-600">Top performing drivers based on fuel efficiency and safety</p>
        </div>

        {/* Podium - Top 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {drivers.slice(0, 3).map((driver, index) => {
            const badge = getRankBadge(index);
            const BadgeIcon = badge.icon;
            return (
              <motion.div
                key={driver._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`${badge.bg} rounded-xl shadow-lg p-6 border-2 ${index === 0 ? 'border-yellow-300 md:col-span-1 md:order-2' : index === 1 ? 'border-gray-300 md:order-1' : 'border-orange-300 md:order-3'}`}
              >
                <div className="text-center">
                  <BadgeIcon className={`w-16 h-16 mx-auto mb-3 ${badge.color}`} />
                  <h3 className="text-2xl font-bold text-gray-800">{badge.label}</h3>
                  <p className="text-xl font-semibold text-gray-700 mt-2">{driver.name}</p>
                  <p className="text-sm text-gray-500">{driver.email}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Efficiency</p>
                      <p className="text-2xl font-bold text-green-600">{driver.avgEfficiency?.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Safety</p>
                      <p className="text-2xl font-bold text-blue-600">{driver.safetyScore?.toFixed(0)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">{driver.totalTrips} trips completed</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Ranking Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
            <h2 className="text-2xl font-bold text-white">Complete Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Safety Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Avg Speed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drivers.map((driver, index) => {
                  const badge = getRankBadge(index);
                  const effBadge = getEfficiencyBadge(driver.avgEfficiency);
                  const BadgeIcon = badge.icon;
                  
                  return (
                    <motion.tr
                      key={driver._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 ${index < 3 ? badge.bg : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                          <span className={`font-bold ${badge.color}`}>#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{driver.name}</p>
                          <p className="text-sm text-gray-500">{driver.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{driver.totalTrips}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-green-600">{driver.avgEfficiency?.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">{driver.safetyScore?.toFixed(0)}/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span>{driver.avgSpeed?.toFixed(0)} km/h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${effBadge.color}`}>
                          {effBadge.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {drivers.length === 0 && !loading && (
          <div className="text-center py-12"><p className="text-gray-500 text-lg">No driver data available.</p></div>
        )}
      </div>
    </div>
  );
};

export default DriverRankingPage;
