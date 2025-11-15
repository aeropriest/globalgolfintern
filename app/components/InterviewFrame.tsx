'use client';

import React, { useState, useEffect } from 'react';
import { HireflixService } from '../services/hireflix';
import { FirebaseService } from '../services/firebase';
import { Loader } from 'lucide-react';

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

  // Listen for interview completion via webhook
  useEffect(() => {
    // In a real application, you would implement a polling mechanism or WebSocket
    // to check if the interview has been completed
    
    // For this example, we'll simulate completion after 30 seconds
    if (interviewUrl && !isCompleted) {
      const timer = setTimeout(() => {
        setIsCompleted(true);
        if (onComplete) {
          onComplete();
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [interviewUrl, isCompleted, onComplete]);

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
      <iframe
        src={interviewUrl}
        className="w-full h-[80vh] border-0 rounded-lg shadow-lg"
        allow="camera; microphone; fullscreen"
        title="Hireflix Interview"
      />
      <div className="mt-4 text-sm text-gray-500">
        <p>
          Note: This interview requires access to your camera and microphone. Please allow access when prompted.
        </p>
      </div>
    </div>
  );
}
