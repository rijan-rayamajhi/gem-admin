import { AuthUser } from '../entities/User';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthRepository {
  signIn(credentials: SignInCredentials): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}
