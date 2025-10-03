'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCarouselAds } from '../providers/CarouselAdProvider';
import { CarouselAd, CreateCarouselAdRequest, CallToActionType } from '../../domain/entities/CarouselAd';

interface CarouselAdFormProps {
  carouselAd?: CarouselAd | null;
  onClose: () => void;
}

export default function CarouselAdForm({ carouselAd, onClose }: CarouselAdFormProps) {
  const { createCarouselAd, updateCarouselAd, uploadImage, loading } = useCarouselAds();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    callToAction: {
      type: 'none' as CallToActionType,
      value: ''
    },
    imageUrl: '',
    locationTargeting: {
      enabled: false,
      location: {
        latitude: 0,
        longitude: 0,
        address: ''
      },
      radius: 10
    },
    scheduling: {
      enabled: false,
      startDate: '',
      endDate: ''
    },
    isLive: false
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (carouselAd) {
      setFormData({
        title: carouselAd.title,
        description: carouselAd.description,
        callToAction: {
          type: carouselAd.callToAction.type,
          value: carouselAd.callToAction.value || ''
        },
        imageUrl: carouselAd.imageUrl,
        locationTargeting: {
          enabled: carouselAd.locationTargeting.enabled,
          location: carouselAd.locationTargeting.location || {
            latitude: 0,
            longitude: 0,
            address: ''
          },
          radius: carouselAd.locationTargeting.radius || 10
        },
        scheduling: {
          enabled: carouselAd.scheduling.enabled,
          startDate: carouselAd.scheduling.startDate ? new Date(carouselAd.scheduling.startDate).toISOString().slice(0, 16) : '',
          endDate: carouselAd.scheduling.endDate ? new Date(carouselAd.scheduling.endDate).toISOString().slice(0, 16) : ''
        },
        isLive: carouselAd.isActive
      });
      setImagePreview(carouselAd.imageUrl);
    }
  }, [carouselAd]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      
      if (parent === 'callToAction') {
        setFormData(prev => ({
          ...prev,
          callToAction: {
            ...prev.callToAction,
            [child]: value
          }
        }));
      } else if (parent === 'locationTargeting') {
        if (child === 'location' && subChild) {
          setFormData(prev => ({
            ...prev,
            locationTargeting: {
              ...prev.locationTargeting,
              location: {
                ...prev.locationTargeting.location,
                [subChild]: subChild === 'latitude' || subChild === 'longitude' ? parseFloat(value) || 0 : value
              }
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            locationTargeting: {
              ...prev.locationTargeting,
              [child]: child === 'enabled' ? checked : (child === 'radius' ? parseFloat(value) || 0 : value)
            }
          }));
        }
      } else if (parent === 'scheduling') {
        setFormData(prev => ({
          ...prev,
          scheduling: {
            ...prev.scheduling,
            [child]: child === 'enabled' ? checked : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSearch = async () => {
    const { address } = formData.locationTargeting.location;
    if (!address.trim()) return;

    try {
      // Using a simple geocoding approach - in production, use a proper geocoding service
      // For now, we'll use placeholder coordinates
      const mockCoordinates = {
        latitude: 27.7172 + (Math.random() - 0.5) * 0.1, // Kathmandu area
        longitude: 85.3240 + (Math.random() - 0.5) * 0.1
      };
      
      setFormData(prev => ({
        ...prev,
        locationTargeting: {
          ...prev.locationTargeting,
          location: {
            ...prev.locationTargeting.location,
            ...mockCoordinates
          }
        }
      }));
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.callToAction.type) newErrors['callToAction.type'] = 'Call to action type is required';
    
    if (formData.callToAction.type !== 'none' && !formData.callToAction.value.trim()) {
      newErrors['callToAction.value'] = `${formData.callToAction.type === 'app_screen' ? 'Screen name' : 'URL'} is required`;
    }
    if (!formData.imageUrl && !imageFile) newErrors.image = 'Image is required';
    
    if (formData.locationTargeting.enabled) {
      if (!formData.locationTargeting.location.address.trim()) {
        newErrors['locationTargeting.location.address'] = 'Location address is required when location targeting is enabled';
      }
      if (formData.locationTargeting.radius <= 0) {
        newErrors['locationTargeting.radius'] = 'Radius must be greater than 0';
      }
    }
    
    if (formData.scheduling.enabled) {
      if (!formData.scheduling.startDate) newErrors['scheduling.startDate'] = 'Start date is required when scheduling is enabled';
      if (!formData.scheduling.endDate) newErrors['scheduling.endDate'] = 'End date is required when scheduling is enabled';
      
      if (formData.scheduling.startDate && formData.scheduling.endDate) {
        const startDate = new Date(formData.scheduling.startDate);
        const endDate = new Date(formData.scheduling.endDate);
        
        if (startDate >= endDate) {
          newErrors['scheduling.endDate'] = 'End date must be after start date';
        }

        if (endDate <= new Date()) {
          newErrors['scheduling.endDate'] = 'End date must be in the future';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsUploading(true);

      let finalImageUrl = formData.imageUrl;

      // Upload new image if selected
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const carouselAdData: CreateCarouselAdRequest = {
        title: formData.title,
        description: formData.description,
        callToAction: formData.callToAction,
        imageUrl: finalImageUrl,
        locationTargeting: formData.locationTargeting,
        scheduling: {
          enabled: formData.scheduling.enabled,
          ...(formData.scheduling.enabled && formData.scheduling.startDate && {
            startDate: new Date(formData.scheduling.startDate)
          }),
          ...(formData.scheduling.enabled && formData.scheduling.endDate && {
            endDate: new Date(formData.scheduling.endDate)
          })
        },
        isActive: formData.isLive
      };

      if (carouselAd) {
        await updateCarouselAd({
          id: carouselAd.id,
          ...carouselAdData,
          isActive: formData.isLive
        });
      } else {
        await createCarouselAd(carouselAdData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving carousel ad:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">
          {carouselAd ? 'Edit Carousel Ad' : 'Create New Carousel Ad'}
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-card-foreground"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Advertisement Image (16:9 aspect ratio)
          </label>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            
            {imagePreview && (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={192}
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  16:9
                </div>
              </div>
            )}
          </div>
          {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter advertisement title"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter advertisement description"
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Call to Action Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-card-foreground">Call to Action Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                CTA Type *
              </label>
              <select
                name="callToAction.type"
                value={formData.callToAction.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="app_screen">App Screen</option>
                <option value="link">External Link</option>
                <option value="web_view">Web View</option>
              </select>
              {errors['callToAction.type'] && <p className="text-red-600 text-sm mt-1">{errors['callToAction.type']}</p>}
            </div>

            {formData.callToAction.type !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {formData.callToAction.type === 'app_screen' ? 'Screen Name *' : 'URL *'}
                </label>
                <input
                  type={formData.callToAction.type === 'app_screen' ? 'text' : 'url'}
                  name="callToAction.value"
                  value={formData.callToAction.value}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={
                    formData.callToAction.type === 'app_screen' 
                      ? 'e.g., ProfileScreen, HomeScreen' 
                      : 'https://example.com'
                  }
                />
                {errors['callToAction.value'] && <p className="text-red-600 text-sm mt-1">{errors['callToAction.value']}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Location & Targeting Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="locationTargeting"
              name="locationTargeting.enabled"
              checked={formData.locationTargeting.enabled}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="locationTargeting" className="text-lg font-medium text-card-foreground">
              Location & Targeting
            </label>
          </div>
          
          {formData.locationTargeting.enabled && (
            <div className="space-y-4 pl-7 border-l-2 border-border">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Location Address *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="locationTargeting.location.address"
                    value={formData.locationTargeting.location.address}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter location address"
                  />
                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Find
                  </button>
                </div>
                {errors['locationTargeting.location.address'] && <p className="text-red-600 text-sm mt-1">{errors['locationTargeting.location.address']}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="locationTargeting.location.latitude"
                    value={formData.locationTargeting.location.latitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="27.7172"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="locationTargeting.location.longitude"
                    value={formData.locationTargeting.location.longitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="85.3240"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Radius (km) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    name="locationTargeting.radius"
                    value={formData.locationTargeting.radius}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="10"
                  />
                  {errors['locationTargeting.radius'] && <p className="text-red-600 text-sm mt-1">{errors['locationTargeting.radius']}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scheduling Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="scheduling"
              name="scheduling.enabled"
              checked={formData.scheduling.enabled}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="scheduling" className="text-lg font-medium text-card-foreground">
              Schedule
            </label>
          </div>
          
          {formData.scheduling.enabled && (
            <div className="space-y-4 pl-7 border-l-2 border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduling.startDate"
                    value={formData.scheduling.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors['scheduling.startDate'] && <p className="text-red-600 text-sm mt-1">{errors['scheduling.startDate']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduling.endDate"
                    value={formData.scheduling.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors['scheduling.endDate'] && <p className="text-red-600 text-sm mt-1">{errors['scheduling.endDate']}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Status */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isLive"
              name="isLive"
              checked={formData.isLive}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="isLive" className="text-lg font-medium text-card-foreground">
              Make this ad live immediately
            </label>
          </div>
          <p className="text-sm text-muted-foreground pl-7">
            When enabled, this ad will be active and visible to users immediately after creation.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-card-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isUploading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading || isUploading ? 'Saving...' : carouselAd ? 'Update Ad' : 'Create Ad'}
          </button>
        </div>
      </form>
    </div>
  );
}
