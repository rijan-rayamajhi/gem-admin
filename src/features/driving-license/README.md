# Driving License Feature

This feature provides comprehensive driving license management functionality for the admin panel.

## Overview

The driving license feature allows administrators to:
- View all driving license submissions from users
- Filter licenses by verification status (pending, verified, rejected)
- Review license details including front and back images
- Update verification status with rejection reasons and notes
- Delete invalid or problematic license submissions

## Architecture

The feature follows the Clean Architecture pattern used throughout the application:

### Domain Layer
- **Entities**: `DrivingLicense.ts` - Core business entities and enums
- **Repositories**: `DrivingLicenseRepository.ts` - Repository interface defining data operations
- **Use Cases**: Business logic for driving license operations

### Data Layer
- **Repository Implementation**: `FirebaseDrivingLicenseRepository.ts` - Firebase-specific implementation

### Presentation Layer
- **Components**: React components for UI
- **Providers**: Context providers for state management

## Data Structure

Driving license data is stored in Firebase under `users/{userId}/drivingLicense` with the following structure:

```typescript
{
  licenseType: string;
  frontImagePath: string;
  backImagePath: string;
  dob: Date;
  verificationStatus: 'pending' | 'rejected' | 'verified';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}
```

## Components

### DrivingLicensePage
Main page component that provides:
- Status filtering (All, Pending, Verified, Rejected)
- License table display
- Error handling and loading states

### DrivingLicenseTable
Table component displaying:
- User information
- License details
- Status badges
- Action buttons

### DrivingLicenseDetailsModal
Modal for detailed license review:
- Full license information display
- Front and back image viewing
- Status update functionality
- Rejection reason and notes management

## Usage

1. Navigate to `/driving-license` in the admin panel
2. Use status filters to view specific license categories
3. Click "View Details" to open the detailed review modal
4. Update verification status as needed
5. Add rejection reasons or notes when rejecting licenses

## Features

- **Status Management**: Easy switching between pending, verified, and rejected statuses
- **Image Viewing**: Display front and back images of driving licenses
- **Audit Trail**: Track who reviewed licenses and when
- **Rejection Handling**: Provide specific reasons for license rejections
- **Notes System**: Add additional context or notes to license reviews
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error handling with user-friendly messages
