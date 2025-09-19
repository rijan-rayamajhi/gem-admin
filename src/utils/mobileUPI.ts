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
 * Get available UPI apps by detecting installed apps
 */
export async function getAvailableUPIApps(): Promise<typeof UPI_APPS> {
  if (!isMobileDevice()) {
    // For desktop, return popular apps
    return UPI_APPS.filter(app => 
      ['googlepay', 'phonepe', 'paytm'].includes(app.id)
    );
  }

  const availableApps = [];
  
  // Check each UPI app to see if it's installed
  for (const app of UPI_APPS) {
    try {
      const isInstalled = await isUPIAppInstalled(app.id);
      if (isInstalled) {
        availableApps.push(app);
      }
    } catch (error) {
      console.log(`Could not detect ${app.name}:`, error);
    }
  }

  // If no apps detected, fallback to platform-specific defaults
  if (availableApps.length === 0) {
    if (isAndroid()) {
      return UPI_APPS; // Return all for Android
    } else if (isIOS()) {
      return UPI_APPS.filter(app => 
        ['googlepay', 'phonepe', 'paytm'].includes(app.id)
      );
    }
  }

  return availableApps;
}

/**
 * Check if a specific UPI app is installed
 */
export async function isUPIAppInstalled(appId: string): Promise<boolean> {
  const app = UPI_APPS.find(a => a.id === appId);
  if (!app) return false;

  try {
    if (isAndroid()) {
      // For Android, try to detect using intent
      return await detectAndroidApp(app);
    } else if (isIOS()) {
      // For iOS, try to detect using URL scheme
      return await detectIOSApp(app);
    } else {
      // For desktop, assume not installed
      return false;
    }
  } catch (error) {
    console.log(`Error detecting ${app.name}:`, error);
    return false;
  }
}

/**
 * Detect Android app using intent detection
 */
async function detectAndroidApp(app: typeof UPI_APPS[0]): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Create a hidden iframe to test the app
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      
      // Test URL for the app
      const testUrl = `${app.scheme}test`;
      iframe.src = testUrl;
      
      // Add to DOM
      document.body.appendChild(iframe);
      
      // Set timeout to detect if app opened
      let appOpened = false;
      const timeout = setTimeout(() => {
        if (!appOpened) {
          document.body.removeChild(iframe);
          resolve(false);
        }
      }, 1500);
      
      // Listen for page visibility change (indicates app opened)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          appOpened = true;
          clearTimeout(timeout);
          document.body.removeChild(iframe);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resolve(true);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Also listen for blur event
      const handleBlur = () => {
        appOpened = true;
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        resolve(true);
      };
      
      window.addEventListener('blur', handleBlur);
      
    } catch {
      resolve(false);
    }
  });
}

/**
 * Detect iOS app using URL scheme detection
 */
async function detectIOSApp(app: typeof UPI_APPS[0]): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // For iOS, we can try to open the app and detect if it opens
      const testUrl = `${app.scheme}test`;
      
      // Create a temporary link
      const link = document.createElement('a');
      link.href = testUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Track if we're still visible after clicking
      let appOpened = false;
      const timeout = setTimeout(() => {
        if (!appOpened) {
          document.body.removeChild(link);
          resolve(false);
        }
      }, 1000);
      
      // Listen for visibility change
      const handleVisibilityChange = () => {
        if (document.hidden) {
          appOpened = true;
          clearTimeout(timeout);
          document.body.removeChild(link);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resolve(true);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Click the link
      link.click();
      
    } catch {
      resolve(false);
    }
  });
}
