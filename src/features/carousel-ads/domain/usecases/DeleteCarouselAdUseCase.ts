import { CarouselAdRepository } from '../repositories/CarouselAdRepository';

export class DeleteCarouselAdUseCase {
  constructor(private carouselAdRepository: CarouselAdRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID is required for deletion');
    }

    await this.carouselAdRepository.delete(id);
  }
}
