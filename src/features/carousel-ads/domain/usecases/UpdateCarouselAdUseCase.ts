import { CarouselAd, UpdateCarouselAdRequest } from '../entities/CarouselAd';
import { CarouselAdRepository } from '../repositories/CarouselAdRepository';

export class UpdateCarouselAdUseCase {
  constructor(private carouselAdRepository: CarouselAdRepository) {}

  async execute(updateData: UpdateCarouselAdRequest): Promise<CarouselAd> {
    if (!updateData.id) {
      throw new Error('ID is required for update');
    }

    // Validate dates if both are provided
    if (updateData.scheduling?.startDate && updateData.scheduling?.endDate) {
      if (updateData.scheduling.startDate >= updateData.scheduling.endDate) {
        throw new Error('Start date must be before end date');
      }
    }

    // Validate radius if provided
    if (updateData.locationTargeting?.radius !== undefined && updateData.locationTargeting.radius <= 0) {
      throw new Error('Radius must be greater than 0');
    }

    return await this.carouselAdRepository.update(updateData);
  }
}
