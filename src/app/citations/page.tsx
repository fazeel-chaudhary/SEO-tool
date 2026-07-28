'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { CitationService } from '@/services/citation-service';
import { Citation } from '@/lib/types';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Globe,
  Filter,
  Sparkles,
  Rocket,
  ArrowUpRight,
  TrendingUp,
  Award,
  Layers,
  Activity,
  Zap,
  Clock,
  ChevronRight,
  Check,
} from 'lucide-react';

export default function CitationsPage() {
  const { activeLocation, refreshState } = useOrg();
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterMinDA, setFilterMinDA] = useState<number>(0);
  const [filterFreePaid, setFilterFreePaid] = useState<string>('ALL');
  const [filterListingStatus, setFilterListingStatus] = useState<string>('ALL');
  const [onlyAiRecommended, setOnlyAiRecommended] = useState<boolean>(false);
  const [onlyCompetitorOnly, setOnlyCompetitorOnly] = useState<boolean>(false);

  useEffect(() => {
    if (activeLocation) {
      const citResult = CitationService.runCitationAudit(activeLocation);
      setCitations(citResult.citations);
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to manage directory citations and AI detection audits.</p>
      </div>
    );
  }

  const handleRunAiInternetScan = () => {
    setIsAuditing(true);
    const result = CitationService.runCitationAudit(activeLocation);
    setCitations(result.citations);
    refreshState();
    setTimeout(() => setIsAuditing(false), 900);
  };

  // Metric Calculation
  const totalAvailable = citations.length;
  const approvedCount = citations.filter((c) => c.status === 'CORRECT' || c.listingStatus === 'APPROVED').length;
  const incorrectCount = citations.filter((c) => c.status === 'INCORRECT').length;
  const missingCount = citations.filter((c) => c.status === 'MISSING').length;
  const duplicateCount = citations.filter((c) => c.status === 'DUPLICATE').length;
  const competitorOnlyCount = citations.filter((c) => c.isCompetitorOnly).length;
  const pendingCount = citations.filter((c) => c.listingStatus === 'PENDING').length;

  const napConsistencyScore = totalAvailable > 0 ? Math.round((approvedCount / totalAvailable) * 100) : 0;
  const overallHealthScore = Math.min(100, Math.round(napConsistencyScore * 0.7 + (approvedCount / (totalAvailable - competitorOnlyCount || 1)) * 30));

  // Multi-Filter Logic
  const filteredCitations = citations.filter((c) => {
    const matchesSearch =
      c.directoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = filterCountry === 'ALL' || c.country === filterCountry;
    const matchesCategory = filterCategory === 'ALL' || c.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesMinDA = (c.domainAuthority || 0) >= filterMinDA;

    const matchesFreePaid =
      filterFreePaid === 'ALL' || (filterFreePaid === 'FREE' ? c.isFree : !c.isFree);

    const matchesListingStatus =
      filterListingStatus === 'ALL' ||
      (filterListingStatus === 'APPROVED' && (c.status === 'CORRECT' || c.listingStatus === 'APPROVED')) ||
      (filterListingStatus === 'MISSING' && c.status === 'MISSING') ||
      (filterListingStatus === 'INCORRECT' && c.status === 'INCORRECT') ||
      (filterListingStatus === 'DUPLICATE' && c.status === 'DUPLICATE') ||
      (filterListingStatus === 'PENDING' && c.listingStatus === 'PENDING');

    const matchesAiRecommended = !onlyAiRecommended || c.aiPriority === 'HIGH';
    const matchesCompetitorOnly = !onlyCompetitorOnly || c.isCompetitorOnly;

    return (
      matchesSearch &&
      matchesCountry &&
      matchesCategory &&
      matchesMinDA &&
      matchesFreePaid &&
      matchesListingStatus &&
      matchesAiRecommended &&
      matchesCompetitorOnly
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-[11px] uppercase tracking-wider flex items-center">
              <Globe className="w-3.5 h-3.5 mr-1" /> Directory Citations Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 flex items-center">
            <Layers className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Directory Citations & AI Detection Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Central hub managing directory listings, AI live detection, NAP consistency, and competitor opportunities for{' '}
            <strong className="text-slate-900 dark:text-white font-bold">{activeLocation.name}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleRunAiInternetScan}
            disabled={isAuditing}
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-brand-600/20 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'AI Internet Scan in Progress...' : 'Run AI Internet Scan'}</span>
          </button>

          <Link
            href="/citation-builder"
            className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all border border-slate-200 dark:border-slate-700"
          >
            <Rocket className="w-4 h-4 text-brand-500" />
            <span>Citation Builder Tool</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Summary Statistics Bar (8 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Total Available</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalAvailable}</div>
          <span className="text-[10px] text-slate-500 font-medium">Directories</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-500/20 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">Existing Found</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{approvedCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Active Listings</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-red-500/20 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[9px] font-black uppercase text-red-500 block tracking-wider">Missing Opportunities</span>
          <div className="text-2xl font-black text-red-500">{missingCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Unclaimed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-brand-500/20 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[9px] font-black uppercase text-brand-600 dark:text-brand-400 block tracking-wider">Competitor-Only</span>
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400">{competitorOnlyCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Competitor Gap</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-500/20 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">Completed</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{approvedCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Verified</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-500/20 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[9px] font-black uppercase text-amber-500 block tracking-wider">Pending Submissions</span>
          <div className="text-2xl font-black text-amber-500">{pendingCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">In Queue</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-500/20 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 block tracking-wider">NAP Score</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{napConsistencyScore}%</div>
          <span className="text-[10px] text-slate-500 font-medium">Accuracy</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-brand-500/20 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[9px] font-black uppercase text-brand-600 dark:text-brand-400 block tracking-wider">Citation Health</span>
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400">{overallHealthScore}</div>
          <span className="text-[10px] text-slate-500 font-medium">Overall Score</span>
        </div>
      </div>

      {/* AI Internet Detection & Audit Summary */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-brand-600 dark:text-brand-400" />
            AI Internet Detection & NAP Consistency Findings
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Last Scanned: Today, 01:50 AM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block flex items-center text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
              Verified Active Listings ({approvedCount})
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              AI verified active live listings matching official business NAP across tier-1 directories like Google Maps, Yelp, and Apple Connect.
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-brand-500/30 space-y-1.5">
            <span className="font-bold text-brand-600 dark:text-brand-400 block flex items-center text-xs">
              <AlertTriangle className="w-4 h-4 text-brand-500 mr-1.5" />
              NAP Inconsistencies & Missing Info ({incorrectCount})
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              Detected {incorrectCount} listings with missing suite numbers or ZIP code variations. Resolving these improves local 3-pack proximity score.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <span className="font-bold text-purple-600 dark:text-purple-400 block flex items-center text-xs">
              <Copy className="w-4 h-4 text-purple-500 mr-1.5" />
              Duplicate Listings ({duplicateCount})
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              Found {duplicateCount} duplicate listings causing local authority cannibalization. One-click suppressor recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Competitor-Based Citation Discovery Section */}
      <div className="p-6 bg-orange-50 dark:bg-orange-950/30 border border-brand-500/30 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Competitor Citation Gap Discovery
            </span>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
              Directories where top competitors rank, but {activeLocation.name} is missing
            </h3>
          </div>
          <button
            onClick={() => setOnlyCompetitorOnly(!onlyCompetitorOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              onlyCompetitorOnly
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 border border-brand-500/30'
            }`}
          >
            {onlyCompetitorOnly ? 'Show All Directories' : `Filter ${competitorOnlyCount} Competitor Gaps Only`}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {citations
            .filter((c) => c.isCompetitorOnly)
            .slice(0, 3)
            .map((c) => (
              <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-brand-500/20 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-xs">{c.directoryName}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">DA {c.domainAuthority} • {c.country}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black text-[9px]">
                    {c.aiPriority} PRIORITY
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">{c.aiRecommendation}</p>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Competitors: <strong className="text-slate-900 dark:text-white">{c.competitorsListed?.join(', ') || 'Top Local Competitor'}</strong></span>
                  <Link
                    href="/citation-builder"
                    className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold inline-flex items-center"
                  >
                    <span>Claim (DIY/DFY)</span>
                    <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Comprehensive Search & Multi-Criteria Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search all directories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Quick Toggle Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyAiRecommended(!onlyAiRecommended)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                onlyAiRecommended
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              🤖 AI High Priority Only
            </button>

            <button
              onClick={() => setOnlyCompetitorOnly(!onlyCompetitorOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                onlyCompetitorOnly
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              🎯 Competitor Only ({competitorOnlyCount})
            </button>
          </div>
        </div>

        {/* Multi-Criteria Select Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Country</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All Countries</option>
              <option value="United States">United States</option>
              <option value="Global">Global</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Domain Authority</label>
            <select
              value={filterMinDA}
              onChange={(e) => setFilterMinDA(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value={0}>All DA Ratings</option>
              <option value={80}>High DA (&gt; 80)</option>
              <option value={60}>Medium DA (&gt; 60)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Free / Paid</label>
            <select
              value={filterFreePaid}
              onChange={(e) => setFilterFreePaid(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All Submissions</option>
              <option value="FREE">Free Listing Only</option>
              <option value="PAID">Paid Directory Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Listing Status</label>
            <select
              value={filterListingStatus}
              onChange={(e) => setFilterListingStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All Statuses ({totalAvailable})</option>
              <option value="APPROVED">Approved / Active ({approvedCount})</option>
              <option value="MISSING">Missing / Unclaimed ({missingCount})</option>
              <option value="INCORRECT">Incorrect NAP ({incorrectCount})</option>
              <option value="DUPLICATE">Duplicates ({duplicateCount})</option>
              <option value="PENDING">Pending Queue ({pendingCount})</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="General">General Business</option>
              <option value="Medical">Healthcare & Medical</option>
              <option value="Maps">Maps Network</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Citations Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="font-extrabold text-slate-900 dark:text-white">
            Displaying {filteredCitations.length} Directory Citations
          </span>
          <span className="text-slate-500 font-medium">Single Source of Truth: {activeLocation.name}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Directory Name & Logo</th>
                <th className="py-3.5 px-4">DA / Trust</th>
                <th className="py-3.5 px-4">Country & Category</th>
                <th className="py-3.5 px-4">Free / Paid</th>
                <th className="py-3.5 px-4">Status & AI Recommendation</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCitations.map((cit) => (
                <tr key={cit.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black text-xs flex items-center justify-center shrink-0 border border-brand-500/20">
                        {cit.directoryName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span>{cit.directoryName}</span>
                          {cit.url && (
                            <a href={cit.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-500">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">{cit.domain}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">DA {cit.domainAuthority || 85}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Trust {cit.trustScore || 90}%</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    <div>{cit.country || 'United States'}</div>
                    <div className="text-[10px] text-slate-500">{cit.category}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                      {cit.submissionCost || (cit.isFree ? 'Free Listing' : 'Paid')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          cit.status === 'CORRECT' || cit.listingStatus === 'APPROVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : cit.status === 'INCORRECT'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : cit.status === 'MISSING'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        }`}
                      >
                        {cit.listingStatus || cit.status}
                      </span>

                      {cit.isCompetitorOnly && (
                        <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[9px] font-black border border-brand-500/30">
                          Competitor Gap
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium">{cit.aiRecommendation}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    <div>Added: {cit.dateAdded ? new Date(cit.dateAdded).toLocaleDateString() : '2026-05-10'}</div>
                    <div className="text-[10px] text-slate-400">Updated: {new Date(cit.updatedAt).toLocaleDateString()}</div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {cit.status === 'CORRECT' || cit.listingStatus === 'APPROVED' ? (
                      <a
                        href={cit.url || `https://${cit.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center"
                      >
                        <span>View Live Listing</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      <Link
                        href="/citation-builder"
                        className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center shadow-xs"
                      >
                        <span>{cit.status === 'MISSING' ? 'Claim (DIY/DFY)' : 'Fix NAP Data'}</span>
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
