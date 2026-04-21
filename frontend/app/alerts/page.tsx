'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import RiskBadge from '@/components/RiskBadge';
import { alertAPI } from '@/lib/api-client';
import { useNotification } from '@/lib/notification-context';
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw } from 'lucide-react';

interface Alert {
  _id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  is_resolved: boolean;
  student_id?: {
    name: string;
    student_id: string;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertAPI.getAll({ limit: 100 });
      const alertsData = response.data?.data || [];
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      showError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alertAPI.resolve(id);
      showSuccess('Alert resolved');
      fetchAlerts();
    } catch (error) {
      showError('Failed to resolve alert');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return !alert.is_resolved;
    if (filter === 'resolved') return alert.is_resolved;
    return true;
  });

  const activeCount = alerts.filter(a => !a.is_resolved).length;
  const resolvedCount = alerts.filter(a => a.is_resolved).length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 lg:ml-64">
        <Header title="Alerts & Notifications" />

        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{activeCount}</p>
                </div>
                <Clock className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            {['all', 'active', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'active' && activeCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {activeCount}
                  </span>
                )}
              </button>
            ))}
            
            <button
              onClick={fetchAlerts}
              className="ml-auto px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No alerts found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All clear! No active alerts at the moment.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 ${
                    !alert.is_resolved ? 'border-l-4 border-l-red-500' : 'opacity-75'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {alert.alert_type || 'Alert'}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          alert.severity === 'HIGH' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {alert.severity || 'MEDIUM'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {!alert.is_resolved && (
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}