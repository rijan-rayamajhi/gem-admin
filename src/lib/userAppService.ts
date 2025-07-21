import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, getDoc, addDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export interface UserAppUser {
  id: string;
  displayName: string;
  profileImage?: string;
  email: string;
  totalDistance: number;
  totalRides: number;
  totalGemCoins: number;
  createdAt?: any;
  updatedAt?: any;
}

export const userAppService = {
  // Test function to check available collections
  async testFirebaseConnection(): Promise<void> {
    try {
      console.log('Testing Firebase connection...');
      
      // Try different collection names
      const collections = ['users', 'user', 'user_app_users', 'app_users'];
      
      for (const collectionName of collections) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);
          console.log(`Collection '${collectionName}' has ${snapshot.size} documents`);
          
          if (snapshot.size > 0) {
            console.log(`First document in '${collectionName}':`, snapshot.docs[0].data());
          }
        } catch (error) {
          console.log(`Error accessing collection '${collectionName}':`, error);
        }
      }
    } catch (error) {
      console.error('Error testing Firebase connection:', error);
    }
  },
  // Get all user app users
  async getAllUserAppUsers(): Promise<UserAppUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      console.log('Total documents found:', querySnapshot.size);
      
      const users: UserAppUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Document data:', doc.id, data);
        
        const profile = data.profile || {};
        
        const user: UserAppUser = {
          id: doc.id,
          displayName: profile.displayName || profile.name || profile.firstName + ' ' + profile.lastName || 'Unknown User',
          profileImage: profile.profileImage || profile.avatar || profile.photoURL || profile.profilePicture,
          email: profile.email || '',
          totalDistance: profile.totalDistance || profile.distance || profile.totalRideDistance || 0,
          totalRides: profile.totalRides || profile.rides || profile.totalRideCount || 0,
          totalGemCoins: profile.totalGemCoins || profile.gemCoins || profile.coins || profile.totalCoins || 0,
          createdAt: data.createdAt || data.created_at,
          updatedAt: data.updatedAt || data.updated_at,
        };
        
        console.log('Processed user:', user);
        users.push(user);
      });
      
      console.log('Final users array:', users);
      return users;
    } catch (error) {
      console.error('Error fetching user app users:', error);
      throw error;
    }
  },

  // Get user app user by ID
  async getUserAppUserById(id: string): Promise<UserAppUser | null> {
    try {
      const userRef = doc(db, 'users', id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        const profile = data.profile || {};
        
        return {
          id: userSnap.id,
          displayName: profile.displayName || profile.name || profile.firstName + ' ' + profile.lastName || 'Unknown User',
          profileImage: profile.profileImage || profile.avatar || profile.photoURL || profile.profilePicture,
          email: profile.email || '',
          totalDistance: profile.totalDistance || profile.distance || profile.totalRideDistance || 0,
          totalRides: profile.totalRides || profile.rides || profile.totalRideCount || 0,
          totalGemCoins: profile.totalGemCoins || profile.gemCoins || profile.coins || profile.totalCoins || 0,
          createdAt: data.createdAt || data.created_at,
          updatedAt: data.updatedAt || data.updated_at,
        } as UserAppUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user app user:', error);
      throw error;
    }
  },



  // Update user app user
  async updateUserAppUser(id: string, data: Partial<UserAppUser>): Promise<void> {
    try {
      const userRef = doc(db, 'users', id);
      
      // Prepare profile updates
      const profileUpdates: any = {};
      if (data.displayName !== undefined) profileUpdates.displayName = data.displayName;
      if (data.profileImage !== undefined) profileUpdates.profileImage = data.profileImage;
      if (data.totalDistance !== undefined) profileUpdates.totalDistance = data.totalDistance;
      if (data.totalRides !== undefined) profileUpdates.totalRides = data.totalRides;
      if (data.totalGemCoins !== undefined) profileUpdates.totalGemCoins = data.totalGemCoins;
      
      // Prepare root level updates
      const rootUpdates: any = {
        updatedAt: new Date(),
      };
      if (data.email !== undefined) rootUpdates.email = data.email;
      
      // Update both profile and root level fields
      await updateDoc(userRef, {
        ...rootUpdates,
        profile: profileUpdates,
      });
    } catch (error) {
      console.error('Error updating user app user:', error);
      throw error;
    }
  },

  // Update user stats
  async updateUserStats(id: string, stats: {
    totalDistance?: number;
    totalRides?: number;
    totalGemCoins?: number;
  }): Promise<void> {
    try {
      const userRef = doc(db, 'users', id);
      
      // Prepare profile updates for stats
      const profileUpdates: any = {};
      if (stats.totalDistance !== undefined) profileUpdates.totalDistance = stats.totalDistance;
      if (stats.totalRides !== undefined) profileUpdates.totalRides = stats.totalRides;
      if (stats.totalGemCoins !== undefined) profileUpdates.totalGemCoins = stats.totalGemCoins;
      
      await updateDoc(userRef, {
        profile: profileUpdates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  },

  // Delete user app user
  async deleteUserAppUser(id: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', id);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user app user:', error);
      throw error;
    }
  },

  // Search users by email
  async searchUsersByEmail(email: string): Promise<UserAppUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('profile.email', '==', email));
      const querySnapshot = await getDocs(q);
      
      const users: UserAppUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const profile = data.profile || {};
        
        users.push({
          id: doc.id,
          displayName: profile.displayName || profile.name || profile.firstName + ' ' + profile.lastName || 'Unknown User',
          profileImage: profile.profileImage || profile.avatar || profile.photoURL || profile.profilePicture,
          email: profile.email || '',
          totalDistance: profile.totalDistance || profile.distance || profile.totalRideDistance || 0,
          totalRides: profile.totalRides || profile.rides || profile.totalRideCount || 0,
          totalGemCoins: profile.totalGemCoins || profile.gemCoins || profile.coins || profile.totalCoins || 0,
          createdAt: data.createdAt || data.created_at,
          updatedAt: data.updatedAt || data.updated_at,
        } as UserAppUser);
      });
      
      return users;
    } catch (error) {
      console.error('Error searching users by email:', error);
      throw error;
    }
  },

  // Get users by distance range
  async getUsersByDistanceRange(minDistance: number, maxDistance?: number): Promise<UserAppUser[]> {
    try {
      const usersRef = collection(db, 'users');
      let q;
      
      if (maxDistance) {
        q = query(
          usersRef, 
          where('profile.totalDistance', '>=', minDistance),
          where('profile.totalDistance', '<=', maxDistance),
          orderBy('profile.totalDistance', 'desc')
        );
      } else {
        q = query(
          usersRef, 
          where('profile.totalDistance', '>=', minDistance),
          orderBy('profile.totalDistance', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const users: UserAppUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const profile = data.profile || {};
        
        users.push({
          id: doc.id,
          displayName: profile.displayName || profile.name || profile.firstName + ' ' + profile.lastName || 'Unknown User',
          profileImage: profile.profileImage || profile.avatar || profile.photoURL || profile.profilePicture,
          email: profile.email || '',
          totalDistance: profile.totalDistance || profile.distance || profile.totalRideDistance || 0,
          totalRides: profile.totalRides || profile.rides || profile.totalRideCount || 0,
          totalGemCoins: profile.totalGemCoins || profile.gemCoins || profile.coins || profile.totalCoins || 0,
          createdAt: data.createdAt || data.created_at,
          updatedAt: data.updatedAt || data.updated_at,
        } as UserAppUser);
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users by distance range:', error);
      throw error;
    }
  },

  // Get users by ride count range
  async getUsersByRideRange(minRides: number, maxRides?: number): Promise<UserAppUser[]> {
    try {
      const usersRef = collection(db, 'users');
      let q;
      
      if (maxRides) {
        q = query(
          usersRef, 
          where('profile.totalRides', '>=', minRides),
          where('profile.totalRides', '<=', maxRides),
          orderBy('profile.totalRides', 'desc')
        );
      } else {
        q = query(
          usersRef, 
          where('profile.totalRides', '>=', minRides),
          orderBy('profile.totalRides', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const users: UserAppUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const profile = data.profile || {};
        
        users.push({
          id: doc.id,
          displayName: profile.displayName || profile.name || profile.firstName + ' ' + profile.lastName || 'Unknown User',
          profileImage: profile.profileImage || profile.avatar || profile.photoURL || profile.profilePicture,
          email: profile.email || '',
          totalDistance: profile.totalDistance || profile.distance || profile.totalRideDistance || 0,
          totalRides: profile.totalRides || profile.rides || profile.totalRideCount || 0,
          totalGemCoins: profile.totalGemCoins || profile.gemCoins || profile.coins || profile.totalCoins || 0,
          createdAt: data.createdAt || data.created_at,
          updatedAt: data.updatedAt || data.updated_at,
        } as UserAppUser);
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users by ride range:', error);
      throw error;
    }
  },

  // Get users by gem coins range
  async getUsersByCoinRange(minCoins: number, maxCoins?: number): Promise<UserAppUser[]> {
    try {
      const usersRef = collection(db, 'users');
      let q;
      
      if (maxCoins) {
        q = query(
          usersRef, 
          where('profile.totalGemCoins', '>=', minCoins),
          where('profile.totalGemCoins', '<=', maxCoins),
          orderBy('profile.totalGemCoins', 'desc')
        );
      } else {
        q = query(
          usersRef, 
          where('profile.totalGemCoins', '>=', minCoins),
          orderBy('profile.totalGemCoins', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const users: UserAppUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const profile = data.profile || {};
        
        users.push({
          id: doc.id,
          displayName: profile.displayName || profile.name || profile.firstName + ' ' + profile.lastName || 'Unknown User',
          profileImage: profile.profileImage || profile.avatar || profile.photoURL || profile.profilePicture,
          email: profile.email || '',
          totalDistance: profile.totalDistance || profile.distance || profile.totalRideDistance || 0,
          totalRides: profile.totalRides || profile.rides || profile.totalRideCount || 0,
          totalGemCoins: profile.totalGemCoins || profile.gemCoins || profile.coins || profile.totalCoins || 0,
          createdAt: data.createdAt || data.created_at,
          updatedAt: data.updatedAt || data.updated_at,
        } as UserAppUser);
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users by coin range:', error);
      throw error;
    }
  },
}; 