'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { DIYCitationOpportunity, DFYCitationOrder, DFYCitationSubmissionItem } from '@/lib/types';
import {
  Globe,
  Rocket,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  ShoppingCart,
  FileSpreadsheet,
  Upload,
  Check,
  XCircle,
  HelpCircle,
  Share2,
  RefreshCw,
  Award,
} from 'lucide-react';

export default function CitationBuilderPage() {
  const { activeLocation } = useOrg();
  const [activeTab, setActiveTab] = useState<'DIY' | 'DFY'>('DIY');
  const [diyOpportunities, setDiyOpportunities] = useState<DIYCitationOpportunity[]>([]);
  const [dfyOrders, setDfyOrders] = useState<DFYCitationOrder[]>([]);

  // DIY Filter & Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [onlyCompetitorGaps, setOnlyCompetitorGaps] = useState<boolean>(false);

  // DIY Proof URL Modal State
  const [selectedDIYItem, setSelectedDIYItem] = useState<DIYCitationOpportunity | null>(null);
  const [proofInputUrl, setProofInputUrl] = useState<string>('');

  // DFY Order Package Selector State
  const [selectedPackageCount, setSelectedPackageCount] = useState<number>(50);
  const [customCountInput, setCustomCountInput] = useState<string>('50');
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (activeLocation) {
      setDiyOpportunities(AppStore.getDIYOpportunities(activeLocation.id));
      setDfyOrders(AppStore.getDFYOrders(activeLocation.id));
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to access the Citation Builder strategy & submission engine.</p>
      </div>
    );
  }

  // Handle Marking DIY Item Completed
  const handleSaveProofUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDIYItem) return;

    const updated: DIYCitationOpportunity = {
      ...selectedDIYItem,
      status: 'COMPLETED',
      proofUrl: proofInputUrl.trim() || selectedDIYItem.submissionUrl,
      completedAt: new Date().toISOString(),
    };

    AppStore.saveDIYOpportunity(updated);
    setDiyOpportunities(AppStore.getDIYOpportunities(activeLocation.id));
    setSelectedDIYItem(null);
    setProofInputUrl('');
  };

  const handleUpdateDIYStatus = (item: DIYCitationOpportunity, newStatus: DIYCitationOpportunity['status']) => {
    const updated: DIYCitationOpportunity = {
      ...item,
      status: newStatus,
      completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : item.completedAt,
    };
    AppStore.saveDIYOpportunity(updated);
    setDiyOpportunities(AppStore.getDIYOpportunities(activeLocation.id));
  };

  // Handle Purchasing DFY Citation Package
  const handlePurchaseDFYPackage = () => {
    const count = Math.max(1, selectedPackageCount);
    setIsOrdering(true);

    setTimeout(() => {
      // Mock DFY Auto-generated Order Items
      const mockDirectoryNames = [
        { name: 'CityGrid Local Business Index', domain: 'citygrid.com', da: 89 },
        { name: 'InsiderPages Verified Directory', domain: 'insiderpages.com', da: 84 },
        { name: 'JudyBook Local Services', domain: 'judysbook.com', da: 79 },
        { name: 'MerchantCircle Business Network', domain: 'merchantcircle.com', da: 88 },
        { name: 'Hotfrog Enterprise Directory', domain: 'hotfrog.com', da: 81 },
        { name: 'Brownbook Global Business Guide', domain: 'brownbook.net', da: 77 },
        { name: 'Cylex Business Directory', domain: 'cylex.us.com', da: 75 },
        { name: 'Tupalo Local Community Directory', domain: 'tupalo.com', da: 73 },
      ];

      const generatedItems: DFYCitationSubmissionItem[] = mockDirectoryNames.slice(0, Math.min(count, 8)).map((d, i) => ({
        id: `dfy-item-${Date.now()}-${i}`,
        directoryName: d.name,
        domain: d.domain,
        domainAuthority: d.da,
        status: i === 0 ? 'APPROVED' : i === 1 ? 'SUBMITTED' : 'IN_PROGRESS',
        liveUrl: i === 0 ? `https://${d.domain}/${activeLocation.name.toLowerCase().replace(/\s+/g, '-')}` : undefined,
        submittedAt: new Date().toISOString(),
        approvedAt: i === 0 ? new Date().toISOString() : undefined,
      }));

      const newOrder: DFYCitationOrder = {
        id: `dfy-order-${Date.now().toString().slice(-4)}`,
        locationId: activeLocation.id,
        packageCount: count,
        totalCost: count * 1, // $1 per citation
        orderStatus: 'IN_PROGRESS',
        orderedAt: new Date().toISOString(),
        items: generatedItems,
      };

      AppStore.saveDFYOrder(newOrder);
      setDfyOrders(AppStore.getDFYOrders(activeLocation.id));
      setIsOrdering(false);
      setOrderSuccessMsg(`🎉 Successfully launched Done-For-You order #${newOrder.id} for ${count} citations ($${count})!`);
      setTimeout(() => setOrderSuccessMsg(''), 6000);
    }, 1200);
  };

  // Filter DIY Opportunities
  const filteredDIY = diyOpportunities.filter((item) => {
    const matchesSearch =
      item.directoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || item.category.includes(filterCategory);
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesGap = !onlyCompetitorGaps || item.isCompetitorGap;

    return matchesSearch && matchesCategory && matchesStatus && matchesGap;
  });

  const diyCompletedCount = diyOpportunities.filter((o) => o.status === 'COMPLETED').length;
  const diyProgressPercent = diyOpportunities.length ? Math.round((diyCompletedCount / diyOpportunities.length) * 100) : 0;
  const competitorGapCount = diyOpportunities.filter((o) => o.isCompetitorGap).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-[11px] uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Dual-Mode Citation Strategy
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 flex items-center">
            <Globe className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Citation Builder & Submission Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build local authority for <strong className="text-slate-900 dark:text-white font-bold">{activeLocation.name}</strong> using AI-powered strategy or fully automated $1 submissions.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('DIY')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'DIY'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Do It Yourself (DIY AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('DFY')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'DFY'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Done For You ($1/Citation)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {orderSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <span>{orderSuccessMsg}</span>
          <button onClick={() => setOrderSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700 font-extrabold text-sm">
            ×
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🛠️ MODE 1: DO IT YOURSELF (DIY) AI-POWERED CITATION STRATEGY  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DIY' && (
        <div className="space-y-6">
          {/* AI Intelligence Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-brand-500/20 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                AI Discovered Opportunities
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{diyOpportunities.length}</div>
              <span className="text-[11px] text-slate-500 font-medium">Prioritized for Local 3-Pack</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-brand-500/20 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Competitor Citation Gaps
              </span>
              <div className="text-3xl font-black text-brand-600 dark:text-brand-400">{competitorGapCount}</div>
              <span className="text-[11px] text-slate-500 font-medium">Competitors listed, you are missing</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-500/20 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Completed Submissions
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{diyCompletedCount}</div>
              <span className="text-[11px] text-slate-500 font-medium">{diyProgressPercent}% of recommended strategy</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                DIY Progress Tracker
              </span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${diyProgressPercent}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>{diyCompletedCount} Verified</span>
                <span>{diyOpportunities.length - diyCompletedCount} Remaining</span>
              </div>
            </div>
          </div>

          {/* AI Competitor Citation Gap Banner */}
          {competitorGapCount > 0 && (
            <div className="p-5 bg-orange-50 dark:bg-orange-950/30 border border-brand-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-900 dark:text-white shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-black text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AI Competitor Intelligence Discovery</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Identified {competitorGapCount} high-authority directories where your top competitors rank!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Building listings on these missing directories can directly close your local pack authority gap.
                </p>
              </div>

              <button
                onClick={() => setOnlyCompetitorGaps(!onlyCompetitorGaps)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                  onlyCompetitorGaps
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 border border-brand-500/30 hover:bg-brand-50 dark:hover:bg-slate-800'
                }`}
              >
                {onlyCompetitorGaps ? 'Show All Opportunities' : 'Filter Competitor Gaps Only'}
              </button>
            </div>
          )}

          {/* DIY Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search citation directories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold"
                >
                  <option value="ALL">All ({diyOpportunities.length})</option>
                  <option value="RECOMMENDED">Recommended</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* DIY Citation Opportunities Cards List */}
          <div className="space-y-4">
            {filteredDIY.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-extrabold text-slate-900 dark:text-white">No Matching Citation Opportunities</h3>
                <p className="text-xs text-slate-500">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              filteredDIY.map((opp) => (
                <div
                  key={opp.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                    opp.status === 'COMPLETED'
                      ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : opp.isCompetitorGap
                      ? 'border-brand-500/30 ring-1 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm shrink-0">
                        {opp.directoryName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-black text-slate-900 dark:text-white text-sm">{opp.directoryName}</h3>
                          {opp.isCompetitorGap && (
                            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-[9px] border border-brand-500/30 flex items-center">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Competitor Gap ({opp.competitorName || 'Competitors'})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {opp.domain} • {opp.category} • {opp.country}
                        </span>
                      </div>
                    </div>

                    {/* Quality Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        DA {opp.domainAuthority}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Trust {opp.trustScore}%
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-extrabold ${
                          opp.seoValue === 'EXCEPTIONAL'
                            ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {opp.seoValue} SEO VALUE
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {opp.submissionCost || (opp.isFree ? 'Free Listing' : 'Paid')}
                      </span>
                    </div>
                  </div>

                  {/* AI Why Recommended Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <span className="font-extrabold text-brand-600 dark:text-brand-400 text-[10px] uppercase tracking-wider block">
                      🤖 AI Rationale & Ranking Impact Score ({opp.rankingImpactScore}/100)
                    </span>
                    <p>{opp.whyRecommended}</p>
                  </div>

                  {/* Action Controls & Proof submission */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center space-x-2">
                      <a
                        href={opp.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-800 dark:text-slate-200 font-bold transition-all flex items-center space-x-1.5"
                      >
                        <span>Open Submission Website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {opp.proofUrl && (
                        <a
                          href={opp.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {opp.status === 'COMPLETED' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> Completed
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdateDIYStatus(opp, opp.status === 'IN_PROGRESS' ? 'RECOMMENDED' : 'IN_PROGRESS')}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-all"
                          >
                            {opp.status === 'IN_PROGRESS' ? 'In Progress' : 'Mark In Progress'}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedDIYItem(opp);
                              setProofInputUrl(opp.submissionUrl);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                          >
                            Mark Completed & Add Proof
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🚀 MODE 2: DONE FOR YOU (DFY) AUTOMATED SUBMISSION SERVICE    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DFY' && (
        <div className="space-y-6">
          {/* DFY Pricing & Package Selector Card */}
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl text-white space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 font-black text-[10px] uppercase tracking-wider">
                  $1 Per Citation • Fully Managed Service
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                  Automated Done-For-You Citation Submissions
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Our automated platform submits your audited NAP data directly to high-authority directories. No manual work required.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Flat Rate Pricing</span>
                <div className="text-3xl font-black text-brand-400 mt-0.5">$1.00</div>
                <span className="text-[10px] text-slate-400 font-bold">Per Verified Citation</span>
              </div>
            </div>

            {/* Package Selector Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase text-slate-300 tracking-wider">
                Select Citation Package Quantity
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackageCount(25);
                    setCustomCountInput('25');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    selectedPackageCount === 25
                      ? 'bg-brand-500/10 border-brand-500 text-white shadow-lg ring-2 ring-brand-500/40'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-extrabold block text-slate-400">Starter Pack</span>
                  <div className="text-2xl font-black text-white mt-1">25 Citations</div>
                  <div className="text-lg font-extrabold text-brand-400 mt-1">$25 USD</div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Foundational Local Signals</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackageCount(50);
                    setCustomCountInput('50');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    selectedPackageCount === 50
                      ? 'bg-brand-500/10 border-brand-500 text-white shadow-lg ring-2 ring-brand-500/40'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white font-black text-[9px] uppercase absolute top-3 right-3">
                    Most Popular
                  </span>
                  <span className="text-xs font-extrabold block text-slate-400">Growth Domination</span>
                  <div className="text-2xl font-black text-white mt-1">50 Citations</div>
                  <div className="text-lg font-extrabold text-brand-400 mt-1">$50 USD</div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Recommended for Local 3-Pack</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackageCount(100);
                    setCustomCountInput('100');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    selectedPackageCount === 100
                      ? 'bg-brand-500/10 border-brand-500 text-white shadow-lg ring-2 ring-brand-500/40'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-extrabold block text-slate-400">Enterprise Blast</span>
                  <div className="text-2xl font-black text-white mt-1">100 Citations</div>
                  <div className="text-lg font-extrabold text-brand-400 mt-1">$100 USD</div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Maximum Market Penetration</span>
                </button>
              </div>
            </div>

            {/* Custom Quantity Input */}
            <div className="flex items-center space-x-3 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800 max-w-sm">
              <span className="text-slate-400 font-bold whitespace-nowrap">Or Custom Quantity:</span>
              <input
                type="number"
                min="1"
                max="500"
                value={customCountInput}
                onChange={(e) => {
                  setCustomCountInput(e.target.value);
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) setSelectedPackageCount(val);
                }}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-brand-400 font-black">${selectedPackageCount}</span>
            </div>

            {/* Order Summary & Launch Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold">
                  Order Summary: <strong className="text-white font-extrabold">{selectedPackageCount} Automated Citations</strong> @ $1/each
                </span>
                <p className="text-[11px] text-slate-400">
                  AI will auto-select the highest DA directories matching {activeLocation.category} in {activeLocation.city}, {activeLocation.state}.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePurchaseDFYPackage}
                disabled={isOrdering}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isOrdering ? 'Processing Order...' : `Order & Launch Submissions ($${selectedPackageCount})`}</span>
              </button>
            </div>
          </div>

          {/* Active DFY Orders Progress Monitor */}
          <div className="space-y-5">
            <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-brand-500" />
              Active Done-For-You Citation Orders ({dfyOrders.length})
            </h3>

            {dfyOrders.map((order) => {
              const approvedCount = order.items.filter((i) => i.status === 'APPROVED').length;
              const submittedCount = order.items.filter((i) => i.status === 'SUBMITTED').length;
              const progressPercent = order.items.length ? Math.round((approvedCount / order.items.length) * 100) : 0;

              return (
                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 dark:text-white text-base">Order #{order.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                          {order.orderStatus}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {order.packageCount} Citations Package ($${order.totalCost}) • Ordered on {new Date(order.orderedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                        {approvedCount} / {order.packageCount} Approved ({progressPercent}%)
                      </span>
                      <div className="w-44 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-[11px] font-bold">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex justify-between">
                      <span>Approved</span>
                      <span>{order.items.filter((i) => i.status === 'APPROVED').length}</span>
                    </div>
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-700 dark:text-blue-300 border border-blue-500/20 flex justify-between">
                      <span>Submitted</span>
                      <span>{order.items.filter((i) => i.status === 'SUBMITTED').length}</span>
                    </div>
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-700 dark:text-amber-300 border border-amber-500/20 flex justify-between">
                      <span>In Progress</span>
                      <span>{order.items.filter((i) => i.status === 'IN_PROGRESS').length}</span>
                    </div>
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex justify-between">
                      <span>Pending</span>
                      <span>{order.items.filter((i) => i.status === 'PENDING').length}</span>
                    </div>
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-700 dark:text-red-300 border border-red-500/20 flex justify-between col-span-2 sm:col-span-1">
                      <span>Rejected</span>
                      <span>{order.items.filter((i) => i.status === 'REJECTED').length}</span>
                    </div>
                  </div>

                  {/* Detailed Submission Items Table */}
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Directory Name</th>
                          <th className="py-3 px-4">DA</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Submitted Date</th>
                          <th className="py-3 px-4 text-right">Live URL / Proof</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {order.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {item.directoryName}
                              {item.rejectionReason && (
                                <p className="text-[10px] text-red-500 font-medium mt-0.5">⚠️ {item.rejectionReason}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-400">DA {item.domainAuthority}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  item.status === 'APPROVED'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : item.status === 'SUBMITTED'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : item.status === 'IN_PROGRESS'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : item.status === 'REJECTED'
                                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Queued'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {item.liveUrl ? (
                                <a
                                  href={item.liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center"
                                >
                                  <span>View Live Link</span>
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Processing...</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DIY Proof URL Modal */}
      {selectedDIYItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                Mark Citation Completed
              </h3>
              <button onClick={() => setSelectedDIYItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ×
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Submit proof for <strong className="text-slate-900 dark:text-white font-bold">{selectedDIYItem.directoryName}</strong> to track DIY citation progress.
            </p>

            <form onSubmit={handleSaveProofUrl} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Live Listing URL or Proof Screenshot Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={proofInputUrl}
                  onChange={(e) => setProofInputUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDIYItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
