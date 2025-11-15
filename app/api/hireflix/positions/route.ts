import { NextRequest, NextResponse } from 'next/server';
import { HIREFLIX_API_KEY } from '../../../config';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Hireflix API: Fetching positions...');
    
    // Use the real Hireflix API to get positions
    const query = `
      query {
        positions {
          id
          name
          archived
        }
      }
    `;
    
    const response = await fetch('https://api.hireflix.com/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': HIREFLIX_API_KEY,
      },
      body: JSON.stringify({ query }),
    });
    
    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ Hireflix API Error:', data.errors);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch positions from Hireflix' },
        { status: 500 }
      );
    }
    
    const positions = data.data?.positions || [];
    
    // Filter active positions only
    const activePositions = positions.filter((pos: any) => !pos.archived);
    
    // Transform positions for frontend
    const transformedPositions = activePositions.map((pos: any) => ({
      id: pos.id,
      title: pos.name,
      description: 'Golf internship opportunity',
      location: 'Various Locations',
      department: 'Operations',
      employment_type: 'Internship',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    return NextResponse.json({
      positions: transformedPositions
    });
    
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}
