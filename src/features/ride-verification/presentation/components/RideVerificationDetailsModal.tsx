'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Ride } from '../../domain/entities/Ride';

interface RideVerificationDetailsModalProps {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
  onVerifyRide: (rideId: string, userId: string, reasons?: string) => void;
  onRejectRide: (rideId: string, userId: string, reasons?: string) => void;
}

export default function RideVerificationDetailsModal({
  ride,
  isOpen,
  onClose,
  onVerifyRide,
  onRejectRide,
}: RideVerificationDetailsModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReasons, setRejectReasons] = useState('');

  if (!isOpen) return null;

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleVerify = () => {
    onVerifyRide(ride.id, ride.userId);
    onClose();
  };

  const handleReject = () => {
    if (showRejectForm) {
      onRejectRide(ride.id, ride.userId, rejectReasons);
      setShowRejectForm(false);
      setRejectReasons('');
      onClose();
    } else {
      setShowRejectForm(true);
    }
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectReasons('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">
            Ride Verification Details
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ride Title</label>
                <p className="text-card-foreground">{ride.rideTitle || 'Untitled Ride'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-card-foreground">{ride.rideDescription || 'No description'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="text-card-foreground font-mono text-sm">{ride.userId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vehicle ID</label>
                <p className="text-card-foreground font-mono text-sm">{ride.vehicleId}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Distance</label>
                <p className="text-card-foreground">{formatDistance(ride.totalDistance)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Time</label>
                <p className="text-card-foreground">{formatDuration(ride.totalTime)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">GEM Coins</label>
                <p className="text-card-foreground">{ride.totalGEMCoins || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Top Speed</label>
                <p className="text-card-foreground">{ride.topSpeed ? `${ride.topSpeed} km/h` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Odometer Section */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Odometer Verification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Ride Odometer */}
              <div>
                <h4 className="text-md font-medium text-card-foreground mb-3">Before Ride</h4>
                {ride.odometer?.beforeRideOdometerImage ? (
                  <div className="space-y-2">
                    <Image
                      src={ride.odometer.beforeRideOdometerImage}
                      alt="Before ride odometer"
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <p className="text-sm text-muted-foreground">
                      Captured: {formatDate(ride.odometer.beforeRideOdometerImageCaptureAt)}
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>

              {/* After Ride Odometer */}
              <div>
                <h4 className="text-md font-medium text-card-foreground mb-3">After Ride</h4>
                {ride.odometer?.afterRideOdometerImage ? (
                  <div className="space-y-2">
                    <Image
                      src={ride.odometer.afterRideOdometerImage}
                      alt="After ride odometer"
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <p className="text-sm text-muted-foreground">
                      Captured: {formatDate(ride.odometer.afterRideOdometerImageCaptureAt)}
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                <div className="mt-1">{getStatusBadge(ride.odometer?.verificationStatus || 'pending')}</div>
              </div>
              
              {ride.odometer?.reasons && (
                <div className="max-w-md">
                  <label className="text-sm font-medium text-muted-foreground">Reasons</label>
                  <p className="text-sm text-card-foreground mt-1">{ride.odometer.reasons}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ride Memories */}
          {ride.rideMemories && ride.rideMemories.length > 0 && (
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Ride Memories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ride.rideMemories.map((memory) => (
                  <div key={memory.id} className="border border-border rounded-lg p-4">
                    <h4 className="font-medium text-card-foreground mb-2">{memory.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{memory.description}</p>
                    {memory.imageUrl && (
                      <Image
                        src={memory.imageUrl}
                        alt={memory.title}
                        width={300}
                        height={128}
                        className="w-full h-32 object-cover rounded border border-border"
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(memory.capturedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Rejection Reasons</h3>
              <textarea
                value={rejectReasons}
                onChange={(e) => setRejectReasons(e.target.value)}
                placeholder="Please provide reasons for rejecting this odometer verification..."
                className="w-full p-3 border border-border rounded-lg bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors"
          >
            Close
          </button>
          
          {ride.odometer?.verificationStatus === 'pending' && (
            <>
              {showRejectForm ? (
                <>
                  <button
                    onClick={handleCancelReject}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectReasons.trim()}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleVerify}
                    className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Verify
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
