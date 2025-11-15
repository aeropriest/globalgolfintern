'use client';

import React, { useState, useEffect } from 'react';
import { FirebaseService } from '../services/firebase';
import { Loader, Search, ChevronDown, ChevronUp, ExternalLink, Download, BarChart, Clock } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  resumeUrl: string;
  message?: string;
  status: string;
  timestamp: any;
  surveyCompleted?: boolean;
  traitScores?: {
    extraversion: number;
    agreeableness: number;
    conscientiousness: number;
    openness: number;
    emotionalStability: number;
  };
  interviewId?: string;
  interviewUrl?: string;
  interviewStatus?: string;
  interviewCompleted?: boolean;
  interviewVideoUrl?: string;
  interviewShareUrl?: string;
  interviewCompletedAt?: string;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Application>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'survey' | 'interview'>('survey');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await FirebaseService.getApplications();
        setApplications(data as Application[]);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleSort = (field: keyof Application) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortField === 'timestamp') {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp?.seconds ? a.timestamp.seconds * 1000 : Date.now());
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp?.seconds ? b.timestamp.seconds * 1000 : Date.now());
      
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    
    const valueA = a[sortField] || '';
    const valueB = b[sortField] || '';
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : new Date(timestamp?.seconds ? timestamp.seconds * 1000 : Date.now());
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortIcon = ({ field }: { field: keyof Application }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Internship Applications Dashboard</h1>
        <Link href="/" className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div className="text-gray-600">
              {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'} found
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    <SortIcon field="email" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('position')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Position</span>
                    <SortIcon field="position" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Location</span>
                    <SortIcon field="location" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date Applied</span>
                    <SortIcon field="timestamp" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Resume
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Survey Results
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Interview
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedApplications.length > 0 ? (
                sortedApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{application.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(application.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.resumeUrl ? (
                        <a 
                          href={application.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          <span>Resume</span>
                        </a>
                      ) : (
                        <span className="text-gray-400">No resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.surveyCompleted && application.traitScores ? (
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <BarChart className="h-4 w-4 mr-1" />
                          <span>View Results</span>
                        </button>
                      ) : (
                        <span className="text-gray-400">Not completed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.interviewCompleted ? (
                        <div>
                          <a
                            href={application.interviewVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center mb-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span>View Interview</span>
                          </a>
                          <div className="text-xs text-gray-500">
                            Completed: {new Date(application.interviewCompletedAt || '').toLocaleString()}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowModal(true);
                            }}
                            className="text-xs text-pink-600 hover:text-pink-800 mt-1 flex items-center"
                          >
                            <span>View Details</span>
                          </button>
                        </div>
                      ) : application.interviewUrl ? (
                        <div>
                          <span className="text-yellow-600 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>In progress</span>
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {application.interviewId?.substring(0, 8)}...
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not started</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 md:mx-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Application Details: {selectedApplication.name}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Candidate Information */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Candidate Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedApplication.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                    <p><span className="font-medium">Position:</span> {selectedApplication.position}</p>
                    <p><span className="font-medium">Applied:</span> {formatDate(selectedApplication.timestamp)}</p>
                    <p><span className="font-medium">Location:</span> {selectedApplication.location}</p>
                    <p><span className="font-medium">Phone:</span> {selectedApplication.phone}</p>
                  </div>
                </div>
                
                {/* Application Progress */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Application Progress</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Survey Status */}
                    <div className="bg-white p-3 rounded-lg shadow">
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full ${selectedApplication.surveyCompleted ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                        <h5 className="font-medium">Personality Survey</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedApplication.surveyCompleted ? 'Completed' : 'Not completed'}
                      </p>
                    </div>
                    
                    {/* Interview Status */}
                    <div className="bg-white p-3 rounded-lg shadow">
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full ${selectedApplication.interviewCompleted ? 'bg-green-500' : selectedApplication.interviewUrl ? 'bg-yellow-500' : 'bg-gray-300'} mr-2`}></div>
                        <h5 className="font-medium">Video Interview</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedApplication.interviewCompleted ? 'Completed' : selectedApplication.interviewUrl ? 'In progress' : 'Not started'}
                        {selectedApplication.interviewCompletedAt && (
                          <span className="block text-xs text-gray-500 mt-1">
                            {new Date(selectedApplication.interviewCompletedAt).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Resume Status */}
                    <div className="bg-white p-3 rounded-lg shadow">
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full ${selectedApplication.resumeUrl ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                        <h5 className="font-medium">Resume</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedApplication.resumeUrl ? (
                          <a 
                            href={selectedApplication.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800 flex items-center"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            <span>Download</span>
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Tabs for Survey and Interview */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('survey')}
                      className={`${activeTab === 'survey' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Personality Survey
                    </button>
                    <button
                      onClick={() => setActiveTab('interview')}
                      className={`${activeTab === 'interview' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Video Interview
                    </button>
                  </nav>
                </div>
                
                {/* Survey Results Tab */}
                {activeTab === 'survey' && (
                  <div>
                    {selectedApplication.traitScores ? (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-4">Personality Trait Scores</h4>
                        <div className="space-y-4">
                          {Object.entries(selectedApplication.traitScores).map(([trait, score]) => {
                            // Calculate the percentage for the progress bar (score is between 1-5)
                            const percentage = (score / 5) * 100;
                            
                            // Determine color based on score
                            let barColor = 'bg-blue-500';
                            if (score >= 4) barColor = 'bg-green-500';
                            else if (score <= 2) barColor = 'bg-red-500';
                            else barColor = 'bg-yellow-500';
                            
                            // Format trait name for display
                            const formatTraitName = (name: string) => {
                              return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
                            };
                            
                            return (
                              <div key={trait} className="bg-white p-4 rounded-lg shadow">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700">{formatTraitName(trait)}</span>
                                  <span className="text-sm font-medium text-gray-700">{score.toFixed(1)} / 5</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`${barColor} h-2.5 rounded-full`} 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2">Overall Assessment</h4>
                          <p className="text-gray-600">
                            Based on the survey results, {selectedApplication.name} shows 
                            {selectedApplication.traitScores.conscientiousness >= 4 ? ' strong attention to detail and reliability' : ''}
                            {selectedApplication.traitScores.extraversion >= 4 ? ' excellent social and communication skills' : ''}
                            {selectedApplication.traitScores.agreeableness >= 4 ? ' great teamwork and collaboration abilities' : ''}
                            {selectedApplication.traitScores.openness >= 4 ? ' creativity and adaptability' : ''}
                            {selectedApplication.traitScores.emotionalStability >= 4 ? ' good stress management' : ''}
                            {Object.values(selectedApplication.traitScores).every(score => score < 4) ? ' areas for development across multiple traits' : ''}.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No survey results available for this candidate.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Interview Results Tab */}
                {activeTab === 'interview' && (
                  <div>
                    {selectedApplication.interviewCompleted ? (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-4">Interview Details</h4>
                        <div className="bg-white p-4 rounded-lg shadow mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <p><span className="font-medium">Interview ID:</span> {selectedApplication.interviewId}</p>
                            <p><span className="font-medium">Completed:</span> {new Date(selectedApplication.interviewCompletedAt || '').toLocaleString()}</p>
                          </div>
                          <div className="mt-4">
                            <h5 className="font-medium text-gray-700 mb-2">Interview Recording</h5>
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              {selectedApplication.interviewVideoUrl ? (
                                <iframe 
                                  src={selectedApplication.interviewVideoUrl} 
                                  className="w-full h-full" 
                                  allowFullScreen
                                  title="Interview Recording"
                                ></iframe>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <p className="text-gray-500">Video not available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : selectedApplication.interviewUrl ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Interview in progress. Results will be available once completed.</p>
                        <p className="text-sm text-gray-400 mt-2">Interview ID: {selectedApplication.interviewId}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No interview has been started for this candidate.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
