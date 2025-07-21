'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { dailyRewardService, DailyRewardConfig } from '@/lib/dailyRewardService';
import Notification from '@/components/Notification';

export default function DailyRewardsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<DailyRewardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const configData = await dailyRewardService.getDailyRewardConfig();
      setConfig(configData);
    } catch (error) {
      console.error('Error loading daily reward config:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load daily reward configuration',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGemCoinUpdate = async (updates: Partial<DailyRewardConfig['gemCoinReward']>) => {
    if (!config) return;
    
    try {
      setSaving(true);
      const updatedGemCoin = { ...config.gemCoinReward, ...updates };
      await dailyRewardService.updateGemCoinReward(updatedGemCoin);
      setConfig({ ...config, gemCoinReward: updatedGemCoin });
      
      setNotification({
        type: 'success',
        message: 'Gem coin reward settings updated successfully!',
        isVisible: true,
      });
    } catch (error) {
      console.error('Error updating gem coin reward:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update gem coin reward settings',
        isVisible: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessCatalogueUpdate = async (updates: Partial<DailyRewardConfig['businessCatalogueReward']>) => {
    if (!config) return;
    
    try {
      setSaving(true);
      const updatedBusinessCatalogue = { ...config.businessCatalogueReward, ...updates };
      await dailyRewardService.updateBusinessCatalogueReward(updatedBusinessCatalogue);
      setConfig({ ...config, businessCatalogueReward: updatedBusinessCatalogue });
      
      setNotification({
        type: 'success',
        message: 'Business catalogue reward settings updated successfully!',
        isVisible: true,
      });
    } catch (error) {
      console.error('Error updating business catalogue reward:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update business catalogue reward settings',
        isVisible: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleScratchCardUpdate = async (updates: Partial<DailyRewardConfig['scratchCardConfig']>) => {
    if (!config) return;
    
    try {
      setSaving(true);
      const updatedScratchCard = { ...config.scratchCardConfig, ...updates };
      await dailyRewardService.updateScratchCardConfig(updatedScratchCard);
      setConfig({ ...config, scratchCardConfig: updatedScratchCard });
      
      setNotification({
        type: 'success',
        message: 'Scratch card settings updated successfully!',
        isVisible: true,
      });
    } catch (error) {
      console.error('Error updating scratch card config:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update scratch card settings',
        isVisible: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!config) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-gray-500">Failed to load configuration</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Rewards Configuration</h1>
            <p className="text-gray-600">Configure daily reward settings for users</p>
          </div>

          {/* Gem Coin Rewards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Gem Coin Rewards</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.gemCoinReward.enabled}
                  onChange={(e) => handleGemCoinUpdate({ enabled: e.target.checked })}
                  disabled={saving}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Enable Gem Coin Rewards</span>
              </label>
            </div>
            
            {config.gemCoinReward.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Amount
                    </label>
                    <input
                      type="number"
                      value={config.gemCoinReward.minAmount}
                      onChange={(e) => handleGemCoinUpdate({ minAmount: parseInt(e.target.value) || 0 })}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Amount
                    </label>
                    <input
                      type="number"
                      value={config.gemCoinReward.maxAmount}
                      onChange={(e) => handleGemCoinUpdate({ maxAmount: parseInt(e.target.value) || 0 })}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cooldown (Hours)
                    </label>
                    <input
                      type="number"
                      value={config.gemCoinReward.cooldownHours}
                      onChange={(e) => handleGemCoinUpdate({ cooldownHours: parseInt(e.target.value) || 24 })}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Users can scratch a card once every {config.gemCoinReward.cooldownHours} hours 
                    to receive between {config.gemCoinReward.minAmount} and {config.gemCoinReward.maxAmount} gem coins.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Business Catalogue Rewards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Business Catalogue Rewards</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.businessCatalogueReward.enabled}
                  onChange={(e) => handleBusinessCatalogueUpdate({ enabled: e.target.checked })}
                  disabled={saving}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Enable Business Catalogue Rewards</span>
              </label>
            </div>
            
            {config.businessCatalogueReward.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooldown (Hours)
                  </label>
                  <input
                    type="number"
                    value={config.businessCatalogueReward.cooldownHours}
                    onChange={(e) => handleBusinessCatalogueUpdate({ cooldownHours: parseInt(e.target.value) || 24 })}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> Business catalogue rewards will be available once every {config.businessCatalogueReward.cooldownHours} hours.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scratch Card Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Scratch Card Configuration</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.scratchCardConfig.enabled}
                  onChange={(e) => handleScratchCardUpdate({ enabled: e.target.checked })}
                  disabled={saving}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Enable Scratch Cards</span>
              </label>
            </div>
            
            {config.scratchCardConfig.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Design URL
                  </label>
                  <input
                    type="url"
                    value={config.scratchCardConfig.cardDesign}
                    onChange={(e) => handleScratchCardUpdate({ cardDesign: e.target.value })}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/card-design.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL to the scratch card background image
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scratch Area X Position
                    </label>
                    <input
                      type="number"
                      value={config.scratchCardConfig.scratchArea.x}
                      onChange={(e) => handleScratchCardUpdate({ 
                        scratchArea: { ...config.scratchCardConfig.scratchArea, x: parseInt(e.target.value) || 0 }
                      })}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scratch Area Y Position
                    </label>
                    <input
                      type="number"
                      value={config.scratchCardConfig.scratchArea.y}
                      onChange={(e) => handleScratchCardUpdate({ 
                        scratchArea: { ...config.scratchCardConfig.scratchArea, y: parseInt(e.target.value) || 0 }
                      })}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scratch Area Width
                    </label>
                    <input
                      type="number"
                      value={config.scratchCardConfig.scratchArea.width}
                      onChange={(e) => handleScratchCardUpdate({ 
                        scratchArea: { ...config.scratchCardConfig.scratchArea, width: parseInt(e.target.value) || 0 }
                      })}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scratch Area Height
                    </label>
                    <input
                      type="number"
                      value={config.scratchCardConfig.scratchArea.height}
                      onChange={(e) => handleScratchCardUpdate({ 
                        scratchArea: { ...config.scratchCardConfig.scratchArea, height: parseInt(e.target.value) || 0 }
                      })}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Note:</strong> Configure the scratch area coordinates and dimensions for the scratch card interface.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Last Updated */}
          {config.updatedAt && (
            <div className="text-center text-sm text-gray-500">
              Last updated: {new Date(config.updatedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Notification */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
            onClose={() => setNotification(null)}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
} 