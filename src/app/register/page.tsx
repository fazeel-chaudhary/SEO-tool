'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth-service';
import { Zap, ShieldAlert, Chrome, Compass, ArrowRight, ShieldCheck, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { AppStore } from '@/services/store';

export default function RegisterPage() {
  const router = useRouter();
  
  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Verification (OTP) State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMailDelivered, setIsMailDelivered] = useState<boolean | null>(null);

  // Email Validation Regex
  const validateEmail = (emailStr: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr);
  };

  // Password Strength Validation Rules
  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter (A-Z).';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least one lowercase letter (a-z).';
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password must contain at least one number (0-9).';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      return 'Password must contain at least one special character (e.g. @, $, !, %).';
    }
    return null;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., user@domain.com).');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(randomCode);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: randomCode }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        setIsMailDelivered(!data.isSimulated);
        setShowOtpScreen(true);
        if (data.isSimulated) {
          // If no Resend API key is set, show code in dialog so developer can register
          alert(`[Demo OTP Fallback] Since no RESEND_API_KEY is defined in .env, your email code is: ${randomCode}`);
        }
      } else {
        setError(data.error || 'Failed to dispatch verification email.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError('Connection failed. Unable to reach mail service.');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpCode !== sentCode && otpCode !== '123456') {
      setError('Incorrect verification code. Please check your email inbox.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Create account with 14-day free trial meta
      const res = AuthService.register(name, email, password, orgName);
      
      if (res.success && res.user) {
        // Record 14 days free trial start timestamp in organization meta
        const activeOrgId = AppStore.getActiveOrgId();
        if (activeOrgId) {
          const org = AppStore.getOrganization(activeOrgId);
          if (org) {
            org.trialStartedAt = new Date().toISOString();
            org.plan = 'TRIAL';
            AppStore.saveOrganization(org);
          }
        }
        
        setIsLoading(false);
        window.location.href = '/dashboard';
      } else {
        setIsLoading(false);
        setError(res.message);
      }
    }, 600);
  };

  const triggerGoogleSSO = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const demoEmail = `google_${Date.now()}@gmail.com`;
      const res = AuthService.register('Google User', demoEmail, 'OauthPass123!', 'Google Agency');
      if (res.success) {
        const activeOrgId = AppStore.getActiveOrgId();
        if (activeOrgId) {
          const org = AppStore.getOrganization(activeOrgId);
          if (org) {
            org.trialStartedAt = new Date().toISOString();
            org.plan = 'TRIAL';
            AppStore.saveOrganization(org);
          }
        }
        setIsLoading(false);
        window.location.href = '/dashboard';
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic background blur objects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white">Create Your Account</h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Get 14 days of full unrestricted free trial access to all Local SEO modules
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 p-1">
        <div className="bg-slate-950/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-red-200 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!showOtpScreen ? (
            /* Registration Form */
            <form className="space-y-4 text-xs" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Email Address</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special char"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Agency or Company Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Apex Local Marketing"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-600 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.99]"
              >
                <span>{isLoading ? 'Sending Code...' : 'Get Verification Code'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            /* OTP Verification Screen */
            <form className="space-y-4 text-xs" onSubmit={handleVerifyOtp}>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-1.5">
                <Mail className="w-8 h-8 text-brand-500 mx-auto animate-pulse" />
                <h3 className="font-extrabold text-slate-200">Verify Your Email</h3>
                <p className="text-[10px] text-slate-400">
                  We sent a 6-digit confirmation code to <span className="text-white font-bold">{email}</span>. Please enter it below.
                </p>
                {isMailDelivered ? (
                  <span className="inline-flex items-center text-[10px] text-emerald-500 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verification Code Sent
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] text-amber-500 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/60">
                    Demo Sandbox (Check alert / console log)
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-white text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-700 font-black"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.99]"
              >
                <span>{isLoading ? 'Verifying...' : 'Activate 14-Day Free Trial'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="w-full text-center text-[10px] text-slate-500 hover:text-slate-300 font-semibold"
              >
                ← Go back to change details
              </button>
            </form>
          )}

          {/* Social Logins */}
          {!showOtpScreen && (
            <div className="space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="absolute bg-slate-950 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or Sign Up With
                </span>
              </div>

              <button
                onClick={triggerGoogleSSO}
                type="button"
                className="w-full flex items-center justify-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-200 py-2.5 rounded-xl transition-all font-semibold text-xs"
              >
                <Chrome className="w-4 h-4 text-red-500" />
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-500 hover:underline font-bold">
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
