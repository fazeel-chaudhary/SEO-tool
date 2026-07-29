'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { DuplicateListing } from '@/lib/types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Building2,
  RefreshCw,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function DuplicateSuppressorPage() {
  const { activeLocation, refreshState } = useOrg();
  const [duplicates, setDuplicates] = useState<DuplicateListing[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'REQUESTED' | 'SUPPRESSED'>('ALL');
  
  // Modals State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedLetterDup, setSelectedLetterDup] = useState<DuplicateListing | null>(null);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
  const [expandedGuide, setExpandedGuide] = useState<string | null>('google');

  // Manual Add Form State
  const [formDir, setFormDir] = useState<string>('Google Maps');
  const [formName, setFormName] = useState<string>('');
  const [formAddr, setFormAddr] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');

  useEffect(() => {
    if (activeLocation) {
      setDuplicates(AppStore.getDuplicateListings(activeLocation.id));
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to inspect & suppress duplicate listings.</p>
      </div>
    );
  }

  const handleSuppress = (id: string) => {
    AppStore.suppressDuplicate(id);
    refreshState();
    setDuplicates(AppStore.getDuplicateListings(activeLocation.id));
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const updated = AppStore.runDuplicateScan(activeLocation.id);
      setDuplicates(updated);
      setIsScanning(false);
      refreshState();
    }, 1200);
  };

  const handleAddManualDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    AppStore.addDuplicateListing({
      directoryName: formDir,
      duplicateName: formName,
      duplicateAddress: formAddr || activeLocation.address,
      duplicatePhone: formPhone || activeLocation.phone,
      duplicateUrl: formUrl || undefined,
      confidenceScore: 92,
      cannibalizationRisk: 'HIGH',
      suppressionStatus: 'DETECTED',
      locationId: activeLocation.id,
    });

    setFormName('');
    setFormAddr('');
    setFormPhone('');
    setFormUrl('');
    setShowAddModal(false);
    refreshState();
    setDuplicates(AppStore.getDuplicateListings(activeLocation.id));
  };

  // Filtered List
  const filteredDuplicates = duplicates.filter((d) => {
    if (filterStatus === 'ACTIVE') return d.suppressionStatus === 'DETECTED';
    if (filterStatus === 'REQUESTED') return d.suppressionStatus === 'SUPPRESSION_REQUESTED';
    if (filterStatus === 'SUPPRESSED') return d.suppressionStatus === 'SUPPRESSED';
    return true;
  });

  // Analytics Counters
  const totalDups = duplicates.length;
  const activeDups = duplicates.filter((d) => d.suppressionStatus === 'DETECTED').length;
  const suppressedDups = duplicates.filter((d) => d.suppressionStatus === 'SUPPRESSED').length;
  const riskPercent = totalDups > 0 ? Math.round((activeDups / totalDups) * 100) : 0;

  // Support letter text generator
  const getSupportLetterText = (dup: DuplicateListing) => {
    return `Subject: Urgent Request to Remove / Merge Duplicate Business Listing - ${dup.duplicateName}

Dear ${dup.directoryName} Support Team,

I am writing to formally request the suppression or merger of a duplicate business listing for our organization:

Primary Verified Listing:
- Business Name: ${activeLocation.name}
- Official Address: ${activeLocation.address}, ${activeLocation.city}, ${activeLocation.state}
- Official Phone: ${activeLocation.phone}
- Official Website: ${activeLocation.website || 'N/A'}

Unverified Duplicate Listing to Suppress:
- Directory: ${dup.directoryName}
- Duplicate Title: ${dup.duplicateName}
- Listed Address: ${dup.duplicateAddress}
- Listed Phone: ${dup.duplicatePhone || 'N/A'}
${dup.duplicateUrl ? `- Duplicate Listing URL: ${dup.duplicateUrl}` : ''}

This duplicate listing contains inaccurate information and is confusing prospective customers while splitting search authority. Please merge reviews and suppress this duplicate listing at your earliest convenience.

Thank you,
${activeLocation.name} Management Team`;
  };

  const copySupportLetter = (dup: DuplicateListing) => {
    const text = getSupportLetterText(dup);
    navigator.clipboard.writeText(text);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <ShieldAlert className="w-7 h-7 mr-2.5 text-amber-500" />
            Duplicate Listing Suppressor & Cleansing Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detect, merge, and suppress duplicate directory profiles cannibalizing Google Local Pack authority for{' '}
            <span className="font-bold text-slate-700 dark:text-slate-300">{activeLocation.name}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Web Directories...' : 'Run Automated Audit'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manual Link</span>
          </button>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Duplicates Found</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{totalDups}</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Across top 12 directories</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Authority Leaks</span>
          <span className="text-2xl font-black text-amber-500 mt-1 block">{activeDups}</span>
          <span className="text-[10px] font-semibold text-amber-600/80 dark:text-amber-400/80 mt-0.5 block">Split-ranking listings</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Suppressed & Merged</span>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">{suppressedDups}</span>
          <span className="text-[10px] font-semibold text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block">Cleaned authority profiles</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rank Split Risk Level</span>
          <span className={`text-2xl font-black mt-1 block ${riskPercent > 50 ? 'text-red-500' : riskPercent > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {riskPercent}% {riskPercent > 50 ? 'HIGH' : riskPercent > 0 ? 'MED' : 'CLEAN'}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Cannibalization impact</span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-1 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition-colors whitespace-nowrap ${
              filterStatus === 'ALL'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Duplicates ({totalDups})
          </button>
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition-colors whitespace-nowrap ${
              filterStatus === 'ACTIVE'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Active Leaks ({activeDups})
          </button>
          <button
            onClick={() => setFilterStatus('REQUESTED')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition-colors whitespace-nowrap ${
              filterStatus === 'REQUESTED'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pending Suppression ({duplicates.filter((d) => d.suppressionStatus === 'SUPPRESSION_REQUESTED').length})
          </button>
          <button
            onClick={() => setFilterStatus('SUPPRESSED')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition-colors whitespace-nowrap ${
              filterStatus === 'SUPPRESSED'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Resolved ({suppressedDups})
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-400 px-2 shrink-0">
          Showing {filteredDuplicates.length} of {duplicates.length} duplicate items
        </span>
      </div>

      {/* Duplicate Listings Matrix */}
      <div className="space-y-4">
        {filteredDuplicates.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No Duplicate Listings Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your business location has zero active duplicate listings cannibalizing local search authority under this filter.
            </p>
          </div>
        ) : (
          filteredDuplicates.map((dup) => (
            <div
              key={dup.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider">
                    {dup.directoryName}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    "{dup.duplicateName}"
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      dup.cannibalizationRisk === 'HIGH' || !dup.cannibalizationRisk
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {dup.cannibalizationRisk || 'HIGH'} CANNIBALIZATION RISK
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      dup.suppressionStatus === 'SUPPRESSED'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : dup.suppressionStatus === 'SUPPRESSION_REQUESTED'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dup.suppressionStatus === 'SUPPRESSED'
                      ? 'Suppressed & Merged'
                      : dup.suppressionStatus === 'SUPPRESSION_REQUESTED'
                      ? 'Pending Removal'
                      : 'Active Leak'}
                  </span>
                </div>
              </div>

              {/* NAP Comparison Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Official Target Location NAP */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Official Target Location NAP:
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">{activeLocation.name}</div>
                  <div className="text-slate-600 dark:text-slate-400">{activeLocation.address}, {activeLocation.city}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{activeLocation.phone}</div>
                </div>

                {/* Detected Duplicate Listing NAP */}
                <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-900/40 space-y-1.5">
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-[11px] uppercase tracking-wider block flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Detected Duplicate Information:
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">{dup.duplicateName}</div>
                  <div className="text-slate-600 dark:text-slate-400">{dup.duplicateAddress}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{dup.duplicatePhone || 'Phone Not Specified'}</div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-medium">
                  <span>Detected: {new Date(dup.detectedAt).toLocaleDateString()}</span>
                  {dup.confidenceScore && <span>Match Confidence: <strong className="text-slate-700 dark:text-slate-200">{dup.confidenceScore}%</strong></span>}
                </div>

                <div className="flex items-center space-x-2">
                  {dup.duplicateUrl && (
                    <a
                      href={dup.duplicateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Live</span>
                    </a>
                  )}

                  <button
                    onClick={() => setSelectedLetterDup(dup)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-500" />
                    <span>Support Request Letter</span>
                  </button>

                  {dup.suppressionStatus !== 'SUPPRESSED' ? (
                    <button
                      onClick={() => handleSuppress(dup.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Request Suppression</span>
                    </button>
                  ) : (
                    <span className="px-3 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Suppressed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Directory Suppression Protocol Guides */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-brand-500" />
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
            Directory Removal & Merge Protocols
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Follow official step-by-step instructions for submitting duplicate removal claims directly to major directory portals:
        </p>

        <div className="space-y-3 pt-2 text-xs">
          {/* Google Maps Guide */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedGuide(expandedGuide === 'google' ? null : 'google')}
              className="w-full p-4 text-left font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center"
            >
              <span className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-blue-500" />
                Google Maps & GBP Duplicate Removal Protocol
              </span>
              {expandedGuide === 'google' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedGuide === 'google' && (
              <div className="p-4 space-y-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                <p>1. Open Google Maps and search for the duplicate business listing.</p>
                <p>2. Click <strong>Suggest an Edit</strong> ➔ select <strong>Close or Remove</strong>.</p>
                <p>3. Choose reason: <strong>"Duplicate of another place"</strong> and select your official GBP listing.</p>
                <p>4. Alternatively, use Google Business Profile Support contact form to request a hard merge of reviews.</p>
              </div>
            )}
          </div>

          {/* Yelp Guide */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedGuide(expandedGuide === 'yelp' ? null : 'yelp')}
              className="w-full p-4 text-left font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center"
            >
              <span className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-red-500" />
                Yelp / Yell UK Duplicate Removal Protocol
              </span>
              {expandedGuide === 'yelp' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedGuide === 'yelp' && (
              <div className="p-4 space-y-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                <p>1. Log in to your Yelp / Yell Business Manager dashboard.</p>
                <p>2. Navigate to <strong>Biz Information</strong> ➔ click <strong>Edit Business Details</strong>.</p>
                <p>3. Select <strong>"Flag as Duplicate"</strong> and provide the canonical profile URL.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Add Manual Duplicate */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
                <Plus className="w-5 h-5 mr-2 text-brand-500" />
                Add Duplicate Listing Manually
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualDuplicate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Directory Name</label>
                <select
                  value={formDir}
                  onChange={(e) => setFormDir(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Google Maps">Google Maps</option>
                  <option value="Yelp UK">Yelp UK</option>
                  <option value="Yell (Yellow Pages)">Yell (Yellow Pages)</option>
                  <option value="Bing Places">Bing Places</option>
                  <option value="Apple Maps">Apple Maps</option>
                  <option value="Facebook Local">Facebook Local</option>
                  <option value="Foursquare">Foursquare</option>
                  <option value="Other Directory">Other Directory</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Duplicate Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manchester Dental (Old Listing)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Duplicate Address</label>
                <input
                  type="text"
                  placeholder="e.g. 14 Deansgate, Manchester M3 2GH"
                  value={formAddr}
                  onChange={(e) => setFormAddr(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Duplicate Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +44 161 555 0199"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Duplicate Listing URL</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save & Add Duplicate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Support Request Letter */}
      {selectedLetterDup && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
                <FileText className="w-5 h-5 mr-2 text-brand-500" />
                Support Request Letter ({selectedLetterDup.directoryName})
              </h3>
              <button
                onClick={() => setSelectedLetterDup(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Copy this standard removal template to paste into {selectedLetterDup.directoryName} support or contact form:
            </p>

            <textarea
              readOnly
              rows={10}
              value={getSupportLetterText(selectedLetterDup)}
              className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none"
            />

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">Ready to send to {selectedLetterDup.directoryName} support</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedLetterDup(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => copySupportLetter(selectedLetterDup)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-xs"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? 'Copied to Clipboard!' : 'Copy Letter Text'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
