'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth-service';
import { Zap, ShieldAlert, Chrome, Compass, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const auth = AuthService.getCurrentAuth();
    if (auth.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = AuthService.login(email, password);
      setIsLoading(false);

      if (res.success) {
        window.location.href = '/dashboard';
      } else {
        setError(res.message);
      }
    }, 500);
  };

  const triggerQuickLogin = (demoEmail: string) => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const res = AuthService.login(demoEmail, 'admin123');
      setIsLoading(false);
      if (res.success) {
        window.location.href = '/dashboard';
      }
    }, 400);
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
        <h2 className="mt-6 text-center text-3xl font-black text-white">Local SEO OS</h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Sign in to manage locations, rank tracking, citation audits, and AI tools
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

          <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.99]"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Social SSO Logins */}
          <div className="space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="absolute bg-slate-950 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => triggerQuickLogin('alex@agency.com')}
                type="button"
                className="flex items-center justify-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-200 py-2.5 rounded-xl transition-all font-semibold"
              >
                <Chrome className="w-4 h-4 text-red-500" />
                <span>Google</span>
              </button>

              <button
                onClick={() => triggerQuickLogin('alex@agency.com')}
                type="button"
                className="flex items-center justify-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-200 py-2.5 rounded-xl transition-all font-semibold"
              >
                <Compass className="w-4 h-4 text-blue-500" />
                <span>Microsoft</span>
              </button>
            </div>
          </div>

          {/* Demo Logins */}
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5 text-slate-300">
            <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
              Demo Developer Quick Login Profiles
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <button
                onClick={() => triggerQuickLogin('alex@agency.com')}
                className="px-2.5 py-1.5 rounded-lg bg-brand-950/60 border border-brand-900/60 hover:bg-brand-900/80 text-brand-300 font-bold"
              >
                Alex Morgan (Owner)
              </button>
              <button
                onClick={() => triggerQuickLogin('jake@agency.com')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold"
              >
                Jake Carter (Admin)
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400">
              New to Local SEO OS?{' '}
              <Link href="/register" className="text-brand-500 hover:underline font-bold">
                Create an Account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
