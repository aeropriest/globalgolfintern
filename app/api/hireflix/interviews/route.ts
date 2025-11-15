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
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    console.log('🌐 Hireflix Interview API: Creating interview invitation...');
    console.log(`👤 Candidate: ${data.candidate_name} (${data.candidate_email})`);
    console.log(`📋 Position ID: ${data.position_id}`);
    
    // Create interview invitation in Hireflix
    const inviteMutation = `
      mutation InviteCandidate($positionId: String!, $candidateEmail: String!, $candidateName: String!) {
        Position(id: $positionId) {
          invite(candidate: { 
            email: $candidateEmail, 
            name: $candidateName
          }) {
            url {
              public
            }
            id
          }
        }
      }
    `;
    
    const variables = {
      positionId: data.position_id,
      candidateEmail: data.candidate_email,
      candidateName: data.candidate_name
    };
    
    console.log(`🆔 Candidate ID: ${data.candidateId}`);
    
    // In a real application, you would make an actual API call to Hireflix
    // For now, we'll simulate a successful response
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock interview ID and URL
    const interviewId = `interview_${Date.now()}`;
    const interviewUrl = `https://app.hireflix.com/interviews/${interviewId}`;
    
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
