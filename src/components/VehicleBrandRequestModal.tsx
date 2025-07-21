'use client';

import React, { useState, useEffect } from 'react';
import { vehicleBrandRequestService } from '@/lib/vehicleBrandRequestService';
import { vehicleBrandService, VehicleBrand } from '@/lib/vehicleBrandService';
import Notification from './Notification';

interface VehicleBrandRequest {
  id: string;
  type: 'brand' | 'model';
  brandName?: string;
  modelName?: string;
  modelDescription?: string;
  vehicleType: 'two_wheeler' | 'four_wheeler' | 'two_wheeler_electric' | 'four_wheeler_electric';
  description: string;
  userEmail: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
}

interface VehicleBrandRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
  userName: string;
}

export default function VehicleBrandRequestModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userEmail, 
  userName 
}: VehicleBrandRequestModalProps) {
  const [requestType, setRequestType] = useState<'brand' | 'model'>('brand');
  const [formData, setFormData] = useState({
    brandName: '',
    modelName: '',
    modelDescription: '',
    vehicleType: 'four_wheeler' as VehicleBrandRequest['vehicleType'],
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  // For model requests - load existing brands
  const [existingBrands, setExistingBrands] = useState<VehicleBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  const vehicleTypes: VehicleBrandRequest['vehicleType'][] = [
    'two_wheeler', 'four_wheeler', 'two_wheeler_electric', 'four_wheeler_electric'
  ];

  const formatVehicleTypeForDisplay = (vehicleType: string) => {
    const displayNames: { [key: string]: string } = {
      'two_wheeler': 'Two Wheeler',
      'four_wheeler': 'Four Wheeler',
      'two_wheeler_electric': 'Two Wheeler Electric',
      'four_wheeler_electric': 'Four Wheeler Electric',
    };
    return displayNames[vehicleType] || vehicleType;
  };

  const formatVehicleType = (vehicleType: string) => {
    const displayNames: { [key: string]: string } = {
      'two_wheeler': 'Two Wheeler',
      'four_wheeler': 'Four Wheeler',
      'two_wheeler_electric': 'Two Wheeler Electric',
      'four_wheeler_electric': 'Four Wheeler Electric',
    };
    return displayNames[vehicleType] || vehicleType;
  };

  // Load existing brands when modal opens or request type changes to model
  useEffect(() => {
    if (isOpen && requestType === 'model') {
      loadExistingBrands();
    }
  }, [isOpen, requestType]);

  // Reset form when request type changes
  useEffect(() => {
    setFormData({
      brandName: '',
      modelName: '',
      modelDescription: '',
      vehicleType: 'four_wheeler',
      description: '',
    });
  }, [requestType]);

  const loadExistingBrands = async () => {
    try {
      setBrandsLoading(true);
      const brands = await vehicleBrandService.getVehicleBrands();
      setExistingBrands(brands);
    } catch (error) {
      console.error('Error loading existing brands:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load existing brands',
        isVisible: true,
      });
    } finally {
      setBrandsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-set vehicle type when brand is selected for model requests
    if (field === 'brandName' && requestType === 'model' && value) {
      const selectedBrand = existingBrands.find(brand => brand.name === value);
      if (selectedBrand) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          vehicleType: selectedBrand.vehicleType,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (requestType === 'brand') {
        if (!formData.brandName.trim()) {
          throw new Error('Brand name is required');
        }
      } else {
        if (!formData.brandName.trim()) {
          throw new Error('Brand name is required');
        }
        if (!formData.modelName.trim()) {
          throw new Error('Model name is required');
        }
        if (!formData.modelDescription.trim()) {
          throw new Error('Model description is required');
        }
      }

      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      // Create request object
      const requestData: Omit<VehicleBrandRequest, 'id' | 'createdAt'> = {
        type: requestType,
        brandName: formData.brandName,
        modelName: requestType === 'model' ? formData.modelName : undefined,
        modelDescription: requestType === 'model' ? formData.modelDescription : undefined,
        vehicleType: formData.vehicleType,
        description: formData.description,
        userEmail,
        userName,
        status: 'pending',
      };

      // Save request using service
      await vehicleBrandRequestService.addVehicleBrandRequest(requestData);

      setNotification({
        type: 'success',
        message: `${requestType === 'brand' ? 'Brand' : 'Model'} request submitted successfully!`,
        isVisible: true,
      });

      // Reset form
      setFormData({
        brandName: '',
        modelName: '',
        modelDescription: '',
        vehicleType: 'four_wheeler',
        description: '',
      });

      // Close modal after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setNotification(null);
      }, 1500);

    } catch (error) {
      console.error('Error submitting request:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit request',
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
            <h2 className="text-2xl font-bold text-gray-900">Request New Vehicle {requestType === 'brand' ? 'Brand' : 'Model'}</h2>
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
            {/* Request Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Type *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="brand"
                    checked={requestType === 'brand'}
                    onChange={(e) => setRequestType(e.target.value as 'brand' | 'model')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">New Brand</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="model"
                    checked={requestType === 'model'}
                    onChange={(e) => setRequestType(e.target.value as 'brand' | 'model')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">New Model</span>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {requestType === 'brand' ? 'Brand Name' : 'Select Brand'} *
                </label>
                {requestType === 'brand' ? (
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter brand name"
                    required
                  />
                ) : (
                  <div className="relative">
                    {brandsLoading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-gray-500">Loading brands...</span>
                      </div>
                    ) : (
                      <select
                        value={formData.brandName}
                        onChange={(e) => handleInputChange('brandName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select an existing brand</option>
                        {existingBrands.map(brand => (
                          <option key={brand.id} value={brand.name}>
                            {brand.name} ({formatVehicleType(brand.vehicleType)})
                          </option>
                        ))}
                      </select>
                    )}
                    {existingBrands.length === 0 && !brandsLoading && (
                      <p className="text-sm text-gray-500 mt-1">No brands available. Please add brands first.</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                {requestType === 'model' && formData.brandName ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                    {formatVehicleTypeForDisplay(formData.vehicleType)}
                    <span className="text-sm text-gray-500 ml-2">(Auto-set from selected brand)</span>
                  </div>
                ) : (
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value as VehicleBrandRequest['vehicleType'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{formatVehicleTypeForDisplay(type)}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Model-specific fields */}
            {requestType === 'model' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Name *
                    </label>
                    <input
                      type="text"
                      value={formData.modelName}
                      onChange={(e) => handleInputChange('modelName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter model name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Description *
                    </label>
                    <input
                      type="text"
                      value={formData.modelDescription}
                      onChange={(e) => handleInputChange('modelDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter model description"
                      required
                    />
                  </div>
                </div>

                {/* Show existing models for selected brand */}
                {formData.brandName && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Existing Models for {formData.brandName}
                    </h4>
                    {(() => {
                      const selectedBrand = existingBrands.find(brand => brand.name === formData.brandName);
                      if (selectedBrand && selectedBrand.models.length > 0) {
                        return (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">Current models: {selectedBrand.models.map(model => model.name).join(', ')}</p>
                            <p className="text-blue-600">Please ensure your requested model is not already in the list above.</p>
                          </div>
                        );
                      } else if (selectedBrand) {
                        return (
                          <div className="text-sm text-blue-800">
                            <p>No models currently exist for this brand. Your request will be the first model.</p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Explain why you want to add this ${requestType === 'brand' ? 'brand' : 'model'} and any additional details...`}
                required
              />
            </div>

            {/* User Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Request Submitted By</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 text-gray-900">{userName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 text-gray-900">{userEmail}</span>
                </div>
              </div>
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : `Submit ${requestType === 'brand' ? 'Brand' : 'Model'} Request`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 