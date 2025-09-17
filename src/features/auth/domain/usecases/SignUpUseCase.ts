import { AuthRepository, SignUpCredentials } from '../repositories/AuthRepository';
import { AuthUser } from '../entities/User';

export class SignUpUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(credentials: SignUpCredentials): Promise<AuthUser> {
    try {
      return await this.authRepository.signUp(credentials);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}
