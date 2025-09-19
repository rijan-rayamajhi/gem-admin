import QRCode from 'qrcode';

/**
 * Generate a QR code for UPI payment
 * @param upiId - The UPI ID (e.g., 'user@paytm')
 * @param amount - Optional amount to pre-fill
 * @param userName - Optional user name
 * @param size - QR code size in pixels (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateUPIQRCode(
  upiId: string,
  amount?: number,
  userName?: string,
  size: number = 200
): Promise<string> {
  if (!upiId) {
    throw new Error('UPI ID is required');
  }

  // Create UPI payment URL
  const upiUrl = createUPIUrl(upiId, amount, userName);
  
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Create UPI payment URL
 * @param upiId - The UPI ID
 * @param amount - Optional amount
 * @param userName - Optional user name
 * @returns UPI payment URL string
 */
export function createUPIUrl(upiId: string, amount?: number, userName?: string): string {
  const params = new URLSearchParams();
  params.append('pa', upiId); // Payee Address (UPI ID)
  params.append('pn', userName || 'User'); // Payee Name
  params.append('cu', 'INR'); // Currency
  
  if (amount && amount > 0) {
    params.append('am', amount.toString()); // Amount
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Download QR code as PNG file
 * @param qrCodeDataUrl - Data URL of the QR code
 * @param filename - Optional filename (default: 'upi-qr-code.png')
 */
export function downloadQRCode(qrCodeDataUrl: string, filename?: string): void {
  if (!qrCodeDataUrl) {
    throw new Error('QR code data URL is required');
  }

  const link = document.createElement('a');
  link.download = filename || 'upi-qr-code.png';
  link.href = qrCodeDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate and download QR code in one step
 * @param upiId - The UPI ID
 * @param amount - Optional amount
 * @param userName - Optional user name
 * @param filename - Optional filename
 */
export async function generateAndDownloadUPIQRCode(
  upiId: string,
  amount?: number,
  userName?: string,
  filename?: string
): Promise<void> {
  try {
    const qrCodeDataUrl = await generateUPIQRCode(upiId, amount, userName);
    const defaultFilename = `upi-qr-${upiId.replace('@', '-')}.png`;
    downloadQRCode(qrCodeDataUrl, filename || defaultFilename);
  } catch (error) {
    console.error('Error generating and downloading QR code:', error);
    throw error;
  }
}

/**
 * Example usage and test function
 */
export async function testQRCodeGeneration(): Promise<string> {
  try {
    console.log('Testing QR code generation...');
    
    const testUPIId = 'test@upi';
    const testAmount = 100;
    const testUserName = 'Test User';
    
    // Generate QR code
    const qrCodeDataUrl = await generateUPIQRCode(testUPIId, testAmount, testUserName);
    console.log('QR code generated successfully:', qrCodeDataUrl.substring(0, 50) + '...');
    
    // Create UPI URL
    const upiUrl = createUPIUrl(testUPIId, testAmount, testUserName);
    console.log('UPI URL:', upiUrl);
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}
