import { CarouselAd, CreateCarouselAdRequest, CallToActionType } from '../entities/CarouselAd';
import { CarouselAdRepository } from '../repositories/CarouselAdRepository';

export class CreateCarouselAdUseCase {
  constructor(private carouselAdRepository: CarouselAdRepository) {}

  async execute(carouselAdData: CreateCarouselAdRequest): Promise<CarouselAd> {
    // Validate required fields
    if (!carouselAdData.title?.trim()) {
      throw new Error('Title is required');
    }

    if (!carouselAdData.description?.trim()) {
      throw new Error('Description is required');
    }

    if (!carouselAdData.callToAction?.type) {
      throw new Error('Call to action type is required');
    }

    const validCtaTypes: CallToActionType[] = ['app_screen', 'link', 'web_view', 'none'];
    if (!validCtaTypes.includes(carouselAdData.callToAction.type)) {
      throw new Error('Invalid call to action type');
    }

    if (carouselAdData.callToAction.type !== 'none' && !carouselAdData.callToAction.value?.trim()) {
      throw new Error(`${carouselAdData.callToAction.type === 'app_screen' ? 'Screen name' : 'URL'} is required for this call to action type`);
    }

    if (!carouselAdData.imageUrl?.trim()) {
      throw new Error('Image URL is required');
    }

    if (carouselAdData.locationTargeting.enabled) {
      if (!carouselAdData.locationTargeting.location?.latitude || !carouselAdData.locationTargeting.location?.longitude) {
        throw new Error('Location coordinates are required when location targeting is enabled');
      }

      if (!carouselAdData.locationTargeting.location?.address?.trim()) {
        throw new Error('Location address is required when location targeting is enabled');
      }

      if (!carouselAdData.locationTargeting.radius || carouselAdData.locationTargeting.radius <= 0) {
        throw new Error('Radius must be greater than 0 when location targeting is enabled');
      }
    }

    if (carouselAdData.scheduling.enabled) {
      if (!carouselAdData.scheduling.startDate || !carouselAdData.scheduling.endDate) {
        throw new Error('Start date and end date are required when scheduling is enabled');
      }

      if (carouselAdData.scheduling.startDate >= carouselAdData.scheduling.endDate) {
        throw new Error('Start date must be before end date');
      }

      if (carouselAdData.scheduling.endDate <= new Date()) {
        throw new Error('End date must be in the future');
      }
    }

    return await this.carouselAdRepository.create(carouselAdData);
  }
}
