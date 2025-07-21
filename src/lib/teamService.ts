import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface TeamMember {
  id?: string;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  department: string;
  position: string;
  startDate: string;
  salary: string;
  permissions: string[];
  notes: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Add a new team member
export const addTeamMember = async (teamMember: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'team'), {
      ...teamMember,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

// Get all team members
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const q = query(collection(db, 'team'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const teamMembers: TeamMember[] = [];
    
    querySnapshot.forEach((doc) => {
      teamMembers.push({
        id: doc.id,
        ...doc.data()
      } as TeamMember);
    });
    
    return teamMembers;
  } catch (error) {
    console.error('Error getting team members:', error);
    throw error;
  }
};

// Update a team member
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
  try {
    const docRef = doc(db, 'team', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

// Delete a team member
export const deleteTeamMember = async (id: string) => {
  try {
    const docRef = doc(db, 'team', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

// Get team members by department
export const getTeamMembersByDepartment = async (department: string): Promise<TeamMember[]> => {
  try {
    const q = query(
      collection(db, 'team'), 
      where('department', '==', department),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const teamMembers: TeamMember[] = [];
    
    querySnapshot.forEach((doc) => {
      teamMembers.push({
        id: doc.id,
        ...doc.data()
      } as TeamMember);
    });
    
    return teamMembers;
  } catch (error) {
    console.error('Error getting team members by department:', error);
    throw error;
  }
};

// Get team members by role
export const getTeamMembersByRole = async (role: string): Promise<TeamMember[]> => {
  try {
    const q = query(
      collection(db, 'team'), 
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const teamMembers: TeamMember[] = [];
    
    querySnapshot.forEach((doc) => {
      teamMembers.push({
        id: doc.id,
        ...doc.data()
      } as TeamMember);
    });
    
    return teamMembers;
  } catch (error) {
    console.error('Error getting team members by role:', error);
    throw error;
  }
}; 