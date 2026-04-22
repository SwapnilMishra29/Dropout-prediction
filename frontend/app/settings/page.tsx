'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useNotification } from '@/lib/notification-context';
import {
  AlertCircle,
  Loader2,
  Check,
  Moon,
  Sun,
  Bell,
  Mail,
  Building,
  Shield,
} from 'lucide-react';

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
    darkMode: false, // ✅ default false (prevents flash)
    lowRiskThreshold: 40,
    mediumRiskThreshold: 60,
    highRiskThreshold: 80,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  // ✅ Load settings
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Settings load error:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Sync dark mode with DOM (single source of truth)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      localStorage.setItem('app_settings', JSON.stringify(settings));

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
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure your application preferences
              </p>
            </div>

            {/* Organization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
                <Building className="w-5 h-5" />
                <h2 className="font-semibold">Organization</h2>
              </div>

              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) =>
                    handleChange('schoolName', e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />

                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) =>
                    handleChange('adminEmail', e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Dark Mode */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon /> : <Sun />}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) =>
                      handleChange('darkMode', e.target.checked)
                    }
                  />
                  Dark Mode
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-500 flex gap-2">
                <AlertCircle /> {error}
              </div>
            )}

            {/* Success */}
            {saveSuccess && (
              <div className="text-green-500 flex gap-2">
                <Check /> Saved successfully
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-500 text-white px-6 py-2 rounded"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}