'use client';

import { useState } from 'react';
import Image from 'next/image';
import { VehicleVerification } from '../../domain/entities/VehicleVerification';
import { VehicleVerificationStatus, VehicleVerificationStatusLabels, VehicleVerificationStatusColors } from '../../domain/entities/VehicleVerificationStatus';
import { useVehicleVerification } from '../providers/VehicleVerificationProvider';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface VehicleVerificationTableProps {
  vehicleVerifications: VehicleVerification[];
  loading: boolean;
  onVehicleVerificationSelect: (vehicleVerification: VehicleVerification) => void;
}

export default function VehicleVerificationTable({
  vehicleVerifications,
  loading,
  onVehicleVerificationSelect,
}: VehicleVerificationTableProps) {
  const { updateVehicleVerificationStatus, deleteVehicleVerification } = useVehicleVerification();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showStatusUpdateConfirm, setShowStatusUpdateConfirm] = useState<{
    id: string;
    status: VehicleVerificationStatus;
  } | null>(null);

  const handleStatusUpdate = async (id: string, status: VehicleVerificationStatus) => {
    setShowStatusUpdateConfirm({ id, status });
  };

  const handleStatusUpdateConfirm = async () => {
    if (showStatusUpdateConfirm) {
      await updateVehicleVerificationStatus(showStatusUpdateConfirm.id, showStatusUpdateConfirm.status);
      setShowStatusUpdateConfirm(null);
    }
  };

  const handleDelete = async (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      await deleteVehicleVerification(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading vehicle verifications...</span>
        </div>
      </div>
    );
  }

  if (vehicleVerifications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-card-foreground">No vehicle verifications</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No vehicle verification requests found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User & Vehicle Details
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {vehicleVerifications.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {vehicle.vehicleBrandImage ? (
                          <Image
                            className="h-10 w-10 rounded-lg object-cover"
                            src={vehicle.vehicleBrandImage}
                            alt={vehicle.vehicleBrandName}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-card-foreground">
                          {vehicle.vehicleBrandName} {vehicle.vehicleModelName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {vehicle.vehicleType}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Owner: {vehicle.userDisplayName || vehicle.userEmail || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-card-foreground font-mono">
                      {vehicle.vehicleRegistrationNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.vehicleTyreType}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${VehicleVerificationStatusColors[vehicle.verificationStatus]}`}>
                      {VehicleVerificationStatusLabels[vehicle.verificationStatus]}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(vehicle.createdAt)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onVehicleVerificationSelect(vehicle)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="View Details"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {vehicle.verificationStatus === VehicleVerificationStatus.PENDING && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(vehicle.id, VehicleVerificationStatus.VERIFIED)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Verify Vehicle"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(vehicle.id, VehicleVerificationStatus.REJECTED)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Reject Verification"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!showStatusUpdateConfirm}
        onClose={() => setShowStatusUpdateConfirm(null)}
        onConfirm={handleStatusUpdateConfirm}
        title="Update Verification Status"
        message={`Are you sure you want to ${showStatusUpdateConfirm?.status === VehicleVerificationStatus.VERIFIED ? 'verify' : 'reject'} this vehicle verification?`}
        confirmText={showStatusUpdateConfirm?.status === VehicleVerificationStatus.VERIFIED ? 'Verify' : 'Reject'}
        cancelText="Cancel"
        variant={showStatusUpdateConfirm?.status === VehicleVerificationStatus.VERIFIED ? 'default' : 'destructive'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle Verification"
        message="Are you sure you want to delete this vehicle verification? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
