import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminService } from '../../../../services/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Define the structure of the survey submission
interface SurveySubmission {
  candidateId: string;
  name: string;
  email: string;
  position: string;
  answers: Record<string, Record<number, number>>;
  traitScores: Record<string, number>;
  resume?: File;
}

// Categories for the survey
const CATEGORIES = [
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'openness',
  'emotionalStability'
];

export async function POST(request: NextRequest) {
  try {
    let submission: SurveySubmission;
    let resumeBuffer: Buffer | null = null;
    let resumeFileName: string | null = null;

    // Check if the request is multipart/form-data (for resume upload)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data
      const formData = await request.formData();
      
      // Extract form fields
      const candidateId = formData.get('candidateId') as string;
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const position = formData.get('position') as string;
      const answers = JSON.parse(formData.get('answers') as string);
      const traitScores = JSON.parse(formData.get('traitScores') as string);
      const resume = formData.get('resume') as File | null;

      submission = {
        candidateId,
        name,
        email,
        position,
        answers,
        traitScores
      };

      // Handle resume upload if present
      if (resume && resume.size > 0) {
        resumeBuffer = Buffer.from(await resume.arrayBuffer());
        resumeFileName = resume.name;
      }
    } else {
      // Handle JSON data (existing behavior)
      submission = await request.json();
    }
    
    // Validate the submission
    if (!submission.email || !submission.answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Survey submission received:', {
      candidateId: submission.candidateId,
      name: submission.name,
      email: submission.email,
      position: submission.position,
      traitScores: submission.traitScores,
      hasResume: !!resumeBuffer
    });
    
    // Save the survey data to Firebase
    try {
      // First, check if we have an application for this candidate
      let application = null;
      
      if (submission.email) {
        application = await FirebaseAdminService.getApplicationByEmail(submission.email);
      }
      
      if (!application && submission.candidateId) {
        application = await FirebaseAdminService.getApplicationByCandidateId(submission.candidateId);
      }

      // Handle resume upload if present
      let resumeUrl = null;
      if (resumeBuffer && resumeFileName && submission.candidateId) {
        try {
          resumeUrl = await FirebaseAdminService.uploadResume(
            resumeBuffer, 
            resumeFileName, 
            submission.candidateId
          );
          console.log('Resume uploaded successfully:', resumeUrl);
        } catch (uploadError) {
          console.error('Error uploading resume:', uploadError);
          // Continue with survey submission even if resume upload fails
        }
      }
      
      // Prepare survey data
      const surveyData = {
        candidateId: submission.candidateId,
        name: submission.name,
        email: submission.email,
        position: submission.position,
        answers: submission.answers,
        traitScores: submission.traitScores,
        timestamp: Timestamp.now(),
        applicationId: application?.id || null,
        resumeUrl: resumeUrl
      };
      
      // Save survey to Firestore
      const surveyId = await FirebaseAdminService.saveSurveyResult(surveyData);
      
      // If we found an application, update it with the survey completion info and resume
      if (application && application.id) {
        const updateData: any = {
          surveyCompleted: true,
          surveyId: surveyId,
          surveyCompletedAt: Timestamp.now(),
          status: 'Survey Completed'
        };

        // Add resume URL to application if uploaded
        if (resumeUrl) {
          updateData.resumeUrl = resumeUrl;
        }

        await FirebaseAdminService.updateApplication(application.id, updateData);
      }
      
      // Return success response with the survey ID
      return NextResponse.json({ 
        success: true,
        surveyId: surveyId,
        resumeUrl: resumeUrl,
        message: 'Survey submitted successfully'
      });
    } catch (error) {
      console.error('Firebase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to save survey to database', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}
