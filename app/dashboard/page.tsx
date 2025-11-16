'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart2, Briefcase, Calendar, MapPin, Mail, Phone, ExternalLink, Loader, AlertTriangle, Database, Cloud, X, Star } from 'lucide-react';
import Link from 'next/link';
import { ManatalService, ManatalCandidateExtended } from '../../services/manatal';

interface Application {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  position?: string;
  resumeUrl?: string;
  passportCountry?: string;
  golfHandicap?: string;
  status?: string;
  timestamp: string | Date;
  candidateId?: string | number;
  surveyValue?: number;
  surveyId?: string;
}

interface SurveyResult {
  id?: string;
  candidateId?: string;
  name?: string;
  email: string;
  position?: string;
  answers: Record<string, Record<number, number>>;
  traitScores: Record<string, number>;
  timestamp?: Date | any;
  applicationId?: string | null;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'firestore' | 'manatal'>('firestore');
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalQuizResults: 0,
    totalSurveyResults: 0,
    recentApplications: [] as Application[],
    recentSurveyResults: [] as SurveyResult[],
    loading: true,
    error: null as string | null
  });
  const [manatalCandidates, setManatalCandidates] = useState<ManatalCandidateExtended[]>([]);
  const [loadingManatal, setLoadingManatal] = useState(false);
  const [manatalError, setManatalError] = useState<string | null>(null);
  const [showSurveyDialog, setShowSurveyDialog] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<SurveyResult | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard statistics
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        // Process applications to include survey data
        const applications = data.recentApplications || [];
        const surveyResults = data.recentSurveyResults || [];
        
        // Map survey results to applications
        const applicationsWithSurvey = applications.map((app: Application) => {
          const matchingSurvey = surveyResults.find((survey: SurveyResult) => 
            survey.applicationId === app.id || survey.email === app.email
          );
          
          if (matchingSurvey) {
            // Calculate average survey score
            const scores = Object.values(matchingSurvey.traitScores || {}) as number[];
            const avgScore = scores.length > 0 
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
              : 0;
            
            return {
              ...app,
              surveyValue: parseFloat(avgScore.toFixed(1)),
              surveyId: matchingSurvey.id
            };
          }
          
          return app;
        });
        
        setStats({
          totalApplications: data.totalApplications || 0,
          totalQuizResults: data.totalQuizResults || 0,
          totalSurveyResults: data.totalSurveyResults || 0,
          recentApplications: applicationsWithSurvey,
          recentSurveyResults: surveyResults,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchManatalCandidates = async () => {
      if (activeTab === 'manatal') {
        setLoadingManatal(true);
        setManatalError(null);
        try {
          const candidates = await ManatalService.getAllCandidates();
          setManatalCandidates(candidates);
        } catch (error) {
          console.error('Error fetching Manatal candidates:', error);
          setManatalError(error instanceof Error ? error.message : 'Failed to fetch Manatal candidates');
        } finally {
          setLoadingManatal(false);
        }
      }
    };

    fetchManatalCandidates();
  }, [activeTab]);

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    switch (status) {
      case 'Application Submitted':
        return 'bg-green-100 text-green-800';
      case 'Interview Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Interview Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Shortlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offer Extended':
        return 'bg-indigo-100 text-indigo-800';
      case 'Offer Accepted':
        return 'bg-teal-100 text-teal-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cards = [
    {
      name: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'bg-pink-500',
      href: '/dashboard/applications'
    },
    {
      name: 'Quiz Completions',
      value: stats.totalQuizResults,
      icon: FileText,
      color: 'bg-purple-500',
      href: '/dashboard/quiz-results'
    },
    {
      name: 'Survey Completions',
      value: stats.totalSurveyResults,
      icon: Star,
      color: 'bg-yellow-500',
      href: '#'
    },
    {
      name: 'Analytics',
      value: 'View',
      icon: BarChart2,
      color: 'bg-green-500',
      href: '/dashboard/analytics'
    }
  ];
  
  // Function to fetch and show survey details
  const showSurveyDetails = async (surveyId: string) => {
    try {
      const survey = stats.recentSurveyResults.find(s => s.id === surveyId);
      
      if (survey) {
        setCurrentSurvey(survey);
        setShowSurveyDialog(true);
      } else {
        console.error('Survey not found');
      }
    } catch (error) {
      console.error('Error fetching survey details:', error);
    }
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of applications and quiz results
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('firestore')}
            className={`${activeTab === 'firestore' 
              ? 'border-pink-500 text-pink-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Database className="mr-2 h-5 w-5" />
            Firestore Candidates
          </button>
          <button
            onClick={() => setActiveTab('manatal')}
            className={`${activeTab === 'manatal' 
              ? 'border-pink-500 text-pink-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Cloud className="mr-2 h-5 w-5" />
            Manatal Candidates
          </button>
        </nav>
      </div>

      {activeTab === 'firestore' ? (
        stats.loading ? (
          <div className="mt-6 flex justify-center">
            <Loader className="h-12 w-12 text-pink-500 animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : stats.error ? (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {stats.error}
                </p>
              </div>
            </div>
          </div>
        ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Link
                key={card.name}
                href={card.href}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.name}
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {card.value}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
              <Link 
                href="/dashboard/applications" 
                className="text-sm font-medium text-pink-600 hover:text-pink-500"
              >
                View all
              </Link>
            </div>
            
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              {stats.recentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Survey Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {application.name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {application.email}
                                </div>
                                {application.phone && (
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {application.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.position || 'Not specified'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {application.location || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(application.status)}`}>
                              {application.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {application.surveyValue !== undefined ? (
                              <button 
                                onClick={() => application.surveyId && showSurveyDetails(application.surveyId)}
                                className="px-2 py-1 inline-flex items-center text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              >
                                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                {application.surveyValue.toFixed(1)}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(application.timestamp)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              href={`/dashboard/applications/${application.id}`}
                              className="text-pink-600 hover:text-pink-900 flex items-center justify-end"
                            >
                              View <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No applications yet
                </div>
              )}
            </div>
          </div>
        </>
      )
      ) : (
        // Manatal tab content
        loadingManatal ? (
          <div className="mt-6 flex justify-center">
            <Loader className="h-12 w-12 text-pink-500 animate-spin" />
            <span className="sr-only">Loading Manatal candidates...</span>
          </div>
        ) : manatalError ? (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {manatalError}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Manatal Candidates</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Candidates imported from Manatal ATS
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {manatalCandidates.length} candidates
                </span>
              </div>
              
              {manatalCandidates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {manatalCandidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {candidate.full_name || `${candidate.first_name} ${candidate.last_name}`}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {candidate.email}
                                </div>
                                {candidate.phone && (
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {candidate.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{candidate.position_applied || 'Not specified'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {candidate.location || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(candidate.status)}`}>
                              {candidate.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-400 text-sm">N/A</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(candidate.created_at)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No candidates found in Manatal
                </div>
              )}
            </div>
          </div>
        )
      )}
      {/* Survey Details Dialog */}
      {showSurveyDialog && currentSurvey && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-gray-900">
                Survey Results: {currentSurvey.name || currentSurvey.email}
              </h3>
              <button
                onClick={() => setShowSurveyDialog(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Candidate Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{currentSurvey.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentSurvey.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium">{currentSurvey.position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submission Date</p>
                    <p className="font-medium">{currentSurvey.timestamp ? formatDate(currentSurvey.timestamp) : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Trait Scores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(currentSurvey.traitScores || {}).map(([trait, score]) => (
                    <div key={trait} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 capitalize">{trait.replace('_', ' ')}</p>
                      <div className="mt-2 flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-yellow-500 h-2.5 rounded-full" 
                            style={{ width: `${(score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">{score.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Question Responses</h4>
                <div className="space-y-4">
                  {Object.entries(currentSurvey.answers || {}).map(([category, questions]) => (
                    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h5 className="font-medium text-gray-700 capitalize">{category.replace('_', ' ')}</h5>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {Object.entries(questions).map(([questionNum, answer]) => (
                          <div key={`${category}-${questionNum}`} className="px-4 py-3">
                            <p className="text-sm text-gray-500 mb-1">Question {parseInt(questionNum) + 1}</p>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-pink-500 h-2 rounded-full" 
                                  style={{ width: `${(answer / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium">{answer}/5</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSurveyDialog(false)}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
