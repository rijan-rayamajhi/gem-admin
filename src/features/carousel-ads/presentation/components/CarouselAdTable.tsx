'use client';

import Image from 'next/image';
import { CarouselAd } from '../../domain/entities/CarouselAd';

interface CarouselAdTableProps {
  carouselAds: CarouselAd[];
  loading: boolean;
  onEdit: (carouselAd: CarouselAd) => void;
  onDelete: (carouselAd: CarouselAd) => void;
}

export default function CarouselAdTable({ carouselAds, loading, onEdit, onDelete }: CarouselAdTableProps) {
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return 'No date';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (carouselAd: CarouselAd) => {
    const now = new Date();
    
    // Safely create date objects with fallbacks
    let startDate: Date;
    let endDate: Date;
    
    try {
      startDate = carouselAd.scheduling.startDate ? new Date(carouselAd.scheduling.startDate) : new Date();
      if (isNaN(startDate.getTime())) {
        startDate = new Date();
      }
    } catch {
      startDate = new Date();
    }
    
    try {
      endDate = carouselAd.scheduling.endDate ? new Date(carouselAd.scheduling.endDate) : new Date();
      if (isNaN(endDate.getTime())) {
        endDate = new Date();
      }
    } catch {
      endDate = new Date();
    }

    if (!carouselAd.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }

    if (now < startDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Scheduled
        </span>
      );
    }

    if (now >= startDate && now <= endDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Expired
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading carousel ads...</p>
        </div>
      </div>
    );
  }

  if (carouselAds.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-2">No carousel ads found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first carousel advertisement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {carouselAds.map((carouselAd) => (
              <tr key={carouselAd.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-20">
                      <Image
                        className="h-12 w-20 object-cover rounded border border-border"
                        src={carouselAd.imageUrl}
                        alt={carouselAd.title}
                        width={80}
                        height={48}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA4MCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg2MFYyOEgyMFYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-card-foreground">
                    {carouselAd.title}
                  </div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {carouselAd.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    CTA: {carouselAd.callToAction.type}
                    {carouselAd.callToAction.value && ` - ${carouselAd.callToAction.value}`}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-card-foreground">
                    {carouselAd.locationTargeting.location?.address || 'No location'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {carouselAd.locationTargeting.radius ? `${carouselAd.locationTargeting.radius}km radius` : 'No radius'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {carouselAd.locationTargeting.location ? 
                      `${carouselAd.locationTargeting.location.latitude.toFixed(4)}, ${carouselAd.locationTargeting.location.longitude.toFixed(4)}` : 
                      'No coordinates'
                    }
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-card-foreground">
                    {formatDate(carouselAd.scheduling.startDate)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {carouselAd.scheduling.endDate ? `to ${formatDate(carouselAd.scheduling.endDate)}` : 'No end date'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(carouselAd)}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => onEdit(carouselAd)}
                      className="text-primary hover:text-primary/80 transition-colors p-1 sm:p-0"
                    >
                      <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(carouselAd)}
                      className="text-red-600 hover:text-red-500 transition-colors p-1 sm:p-0"
                    >
                      <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
