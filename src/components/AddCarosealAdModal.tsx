'use client';

import { useState } from 'react';
import { CarosealAd } from '@/lib/carosealAdService';
import Notification from './Notification';
import { useTimestampForm } from '@/hooks/useTimestampForm';

interface AddCarosealAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adData: any) => Promise<void>;
  ad?: CarosealAd;
  isEditing?: boolean;
}

export default function AddCarosealAdModal({
  isOpen,
  onClose,
  onSave,
  ad,
  isEditing = false,
}: AddCarosealAdModalProps) {
  // Use the new timestamp-based form hook
  const {
    formData,
    errors,
    updateTimestamp,
    updateFormField,
    updateLocation,
    getInputValue,
    validateForm,
    resetForm,
    getSubmissionData,
    getAdStatus,
    getDateDisplays,
  } = useTimestampForm(ad, isEditing);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  const appScreenOptions = [
    { value: 'Home', label: 'Home' },
    { value: 'Offers', label: 'Offers' },
    { value: 'Profile', label: 'Profile' },
    { value: 'Settings', label: 'Settings' },
  ];

  // Handle image file selection
  const handleImageChange = (file: File | null) => {
    updateFormField('adImage', file);
  };

  // Clear existing image
  const handleClearExistingImage = () => {
    updateFormField('existingImageUrl', undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fix the errors below and try again.',
        isVisible: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Get submission data (already in proper format with Timestamps)
      const submissionData = getSubmissionData();
      
      // For editing, include existing image URL if no new image is uploaded
      if (isEditing && !submissionData.adImage && submissionData.existingImageUrl) {
        submissionData.existingImageUrl = submissionData.existingImageUrl;
      }

      await onSave(submissionData);
      onClose();
      resetForm();
    } catch {
      setNotification({
        type: 'error',
        message: 'Failed to save ad. Please try again.',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dateDisplays = getDateDisplays();
  const adStatus = getAdStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Ad' : 'Create New Ad'}
              </h2>
              {isEditing && (
                <p className="text-sm text-gray-600 mt-1">
                  Status: <span className={`font-medium ${
                    adStatus === 'active' ? 'text-green-600' : 
                    adStatus === 'expired' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {adStatus.charAt(0).toUpperCase() + adStatus.slice(1)}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormField('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter ad title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter ad description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Ad Image */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ad Image *</h3>
            <div className="space-y-4">
              {/* Show existing image if editing */}
              {isEditing && formData.existingImageUrl && !formData.adImage && (
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.existingImageUrl}
                      alt="Current ad"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Current image</p>
                    <button
                      type="button"
                      onClick={handleClearExistingImage}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove current image
                    </button>
                  </div>
                </div>
              )}

              {/* File upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.adImage && <p className="text-red-500 text-sm mt-1">{errors.adImage}</p>}
              </div>

              {/* Preview new image */}
              {formData.adImage && (
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(formData.adImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">New image preview</p>
                    <button
                      type="button"
                      onClick={() => handleImageChange(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Type */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Action Type *</h3>
            <div className="flex items-center mb-2 gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.actionTypeType === 'website'}
                  onChange={() => {
                    updateFormField('actionTypeType', 'website');
                    updateFormField('actionTypeValue', '');
                  }}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Website</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.actionTypeType === 'app_screen'}
                  onChange={() => {
                    updateFormField('actionTypeType', 'app_screen');
                    updateFormField('actionTypeValue', '');
                  }}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">App Screen</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.actionTypeType === 'location'}
                  onChange={() => {
                    updateFormField('actionTypeType', 'location');
                    updateFormField('actionTypeValue', '');
                    updateFormField('actionTypeLatitude', undefined);
                    updateFormField('actionTypeLongitude', undefined);
                  }}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Location</span>
              </label>
            </div>

            {formData.actionTypeType === 'website' ? (
              <input
                type="url"
                value={formData.actionTypeValue}
                onChange={(e) => updateFormField('actionTypeValue', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.actionTypeValue ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter website URL (e.g. https://example.com)"
              />
            ) : formData.actionTypeType === 'app_screen' ? (
              <select
                value={formData.actionTypeValue}
                onChange={(e) => updateFormField('actionTypeValue', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.actionTypeValue ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select app screen</option>
                {appScreenOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              // Location action type fields
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                  <input
                    type="text"
                    value={formData.actionTypeValue}
                    onChange={(e) => updateFormField('actionTypeValue', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.actionTypeValue ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter location name (e.g. Central Park, Times Square)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.actionTypeLatitude || ''}
                      onChange={(e) => updateFormField('actionTypeLatitude', parseFloat(e.target.value) || undefined)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.actionTypeValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="40.7128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.actionTypeLongitude || ''}
                      onChange={(e) => updateFormField('actionTypeLongitude', parseFloat(e.target.value) || undefined)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.actionTypeValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="-74.0060"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Specify the exact coordinates where users should be directed. You can find coordinates using Google Maps.
                </p>
              </div>
            )}
            {errors.actionTypeValue && <p className="text-red-500 text-sm mt-1">{errors.actionTypeValue}</p>}
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location Visibility *</h3>
            <div className="flex items-center mb-2 gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.locationType === 'pan_india'}
                  onChange={() => updateFormField('locationType', 'pan_india')}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Pan India</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.locationType === 'specific'}
                  onChange={() => updateFormField('locationType', 'specific')}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Specific Location</span>
              </label>
            </div>

            {formData.locationType === 'specific' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) => updateLocation('latitude', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) => updateLocation('longitude', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.radius || ''}
                    onChange={(e) => updateLocation('radius', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="5"
                  />
                </div>
              </div>
            )}
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Date Schedule - Now using Timestamps */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ad Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={getInputValue('startDate')}
                  onChange={(e) => updateTimestamp('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                <p className="text-xs text-gray-500 mt-1">Display: {dateDisplays.startDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={getInputValue('endDate')}
                  onChange={(e) => updateTimestamp('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                <p className="text-xs text-gray-500 mt-1">Display: {dateDisplays.endDate}</p>
              </div>
            </div>
            {errors.dateRange && <p className="text-red-500 text-sm mt-1">{errors.dateRange}</p>}
            
            {/* Ad Duration Display */}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {dateDisplays.duration}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> <span className={`font-medium ${
                  adStatus === 'active' ? 'text-green-600' : 
                  adStatus === 'expired' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {adStatus.charAt(0).toUpperCase() + adStatus.slice(1)}
                </span>
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Ad' : 'Create Ad'}
            </button>
          </div>
        </form>

        {/* Notification */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
} 