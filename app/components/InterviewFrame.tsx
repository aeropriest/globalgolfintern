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
    const createInterview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First check if this candidate already has an interview in our database
        console.log(`Checking if ${candidateEmail} already has an interview...`);
        const existingInterview = await FirebaseService.checkInterviewExists(candidateEmail);
        
        if (existingInterview.exists && existingInterview.interviewUrl) {
          console.log(`Found existing interview for ${candidateEmail}`);
          setInterviewId('existing_interview');
          setInterviewUrl(existingInterview.interviewUrl);
          return;
        }
        
        // Get positions
        const positions = await HireflixService.getPositions();
        if (!positions.length) throw new Error('No positions available');
        
        console.log(`Found ${positions.length} positions:`, positions.map(p => p.title).join(', '));
        
        // Create interview
        const response = await HireflixService.createInterview(
          positions[0].id,
          candidateEmail,
          candidateName,
          candidateId
        );
        
        if (!response.success) throw new Error(response.message || 'Failed to create interview');
        
        if (response.interview.existing_candidate) {
          // Handle existing candidate case
          setError(response.user_message || 'You have already been invited to this position. Please check your email for the interview link.');
          setInterviewId(response.interview.id);
          setInterviewUrl(null);
          return;
        }
        
        // Save to Firebase
        if (response.interview.interview_url) {
          await FirebaseService.createInterview(
            candidateEmail,
            response.interview.id,
            response.interview.interview_url
          );
        }
        
        setInterviewId(response.interview.id);
        setInterviewUrl(response.interview.interview_url);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Interview setup failed');
      } finally {
        setLoading(false);
      }
    };
    
    createInterview();
  }, [candidateId, candidateName, candidateEmail]);

  // Simulate interview completion after 30 seconds
  useEffect(() => {
    if (!interviewUrl || isCompleted) return;
    
    const timer = setTimeout(() => {
      console.log('Interview completed (simulated)');
      setIsCompleted(true);
      if (onComplete) onComplete();
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [interviewUrl, isCompleted, onComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-gray-100 rounded-lg">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Setting up your interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-red-50 rounded-lg">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-700 mb-2">Interview Setup Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Please try again later or contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {interviewUrl ? (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm">Please allow camera and microphone access when prompted.</p>
          </div>
          
          <div className="relative w-full h-[70vh] bg-white rounded-lg shadow overflow-hidden">
            <iframe
              src={interviewUrl}
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="camera; microphone; fullscreen"
              title="Hireflix Interview"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[70vh] bg-gray-100 rounded-lg">
          <Loader className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      )}
    </div>
  );
}
