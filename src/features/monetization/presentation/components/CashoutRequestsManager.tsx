'use client';

import { useState, useEffect } from 'react';
import { useMonetization } from '../providers/MonetizationProvider';
import { CashoutRequest, CashoutStatus } from '../../domain/entities/CashoutRequest';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import UPIQRCode from '@/components/UPIQRCode';
import MobileUPIBottomSheet from '@/components/MobileUPIBottomSheet';
import { isMobileDevice } from '@/utils/mobileUPI';

export default function CashoutRequestsManager() {
  const { 
    cashoutRequests, 
    loadingCashoutRequests, 
    loadCashoutRequests, 
    processCashoutRequest 
  } = useMonetization();
  
  const [selectedStatus, setSelectedStatus] = useState<CashoutStatus | undefined>(undefined);
  const [selectedRequest, setSelectedRequest] = useState<CashoutRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processAction, setProcessAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [showMobileUPI, setShowMobileUPI] = useState(false);
  const [selectedUPIRequest, setSelectedUPIRequest] = useState<CashoutRequest | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadCashoutRequests(selectedStatus);
  }, [selectedStatus, loadCashoutRequests]);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const handleProcessRequest = (request: CashoutRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setProcessAction(action);
    setRejectionReason('');
    setNotes('');
    setShowProcessDialog(true);
  };

  const confirmProcess = async () => {
    if (!selectedRequest || !processAction) return;

    try {
      const status = processAction === 'approve' ? CashoutStatus.APPROVED : CashoutStatus.REJECTED;
      await processCashoutRequest(
        selectedRequest.id,
        status,
        'admin', // TODO: Get actual admin user ID
        processAction === 'reject' ? rejectionReason : undefined,
        notes
      );
      setShowProcessDialog(false);
    } catch (error) {
      console.error('Failed to process request:', error);
    }
  };

  const getStatusColor = (status: CashoutStatus) => {
    switch (status) {
      case CashoutStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case CashoutStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case CashoutStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case CashoutStatus.PROCESSED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loadingCashoutRequests) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Cashout Requests</h3>
        <select
          value={selectedStatus || ''}
          onChange={(e) => setSelectedStatus(e.target.value as CashoutStatus || undefined)}
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Requests</option>
          <option value={CashoutStatus.PENDING}>Pending</option>
          <option value={CashoutStatus.APPROVED}>Approved</option>
          <option value={CashoutStatus.REJECTED}>Rejected</option>
          <option value={CashoutStatus.PROCESSED}>Processed</option>
        </select>
      </div>

      {cashoutRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No cashout requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {cashoutRequests.map((request) => (
            <div key={request.id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-card-foreground">{request.userName}</h4>
                  <p className="text-sm text-muted-foreground">User ID: {request.userId}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-card-foreground">₹{request.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium text-card-foreground">{request.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp Number</p>
                  <p className="font-medium text-card-foreground">{request.whatsappNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">UPI ID</p>
                  <p className="font-medium text-card-foreground">{request.upiId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p className="font-medium text-card-foreground">{formatDate(request.requestedAt)}</p>
                </div>
              </div>

              {request.notes && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium text-card-foreground">{request.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {isMobile ? (
                  <button
                    onClick={() => {
                      setSelectedUPIRequest(request);
                      setShowMobileUPI(true);
                    }}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Pay with UPI App
                  </button>
                ) : (
                  <button
                    onClick={() => setShowQRCode(request.upiId)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Show QR Code
                  </button>
                )}
                
                {request.status === CashoutStatus.PENDING && (
                  <>
                    <button
                      onClick={() => handleProcessRequest(request, 'approve')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleProcessRequest(request, 'reject')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

              {request.status === CashoutStatus.REJECTED && request.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Rejection Reason:</strong> {request.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Process Request Dialog */}
      <ConfirmationDialog
        isOpen={showProcessDialog}
        onClose={() => setShowProcessDialog(false)}
        onConfirm={confirmProcess}
        title={`${processAction === 'approve' ? 'Approve' : 'Reject'} Cashout Request`}
        message={
          processAction === 'approve' 
            ? `Are you sure you want to approve this cashout request for $${selectedRequest?.amount.toFixed(2)}?`
            : `Are you sure you want to reject this cashout request?`
        }
        confirmText={processAction === 'approve' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        variant={processAction === 'approve' ? 'default' : 'destructive'}
      >
        {processAction === 'reject' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Please provide a reason for rejection..."
              required
            />
          </div>
        )}
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-card-foreground mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
            placeholder="Additional notes..."
          />
        </div>
      </ConfirmationDialog>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">UPI QR Code</h3>
              <button
                onClick={() => setShowQRCode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              <UPIQRCode 
                upiId={showQRCode}
                amount={cashoutRequests.find(r => r.upiId === showQRCode)?.amount}
                userName={cashoutRequests.find(r => r.upiId === showQRCode)?.userName}
                size={250}
              />
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Scan this QR code with any UPI app to make payment</p>
                <p className="mt-1 font-medium">{showQRCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile UPI Bottom Sheet */}
      {selectedUPIRequest && (
        <MobileUPIBottomSheet
          isOpen={showMobileUPI}
          onClose={() => {
            setShowMobileUPI(false);
            setSelectedUPIRequest(null);
          }}
          upiId={selectedUPIRequest.upiId}
          amount={selectedUPIRequest.amount}
          userName={selectedUPIRequest.userName}
          transactionNote={`Payment for ${selectedUPIRequest.userName}`}
        />
      )}
    </div>
  );
}
