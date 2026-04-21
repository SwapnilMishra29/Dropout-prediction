'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { apiClient } from '@/lib/api-client';
import { AlertCircle, Loader2, Check } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    schoolName: '',
    adminEmail: '',
    riskThreshold: 60,
    alertFrequency: 'daily',
    enableNotifications: true,
    darkMode: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('[v0] Settings fetch error:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[v0] Settings save error:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Settings" />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Settings" />
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
            <div className="space-y-6">
              {/* Organization Settings */}
              <div className="bg-card rounded-lg shadow border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Organization</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={settings.schoolName}
                      onChange={e => handleChange('schoolName', e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={e => handleChange('adminEmail', e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Alert Settings */}
              <div className="bg-card rounded-lg shadow border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Alert Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Risk Threshold (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.riskThreshold}
                      onChange={e => handleChange('riskThreshold', parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-md bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Students with risk scores above this threshold will be flagged as high-risk
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Alert Frequency
                    </label>
                    <select
                      value={settings.alertFrequency}
                      onChange={e => handleChange('alertFrequency', e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={settings.enableNotifications}
                      onChange={e => handleChange('enableNotifications', e.target.checked)}
                      className="w-4 h-4 rounded border-border cursor-pointer"
                    />
                    <label htmlFor="notifications" className="text-sm font-medium text-foreground cursor-pointer">
                      Enable Email Notifications
                    </label>
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="bg-card rounded-lg shadow border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Display</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="darkMode"
                      checked={settings.darkMode}
                      onChange={e => handleChange('darkMode', e.target.checked)}
                      className="w-4 h-4 rounded border-border cursor-pointer"
                    />
                    <label htmlFor="darkMode" className="text-sm font-medium text-foreground cursor-pointer">
                      Dark Mode
                    </label>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {saveSuccess && (
                <div className="bg-green-50 border border-green-500 rounded-lg p-4 flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">Settings saved successfully</p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
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
        </div>
      </div>
    </div>
  );
}
