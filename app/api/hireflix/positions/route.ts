import { NextRequest, NextResponse } from 'next/server';

// In a real application, you would store this in an environment variable
const HIREFLIX_API_KEY = process.env.NEXT_PUBLIC_HIREFLIX_API_KEY || 'your-hireflix-api-key';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Hireflix Positions API: Received positions request');
    
    // In a real application, you would make an actual API call to Hireflix
    // For now, we'll return mock positions
    
    // Mock positions data
    const positions = [
      {
        id: 'pos_1',
        title: 'Golf Operations Intern',
        description: 'Join our team as a Golf Operations Intern and gain valuable experience in the golf industry.',
        location: 'New York, USA',
        department: 'Operations',
        employment_type: 'Internship',
        status: 'open',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 'pos_2',
        title: 'Golf Course Management Intern',
        description: 'Learn about golf course management and maintenance in this hands-on internship.',
        location: 'Florida, USA',
        department: 'Course Management',
        employment_type: 'Internship',
        status: 'open',
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z'
      },
      {
        id: 'pos_3',
        title: 'Golf Marketing Intern',
        description: 'Develop marketing strategies for golf courses and tournaments.',
        location: 'California, USA',
        department: 'Marketing',
        employment_type: 'Internship',
        status: 'open',
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-03T00:00:00Z'
      }
    ];
    
    return NextResponse.json({
      success: true,
      positions: positions,
      source: 'mock_data'
    });
    
  } catch (error) {
    console.error('💥 Hireflix Positions API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions. Please try again.' },
      { status: 500 }
    );
  }
}
