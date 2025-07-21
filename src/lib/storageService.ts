import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
}

export class StorageService {
  /**
   * Upload a file to Firebase Storage
   * @param file - The file to upload
   * @param path - The storage path (e.g., 'vehicle-brands/logos/')
   * @param fileName - Optional custom filename
   * @returns Promise with download URL and storage path
   */
  static async uploadFile(
    file: File, 
    path: string, 
    fileName?: string
  ): Promise<UploadResult> {
    try {
      // Generate unique filename if not provided
      const uniqueFileName = fileName || `${Date.now()}-${file.name}`;
      const fullPath = `${path}${uniqueFileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, fullPath);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: fullPath
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param path - The storage path to delete
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Upload vehicle brand logo
   * @param file - The logo image file
   * @param brandName - Brand name for filename
   * @returns Promise with download URL and storage path
   */
  static async uploadBrandLogo(file: File, brandName: string): Promise<UploadResult> {
    const sanitizedBrandName = brandName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const fileName = `${sanitizedBrandName}-${Date.now()}.${file.name.split('.').pop()}`;
    
    return this.uploadFile(file, 'vehicle-brands/logos/', fileName);
  }

  /**
   * Validate image file
   * @param file - The file to validate
   * @returns Validation result
   */
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPEG, PNG, or WebP)'
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB'
      };
    }

    return { isValid: true };
  }
} 
 