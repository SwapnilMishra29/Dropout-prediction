'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useNotification } from '@/lib/notification-context';
import { AlertCircle, Loader2, Check, Moon, Sun, Bell, Mail, Building, Shield } from 'lucide-react';

interface Settings {
  schoolName: string;
  adminEmail: string;
  riskThreshold: number;
  alertFrequency: string;
  enableNotifications: boolean;
  darkMode: boolean;
  lowRiskThreshold: number;
  mediumRiskThreshold: number;
  highRiskThreshold: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    schoolName: 'Dropout Early Warning System',
    adminEmail: 'admin@example.com',
    riskThreshold: 60,
    alertFrequency: 'daily',
    enableNotifications: true,
    darkMode: true,
    lowRiskThreshold: 40,
    mediumRiskThreshold: 60,
    highRiskThreshold: 80,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    // Simulate loading settings (you can replace with actual API call)
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Try to load from localStorage first
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        // You can also fetch from API:
        // const data = await apiClient.getSettings();
        // setSettings(data);
      } catch (err) {
        console.error('Settings fetch error:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    
    // Apply dark mode immediately
    if (field === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Save to localStorage
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      // You can also save to API:
      // await apiClient.updateSettings(settings);
      
      setSaveSuccess(true);
      showSuccess('Settings saved successfully');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Settings save error:', err);
      setError('Failed to save settings');
      showError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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
        <Header title="Settings" />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Configure your application preferences</p>
            </div>

            {/* Organization Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Organization</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    School/Institution Name
                  </label>
                  <input
                    type="text"
                    value={settings.schoolName}
                    onChange={e => handleChange('schoolName', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={e => handleChange('adminEmail', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Thresholds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Thresholds</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Low Risk Threshold (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.lowRiskThreshold}
                    onChange={e => handleChange('lowRiskThreshold', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span className="text-green-600">Current: {settings.lowRiskThreshold}%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Medium Risk Threshold (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.mediumRiskThreshold}
                    onChange={e => handleChange('mediumRiskThreshold', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span className="text-yellow-600">Current: {settings.mediumRiskThreshold}%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    High Risk Threshold (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.highRiskThreshold}
                    onChange={e => handleChange('highRiskThreshold', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span className="text-red-600">Current: {settings.highRiskThreshold}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alert Settings</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alert Frequency
                  </label>
                  <select
                    value={settings.alertFrequency}
                    onChange={e => handleChange('alertFrequency', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate - Send alerts as they occur</option>
                    <option value="daily">Daily Digest - Send once per day</option>
                    <option value="weekly">Weekly Digest - Send once per week</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={settings.enableNotifications}
                    onChange={e => handleChange('enableNotifications', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <label htmlFor="notifications" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Enable Email Notifications
                  </label>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  {settings.darkMode ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Display Settings</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="darkMode"
                    checked={settings.darkMode}
                    onChange={e => handleChange('darkMode', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <label htmlFor="darkMode" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Dark Mode
                  </label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully</p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}