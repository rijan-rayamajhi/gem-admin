import { AuthRepository } from '../repositories/AuthRepository';
import { AuthUser } from '../entities/User';

export class GetCurrentUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<AuthUser | null> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error: any) {
      throw new Error('Failed to get current user.');
    }
  }
}
