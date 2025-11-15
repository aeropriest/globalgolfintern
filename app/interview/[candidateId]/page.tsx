'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import InterviewFrame from '../../components/InterviewFrame';

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      if (!candidateId) {
        setIsLoading(false);
        return;
      }

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
    };

    loadData();
  }, [candidateId]);

  const handleInterviewComplete = () => {
    // Update local storage to reflect interview completion
    if (candidateInfo) {
      const updatedInfo = {
        ...candidateInfo,
        interviewCompleted: true,
        interviewCompletedAt: new Date().toISOString()
      };
      localStorage.setItem(`candidate_info_${candidateId}`, JSON.stringify(updatedInfo));
      setCandidateInfo(updatedInfo);
    }
    
    // Redirect to status page
    router.push(`/status/${candidateId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p>Loading your interview...</p>
      </div>
    );
  }

  if (!candidateInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Candidate Not Found</h1>
          <p className="text-gray-600 mb-6">
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
          <Link 
            href={`/status/${candidateId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="h-4 w-4 mr-2 transform rotate-180" />
            Back to Status
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Video Interview</h1>
            <p className="text-white/80">
              {candidateInfo.name} • {candidateInfo.email}
            </p>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Video Interview</h2>
              <p className="text-gray-600 mb-6">
                This interview will help us get to know you better. Please ensure you are in a quiet environment with good lighting.
                The interview consists of several questions that you'll answer via video recording.
              </p>
              
              <InterviewFrame
                candidateId={candidateId}
                candidateName={candidateInfo.name}
                candidateEmail={candidateInfo.email}
                onComplete={handleInterviewComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
