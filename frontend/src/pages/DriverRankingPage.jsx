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
      
      const data = await apiGet('/fleet/advanced/drivers/ranking');
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

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div></div>;
  if (error) return <div className="p-6"><div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded flex items-center"><AlertCircle className="w-5 h-5 mr-2" /><span>Error: {error}</span></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">Driver Leaderboard 🏆</h1>
          <p className="text-gray-400">Top performing drivers based on fuel efficiency and safety</p>
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
                className={`bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg p-6 border-2 ${
                  index === 0 ? 'border-yellow-500/50 md:col-span-1 md:order-2 shadow-yellow-500/20' : 
                  index === 1 ? 'border-gray-400/50 md:order-1 shadow-gray-400/20' : 
                  'border-orange-500/50 md:order-3 shadow-orange-500/20'
                }`}
              >
                <div className="text-center">
                  <BadgeIcon className={`w-16 h-16 mx-auto mb-3 ${badge.color}`} />
                  <h3 className="text-2xl font-bold text-white">{badge.label}</h3>
                  <p className="text-xl font-semibold text-gray-200 mt-2">{driver.name}</p>
                  <p className="text-sm text-gray-400">{driver.email}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-dark-700/50 rounded-lg p-3 border border-dark-600/50">
                      <p className="text-xs text-gray-400">Efficiency</p>
                      <p className="text-2xl font-bold text-green-400">{driver.avgEfficiency?.toFixed(1)}%</p>
                    </div>
                    <div className="bg-dark-700/50 rounded-lg p-3 border border-dark-600/50">
                      <p className="text-xs text-gray-400">Safety</p>
                      <p className="text-2xl font-bold text-blue-400">{driver.safetyScore?.toFixed(0)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-300">{driver.totalTrips} trips completed</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Ranking Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-dark-700/50 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-b border-orange-500/30">
            <h2 className="text-2xl font-bold text-orange-400">Complete Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Safety Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Avg Speed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
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
                      className="hover:bg-dark-700/30 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                          <span className={`font-bold ${badge.color}`}>#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{driver.name}</p>
                          <p className="text-sm text-gray-400">{driver.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{driver.totalTrips}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="font-bold text-green-400">{driver.avgEfficiency?.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span className="font-semibold text-white">{driver.safetyScore?.toFixed(0)}/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">{driver.avgSpeed?.toFixed(0)} km/h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          driver.avgEfficiency >= 90 ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                          driver.avgEfficiency >= 75 ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' :
                          driver.avgEfficiency >= 60 ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' :
                          'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}>
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
