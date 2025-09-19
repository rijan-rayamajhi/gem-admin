'use client';

import { useState, useEffect } from 'react';
import { 
  getAvailableUPIApps, 
  openUPIApp, 
  UPI_APPS
} from '@/utils/mobileUPI';
import UPIQRCode from './UPIQRCode';

interface MobileUPIBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  upiId: string;
  amount?: number;
  userName?: string;
  transactionNote?: string;
}

export default function MobileUPIBottomSheet({
  isOpen,
  onClose,
  upiId,
  amount,
  userName,
  transactionNote
}: MobileUPIBottomSheetProps) {
  const [availableApps, setAvailableApps] = useState<typeof UPI_APPS>([]);
  const [isDetectingApps, setIsDetectingApps] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      detectAvailableApps();
    }
  }, [isOpen]);

  const detectAvailableApps = async () => {
    setIsDetectingApps(true);
    try {
      const apps = await getAvailableUPIApps();
      setAvailableApps(apps);
    } catch (error) {
      console.error('Error detecting UPI apps:', error);
      // Fallback to popular apps
      setAvailableApps([
        UPI_APPS.find(app => app.id === 'googlepay')!,
        UPI_APPS.find(app => app.id === 'phonepe')!,
        UPI_APPS.find(app => app.id === 'paytm')!
      ].filter(Boolean));
    } finally {
      setIsDetectingApps(false);
    }
  };

  const handleAppClick = (appId: string) => {
    openUPIApp(appId, upiId, amount, userName, transactionNote);
    onClose();
  };

  const handleShowQRCode = () => {
    setShowQRCode(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="px-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">Pay with UPI</h3>
              {isDetectingApps && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={detectAvailableApps}
                disabled={isDetectingApps}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Refresh UPI apps"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Payment Details */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">To:</span> {userName || 'User'}</p>
              <p><span className="font-medium">UPI ID:</span> {upiId}</p>
              {amount && <p><span className="font-medium">Amount:</span> ₹{amount}</p>}
            </div>
          </div>
        </div>
        
        {/* UPI Apps List */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {isDetectingApps ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full flex items-center p-4 bg-gray-100 border border-gray-200 rounded-xl animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : availableApps.length > 0 ? (
            <div className="space-y-3">
              {availableApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4"
                    style={{ backgroundColor: `${app.color}20` }}
                  >
                    {app.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{app.name}</h4>
                    <p className="text-sm text-gray-500">Open {app.name}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No UPI Apps Detected</h4>
              <p className="text-sm text-gray-500 mb-4">
                We couldn&apos;t detect any UPI apps on your device. You can still copy the payment link below.
              </p>
              <button
                onClick={detectAvailableApps}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Show QR Code Option */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleShowQRCode}
              className="w-full flex items-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl mr-4">
                📱
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Show QR Code</h4>
                <p className="text-sm text-gray-500">Scan QR code with any UPI app</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Select your preferred UPI app to complete the payment
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">UPI QR Code</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              <UPIQRCode 
                upiId={upiId}
                amount={amount}
                userName={userName}
                size={250}
              />
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Scan this QR code with any UPI app to make payment</p>
                <p className="mt-1 font-medium">{upiId}</p>
                {amount && (
                  <p className="mt-1 text-lg font-bold text-gray-900">₹{amount}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
