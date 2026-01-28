import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminService } from '../../../../services/firebase-admin';

interface UpdateInterviewRequest {
  candidateId: string | number;
  hireflixInterviewId?: string;
  hireflixInterviewUrl?: string;
  hireflixInterviewStatus?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Update Interview API: Received request to update interview information');
    
    const data: UpdateInterviewRequest = await request.json();
    console.log('📝 Update Interview API: Request data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.candidateId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: candidateId' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.hireflixInterviewId !== undefined) {
      updateData.hireflixInterviewId = data.hireflixInterviewId;
    }
    
    if (data.hireflixInterviewUrl !== undefined) {
      updateData.hireflixInterviewUrl = data.hireflixInterviewUrl;
    }
    
    if (data.hireflixInterviewStatus !== undefined) {
      updateData.hireflixInterviewStatus = data.hireflixInterviewStatus;
    }

    // Add timestamp for tracking
    updateData.interviewUpdatedAt = new Date().toISOString();

    console.log('📝 Update Interview API: Updating application with data:', JSON.stringify(updateData, null, 2));

    // Update application by candidate ID
    await FirebaseAdminService.updateApplicationByCandidateId(data.candidateId, updateData);
    
    console.log('✅ Update Interview API: Interview information updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Interview information updated successfully',
      candidateId: data.candidateId,
      updatedFields: Object.keys(updateData)
    });

  } catch (error) {
    console.error('❌ Update Interview API: Error updating interview information:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update interview information', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
