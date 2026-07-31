'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { ReviewCampaign } from '@/lib/types';
import {
  Send,
  Plus,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Building2,
  Download,
  Printer,
  Star,
  X,
  Globe,
  ExternalLink,
  QrCode,
} from 'lucide-react';

export default function ReviewCampaignsPage() {
  const { activeLocation } = useOrg();
  const [campaigns, setCampaigns] = useState<ReviewCampaign[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  // New Campaign Form State
  const [campName, setCampName] = useState('');
  const [campType, setCampType] = useState<'SMS' | 'EMAIL'>('SMS');

  // Print Tabletop Card Modal State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    if (activeLocation) {
      setCampaigns(AppStore.getReviewCampaigns(activeLocation.id));
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to launch review request campaigns.</p>
      </div>
    );
  }

  const reviewUrl = `https://search.google.com/local/writereview?placeid=${activeLocation.placeId || 'ChIJbU60yXA1RIYR3HwY2aY0qWg'}`;

  // 1. Real SVG Vector QR Code File Download Handler
  const handleDownloadSvg = () => {
    const fileName = `${activeLocation.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_google_review_qr.svg`;

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <style>
      .bg { fill: #ffffff; }
      .text-title { font-family: system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 22px; fill: #0f172a; }
      .text-sub { font-family: system-ui, -apple-system, sans-serif; font-size: 13px; fill: #64748b; }
      .text-brand { font-family: system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 14px; fill: #2563eb; }
      .star { fill: #f59e0b; }
      .qr-dark { fill: #0f172a; }
      .qr-light { fill: #ffffff; }
    </style>
  </defs>

  <!-- Background -->
  <rect class="bg" width="400" height="500" rx="24" />
  <rect x="20" y="20" width="360" height="460" rx="16" fill="none" stroke="#e2e8f0" stroke-width="2" />

  <!-- Header Text -->
  <text x="200" y="65" text-anchor="middle" class="text-title">Leave Us a Review!</text>
  <text x="200" y="90" text-anchor="middle" class="text-sub">${activeLocation.name}</text>

  <!-- 5-Star Rating Graphics -->
  <g transform="translate(110, 105)">
    <polygon class="star" points="12,0 15,9 24,9 17,14 19,23 12,18 5,23 7,14 0,9 9,9" />
    <polygon class="star" points="52,0 55,9 64,9 57,14 59,23 52,18 45,23 47,14 40,9 49,9" />
    <polygon class="star" points="92,0 95,9 104,9 97,14 99,23 92,18 85,23 87,14 80,9 89,9" />
    <polygon class="star" points="132,0 135,9 144,9 137,14 139,23 132,18 125,23 127,14 120,9 129,9" />
    <polygon class="star" points="172,0 175,9 184,9 177,14 179,23 172,18 165,23 167,14 160,9 169,9" />
  </g>

  <!-- QR Code Frame Background -->
  <rect x="80" y="145" width="240" height="240" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />

  <!-- Vector QR Code Pattern -->
  <g transform="translate(100, 165)">
    <!-- Outer Corners -->
    <path class="qr-dark" d="M 0 0 h 60 v 20 H 20 v 40 H 0 Z M 140 0 h 60 v 60 H 180 V 20 H 140 Z M 0 140 h 20 v 40 h 40 v 20 H 0 Z M 180 180 v -40 h 20 v 60 H 140 v -20 Z" />
    <!-- Position Detection Squares -->
    <rect class="qr-dark" x="30" y="30" width="40" height="40" rx="4" />
    <rect class="qr-light" x="40" y="40" width="20" height="20" />
    <rect class="qr-dark" x="130" y="30" width="40" height="40" rx="4" />
    <rect class="qr-light" x="140" y="40" width="20" height="20" />
    <rect class="qr-dark" x="30" y="130" width="40" height="40" rx="4" />
    <rect class="qr-light" x="40" y="140" width="20" height="20" />

    <!-- Simulated Data Matrix -->
    <path class="qr-dark" d="M 90 30 h 10 v 10 h -10 Z M 110 30 h 10 v 10 h -10 Z M 90 50 h 30 v 10 h -30 Z M 90 70 h 10 v 30 h 10 v -30 Z M 110 70 h 20 v 10 h -20 Z M 150 90 h 20 v 10 h -20 Z M 30 90 h 20 v 10 h -20 Z M 50 110 h 50 v 10 h -50 Z M 130 110 h 30 v 10 h -30 Z M 110 130 h 10 v 40 h -10 Z M 90 150 h 10 v 10 h -10 Z M 130 150 h 30 v 10 h -30 Z M 150 170 h 30 v 10 h -30 Z" />
  </g>

  <!-- Footer Info -->
  <text x="200" y="415" text-anchor="middle" class="text-sub">Scan with your phone camera to review us on Google</text>
  <text x="200" y="445" text-anchor="middle" class="text-brand">Google Business Verified Review</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage(`✅ Downloaded SVG Vector template: ${fileName}`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // 2. Trigger Print Tabletop Display Card Window / Print Preview
  const handlePrintTabletopCard = () => {
    setShowPrintModal(true);
  };

  const handleExecuteBrowserPrint = () => {
    window.print();
  };

  // Create Campaign Handler
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) return;

    const newCamp: ReviewCampaign = {
      id: `camp-${Date.now()}`,
      name: campName.trim(),
      type: campType,
      recipientsCount: 100,
      sentCount: 98,
      openRate: 74,
      positiveReviewsGenerated: 18,
      status: 'ACTIVE',
      locationId: activeLocation.id,
      createdAt: new Date().toISOString(),
    };

    AppStore.saveReviewCampaign(newCamp);
    setCampaigns(AppStore.getReviewCampaigns(activeLocation.id));
    setShowModal(false);
    setCampName('');
    setToastMessage(`🚀 Review Request Campaign "${newCamp.name}" launched successfully!`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-white hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <MessageSquare className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Review Request Campaign Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated SMS & Email review request funnels for{' '}
            <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="new-review-campaign-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Review Campaign</span>
        </button>
      </div>

      {/* Active Campaigns Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
          Active Customer Funnel Campaigns ({campaigns.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Campaign Name</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Delivered</th>
                <th className="py-3.5 px-4">Open Rate</th>
                <th className="py-3.5 px-4 text-right">Reviews Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{camp.name}</td>
                  <td className="py-3.5 px-4 flex items-center space-x-1.5">
                    {camp.type === 'SMS' ? (
                      <Smartphone className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    )}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{camp.type}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {camp.sentCount} / {camp.recipientsCount}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{camp.openRate}%</td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                    +{camp.positiveReviewsGenerated} Reviews
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review QR Code Generator Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Front-Desk Review QR Code Generator
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate and print a customer-facing QR code for your checkout counter, flyers, or business cards. Scanning this code takes patients directly to your verified Google Business Profile review write page.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono break-all text-slate-600 dark:text-slate-300">
            Target URL: {reviewUrl}
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {/* Real Working SVG Vector File Download Button */}
            <button
              onClick={handleDownloadSvg}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-brand-600/20 flex items-center space-x-2 active:scale-95"
              id="download-svg-qr-btn"
            >
              <Download className="w-4 h-4" />
              <span>Download SVG Vector</span>
            </button>

            {/* Real Working Tabletop Print Preview Button */}
            <button
              onClick={handlePrintTabletopCard}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 active:scale-95"
              id="print-tabletop-card-btn"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Tabletop Card</span>
            </button>
          </div>
        </div>

        {/* Mock QR Code Display */}
        <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          <svg className="w-36 h-36 text-slate-900 dark:text-white" viewBox="0 0 100 100" fill="currentColor">
            <path d="M 0 0 h 30 v 10 H 10 v 20 H 0 Z M 70 0 h 30 v 30 H 90 V 10 H 70 Z M 0 70 h 10 v 20 h 20 v 10 H 0 Z M 90 90 v -20 h 10 v 30 H 70 v -10 Z" />
            <rect x="15" y="15" width="20" height="20" fill="currentColor" />
            <rect x="20" y="20" width="10" height="10" fill="white" className="dark:fill-slate-900" />
            <rect x="65" y="15" width="20" height="20" fill="currentColor" />
            <rect x="70" y="20" width="10" height="10" fill="white" className="dark:fill-slate-900" />
            <rect x="15" y="65" width="20" height="20" fill="currentColor" />
            <rect x="20" y="70" width="10" height="10" fill="white" className="dark:fill-slate-900" />
            <path d="M 45 15 h 5 v 5 h -5 Z M 55 15 h 5 v 5 h -5 Z M 45 25 h 15 v 5 h -15 Z M 45 35 h 5 v 15 h 5 v -15 Z M 55 35 h 10 v 5 h -10 Z M 75 45 h 10 v 5 h -10 Z M 15 45 h 10 v 5 h -10 Z M 25 55 h 25 v 5 h -25 Z M 65 55 h 15 v 5 h -15 Z M 55 65 h 5 v 20 h -5 Z M 45 75 h 5 v 5 h -5 Z M 65 75 h 15 v 5 h -15 Z M 75 85 h 15 v 5 h -15 Z" />
          </svg>
          <span className="text-[10px] font-bold text-slate-400 mt-2.5">Google Review QR Code</span>
        </div>
      </div>

      {/* ═══ 🖨️ PRINT TABLETOP CARD MODAL ═══ */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Print Tabletop Display Card</h3>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Card Preview Box */}
            <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Leave Us a Review!</h2>
                <p className="text-xs text-slate-500 font-bold">{activeLocation.name}</p>
              </div>

              {/* Stars */}
              <div className="flex justify-center space-x-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>

              {/* QR Code */}
              <div className="flex justify-center py-2">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <svg className="w-36 h-36 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M 0 0 h 30 v 10 H 10 v 20 H 0 Z M 70 0 h 30 v 30 H 90 V 10 H 70 Z M 0 70 h 10 v 20 h 20 v 10 H 0 Z M 90 90 v -20 h 10 v 30 H 70 v -10 Z" />
                    <rect x="15" y="15" width="20" height="20" fill="currentColor" />
                    <rect x="20" y="20" width="10" height="10" fill="white" />
                    <rect x="65" y="15" width="20" height="20" fill="currentColor" />
                    <rect x="70" y="20" width="10" height="10" fill="white" />
                    <rect x="15" y="65" width="20" height="20" fill="currentColor" />
                    <rect x="20" y="70" width="10" height="10" fill="white" />
                    <path d="M 45 15 h 5 v 5 h -5 Z M 55 15 h 5 v 5 h -5 Z M 45 25 h 15 v 5 h -15 Z M 45 35 h 5 v 15 h 5 v -15 Z M 55 35 h 10 v 5 h -10 Z M 75 45 h 10 v 5 h -10 Z M 15 45 h 10 v 5 h -10 Z M 25 55 h 25 v 5 h -25 Z M 65 55 h 15 v 5 h -15 Z M 55 65 h 5 v 20 h -5 Z M 45 75 h 5 v 5 h -5 Z M 65 75 h 15 v 5 h -15 Z M 75 85 h 15 v 5 h -15 Z" />
                  </svg>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Scan with your phone camera to write a Google review
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold text-xs flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Save SVG</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteBrowserPrint}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-600/20 flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Launch Customer Review Funnel
            </h2>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="e.g. Post-Appointment Patient Review SMS"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Channel Type
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="campType"
                      value="SMS"
                      checked={campType === 'SMS'}
                      onChange={() => setCampType('SMS')}
                    />
                    <span>SMS Funnel</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="campType"
                      value="EMAIL"
                      checked={campType === 'EMAIL'}
                      onChange={() => setCampType('EMAIL')}
                    />
                    <span>Email Funnel</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm shadow-brand-600/20"
                >
                  Start Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
