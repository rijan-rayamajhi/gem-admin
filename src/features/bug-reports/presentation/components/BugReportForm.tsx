'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useBugReport } from '../providers/BugReportProvider';
import { CreateBugReportRequest } from '../../domain/usecases/CreateBugReportUseCase';

interface BugReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BugReportForm({ isOpen, onClose, onSuccess }: BugReportFormProps) {
  const { user } = useAuth();
  const { createBugReport, loading } = useBugReport();
  
  const [formData, setFormData] = useState<Partial<CreateBugReportRequest>>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    severity: 'medium',
    stepsToReproduce: '',
    deviceInfo: '',
    rewardAmount: 0,
    screenshots: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'UI/UX Issue',
    'Functionality Bug',
    'Performance Issue',
    'Security Issue',
    'Data Issue',
    'Integration Issue',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const severities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // For now, we'll just store file names. In a real app, you'd upload to cloud storage
    const fileNames = files.map(file => file.name);
    setFormData(prev => ({
      ...prev,
      screenshots: [...(prev.screenshots || []), ...fileNames]
    }));
  };

  const removeScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category?.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.rewardAmount !== undefined && formData.rewardAmount < 0) {
      newErrors.rewardAmount = 'Reward amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.uid) {
      return;
    }

    try {
      const request: CreateBugReportRequest = {
        userId: user.uid,
        title: formData.title!,
        description: formData.description!,
        category: formData.category!,
        priority: formData.priority as 'low' | 'medium' | 'high' | 'critical',
        severity: formData.severity as 'low' | 'medium' | 'high' | 'critical',
        screenshots: formData.screenshots || [],
        stepsToReproduce: formData.stepsToReproduce,
        deviceInfo: formData.deviceInfo,
        rewardAmount: formData.rewardAmount || 0
      };

      await createBugReport(request);
      onSuccess();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        severity: 'medium',
        stepsToReproduce: '',
        deviceInfo: '',
        rewardAmount: 0,
        screenshots: []
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating bug report:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-card-foreground">Report a Bug</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-card-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.title ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Brief description of the bug"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.description ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Detailed description of the bug"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Category and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-card-foreground mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.category ? 'border-destructive' : 'border-border'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-card-foreground mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Severity and Reward Amount Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-card-foreground mb-2">
                    Severity
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {severities.map(severity => (
                      <option key={severity.value} value={severity.value}>{severity.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="rewardAmount" className="block text-sm font-medium text-card-foreground mb-2">
                    Reward Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="rewardAmount"
                    name="rewardAmount"
                    value={formData.rewardAmount}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.rewardAmount ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="0"
                  />
                  {errors.rewardAmount && (
                    <p className="mt-1 text-sm text-destructive">{errors.rewardAmount}</p>
                  )}
                </div>
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-card-foreground mb-2">
                  Steps to Reproduce
                </label>
                <textarea
                  id="stepsToReproduce"
                  name="stepsToReproduce"
                  value={formData.stepsToReproduce}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
                />
              </div>

              {/* Device Info */}
              <div>
                <label htmlFor="deviceInfo" className="block text-sm font-medium text-card-foreground mb-2">
                  Device Information
                </label>
                <input
                  type="text"
                  id="deviceInfo"
                  name="deviceInfo"
                  value={formData.deviceInfo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., iPhone 14, Chrome 120, iOS 16"
                />
              </div>

              {/* Screenshots */}
              <div>
                <label htmlFor="screenshots" className="block text-sm font-medium text-card-foreground mb-2">
                  Screenshots
                </label>
                <input
                  type="file"
                  id="screenshots"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                {formData.screenshots && formData.screenshots.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Uploaded files:</p>
                    <div className="space-y-1">
                      {formData.screenshots.map((screenshot, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted rounded px-2 py-1">
                          <span className="text-sm text-card-foreground">{screenshot}</span>
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
