'use client';

import { useState } from 'react';
import { BusinessUser } from '@/lib/businessUserService';

interface DeleteBusinessUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessUser: BusinessUser | null;
  onDelete: () => Promise<void>;
}

export default function DeleteBusinessUserModal({
  isOpen,
  onClose,
  businessUser,
  onDelete,
}: DeleteBusinessUserModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting business user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !businessUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Delete Business User</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Business Details:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Name:</span> {businessUser.businessName}</p>
              <p><span className="font-medium">Email:</span> {businessUser.personalInfo.email}</p>
              <p><span className="font-medium">Phone:</span> {businessUser.personalInfo.phoneNumber}</p>
              <p><span className="font-medium">Category:</span> {
                businessUser.isOtherCategory 
                  ? businessUser.selectedOtherCategoryName 
                  : businessUser.selectedCategoryName
              }</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete Business User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 