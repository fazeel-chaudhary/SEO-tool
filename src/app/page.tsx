'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Navigation,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Building2,
  Users,
  Search,
  FileSpreadsheet,
  Award,
  TrendingUp,
  Layers,
  ChevronRight,
  Globe,
  Sliders,
  Check,
  BarChart3,
  MessageSquare,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  // Interactive ROI Calculator State
  const [locationCount, setLocationCount] = useState<number>(5);
  const [keywordCount, setKeywordCount] = useState<number>(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  const estimatedTrafficGain = Math.round(locationCount * keywordCount * 14.5);
  const estimatedHoursSaved = locationCount * 8;

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-200">
      {/* 🚀 TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-brand-600 via-amber-500 to-brand-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center space-x-2 shadow-sm">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-black">New Release 2.0</span>
        <span>Enterprise 225-Point Geo-Grid Heatmaps & White-Label Reporting is live!</span>
        <Link href="/register" className="underline hover:text-slate-100 flex items-center ml-2 font-extrabold">
          Start Free 14-Day Trial <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* 📌 NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-greenAccent/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-brand-500/20 dark:border-slate-800 px-4 lg:px-8 py-4 transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-brand-500/30 p-1 flex items-center justify-center shadow-md shadow-brand-500/10 shrink-0">
              <img src="/logo.png" className="w-full h-full object-contain rounded-full" alt="Local SEO OS Logo" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-950 dark:text-white tracking-tight block leading-none whitespace-nowrap">
                LOCAL SEO <span className="text-brand-500">OS</span>
              </span>
              <span className="text-[10px] text-brand-700 dark:text-brand-400 font-bold uppercase tracking-wider block mt-0.5">
                Multi-Tenant Geo-Grid Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-black text-slate-950 dark:text-slate-200">
            <a href="#features" className="hover:text-brand-600 transition-colors">Platform Features</a>
            <a href="#geogrid" className="hover:text-brand-600 transition-colors">Geo-Grid Heatmaps</a>
            <a href="#calculator" className="hover:text-brand-600 transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl text-slate-950 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all border border-brand-500/30 dark:border-slate-800 shadow-sm"
              title="Toggle Light / Dark Mode"
              id="home-theme-toggle-btn"
            >
              {mounted && (theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />)}
            </button>

            <Link
              href="/login"
              className="text-xs font-extrabold text-slate-950 dark:text-slate-200 hover:text-brand-600 dark:hover:text-white px-4 py-2.5 rounded-xl transition-all border border-brand-500/30 dark:border-slate-800 hover:border-brand-500 bg-white/80 dark:bg-transparent shadow-sm"
              id="header-sign-in-btn"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="text-xs font-black bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/30 transition-all duration-200 active:scale-95 flex items-center space-x-1.5"
              id="header-get-started-btn"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 🌟 HERO SECTION */}
      <section className="relative pt-16 pb-24 px-4 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-greenAccent border border-brand-500/30 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-black shadow-sm">
            <Award className="w-4 h-4 text-brand-500" />
            <span>#1 Local Ranking Grid & GBP Audit Platform for Agencies</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.1]">
            Supercharge Your Local Search Rankings & <span className="text-brand-500">Multi-Location Visibility</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-300 max-w-3xl mx-auto font-bold leading-relaxed">
            Track Google Maps rankings across 225 grid points, audit GBPs, automate citation directory submissions, and monitor customer reviews — all in one powerful platform built for agencies and enterprise brands.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-brand-500/30 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2"
              id="hero-get-started-btn"
            >
              <span>Start Your 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-4 bg-white dark:bg-slate-900 hover:bg-greenAccent dark:hover:bg-slate-800 text-slate-950 dark:text-slate-200 font-extrabold text-sm rounded-2xl border border-brand-500/30 dark:border-slate-800 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Explore Live Dashboard Demo</span>
            </Link>
          </div>

          {/* Sub-text guarantee */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-950 dark:text-slate-300 font-black pt-2">
            <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700 dark:text-emerald-400" /> No Credit Card Required</span>
            <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700 dark:text-emerald-400" /> Instant 2-Minute Setup</span>
            <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700 dark:text-emerald-400" /> Agency White-Label Ready</span>
          </div>
        </div>

        {/* 🗺️ HERO INTERACTIVE MOCKUP SHOWCASE */}
        <div id="geogrid" className="max-w-5xl mx-auto mt-14 relative rounded-3xl border border-brand-500/30 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-brand-500/20 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-black text-slate-950 dark:text-slate-200 ml-2">Austin Dental Center • Geo-Grid Matrix (5×5)</span>
            </div>
            <span className="text-emerald-900 dark:text-emerald-300 font-black bg-greenAccent dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-600/30">
              Share of Local Voice (SoLV): 84%
            </span>
          </div>

          {/* Visual Grid Mockup Canvas */}
          <div className="py-8 px-4 flex flex-col md:flex-row items-center justify-around gap-6 bg-greenAccent/40 dark:bg-slate-950/60 rounded-2xl my-4 border border-brand-500/20 dark:border-slate-800/60">
            {/* Left: Interactive 5x5 Heatmap Matrix */}
            <div className="grid grid-cols-5 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-brand-500/20 dark:border-slate-800 shadow-sm">
              {[1, 1, 2, 1, 3, 2, 1, 1, 3, 4, 1, 1, 1, 2, 5, 3, 2, 4, 6, 8, 5, 7, 12, 14, 18].map((rank, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer ${
                    rank <= 3
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : rank <= 10
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  #{rank}
                </div>
              ))}
            </div>

            {/* Right: Key Rank Stats */}
            <div className="space-y-4 text-left max-w-sm">
              <div className="p-4 bg-white dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 rounded-xl space-y-1 shadow-sm">
                <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider">Average Map Rank</span>
                <div className="text-2xl font-black text-slate-950 dark:text-white">#2.4 Local Pack</div>
                <p className="text-xs text-slate-900 dark:text-slate-300 font-bold">Scanned across 25 GPS neighborhood coordinates in Austin, TX.</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 rounded-xl space-y-1 shadow-sm">
                <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider">Top Competitor Defeated</span>
                <div className="text-sm font-black text-brand-600 dark:text-brand-400">Capital City Dental (+14 places outranked)</div>
              </div>

              <Link
                href="/register"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md"
              >
                <span>Run a Free Geo-Grid Scan for Your Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🏢 TRUSTED BY LOGO BANNER */}
      <section className="py-10 border-y border-brand-500/20 dark:border-slate-800 bg-greenAccent dark:bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <p className="text-xs font-black text-slate-950 dark:text-slate-300 uppercase tracking-widest">
            Trusted by over 50,000+ local businesses, SEO agencies, and franchise brands
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 font-black text-slate-950 dark:text-slate-300 text-sm sm:text-base">
            <span className="flex items-center space-x-1"><Building2 className="w-5 h-5 text-brand-500 mr-1" /> DENTAL AGENCY CO.</span>
            <span className="flex items-center space-x-1"><Globe className="w-5 h-5 text-indigo-700 dark:text-indigo-400 mr-1" /> METRO HEALTHCARE</span>
            <span className="flex items-center space-x-1"><Award className="w-5 h-5 text-amber-700 dark:text-amber-400 mr-1" /> APEX LOCAL MARKETING</span>
            <span className="flex items-center space-x-1"><Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mr-1" /> FRANCHISE OS</span>
          </div>
        </div>
      </section>

      {/* ⚡ CORE SOLUTION PILLARS */}
      <section id="features" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-brand-700 dark:text-brand-400 bg-greenAccent dark:bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/30">
            Complete Local Search Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
            Everything You Need to Win Google Maps & Local Pack Rankings
          </h2>
          <p className="text-sm sm:text-base text-slate-900 dark:text-slate-300 font-bold">
            Replaces 5 separate SEO tools with one unified multi-location platform designed for maximum accuracy and client reporting.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-md hover:border-brand-500 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Interactive Geo-Grid Heatmaps</h3>
            <p className="text-xs text-slate-900 dark:text-slate-300 font-semibold leading-relaxed">
              Track Google Maps rankings across up to 225 scan points (15×15 matrix) with real-time SERP competitor inspector drawers.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-950 dark:text-slate-200 font-black pt-2">
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> 3×3 up to 15×15 Grid Sizes</li>
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> Share of Local Voice (SoLV %)</li>
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> Side-by-Side Competitor Overlay</li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-md hover:border-brand-500 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-greenAccent dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-950 dark:text-white">GBP Audit & Post Automation</h3>
            <p className="text-xs text-slate-900 dark:text-slate-300 font-semibold leading-relaxed">
              Audit Google Business Profiles for missing categories, NAP inconsistencies, photo counts, and automated scheduled posts.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-950 dark:text-slate-200 font-black pt-2">
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mr-2" /> Automated Post Scheduler</li>
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mr-2" /> Photo & Category Audits</li>
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mr-2" /> Verification Alerts</li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-md hover:border-brand-500 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Citation Builder & Duplicates</h3>
            <p className="text-xs text-slate-900 dark:text-slate-300 font-semibold leading-relaxed">
              Audit 50+ directory citations (Yelp, Apple Maps, Bing, Facebook) to fix NAP errors and suppress duplicate listings.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-950 dark:text-slate-200 font-black pt-2">
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 mr-2" /> 50+ Directory Audits</li>
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 mr-2" /> 1-Click Duplicate Suppression</li>
              <li className="flex items-center"><Check className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 mr-2" /> NAP Consistency Baseline</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 🧮 INTERACTIVE ROI & TIME SAVINGS CALCULATOR */}
      <section id="calculator" className="py-20 px-4 lg:px-8 bg-greenAccent/60 dark:bg-slate-900 border-y border-brand-500/20 dark:border-slate-800">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400">Interactive Agency Calculator</span>
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Calculate Your Agency Time Savings & ROI</h2>
            <p className="text-xs text-slate-900 dark:text-slate-300 font-black">See how much time and traffic gain Local SEO OS generates for your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-slate-950 p-8 rounded-3xl border border-brand-500/20 dark:border-slate-800 shadow-md">
            {/* Sliders */}
            <div className="space-y-6 text-xs">
              <div>
                <div className="flex justify-between font-black text-slate-950 dark:text-white mb-2">
                  <span>Number of Business Locations:</span>
                  <span className="text-brand-600 dark:text-brand-400 font-black text-base">{locationCount} Locations</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={locationCount}
                  onChange={(e) => setLocationCount(parseInt(e.target.value))}
                  className="w-full accent-brand-500 bg-cream dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-black text-slate-950 dark:text-white mb-2">
                  <span>Target Keywords per Location:</span>
                  <span className="text-brand-600 dark:text-brand-400 font-black text-base">{keywordCount} Keywords</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={keywordCount}
                  onChange={(e) => setKeywordCount(parseInt(e.target.value))}
                  className="w-full accent-brand-500 bg-cream dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Live Outputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-greenAccent dark:bg-slate-900 border border-emerald-600/30 dark:border-slate-800 rounded-2xl text-center space-y-1 shadow-sm">
                <span className="text-[10px] font-black text-slate-950 dark:text-slate-400 uppercase">Estimated Monthly Traffic</span>
                <div className="text-3xl font-black text-emerald-900 dark:text-emerald-400">+{estimatedTrafficGain}</div>
                <span className="text-[10px] text-slate-900 dark:text-slate-400 font-bold block">Local customer clicks</span>
              </div>

              <div className="p-4 bg-greenAccent dark:bg-slate-900 border border-brand-500/30 dark:border-slate-800 rounded-2xl text-center space-y-1 shadow-sm">
                <span className="text-[10px] font-black text-slate-950 dark:text-slate-400 uppercase">Agency Hours Saved</span>
                <div className="text-3xl font-black text-brand-600 dark:text-brand-400">{estimatedHoursSaved} hrs/mo</div>
                <span className="text-[10px] text-slate-900 dark:text-slate-400 font-bold block">Automated reporting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💰 PRICING PLANS */}
      <section id="pricing" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-brand-700 dark:text-brand-400 bg-greenAccent dark:bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Simple & Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">Choose the Right Plan for Your Business</h2>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-brand-500/20 dark:border-slate-800 text-xs font-bold mt-4 shadow-sm">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-xl transition-all ${billingCycle === 'MONTHLY' ? 'bg-brand-500 text-white font-black' : 'text-slate-900 dark:text-slate-400 font-bold'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-xl transition-all ${billingCycle === 'ANNUAL' ? 'bg-brand-500 text-white font-black' : 'text-slate-900 dark:text-slate-400 font-bold'}`}
            >
              Annual Billing (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="bg-white dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 p-8 rounded-3xl space-y-6 flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-400">Single Location</span>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Starter Plan</h3>
              <div className="text-4xl font-black text-slate-950 dark:text-white">
                ${billingCycle === 'ANNUAL' ? '29' : '35'}<span className="text-xs font-bold text-slate-900 dark:text-slate-400">/month</span>
              </div>
              <p className="text-xs text-slate-900 dark:text-slate-300 font-bold">Ideal for small businesses tracking 1 location.</p>
              <ul className="space-y-2 text-xs text-slate-950 dark:text-slate-300 font-black pt-2">
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> 15 Tracked Keywords</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> GBP Health Audit</li>
              </ul>
            </div>
            <Link
              href="/register"
              className="w-full py-3 bg-greenAccent dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-950 dark:text-white text-xs font-black rounded-xl text-center block transition-all mt-6 shadow-sm border border-brand-500/20"
            >
              Start Free 14-Day Trial
            </Link>
          </div>

          {/* Plan 2 (Featured Agency Plan) */}
          <div className="bg-white dark:bg-slate-900 border-2 border-brand-500 p-8 rounded-3xl space-y-6 flex flex-col justify-between relative shadow-xl shadow-brand-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-wider shadow-md">
              Most Popular for Agencies
            </div>
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">Agency & Growth</span>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Growth Plan</h3>
              <div className="text-4xl font-black text-slate-950 dark:text-white">
                ${billingCycle === 'ANNUAL' ? '79' : '95'}<span className="text-xs font-bold text-slate-900 dark:text-slate-400">/month</span>
              </div>
              <p className="text-xs text-slate-900 dark:text-slate-300 font-bold">Designed for agencies managing up to 10 locations.</p>
              <ul className="space-y-2 text-xs text-slate-950 dark:text-slate-300 font-black pt-2">
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> 10 Business Locations</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> 15×15 Geo-Grid Scans (225 pts)</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> Unlimited Tracked Keywords</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> White-Label PDF Reports</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> Automated Email Scheduler</li>
              </ul>
            </div>
            <Link
              href="/register"
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-black rounded-xl text-center block transition-all shadow-lg shadow-brand-500/30 mt-6"
            >
              Start Free 14-Day Trial
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="bg-white dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 p-8 rounded-3xl space-y-6 flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-400">Multi-Location & Enterprise</span>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Enterprise Plan</h3>
              <div className="text-4xl font-black text-slate-950 dark:text-white">
                ${billingCycle === 'ANNUAL' ? '199' : '239'}<span className="text-xs font-bold text-slate-900 dark:text-slate-400">/month</span>
              </div>
              <p className="text-xs text-slate-900 dark:text-slate-300 font-bold">For large franchises managing 50+ locations.</p>
              <ul className="space-y-2 text-xs text-slate-950 dark:text-slate-300 font-black pt-2">
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> 50+ Business Locations</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> Unlimited Geo-Grid Heatmaps</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> Custom API & Webhook Access</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-brand-500 mr-2" /> Dedicated Account Manager</li>
              </ul>
            </div>
            <Link
              href="/register"
              className="w-full py-3 bg-greenAccent dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-950 dark:text-white text-xs font-black rounded-xl text-center block transition-all mt-6 shadow-sm border border-brand-500/20"
            >
              Start Free 14-Day Trial
            </Link>
          </div>
        </div>
      </section>

      {/* 🚀 FINAL CTA BANNER */}
      <section className="py-20 px-4 lg:px-8 bg-gradient-to-br from-brand-600 via-amber-600 to-brand-700 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Dominate Local Search Rankings in Your City?
          </h2>
          <p className="text-base font-bold opacity-95 max-w-2xl mx-auto">
            Join thousands of agencies and business owners already using Local SEO OS to track rankings, audit profiles, and grow revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-sm rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all flex items-center justify-center"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 📄 FOOTER */}
      <footer className="py-12 px-4 lg:px-8 bg-greenAccent dark:bg-slate-950 border-t border-brand-500/20 dark:border-slate-900 text-xs text-slate-950 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-brand-500/30 p-0.5 flex items-center justify-center shadow-sm shrink-0">
              <img src="/logo.png" className="w-full h-full object-contain rounded-full" alt="Local SEO OS Logo" />
            </div>
            <span className="font-black text-slate-950 dark:text-white text-sm">LOCAL SEO OS</span>
          </div>

          <div className="flex space-x-6 font-black text-slate-950 dark:text-slate-300">
            <Link href="/register" className="hover:text-brand-500">Register</Link>
            <Link href="/login" className="hover:text-brand-500">Sign In</Link>
            <Link href="/dashboard" className="hover:text-brand-500">Dashboard</Link>
            <Link href="/heatmaps" className="hover:text-brand-500">Geo-Grid Tracker</Link>
          </div>

          <p className="font-bold">© 2026 Local SEO OS Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
