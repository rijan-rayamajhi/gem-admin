'use client';

import { useState } from 'react';
import Image from 'next/image';
import { VehicleVerification } from '../../domain/entities/VehicleVerification';
import { VehicleVerificationStatus, VehicleVerificationStatusLabels, VehicleVerificationStatusColors } from '../../domain/entities/VehicleVerificationStatus';
import { useVehicleVerification } from '../providers/VehicleVerificationProvider';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// Vehicle Image Component with error handling
function VehicleImage({ image, alt }: { image: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Image loaded successfully:', image);
    console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
    console.log('Image complete:', e.currentTarget.complete);
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', image, e);
    setImageError(true);
    setImageLoading(false);
  };

  if (imageError) {
    return (
      <div className="w-full h-48 bg-muted rounded-lg border border-border flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs text-muted-foreground">Failed to load image</p>
          <button
            onClick={() => window.open(image, '_blank')}
            className="mt-2 text-xs text-primary hover:text-primary/80 underline"
          >
            Open in new tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-48 bg-white rounded-lg border border-border overflow-hidden">
      {/* Loading state */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Loading image...</p>
          </div>
        </div>
      )}
      
      {/* Image */}
      <Image
        src={image}
        alt={alt}
        width={400}
        height={192}
        className={`w-full h-48 object-contain bg-white transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          backgroundColor: 'white',
          minHeight: '192px', // 48 * 4 (h-48 = 12rem = 192px)
        }}
      />
      
      {/* Overlay with open button */}
      {!imageLoading && !imageError && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
          <button
            onClick={() => window.open(image, '_blank')}
            className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 p-2 rounded-full transition-all hover:bg-opacity-100"
            title="Open image in new tab"
          >
            <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

interface VehicleVerificationDetailsModalProps {
  vehicleVerification: VehicleVerification;
  onClose: () => void;
}

export default function VehicleVerificationDetailsModal({
  vehicleVerification,
  onClose,
}: VehicleVerificationDetailsModalProps) {
  const { updateVehicleVerificationStatus } = useVehicleVerification();
  const [showStatusUpdateConfirm, setShowStatusUpdateConfirm] = useState<VehicleVerificationStatus | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<'slides' | 'insurance' | 'front' | 'back' | 'rc'>('slides');

  const handleStatusUpdate = async (status: VehicleVerificationStatus) => {
    setShowStatusUpdateConfirm(status);
  };

  const handleStatusUpdateConfirm = async () => {
    if (showStatusUpdateConfirm) {
      await updateVehicleVerificationStatus(vehicleVerification.id, showStatusUpdateConfirm);
      setShowStatusUpdateConfirm(null);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getImageTabs = () => {
    const tabs = [];
    
    if (vehicleVerification.vehicleSlideImages && vehicleVerification.vehicleSlideImages.length > 0) {
      tabs.push({ key: 'slides', label: 'Slides', count: vehicleVerification.vehicleSlideImages.length });
    }
    if (vehicleVerification.vehicleInsuranceImage) {
      tabs.push({ key: 'insurance', label: 'Insurance', count: 1 });
    }
    if (vehicleVerification.vehicleFrontImage) {
      tabs.push({ key: 'front', label: 'Front', count: 1 });
    }
    if (vehicleVerification.vehicleBackImage) {
      tabs.push({ key: 'back', label: 'Back', count: 1 });
    }
    if (vehicleVerification.vehicleRCFrontImage || vehicleVerification.vehicleRCBackImage) {
      tabs.push({ key: 'rc', label: 'RC', count: (vehicleVerification.vehicleRCFrontImage ? 1 : 0) + (vehicleVerification.vehicleRCBackImage ? 1 : 0) });
    }
    
    return tabs;
  };

  const getCurrentImages = () => {
    switch (activeImageTab) {
      case 'slides':
        return vehicleVerification.vehicleSlideImages || [];
      case 'insurance':
        return vehicleVerification.vehicleInsuranceImage ? [vehicleVerification.vehicleInsuranceImage] : [];
      case 'front':
        return vehicleVerification.vehicleFrontImage ? [vehicleVerification.vehicleFrontImage] : [];
      case 'back':
        return vehicleVerification.vehicleBackImage ? [vehicleVerification.vehicleBackImage] : [];
      case 'rc':
        return [
          ...(vehicleVerification.vehicleRCFrontImage ? [vehicleVerification.vehicleRCFrontImage] : []),
          ...(vehicleVerification.vehicleRCBackImage ? [vehicleVerification.vehicleRCBackImage] : [])
        ];
      default:
        return [];
    }
  };

  const imageTabs = getImageTabs();
  const currentImages = getCurrentImages();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">
                Vehicle Verification Details
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {vehicleVerification.vehicleBrandName} {vehicleVerification.vehicleModelName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-card-foreground transition-colors"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Vehicle Information</h3>
                
                {/* User Information */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Vehicle Owner</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-sm">
                        {(vehicleVerification.userDisplayName || vehicleVerification.userEmail || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-card-foreground">
                        {vehicleVerification.userDisplayName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicleVerification.userEmail || 'No email available'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        User ID: {vehicleVerification.userId}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {vehicleVerification.vehicleBrandImage && (
                      <Image
                        className="h-12 w-12 rounded-lg object-cover"
                        src={vehicleVerification.vehicleBrandImage}
                        alt={vehicleVerification.vehicleBrandName}
                        width={48}
                        height={48}
                      />
                    )}
                    <div>
                      <div className="font-medium text-card-foreground">
                        {vehicleVerification.vehicleBrandName} {vehicleVerification.vehicleModelName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicleVerification.vehicleType}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                      <p className="text-card-foreground font-mono">{vehicleVerification.vehicleRegistrationNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tyre Type</label>
                      <p className="text-card-foreground">{vehicleVerification.vehicleTyreType}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${VehicleVerificationStatusColors[vehicleVerification.verificationStatus]}`}>
                        {VehicleVerificationStatusLabels[vehicleVerification.verificationStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-card-foreground">{formatDate(vehicleVerification.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Updated</label>
                      <p className="text-card-foreground">{formatDate(vehicleVerification.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                {vehicleVerification.verificationStatus === VehicleVerificationStatus.PENDING && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Verification Actions</h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleStatusUpdate(VehicleVerificationStatus.VERIFIED)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verify Vehicle
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(VehicleVerificationStatus.REJECTED)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Vehicle Images</h3>
                
                {imageTabs.length > 0 ? (
                  <>
                    {/* Image Tabs */}
                    <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                      {imageTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveImageTab(tab.key as 'slides' | 'insurance' | 'front' | 'back' | 'rc')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeImageTab === tab.key
                              ? 'bg-card text-card-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-card-foreground'
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>

                    {/* Images Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentImages.map((image, index) => (
                        <VehicleImage key={index} image={image} alt={`${activeImageTab} ${index + 1}`} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No images available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!showStatusUpdateConfirm}
        onClose={() => setShowStatusUpdateConfirm(null)}
        onConfirm={handleStatusUpdateConfirm}
        title="Update Verification Status"
        message={`Are you sure you want to ${showStatusUpdateConfirm === VehicleVerificationStatus.VERIFIED ? 'verify' : 'reject'} this vehicle verification?`}
        confirmText={showStatusUpdateConfirm === VehicleVerificationStatus.VERIFIED ? 'Verify' : 'Reject'}
        cancelText="Cancel"
        variant={showStatusUpdateConfirm === VehicleVerificationStatus.VERIFIED ? 'default' : 'destructive'}
      />
    </>
  );
}

