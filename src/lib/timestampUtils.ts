import { Timestamp } from 'firebase/firestore';

/**
 * Comprehensive utilities for Firebase Timestamp operations
 * Used throughout the application for consistent timestamp handling
 */
export class TimestampUtils {
  /**
   * Convert Firebase Timestamp to HTML datetime-local input value
   * @param timestamp - Firebase Timestamp object
   * @returns String in format "YYYY-MM-DDTHH:mm"
   */
  static toInputValue(timestamp: Timestamp): string {
    if (!timestamp) return '';
    return timestamp.toDate().toISOString().slice(0, 16);
  }

  /**
   * Convert HTML datetime-local input value to Firebase Timestamp
   * @param value - String in format "YYYY-MM-DDTHH:mm"
   * @returns Firebase Timestamp object
   */
  static fromInputValue(value: string): Timestamp {
    if (!value) return Timestamp.now();
    return Timestamp.fromDate(new Date(value));
  }

  /**
   * Convert Firebase Timestamp to human-readable display string
   * @param timestamp - Firebase Timestamp object
   * @param options - Optional formatting options
   * @returns Formatted date string
   */
  static toDisplayString(
    timestamp: Timestamp, 
    options?: Intl.DateTimeFormatOptions
  ): string {
    if (!timestamp) return 'Not set';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', formatOptions);
  }

  /**
   * Check if a timestamp represents a date in the past
   * @param timestamp - Firebase Timestamp to check
   * @returns True if the timestamp is in the past
   */
  static isPast(timestamp: Timestamp): boolean {
    if (!timestamp) return false;
    return timestamp.toDate() < new Date();
  }

  /**
   * Check if a timestamp represents a date in the future
   * @param timestamp - Firebase Timestamp to check
   * @returns True if the timestamp is in the future
   */
  static isFuture(timestamp: Timestamp): boolean {
    if (!timestamp) return false;
    return timestamp.toDate() > new Date();
  }

  /**
   * Check if an ad is expired based on its end date
   * @param endDate - Firebase Timestamp representing the end date
   * @returns True if the ad is expired
   */
  static isExpired(endDate: Timestamp): boolean {
    return this.isPast(endDate);
  }

  /**
   * Check if an ad is currently active (between start and end dates)
   * @param startDate - Firebase Timestamp representing the start date
   * @param endDate - Firebase Timestamp representing the end date
   * @returns True if the ad is currently active
   */
  static isActive(startDate: Timestamp, endDate: Timestamp): boolean {
    const now = new Date();
    const start = startDate.toDate();
    const end = endDate.toDate();
    return start <= now && now <= end;
  }

  /**
   * Calculate the number of days between two timestamps
   * @param start - Starting timestamp
   * @param end - Ending timestamp
   * @returns Number of days between the timestamps
   */
  static daysBetween(start: Timestamp, end: Timestamp): number {
    const diffTime = end.toDate().getTime() - start.toDate().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate the number of hours between two timestamps
   * @param start - Starting timestamp
   * @param end - Ending timestamp
   * @returns Number of hours between the timestamps
   */
  static hoursBetween(start: Timestamp, end: Timestamp): number {
    const diffTime = end.toDate().getTime() - start.toDate().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Normalize various timestamp formats to Firebase Timestamp
   * Handles Firestore data that might come as objects with seconds/nanoseconds
   * @param value - Value that might be a Timestamp, object, string, or Date
   * @returns Firebase Timestamp object
   */
  static normalize(value: any): Timestamp {
    if (value instanceof Timestamp) return value;
    
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      return new Timestamp(value.seconds, value.nanoseconds);
    }
    
    if (typeof value === 'string' || value instanceof Date) {
      return Timestamp.fromDate(new Date(value));
    }
    
    // Return current time as fallback
    return Timestamp.now();
  }

  /**
   * Compare two timestamps
   * @param timestamp1 - First timestamp
   * @param timestamp2 - Second timestamp
   * @returns -1 if timestamp1 < timestamp2, 0 if equal, 1 if timestamp1 > timestamp2
   */
  static compare(timestamp1: Timestamp, timestamp2: Timestamp): number {
    const time1 = timestamp1.toDate().getTime();
    const time2 = timestamp2.toDate().getTime();
    
    if (time1 < time2) return -1;
    if (time1 > time2) return 1;
    return 0;
  }

  /**
   * Get a timestamp representing the start of the day
   * @param timestamp - Input timestamp
   * @returns Timestamp at 00:00:00 of the same day
   */
  static startOfDay(timestamp: Timestamp): Timestamp {
    const date = timestamp.toDate();
    date.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(date);
  }

  /**
   * Get a timestamp representing the end of the day
   * @param timestamp - Input timestamp
   * @returns Timestamp at 23:59:59 of the same day
   */
  static endOfDay(timestamp: Timestamp): Timestamp {
    const date = timestamp.toDate();
    date.setHours(23, 59, 59, 999);
    return Timestamp.fromDate(date);
  }

  /**
   * Add days to a timestamp
   * @param timestamp - Input timestamp
   * @param days - Number of days to add (can be negative)
   * @returns New timestamp with days added
   */
  static addDays(timestamp: Timestamp, days: number): Timestamp {
    const date = timestamp.toDate();
    date.setDate(date.getDate() + days);
    return Timestamp.fromDate(date);
  }

  /**
   * Add hours to a timestamp
   * @param timestamp - Input timestamp
   * @param hours - Number of hours to add (can be negative)
   * @returns New timestamp with hours added
   */
  static addHours(timestamp: Timestamp, hours: number): Timestamp {
    const date = timestamp.toDate();
    date.setHours(date.getHours() + hours);
    return Timestamp.fromDate(date);
  }

  /**
   * Format timestamp for sorting (ISO string)
   * @param timestamp - Input timestamp
   * @returns ISO string suitable for sorting
   */
  static toSortableString(timestamp: Timestamp): string {
    return timestamp.toDate().toISOString();
  }

  /**
   * Create a timestamp from current time plus specified minutes
   * Useful for setting default end times
   * @param minutes - Minutes to add to current time
   * @returns New timestamp
   */
  static fromNowPlusMinutes(minutes: number): Timestamp {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return Timestamp.fromDate(date);
  }

  /**
   * Validate that start date is before end date
   * @param startDate - Start timestamp
   * @param endDate - End timestamp
   * @returns Validation result with success flag and error message
   */
  static validateDateRange(startDate: Timestamp, endDate: Timestamp): { 
    isValid: boolean; 
    error?: string; 
  } {
    if (!startDate || !endDate) {
      return { isValid: false, error: 'Both start and end dates are required' };
    }

    if (this.compare(startDate, endDate) >= 0) {
      return { isValid: false, error: 'End date must be after start date' };
    }

    return { isValid: true };
  }

  /**
   * Get status string based on timestamps
   * @param startDate - Ad start date
   * @param endDate - Ad end date
   * @returns Status string: 'upcoming', 'active', or 'expired'
   */
  static getAdStatus(startDate: Timestamp, endDate: Timestamp): 'upcoming' | 'active' | 'expired' {
    const now = new Date();
    const start = startDate.toDate();
    const end = endDate.toDate();

    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  }
}

// Export commonly used functions for convenience
export const {
  toInputValue,
  fromInputValue,
  toDisplayString,
  isExpired,
  isActive,
  normalize,
  validateDateRange,
  getAdStatus
} = TimestampUtils; 