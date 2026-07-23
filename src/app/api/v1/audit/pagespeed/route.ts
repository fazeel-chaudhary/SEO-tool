import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required parameter: url' },
        { status: 400 }
      );
    }

    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey) {
      // Fallback
      return NextResponse.json({
        status: 'success',
        score: 75,
        lcp: '2.1s',
        source: 'mock-fallback',
      });
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&category=performance&key=${googleApiKey}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Google PageSpeed API error: ${response.statusText}`);
    }

    const data = await response.json();
    const score = Math.round((data.lighthouseResult?.categories?.performance?.score || 0.75) * 100);
    
    // Extract LCP time
    const lcpAudit = data.lighthouseResult?.audits?.['largest-contentful-paint'];
    const lcpDisplay = lcpAudit?.displayValue || '2.2s';

    return NextResponse.json({
      status: 'success',
      score,
      lcp: lcpDisplay,
      source: 'google-pagespeed',
    });
  } catch (err: any) {
    console.error('PageSpeed backend proxy failure:', err);
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal PageSpeed Proxy Error' },
      { status: 500 }
    );
  }
}
