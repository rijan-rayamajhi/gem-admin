/**
 * Utility functions for mobile UPI app detection and handling
 */

// Common UPI apps with their deep link schemes
export const UPI_APPS = [
  {
    id: 'googlepay',
    name: 'Google Pay',
    packageName: 'com.google.android.apps.nfp.payment',
    scheme: 'tez://',
    icon: '📱',
    color: '#4285F4'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    packageName: 'com.phonepe.app',
    scheme: 'phonepe://',
    icon: '💳',
    color: '#5F259F'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    packageName: 'net.one97.paytm',
    scheme: 'paytmmp://',
    icon: '💰',
    color: '#00BAF2'
  },
  {
    id: 'bharatpe',
    name: 'BharatPe',
    packageName: 'com.bharatpe.app',
    scheme: 'bharatpe://',
    icon: '🏪',
    color: '#FF6B35'
  },
  {
    id: 'mobikwik',
    name: 'MobiKwik',
    packageName: 'com.mobikwik_new',
    scheme: 'mobikwik://',
    icon: '⚡',
    color: '#FF6B00'
  },
  {
    id: 'freecharge',
    name: 'Freecharge',
    packageName: 'com.freecharge.android',
    scheme: 'freecharge://',
    icon: '🆓',
    color: '#00A651'
  }
];

/**
 * Detect if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detect if the user is on Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android/i.test(navigator.userAgent);
}

/**
 * Detect if the user is on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Create UPI payment URL for mobile apps
 */
export function createMobileUPIUrl(
  upiId: string,
  amount?: number,
  userName?: string,
  transactionNote?: string
): string {
  const params = new URLSearchParams();
  params.append('pa', upiId); // Payee Address
  params.append('pn', userName || 'User'); // Payee Name
  params.append('cu', 'INR'); // Currency
  
  if (amount && amount > 0) {
    params.append('am', amount.toString()); // Amount
  }
  
  if (transactionNote) {
    params.append('tn', transactionNote); // Transaction Note
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Try to open UPI app with payment URL
 */
export function openUPIApp(
  appId: string,
  upiId: string,
  amount?: number,
  userName?: string,
  transactionNote?: string
): void {
  const app = UPI_APPS.find(a => a.id === appId);
  if (!app) {
    console.error('UPI app not found:', appId);
    return;
  }

  const upiUrl = createMobileUPIUrl(upiId, amount, userName, transactionNote);
  
  try {
    // For Android, try to open the app directly
    if (isAndroid()) {
      // Try app-specific deep link first
      const deepLink = `${app.scheme}${upiUrl}`;
      window.location.href = deepLink;
      
      // Fallback to generic UPI URL after a short delay
      setTimeout(() => {
        window.location.href = upiUrl;
      }, 1000);
    } else if (isIOS()) {
      // For iOS, use generic UPI URL
      window.location.href = upiUrl;
    } else {
      // For desktop, open in new tab
      window.open(upiUrl, '_blank');
    }
  } catch (error) {
    console.error('Error opening UPI app:', error);
    // Fallback to generic UPI URL
    window.location.href = upiUrl;
  }
}

/**
 * Get available UPI apps based on platform
 */
export function getAvailableUPIApps(): typeof UPI_APPS {
  if (isAndroid()) {
    // Return all apps for Android
    return UPI_APPS;
  } else if (isIOS()) {
    // Return apps that work well on iOS
    return UPI_APPS.filter(app => 
      ['googlepay', 'phonepe', 'paytm'].includes(app.id)
    );
  } else {
    // For desktop, return popular apps
    return UPI_APPS.filter(app => 
      ['googlepay', 'phonepe', 'paytm'].includes(app.id)
    );
  }
}

/**
 * Check if a specific UPI app is installed (Android only)
 */
export async function isUPIAppInstalled(appId: string): Promise<boolean> {
  if (!isAndroid()) return false;
  
  const app = UPI_APPS.find(a => a.id === appId);
  if (!app) return false;

  try {
    // Try to open the app and see if it responds
    const testUrl = `${app.scheme}test`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = testUrl;
    document.body.appendChild(iframe);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(true); // Assume app is installed if no error
      }, 1000);
    });
  } catch {
    return false;
  }
}
