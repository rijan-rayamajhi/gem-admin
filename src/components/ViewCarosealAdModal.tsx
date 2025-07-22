'use client';

import { CarosealAd } from '@/lib/carosealAdService';
import { TimestampUtils } from '@/lib/timestampUtils';
import { useState } from 'react';

interface ViewCarosealAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: CarosealAd | null;
  onStatusChange?: (adId: string, newStatus: CarosealAd['status']) => Promise<void>;
}

export default function ViewCarosealAdModal({ isOpen, onClose, ad, onStatusChange }: ViewCarosealAdModalProps) {
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  
  if (!isOpen || !ad) return null;

  // Get computed status and display information
  const computedStatus = TimestampUtils.getAdStatus(ad.startDate, ad.endDate);
  const duration = TimestampUtils.daysBetween(ad.startDate, ad.endDate);
  const isCurrentlyActive = TimestampUtils.isActive(ad.startDate, ad.endDate);

  // Handle status change in modal
  const handleStatusChange = async (newStatus: CarosealAd['status']) => {
    if (!onStatusChange || !ad.id) return;
    
    setStatusChangeLoading(true);
    try {
      await onStatusChange(ad.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Ad Details</h2>
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
        
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{ad.title}</h1>
              <div className="flex items-center space-x-3 flex-wrap">
                {/* Database Status with Dropdown */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    ad.status === 'active' ? 'bg-green-100 text-green-800' : 
                    ad.status === 'expired' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </span>
                  
                  {/* Status Change Dropdown */}
                  {onStatusChange && (
                    <select
                      value={ad.status}
                      onChange={(e) => handleStatusChange(e.target.value as CarosealAd['status'])}
                      disabled={statusChangeLoading}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="active">Set Active</option>
                      <option value="inactive">Set Inactive</option>
                      <option value="expired">Set Expired</option>
                    </select>
                  )}
                  
                  {/* Loading indicator */}
                  {statusChangeLoading && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border border-blue-600 border-t-transparent"></div>
                      <span className="text-sm">Updating...</span>
                    </div>
                  )}
                </div>
                
                {/* Computed Status (if different) */}
                {computedStatus !== ad.status && (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">Real-time:</span>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      computedStatus === 'active' ? 'bg-blue-100 text-blue-800' : 
                      computedStatus === 'expired' ? 'bg-orange-100 text-orange-800' : 
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {computedStatus.charAt(0).toUpperCase() + computedStatus.slice(1)}
                    </span>
                  </div>
                )}

                {/* Live indicator for currently active ads */}
                {isCurrentlyActive && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    Live
                  </span>
                )}
              </div>
            </div>
            {ad.adImage && (
              <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={ad.adImage}
                  alt="Ad"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDQwSDYwVjYwSDQwVjQwWiIgZmlsbD0iI0QxRDVEMyIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{ad.description}</p>
          </div>

          {/* Ad Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schedule Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Start Date & Time:</span>
                  <p className="text-gray-900">{TimestampUtils.toDisplayString(ad.startDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">End Date & Time:</span>
                  <p className="text-gray-900">{TimestampUtils.toDisplayString(ad.endDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Duration:</span>
                  <p className="text-gray-900">{duration} {duration === 1 ? 'day' : 'days'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Time Remaining:</span>
                  <p className="text-gray-900">
                    {computedStatus === 'expired' 
                      ? 'Expired' 
                      : computedStatus === 'upcoming'
                      ? `Starts in ${TimestampUtils.daysBetween(TimestampUtils.normalize(new Date()), ad.startDate)} days`
                      : `Ends in ${TimestampUtils.daysBetween(TimestampUtils.normalize(new Date()), ad.endDate)} days`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Action Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Action Type:</span>
                  <p className="text-gray-900 capitalize">
                    {ad.actionType.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    {ad.actionType.type === 'website' ? 'Website URL:' : 
                     ad.actionType.type === 'location' ? 'Location:' : 'App Screen:'}
                  </span>
                  {ad.actionType.type === 'website' ? (
                    <a 
                      href={ad.actionType.value} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 underline block"
                    >
                      {ad.actionType.value}
                    </a>
                  ) : ad.actionType.type === 'location' ? (
                    <div className="space-y-2">
                      <p className="text-gray-900 font-medium">{ad.actionType.value}</p>
                      <div className="text-sm text-gray-600">
                        <p>Latitude: {ad.actionType.latitude}</p>
                        <p>Longitude: {ad.actionType.longitude}</p>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <a
                          href={`https://www.google.com/maps?q=${ad.actionType.latitude},${ad.actionType.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Open in Google Maps
                        </a>
                        <a
                          href={`https://maps.apple.com/?q=${ad.actionType.latitude},${ad.actionType.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Open in Apple Maps
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900">{ad.actionType.value}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Targeting Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Location Visibility</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Targeting Type:</span>
                  <p className="text-gray-900 capitalize">
                    {ad.location.type.replace('_', ' ')}
                  </p>
                </div>
                {ad.location.type === 'specific' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Latitude:</span>
                        <p className="text-sm text-gray-900">{ad.location.latitude}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Longitude:</span>
                        <p className="text-sm text-gray-900">{ad.location.longitude}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Radius:</span>
                      <p className="text-gray-900">{ad.location.radius} km</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Image Preview (if not shown in header) */}
          {ad.adImage && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Ad Image</h3>
              <div className="max-w-md">
                <img
                  src={ad.adImage}
                  alt="Ad Preview"
                  className="w-full rounded-lg border border-gray-200 shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDQwSDYwVjYwSDQwVjQwWiIgZmlsbD0iI0QxRDVEMyIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <p className="text-gray-900">{TimestampUtils.toDisplayString(ad.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Updated:</span>
                <p className="text-gray-900">{TimestampUtils.toDisplayString(ad.updatedAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Ad ID:</span>
                <p className="text-gray-900 font-mono text-xs">{ad.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status Sync:</span>
                <p className="text-gray-900">
                  {computedStatus === ad.status ? (
                    <span className="text-green-600">✓ Synchronized</span>
                  ) : (
                    <span className="text-orange-600">⚠ Needs Update</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 