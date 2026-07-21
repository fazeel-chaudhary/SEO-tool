'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { AuditEngine } from '@/services/audit-engine';
import { CitationService } from '@/services/citation-service';
import { ReviewService } from '@/services/review-service';
import { WhiteLabelSettings } from '@/lib/types';
import { FileText, Download, Share2, Building2, CheckCircle2, Shield } from 'lucide-react';

export default function ReportsPage() {
  const { activeOrg, activeLocation } = useOrg();
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelSettings>(() =>
    AppStore.getWhiteLabel(activeOrg?.id)
  );

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to generate white-label agency client reports.</p>
      </div>
    );
  }

  const auditReport = AuditEngine.runUnifiedAudit(activeLocation);
  const citationAudit = CitationService.runCitationAudit(activeLocation);
  const reviewAudit = ReviewService.runReviewAudit(activeLocation);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <FileText className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            White-Label Executive Report Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Branded client PDF reporting for <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* White-Label Customization Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 print:hidden">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
          Agency Branding Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Agency Name
            </label>
            <input
              type="text"
              value={whiteLabel.agencyName}
              onChange={(e) => {
                const updated = { ...whiteLabel, agencyName: e.target.value };
                setWhiteLabel(updated);
                AppStore.saveWhiteLabel(updated);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Custom Agency Domain
            </label>
            <input
              type="text"
              value={whiteLabel.customDomain || ''}
              onChange={(e) => {
                const updated = { ...whiteLabel, customDomain: e.target.value };
                setWhiteLabel(updated);
                AppStore.saveWhiteLabel(updated);
              }}
              placeholder="reports.youragency.com"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Brand Accent
            </label>
            <input
              type="color"
              value={whiteLabel.primaryColor}
              onChange={(e) => {
                const updated = { ...whiteLabel, primaryColor: e.target.value };
                setWhiteLabel(updated);
                AppStore.saveWhiteLabel(updated);
              }}
              className="w-full h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Branded PDF Layout Preview Box */}
      <div className="bg-white text-slate-900 p-8 rounded-3xl border border-slate-200 shadow-xl space-y-8 font-sans">
        {/* Report Header */}
        <div className="flex justify-between items-center border-b pb-6 border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Prepared By {whiteLabel.agencyName}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Local SEO Executive Report</h2>
            <p className="text-xs text-slate-500">Client Location: {activeLocation.name}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">{new Date().toLocaleDateString()}</span>
            <span className="text-xs font-extrabold text-brand-600">
              {whiteLabel.customDomain || 'Apex Local Marketing'}
            </span>
          </div>
        </div>

        {/* Executive Score Section */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Local SEO Index</span>
            <div className="text-3xl font-black text-brand-600 mt-1">{auditReport.overallScore}/100</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Citation Accuracy</span>
            <div className="text-3xl font-black text-indigo-600 mt-1">{citationAudit.score}%</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Review Response</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{reviewAudit.responseRate}%</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Rating</span>
            <div className="text-3xl font-black text-amber-500 mt-1">{reviewAudit.averageRating}★</div>
          </div>
        </div>

        {/* Key Achievements & Action Plan */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-base text-slate-900">High-Impact Action Recommendations</h3>
          <div className="space-y-2 text-xs">
            {auditReport.recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{rec.title}</div>
                <div className="text-slate-600">{rec.actionableStep}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
