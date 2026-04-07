import { useState, useEffect } from 'react';
import { useAuthStore, User } from '../store/authStore';

interface Alert {
  _id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below' | 'crosses';
  status: 'active' | 'triggered' | 'expired' | 'cancelled';
  message?: string;
  createdAt: string;
  triggeredAt?: string;
  priceAtTrigger?: number;
}

const API_URL = 'http://localhost:5000/api';

export default function Settings() {
  const { user, accessToken, updatePreferences } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'alerts' | 'sessions'>('profile');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<User['preferences'] | null>(null);

  // New alert form
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'above' as const,
    message: '',
  });

  useEffect(() => {
    if (user) {
      setPreferences(user.preferences);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'alerts' && accessToken) {
      fetchAlerts();
    }
  }, [activeTab, accessToken]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const [activeRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/alerts/active`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_URL}/alerts/history?limit=20`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const activeData = await activeRes.json();
      const historyData = await historyRes.json();

      if (activeData.success) setAlerts(activeData.alerts);
      if (historyData.success) setAlertHistory(historyData.alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.symbol || !newAlert.targetPrice) return;

    try {
      const response = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          symbol: newAlert.symbol.toUpperCase(),
          targetPrice: parseFloat(newAlert.targetPrice),
          condition: newAlert.condition,
          message: newAlert.message || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewAlert({ symbol: '', targetPrice: '', condition: 'above', message: '' });
        fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const cancelAlert = async (alertId: string) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to cancel alert:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!preferences) return;

    const updatedPreferences = { ...preferences };
    
    if (key.startsWith('session.')) {
      const sessionKey = key.replace('session.', '') as keyof typeof preferences.tradingSessionAlerts;
      updatedPreferences.tradingSessionAlerts = {
        ...updatedPreferences.tradingSessionAlerts,
        [sessionKey]: value,
      };
    } else {
      (updatedPreferences as any)[key] = value;
    }

    setPreferences(updatedPreferences);
    await updatePreferences(updatedPreferences);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'sessions', label: 'Sessions', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-[#131722] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-6">Manage your account and alert preferences</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E222D] text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && user && (
          <div className="bg-[#1E222D] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <p className="text-white">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Member Since</label>
                <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <hr className="border-gray-700 my-6" />

            <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Enable Alerts</span>
                <input
                  type="checkbox"
                  checked={preferences?.alertsEnabled ?? true}
                  onChange={(e) => handlePreferenceChange('alertsEnabled', e.target.checked)}
                  className="w-5 h-5 rounded bg-[#131722] border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={preferences?.emailNotifications ?? true}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  className="w-5 h-5 rounded bg-[#131722] border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Create Alert Form */}
            <div className="bg-[#1E222D] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Alert</h2>
              <form onSubmit={createAlert} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Symbol</label>
                    <input
                      type="text"
                      value={newAlert.symbol}
                      onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                      placeholder="BTC-USD"
                      className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Target Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAlert.targetPrice}
                      onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                      placeholder="50000"
                      className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Condition</label>
                    <select
                      value={newAlert.condition}
                      onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as any })}
                      className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="above">Price Above</option>
                      <option value="below">Price Below</option>
                      <option value="crosses">Price Crosses</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
                    >
                      Create Alert
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Note (optional)</label>
                  <input
                    type="text"
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    placeholder="Add a note for this alert..."
                    className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </form>
            </div>

            {/* Active Alerts */}
            <div className="bg-[#1E222D] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Active Alerts ({alerts.length})</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : alerts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No active alerts</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert._id} className="flex items-center justify-between bg-[#131722] p-4 rounded-lg">
                      <div>
                        <span className="text-white font-medium">{alert.symbol}</span>
                        <span className="text-gray-400 mx-2">
                          {alert.condition === 'above' ? '≥' : alert.condition === 'below' ? '≤' : '↔'}
                        </span>
                        <span className="text-blue-400">${alert.targetPrice.toLocaleString()}</span>
                        {alert.message && (
                          <p className="text-gray-500 text-sm mt-1">{alert.message}</p>
                        )}
                      </div>
                      <button
                        onClick={() => cancelAlert(alert._id)}
                        className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alert History */}
            <div className="bg-[#1E222D] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Alert History</h2>
              {alertHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No alert history</p>
              ) : (
                <div className="space-y-3">
                  {alertHistory.map((alert) => (
                    <div key={alert._id} className="flex items-center justify-between bg-[#131722] p-4 rounded-lg">
                      <div>
                        <span className="text-white font-medium">{alert.symbol}</span>
                        <span className="text-gray-400 mx-2">
                          {alert.condition === 'above' ? '≥' : alert.condition === 'below' ? '≤' : '↔'}
                        </span>
                        <span className="text-gray-400">${alert.targetPrice.toLocaleString()}</span>
                        <span className={`ml-3 text-xs px-2 py-1 rounded ${
                          alert.status === 'triggered' ? 'bg-green-500/20 text-green-400' :
                          alert.status === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {alert.status}
                        </span>
                        {alert.triggeredAt && (
                          <span className="text-gray-500 text-xs ml-2">
                            @ ${alert.priceAtTrigger?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAlert(alert._id)}
                        className="px-2 py-1 text-gray-500 hover:text-gray-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && preferences && (
          <div className="bg-[#1E222D] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Trading Session Notifications</h2>
            <p className="text-gray-400 text-sm mb-6">
              Receive email notifications when major trading sessions open or close.
            </p>

            <div className="space-y-4">
              {[
                { key: 'tokyo', name: '🇯🇵 Tokyo', time: '05:30 - 14:30 IST' },
                { key: 'sydney', name: '🇦🇺 Sydney', time: '03:30 - 12:30 IST' },
                { key: 'london', name: '🇬🇧 London', time: '13:30 - 22:30 IST' },
                { key: 'newYork', name: '🇺🇸 New York', time: '18:30 - 03:30 IST' },
              ].map((session) => (
                <label key={session.key} className="flex items-center justify-between bg-[#131722] p-4 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{session.name}</span>
                    <span className="text-gray-500 text-sm ml-3">{session.time}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(preferences.tradingSessionAlerts as any)[session.key] ?? false}
                    onChange={(e) => handlePreferenceChange(`session.${session.key}`, e.target.checked)}
                    className="w-5 h-5 rounded bg-[#131722] border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
              <p className="text-blue-400 text-sm">
                💡 Enable "Email Notifications" in the Profile tab to receive session alerts via email.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
