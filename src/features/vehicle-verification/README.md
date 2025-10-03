# Vehicle Verification Feature

This feature provides comprehensive vehicle verification management capabilities for the admin dashboard.

## Overview

The Vehicle Verification feature allows administrators to:
- View all vehicle verification requests from users
- Filter vehicles by verification status (Pending, Verified, Rejected, Not Verified)
- Approve or reject vehicle verification requests
- View detailed vehicle information and images
- Delete vehicle verification records

## Architecture

The feature follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Entities**: `VehicleVerification`, `VehicleVerificationStatus`
- **Repositories**: `VehicleVerificationRepository` (interface)
- **Use Cases**: 
  - `GetAllVehicleVerificationsUseCase`
  - `GetVehicleVerificationsByStatusUseCase`
  - `GetVehicleVerificationByIdUseCase`
  - `UpdateVehicleVerificationStatusUseCase`
  - `DeleteVehicleVerificationUseCase`

### Data Layer
- **Repository Implementation**: `FirebaseVehicleVerificationRepository`
- **Firebase Integration**: Connects to Firestore collection `users/{userId}/vehicles`

### Presentation Layer
- **Provider**: `VehicleVerificationProvider` (state management)
- **Components**:
  - `VehicleVerificationPage` (main page)
  - `VehicleVerificationTable` (data table)
  - `VehicleVerificationDetailsModal` (detailed view)

## Data Model

### VehicleVerification Entity
```typescript
interface VehicleVerification {
  id: string;
  vehicleType: string;
  vehicleBrandImage: string;
  vehicleBrandName: string;
  vehicleModelName: string;
  vehicleRegistrationNumber: string;
  vehicleTyreType: string;
  verificationStatus: VehicleVerificationStatus;
  vehicleSlideImages?: string[];
  vehicleInsuranceImage?: string;
  vehicleFrontImage?: string;
  vehicleBackImage?: string;
  vehicleRCFrontImage?: string;
  vehicleRCBackImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### VehicleVerificationStatus Enum
- `PENDING`: Awaiting verification
- `VERIFIED`: Approved by admin
- `REJECTED`: Rejected by admin
- `NOT_VERIFIED`: Not verified

## Features

### 1. Dashboard Integration
- Added "Vehicle Verification" card to the main dashboard
- Teal color theme to distinguish from other features
- Direct navigation to `/vehicle-verification` route

### 2. Vehicle Verification Page
- **Status Filtering**: Filter by verification status with counts
- **Search**: Search by brand name, model, registration number, or vehicle type
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Pull-to-Refresh**: Refresh data by pulling down

### 3. Vehicle Verification Table
- **Comprehensive Display**: Shows vehicle details, registration, status, and creation date
- **Status Badges**: Color-coded status indicators
- **Quick Actions**: View details, approve/reject (for pending), delete
- **Responsive Layout**: Adapts to different screen sizes

### 4. Vehicle Verification Details Modal
- **Complete Information**: All vehicle details in organized sections
- **Image Gallery**: Tabbed interface for different image types:
  - Vehicle slides
  - Insurance documents
  - Front/back vehicle photos
  - RC (Registration Certificate) documents
- **Status Management**: Approve or reject directly from modal
- **Image Viewer**: Click to open images in full size

## Firebase Collection Structure

```
users/
  {userId}/
    vehicles/
      {vehicleId}/
        - vehicleType: string
        - vehicleBrandImage: string
        - vehicleBrandName: string
        - vehicleModelName: string
        - vehicleRegistrationNumber: string
        - vehicleTyreType: string
        - verificationStatus: VehicleVerificationStatus
        - vehicleSlideImages: string[]
        - vehicleInsuranceImage: string
        - vehicleFrontImage: string
        - vehicleBackImage: string
        - vehicleRCFrontImage: string
        - vehicleRCBackImage: string
        - createdAt: Timestamp
        - updatedAt: Timestamp
```

## Usage

1. **Access**: Navigate to Vehicle Verification from the dashboard
2. **Filter**: Use status buttons to filter vehicles by verification status
3. **Search**: Use the search bar to find specific vehicles
4. **View Details**: Click the eye icon to open detailed view
5. **Approve/Reject**: Use action buttons to change verification status
6. **Delete**: Remove vehicle verification records when needed

## Error Handling

- Comprehensive error handling with user-friendly messages
- Loading states for all async operations
- Confirmation dialogs for destructive actions
- Graceful fallbacks for missing data

## Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts for different screen sizes
- Optimized for both portrait and landscape orientations
