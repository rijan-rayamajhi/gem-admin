import { CarouselAdRepository } from '../repositories/CarouselAdRepository';

export class UploadImageUseCase {
  constructor(private carouselAdRepository: CarouselAdRepository) {}

  async execute(file: File): Promise<string> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 10MB');
    }

    return await this.carouselAdRepository.uploadImage(file);
  }
}
