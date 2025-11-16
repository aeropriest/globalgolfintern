'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  X,
  ExternalLink,
  Trash2,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import { FirebaseService, SurveyResult } from '../../../services/firebase';

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
  timestamp: Date | any;
  candidateId?: string | number;
  surveyValue?: number;
  surveyData?: SurveyResult | null;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Application>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    country: '',
    position: ''
  });
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSurveyDialog, setShowSurveyDialog] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<SurveyResult | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Fetch applications data and survey results
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/applications');
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        const apps = data.applications || [];
        
        // Fetch survey results for each application
        const appsWithSurvey = await Promise.all(apps.map(async (app: Application) => {
          try {
            if (app.candidateId) {
              const surveyResult = await FirebaseService.getSurveyResultByCandidateId(app.candidateId.toString());
              if (surveyResult) {
                // Calculate survey value (sum of trait scores)
                const surveyValue = Object.values(surveyResult.traitScores || {}).reduce(
                  (sum, score) => sum + (typeof score === 'number' ? score : 0), 
                  0
                );
                return { ...app, surveyValue, surveyData: surveyResult };
              }
            }
            return app;
          } catch (err) {
            console.error(`Error fetching survey for application ${app.id}:`, err);
            return app;
          }
        }));
        
        setApplications(appsWithSurvey);
        setFilteredApplications(appsWithSurvey);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter and sort applications
  useEffect(() => {
    let result = [...applications];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.name?.toLowerCase().includes(term) || 
        app.email?.toLowerCase().includes(term) ||
        app.position?.toLowerCase().includes(term) ||
        app.location?.toLowerCase().includes(term) ||
        app.passportCountry?.toLowerCase().includes(term)
      );
    }
    
    // Apply filters
    if (filters.status) {
      result = result.filter(app => app.status === filters.status);
    }
    
    if (filters.country) {
      result = result.filter(app => app.passportCountry === filters.country);
    }
    
    if (filters.position) {
      result = result.filter(app => app.position === filters.position);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) {
        return 0;
      }
      
      if (sortField === 'timestamp') {
        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
    setFilteredApplications(result);
  }, [applications, searchTerm, sortField, sortDirection, filters]);

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(applications.map(app => app.status).filter(Boolean) as string[]));
  const uniqueCountries = Array.from(new Set(applications.map(app => app.passportCountry).filter(Boolean) as string[]));
  const uniquePositions = Array.from(new Set(applications.map(app => app.position).filter(Boolean) as string[]));

  // Handle sort click
  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle checkbox selection
  const handleSelectApplication = (id: string | undefined) => {
    if (!id) return;
    
    setSelectedApplications(prev => {
      if (prev.includes(id)) {
        return prev.filter(appId => appId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      const allIds = filteredApplications
        .map(app => app.id)
        .filter(id => id !== undefined) as string[];
      setSelectedApplications(allIds);
    }
    setSelectAll(!selectAll);
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedApplications.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedApplications.length} application(s)?`)) {
      setIsDeleting(true);
      
      try {
        // Delete each selected application
        await Promise.all(selectedApplications.map(async (id) => {
          try {
            const response = await fetch(`/api/dashboard/applications/${id}`, {
              method: 'DELETE',
            });
            
            if (!response.ok) {
              throw new Error(`Failed to delete application ${id}`);
            }
            
            return id;
          } catch (err) {
            console.error(`Error deleting application ${id}:`, err);
            throw err;
          }
        }));
        
        // Remove deleted applications from state
        setApplications(prev => 
          prev.filter(app => app.id && !selectedApplications.includes(app.id))
        );
        setSelectedApplications([]);
        setSelectAll(false);
        
      } catch (error) {
        console.error('Error during bulk delete:', error);
        alert('Some applications could not be deleted. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  // Show survey details dialog
  const showSurveyDetails = (survey: SurveyResult | null | undefined) => {
    if (!survey) return;
    setCurrentSurvey(survey);
    setShowSurveyDialog(true);
  };
  
  // Close survey dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowSurveyDialog(false);
      }
    };
    
    if (showSurveyDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSurveyDialog]);

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Position', 'Passport Country', 'Golf Handicap', 'Status', 'Date Applied'];
    const rows = filteredApplications.map(app => [
      app.name,
      app.email,
      app.phone || '',
      app.location || '',
      app.position || '',
      app.passportCountry || '',
      app.golfHandicap || '',
      app.status || '',
      app.timestamp instanceof Date 
        ? app.timestamp.toLocaleDateString() 
        : new Date(app.timestamp).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      country: '',
      position: ''
    });
    setSearchTerm('');
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Applications</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <Download className="-ml-1 mr-2 h-5 w-5" />
            Export CSV
          </button>
          
          <button
            onClick={handleBulkDelete}
            disabled={selectedApplications.length === 0 || isDeleting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${selectedApplications.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'}`}
          >
            <Trash2 className="-ml-1 mr-2 h-5 w-5" />
            {isDeleting ? 'Deleting...' : `Delete (${selectedApplications.length})`}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative rounded-md shadow-sm max-w-lg flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search applications..."
            />
          </div>

          {/* Filter button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <Filter className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Filter
              {filterOpen ? (
                <ChevronUp className="ml-2 h-5 w-5" />
              ) : (
                <ChevronDown className="ml-2 h-5 w-5" />
              )}
            </button>

            {(filters.status || filters.country || filters.position) && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                <X className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700">Passport Country</label>
                <select
                  id="country-filter"
                  value={filters.country}
                  onChange={(e) => setFilters({...filters, country: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700">Position</label>
                <select
                  id="position-filter"
                  value={filters.position}
                  onChange={(e) => setFilters({...filters, position: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                >
                  <option value="">All Positions</option>
                  {uniquePositions.map((position) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>

        {/* Applications table */}
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {loading ? (
                  <div className="bg-white px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading applications...</p>
                  </div>
                ) : error ? (
                  <div className="bg-white px-4 py-12 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <X className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="mt-4 text-gray-500">{error}</p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="bg-white px-4 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filters.status || filters.country || filters.position
                        ? 'Try adjusting your search or filter criteria'
                        : 'No applications have been submitted yet'}
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                              checked={selectAll}
                              onChange={handleSelectAll}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Name
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('position')}
                        >
                          <div className="flex items-center">
                            Position
                            {sortField === 'position' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('passportCountry')}
                        >
                          <div className="flex items-center">
                            Passport
                            {sortField === 'passportCountry' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('golfHandicap')}
                        >
                          <div className="flex items-center">
                            Golf Handicap
                            {sortField === 'golfHandicap' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {sortField === 'status' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('timestamp')}
                        >
                          <div className="flex items-center">
                            Date Applied
                            {sortField === 'timestamp' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('surveyValue')}
                        >
                          <div className="flex items-center">
                            Survey Value
                            {sortField === 'surveyValue' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                checked={application.id ? selectedApplications.includes(application.id) : false}
                                onChange={() => handleSelectApplication(application.id)}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {application.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {application.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.position || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.passportCountry || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.golfHandicap || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              application.status === 'Application Submitted' 
                                ? 'bg-green-100 text-green-800' 
                                : application.status === 'Interview Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {application.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {application.timestamp instanceof Date 
                              ? application.timestamp.toLocaleDateString() 
                              : new Date(application.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {application.surveyValue !== undefined ? (
                              <button
                                onClick={() => showSurveyDetails(application.surveyData)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <ClipboardCheck className="h-4 w-4 mr-1" />
                                {application.surveyValue.toFixed(1)}
                              </button>
                            ) : (
                              <span className="text-gray-400 italic">No survey</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-3 justify-end">
                              {application.resumeUrl && (
                                <a 
                                  href={application.resumeUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:text-pink-900"
                                >
                                  <span className="sr-only">View Resume</span>
                                  <ExternalLink className="h-5 w-5" />
                                </a>
                              )}
                              <Link
                                href={`/dashboard/applications/${application.id}`}
                                className="text-pink-600 hover:text-pink-900"
                              >
                                View Details
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Survey Details Dialog */}
    {showSurveyDialog && currentSurvey && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          ref={dialogRef}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Survey Results: {currentSurvey?.name || currentSurvey?.email}
              </h3>
              <button 
                onClick={() => setShowSurveyDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Trait Scores */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Trait Scores</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentSurvey?.traitScores || {}).map(([trait, score], index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">{trait}</div>
                    <div className="mt-1 flex items-center">
                      <div className="text-2xl font-bold text-gray-900">{typeof score === 'number' ? score.toFixed(1) : score}</div>
                      <div className="ml-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${typeof score === 'number' ? Math.min(score * 10, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Survey Answers */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Survey Answers</h4>
              {Object.entries(currentSurvey?.answers || {}).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(currentSurvey?.answers || {}).map(([category, answers], catIndex) => (
                    <div key={catIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h5 className="font-medium text-gray-900">{category}</h5>
                      </div>
                      <div className="p-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {Object.entries(answers).map(([questionId, answer], qIndex) => (
                              <tr key={qIndex}>
                                <td className="px-4 py-3 text-sm text-gray-900">Question {questionId}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{answer}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No detailed answers available</h3>
                  <p className="mt-1 text-sm text-gray-500">This survey only contains trait scores.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setShowSurveyDialog(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  );
}
