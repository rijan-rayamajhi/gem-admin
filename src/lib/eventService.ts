import { db } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface Event {
  id?: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  location: {
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
  organizer: {
    name: string;
    logo?: string; // Firebase Storage URL
    website: string;
    description: string;
  };
  type: 'ride_and_earn' | 'club_battle' | 'bike_show' | 'other';
  maxAttendees: number;
  mainImage?: string; // Firebase Storage URL
  gallery?: string[]; // Firebase Storage URLs
  videoUrl: string;
  tickets: Array<{
    name: string;
    description: string;
    price: number;
    slots: number;
    availableSlots: number;
  }>;
  sponsors: Array<{
    name: string;
    logo?: string; // Firebase Storage URL
    website: string;
    description: string;
  }>;
  guests: Array<{
    name: string;
    role: string;
    bio: string;
    photo?: string; // Firebase Storage URL
    socialMedia: {
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  termsAndConditions: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendees: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  insights: {
    views: number;
    viewsList: string[];
    visited: number;
    visitedList: string[];
    shared: number;
    sharedList: string[];
    liked: number;
    likedList: string[];
  };
  registeredUsers: Array<{
    userId: string;
    ticketId: string;
    payment: {
      paidAmount: number;
      paymentId: string;
      [key: string]: any;
    };
  }>;
  pin: boolean;
}

// Type for event updates that can handle File objects for uploads
export type EventUpdateData = Omit<Event, 'id' | 'status' | 'attendees' | 'createdAt' | 'updatedAt' | 'insights' | 'registeredUsers' | 'pin'> & {
  mainImage?: string | File;
  gallery?: (string | File)[];
  organizer?: {
    name: string;
    logo?: string | File;
    website: string;
    description: string;
  };
  sponsors?: Array<{
    name: string;
    logo?: string | File;
    website: string;
    description: string;
  }>;
  guests?: Array<{
    name: string;
    role: string;
    bio: string;
    photo?: string | File;
    socialMedia: {
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  }>;
};

class EventService {
  private collectionName = 'events';

  // Upload file to Firebase Storage and return URL
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Delete file from Firebase Storage
  async deleteFile(url: string): Promise<void> {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error as file might not exist
    }
  }

  // Upload multiple files and return URLs
  async uploadFiles(files: File[], basePath: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const fileName = `${Date.now()}_${index}_${file.name}`;
      const filePath = `${basePath}/${fileName}`;
      return this.uploadFile(file, filePath);
    });
    
    return Promise.all(uploadPromises);
  }

  async createEvent(eventData: Omit<Event, 'id' | 'status' | 'attendees' | 'createdAt' | 'updatedAt' | 'insights' | 'registeredUsers' | 'pin'>): Promise<string> {
    try {
      const eventWithMetadata = {
        ...eventData,
        status: 'upcoming' as const,
        attendees: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        insights: {
          views: 0,
          viewsList: [],
          visited: 0,
          visitedList: [],
          shared: 0,
          sharedList: [],
          liked: 0,
          likedList: [],
        },
        registeredUsers: [],
        pin: false,
      };

      const docRef = await addDoc(collection(db, this.collectionName), eventWithMetadata);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  async getEvents(): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Event;
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  }

  async updateEvent(eventId: string, eventData: Partial<EventUpdateData>): Promise<void> {
    try {
      const eventRef = doc(db, this.collectionName, eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const currentEvent = eventDoc.data() as Event;
      
      // Handle file uploads and deletions for updates
      const uploadPromises: Promise<any>[] = [];
      const deletePromises: Promise<void>[] = [];
      
      // Handle main image
      if (eventData.mainImage && typeof eventData.mainImage !== 'string') {
        const mainImageFile = eventData.mainImage as File;
        // Delete old main image if it exists
        if (currentEvent.mainImage) {
          deletePromises.push(this.deleteFile(currentEvent.mainImage));
        }
        // Upload new main image
        const mainImagePromise = this.uploadFile(
          mainImageFile,
          `events/main-images/${Date.now()}_${mainImageFile.name}`
        ).then(url => { eventData.mainImage = url; });
        uploadPromises.push(mainImagePromise);
      }

      // Handle gallery images
      if (eventData.gallery && Array.isArray(eventData.gallery) && eventData.gallery.length > 0) {
        // Check if gallery contains File objects (new uploads)
        const hasNewFiles = eventData.gallery.some(item => typeof item !== 'string');
        if (hasNewFiles) {
          // Delete old gallery images
          if (currentEvent.gallery) {
            currentEvent.gallery.forEach(url => {
              deletePromises.push(this.deleteFile(url));
            });
          }
          // Upload new gallery images
          const galleryFiles = eventData.gallery.filter(item => typeof item !== 'string') as File[];
          const galleryPromise = this.uploadFiles(
            galleryFiles,
            `events/gallery/${Date.now()}`
          ).then(urls => { eventData.gallery = urls; });
          uploadPromises.push(galleryPromise);
        }
      }

      // Handle organizer logo
      if (eventData.organizer?.logo && typeof eventData.organizer.logo !== 'string') {
        const organizerLogoFile = eventData.organizer.logo as File;
        // Delete old organizer logo if it exists
        if (currentEvent.organizer?.logo) {
          deletePromises.push(this.deleteFile(currentEvent.organizer.logo));
        }
        // Upload new organizer logo
        const organizerLogoPromise = this.uploadFile(
          organizerLogoFile,
          `events/organizers/${Date.now()}_${organizerLogoFile.name}`
        ).then(url => { eventData.organizer!.logo = url; });
        uploadPromises.push(organizerLogoPromise);
      }

      // Handle sponsor logos
      if (eventData.sponsors) {
        const sponsorLogoPromises = eventData.sponsors
          .map((sponsor, index) => {
            if (sponsor.logo && typeof sponsor.logo !== 'string') {
              const sponsorLogoFile = sponsor.logo as File;
              // Delete old sponsor logo if it exists
              const currentSponsor = currentEvent.sponsors?.[index];
              if (currentSponsor?.logo) {
                deletePromises.push(this.deleteFile(currentSponsor.logo));
              }
              // Upload new sponsor logo
              return this.uploadFile(
                sponsorLogoFile,
                `events/sponsors/${Date.now()}_${index}_${sponsorLogoFile.name}`
              ).then(url => { sponsor.logo = url; });
            }
            return Promise.resolve();
          });
        uploadPromises.push(...sponsorLogoPromises);
      }

      // Handle guest photos
      if (eventData.guests) {
        const guestPhotoPromises = eventData.guests
          .map((guest, index) => {
            if (guest.photo && typeof guest.photo !== 'string') {
              const guestPhotoFile = guest.photo as File;
              // Delete old guest photo if it exists
              const currentGuest = currentEvent.guests?.[index];
              if (currentGuest?.photo) {
                deletePromises.push(this.deleteFile(currentGuest.photo));
              }
              // Upload new guest photo
              return this.uploadFile(
                guestPhotoFile,
                `events/guests/${Date.now()}_${index}_${guestPhotoFile.name}`
              ).then(url => { guest.photo = url; });
            }
            return Promise.resolve();
          });
        uploadPromises.push(...guestPhotoPromises);
      }

      // Wait for all uploads and deletions to complete
      await Promise.all([...uploadPromises, ...deletePromises]);

      // Update the event with new data
      const updateData = {
        ...eventData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(eventRef, updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const eventRef = doc(db, this.collectionName, eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const event = eventDoc.data() as Event;
      
      // Delete all associated files from Firebase Storage
      const deletePromises: Promise<void>[] = [];
      
      if (event.mainImage) {
        deletePromises.push(this.deleteFile(event.mainImage));
      }
      
      if (event.gallery) {
        event.gallery.forEach(url => {
          deletePromises.push(this.deleteFile(url));
        });
      }
      
      if (event.organizer?.logo) {
        deletePromises.push(this.deleteFile(event.organizer.logo));
      }
      
      if (event.sponsors) {
        event.sponsors.forEach(sponsor => {
          if (sponsor.logo) {
            deletePromises.push(this.deleteFile(sponsor.logo));
          }
        });
      }
      
      if (event.guests) {
        event.guests.forEach(guest => {
          if (guest.photo) {
            deletePromises.push(this.deleteFile(guest.photo));
          }
        });
      }

      // Wait for all file deletions to complete
      await Promise.all(deletePromises);
      
      // Delete the event document
      await deleteDoc(eventRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  async getEventsByStatus(status: Event['status']): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Error fetching events by status:', error);
      throw new Error('Failed to fetch events by status');
    }
  }

  async getEventsByType(type: Event['type']): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Error fetching events by type:', error);
      throw new Error('Failed to fetch events by type');
    }
  }
}

export const eventService = new EventService(); 