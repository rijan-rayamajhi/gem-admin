import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { StorageService } from './storageService';

export interface ApkUpload {
  apkUrl: string;
  apkName: string;
  version: string;
  debugNote: string;
  publishDate: string;
  dueDate: string;
  module: string;
  status: string;
  uploadedAt: any;
}

class QualityAssuranceService {
  private collectionName = 'apk_uploads';

  async uploadApkAndSaveData(
    file: File,
    data: Omit<ApkUpload, 'apkUrl' | 'apkName' | 'uploadedAt'>
  ): Promise<string> {
    // 1. Upload APK file to Firebase Storage
    const uploadResult = await StorageService.uploadFile(file, 'apk-files/');
    // 2. Save metadata to Firestore
    const apkData: ApkUpload = {
      apkUrl: uploadResult.url,
      apkName: uploadResult.path.split('/').pop() || file.name,
      version: data.version,
      debugNote: data.debugNote,
      publishDate: data.publishDate,
      dueDate: data.dueDate,
      module: data.module,
      status: data.status,
      uploadedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, this.collectionName), apkData);
    return docRef.id;
  }
}

export const qualityAssuranceService = new QualityAssuranceService(); 