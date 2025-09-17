import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthRepository, SignInCredentials, SignUpCredentials } from '../../domain/repositories/AuthRepository';
import { AuthUser } from '../../domain/entities/User';

export class FirebaseAuthRepository implements AuthRepository {
  async signIn(credentials: SignInCredentials): Promise<AuthUser> {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      credentials.email, 
      credentials.password
    );
    return this.mapFirebaseUserToAuthUser(userCredential.user);
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthUser> {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      credentials.email, 
      credentials.password
    );

    if (credentials.displayName && userCredential.user) {
      await updateProfile(userCredential.user, { 
        displayName: credentials.displayName 
      });
    }

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
