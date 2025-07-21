'use client';

import { useState, useEffect } from 'react';
import { UserInterest } from '@/lib/userInterestService';

interface AddUserInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interest: Omit<UserInterest, 'id'>) => Promise<void>;
  editingInterest?: UserInterest | null;
}

const interestCategories = [
  { value: 'Vehicle Type', hint: 'SUV, Sedan, Sports Car, Electric Vehicle, etc.' },
  { value: 'Usage & Activities', hint: 'Daily Commute, Off-roading, Racing, Family Trips, etc.' },
  { value: 'Technology & Innovation', hint: 'Autonomous Driving, Electric Vehicles, Smart Features, etc.' },
  { value: 'Brand Enthusiasts', hint: 'BMW, Tesla, Toyota, Mercedes, etc.' },
  { value: 'Maintenance & Styling', hint: 'Car Modifications, Detailing, Performance Upgrades, etc.' },
  { value: 'Purpose / Lifestyle', hint: 'Business, Family, Adventure, Luxury, Eco-friendly, etc.' },
  { value: 'Community & Social Interests', hint: 'Car Clubs, Meetups, Events, Social Groups, etc.' },
  { value: 'Regional Preferences', hint: 'City Driving, Mountain Roads, Coastal Areas, etc.' },
  { value: 'Interest-Based Personalization', hint: 'Customization Preferences, Personal Style, etc.' },
  { value: 'Achievements & Recognition', hint: 'Awards, Milestones, Certifications, etc.' }
];

export default function AddUserInterestModal({
  isOpen,
  onClose,
  onSave,
  editingInterest
}: AddUserInterestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingInterest) {
      setFormData({
        name: editingInterest.name,
        description: editingInterest.description,
        category: editingInterest.category,
        isActive: editingInterest.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        isActive: true
      });
    }
    setErrors({});
  }, [editingInterest, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Interest name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    if (formData.description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving interest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingInterest ? 'Edit Interest' : 'Add New Interest'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Football, Technology, Fashion"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {interestCategories.map((category) => (
                <option key={category.value} value={category.value} title={category.hint}>
                  {category.value}
                </option>
              ))}
            </select>
            {formData.category && (
              <p className="text-xs text-gray-500 mt-1">
                {interestCategories.find(cat => cat.value === formData.category)?.hint}
              </p>
            )}
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe this interest..."
              maxLength={200}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>



          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (editingInterest ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 