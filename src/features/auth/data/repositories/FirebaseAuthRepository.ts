import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthRepository, SignInCredentials } from '../../domain/repositories/AuthRepository';
import { AuthUser } from '../../domain/entities/User';

export class FirebaseAuthRepository implements AuthRepository {
  async signIn(credentials: SignInCredentials): Promise<AuthUser> {
    console.log('FirebaseAuthRepository.signIn called with:', credentials.email);
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      credentials.email, 
      credentials.password
    );
    console.log('Firebase signIn successful, user:', userCredential.user);
    return this.mapFirebaseUserToAuthUser(userCredential.user);
  }


  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUserToAuthUser(user) : null;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      console.log('Firebase onAuthStateChanged triggered:', user);
      callback(user ? this.mapFirebaseUserToAuthUser(user) : null);
    });
  }

  private mapFirebaseUserToAuthUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      emailVerified: user.emailVerified,
    };
  }
}
