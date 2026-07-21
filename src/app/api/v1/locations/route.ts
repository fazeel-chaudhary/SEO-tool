import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_LOCATIONS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  // Verify Bearer token authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized. Missing or invalid Bearer API key header.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: 'success',
    count: INITIAL_LOCATIONS.length,
    data: INITIAL_LOCATIONS,
  });
}
