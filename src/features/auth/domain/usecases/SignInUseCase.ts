import { AuthRepository, SignInCredentials } from '../repositories/AuthRepository';
import { AuthUser } from '../entities/User';

export class SignInUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(credentials: SignInCredentials): Promise<AuthUser> {
    try {
      return await this.authRepository.signIn(credentials);
    } catch (error: unknown) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(this.getErrorMessage(errorCode));
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}
