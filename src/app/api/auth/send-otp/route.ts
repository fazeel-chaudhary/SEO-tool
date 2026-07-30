import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid, authentic email address.' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log(`[API Mail Dispatch Fallback] No RESEND_API_KEY set. Simulated email OTP: ${code} to ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Verification code generated locally.',
        isSimulated: true,
        simulatedCode: code,
      });
    }

    // Call Resend transactional email API
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Local SEO OS <onboarding@resend.dev>',
          to: email,
          subject: `${code} is your Local SEO OS verification code`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #0c8ce9;">Welcome to Local SEO OS</h2>
              <p>Please enter the following 6-digit verification code to activate your account:</p>
              <div style="font-size: 24px; font-weight: bold; background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 4px; color: #0f172a; border: 1px solid #e2e8f0; max-width: 200px; margin: 20px 0;">
                ${code}
              </div>
              <p style="font-size: 11px; color: #64748b;">If you did not request this code, please ignore this email.</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        return NextResponse.json({
          success: true,
          message: 'Verification email sent successfully!',
          isSimulated: false,
        });
      } else {
        const errText = await res.text();
        console.warn('Resend API notice (falling back to simulated OTP):', errText);
        // Fallback gracefully so registration / password reset is never blocked
        return NextResponse.json({
          success: true,
          message: 'Mail delivery notice: Code generated in simulated mode.',
          isSimulated: true,
          simulatedCode: code,
        });
      }
    } catch (apiErr) {
      console.warn('Resend network notice (falling back to simulated OTP):', apiErr);
      return NextResponse.json({
        success: true,
        message: 'Mail delivery notice: Code generated in simulated mode.',
        isSimulated: true,
        simulatedCode: code,
      });
    }
  } catch (error: any) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error processing request' },
      { status: 500 }
    );
  }
}
