import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { InternshipApplication } from '../types/application';

const COLLECTION_NAME = 'internshipApplications';

// Add a new application
export const addApplication = async (application: Omit<InternshipApplication, 'id' | 'createdAt'>) => {
  try {
    const applicationWithTimestamp = {
      ...application,
      createdAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), applicationWithTimestamp);
    return { id: docRef.id, ...applicationWithTimestamp };
  } catch (error) {
    console.error('Error adding application:', error);
    throw error;
  }
};

// Get all applications
export const getApplications = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as InternshipApplication[];
  } catch (error) {
    console.error('Error getting applications:', error);
    throw error;
  }
};

// Get a single application by ID
export const getApplicationById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as InternshipApplication;
    } else {
      throw new Error('Application not found');
    }
  } catch (error) {
    console.error('Error getting application:', error);
    throw error;
  }
};

// Update an application
export const updateApplication = async (id: string, data: Partial<InternshipApplication>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

// Delete an application
export const deleteApplication = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};
