import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_KEYWORDS, INITIAL_GEO_SCANS } from '@/lib/mock-data';

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
    keywords: INITIAL_KEYWORDS,
    latestGeoGridScans: INITIAL_GEO_SCANS,
  });
}
