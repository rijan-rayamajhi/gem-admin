'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/HomeLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { StorageService } from '@/lib/storageService';

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const validateForm = () => {
    // If trying to change password, validate password fields
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        showMessage('error', 'Current password is required to change password');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        showMessage('error', 'New passwords do not match');
        return false;
      }
      if (formData.newPassword.length < 6) {
        showMessage('error', 'New password must be at least 6 characters long');
        return false;
      }
    }

    // If trying to change email, validate current password
    if (formData.email !== user?.email && !formData.currentPassword) {
      showMessage('error', 'Current password is required to change email');
      return false;
    }

    return true;
  };

  const reauthenticate = async () => {
    if (!user || !user.email || !formData.currentPassword) {
      throw new Error('Current password is required for this operation');
    }

    const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
    await reauthenticateWithCredential(user, credential);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error messages when user starts typing
    if (message.type === 'error') {
      setMessage({ type: '', text: '' });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = StorageService.validateImageFile(file);
    if (!validation.isValid) {
      showMessage('error', validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setProfilePhotoFile(file);
    
    // Clear any existing error messages
    if (message.type === 'error') {
      setMessage({ type: '', text: '' });
    }
  };

  const removePhoto = () => {
    setProfilePhotoFile(null);
    setProfilePhotoPreview('');
    setPhotoUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadProfilePhoto = async (): Promise<string> => {
    if (!profilePhotoFile || !user?.uid) {
      throw new Error('Photo file and user authentication are required');
    }

    setIsUploadingPhoto(true);
    setPhotoUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setPhotoUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 150);

      const result = await StorageService.uploadProfilePicture(profilePhotoFile, user.uid);
      
      clearInterval(progressInterval);
      setPhotoUploadProgress(100);
      
      return result.url;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw new Error('Failed to upload profile photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const getCurrentPhotoUrl = () => {
    if (profilePhotoPreview) return profilePhotoPreview;
    if (user?.photoURL) return user.photoURL;
    return null;
  };

  const getDisplayInitials = () => {
    const name = formData.displayName || user?.displayName || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const needsReauth = formData.email !== user.email || formData.newPassword;
      
      // Reauthenticate if needed
      if (needsReauth) {
        await reauthenticate();
      }

      // Upload new profile photo if selected
      let photoURL = user.photoURL;
      if (profilePhotoFile) {
        photoURL = await uploadProfilePhoto();
      }

      // Update profile (display name and photo)
      const profileUpdates: any = {};
      if (formData.displayName !== user.displayName) {
        profileUpdates.displayName = formData.displayName;
      }
      if (photoURL !== user.photoURL) {
        profileUpdates.photoURL = photoURL;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(user, profileUpdates);
      }

      // Update email (requires reauthentication)
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      // Update password (requires reauthentication)
      if (formData.newPassword) {
        await updatePassword(user, formData.newPassword);
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
          currentPassword: ''
        }));
      }

      // Clear photo upload state after successful update
      if (profilePhotoFile) {
        setProfilePhotoFile(null);
        setProfilePhotoPreview('');
        setPhotoUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      showMessage('success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to update profile';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use by another account';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log back in before changing your password or email';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showMessage('error', errorMessage);
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
                <div className="flex items-start space-x-6 mb-6">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Profile Picture Display */}
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2"
                      style={{ 
                        backgroundColor: getCurrentPhotoUrl() ? 'transparent' : 'var(--color-primary-600)',
                        color: 'var(--color-text-inverse)',
                        borderColor: 'var(--color-border-medium)'
                      }}
                    >
                      {getCurrentPhotoUrl() ? (
                        <img 
                          src={getCurrentPhotoUrl()!} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-medium">{getDisplayInitials()}</span>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {isUploadingPhoto && (
                      <div className="w-24">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${photoUploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{photoUploadProgress}%</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Photo Controls */}
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleChangePhoto}
                          disabled={isUploadingPhoto}
                          className="px-4 py-2 rounded-md shadow-theme-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: 'var(--color-primary-600)',
                            color: 'var(--color-text-inverse)'
                          }}
                        >
                          {profilePhotoFile ? 'Change Photo' : (user?.photoURL ? 'Update Photo' : 'Upload Photo')}
                        </button>

                        {(profilePhotoFile || user?.photoURL) && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            disabled={isUploadingPhoto}
                            className="px-4 py-2 rounded-md shadow-theme-sm hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ 
                              backgroundColor: 'var(--color-background-secondary)',
                              color: 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border-medium)'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Photo Info */}
                      <div className="text-sm text-gray-500">
                        <p>Upload a photo to personalize your profile</p>
                        <p>Supported formats: JPEG, PNG, WebP (Max 5MB)</p>
                        {profilePhotoFile && (
                          <p className="text-blue-600 mt-1">New photo selected: {profilePhotoFile.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={isUploadingPhoto}
                    />
                  </div>
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
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      <span className="text-xs text-gray-500 ml-1">(required for email/password changes)</span>
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      <span className="text-xs text-gray-500 ml-1">(leave blank to keep current)</span>
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="w-full px-3 py-2 rounded-md shadow-theme-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    disabled={isLoading || isUploadingPhoto}
                    className="px-6 py-2 rounded-md shadow-theme-md transition-all hover:opacity-90 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: 'var(--color-primary-600)',
                      color: 'var(--color-text-inverse)'
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