import { NextRequest, NextResponse } from 'next/server';

// In a real application, you would store this in an environment variable
const HIREFLIX_API_KEY = process.env.NEXT_PUBLIC_HIREFLIX_API_KEY || 'your-hireflix-api-key';

interface InterviewRequest {
  position_id: string;
  candidate_email: string;
  candidate_name: string;
  candidateId?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Hireflix Interview API: Received interview creation request');
    
    const data: InterviewRequest = await request.json();
    console.log('📝 Hireflix Interview API: Request data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ['position_id', 'candidate_email', 'candidate_name'];
    for (const field of requiredFields) {
      if (!data[field as keyof InterviewRequest]) {
        console.error(`❌ Missing required field: ${field}`);
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    console.log('🌐 Hireflix Interview API: Creating interview invitation...');
    console.log(`👤 Candidate: ${data.candidate_name} (${data.candidate_email})`);
    console.log(`📋 Position ID: ${data.position_id}`);
    console.log(`🆔 External ID (Candidate ID): ${data.candidateId || 'Not provided'}`);
    
    // In a real implementation, you would call the Hireflix API here
    // For this example, we'll mock the response
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock interview ID and URL - use a URL that can be embedded in an iframe
    const interviewId = `interview_${Date.now()}`;
    const interviewUrl = `https://app.hireflix.com/s/interview/start?mock=${Date.now()}`;
    
    console.log('✅ Hireflix Interview API: Interview created successfully!');
    console.log('🆔 Interview ID:', interviewId);
    console.log('🔗 Interview URL:', interviewUrl);
    
    const responsePayload = {
      success: true,
      interview: {
        id: interviewId,
        position_id: data.position_id,
        candidate_email: data.candidate_email,
        interview_url: interviewUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
        candidateId: data.candidateId
      }
    };
    
    return NextResponse.json(responsePayload);
    
  } catch (error) {
    console.error('💥 Hireflix Interview API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create interview. Please try again.' },
      { status: 500 }
    );
  }
}
