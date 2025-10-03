export type CallToActionType = 'app_screen' | 'link' | 'web_view' | 'none';

export interface CallToAction {
  type: CallToActionType;
  value?: string; // URL for link/web_view, screen name for app_screen
}

export interface CarouselAd {
  id: string;
  title: string;
  description: string;
  callToAction: CallToAction;
  imageUrl: string;
  locationTargeting: {
    enabled: boolean;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    radius?: number; // in kilometers
  };
  scheduling: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user ID
}

export interface CreateCarouselAdRequest {
  title: string;
  description: string;
  callToAction: CallToAction;
  imageUrl: string;
  locationTargeting: {
    enabled: boolean;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    radius?: number;
  };
  scheduling: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
  };
  isActive?: boolean;
}

export interface UpdateCarouselAdRequest {
  id: string;
  title?: string;
  description?: string;
  callToAction?: CallToAction;
  imageUrl?: string;
  locationTargeting?: {
    enabled: boolean;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    radius?: number;
  };
  scheduling?: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
  };
  isActive?: boolean;
}

export interface CarouselAdFilters {
  isActive?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}
