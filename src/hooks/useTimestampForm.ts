import { useState, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { TimestampUtils } from '@/lib/timestampUtils';

/**
 * Interface for timestamp form data used in Caroseal Ads
 * Now using Firebase Timestamps throughout instead of strings
 */
export interface CarosealAdFormData {
  title: string;
  description: string;
  adImage: File | null;
  existingImageUrl?: string;
  actionTypeType: 'website' | 'app_screen' | 'location';
  actionTypeValue: string;
  actionTypeLatitude?: number;  // For location action type
  actionTypeLongitude?: number; // For location action type
  locationType: 'specific' | 'pan_india';
  latitude?: number;
  longitude?: number;
  radius?: number;
  startDate: Timestamp;      // Now using Timestamp instead of string
  endDate: Timestamp;        // Now using Timestamp instead of string
}

/**
 * Interface for form validation errors
 */
export interface FormErrors {
  title?: string;
  description?: string;
  adImage?: string;
  actionTypeValue?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: string;
}

/**
 * Custom hook for managing timestamp-based form state
 * Handles the conversion between Firebase Timestamps and HTML datetime-local inputs
 */
export const useTimestampForm = (initialAd?: any, isEditing: boolean = false) => {
  // Initialize form data with proper defaults
  const getInitialFormData = (): CarosealAdFormData => {
    if (initialAd && isEditing) {
      return {
        title: initialAd.title || '',
        description: initialAd.description || '',
        adImage: null,
        existingImageUrl: initialAd.adImage || '',
        actionTypeType: initialAd.actionType?.type || 'website',
        actionTypeValue: initialAd.actionType?.value || '',
        actionTypeLatitude: initialAd.actionType?.latitude,
        actionTypeLongitude: initialAd.actionType?.longitude,
        locationType: initialAd.location?.type || 'pan_india',
        latitude: initialAd.location?.latitude,
        longitude: initialAd.location?.longitude,
        radius: initialAd.location?.radius,
        // Convert existing dates to Timestamps
        startDate: initialAd.startDate ? TimestampUtils.normalize(initialAd.startDate) : Timestamp.now(),
        endDate: initialAd.endDate ? TimestampUtils.normalize(initialAd.endDate) : TimestampUtils.fromNowPlusMinutes(60),
      };
    }

    // Default for new ads: start now, end in 1 hour
    return {
      title: '',
      description: '',
      adImage: null,
      existingImageUrl: undefined,
      actionTypeType: 'website',
      actionTypeValue: '',
      actionTypeLatitude: undefined,
      actionTypeLongitude: undefined,
      locationType: 'pan_india',
      latitude: undefined,
      longitude: undefined,
      radius: undefined,
      startDate: TimestampUtils.fromNowPlusMinutes(0), // Start now (rounded to 15-min interval)
      endDate: TimestampUtils.fromNowPlusMinutes(60),  // End in 1 hour
    };
  };

  const [formData, setFormData] = useState<CarosealAdFormData>(getInitialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Update a timestamp field from HTML datetime-local input
   */
  const updateTimestamp = useCallback((field: 'startDate' | 'endDate', inputValue: string) => {
    if (!inputValue) return;
    
    const timestamp = TimestampUtils.fromInputValue(inputValue);
    setFormData(prev => ({ ...prev, [field]: timestamp }));
    
    // Clear error when user updates
    if (errors[field] || errors.dateRange) {
      setErrors(prev => ({ ...prev, [field]: '', dateRange: '' }));
    }
  }, [errors]);

  /**
   * Get HTML datetime-local input value from timestamp
   */
  const getInputValue = useCallback((field: 'startDate' | 'endDate'): string => {
    return TimestampUtils.toInputValue(formData[field]);
  }, [formData]);

  /**
   * Update any form field
   */
  const updateFormField = useCallback((field: keyof CarosealAdFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  /**
   * Update location-specific fields
   */
  const updateLocation = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  }, [errors]);

  /**
   * Comprehensive form validation using Timestamps
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Basic field validation
    if (!formData.title.trim()) {
      newErrors.title = 'Ad title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Ad description is required';
    }

    if (!formData.actionTypeValue.trim()) {
      newErrors.actionTypeValue = formData.actionTypeType === 'website' 
        ? 'Website URL is required' 
        : formData.actionTypeType === 'location'
        ? 'Location name is required'
        : 'App screen name is required';
    }

    // URL validation for website type
    if (formData.actionTypeType === 'website' && formData.actionTypeValue && 
        !/^https?:\/\//.test(formData.actionTypeValue)) {
      newErrors.actionTypeValue = 'Please enter a valid website URL (must start with http:// or https://)';
    }

    // Location coordinates validation for location type
    if (formData.actionTypeType === 'location') {
      if (!formData.actionTypeLatitude || !formData.actionTypeLongitude) {
        newErrors.actionTypeValue = 'Latitude and longitude are required for location action type';
      } else if (
        formData.actionTypeLatitude < -90 || formData.actionTypeLatitude > 90 ||
        formData.actionTypeLongitude < -180 || formData.actionTypeLongitude > 180
      ) {
        newErrors.actionTypeValue = 'Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)';
      }
    }

    // Image validation (either new file or existing image for editing)
    if (!formData.adImage && !formData.existingImageUrl && !isEditing) {
      newErrors.adImage = 'Ad image is required';
    }

    // Location validation for specific type
    if (formData.locationType === 'specific') {
      if (!formData.latitude || !formData.longitude || !formData.radius || formData.radius <= 0) {
        newErrors.location = 'Latitude, longitude, and radius are required for specific location';
      }
    }

    // Timestamp validation using TimestampUtils
    const dateValidation = TimestampUtils.validateDateRange(formData.startDate, formData.endDate);
    if (!dateValidation.isValid) {
      newErrors.dateRange = dateValidation.error;
    }

    // Check if start date is in the past (allow dates from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const startDate = formData.startDate.toDate();
    
    if (startDate < today) {
      newErrors.startDate = 'Start date cannot be before today';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEditing]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
  }, [initialAd, isEditing]);

  /**
   * Get form data prepared for submission (no conversion needed!)
   */
  const getSubmissionData = useCallback(() => {
    // Prepare action type object based on type
    let actionTypeObj: any = {
      type: formData.actionTypeType,
      value: formData.actionTypeValue,
    };

    // Add coordinates for location type
    if (formData.actionTypeType === 'location') {
      actionTypeObj = {
        ...actionTypeObj,
        latitude: formData.actionTypeLatitude,
        longitude: formData.actionTypeLongitude,
      };
    }

    // Since we're using Timestamps throughout, no conversion is needed
    return {
      ...formData,
      // Location object cleanup
      location: formData.locationType === 'specific' ? {
        type: formData.locationType,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius: formData.radius,
      } : {
        type: formData.locationType,
      },
      // Action type object
      actionType: actionTypeObj,
    };
  }, [formData]);

  /**
   * Get ad status based on current timestamps
   */
  const getAdStatus = useCallback(() => {
    return TimestampUtils.getAdStatus(formData.startDate, formData.endDate);
  }, [formData.startDate, formData.endDate]);

  /**
   * Get human-readable date displays
   */
  const getDateDisplays = useCallback(() => {
    return {
      startDate: TimestampUtils.toDisplayString(formData.startDate),
      endDate: TimestampUtils.toDisplayString(formData.endDate),
      duration: `${TimestampUtils.daysBetween(formData.startDate, formData.endDate)} days`,
    };
  }, [formData.startDate, formData.endDate]);

  return {
    // Form state
    formData,
    errors,
    
    // Form manipulation
    updateTimestamp,
    updateFormField,
    updateLocation,
    setFormData,
    setErrors,
    
    // Utilities
    getInputValue,
    validateForm,
    resetForm,
    getSubmissionData,
    getAdStatus,
    getDateDisplays,
    
    // Computed values
    isValid: Object.keys(errors).length === 0,
    hasChanges: JSON.stringify(formData) !== JSON.stringify(getInitialFormData()),
  };
}; 