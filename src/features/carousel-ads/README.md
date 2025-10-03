# Carousel Ads Feature

This feature provides comprehensive management of carousel advertisements with location targeting and scheduling capabilities.

## Features

### Admin Functionality
- **16:9 Image Upload**: Upload images in 16:9 aspect ratio with preview
- **Title & Description**: Set compelling ad titles and descriptions
- **Call to Action**: Define clear CTAs (e.g., "Learn More", "Shop Now")
- **Location Targeting**: Set specific location with latitude/longitude coordinates
- **Radius Targeting**: Define targeting radius in kilometers
- **Date Scheduling**: Set start and end dates for ad campaigns
- **Status Management**: Active/Inactive status control

### Core Components

#### Domain Layer
- **CarouselAd Entity**: Core data model with all required fields
- **Repository Interface**: Abstract repository for data operations
- **Use Cases**: Business logic for CRUD operations

#### Data Layer
- **Firebase Repository**: Implementation using Firestore and Firebase Storage
- **Image Upload**: Handles image uploads to Firebase Storage
- **Location Filtering**: Supports radius-based location filtering

#### Presentation Layer
- **CarouselAdPage**: Main page component with dashboard and management
- **CarouselAdForm**: Comprehensive form for creating/editing ads
- **CarouselAdTable**: Data table with status indicators and actions
- **CarouselAdProvider**: Context provider for state management

## Data Model

```typescript
interface CarouselAd {
  id: string;
  title: string;
  description: string;
  callToAction: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  radius: number; // in kilometers
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## Usage

1. **Create New Ad**: Click "Add New Ad" button to open the form
2. **Upload Image**: Select a 16:9 aspect ratio image
3. **Fill Details**: Complete title, description, and call to action
4. **Set Location**: Enter address and coordinates (with auto-geocoding)
5. **Define Radius**: Set targeting radius in kilometers
6. **Schedule**: Set start and end dates for the campaign
7. **Save**: Create or update the advertisement

## Status Indicators

- **Scheduled**: Campaign is set for future activation
- **Active**: Campaign is currently running
- **Expired**: Campaign has ended
- **Inactive**: Campaign is manually disabled

## Technical Features

- **Image Validation**: Supports JPEG, PNG, WebP formats up to 10MB
- **Location Services**: Mock geocoding for address to coordinates
- **Real-time Updates**: Automatic refresh and state management
- **Error Handling**: Comprehensive validation and error messages
- **Responsive Design**: Mobile-friendly interface
- **Firebase Integration**: Cloud storage and Firestore database

## File Structure

```
src/features/carousel-ads/
├── domain/
│   ├── entities/
│   │   └── CarouselAd.ts
│   ├── repositories/
│   │   └── CarouselAdRepository.ts
│   └── usecases/
│       ├── CreateCarouselAdUseCase.ts
│       ├── GetAllCarouselAdsUseCase.ts
│       ├── UpdateCarouselAdUseCase.ts
│       ├── DeleteCarouselAdUseCase.ts
│       └── UploadImageUseCase.ts
├── data/
│   └── repositories/
│       └── FirebaseCarouselAdRepository.ts
├── presentation/
│   ├── components/
│   │   ├── CarouselAdPage.tsx
│   │   ├── CarouselAdForm.tsx
│   │   └── CarouselAdTable.tsx
│   └── providers/
│       └── CarouselAdProvider.tsx
└── README.md
```
