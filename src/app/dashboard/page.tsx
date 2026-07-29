'use client';

import React, { useEffect, useState } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { AuditEngine } from '@/services/audit-engine';
import { CitationService } from '@/services/citation-service';
import { ReviewService } from '@/services/review-service';
import { Recommendation, Keyword, RankingSnapshot } from '@/lib/types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowUpRight,
  ShieldAlert,
  Globe,
  MessageSquare,
  Clock,
  Building2,
  Star,
  CheckSquare,
  Award,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { activeOrg, activeLocation, refreshState } = useOrg();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  useEffect(() => {
    if (activeOrg && activeLocation) {
      const recs = AppStore.getRecommendations(activeOrg.id, activeLocation.id);
      const kws = AppStore.getKeywords(activeLocation.id);

      setRecommendations(recs);
      setKeywords(kws);
    }
  }, [activeOrg, activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-slate-500 text-sm mt-1">Select or create a business location to view the Local SEO Dashboard.</p>
      </div>
    );
  }

  // Unified Audit & Scores
  const auditReport = AuditEngine.runUnifiedAudit(activeLocation);
  const citationAudit = CitationService.runCitationAudit(activeLocation);
  const reviewAudit = ReviewService.runReviewAudit(activeLocation);

  const validRanks = keywords.map((k) => k.latestRank).filter((r): r is number => typeof r === 'number');
  const avgRank = validRanks.length > 0 ? validRanks.reduce((a, b) => a + b, 0) / validRanks.length : null;

  const chartData = [
    { date: 'Jul 01', rank: 6 },
    { date: 'Jul 08', rank: 4 },
    { date: 'Jul 15', rank: 3 },
    { date: 'Jul 21', rank: Math.round(avgRank || 3) },
  ];

  const handleStatusChange = (recId: string, newStatus: Recommendation['status']) => {
    AppStore.updateRecommendationStatus(recId, newStatus);
    refreshState();
    if (activeOrg && activeLocation) {
      setRecommendations(AppStore.getRecommendations(activeOrg.id, activeLocation.id));
    }
  };

  const openTasks = recommendations.filter((r) => r.status !== 'DONE');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              {activeOrg?.name}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">{activeLocation.address}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Local SEO OS Dashboard — {activeLocation.name}
          </h1>
        </div>
      </div>

      {activeLocation.gbpStatus === 'SUSPENDED' && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-red-900 dark:text-red-200 text-sm">Google Business Profile Suspended</h3>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5 font-medium">
                This listing was suspended by Google. Customers cannot find you on Search or Maps. <strong>AI suggestion:</strong> Verify your address matches your official business registration documents, remove any keyword-stuffing from the name, and submit reinstatement appeal.
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Launching GBP Reinstatement Wizard... Appeal template loaded with verified NAP details.')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-750 text-white rounded-lg text-[11px] font-bold shrink-0 shadow-sm transition-all"
          >
            Start Appeal Wizard
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {/* Overall Local SEO Score Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Local SEO Index
            </span>
            <Award className="w-5 h-5 text-brand-500" />
          </div>
          <div className="my-3">
            <div className="text-4xl font-black text-brand-600 dark:text-brand-400">
              {auditReport.overallScore} <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Unified Audit Score
            </span>
          </div>
          <p className="text-[11px] text-slate-400">GBP (35%) + Citations (25%) + Reviews (25%) + Ranks (15%)</p>
        </div>

        {/* Directory Citation Score Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Citation Accuracy
            </span>
            <Globe className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="my-3">
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {citationAudit.score}%
            </div>
            <span className="text-xs text-slate-500 font-semibold inline-flex items-center mt-1">
              {citationAudit.correctCount} / 50 directories verified
            </span>
          </div>
          <p className="text-[11px] text-amber-500 font-medium">
            {citationAudit.incorrectCount > 0 ? `${citationAudit.incorrectCount} NAP errors found` : 'All NAP consistent'}
          </p>
        </div>

        {/* Review Management Score Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Review Rating
            </span>
            <MessageSquare className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="my-3">
            <div className="text-4xl font-black text-slate-900 dark:text-white flex items-center">
              {reviewAudit.averageRating}
              <Star className="w-5 h-5 text-amber-400 fill-amber-400 ml-1.5" />
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center mt-1">
              {reviewAudit.responseRate}% response rate
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{reviewAudit.unansweredCount} pending replies</p>
        </div>

        {/* Avg Map Rank Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Avg Map Rank
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="my-3">
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {avgRank ? `#${avgRank.toFixed(1)}` : 'N/A'}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center mt-1">
              Top Local Pack Position
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{keywords.length} keywords tracked</p>
        </div>
      </div>

      {/* Main Grid: Ranking Trend & Dynamic Tasks Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ranking Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Google Maps Rank Trend (Local Pack)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Position history across target search terms in local pack
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
              Rank API Service Active
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis reversed domain={[1, 10]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`Rank #${val}`, 'Position']}
                />
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke="#0c8ce9"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0c8ce9', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flagged Audit Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-amber-500" />
            Audit Health Flags
          </h3>

          <div className="space-y-2.5 text-xs">
            {auditReport.issues.length === 0 ? (
              <div className="p-4 text-center text-emerald-500 font-semibold">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
                All GBP, Citation & Review audits clean!
              </div>
            ) : (
              auditReport.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-200 flex items-start space-x-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{issue}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Unified Recommendation Tasks Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-xl flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
              Tasks to Complete ({openTasks.length} Pending)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live recommendations auto-generated from real GBP health, citation consistency, & customer review audits
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No pending recommendations for this location!
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  rec.status === 'DONE'
                    ? 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rec.priority === 'HIGH'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Module: {rec.auditType}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {rec.timeEstimate}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{rec.description}</p>
                  <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                    <span className="font-bold">Action:</span> {rec.actionableStep}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <select
                    value={rec.status}
                    onChange={(e) =>
                      handleStatusChange(rec.id, e.target.value as Recommendation['status'])
                    }
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
