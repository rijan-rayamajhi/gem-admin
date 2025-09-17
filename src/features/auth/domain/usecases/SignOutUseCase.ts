import { AuthRepository } from '../repositories/AuthRepository';

export class SignOutUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    try {
      await this.authRepository.signOut();
    } catch (error: any) {
      throw new Error('Failed to sign out. Please try again.');
    }
  }
}
