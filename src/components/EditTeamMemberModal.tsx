'use client';

import { useState, useEffect } from 'react';
import { updateTeamMember, TeamMember } from '@/lib/teamService';

interface EditTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teamMember: TeamMember | null;
}

const roles = [
  { id: 'admin', name: 'Admin', description: 'Full access to all features and system settings', color: 'bg-red-100 text-red-800' },
  { id: 'manager', name: 'Manager', description: 'Manage teams, projects, and oversee operations', color: 'bg-blue-100 text-blue-800' },
  { id: 'developer', name: 'Developer', description: 'Access to development tools and technical features', color: 'bg-green-100 text-green-800' },
  { id: 'analyst', name: 'Analyst', description: 'View analytics, reports, and data insights', color: 'bg-purple-100 text-purple-800' },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to view information', color: 'bg-gray-100 text-gray-800' },
];

const departments = [
  'Engineering',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
  'Product Management',
  'Design',
  'Quality Assurance',
  'Research & Development',
  'Legal',
  'Other'
];

const accessPermissions = [
  { id: 'home', name: 'Home', description: 'Access to main home page and overview', icon: '📊' },
  { id: 'team', name: 'Team Management', description: 'Manage team members and their roles', icon: '👥' },
  { id: 'rewards', name: 'Flash Rewards', description: 'Manage promotional offers and discounts', icon: '🎁' },
  { id: 'vehicles', name: 'Vehicle Brands', description: 'Manage vehicle brands and manufacturers', icon: '🚗' },
  { id: 'analytics', name: 'Analytics', description: 'View analytics, reports, and insights', icon: '📈' },
  { id: 'settings', name: 'Settings', description: 'Access to system settings and configuration', icon: '⚙️' },
  { id: 'users', name: 'User Management', description: 'Manage user accounts and permissions', icon: '👤' },
  { id: 'reports', name: 'Reports', description: 'Generate and view detailed reports', icon: '📋' },
];

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  department: string;
  position: string;
  startDate: string;
  salary: string;
  selectedPermissions: string[];
  notes: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

export default function EditTeamMemberModal({ isOpen, onClose, onSuccess, teamMember }: EditTeamMemberModalProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'viewer',
    department: '',
    position: '',
    startDate: '',
    salary: '',
    selectedPermissions: [],
    notes: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when team member changes
  useEffect(() => {
    if (teamMember) {
      setFormData({
        firstName: teamMember.firstName,
        lastName: teamMember.lastName,
        phone: teamMember.phone,
        role: teamMember.role,
        department: teamMember.department,
        position: teamMember.position,
        startDate: teamMember.startDate,
        salary: teamMember.salary,
        selectedPermissions: teamMember.permissions,
        notes: teamMember.notes,
        status: teamMember.status,
      });
    }
  }, [teamMember]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!teamMember?.id) {
      setError('Team member ID is missing');
      setLoading(false);
      return;
    }

    try {
      // Update team member in Firestore
      await updateTeamMember(teamMember.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        startDate: formData.startDate,
        salary: formData.salary,
        permissions: formData.selectedPermissions,
        notes: formData.notes,
        status: formData.status,
      });

      console.log('Team member updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating team member:', error);
      setError('Failed to update team member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !teamMember) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Team Member</h2>
              <p className="text-sm text-gray-600">Update {teamMember.firstName} {teamMember.lastName}&apos;s information</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={teamMember.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Role & Position */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Role & Position</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {roles.find(r => r.id === formData.role)?.description}
                  </p>
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Developer"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Annual salary"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Access Permissions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Access Permissions</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select the permissions this team member should have access to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {accessPermissions.map((permission) => (
                  <label key={permission.id} className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{permission.icon}</span>
                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes about this team member..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Team Member'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 