import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();
    if (!to || !subject || !html) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required parameters: to, subject, or html' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log(`[Mock Email Alert] Resend API key missing. Dispatching to log:`, { to, subject });
      return NextResponse.json({
        status: 'success',
        message: 'Mock email dispatch complete (API key missing)',
        source: 'mock-fallback',
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Local SEO OS <onboarding@resend.dev>', // Default Resend test domain sender
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      status: 'success',
      id: data.id,
      source: 'resend',
    });
  } catch (err: any) {
    console.error('Resend email dispatch failure:', err);
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal Email Dispatch Error' },
      { status: 500 }
    );
  }
}
