'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader, CheckCircle } from 'lucide-react';

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  useEffect(() => {
    try {
      // Load candidate info from localStorage
      const candidateInfoStr = localStorage.getItem(`candidate_info_${candidateId}`);
      if (candidateInfoStr) {
        setCandidateInfo(JSON.parse(candidateInfoStr));
      }
    } catch (error) {
      console.error("Failed to load candidate information:", error);
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  // Handle interview completion
  const handleCompleteInterview = () => {
    setInterviewCompleted(true);
    
    // Save completion status to localStorage
    localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({
      status: 'Interview Completed',
      timestamp: new Date().toISOString()
    }));
    
    // Redirect to status page after a short delay
    setTimeout(() => {
      router.push(`/status/${candidateId}`);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-pink-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Interview</h2>
          <p className="text-gray-600">Please wait while we prepare your video interview...</p>
        </div>
      </div>
    );
  }

  if (!candidateInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-center">
          <p className="text-xl font-bold text-red-600 mb-4">
            We couldn't find your information. Please check the URL or contact support.
          </p>
          <Link href="/" className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-6 rounded-lg inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-4">
          <Link 
            href={`/status/${candidateId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="h-4 w-4 mr-2 transform rotate-180" />
            Back to Status
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Video Interview</h1>
          
          {interviewCompleted ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Interview Completed!</h2>
              <p className="text-gray-600 mb-6">Thank you for completing your video interview.</p>
              <p className="text-gray-600">Redirecting to your application status...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm">Please allow camera and microphone access when prompted.</p>
              </div>
              
              <div className="relative w-full h-[70vh] bg-white rounded-lg shadow overflow-hidden">
                <iframe
                  src="https://app.hireflix.com/s/interview/start"
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allow="camera; microphone; fullscreen"
                  title="Hireflix Interview"
                />
              </div>
              
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleCompleteInterview}
                  className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-6 rounded-lg"
                >
                  Complete Interview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
