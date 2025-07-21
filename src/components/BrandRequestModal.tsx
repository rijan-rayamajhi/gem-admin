'use client';

import React, { useState, useRef } from 'react';
import { brandRequestService, BrandRequest } from '@/lib/brandRequestService';
import { StorageService } from '@/lib/storageService';
import { useAuth } from '@/lib/auth-context';
import Notification from './Notification';

interface BrandRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BrandRequestModal({ isOpen, onClose, onSuccess }: BrandRequestModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    brandName: '',
    vehicleType: 'Four Wheeler' as BrandRequest['vehicleType'],
    vehicleModels: [] as string[],
  });

  const [logoFile, setLogoFile] = useState<File | undefined>(undefined);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUploadProgress, setLogoUploadProgress] = useState<number>(0);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newModel, setNewModel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  const vehicleTypes: BrandRequest['vehicleType'][] = [
    'Two Wheeler', 'Four Wheeler', 'Two Wheeler Electric', 'Four Wheeler Electric'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addModel = () => {
    if (newModel.trim() && !formData.vehicleModels.includes(newModel.trim())) {
      setFormData(prev => ({
        ...prev,
        vehicleModels: [...prev.vehicleModels, newModel.trim()],
      }));
      setNewModel('');
    }
  };

  const removeModel = (modelName: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleModels: prev.vehicleModels.filter(model => model !== modelName),
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = StorageService.validateImageFile(file);
    if (!validation.isValid) {
      setNotification({
        type: 'error',
        message: validation.error || 'Invalid file',
        isVisible: true,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setLogoFile(file);
  };

  const removeLogo = () => {
    setLogoFile(undefined);
    setLogoPreview('');
    setLogoUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadLogo = async (): Promise<string> => {
    if (!logoFile || !formData.brandName.trim()) {
      throw new Error('Logo file and brand name are required');
    }

    setIsUploadingLogo(true);
    setLogoUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setLogoUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await StorageService.uploadBrandLogo(logoFile, formData.brandName);
      
      clearInterval(progressInterval);
      setLogoUploadProgress(100);
      
      return result.url;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.brandName.trim()) {
        throw new Error('Brand name is required');
      }

      if (formData.vehicleModels.length === 0) {
        throw new Error('At least one vehicle model is required');
      }

      if (!user?.uid) {
        throw new Error('User authentication required');
      }

      let imageUrl = '';
      
      // Upload logo if provided
      if (logoFile) {
        imageUrl = await uploadLogo();
      }

      const requestData = {
        brandName: formData.brandName.trim(),
        imageUrl: imageUrl || undefined,
        vehicleType: formData.vehicleType,
        vehicleModels: formData.vehicleModels,
        userId: user.uid,
      };

      await brandRequestService.submitBrandRequest(requestData);
      
      setNotification({
        type: 'success',
        message: 'Brand request submitted successfully! It will be reviewed by our team.',
        isVisible: true,
      });

      // Reset form
      setFormData({
        brandName: '',
        vehicleType: 'Four Wheeler',
        vehicleModels: [],
      });
      setLogoFile(undefined);
      setLogoPreview('');
      setLogoUploadProgress(0);
      setNewModel('');

      // Close modal after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setNotification(null);
      }, 2000);

    } catch (error) {
      console.error('Error submitting brand request:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit brand request',
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Submit Brand Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              isVisible={notification.isVisible}
              onClose={() => setNotification(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value as BrandRequest['vehicleType'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Models */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Models *
              </label>
              <div className="space-y-4">
                {/* Add New Model */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Model name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addModel();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addModel}
                    disabled={!newModel.trim() || formData.vehicleModels.includes(newModel.trim())}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Models List */}
                {formData.vehicleModels.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Added Models ({formData.vehicleModels.length})</h4>
                    {formData.vehicleModels.map((model, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{model}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeModel(model)}
                          className="ml-2 text-red-600 hover:text-red-900 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Logo (Optional)
              </label>
              
              {!logoPreview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG, WebP (MAX. 5MB)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        disabled={isUploadingLogo}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 object-contain border border-gray-300 rounded-lg"
                      />
                      {isUploadingLogo && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <div className="text-white text-xs font-medium">{logoUploadProgress}%</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{logoFile?.name}</p>
                      <p className="text-sm text-gray-500">
                        {(logoFile?.size || 0) / 1024 / 1024} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      disabled={isUploadingLogo}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {isUploadingLogo && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${logoUploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
              
              <p className="mt-1 text-sm text-gray-500">
                Upload your brand logo. Supported formats: PNG, JPG, JPEG, WebP. Maximum size: 5MB.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingLogo}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (isUploadingLogo ? 'Uploading Logo...' : 'Submitting...') : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 