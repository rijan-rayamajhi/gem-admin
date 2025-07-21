'use client';

import { useState, useEffect } from 'react';
import { BusinessUser } from '@/lib/businessUserService';

interface EditBusinessUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessUser: BusinessUser | null;
  onSave: (updatedUser: Partial<BusinessUser>) => Promise<void>;
}

export default function EditBusinessUserModal({
  isOpen,
  onClose,
  businessUser,
  onSave,
}: EditBusinessUserModalProps) {
  const [formData, setFormData] = useState<Partial<BusinessUser>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (businessUser) {
      setFormData({
        businessName: businessUser.businessName,
        selectedCategoryName: businessUser.selectedCategoryName,
        selectedOtherCategoryName: businessUser.selectedOtherCategoryName,
        isOtherCategory: businessUser.isOtherCategory,
        businessType: businessUser.businessType,
        businessInfo: businessUser.businessInfo,
        personalInfo: businessUser.personalInfo,
        isActive: businessUser.isActive,
        verificationStatus: businessUser.verificationStatus,
      });
      setErrors({});
    }
  }, [businessUser]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleBusinessInfoChange = (type: 'offline' | 'online', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [type]: type === 'offline' 
          ? [{ 
              ...prev.businessInfo?.[type]?.[0],
              shopLocation: {
                ...prev.businessInfo?.[type]?.[0]?.shopLocation,
                [field]: value,
              }
            }]
          : { ...prev.businessInfo?.[type], [field]: value }
      }
    }));
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName?.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.personalInfo?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.personalInfo?.phoneNumber?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.isOtherCategory && !formData.selectedOtherCategoryName?.trim()) {
      newErrors.otherCategory = 'Other category name is required';
    }

    if (!formData.isOtherCategory && !formData.selectedCategoryName?.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error updating business user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !businessUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Business User</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Business Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName || ''}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  value={formData.businessType || ''}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Type
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.isOtherCategory}
                      onChange={() => handleInputChange('isOtherCategory', false)}
                      className="mr-2"
                    />
                    Standard Category
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.isOtherCategory}
                      onChange={() => handleInputChange('isOtherCategory', true)}
                      className="mr-2"
                    />
                    Other Category
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.isOtherCategory ? 'Other Category Name *' : 'Category *'}
                </label>
                {formData.isOtherCategory ? (
                  <input
                    type="text"
                    value={formData.selectedOtherCategoryName || ''}
                    onChange={(e) => handleInputChange('selectedOtherCategoryName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.otherCategory ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.selectedCategoryName || ''}
                    onChange={(e) => handleInputChange('selectedCategoryName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
                {(errors.otherCategory || errors.category) && (
                  <p className="text-red-500 text-sm mt-1">{errors.otherCategory || errors.category}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.personalInfo?.email || ''}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.personalInfo?.phoneNumber || ''}
                  onChange={(e) => handlePersonalInfoChange('phoneNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Address/Website */}
          {(formData.businessType === 'Offline' || formData.businessType === 'Both') && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo?.offline?.[0]?.shopLocation?.address || ''}
                    onChange={(e) => handleBusinessInfoChange('offline', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo?.offline?.[0]?.shopLocation?.city || ''}
                    onChange={(e) => handleBusinessInfoChange('offline', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo?.offline?.[0]?.shopLocation?.state || ''}
                    onChange={(e) => handleBusinessInfoChange('offline', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo?.offline?.[0]?.shopLocation?.zipCode || ''}
                    onChange={(e) => handleBusinessInfoChange('offline', 'zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {(formData.businessType === 'Online' || formData.businessType === 'Both') && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Website Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.businessInfo?.online?.website || ''}
                  onChange={(e) => handleBusinessInfoChange('online', 'website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}

          {/* Status Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Status
                </label>
                <select
                  value={formData.verificationStatus || ''}
                  onChange={(e) => handleInputChange('verificationStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="notVerified">Not Verified</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 