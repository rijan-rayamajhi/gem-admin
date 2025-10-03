'use client';

import React from 'react';
import { Ride } from '../../domain/entities/Ride';

interface RideVerificationTableProps {
  rides: Ride[];
  onRideClick: (ride: Ride) => void;
  onVerifyRide: (rideId: string, userId: string, reasons?: string) => void;
  onRejectRide: (rideId: string, userId: string, reasons?: string) => void;
}

export default function RideVerificationTable({
  rides,
  onRideClick,
  onVerifyRide,
  onRejectRide,
}: RideVerificationTableProps) {
  const formatDate = (timestamp: Date | { toDate?: () => Date } | string) => {
    if (!timestamp) return 'N/A';
    try {
      let date: Date;
      if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'object' && 'toDate' in timestamp && timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        return 'Invalid Date';
      }
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDistance = (distance: number) => {
    if (!distance) return 'N/A';
    return `${distance.toFixed(2)} km`;
  };

  const formatDuration = (timeInSeconds: number) => {
    if (!timeInSeconds) return 'N/A';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (rides.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">No Rides Found</h3>
        <p className="text-muted-foreground">No rides match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ride Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User/Vehicle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Distance/Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Odometer Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Started At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rides.map((ride) => (
              <tr
                key={ride.id}
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onRideClick(ride)}
              >
                <td className="px-4 py-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-card-foreground truncate">
                      {ride.rideTitle || 'Untitled Ride'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {ride.rideDescription || 'No description'}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-card-foreground">
                    <div className="truncate">User: {ride.userId}</div>
                    <div className="text-xs text-muted-foreground truncate">Vehicle: {ride.vehicleId}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-card-foreground">
                    <div>{formatDistance(ride.totalDistance)}</div>
                    <div className="text-xs text-muted-foreground">{formatDuration(ride.totalTime)}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(ride.odometer?.verificationStatus || 'pending')}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-card-foreground">
                    {formatDate(ride.startedAt)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex space-x-2">
                    {ride.odometer?.verificationStatus === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerifyRide(ride.id, ride.userId);
                          }}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRejectRide(ride.id, ride.userId);
                          }}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRideClick(ride);
                      }}
                      className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
