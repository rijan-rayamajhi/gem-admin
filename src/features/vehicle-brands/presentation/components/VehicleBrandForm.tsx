'use client';

import { useState, useEffect } from 'react';
import { VehicleBrand, CreateVehicleBrandRequest, UpdateVehicleBrandRequest } from '../../domain/entities/VehicleBrand';
import { useVehicleBrand } from '../providers/VehicleBrandProvider';

interface VehicleBrandFormProps {
  vehicleBrand: VehicleBrand | null;
  onClose: () => void;
}

export default function VehicleBrandForm({ vehicleBrand, onClose }: VehicleBrandFormProps) {
  const { createVehicleBrand, updateVehicleBrand, loading, vehicleBrands } = useVehicleBrand();
  
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    vehicleType: 'four_wheeler' as 'two_wheeler' | 'four_wheeler' | 'two_wheeler_electric' | 'four_wheeler_electric',
    models: [] as string[],
  });
  
  const [newModel, setNewModel] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!vehicleBrand;

  useEffect(() => {
    if (vehicleBrand) {
      setFormData({
        name: vehicleBrand.name,
        logoUrl: vehicleBrand.logoUrl,
        vehicleType: vehicleBrand.vehicleType,
        models: [...vehicleBrand.models],
      });
    } else {
      setFormData({
        name: '',
        logoUrl: '',
        vehicleType: 'four_wheeler',
        models: [],
      });
    }
    setNewModel('');
    setErrors({});
  }, [vehicleBrand]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    } else {
      // Check for duplicate brand names with same vehicle type
      const trimmedName = formData.name.trim();
      const existingBrand = vehicleBrands.find(brand => 
        brand.name.toLowerCase() === trimmedName.toLowerCase() && 
        brand.vehicleType === formData.vehicleType &&
        brand.id !== vehicleBrand?.id
      );
      
      if (existingBrand) {
        newErrors.name = `A ${formData.vehicleType.replace('_', ' ')} brand with this name already exists`;
      }
    }

    if (!formData.logoUrl.trim()) {
      newErrors.logoUrl = 'Logo URL is required';
    } else if (!isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = 'Please enter a valid URL';
    }

    if (formData.models.length === 0) {
      newErrors.models = 'At least one model is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && vehicleBrand) {
        const updateRequest: UpdateVehicleBrandRequest = {
          id: vehicleBrand.id,
          name: formData.name.trim(),
          logoUrl: formData.logoUrl.trim(),
          vehicleType: formData.vehicleType,
          models: formData.models,
        };
        await updateVehicleBrand(updateRequest);
      } else {
        const createRequest: CreateVehicleBrandRequest = {
          name: formData.name.trim(),
          logoUrl: formData.logoUrl.trim(),
          vehicleType: formData.vehicleType,
          models: formData.models,
        };
        await createVehicleBrand(createRequest);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save vehicle brand:', error);
    }
  };

  const handleAddModel = () => {
    if (newModel.trim() && !formData.models.includes(newModel.trim())) {
      setFormData(prev => ({
        ...prev,
        models: [...prev.models, newModel.trim()]
      }));
      setNewModel('');
    }
  };

  const handleRemoveModel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      models: prev.models.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddModel();
    }
  };

  const vehicleTypes = [
    { value: 'two_wheeler', label: 'Two Wheeler' },
    { value: 'four_wheeler', label: 'Four Wheeler' },
    { value: 'two_wheeler_electric', label: 'Two Wheeler Electric' },
    { value: 'four_wheeler_electric', label: 'Four Wheeler Electric' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">
            {isEditing ? 'Edit Vehicle Brand' : 'Add Vehicle Brand'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Brand Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-border'
              }`}
              placeholder="Enter brand name (e.g., BMW, Tesla)"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-card-foreground mb-2">
              Logo URL *
            </label>
            <input
              type="url"
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.logoUrl ? 'border-red-500' : 'border-border'
              }`}
              placeholder="https://example.com/logo.png"
            />
            {errors.logoUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.logoUrl}</p>
            )}
          </div>

          {/* Vehicle Type */}
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-card-foreground mb-2">
              Vehicle Type *
            </label>
            <select
              id="vehicleType"
              value={formData.vehicleType}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value as 'two_wheeler' | 'four_wheeler' | 'two_wheeler_electric' | 'four_wheeler_electric' }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Models */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Models *
            </label>
            
            {/* Add Model Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter model name"
              />
              <button
                type="button"
                onClick={handleAddModel}
                disabled={!newModel.trim() || formData.models.includes(newModel.trim())}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>

            {/* Models List */}
            <div className="space-y-2">
              {formData.models.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="text-sm text-card-foreground">{model}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveModel(index)}
                    className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                    aria-label={`Remove ${model}`}
                  >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {errors.models && (
              <p className="mt-1 text-sm text-red-600">{errors.models}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-card-foreground transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
