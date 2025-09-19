'use client';

import { useState, useEffect } from 'react';
import { 
  getAvailableUPIApps, 
  openUPIApp, 
  createMobileUPIUrl 
} from '@/utils/mobileUPI';

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
  const [availableApps, setAvailableApps] = useState(getAvailableUPIApps());

  useEffect(() => {
    setAvailableApps(getAvailableUPIApps());
  }, []);

  const handleAppClick = (appId: string) => {
    openUPIApp(appId, upiId, amount, userName, transactionNote);
    onClose();
  };

  const copyUPIUrl = () => {
    const upiUrl = createMobileUPIUrl(upiId, amount, userName, transactionNote);
    navigator.clipboard.writeText(upiUrl);
    // You could add a toast notification here
    alert('UPI URL copied to clipboard!');
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
            <h3 className="text-lg font-semibold text-gray-900">Pay with UPI</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
          
          {/* Copy UPI URL Option */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={copyUPIUrl}
              className="w-full flex items-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl mr-4">
                📋
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Copy UPI Link</h4>
                <p className="text-sm text-gray-500">Copy payment link to share</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
    </>
  );
}
