'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { AuditEngine } from '@/services/audit-engine';
import { CitationService } from '@/services/citation-service';
import { ReviewService } from '@/services/review-service';
import { WhiteLabelSettings } from '@/lib/types';
import { FileText, Download, Share2, Building2, CheckCircle2, Shield, Users, Palette, Mail, Globe, Clock, Plus, Trash2 } from 'lucide-react';

interface TeamMember {
  name: string;
  email: string;
  role: 'Agency Admin' | 'Account Manager' | 'Client Portal View';
  locationsAccess: string;
}

export default function ReportsPage() {
  const { activeOrg, activeLocation } = useOrg();
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'WHITELABEL' | 'PORTAL'>('PREVIEW');
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelSettings>(() =>
    AppStore.getWhiteLabel(activeOrg?.id) || {
      id: 'wl-1',
      agencyName: 'Apex Local Marketing',
      primaryColor: '#4f46e5',
      organizationId: activeOrg?.id || '',
    }
  );

  // Email Automation states
  const [reportFrequency, setReportFrequency] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [clientEmail, setClientEmail] = useState<string>('client@downtowndental.com');
  const [isAutomated, setIsAutomated] = useState<boolean>(true);

  // Agency Team Members list
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: 'Sarah Miller', email: 'sarah@apexmarketing.com', role: 'Agency Admin', locationsAccess: 'All Locations' },
    { name: 'Alex Rivera', email: 'alex@apexmarketing.com', role: 'Account Manager', locationsAccess: 'Downtown Dental Austin' },
    { name: 'Dr. John Smith', email: 'client@downtowndental.com', role: 'Client Portal View', locationsAccess: 'Downtown Dental Austin' },
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Agency Admin' | 'Account Manager' | 'Client Portal View'>('Client Portal View');

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

  const handleShare = () => {
    const shareUrl = `${whiteLabel.customDomain || 'https://reports.apexmarketing.com'}/share/live-${activeLocation.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Branded live dashboard URL copied: ${shareUrl}`);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    setTeamMembers([
      ...teamMembers,
      {
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
        locationsAccess: activeLocation.name,
      },
    ]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleRemoveMember = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <FileText className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Agency reporting & White-Label Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Branded dashboards, PDF exports, and multi-tenant portal managers for <span className="font-bold">{activeOrg?.name}</span>
          </p>
        </div>
      </div>

      {/* Navigation Submenu */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs print:hidden">
        <button
          onClick={() => setActiveTab('PREVIEW')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'PREVIEW'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Branded PDF & Share</span>
        </button>

        <button
          onClick={() => setActiveTab('WHITELABEL')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'WHITELABEL'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Agency Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('PORTAL')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'PORTAL'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members & Client Portal</span>
        </button>
      </div>

      {/* TAB 1: BRANDED PDF & SHARE */}
      {activeTab === 'PREVIEW' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-500">Report Frequency:</span>
                <select
                  value={reportFrequency}
                  onChange={(e) => setReportFrequency(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-bold cursor-pointer"
                >
                  <option value="WEEKLY">Weekly Report</option>
                  <option value="MONTHLY">Monthly Report</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-500">Client Email:</span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
                />
              </div>

              <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-500">
                <input
                  type="checkbox"
                  checked={isAutomated}
                  onChange={(e) => setIsAutomated(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Enable Email Automation</span>
              </label>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={handleShare}
                className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 px-3.5 py-2.5 rounded-xl font-bold transition-all"
              >
                <Share2 className="w-4 h-4 text-brand-500" />
                <span>Share Live Dashboard</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Report</span>
              </button>
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
                <span className="text-xs font-extrabold text-indigo-600">
                  {whiteLabel.customDomain || 'reports.apexmarketing.com'}
                </span>
              </div>
            </div>

            {/* Executive Score Section */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Local SEO Index</span>
                <div className="text-3xl font-black text-indigo-650 mt-1">{auditReport.overallScore}/100</div>
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

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">High-Impact Action Recommendations</h3>
              <div className="space-y-2 text-xs">
                {auditReport.recommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">{rec.title}</div>
                    <div className="text-slate-650 mt-0.5">{rec.actionableStep}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHITE LABEL SETTINGS */}
      {activeTab === 'WHITELABEL' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 print:hidden">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
            <Palette className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
            White-Label Settings & Accent Colors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Agency Name</label>
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Custom Domain CNAMES</label>
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={whiteLabel.primaryColor}
                    onChange={(e) => {
                      const updated = { ...whiteLabel, primaryColor: e.target.value };
                      setWhiteLabel(updated);
                      AppStore.saveWhiteLabel(updated);
                    }}
                    className="w-12 h-9 bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-xl p-1 cursor-pointer"
                  />
                  <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{whiteLabel.primaryColor}</span>
                </div>
              </div>
            </div>

            {/* Custom SMTP and Branding Preview */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center">
                <Mail className="w-4 h-4 mr-1.5 text-indigo-500" />
                Custom SMTP Mailer Sender
              </h4>
              <div className="space-y-2 text-slate-500 font-medium">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sender Email Envelope</label>
                  <input
                    type="text"
                    defaultValue="seo-alerts@apexmarketing.com"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] pt-1">
                  <span>Custom Email Server Connection:</span>
                  <span className="text-emerald-600 font-black">SMTP ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS & CLIENT PORTAL */}
      {activeTab === 'PORTAL' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
          {/* Team Members List */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              Agency Team & Client Portal Roles
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{member.name}</span>
                    <span className="text-slate-450 block">{member.email}</span>
                    <span className="text-[10px] text-brand-600 font-bold block mt-0.5">Access: {member.locationsAccess}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-full font-black text-[10px]">
                      {member.role}
                    </span>
                    <button
                      onClick={() => handleRemoveMember(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Team Member Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 self-start">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Invite Client / Staff
            </h4>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Role / Permissions</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="Agency Admin">Agency Admin (Full access)</option>
                  <option value="Account Manager">Account Manager (Write tasks)</option>
                  <option value="Client Portal View">Client Portal View (Read-only)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm"
              >
                Send Portal Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
