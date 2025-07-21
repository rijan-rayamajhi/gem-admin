import { db } from './firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test write operation
    const testData = {
      test: true,
      message: 'Firebase connection test',
      timestamp: Timestamp.now(),
    };
    
    console.log('Attempting to write test document...');
    const docRef = await addDoc(collection(db, 'test'), testData);
    console.log('Test document written successfully with ID:', docRef.id);
    
    // Test read operation
    console.log('Attempting to read test documents...');
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('Test documents read successfully. Count:', querySnapshot.size);
    
    return { success: true, docId: docRef.id, readCount: querySnapshot.size };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 