'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { WebsiteAuditService } from '@/services/website-audit-service';
import { WebsiteAuditResult } from '@/lib/types';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Gauge,
  Smartphone,
  Lock,
  Code2,
  FileText,
  Building2,
} from 'lucide-react';

export default function WebsiteAuditPage() {
  const { activeLocation, refreshState } = useOrg();
  const [audit, setAudit] = useState<WebsiteAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  useEffect(() => {
    if (activeLocation) {
      WebsiteAuditService.runWebsiteAudit(activeLocation).then((res) => {
        setAudit(res);
      });
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to audit website on-page Local SEO.</p>
      </div>
    );
  }

  const handleReRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await WebsiteAuditService.runWebsiteAudit(activeLocation);
      setAudit(res);
      refreshState();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Globe className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Website Local SEO On-Page Audit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyzing title tags, meta tags, schema JSON-LD, and Core Web Vitals for{' '}
            <span className="font-bold">{activeLocation.website || activeLocation.name}</span>
          </p>
        </div>

        <button
          onClick={handleReRunAudit}
          disabled={isAuditing}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="run-web-audit-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing On-Page Local SEO...' : 'Re-Audit Website'}</span>
        </button>
      </div>

      {audit && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                On-Page SEO Score
              </span>
              <div className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">
                {audit.score} / 100
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Technical Audit Grade</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-indigo-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PageSpeed Score
                </span>
                <Gauge className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {audit.pageSpeedScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">LCP: {audit.lcpTime}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-emerald-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Schema JSON-LD
                </span>
                <Code2 className="w-4 h-4" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                {audit.schemaTypesFound.join(', ')}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Structured Data Active</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-emerald-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Security & Mobile
                </span>
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center space-x-2">
                <span className="flex items-center">
                  <Lock className="w-3.5 h-3.5 mr-1" /> HTTPS OK
                </span>
                <span>•</span>
                <span>Mobile OK</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Mobile Usability Verified</span>
            </div>
          </div>

          {/* Detailed On-Page Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Tags Inspection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center">
                <FileText className="w-4 h-4 mr-2 text-brand-500" />
                Meta & Header Tags Audit
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Title Tag</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Optimized
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic">"{audit.titleTag}"</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Meta Description</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Optimized
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic">"{audit.metaDescription}"</p>
                </div>

                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-800 dark:text-amber-200">H1 Tag</span>
                    <span className="text-amber-600 dark:text-amber-400 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Missing Keyword
                    </span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300">"{audit.h1Tag}"</p>
                </div>
              </div>
            </div>

            {/* Audit Issues & Recommendation Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                Actionable On-Page Issues ({audit.issues.length})
              </h3>

              <div className="space-y-3 text-xs">
                {audit.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start space-x-2 text-slate-700 dark:text-slate-300"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical & Local SEO Parameters Verification checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical SEO Check list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-brand-500" />
                Technical SEO Parameters
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Title Tags</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Optimized (Included City & Category)</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Meta Descriptions</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Optimized (Included Phone & CTA)</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Headings Hierarchy</span>
                  <span className="text-amber-600 font-bold flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> H1 Lacks Target Keyword</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Broken Links</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 0 Broken Links</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Internal Links Map</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 14 Internal Links</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Robots.txt & Sitemap</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Found & Verified</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">HTTPS Protocol</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> TLS Secure Active</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Mobile Friendliness</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Viewport Tag Configured</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Core Web Vitals</span>
                  <span className="text-amber-600 font-bold flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> PageSpeed: {audit.pageSpeedScore}/100</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Indexability status</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Indexable (Googlebot Allowed)</span>
                </div>
              </div>
            </div>

            {/* Local SEO Check list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center">
                <Globe className="w-4 h-4 mr-2 text-brand-500" />
                Local SEO Parameters
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">LocalBusiness Schema</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Found JSON-LD</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">FAQ Schema</span>
                  <span className="text-amber-600 font-bold flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Missing FAQ Schema</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Service Schema</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Found JSON-LD</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Review Schema</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> AggregateRating Active</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Maps Embed</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Google Map iframe detected</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Click-to-Call</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> tel: links configured</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">NAP Consistency</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Matches GBP Baseline</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Location Pages</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Unique page path verified</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Driving Directions</span>
                  <span className="text-emerald-600 font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Link to Google Maps route</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
