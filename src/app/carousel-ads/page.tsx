'use client';

import { CarouselAdProvider } from '@/features/carousel-ads/presentation/providers/CarouselAdProvider';
import CarouselAdPage from '@/features/carousel-ads/presentation/components/CarouselAdPage';

export default function CarouselAdsPage() {
  return (
    <CarouselAdProvider>
      <CarouselAdPage />
    </CarouselAdProvider>
  );
}
