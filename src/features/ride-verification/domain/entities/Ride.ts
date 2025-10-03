export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RideMemory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  capturedCoordinates: Coordinates;
  capturedAt: Date; // Firebase Timestamp
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface Odometer {
  id: string;
  beforeRideOdometerImage: string;
  beforeRideOdometerImageCaptureAt: Date; // Firebase Timestamp
  afterRideOdometerImage: string;
  afterRideOdometerImageCaptureAt: Date; // Firebase Timestamp
  verificationStatus: 'pending' | 'verified' | 'rejected';
  reasons?: string;
}

export interface Ride {
  id: string;
  userId: string;
  vehicleId: string;
  status: string;
  startedAt: Date; // Firebase Timestamp
  startCoordinates: Coordinates;
  endCoordinates: Coordinates;
  endedAt: Date; // Firebase Timestamp
  totalDistance: number;
  totalTime: number;
  totalGEMCoins: number;
  rideMemories: RideMemory[];
  rideTitle: string;
  rideDescription: string;
  topSpeed: number;
  averageSpeed: number;
  routePoints: RoutePoint[];
  isPublic: boolean;
  odometer: Odometer;
}

export interface RideVerificationUpdate {
  verificationStatus: 'verified' | 'rejected';
  reasons?: string;
}
