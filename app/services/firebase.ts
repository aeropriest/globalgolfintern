'use client';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, deleteDoc, updateDoc, where } from 'firebase/firestore';
import { db, storage } from '../firebase/config';

export interface ApplicationData {
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  resumeUrl?: string;
  message?: string;
  status: string;
  timestamp: Date;
  surveyCompleted?: boolean;
  traitScores?: {
    extraversion: number;
    agreeableness: number;
    conscientiousness: number;
    openness: number;
    emotionalStability: number;
  };
  interviewId?: string;
  interviewUrl?: string;
  interviewStatus?: string;
  interviewCompleted?: boolean;
  interviewVideoUrl?: string;
  interviewShareUrl?: string;
  interviewCompletedAt?: string;
}

// Define the service as a plain object with methods
const FirebaseServiceImpl = {
  // Upload resume to Firebase Storage
  uploadResume: async (file: File, candidateId: string): Promise<string> => {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `resumes/${candidateId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  },
  
  // Save application data to Firestore as a single document with all details
  saveApplication: async (data: any): Promise<string> => {
    try {
      // Remove the actual file object before saving to Firestore
      const { resumeFile, ...applicationData } = data;
      
      // Initialize with default values for survey data
      const completeApplicationData = {
        ...applicationData,
        surveyCompleted: false,
        traitScores: null
      };
      
      const docRef = await addDoc(collection(db, 'applications'), completeApplicationData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving application:', error);
      throw error;
    }
  },
  
  // Get all applications
  getApplications: async (): Promise<ApplicationData[]> => {
    try {
      const q = query(collection(db, 'applications'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
    } catch (error) {
      console.error('Error getting applications:', error);
      throw error;
    }
  },
  
  // Update application with survey results in the same document
  updateApplicationWithSurvey: async (email: string, traitScores: any): Promise<boolean> => {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error('No application found with email:', email);
        return false;
      }
      
      const applicationDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'applications', applicationDoc.id), {
        surveyCompleted: true,
        traitScores: traitScores
      });
      
      return true;
    } catch (error) {
      console.error('Error updating application with survey results:', error);
      throw error;
    }
  },
  
  // Create interview for application
  createInterview: async (email: string, interviewId: string, interviewUrl: string): Promise<boolean> => {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error('No application found with email:', email);
        return false;
      }
      
      const applicationDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'applications', applicationDoc.id), {
        interviewId: interviewId,
        interviewUrl: interviewUrl,
        interviewStatus: 'pending',
        interviewCompleted: false
      });
      
      return true;
    } catch (error) {
      console.error('Error creating interview for application:', error);
      throw error;
    }
  },
  
  // Update application with interview results
  updateApplicationWithInterview: async (email: string, interviewData: any): Promise<boolean> => {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error('No application found with email:', email);
        return false;
      }
      
      const applicationDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'applications', applicationDoc.id), {
        interviewCompleted: true,
        interviewStatus: 'completed',
        interviewVideoUrl: interviewData.videoUrl,
        interviewShareUrl: interviewData.shareUrl,
        interviewCompletedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating application with interview results:', error);
      throw error;
    }
  }
};

// Export the service
export const FirebaseService = FirebaseServiceImpl;
