import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

interface HireflixWebhookPayload {
  event: string;
  data?: {
    id: string;
    position: {
      id: string;
      name: string;
    };
    externalId?: string;
    status: string;
    completed: number;
    candidate: {
      name: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    url: {
      short: string;
      private: string;
      public: string;
    };
  };
  date?: number;
}

// GET - Webhook info
export async function GET() {
  return NextResponse.json({
    webhook: "Global Golf Intern - Hireflix",
    status: "active"
  });
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

// POST - Handle webhook
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);
    
    // Handle interview completion
    if (payload.event === 'interview.status-change' && payload.data?.status === 'completed') {
      await updateApplication(payload);
      
      return NextResponse.json({
        success: true,
        message: 'Interview completion processed'
      });
    }
    
    // Handle other events
    return NextResponse.json({
      success: true,
      message: `Event ${payload.event} logged`
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Update application with interview results
async function updateApplication(payload: HireflixWebhookPayload) {
  try {
    const email = payload.data?.candidate?.email;
    if (!email) return;
    
    // Find application by email
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return;
    
    const applicationDoc = querySnapshot.docs[0];
    
    // Update application
    await updateDoc(doc(db, 'applications', applicationDoc.id), {
      interviewCompleted: true,
      interviewId: payload.data?.id,
      interviewStatus: 'completed',
      interviewVideoUrl: payload.data?.url?.public,
      interviewCompletedAt: new Date().toISOString()
    });
    
    console.log(`Updated application for ${email}`);
  } catch (error) {
    console.error('Error updating application:', error);
  }
}
