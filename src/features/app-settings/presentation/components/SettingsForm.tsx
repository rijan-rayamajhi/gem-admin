'use client';

import { useSettings } from '../providers/SettingsProvider';

export default function SettingsForm() {
  const {
    settings,
    loading,
    saving,
    error,
    saveSettings,
    resetSettings,
    updateSettings
  } = useSettings();

  const handleInputChange = (field: keyof typeof settings, value: string) => {
    updateSettings({ [field]: value });
  };

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      // Show success message
      alert('Settings saved successfully!');
    } catch {
      // Error is handled by the provider and displayed below
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      try {
        await resetSettings();
        alert('Settings reset successfully!');
      } catch {
        // Error is handled by the provider
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-card-foreground mb-2">Application Settings</h2>
        <p className="text-muted-foreground">Configure your application settings and preferences</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* App Name */}
          <div className="md:col-span-2">
            <label htmlFor="appName" className="block text-sm font-medium text-card-foreground mb-2">
              App Name *
            </label>
            <input
              type="text"
              id="appName"
              value={settings.appName}
              onChange={(e) => handleInputChange('appName', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your app name"
            />
          </div>

          {/* App Tagline */}
          <div className="md:col-span-2">
            <label htmlFor="appTagline" className="block text-sm font-medium text-card-foreground mb-2">
              App Tagline
            </label>
            <input
              type="text"
              id="appTagline"
              value={settings.appTagline}
              onChange={(e) => handleInputChange('appTagline', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your app tagline"
            />
          </div>

          {/* Terms and Condition Link */}
          <div className="md:col-span-2">
            <label htmlFor="termsLink" className="block text-sm font-medium text-card-foreground mb-2">
              Terms and Condition Link
            </label>
            <input
              type="url"
              id="termsLink"
              value={settings.termsAndConditionLink}
              onChange={(e) => handleInputChange('termsAndConditionLink', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://example.com/terms"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="contact@example.com"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-card-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={settings.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+1234567890"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-card-foreground mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsappNumber"
              value={settings.whatsappNumber}
              onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+1234567890"
            />
          </div>

          {/* App Version */}
          <div>
            <label htmlFor="appVersion" className="block text-sm font-medium text-card-foreground mb-2">
              App Version
            </label>
            <input
              type="text"
              id="appVersion"
              value={settings.appVersion}
              onChange={(e) => handleInputChange('appVersion', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="1.0.0"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 border border-border text-card-foreground rounded-lg hover:bg-muted transition-colors"
            disabled={saving}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
