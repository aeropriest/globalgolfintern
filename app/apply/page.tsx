'use client';

import React from 'react';
import ApplicationForm from '../components/ApplicationForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Apply for Golf Internship
          </h1>
          <ApplicationForm />
        </div>
      </div>
    </div>
  );
}
