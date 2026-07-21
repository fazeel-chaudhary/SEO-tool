'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { CitationService } from '@/services/citation-service';
import { Citation, CitationStatus } from '@/lib/types';
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
} from 'lucide-react';

export default function CitationsPage() {
  const { activeLocation, refreshState } = useOrg();
  const [citations, setCitations] = useState<Citation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

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
        <p className="text-xs text-slate-500">Select a business location to view citation audit status.</p>
      </div>
    );
  }

  const handleRunAudit = () => {
    setIsAuditing(true);
    const result = CitationService.runCitationAudit(activeLocation);
    setCitations(result.citations);
    refreshState();
    setTimeout(() => setIsAuditing(false), 800);
  };

  const correctCount = citations.filter((c) => c.status === 'CORRECT').length;
  const incorrectCount = citations.filter((c) => c.status === 'INCORRECT').length;
  const missingCount = citations.filter((c) => c.status === 'MISSING').length;
  const duplicateCount = citations.filter((c) => c.status === 'DUPLICATE').length;
  const napScore = citations.length > 0 ? Math.round((correctCount / citations.length) * 100) : 0;

  const filteredCitations = citations.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchQuery.trim() && !c.directoryName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Globe className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Directory Citations & NAP Audit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking Name, Address, & Phone (NAP) consistency across 50 major web directories for{' '}
            <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="run-citation-audit-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing 50 Directories...' : 'Run Citation Audit'}</span>
        </button>
      </div>

      {/* Audit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            NAP Consistency
          </span>
          <div className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">
            {napScore}%
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Overall Accuracy</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correct</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {correctCount}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Matching NAP</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Incorrect</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-amber-500 mt-1">{incorrectCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Inconsistent Info</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-red-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-red-500 mt-1">{missingCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Not Listed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duplicates</span>
            <Copy className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-purple-500 mt-1">{duplicateCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Conflicting Entries</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search 50 directories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Directories ({citations.length})</option>
            <option value="CORRECT">Correct ({correctCount})</option>
            <option value="INCORRECT">Incorrect ({incorrectCount})</option>
            <option value="MISSING">Missing ({missingCount})</option>
            <option value="DUPLICATE">Duplicates ({duplicateCount})</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Directory Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Listed NAP Details</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCitations.map((cit) => (
                <tr key={cit.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span>{cit.directoryName}</span>
                      {cit.url && (
                        <a
                          href={cit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-brand-500"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{cit.category}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{cit.napData.name}</div>
                    <div className="text-[11px] text-slate-500">{cit.napData.address}</div>
                    <div className="text-[11px] text-slate-500">{cit.napData.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                    {cit.confidenceScore}%
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        cit.status === 'CORRECT'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : cit.status === 'INCORRECT'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : cit.status === 'MISSING'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {cit.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {cit.status === 'CORRECT' ? (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                      </span>
                    ) : (
                      <button className="bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold transition-all">
                        {cit.status === 'MISSING' ? 'Claim & Submit' : 'Fix Inconsistency'}
                      </button>
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
