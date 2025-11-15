import { NextResponse } from 'next/server';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Update the candidate's application with survey results
    // This will store all data in a single document
    let updateSuccess = false;
    
    try {
      // Find application by email
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('email', '==', data.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing application
        const applicationDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'applications', applicationDoc.id), {
          surveyCompleted: true,
          traitScores: data.traitScores
        });
        updateSuccess = true;
      }
    } catch (error) {
      console.error('Error updating application with survey:', error);
    }
    
    if (!updateSuccess) {
      console.warn(`No application found with email: ${data.email}`);
      // If no application found, we'll create a new document with all the data
      // This is a fallback and shouldn't normally happen
      await addDoc(collection(db, 'applications'), {
        name: data.name,
        email: data.email,
        position: data.position || 'Golf Operations Intern',
        location: data.location || 'Unknown',
        timestamp: new Date(),
        status: 'Submitted',
        surveyCompleted: true,
        traitScores: data.traitScores
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Survey submitted successfully',
      applicationUpdated: updateSuccess
    });
  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit survey', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
