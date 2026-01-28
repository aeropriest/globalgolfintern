import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminService } from '../../../../services/firebase-admin';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json();
    
    console.log('📝 Saving application to Firebase:', applicationData.email);
    
    // Remove the actual file object before saving to Firestore
    const { resumeFile, ...applicationToSave } = applicationData;
    
    // Save application using Firebase Admin service
    const applicationId = await FirebaseAdminService.saveApplication(applicationToSave);
    
    console.log('✅ Application saved successfully with ID:', applicationId);
    
    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Application saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving application:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
