'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import GradientButton from '../../components/GradientButton';

export default function StatusPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState<any>(null);
  const [surveyStatus, setSurveyStatus] = useState<any>(null);
  const [interviewStatus, setInterviewStatus] = useState<any>(null);
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
        
        // Load application status from localStorage
        const applicationStatusStr = localStorage.getItem(`application_status_${candidateId}`);
        if (applicationStatusStr) {
          setApplicationStatus(JSON.parse(applicationStatusStr));
        }
        
        // Load survey status from localStorage
        const surveyStatusStr = localStorage.getItem(`survey_completed_${candidateId}`);
        if (surveyStatusStr) {
          setSurveyStatus(JSON.parse(surveyStatusStr));
        }
        
        // Load interview status from localStorage
        const interviewStatusStr = localStorage.getItem(`interview_completed_${candidateId}`);
        if (interviewStatusStr) {
          setInterviewStatus(JSON.parse(interviewStatusStr));
        }
      } catch (error) {
        console.error("Failed to load status information:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [candidateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p>Loading your application status...</p>
      </div>
    );
  }

  if (!candidateInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Application Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find an application with this ID. Please check the URL or contact support.
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
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="h-4 w-4 mr-2 transform rotate-180" />
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Application Status</h1>
            <p className="text-white/80">
              {candidateInfo.name} • {candidateInfo.email}
            </p>
          </div>
          
          {/* Content */}
          <div className="p-8">
            {/* Application Info */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Application</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{candidateInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{candidateInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium">{candidateInfo.position || "Golf Internship"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Application Date</p>
                    <p className="font-medium">
                      {applicationStatus?.timestamp ? new Date(applicationStatus.timestamp).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Timeline */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Application Progress</h2>
              <div className="space-y-6">
                {/* Application Submitted */}
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Application Submitted</h3>
                    <p className="text-gray-500">
                      Your application has been received and is being reviewed.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {applicationStatus?.timestamp ? new Date(applicationStatus.timestamp).toLocaleString() : ""}
                    </p>
                  </div>
                </div>
                
                {/* Personality Survey */}
                <div className="flex">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${surveyStatus?.completed ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                    {surveyStatus?.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Personality Survey</h3>
                    {surveyStatus?.completed ? (
                      <>
                        <p className="text-gray-500">
                          You have completed the personality assessment. Thank you!
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {surveyStatus?.timestamp ? new Date(surveyStatus.timestamp).toLocaleString() : ""}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500">
                          Please complete the personality assessment to continue your application process.
                        </p>
                        <div className="mt-3">
                          <GradientButton
                            onClick={() => router.push(`/survey/${candidateId}`)}
                            variant="filled"
                            size="sm"
                          >
                            Take Survey Now
                          </GradientButton>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Interview */}
                <div className="flex">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${interviewStatus?.completed ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                    {interviewStatus?.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Video Interview</h3>
                    {interviewStatus?.completed ? (
                      <>
                        <p className="text-gray-500">
                          You have completed the video interview. Thank you!
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {interviewStatus?.timestamp ? new Date(interviewStatus.timestamp).toLocaleString() : ""}
                        </p>
                      </>
                    ) : surveyStatus?.completed ? (
                      <>
                        <p className="text-gray-500">
                          Please complete the video interview to continue your application process.
                        </p>
                        <div className="mt-3">
                          <GradientButton
                            onClick={() => router.push(`/interview/${candidateId}`)}
                            variant="filled"
                            size="sm"
                          >
                            Take Interview Now
                          </GradientButton>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">
                        This step will be unlocked after completing the personality survey.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Final Decision */}
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Final Decision</h3>
                    <p className="text-gray-500">
                      After the interview process, we'll make a final decision on your application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Need Help?</h3>
              <p className="text-blue-700 mb-4">
                If you have any questions about your application or the internship program, please contact us.
              </p>
              <p className="text-blue-700">
                Email: <a href="mailto:info@globalgolfintern.com" className="underline">info@globalgolfintern.com</a>
              </p>
              <p className="text-blue-700">
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
