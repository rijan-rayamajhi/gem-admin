import { CarouselAd, CreateCarouselAdRequest, UpdateCarouselAdRequest, CarouselAdFilters } from '../entities/CarouselAd';

export interface CarouselAdRepository {
  create(carouselAd: CreateCarouselAdRequest): Promise<CarouselAd>;
  getById(id: string): Promise<CarouselAd | null>;
  getAll(): Promise<CarouselAd[]>;
  getByFilters(filters: CarouselAdFilters): Promise<CarouselAd[]>;
  update(carouselAd: UpdateCarouselAdRequest): Promise<CarouselAd>;
  delete(id: string): Promise<void>;
  uploadImage(file: File): Promise<string>;
}
