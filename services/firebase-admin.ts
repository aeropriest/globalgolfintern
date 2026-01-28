import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Timestamp, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
let app: any;
let db: Firestore;
let storage: any;

// Function to initialize Firebase Admin (for server-side use)
export function initializeFirebaseAdmin() {
  if (!app) {
    try {
      // Check if Firebase Admin app already exists
      const existingApps = getApps();
      if (existingApps.length > 0) {
        console.log('🔄 Using existing Firebase Admin app');
        app = existingApps[0];
      } else {
        // Initialize Firebase Admin with service account
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        
        console.log('🔥 Initializing Firebase Admin...');
        console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
        console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
        console.log('   Private Key present:', !!privateKey);
        
        if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
          throw new Error('Missing Firebase Admin configuration in environment variables');
        }

        app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
        
        console.log('✅ Firebase Admin initialized successfully');
      }

      db = getFirestore(app);
      storage = getStorage(app);
      
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin:', error);
      throw error;
    }
  }
  return { app, db, storage };
}

// Helper function to ensure Firebase is initialized before operations
function ensureFirebaseInitialized() {
  if (!db) {
    console.log('🔄 Firebase not initialized, initializing now...');
    initializeFirebaseAdmin();
  }
  if (!db) {
    throw new Error('Failed to initialize Firebase Admin - Firestore not available');
  }
}

// Initialize Firebase Admin on import
try {
  initializeFirebaseAdmin();
} catch (error) {
  console.error('Failed to initialize Firebase Admin on import:', error);
}

export interface QuizResult {
  id?: string;
  name: string;
  email: string;
  manatalUrl?: string;
  hireflixUrl?: string;
  candidateId?: string;
  answers: Record<number, number>;
  traitScores: Record<string, number>;
  timestamp: Date | Timestamp;
}

export interface SurveyResult {
  id?: string;
  candidateId?: string;
  name?: string;
  email: string;
  position?: string;
  answers: Record<string, Record<number, number>>;
  traitScores: Record<string, number>;
  timestamp?: Date | Timestamp;
  applicationId?: string | null;
}

export interface ApplicationData {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  position?: string;
  positionId?: string;
  resumeUrl?: string;
  resumeFile?: File;
  passportCountry?: string;
  golfHandicap?: string;
  message?: string;
  status?: string;
  candidateId?: string | number;
  manatalCandidateId?: string | number;
  hireflixInterviewId?: string;
  hireflixInterviewUrl?: string;
  hireflixInterviewStatus?: string;
  surveyCompleted?: boolean;
  surveyId?: string;
  surveyCompletedAt?: Date | Timestamp;
  timestamp?: Date | Timestamp;
  quizCompleted?: boolean;
  interviewCompleted?: boolean;
}

export class FirebaseAdminService {
  // File storage methods
  static async uploadResume(file: Buffer, fileName: string, candidateId: string): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    try {
      // Create a storage reference
      const fileExtension = fileName.split('.').pop();
      const storageFileName = `resumes/${candidateId}_${Date.now()}.${fileExtension}`;
      const bucket = storage.bucket();
      const fileRef = bucket.file(storageFileName);
      
      // Upload the file
      await fileRef.save(file);
      
      // Get the download URL
      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storageFileName}`;
      console.log('Resume uploaded successfully, URL:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }
  
  // Application methods
  static async saveApplication(application: ApplicationData): Promise<string> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      // Add timestamp if not provided
      if (!application.timestamp) {
        application.timestamp = Timestamp.now();
      }
      
      // Remove the actual file object before saving to Firestore
      const { resumeFile, ...applicationData } = application;
      
      const docRef = await db.collection('applications').add(applicationData);
      console.log('Application saved to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving application to Firestore:', error);
      throw error;
    }
  }
  
  static async getApplications(): Promise<ApplicationData[]> {
    try {
      ensureFirebaseInitialized();
      
      const querySnapshot = await db.collection('applications').get();
      const applications: ApplicationData[] = [];
      
      querySnapshot.forEach((doc: any) => {
        const data = doc.data() as ApplicationData;
        data.id = doc.id;
        
        // Convert Firestore timestamp to Date if needed
        if (data.timestamp && typeof data.timestamp !== 'string') {
          data.timestamp = (data.timestamp as any).toDate();
        }
        
        applications.push(data);
      });
      
      return applications;
    } catch (error) {
      console.error('Error getting applications from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationById(id: string): Promise<ApplicationData | null> {
    try {
      ensureFirebaseInitialized();
      
      const docRef = db.collection('applications').doc(id);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        return null;
      }
      
      const data = docSnap.data() as ApplicationData;
      data.id = docSnap.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting application by ID from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationByEmail(email: string): Promise<ApplicationData | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const querySnapshot = await db.collection('applications').where('email', '==', email).get();
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as ApplicationData;
      data.id = doc.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting application by email from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationByCandidateId(candidateId: string | number): Promise<ApplicationData | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const querySnapshot = await db.collection('applications').where('candidateId', '==', candidateId.toString()).get();
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as ApplicationData;
      data.id = doc.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting application by candidate ID from Firestore:', error);
      throw error;
    }
  }
  
  static async updateApplication(id: string, updates: Partial<ApplicationData>): Promise<void> {
    try {
      ensureFirebaseInitialized();
      
      // Remove the actual file object before updating Firestore
      const { resumeFile, ...updatesData } = updates;
      
      const docRef = db.collection('applications').doc(id);
      await docRef.update(updatesData);
      console.log('Application updated successfully');
    } catch (error) {
      console.error('Error updating application in Firestore:', error);
      throw error;
    }
  }

  static async updateApplicationByCandidateId(candidateId: string | number, updates: Partial<ApplicationData>): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      // Find application by candidate ID
      const querySnapshot = await db.collection('applications').where('candidateId', '==', candidateId.toString()).get();
      
      if (querySnapshot.empty) {
        console.warn(`No application found for candidate ID: ${candidateId}`);
        return;
      }
      
      // Update the first matching application
      const doc = querySnapshot.docs[0];
      const docRef = db.collection('applications').doc(doc.id);
      
      // Remove the actual file object before updating Firestore
      const { resumeFile, ...updatesData } = updates;
      
      await docRef.update(updatesData);
      console.log(`Application updated successfully for candidate ID: ${candidateId}`);
    } catch (error) {
      console.error('Error updating application by candidate ID in Firestore:', error);
      throw error;
    }
  }
  
  static async deleteApplication(id: string): Promise<void> {
    try {
      ensureFirebaseInitialized();
      
      const docRef = db.collection('applications').doc(id);
      await docRef.delete();
      console.log('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application from Firestore:', error);
      throw error;
    }
  }

  static async saveQuizResult(quizResult: QuizResult): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Add timestamp if not provided
      if (!quizResult.timestamp) {
        quizResult.timestamp = Timestamp.now();
      }

      const docRef = await db.collection('quizResults').add(quizResult);
      console.log('Quiz result saved to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving quiz result to Firestore:', error);
      throw error;
    }
  }

  static async saveSurveyResult(surveyResult: SurveyResult): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Add timestamp if not provided
      if (!surveyResult.timestamp) {
        surveyResult.timestamp = Timestamp.now();
      }

      const docRef = await db.collection('surveyResults').add(surveyResult);
      console.log('Survey result saved to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving survey result to Firestore:', error);
      throw error;
    }
  }

  static async getQuizResults(): Promise<QuizResult[]> {
    try {
      ensureFirebaseInitialized();

      const querySnapshot = await db.collection('quizResults').get();
      const results: QuizResult[] = [];
      
      querySnapshot.forEach((doc: any) => {
        const data = doc.data() as QuizResult;
        data.id = doc.id;
        // Convert Firestore timestamp to Date if needed
        if (data.timestamp && typeof data.timestamp !== 'string') {
          data.timestamp = (data.timestamp as any).toDate();
        }
        results.push(data);
      });
      
      return results;
    } catch (error) {
      console.error('Error getting quiz results from Firestore:', error);
      throw error;
    }
  }

  static async getQuizResultByEmail(email: string): Promise<QuizResult | null> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const querySnapshot = await db.collection('quizResults').where('email', '==', email).get();
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as QuizResult;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting quiz result by email from Firestore:', error);
      throw error;
    }
  }

  static async getQuizResultByCandidateId(candidateId: string): Promise<QuizResult | null> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const querySnapshot = await db.collection('quizResults').where('candidateId', '==', candidateId).get();
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as QuizResult;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting quiz result by candidate ID from Firestore:', error);
      throw error;
    }
  }

  static async getSurveyResults(): Promise<SurveyResult[]> {
    try {
      ensureFirebaseInitialized();

      const querySnapshot = await db.collection('surveyResults').get();
      const results: SurveyResult[] = [];
      
      querySnapshot.forEach((doc: any) => {
        const data = doc.data() as SurveyResult;
        data.id = doc.id;
        
        // Convert Firestore timestamp to Date if needed
        if (data.timestamp && typeof data.timestamp !== 'string') {
          data.timestamp = (data.timestamp as any).toDate();
        }
        results.push(data);
      });
      
      return results;
    } catch (error) {
      console.error('Error getting survey results from Firestore:', error);
      throw error;
    }
  }

  static async getSurveyResultByEmail(email: string): Promise<SurveyResult | null> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const querySnapshot = await db.collection('surveyResults').where('email', '==', email).get();
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as SurveyResult;
      data.id = doc.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting survey result by email from Firestore:', error);
      throw error;
    }
  }

  static async getSurveyResultByCandidateId(candidateId: string): Promise<SurveyResult | null> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const querySnapshot = await db.collection('surveyResults').where('candidateId', '==', candidateId).get();
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as SurveyResult;
      data.id = doc.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting survey result by candidate ID from Firestore:', error);
      throw error;
    }
  }

  static async getSurveyResultById(id: string): Promise<SurveyResult | null> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const docRef = db.collection('surveyResults').doc(id);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        return null;
      }
      
      const data = docSnap.data() as SurveyResult;
      data.id = docSnap.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting survey result by ID from Firestore:', error);
      throw error;
    }
  }

  // Alias for getApplications - for backward compatibility
  static async getCandidates(): Promise<ApplicationData[]> {
    return this.getApplications();
  }
}

// Alias for backward compatibility
export type CandidateData = ApplicationData;

export { db, storage };
