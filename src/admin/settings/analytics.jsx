import React, { useState, useEffect } from "react";
import { Save, Info, CheckCircle } from "lucide-react"; // Icons from lucide-react (or replace with your icon library)

export default function AnalyticsSettings() {
  // State for settings (load from localStorage on mount)
  const [settings, setSettings] = useState({
    defaultPeriod: "This Week",
    profitMargin: 30, // Percentage
    enableAlerts: true,
    alertThreshold: 20, // For low stock or sales drop
    theme: "Light",
    goalType: "Daily", // New: Daily, Monthly, Off
    goalAmount: 5000, // New: Target sales amount
    enableLowStock: true, // New: Toggle for low stock alerts
    enableSalesUp: true, // New: Toggle for sales trend alerts
    enablePeakHour: true, // New: Toggle for peak hour suggestions
    enablePendingOrders: true, // New: Toggle for pending orders alerts
    enableProfitStatus: true, // New: Toggle for profit status
  });
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("analyticsSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Handle input changes
  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Save settings
  const handleSave = () => {
    localStorage.setItem("analyticsSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000); // Hide success message after 3 seconds
  };

  // Reset settings to default
  const handleReset = () => {
    setSettings({
      defaultPeriod: "This Week",
      profitMargin: 30,
      enableAlerts: true,
      alertThreshold: 20,
      theme: "Light",
      goalType: "Daily",
      goalAmount: 5000,
      enableLowStock: true,
      enableSalesUp: true,
      enablePeakHour: true,
      enablePendingOrders: true,
      enableProfitStatus: true,
    });
    localStorage.removeItem("analyticsSettings"); // Remove from localStorage
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-8">
      <h1 className="text-2xl font-bold text-coffee-800 mb-6 flex items-center gap-2">
        <Info className="w-6 h-6" />
        Analytics Preferences
      </h1>
      <p className="text-coffee-600 mb-8">
        Customize how your analytics work. These settings help make reports easier to understand.
      </p>

      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        {/* Left Column: General Settings and Notifications */}
        <div className="flex-1 flex">
          <div className="bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col w-full">
            {/* General Settings */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-coffee-800 mb-4">General Settings</h2>
              <div className="space-y-4">
                {/* Default Period */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Default Time Period</label>
                    <p className="text-xs text-coffee-600">Choose the time range that shows first on Dashboard.</p>
                  </div>
                  <select
                    value={settings.defaultPeriod}
                    onChange={(e) => handleChange("defaultPeriod", e.target.value)}
                    className="border border-coffee-300 rounded-lg px-3 py-2 bg-white text-coffee-800"
                  >
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="This Year">This Year</option>
                  </select>
                </div>

                {/* Profit Margin */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Profit Margin (%)</label>
                    <p className="text-xs text-coffee-600">How much profit you make on sales (e.g., 30% means ₱70 profit on ₱100 sale).</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.profitMargin}
                      onChange={(e) => handleChange("profitMargin", parseInt(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-coffee-800 font-medium">{settings.profitMargin}%</span>
                  </div>
                </div>

                {/* Goal Type */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Sales Goal Type</label>
                    <p className="text-xs text-coffee-600">Set goals for daily, monthly, or turn off.</p>
                  </div>
                  <select
                    value={settings.goalType}
                    onChange={(e) => handleChange("goalType", e.target.value)}
                    className="border border-coffee-300 rounded-lg px-3 py-2 bg-white text-coffee-800"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Off">Off</option>
                  </select>
                </div>

                {/* Goal Amount */}
                {settings.goalType !== "Off" && (
                  <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg ml-4 border-l-4 border-coffee-300">
                    <div>
                      <label className="block text-sm font-medium text-coffee-700">Goal Amount (₱)</label>
                      <p className="text-xs text-coffee-600">Target sales for {settings.goalType.toLowerCase()}.</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={settings.goalAmount}
                      onChange={(e) => handleChange("goalAmount", parseInt(e.target.value) || 0)}
                      className="border border-coffee-300 rounded-lg px-3 py-2 bg-white text-coffee-800 w-24"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Notifications */}
            <section>
              <h2 className="text-lg font-semibold text-coffee-800 mb-4">Notifications</h2>
              <div className="space-y-4">
                {/* Enable Alerts */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Enable Alerts</label>
                    <p className="text-xs text-coffee-600">Get notified about low stock or big sales changes.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableAlerts}
                      onChange={(e) => handleChange("enableAlerts", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>

                {/* Alert Threshold */}
                {settings.enableAlerts && (
                  <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg ml-4 border-l-4 border-coffee-300">
                    <div>
                      <label className="block text-sm font-medium text-coffee-700">Alert Threshold (%)</label>
                      <p className="text-xs text-coffee-600">Warn me if sales drop below this level.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={settings.alertThreshold}
                        onChange={(e) => handleChange("alertThreshold", parseInt(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-coffee-800 font-medium">{settings.alertThreshold}%</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Dashboard Insights */}
        <div className="flex-1 flex">
          <div className="bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col w-full">
            {/* Dashboard Insights */}
            <section>
              <h2 className="text-lg font-semibold text-coffee-800 mb-4">Dashboard Insights</h2>
              <p className="text-xs text-coffee-600 mb-4">Control which alerts appear in the Manager's Insight section.</p>
              <div className="space-y-4">
                {/* Low Stock Alerts */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Low Stock Alerts</label>
                    <p className="text-xs text-coffee-600">Show warnings for items running low.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableLowStock}
                      onChange={(e) => handleChange("enableLowStock", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>

                {/* Sales Trend Alerts */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Sales Trend Alerts</label>
                    <p className="text-xs text-coffee-600">Show messages about sales increases.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSalesUp}
                      onChange={(e) => handleChange("enableSalesUp", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>

                {/* Peak Hour Suggestions */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Peak Hour Suggestions</label>
                    <p className="text-xs text-coffee-600">Show staffing recommendations for busy times.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enablePeakHour}
                      onChange={(e) => handleChange("enablePeakHour", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>

                {/* Pending Orders Alerts */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Pending Orders Alerts</label>
                    <p className="text-xs text-coffee-600">Show notifications for orders awaiting completion.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enablePendingOrders}
                      onChange={(e) => handleChange("enablePendingOrders", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>

                {/* Profit Status */}
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Profit Status</label>
                    <p className="text-xs text-coffee-600">Show whether the business profited, lost, or broke even.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableProfitStatus}
                      onChange={(e) => handleChange("enableProfitStatus", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-coffee-800 rounded-lg hover:bg-gray-300"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-coffee-700 text-white px-6 py-3 rounded-lg hover:bg-coffee-800 transition"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}
    </div>
  );
}