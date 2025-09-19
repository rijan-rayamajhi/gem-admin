'use client';

import React, { useState, useEffect } from 'react';
import { useDrivingLicense } from '../providers/DrivingLicenseProvider';
import { DrivingLicense, VerificationStatus, DrivingLicenseUpdate } from '../../domain/entities/DrivingLicense';

interface DrivingLicenseDetailsModalProps {
  licenseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DrivingLicenseDetailsModal({ licenseId, isOpen, onClose }: DrivingLicenseDetailsModalProps) {
  const { drivingLicenses, updateDrivingLicense, loading } = useDrivingLicense();
  const [license, setLicense] = useState<DrivingLicense | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<VerificationStatus>(VerificationStatus.PENDING);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && licenseId) {
      const foundLicense = drivingLicenses.find(l => l.id === licenseId);
      if (foundLicense) {
        setLicense(foundLicense);
        setNewStatus(foundLicense.verificationStatus);
        setRejectionReason(foundLicense.rejectionReason || '');
        setNotes(foundLicense.notes || '');
      }
    }
  }, [isOpen, licenseId, drivingLicenses]);

  const handleStatusUpdate = async () => {
    if (!license) return;

    setIsUpdating(true);
    try {
      const update: DrivingLicenseUpdate = {
        id: license.id,
        verificationStatus: newStatus,
        rejectionReason: newStatus === VerificationStatus.REJECTED ? rejectionReason : undefined,
        notes: notes.trim() || undefined,
        reviewedBy: 'Admin', // You might want to get this from auth context
      };

      await updateDrivingLicense(update);
      setLicense({
        ...license,
        verificationStatus: newStatus,
        rejectionReason: newStatus === VerificationStatus.REJECTED ? rejectionReason : undefined,
        notes: notes.trim() || undefined,
        reviewedAt: new Date(),
        reviewedBy: 'Admin',
      });
    } catch (error) {
      console.error('Failed to update license status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen || !license) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">Driving License Details</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-card-foreground transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* License Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">License Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User</label>
                    <p className="text-card-foreground">{license.userDisplayName}</p>
                    <p className="text-sm text-muted-foreground">{license.userEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Type</label>
                    <p className="text-card-foreground">{license.licenseType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-card-foreground">{formatDate(license.dob)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      license.verificationStatus === VerificationStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                      license.verificationStatus === VerificationStatus.VERIFIED ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {license.verificationStatus.charAt(0).toUpperCase() + license.verificationStatus.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                    <p className="text-card-foreground">{formatDate(license.submittedAt)}</p>
                  </div>
                  {license.reviewedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reviewed</label>
                      <p className="text-card-foreground">{formatDate(license.reviewedAt)}</p>
                      {license.reviewedBy && (
                        <p className="text-sm text-muted-foreground">by {license.reviewedBy}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Images and Actions */}
            <div className="space-y-6">
              {/* Images */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">License Images</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Front Image</label>
                    <div className="border border-border rounded-lg p-4 bg-muted/50">
                      {license.frontImagePath ? (
                        <img
                          src={license.frontImagePath}
                          alt="License front"
                          className="w-full h-48 object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`text-center text-muted-foreground ${license.frontImagePath ? 'hidden' : ''}`}>
                        <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Front image not available</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Back Image</label>
                    <div className="border border-border rounded-lg p-4 bg-muted/50">
                      {license.backImagePath ? (
                        <img
                          src={license.backImagePath}
                          alt="License back"
                          className="w-full h-48 object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`text-center text-muted-foreground ${license.backImagePath ? 'hidden' : ''}`}>
                        <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Back image not available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Update Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as VerificationStatus)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value={VerificationStatus.PENDING}>Pending</option>
                      <option value={VerificationStatus.VERIFIED}>Verified</option>
                      <option value={VerificationStatus.REJECTED}>Rejected</option>
                    </select>
                  </div>

                  {newStatus === VerificationStatus.REJECTED && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Rejection Reason</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || loading}
                    className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Notes/Rejection Reason */}
          {(license.rejectionReason || license.notes) && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Review Details</h3>
              <div className="space-y-3">
                {license.rejectionReason && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
                    <p className="text-card-foreground bg-red-50 border border-red-200 rounded-lg p-3">
                      {license.rejectionReason}
                    </p>
                  </div>
                )}
                {license.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-card-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {license.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
