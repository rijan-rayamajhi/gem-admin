# Ride Verification Feature

This feature manages ride verification with a focus on odometer verification. It allows administrators to view all user rides and verify or reject odometer readings.

## Architecture

This feature follows the Clean Architecture pattern with the following structure:

```
ride-verification/
├── data/
│   └── repositories/
│       └── FirebaseRideRepository.ts
├── domain/
│   ├── entities/
│   │   └── Ride.ts
│   ├── repositories/
│   │   └── RideRepository.ts
│   └── usecases/
│       ├── GetAllRidesUseCase.ts
│       ├── GetRidesByVerificationStatusUseCase.ts
│       └── UpdateRideOdometerVerificationUseCase.ts
└── presentation/
    ├── components/
    │   ├── RideVerificationPage.tsx
    │   ├── RideVerificationTable.tsx
    │   └── RideVerificationDetailsModal.tsx
    └── providers/
        └── RideVerificationProvider.tsx
```

## Features

- **View All Rides**: Display all rides from all users' subcollections
- **Filter by Status**: Filter rides by verification status (pending, verified, rejected)
- **Search Rides**: Search rides by title, description, user ID, or vehicle ID
- **Odometer Verification**: View before/after odometer images and verify or reject readings
- **Detailed View**: Modal with comprehensive ride details including memories and route data
- **Status Management**: Update verification status with optional rejection reasons

## Data Structure

Rides are stored in Firebase as subcollections under users:
```
users/{userId}/rides/{rideId}
```

Each ride contains:
- Basic ride information (title, description, distance, time, etc.)
- Odometer data with before/after images
- Verification status and reasons
- Ride memories and route points

## Usage

1. Navigate to `/ride-verification` from the dashboard
2. View all rides with their current verification status
3. Filter by status or search for specific rides
4. Click on a ride to view detailed information
5. Verify or reject odometer readings with optional reasons
6. View ride memories and route data

## Components

- **RideVerificationPage**: Main page component with filters and stats
- **RideVerificationTable**: Table displaying rides with actions
- **RideVerificationDetailsModal**: Detailed view with odometer images and verification actions
- **RideVerificationProvider**: Context provider for state management
