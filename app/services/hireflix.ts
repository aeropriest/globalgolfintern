'use client';

import { HIREFLIX_API_KEY, HIREFLIX_POSITION_ID } from '../config';

export interface HireflixPosition {
  id: string;
  title: string;
  description: string;
  location: string;
  department: string;
  employment_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HireflixInterview {
  id: string;
  position_id: string;
  candidate_email: string;
  interview_url: string | null;
  status: string;
  created_at: string;
  existing_candidate?: boolean;
  candidateId?: string;
  transcript_url?: string;
  resume_url?: string;
}

export interface HireflixInterviewResponse {
  success: boolean;
  interview: HireflixInterview;
  message?: string;
  user_message?: string;
}

export class HireflixService {
  static async getPositions(): Promise<HireflixPosition[]> {
    try {
      const response = await fetch('/api/hireflix/positions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.positions || [];
    } catch (error) {
      console.error('Error fetching Hireflix positions:', error);
      return [];
    }
  }

  static async createInterview(positionId: string, candidateEmail: string, candidateName: string, candidateId?: string): Promise<HireflixInterviewResponse> {
    try {
      const response = await fetch('/api/hireflix/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position_id: positionId,
          candidate_email: candidateEmail,
          candidate_name: candidateName,
          candidateId: candidateId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create interview: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Hireflix interview:', error);
      throw error;
    }
  }
}
