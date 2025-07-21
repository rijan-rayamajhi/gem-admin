'use client';

import React, { useState } from 'react';
import { useAppSettings } from '@/lib/useAppSettings';
import DashboardLayout from '@/components/DashboardLayout';
import Notification from '@/components/Notification';

export default function AppSettingsPage() {
  const { settings, loading, error, updateSettings } = useAppSettings();
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({
    // Basic App Information
    appName: '',
    appVersion: '',
    appDescription: '',
    appTagline: '',
    
    // Legal & Compliance
    termsAndConditions: '',
    
    // Contact Information
    contactEmail: '',
    contactPhone: '',
    website: '',
    supportEmail: '',
    
    // Social Media
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      whatsapp: '',
    },
  });

  // Initialize form data when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || '',
        appVersion: settings.appVersion || '',
        appDescription: settings.appDescription || '',
        appTagline: settings.appTagline || '',
        termsAndConditions: settings.termsAndConditions || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        website: settings.website || '',
        supportEmail: settings.supportEmail || '',
        socialMedia: {
          facebook: settings.socialMedia?.facebook || '',
          twitter: settings.socialMedia?.twitter || '',
          instagram: settings.socialMedia?.instagram || '',
          linkedin: settings.socialMedia?.linkedin || '',
          youtube: settings.socialMedia?.youtube || '',
          whatsapp: settings.socialMedia?.whatsapp || '',
        },
      });
    }
  }, [settings]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof typeof prev];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value,
          },
        };
      }
      return prev;
    });
  };

  const handleDirectInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateSettings(formData);
      setNotification({
        type: 'success',
        message: 'App settings updated successfully!',
        isVisible: true,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to update app settings. Please try again.',
        isVisible: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };



  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Settings</h2>
            <p>{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">App Settings</h1>
          <p className="text-gray-600">Manage your application configuration and preferences</p>
        </div>

        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
            onClose={() => setNotification(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic App Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic App Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Name
                </label>
                <input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => handleDirectInputChange('appName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter app name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Version
                </label>
                <input
                  type="text"
                  value={formData.appVersion}
                  onChange={(e) => handleDirectInputChange('appVersion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1.0.0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Description
                </label>
                <textarea
                  value={formData.appDescription}
                  onChange={(e) => handleDirectInputChange('appDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter app description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Tagline
                </label>
                <input
                  type="text"
                  value={formData.appTagline}
                  onChange={(e) => handleDirectInputChange('appTagline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter app tagline"
                />
              </div>
            </div>
          </div>

          {/* Legal & Compliance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Legal & Compliance</h2>
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms and Conditions URL
                </label>
                <input
                  type="url"
                  value={formData.termsAndConditions}
                  onChange={(e) => handleDirectInputChange('termsAndConditions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/terms-and-conditions"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleDirectInputChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleDirectInputChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleDirectInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleDirectInputChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="support@example.com"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.socialMedia).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleInputChange('socialMedia', platform, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`https://${platform}.com/username`}
                  />
                </div>
              ))}
            </div>
          </div>





          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 