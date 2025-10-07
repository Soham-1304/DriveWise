import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { apiGet } from '../utils/api';

const AnomalyAlertsPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnomalies = useCallback(async () => {
    try {
      setLoading(true);
      
      const data = await apiGet('/analytics/anomalies');
      setAnomalies(data.data || []);
      setStatistics(data.statistics || {});
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const getSeverityInfo = (severity) => {
    switch (severity) {
      case 'critical':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300', label: 'Critical' };
      case 'major':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300', label: 'Major' };
      case 'minor':
        return { icon: Info, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', label: 'Minor' };
      default:
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300', label: 'Info' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const majorCount = anomalies.filter(a => a.severity === 'major').length;
  const minorCount = anomalies.filter(a => a.severity === 'minor').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Anomaly Detection Dashboard</h1>
          <p className="text-gray-400 mt-1">Statistical outliers and unusual fuel consumption patterns (3σ detection)</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border-l-4 border-red-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Critical Anomalies</p>
                <h3 className="text-3xl font-bold text-red-400">{criticalCount}</h3>
                <p className="text-xs text-gray-500 mt-1">Immediate attention required</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-400 opacity-20" />
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border-l-4 border-orange-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Major Anomalies</p>
                <h3 className="text-3xl font-bold text-orange-400">{majorCount}</h3>
                <p className="text-xs text-gray-500 mt-1">Review recommended</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-400 opacity-20" />
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border-l-4 border-yellow-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Minor Anomalies</p>
                <h3 className="text-3xl font-bold text-yellow-400">{minorCount}</h3>
                <p className="text-xs text-gray-500 mt-1">For monitoring</p>
              </div>
              <Info className="w-12 h-12 text-yellow-400 opacity-20" />
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-xl rounded-lg shadow-lg border-l-4 border-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Anomalies</p>
                <h3 className="text-3xl font-bold text-blue-400">{anomalies.length}</h3>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 backdrop-blur-xl rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-300">How Anomaly Detection Works</h3>
              <p className="text-sm text-gray-300 mt-1">
                We use the <strong>3-Sigma Rule</strong> (three standard deviations) to detect unusual fuel consumption patterns. 
                A Z-score above 3 indicates a critical anomaly, while 2-3 is major. This helps identify vehicle issues, driver behavior problems, 
                or route inefficiencies.
              </p>
            </div>
          </div>
        </div>

        {/* Anomalies List */}
        <div className="space-y-4">
          {anomalies.map((anomaly, index) => {
            const severityInfo = getSeverityInfo(anomaly.severity);
            const SeverityIcon = severityInfo.icon;
            const isLowEfficiency = anomaly.efficiencyScore < anomaly.mean;

            return (
              <div
                key={anomaly._id || index}
                className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-lg p-6 shadow-lg hover:shadow-xl hover:border-orange-500/30 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <SeverityIcon className={`w-8 h-8 ${severityInfo.color} mt-1`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-bold ${severityInfo.color}`}>{severityInfo.label} Anomaly</h3>
                        <span className="text-xs bg-dark-700/50 border border-dark-600/50 px-2 py-1 rounded-full text-gray-300">
                          Z-Score: {anomaly.zScore}σ
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-400 uppercase">Trip ID</p>
                          <p className="font-mono text-sm text-gray-200">{anomaly.tripId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase">Vehicle ID</p>
                          <p className="font-mono text-sm text-gray-200">{anomaly.vehicleId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase">Detected</p>
                          <p className="text-sm text-gray-200">{new Date(anomaly.createdAt).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-dark-700/30 border border-dark-600/50 rounded-md p-3">
                          <p className="text-xs text-gray-400">Actual Efficiency</p>
                          <div className="flex items-center gap-2 mt-1">
                            {isLowEfficiency ? (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            )}
                            <span className={`text-xl font-bold ${isLowEfficiency ? 'text-red-400' : 'text-green-400'}`}>
                              {anomaly.efficiencyScore}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-dark-700/30 border border-dark-600/50 rounded-md p-3">
                          <p className="text-xs text-gray-400">Expected Mean</p>
                          <p className="text-xl font-bold text-blue-400">
                            {statistics?.avgEfficiency ? `${statistics.avgEfficiency}%` : 'N/A'}
                          </p>
                        </div>

                        <div className="bg-dark-700/30 border border-dark-600/50 rounded-md p-3">
                          <p className="text-xs text-gray-400">Std Deviation</p>
                          <p className="text-xl font-bold text-gray-300">
                            {statistics?.stdDev ? `${statistics.stdDev}%` : 'N/A'}
                          </p>
                        </div>

                        <div className="bg-dark-700/30 border border-dark-600/50 rounded-md p-3">
                          <p className="text-xs text-gray-400">Deviation</p>
                          <p className={`text-xl font-bold ${Math.abs(anomaly.efficiencyScore - (statistics?.avgEfficiency || 0)) > 15 ? 'text-red-400' : 'text-orange-400'}`}>
                            {statistics?.avgEfficiency ? `${(anomaly.efficiencyScore - statistics.avgEfficiency).toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-dark-700/30 border border-dark-600/50 rounded-md">
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Possible Causes</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {isLowEfficiency ? (
                            <>
                              <li>• Aggressive driving behavior (harsh acceleration/braking)</li>
                              <li>• Vehicle mechanical issues requiring inspection</li>
                              <li>• Suboptimal route selection</li>
                              <li>• Heavy traffic conditions</li>
                            </>
                          ) : (
                            <>
                              <li>• Exceptional fuel-efficient driving</li>
                              <li>• Optimal route conditions</li>
                              <li>• Downhill terrain or favorable weather</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {anomalies.length === 0 && !loading && (
          <div className="bg-green-500/10 border border-green-500/30 backdrop-blur-xl rounded-lg p-12 text-center">
            <div className="text-green-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-300 mb-2">No Anomalies Detected</h3>
            <p className="text-green-400">All vehicles are operating within normal parameters. Great job!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAlertsPage;
