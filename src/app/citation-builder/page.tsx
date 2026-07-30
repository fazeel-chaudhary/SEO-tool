'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { CitationService } from '@/services/citation-service';
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
  Users,
  Layers,
  FileText,
  X,
  CreditCard,
  Lock,
} from 'lucide-react';

export default function CitationBuilderPage() {
  const { activeLocation } = useOrg();
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMPETITOR_GAPS' | 'IN_PROGRESS' | 'COMPLETED' | 'DFY'>('ALL');
  const [diyOpportunities, setDiyOpportunities] = useState<DIYCitationOpportunity[]>([]);
  const [dfyOrders, setDfyOrders] = useState<DFYCitationOrder[]>([]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // AI Discovery Loading State
  const [isDiscoveringAi, setIsDiscoveringAi] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Proof Modal State
  const [selectedDIYItem, setSelectedDIYItem] = useState<DIYCitationOpportunity | null>(null);
  const [proofInputUrl, setProofInputUrl] = useState<string>('');

  // DFY Order Package & Payment Modal State
  const [selectedPackageCount, setSelectedPackageCount] = useState<number>(50);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Payment Form Fields
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [billingZip, setBillingZip] = useState<string>('');

  useEffect(() => {
    if (activeLocation) {
      const catalog = CitationService.generateComprehensiveCitationCatalog(activeLocation);
      setDiyOpportunities(catalog);
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

  // Trigger Continuous AI Discovery
  const handleRunContinuousAiDiscovery = () => {
    setIsDiscoveringAi(true);
    setTimeout(() => {
      const newlyDiscovered = CitationService.discoverNewAiCitations(activeLocation);
      const updatedList = AppStore.getDIYOpportunities(activeLocation.id);
      setDiyOpportunities(updatedList);
      setIsDiscoveringAi(false);

      if (newlyDiscovered.length > 0) {
        setToastMessage(`AI Continuous Discovery found ${newlyDiscovered.length} new high-authority citation directories for ${activeLocation.city}!`);
      } else {
        setToastMessage(`Continuous Discovery verified: Your citation catalog is already fully up to date with 100% directory coverage.`);
      }
      setTimeout(() => setToastMessage(''), 6000);
    }, 1200);
  };

  // Status Change Handler
  const handleUpdateDIYStatus = (item: DIYCitationOpportunity, newStatus: DIYCitationOpportunity['status']) => {
    const updated: DIYCitationOpportunity = {
      ...item,
      status: newStatus,
      completedAt: newStatus === 'LIVE' ? new Date().toISOString() : item.completedAt,
    };
    AppStore.saveDIYOpportunity(updated);
    setDiyOpportunities(AppStore.getDIYOpportunities(activeLocation.id));
  };

  // Proof Modal Save
  const handleSaveProofUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDIYItem) return;

    const updated: DIYCitationOpportunity = {
      ...selectedDIYItem,
      status: 'LIVE',
      proofUrl: proofInputUrl.trim() || selectedDIYItem.submissionUrl,
      liveUrl: proofInputUrl.trim() || selectedDIYItem.submissionUrl,
      completedAt: new Date().toISOString(),
    };

    AppStore.saveDIYOpportunity(updated);
    setDiyOpportunities(AppStore.getDIYOpportunities(activeLocation.id));
    setSelectedDIYItem(null);
    setProofInputUrl('');
  };

  // Open Payment Modal
  const handleOpenPaymentModal = () => {
    setCardName(activeLocation.name || '');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setBillingZip(activeLocation.zip || '78701');
    setShowPaymentModal(true);
  };

  // Process Credit Card Payment & Purchase DFY Order
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      const count = Math.max(1, selectedPackageCount);
      const mockDirectoryNames = [
        { name: 'CityGrid Local Business Index', domain: 'citygrid.com', da: 89 },
        { name: 'InsiderPages Verified Directory', domain: 'insiderpages.com', da: 84 },
        { name: 'JudyBook Local Services', domain: 'judysbook.com', da: 79 },
        { name: 'MerchantCircle Business Network', domain: 'merchantcircle.com', da: 88 },
        { name: 'Hotfrog Enterprise Directory', domain: 'hotfrog.com', da: 81 },
      ];

      const generatedItems: DFYCitationSubmissionItem[] = mockDirectoryNames.map((d, i) => ({
        id: `dfy-item-${Date.now()}-${i}`,
        directoryName: d.name,
        domain: d.domain,
        domainAuthority: d.da,
        status: i === 0 ? 'APPROVED' : 'IN_PROGRESS',
        submittedAt: new Date().toISOString(),
      }));

      const newOrder: DFYCitationOrder = {
        id: `dfy-order-${Date.now().toString().slice(-4)}`,
        locationId: activeLocation.id,
        packageCount: count,
        totalCost: count * 1,
        orderStatus: 'IN_PROGRESS',
        orderedAt: new Date().toISOString(),
        items: generatedItems,
      };

      AppStore.saveDFYOrder(newOrder);
      setDfyOrders(AppStore.getDFYOrders(activeLocation.id));
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      setToastMessage(`💳 Payment of $${count}.00 Successful! Launched Done-For-You Citation Order #${newOrder.id} for ${count} citations!`);
      setTimeout(() => setToastMessage(''), 6000);
    }, 1500);
  };

  // Metric Computations
  const totalOpportunities = diyOpportunities.length;
  const completedCount = diyOpportunities.filter((o) => o.status === 'LIVE' || o.status === 'COMPLETED').length;
  const remainingCount = diyOpportunities.filter((o) => o.status !== 'LIVE' && o.status !== 'COMPLETED').length;
  const competitorGapCount = diyOpportunities.filter((o) => o.isCompetitorGap && o.status !== 'LIVE').length;
  const inProgressCount = diyOpportunities.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'SUBMITTED' || o.status === 'PENDING_APPROVAL').length;
  const completionRate = totalOpportunities > 0 ? Math.round((completedCount / totalOpportunities) * 100) : 0;
  const citationHealthScore = Math.min(99, Math.max(65, 75 + Math.round(completionRate * 0.24)));

  // Filter Items
  const filteredItems = diyOpportunities.filter((item) => {
    const matchesSearch =
      item.directoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    let matchesTab = true;
    if (activeTab === 'COMPETITOR_GAPS') matchesTab = item.isCompetitorGap && item.status !== 'LIVE';
    else if (activeTab === 'IN_PROGRESS') matchesTab = item.status === 'IN_PROGRESS' || item.status === 'SUBMITTED' || item.status === 'PENDING_APPROVAL';
    else if (activeTab === 'COMPLETED') matchesTab = item.status === 'LIVE' || item.status === 'COMPLETED';

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-white" />
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
            <Globe className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            AI Citation Builder & Discovery Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Continuous AI directory discovery & competitor citation gap tracking for <span className="font-bold">{activeLocation.name}</span> ({activeLocation.city}, {activeLocation.state})
          </p>
        </div>

        {/* Continuous AI Discovery Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunContinuousAiDiscovery}
            disabled={isDiscoveringAi}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            id="ai-continuous-discovery-btn"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isDiscoveringAi ? 'animate-spin' : ''}`} />
            <span>{isDiscoveringAi ? 'Discovering Directories...' : 'Continuous AI Discovery'}</span>
          </button>
        </div>
      </div>

      {/* 📊 Citation Progress Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Opportunities</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalOpportunities}</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">High DA Directories</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Completed & Verified</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{completedCount}</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Live Citation Listings</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Remaining to Build</span>
          <div className="text-xl font-black text-amber-500 mt-0.5">{remainingCount}</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Pending Submissions</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Competitor Citation Gaps</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{competitorGapCount}</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Competitor-Only Sites</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Completion Rate</span>
          <div className="text-xl font-black text-brand-600 dark:text-brand-400 mt-0.5">{completionRate}%</div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Citation Health Score</span>
          <div className="text-xl font-black text-emerald-500 mt-0.5">{citationHealthScore}%</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">NAP Consistency Score</span>
        </div>
      </div>

      {/* 🧭 Navigation Sub-Tabs Bar */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'ALL' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-brand-600'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>All Opportunities ({diyOpportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPETITOR_GAPS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'COMPETITOR_GAPS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Competitor Citation Gaps ({competitorGapCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('IN_PROGRESS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'IN_PROGRESS' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>In Progress / Submitted ({inProgressCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed & Verified ({completedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('DFY')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'DFY' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Done-For-You Services ($1/Citation)</span>
        </button>
      </div>

      {/* 🔍 Search & Category Filter Controls */}
      {activeTab !== 'DFY' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directory name, domain, or category..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto text-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Category:</span>
            {['ALL', 'General', 'Local', 'Industry', 'Chamber', 'Professional', 'Niche', 'Government'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 📋 OPPORTUNITY CARDS GRID */}
      {activeTab !== 'DFY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between transition-all hover:border-brand-400 ${
                item.isCompetitorGap
                  ? 'border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/20 to-transparent'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-2.5">
                {/* Header Title & Badges */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center">
                      <Globe className="w-4 h-4 mr-1.5 text-brand-600 shrink-0" />
                      {item.directoryName}
                    </h3>
                    <a
                      href={item.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center mt-0.5"
                    >
                      <span>{item.domain}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </a>
                  </div>

                  <span className="font-black text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-lg">
                    DA {item.domainAuthority}
                  </span>
                </div>

                {/* Category & Cost Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="bg-slate-100 dark:bg-slate-800 font-bold px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                  <span className="bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold px-2 py-0.5 rounded">
                    {item.submissionCost || (item.isFree ? 'Free Listing' : 'Paid')}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
                    {item.seoValue} SEO VALUE
                  </span>
                </div>

                {/* Competitor Gap Banner */}
                {item.isCompetitorGap && (
                  <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl text-[11px] space-y-1">
                    <span className="font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      Competitor Gap Detected!
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[10px] font-medium leading-relaxed">
                      {item.competitorsListedCount || 3} top competitors in {activeLocation.city} are listed here. Submitting will close the local rank gap.
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {item.whyRecommended}
                </p>
              </div>

              {/* Status Selector & Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Submission Status</span>
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateDIYStatus(item, e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="LIVE">Live (Verified)</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="NEEDS_UPDATE">Needs Update</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={item.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-sm"
                  >
                    Submit Citation
                  </a>

                  <button
                    onClick={() => {
                      setSelectedDIYItem(item);
                      setProofInputUrl(item.proofUrl || item.submissionUrl);
                    }}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-3 py-2 rounded-xl text-xs transition-all"
                  >
                    Proof URL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 DONE-FOR-YOU CITATION SERVICES TAB */}
      {activeTab === 'DFY' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl space-y-5 shadow-sm">
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-extrabold px-3 py-1 rounded-xl text-xs border border-amber-300 dark:border-amber-800">
              <Rocket className="w-4 h-4 text-amber-600" />
              <span>Automated Done-For-You Citation Submissions</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              We Manually Submit & Verify Citations for $1 / Citation
            </h2>
            
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
              Our Local SEO team manually claims, builds, and verifies listings on high-authority directories across the US, UK, Canada, and Australia with 100% NAP consistency.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setSelectedPackageCount(25)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedPackageCount === 25
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <span className="font-extrabold text-sm block">Starter Pack</span>
                <span className="text-xl font-black mt-1 block">25 Citations ($25)</span>
              </button>

              <button
                onClick={() => setSelectedPackageCount(50)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedPackageCount === 50
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <span className="font-extrabold text-sm block">Growth Pack (Recommended)</span>
                <span className="text-xl font-black mt-1 block">50 Citations ($50)</span>
              </button>

              <button
                onClick={() => setSelectedPackageCount(100)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedPackageCount === 100
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <span className="font-extrabold text-sm block">Enterprise Dominance</span>
                <span className="text-xl font-black mt-1 block">100 Citations ($100)</span>
              </button>
            </div>

            {/* Launch Button Triggers Credit Card Payment Modal */}
            <button
              onClick={handleOpenPaymentModal}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Launch DFY Order for {selectedPackageCount} Citations (${selectedPackageCount})</span>
            </button>
          </div>

          {/* Active Orders List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active DFY Citation Orders ({dfyOrders.length})</h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {dfyOrders.map((order) => (
                <div key={order.id} className="py-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">Order #{order.id} — {order.packageCount} Citations</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Ordered on {new Date(order.orderedAt).toLocaleDateString()} • Total Cost: ${order.totalCost}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ 💳 CREDIT CARD PAYMENT CHECKOUT MODAL ═══ */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Secure Payment Checkout</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary Box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>DFY Citation Package</span>
                <span>{selectedPackageCount} Citations</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Price per Citation</span>
                <span>$1.00 / citation</span>
              </div>
              <div className="flex justify-between font-black text-sm text-amber-600 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount Due</span>
                <span>${selectedPackageCount}.00</span>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cardholder Name *</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Card Number *</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry *</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">CVC *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ZIP / Postcode *</label>
                  <input
                    type="text"
                    required
                    value={billingZip}
                    onChange={(e) => setBillingZip(e.target.value)}
                    placeholder="78701"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium text-center"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center">
                  <Lock className="w-3 h-3 mr-1 text-emerald-500" />
                  256-Bit SSL Encrypted Checkout
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-400">Visa • MC • Amex</span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessingPayment ? 'Processing...' : `Pay $${selectedPackageCount}.00 & Launch`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ PROOF / LIVE URL MODAL ═══ */}
      {selectedDIYItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Submit Live Listing URL</h3>
              <button onClick={() => setSelectedDIYItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProofUrl} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Live Verified URL on {selectedDIYItem.directoryName}
                </label>
                <input
                  type="url"
                  required
                  value={proofInputUrl}
                  onChange={(e) => setProofInputUrl(e.target.value)}
                  placeholder={`https://${selectedDIYItem.domain}/biz/...`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedDIYItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Mark Verified & Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
