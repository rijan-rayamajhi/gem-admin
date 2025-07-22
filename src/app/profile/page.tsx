'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/HomeLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update display name
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
      }

      // Update email
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      // Update password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        await updatePassword(user, formData.newPassword);
      }

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Failed to update profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div style={{ background: 'var(--color-background-primary)' }} className="rounded-lg shadow-theme-lg">
            <div className="p-6">
              <h1 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold mb-6">
                Profile Settings
              </h1>

              {message.text && (
                <div 
                  className={`mb-6 p-4 rounded-lg animate-slide-in ${
                    message.type === 'success' 
                      ? 'bg-theme-success text-theme-success' 
                      : 'bg-theme-error text-theme-error'
                  }`}
                  style={{ 
                    backgroundColor: message.type === 'success' 
                      ? 'var(--color-success-500)' 
                      : 'var(--color-error-500)',
                    color: 'var(--color-text-inverse)',
                    opacity: 0.9
                  }}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-6 mb-6">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'var(--color-primary-600)',
                      color: 'var(--color-text-inverse)'
                    }}
                  >
                    <span className="text-3xl">
                      {formData.displayName ? formData.displayName[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md shadow-theme-sm"
                    style={{ 
                      backgroundColor: 'var(--color-background-secondary)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border-medium)'
                    }}
                  >
                    Change Photo
                  </button>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor="displayName" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm"
                      style={{ 
                        backgroundColor: 'var(--color-background-primary)',
                        border: '1px solid var(--color-border-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm"
                      style={{ 
                        backgroundColor: 'var(--color-background-primary)',
                        border: '1px solid var(--color-border-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-4 pt-6" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                  <h2 
                    className="text-lg font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Change Password
                  </h2>
                  
                  <div>
                    <label 
                      htmlFor="currentPassword" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm"
                      style={{ 
                        backgroundColor: 'var(--color-background-primary)',
                        border: '1px solid var(--color-border-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="newPassword" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm"
                      style={{ 
                        backgroundColor: 'var(--color-background-primary)',
                        border: '1px solid var(--color-border-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="confirmPassword" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm"
                      style={{ 
                        backgroundColor: 'var(--color-background-primary)',
                        border: '1px solid var(--color-border-medium)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 rounded-md shadow-theme-md"
                    style={{ 
                      backgroundColor: 'var(--color-primary-600)',
                      color: 'var(--color-text-inverse)',
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 