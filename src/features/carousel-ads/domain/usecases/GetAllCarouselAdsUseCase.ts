import { CarouselAd, CarouselAdFilters } from '../entities/CarouselAd';
import { CarouselAdRepository } from '../repositories/CarouselAdRepository';

export class GetAllCarouselAdsUseCase {
  constructor(private carouselAdRepository: CarouselAdRepository) {}

  async execute(filters?: CarouselAdFilters): Promise<CarouselAd[]> {
    if (filters) {
      return await this.carouselAdRepository.getByFilters(filters);
    }
    return await this.carouselAdRepository.getAll();
  }
}
