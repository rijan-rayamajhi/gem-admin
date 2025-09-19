'use client';

import { useState, useEffect } from 'react';
import { useMonetization } from '../providers/MonetizationProvider';
import { MonetizationSettings } from '../../domain/entities/MonetizationSettings';
import MonetizationFAQsManager from './MonetizationFAQsManager';

export default function MonetizationSettingsForm() {
  const { settings, loadingSettings, updateSettings } = useMonetization();
  const [formData, setFormData] = useState<Partial<MonetizationSettings>>({});
  const [predefinedAmountsInput, setPredefinedAmountsInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        monetizationMessage: settings.monetizationMessage,
        faqs: settings.faqs,
        allowCashout: settings.allowCashout,
        predefinedAmounts: settings.predefinedAmounts,
        bankBalance: settings.bankBalance,
        conversionRate: settings.conversionRate,
        cashoutParams: settings.cashoutParams,
        gstPercentage: settings.gstPercentage,
        platformCharge: settings.platformCharge,
        otherCharge: settings.otherCharge,
        limitBasedCashout: settings.limitBasedCashout,
        timeLimit: settings.timeLimit,
        maxLimitCashout: settings.maxLimitCashout,
        minCashout: settings.minCashout,
      });
      setPredefinedAmountsInput(settings.predefinedAmounts?.join(', ') || '');
    } else {
      // Initialize with empty values when no settings exist
      setFormData({
        monetizationMessage: '',
        faqs: [],
        allowCashout: false,
        predefinedAmounts: [],
        bankBalance: 0,
        conversionRate: 0,
        cashoutParams: {
          minimumRides: 0,
          minimumDistance: 0,
          minimumReferrals: 0,
        },
        gstPercentage: 0,
        platformCharge: 0,
        otherCharge: 0,
        limitBasedCashout: false,
        timeLimit: 0,
        maxLimitCashout: 0,
        minCashout: 0,
      });
      setPredefinedAmountsInput('');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateSettings(formData, 'admin'); // TODO: Get actual admin user ID
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MonetizationSettings, value: string | number | boolean | string[] | { minimumRides: number; minimumDistance: number; minimumReferrals: number } | import('../../domain/entities/MonetizationSettings').FAQ[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingSettings) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Monetization Settings</h3>
      
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monetization Message */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-card-foreground border-b border-border pb-2">Monetization Message</h4>
          
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Message for Users
            </label>
            <textarea
              value={formData.monetizationMessage || ''}
              onChange={(e) => handleInputChange('monetizationMessage', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter a message about monetization for users..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">This message will be displayed to users regarding monetization features</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-card-foreground border-b border-border pb-2">Monetization FAQs</h4>
          <MonetizationFAQsManager
            faqs={formData.faqs}
            onChange={(faqs) => handleInputChange('faqs', faqs)}
          />
        </div>

        {/* For All Users */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-card-foreground border-b border-border pb-2">For All Users</h4>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowCashout"
              checked={formData.allowCashout || false}
              onChange={(e) => handleInputChange('allowCashout', e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="allowCashout" className="text-sm font-medium text-card-foreground">
              Allow Cashout
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Predefined Cashout Amounts ($)
            </label>
            <input
              type="text"
              value={predefinedAmountsInput}
              onChange={(e) => {
                setPredefinedAmountsInput(e.target.value);
              }}
              onBlur={(e) => {
                const inputValue = e.target.value;
                // Process the input when user finishes typing
                const amounts = inputValue.split(/[,\s]+/)
                  .map(s => s.trim())
                  .filter(s => s !== '')
                  .map(s => parseFloat(s))
                  .filter(n => !isNaN(n) && n > 0)
                  .map(n => n.toString());
                handleInputChange('predefinedAmounts', amounts);
              }}
              placeholder="10, 25, 50, 100"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter amounts separated by commas (e.g., 10, 25, 50, 100)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Bank Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.bankBalance || ''}
                onChange={(e) => handleInputChange('bankBalance', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Conversion Rate (Gem Coins to Cash)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.conversionRate || ''}
                onChange={(e) => handleInputChange('conversionRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Cashout Parameters */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Cashout Parameters</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Minimum Rides</label>
                <input
                  type="number"
                  value={formData.cashoutParams?.minimumRides || ''}
                  onChange={(e) => handleInputChange('cashoutParams', { 
                    minimumRides: parseInt(e.target.value),
                    minimumDistance: formData.cashoutParams?.minimumDistance || 0,
                    minimumReferrals: formData.cashoutParams?.minimumReferrals || 0
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Minimum Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.cashoutParams?.minimumDistance || ''}
                  onChange={(e) => handleInputChange('cashoutParams', { 
                    minimumRides: formData.cashoutParams?.minimumRides || 0,
                    minimumDistance: parseFloat(e.target.value),
                    minimumReferrals: formData.cashoutParams?.minimumReferrals || 0
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Minimum Referrals</label>
                <input
                  type="number"
                  value={formData.cashoutParams?.minimumReferrals || ''}
                  onChange={(e) => handleInputChange('cashoutParams', { 
                    minimumRides: formData.cashoutParams?.minimumRides || 0,
                    minimumDistance: formData.cashoutParams?.minimumDistance || 0,
                    minimumReferrals: parseInt(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                GST Percentage (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.gstPercentage || ''}
                onChange={(e) => handleInputChange('gstPercentage', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Platform Charge ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.platformCharge || ''}
                onChange={(e) => handleInputChange('platformCharge', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Other Charge ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.otherCharge || ''}
                onChange={(e) => handleInputChange('otherCharge', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* For Monetized Users */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-card-foreground border-b border-border pb-2">For Monetized Users</h4>
          <p className="text-sm text-muted-foreground">No conditions - they can cashout freely</p>
        </div>

        {/* For Unmonetized Users */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-card-foreground border-b border-border pb-2">For Unmonetized Users</h4>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="limitBasedCashout"
              checked={formData.limitBasedCashout || false}
              onChange={(e) => handleInputChange('limitBasedCashout', e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="limitBasedCashout" className="text-sm font-medium text-card-foreground">
              Limit Based Cashout
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Time Limit (days)
              </label>
              <input
                type="number"
                value={formData.timeLimit || ''}
                onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Max Limit Cashout ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.maxLimitCashout || ''}
                onChange={(e) => handleInputChange('maxLimitCashout', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Min Cashout ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.minCashout || ''}
                onChange={(e) => handleInputChange('minCashout', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
    </div>
  );
}
