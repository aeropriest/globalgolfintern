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

// GET - Webhook info and health check
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`📋 Hireflix Webhook GET request at ${timestamp}`);
  
  return NextResponse.json({
    webhook: "Global Golf Intern - Hireflix Interview Monitor",
    status: "active",
    timestamp: timestamp,
    events: ["interview.status-change"],
    description: "Monitors Hireflix interview process and updates application status",
    setup: {
      url: `${request.nextUrl.origin}/api/webhooks/hireflix`,
      method: "POST",
      events: ["interview.status-change"]
    }
  });
}

// Add CORS headers for webhook
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  console.log('🔧 CORS preflight request received');
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// POST - Handle Hireflix webhook notifications
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log('\n' + '='.repeat(80));
  console.log(`🔔 HIREFLIX WEBHOOK RECEIVED AT ${timestamp}`);
  console.log('='.repeat(80));
  console.log(`📌 PROCESS ID: ${process.pid}`);
  console.log(`📌 NODE ENV: ${process.env.NODE_ENV}`);
  
  try {
    console.log('📡 Request Details:');
    console.log(`   Method: ${request.method}`);
    console.log(`   URL: ${request.url}`);
    
    console.log('\n📥 Reading request body...');
    const rawBody = await request.text();
    console.log(`📄 Raw body length: ${rawBody.length} characters`);
    console.log(`📄 Raw body preview: ${rawBody.substring(0, 100)}...`);
    
    let payload: HireflixWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid JSON payload');
    }
    
    console.log('\n🔍 PAYLOAD ANALYSIS:');
    console.log('📋 Event Type:', payload.event || 'MISSING');
    
    // Handle different Hireflix event types
    if (payload.event === 'interview.status-change') {
      console.log('\n🔄 Processing interview.status-change event');
      
      if (payload.data?.status === 'completed') {
        console.log('✅ Interview completed via status-change event');
        
        // Update application in Firestore
        await updateApplicationWithInterviewResults(payload);
        
        const response = NextResponse.json({
          success: true,
          message: 'Interview completion processed',
          interviewId: payload.data.id,
          candidateId: payload.data.externalId,
          timestamp: timestamp
        });
        return addCorsHeaders(response);
      } else {
        console.log(`ℹ️  Status change to: ${payload.data?.status} (not completed, ignoring)`);
      }
    }
    
    // Log all other events for monitoring
    console.log(`ℹ️  Event logged: ${payload.event}`);
    const response = NextResponse.json({
      success: true,
      message: `Event ${payload.event} logged successfully`,
      timestamp: timestamp
    });
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('❌ Webhook: Error processing notification:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  } finally {
    console.log('🔚 Webhook processing completed at', new Date().toISOString());
    console.log('='.repeat(80));
  }
}

// Update application with interview results
async function updateApplicationWithInterviewResults(payload: HireflixWebhookPayload) {
  try {
    console.log('\n📝 UPDATING APPLICATION WITH INTERVIEW RESULTS');
    
    const candidateEmail = payload.data?.candidate?.email;
    if (!candidateEmail) {
      console.warn('⚠️ No candidate email provided');
      return;
    }
    
    console.log(`🔍 Looking for application with email: ${candidateEmail}`);
    
    // Find application by email
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('email', '==', candidateEmail));
    console.log(`🔍 Executing Firestore query: ${q}`);
    
    const querySnapshot = await getDocs(q);
    console.log(`📊 Query results: ${querySnapshot.size} documents found`);
    
    if (querySnapshot.empty) {
      console.warn(`⚠️ No application found with email: ${candidateEmail}`);
      return;
    }
    
    const applicationDoc = querySnapshot.docs[0];
    const applicationId = applicationDoc.id;
    const currentData = applicationDoc.data();
    
    console.log(`📋 Found application: ${applicationId}`);
    console.log(`📋 Current application data:`, JSON.stringify({
      name: currentData.name,
      email: currentData.email,
      position: currentData.position,
      surveyCompleted: currentData.surveyCompleted,
      interviewStatus: currentData.interviewStatus
    }, null, 2));
    
    // Prepare update data
    const updateData = {
      interviewCompleted: true,
      interviewId: payload.data?.id,
      interviewStatus: 'completed',
      interviewVideoUrl: payload.data?.url?.public,
      interviewShareUrl: payload.data?.url?.short,
      interviewCompletedAt: new Date().toISOString()
    };
    
    console.log(`📤 Updating application with data:`, JSON.stringify(updateData, null, 2));
    
    // Update application with interview results
    await updateDoc(doc(db, 'applications', applicationId), updateData);
    
    console.log(`✅ Updated application ${applicationId} with interview results`);
    
    // Verify the update
    const updatedDoc = await getDoc(doc(db, 'applications', applicationId));
    const updatedData = updatedDoc.data();
    
    console.log(`📋 Updated application data:`, JSON.stringify({
      name: updatedData?.name,
      email: updatedData?.email,
      interviewCompleted: updatedData?.interviewCompleted,
      interviewStatus: updatedData?.interviewStatus,
      interviewVideoUrl: updatedData?.interviewVideoUrl ? '✓ Present' : '✗ Missing',
      interviewCompletedAt: updatedData?.interviewCompletedAt
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error updating application with interview results:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}
