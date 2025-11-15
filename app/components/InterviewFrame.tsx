'use client';

import React, { useState, useEffect } from 'react';
import { HireflixService } from '../services/hireflix';
import { FirebaseService } from '../services/firebase';
import { Loader } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface InterviewFrameProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  onComplete?: () => void;
}

export default function InterviewFrame({ candidateId, candidateName, candidateEmail, onComplete }: InterviewFrameProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewUrl, setInterviewUrl] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const createOrGetInterview = async () => {
      try {
        console.log('🎬 InterviewFrame: Starting interview creation process');
        console.log(`🧑‍💼 Candidate: ${candidateName} (${candidateEmail})`);
        console.log(`🆔 Candidate ID: ${candidateId}`);
        
        setLoading(true);
        setError(null);

        // Get positions (in a real app, you might let the user select a position)
        console.log('📋 Fetching available positions...');
        const positions = await HireflixService.getPositions();
        console.log(`📋 Found ${positions.length} positions:`, positions.map(p => p.title).join(', '));
        
        if (!positions || positions.length === 0) {
          console.error('❌ No positions available for interview');
          throw new Error('No positions available for interview');
        }

        // Use the first position for this example
        const positionId = positions[0].id;
        console.log(`📌 Selected position: ${positions[0].title} (${positionId})`);

        // Create interview
        console.log('🔄 Creating interview with Hireflix...');
        const response = await HireflixService.createInterview(
          positionId,
          candidateEmail,
          candidateName,
          candidateId
        );

        console.log('📊 Hireflix response:', JSON.stringify(response, null, 2));

        if (!response.success) {
          console.error('❌ Failed to create interview:', response.message);
          throw new Error(response.message || 'Failed to create interview');
        }

        // Save interview data to Firebase
        if (response.interview.interview_url) {
          console.log('💾 Saving interview data to Firebase...');
          console.log(`🔗 Interview URL: ${response.interview.interview_url}`);
          console.log(`🆔 Interview ID: ${response.interview.id}`);
          
          const saveResult = await FirebaseService.createInterview(
            candidateEmail,
            response.interview.id,
            response.interview.interview_url
          );
          
          console.log(`💾 Firebase save result: ${saveResult ? 'Success' : 'Failed'}`);
        } else {
          console.warn('⚠️ No interview URL provided in response');
        }

        console.log('✅ Interview setup complete');
        setInterviewId(response.interview.id);
        setInterviewUrl(response.interview.interview_url);
      } catch (error) {
        console.error('❌ Error creating interview:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    createOrGetInterview();
  }, [candidateId, candidateName, candidateEmail]);

  // Poll for interview completion
  useEffect(() => {
    if (!interviewId || !candidateEmail || isCompleted) return;
    
    console.log('🕐 Starting polling mechanism to check interview completion');
    
    const checkInterviewStatus = async () => {
      try {
        // In a real app, this would be an API call to check the interview status
        // For now, we'll check Firebase directly
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where('email', '==', candidateEmail));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const applicationDoc = querySnapshot.docs[0];
          const data = applicationDoc.data();
          
          console.log('🔍 Polling: Checking interview status for', candidateEmail);
          
          if (data.interviewCompleted) {
            console.log('✅ Polling: Interview completed detected!');
            setIsCompleted(true);
            if (onComplete) {
              onComplete();
            }
            return true; // Stop polling
          }
        }
        return false; // Continue polling
      } catch (error) {
        console.error('❌ Error checking interview status:', error);
        return false;
      }
    };
    
    // Check immediately
    checkInterviewStatus();
    
    // Then check every 10 seconds
    const intervalId = setInterval(async () => {
      const shouldStop = await checkInterviewStatus();
      if (shouldStop) {
        clearInterval(intervalId);
      }
    }, 10000);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, [interviewId, candidateEmail, isCompleted, onComplete]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
        <Loader className="h-8 w-8 animate-spin text-pink-500 mb-4" />
        <p className="text-gray-600">Setting up your interview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-green-600 mb-2">Interview Completed</h3>
        <p className="text-gray-600 mb-4">
          Thank you for completing your interview! Our team will review your responses and get back to you soon.
        </p>
        <button
          onClick={onComplete}
          className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!interviewUrl) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-yellow-600 mb-2">Interview Not Available</h3>
        <p className="text-gray-600 mb-4">
          We couldn't find an interview link for you. Please contact support for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Video Interview Instructions</h3>
        <p className="text-gray-700 mb-4">
          <strong>Important:</strong> Please ensure you are in a quiet environment with good lighting.
          This interview requires access to your camera and microphone. You will be asked several
          questions to answer via video recording.
        </p>
        <p className="text-gray-700 mb-2">
          When you're ready, the interview will appear below. Follow the on-screen instructions to complete each question.
        </p>
      </div>
      
      <div className="relative w-full h-[70vh] bg-gray-100 rounded-lg shadow-lg overflow-hidden">
        {interviewUrl ? (
          <iframe
            src={interviewUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="camera; microphone; fullscreen"
            title="Hireflix Interview"
            id="hireflix-interview-frame"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading interview...</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
        <p>
          Having technical issues? <button className="text-pink-600 underline" onClick={() => window.location.reload()}>Refresh the page</button>
        </p>
        <p>
          Interview ID: <span className="font-mono">{interviewId?.substring(0, 8)}...</span>
        </p>
      </div>
    </div>
  );
}
