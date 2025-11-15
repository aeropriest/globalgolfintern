'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Loader } from 'lucide-react';
import FileDropzone from './FileDropzone';
import GradientButton from './GradientButton';
import { FirebaseService } from '../services/firebase';
import '../styles/gradient-inputs.css';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const ApplicationForm: React.FC = () => {
  // Pre-filled values for testing
  const [name, setName] = useState('John Smith');
  const [email, setEmail] = useState('test@example.com');
  const [phone, setPhone] = useState('+1 555-123-4567');
  const [location, setLocation] = useState('New York, USA');
  const [selectedPosition, setSelectedPosition] = useState('golf-operations');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [message, setMessage] = useState('I am very interested in this internship opportunity and have experience working at my local golf club.');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [consentChecked, setConsentChecked] = useState(true);
  const router = useRouter();

  const positions = [
    { id: 'golf-operations', title: 'Golf Operations Intern' },
    { id: 'marketing', title: 'Marketing & Communications Intern' },
    { id: 'events', title: 'Events & Tournament Intern' },
    { id: 'hospitality', title: 'Hospitality & Customer Service Intern' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const missingFields = [];
    
    if (!name.trim()) missingFields.push('Name');
    if (!email.trim()) missingFields.push('Email');
    if (!phone.trim()) missingFields.push('Phone');
    if (!location.trim()) missingFields.push('Location');
    if (!selectedPosition) missingFields.push('Position');
    if (!resumeFile) missingFields.push('Resume');
    if (!consentChecked) missingFields.push('Consent checkbox');
    
    if (missingFields.length > 0) {
      setErrorMessage(`Please complete the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setFormState('submitting');
    setErrorMessage('');
    
    try {
      // Upload resume if provided
      let resumeUrl = '';
      if (resumeFile) {
        resumeUrl = await FirebaseService.uploadResume(resumeFile, `${name.replace(/\s+/g, '_')}_${Date.now()}`);
      }
      
      // Get the position title
      const selectedPositionData = positions.find(p => p.id === selectedPosition);
      
      // Save application data
      await FirebaseService.saveApplication({
        name,
        email,
        phone,
        location,
        position: selectedPositionData?.title,
        positionId: selectedPosition,
        resumeUrl,
        message,
        status: 'Application Submitted',
        timestamp: new Date()
      });
      
      // Store candidate info in localStorage for the survey
      const candidateId = Date.now().toString(); // Simple ID for demo purposes
      localStorage.setItem(`candidate_info_${candidateId}`, JSON.stringify({
        name,
        email,
        position: selectedPositionData?.title
      }));
      
      // Redirect directly to the survey page
      router.push(`/survey/${candidateId}`);
      
    } catch (error) {
      console.error('Application Submission Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.');
      setFormState('error');
    }
  };

  // We're redirecting directly to the survey, so we don't need a success state UI

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl w-full">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Golf Internship Application
        </h2>
        <button
          onClick={() => router.push('/')}
          className="text-gray-500 hover:text-gray-800 transition-colors rounded-full p-1 hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="w-full gradient-border-input text-gray-900"
              disabled={formState === 'submitting'}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full gradient-border-input text-gray-900"
              disabled={formState === 'submitting'}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              id="phone" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              required 
              className="w-full gradient-border-input text-gray-900"
              disabled={formState === 'submitting'}
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="location" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              required
              placeholder="e.g., New York, USA"
              className="w-full gradient-border-input text-gray-900"
              disabled={formState === 'submitting'}
            />
          </div>
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Position of Interest <span className="text-red-500">*</span>
          </label>
          <select
            id="position"
            value={selectedPosition}
            onChange={e => setSelectedPosition(e.target.value)}
            required
            className="w-full gradient-border-input text-gray-900"
            disabled={formState === 'submitting'}
          >
            <option value="">Select a position...</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 text-left mb-2">
            Resume/CV <span className="text-red-500">*</span>
          </label>
          {/* For testing, upload ~/Downloads/Arian_Gibson_CV.pdf */}
          <FileDropzone
            onFileSelect={setResumeFile}
            disabled={formState === 'submitting'}
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 text-left mb-2">Additional Message</label>
          <textarea 
            id="message" 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            rows={4} 
            placeholder="Tell us about your interests, experience, or any questions you have..."
            className="w-full gradient-border-input text-gray-900 resize-none"
            disabled={formState === 'submitting'}
          />
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-400 rounded-lg p-4 mb-6" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="font-bold text-red-800 text-lg mb-1">Submission Failed</p>
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Consent Checkbox */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="mb-2 text-sm font-medium text-gray-700">
            Consent <span className="text-red-500">*</span>
          </div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              required
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              By submitting this form, you consent to Global Golf Intern processing your data for recruitment purposes. We may store your CV for up to 12 months for current and future roles. You can withdraw consent at any time by contacting us.
            </span>
          </label>
        </div>
        
        <div>
          <GradientButton
            type="submit"
            disabled={formState === 'submitting' || !consentChecked}
            loading={formState === 'submitting'}
            variant="filled"
            size="lg"
            className="w-full"
          >
            {formState === 'submitting' ? 'Submitting Application...' : 'Next'}
          </GradientButton>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
