import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc,
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BugReportRepository } from '../../domain/repositories/BugReportRepository';
import { BugReport, BugReportComment } from '../../domain/entities/BugReport';

export class FirebaseBugReportRepository implements BugReportRepository {
  private bugReportsCollection = 'bug_reports';
  private commentsCollection = 'bug_report_comments';

  async getAllBugReports(): Promise<BugReport[]> {
    try {
      const q = query(
        collection(db, this.bugReportsCollection),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => this.mapFirestoreToBugReport(doc));
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      throw new Error('Failed to fetch bug reports');
    }
  }

  async getBugReportsByStatus(status: string): Promise<BugReport[]> {
    try {
      const q = query(
        collection(db, this.bugReportsCollection),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .map(doc => this.mapFirestoreToBugReport(doc))
        .filter(report => report.status === status);
    } catch (error) {
      console.error('Error fetching bug reports by status:', error);
      throw new Error('Failed to fetch bug reports by status');
    }
  }

  async getBugReportById(id: string): Promise<BugReport | null> {
    try {
      const docRef = doc(db, this.bugReportsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return this.mapFirestoreToBugReport(docSnap);
    } catch (error) {
      console.error('Error fetching bug report by ID:', error);
      throw new Error('Failed to fetch bug report');
    }
  }

  async createBugReport(bugReport: Omit<BugReport, 'id' | 'createdAt'>): Promise<BugReport> {
    try {
      const bugReportData = {
        ...bugReport,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.bugReportsCollection), bugReportData);
      
      return {
        ...bugReport,
        id: docRef.id,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating bug report:', error);
      throw new Error('Failed to create bug report');
    }
  }

  async updateBugReport(id: string, updates: Partial<BugReport>): Promise<BugReport> {
    try {
      const docRef = doc(db, this.bugReportsCollection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Bug report not found after update');
      }
      
      return this.mapFirestoreToBugReport(updatedDoc);
    } catch (error) {
      console.error('Error updating bug report:', error);
      throw new Error('Failed to update bug report');
    }
  }

  async deleteBugReport(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.bugReportsCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting bug report:', error);
      throw new Error('Failed to delete bug report');
    }
  }

  async getBugReportComments(bugReportId: string): Promise<BugReportComment[]> {
    try {
      const q = query(
        collection(db, this.commentsCollection),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .map(doc => this.mapFirestoreToComment(doc))
        .filter(comment => comment.bugReportId === bugReportId);
    } catch (error) {
      console.error('Error fetching bug report comments:', error);
      throw new Error('Failed to fetch comments');
    }
  }

  async addBugReportComment(comment: Omit<BugReportComment, 'id' | 'createdAt'>): Promise<BugReportComment> {
    try {
      const commentData = {
        ...comment,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.commentsCollection), commentData);
      
      return {
        ...comment,
        id: docRef.id,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  async updateBugReportComment(id: string, content: string): Promise<BugReportComment> {
    try {
      const docRef = doc(db, this.commentsCollection, id);
      await updateDoc(docRef, { content });
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Comment not found after update');
      }
      
      return this.mapFirestoreToComment(updatedDoc);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    }
  }

  async deleteBugReportComment(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.commentsCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    }
  }

  private mapFirestoreToBugReport(doc: QueryDocumentSnapshot): BugReport {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      severity: data.severity,
      status: data.status,
      screenshots: data.screenshots || [],
      stepsToReproduce: data.stepsToReproduce,
      deviceInfo: data.deviceInfo,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      rewardAmount: data.rewardAmount || 0,
      adminNotes: data.adminNotes
    };
  }

  private mapFirestoreToComment(doc: QueryDocumentSnapshot): BugReportComment {
    const data = doc.data();
    return {
      id: doc.id,
      bugReportId: data.bugReportId,
      userId: data.userId,
      content: data.content,
      createdAt: data.createdAt?.toDate() || new Date(),
      isAdmin: data.isAdmin || false
    };
  }
}
