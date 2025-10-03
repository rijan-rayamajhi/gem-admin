'use client';

import Image from 'next/image';
import { VehicleBrand } from '../../domain/entities/VehicleBrand';

interface VehicleBrandTableProps {
  vehicleBrands: VehicleBrand[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function VehicleBrandTable({ 
  vehicleBrands, 
  loading, 
  onEdit, 
  onDelete 
}: VehicleBrandTableProps) {
  
  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case 'two_wheeler':
        return 'Two Wheeler';
      case 'four_wheeler':
        return 'Four Wheeler';
      case 'two_wheeler_electric':
        return 'Two Wheeler Electric';
      case 'four_wheeler_electric':
        return 'Four Wheeler Electric';
      default:
        return type;
    }
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case 'two_wheeler':
        return 'bg-blue-100 text-blue-800';
      case 'four_wheeler':
        return 'bg-green-100 text-green-800';
      case 'two_wheeler_electric':
        return 'bg-purple-100 text-purple-800';
      case 'four_wheeler_electric':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
              <div className="space-x-2">
                <div className="h-8 w-16 bg-muted rounded"></div>
                <div className="h-8 w-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (vehicleBrands.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-card-foreground mb-2">No Vehicle Brands</h3>
        <p className="text-muted-foreground">Get started by adding your first vehicle brand.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vehicleBrands.map((brand) => (
        <div key={brand.id} className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              {/* Logo */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        `;
                      }
                    }}
                  />
                ) : (
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>

              {/* Brand Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-card-foreground truncate">{brand.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVehicleTypeColor(brand.vehicleType)}`}>
                    {getVehicleTypeLabel(brand.vehicleType)}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">
                  <span className="font-medium">{brand.models.length}</span> model{brand.models.length !== 1 ? 's' : ''}
                </div>

                {/* Models Preview */}
                <div className="flex flex-wrap gap-1">
                  {brand.models.slice(0, 5).map((model, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md"
                    >
                      {model}
                    </span>
                  ))}
                  {brand.models.length > 5 && (
                    <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                      +{brand.models.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
              <button
                onClick={() => onEdit(brand.id)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Edit ${brand.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(brand.id)}
                className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                aria-label={`Delete ${brand.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
