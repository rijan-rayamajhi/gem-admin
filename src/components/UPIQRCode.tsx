'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface UPIQRCodeProps {
  upiId: string;
  amount?: number;
  userName?: string;
  size?: number;
  className?: string;
}

export default function UPIQRCode({ 
  upiId, 
  amount, 
  userName, 
  size = 200, 
  className = '' 
}: UPIQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      if (!upiId) return;

      try {
        setLoading(true);
        setError('');

        // Create UPI payment URL
        const upiUrl = createUPIUrl(upiId, amount, userName);
        
        // Generate QR code
        const dataUrl = await QRCode.toDataURL(upiUrl, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [upiId, amount, userName, size]);

  const createUPIUrl = (upiId: string, amount?: number, userName?: string): string => {
    // Create UPI payment URL
    const params = new URLSearchParams();
    params.append('pa', upiId); // Payee Address (UPI ID)
    params.append('pn', userName || 'User'); // Payee Name
    params.append('cu', 'INR'); // Currency
    
    if (amount) {
      params.append('am', amount.toString()); // Amount
    }

    return `upi://pay?${params.toString()}`;
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `upi-qr-${upiId.replace('@', '-')}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center text-red-600 ${className}`}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
        <img 
          src={qrDataUrl} 
          alt={`UPI QR Code for ${upiId}`}
          className="mx-auto"
        />
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-medium">{upiId}</p>
          {amount && <p>Amount: ₹{amount}</p>}
        </div>
        <button
          onClick={downloadQRCode}
          className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
        >
          Download QR
        </button>
      </div>
    </div>
  );
}
