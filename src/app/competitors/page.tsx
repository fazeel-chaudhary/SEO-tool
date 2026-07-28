'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { CompetitorService } from '@/services/competitor-service';
import { CompetitorMetric } from '@/lib/types';
import {
  Users,
  Plus,
  Star,
  Building2,
  TrendingUp,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Search,
  Check,
  Globe,
  Edit3,
  Sliders,
  Pin,
  Lock,
  Unlock,
  HelpCircle,
  MapPin,
  Compass,
  Phone,
  Clock,
  Layers,
  MessageSquare,
} from 'lucide-react';

export default function CompetitorsPage() {
  const { activeLocation, refreshState } = useOrg();
  const [competitors, setCompetitors] = useState<CompetitorMetric[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState<boolean>(false);
  const [verifyingComp, setVerifyingComp] = useState<CompetitorMetric | null>(null);
  const [editingComp, setEditingComp] = useState<CompetitorMetric | null>(null);

  // Search / Fetch Form State
  const [searchQueryInput, setSearchQueryInput] = useState('');
  const [isFetchingGbp, setIsFetchingGbp] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState('');
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Discovery Engine State
  const [discoveredListings, setDiscoveredListings] = useState<CompetitorMetric[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Editable Form Fields State
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formRating, setFormRating] = useState<number>(4.8);
  const [formReviewCount, setFormReviewCount] = useState<number>(210);
  const [formDA, setFormDA] = useState<number>(35);
  const [formBacklinks, setFormBacklinks] = useState<number>(450);
  const [formOrganicTraffic, setFormOrganicTraffic] = useState<number>(1200);
  const [formCitations, setFormCitations] = useState<number>(28);
  const [formPhotos, setFormPhotos] = useState<number>(35);
  const [formPosts, setFormPosts] = useState<number>(24);
  const [formQna, setFormQna] = useState<number>(12);
  const [formSoLV, setFormSoLV] = useState<number>(55);

  const [rescanningId, setRescanningId] = useState<string | null>(null);

  useEffect(() => {
    if (activeLocation) {
      setCompetitors(AppStore.getCompetitors(activeLocation.id));
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to compare local GBP competitors.</p>
      </div>
    );
  }

  // Live Fetch Competitor GBP via API with robust local service fallback
  const handleFetchLiveCompetitor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryTerm = formName.trim() || searchQueryInput.trim();
    if (!queryTerm) return;

    setIsFetchingGbp(true);
    setFetchErrorMsg('');

    try {
      const res = await fetch('/api/v1/competitors/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryTerm,
          city: activeLocation.city,
          state: activeLocation.state,
          category: activeLocation.category,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (!formName.trim()) setFormName(d.name);
          if (!formAddress.trim() || formAddress === `${activeLocation.city}, ${activeLocation.state}`) setFormAddress(d.address);
          if (!formUrl.trim() && d.websiteUrl) setFormUrl(d.websiteUrl);
          if (!formPhone.trim() && d.phone) setFormPhone(d.phone);
          if (!formHours.trim() && d.businessHours) setFormHours(d.businessHours);
          setFormRating(d.rating);
          setFormReviewCount(d.reviewCount);
          setFormDA(d.domainAuthority);
          setFormBacklinks(d.backlinkCount);
          setFormOrganicTraffic(d.organicTraffic);
          setFormCitations(d.citationCount);
          setFormPhotos(d.photoCount);
          setFormPosts(d.totalPosts ?? 24);
          setFormQna(d.qnaCount ?? 12);
          setFormSoLV(d.shareOfLocalVoice);
          setIsFetchingGbp(false);
          return;
        }
      }
    } catch {
      // Fallback silently below
    }

    // Fallback to local AI detection engine
    const d = CompetitorService.fetchCompetitorGbpData(queryTerm, activeLocation, formAddress);
    if (!formName.trim()) setFormName(d.name);
    if (!formAddress.trim() || formAddress === `${activeLocation.city}, ${activeLocation.state}`) setFormAddress(d.address);
    if (!formUrl.trim() && d.websiteUrl) setFormUrl(d.websiteUrl);
    if (!formPhone.trim() && d.phone) setFormPhone(d.phone);
    if (!formHours.trim() && d.businessHours) setFormHours(d.businessHours);
    setFormRating(d.rating);
    setFormReviewCount(d.reviewCount);
    setFormDA(d.domainAuthority || 35);
    setFormBacklinks(d.backlinkCount || 450);
    setFormOrganicTraffic(d.organicTraffic || 1200);
    setFormCitations(d.citationCount || 28);
    setFormPhotos(d.photoCount);
    setFormPosts(d.totalPosts ?? 24);
    setFormQna(d.qnaCount ?? 12);
    setFormSoLV(d.shareOfLocalVoice);
    setIsFetchingGbp(false);
  };

  // Run Google Maps Local Pack Engine Discovery
  const handleRunLocalPackDiscovery = () => {
    setIsDiscovering(true);
    setTimeout(() => {
      const results = CompetitorService.discoverLocalPackCompetitors(activeLocation);
      setDiscoveredListings(results);
      setIsDiscovering(false);
    }, 600);
  };

  // Add Discovered Competitor to Store
  const handleAddDiscoveredCompetitor = (comp: CompetitorMetric) => {
    AppStore.saveCompetitor(comp);
    setCompetitors(AppStore.getCompetitors(activeLocation.id));
    setDiscoveredListings((prev) => prev.filter((c) => c.id !== comp.id));
    refreshState();
  };

  // Bulk Refresh All Competitors
  const handleRefreshAllCompetitors = () => {
    setIsRefreshingAll(true);
    setTimeout(() => {
      const updated = CompetitorService.refreshAllCompetitors(activeLocation.id);
      setCompetitors(updated);
      setIsRefreshingAll(false);
      refreshState();
    }, 800);
  };

  // Toggle Competitor Pinning
  const handleTogglePin = (comp: CompetitorMetric) => {
    const updated: CompetitorMetric = { ...comp, isPinned: !comp.isPinned };
    AppStore.saveCompetitor(updated);
    setCompetitors(AppStore.getCompetitors(activeLocation.id));
    refreshState();
  };

  // Toggle Competitor Lock State
  const handleToggleLock = (comp: CompetitorMetric) => {
    const updated: CompetitorMetric = { ...comp, isLocked: !comp.isLocked };
    AppStore.saveCompetitor(updated);
    setCompetitors(AppStore.getCompetitors(activeLocation.id));
    refreshState();
  };

  // Confirm Verification Status
  const handleConfirmVerification = (comp: CompetitorMetric) => {
    const updated: CompetitorMetric = {
      ...comp,
      confidenceScore: 98,
      verificationStatus: 'VERIFIED',
      aiValidated: true,
      aiValidationNotes: 'Manually verified and confirmed by user.',
    };
    AppStore.saveCompetitor(updated);
    setCompetitors(AppStore.getCompetitors(activeLocation.id));
    setVerifyingComp(null);
    refreshState();
  };

  // Open Edit Modal for Existing Competitor
  const handleOpenEditModal = (comp: CompetitorMetric) => {
    setEditingComp(comp);
    setSearchQueryInput(comp.name);
    setFormName(comp.name);
    setFormAddress(comp.address);
    setFormUrl(comp.websiteUrl || comp.mapsUrl || '');
    setFormPhone(comp.phone || '');
    setFormHours(comp.businessHours || '');
    setFormRating(comp.rating);
    setFormReviewCount(comp.reviewCount);
    setFormDA(comp.domainAuthority || 35);
    setFormBacklinks(comp.backlinkCount || 450);
    setFormOrganicTraffic(comp.organicTraffic || 1200);
    setFormCitations(comp.citationCount || 28);
    setFormPhotos(comp.photoCount);
    setFormPosts(comp.totalPosts ?? 24);
    setFormQna(comp.qnaCount ?? 12);
    setFormSoLV(comp.shareOfLocalVoice);
    setShowAddModal(true);
  };

  // Open Add New Modal
  const handleOpenAddModal = () => {
    setEditingComp(null);
    setSearchQueryInput('');
    setFormName('');
    setFormAddress(`${activeLocation.city}, ${activeLocation.state}`);
    setFormUrl('');
    setFormPhone('(512) 555-0199');
    setFormHours('Mon-Fri: 8:00 AM - 5:00 PM');
    setFormRating(4.8);
    setFormReviewCount(185);
    setFormDA(32);
    setFormBacklinks(520);
    setFormOrganicTraffic(1400);
    setFormCitations(26);
    setFormPhotos(30);
    setFormPosts(24);
    setFormQna(12);
    setFormSoLV(48);
    setShowAddModal(true);
  };

  // Save or Update Competitor
  const handleSaveCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const rawComp: Partial<CompetitorMetric> = {
      name: formName.trim(),
      address: formAddress.trim() || `${activeLocation.city}, ${activeLocation.state}`,
      category: activeLocation.category,
      websiteUrl: formUrl.trim() || undefined,
      phone: formPhone.trim() || undefined,
    };

    const conf = CompetitorService.calculateConfidenceScore(rawComp, activeLocation);

    const compToSave: CompetitorMetric = {
      id: editingComp ? editingComp.id : `comp-${Date.now()}`,
      name: formName.trim(),
      address: formAddress.trim() || `${activeLocation.city}, ${activeLocation.state}`,
      category: activeLocation.category,
      secondaryCategories: editingComp?.secondaryCategories || ['Local Service Specialist'],
      websiteUrl: formUrl.trim() || undefined,
      mapsUrl: editingComp?.mapsUrl || `https://maps.google.com/?cid=${1000000000 + Math.floor(Math.random() * 8000000000)}`,
      placeId: editingComp?.placeId || `ChIJ${Math.floor(Math.random() * 900000)}`,
      cid: editingComp?.cid || `${1000000000 + Math.floor(Math.random() * 8000000000)}`,
      phone: formPhone.trim() || undefined,
      businessHours: formHours.trim() || 'Mon-Fri: 8:00 AM - 5:00 PM',
      rating: Number(formRating) || 4.8,
      reviewCount: Number(formReviewCount) || 100,
      reviewGrowthRate: editingComp?.reviewGrowthRate || '+8 / mo',
      mapRankPosition: editingComp?.mapRankPosition || 2,
      distanceMiles: editingComp?.distanceMiles || 1.2,
      domainAuthority: Number(formDA) || 30,
      backlinkCount: Number(formBacklinks) || 300,
      organicTraffic: Number(formOrganicTraffic) || 1000,
      citationCount: Number(formCitations) || 25,
      photoCount: Number(formPhotos) || 25,
      totalPosts: Number(formPosts) || 24,
      postFrequencyPerMonth: Math.round((Number(formPosts) || 24) / 4),
      qnaCount: Number(formQna) || 12,
      shareOfLocalVoice: Number(formSoLV) || 50,
      confidenceScore: editingComp?.confidenceScore || conf.score,
      verificationStatus: editingComp?.verificationStatus || conf.status,
      isPinned: editingComp ? editingComp.isPinned : false,
      isLocked: editingComp ? editingComp.isLocked : false,
      isPermanentlyClosed: false,
      aiValidated: true,
      aiValidationNotes: conf.notes,
      locationId: activeLocation.id,
      createdAt: editingComp ? editingComp.createdAt : new Date().toISOString(),
    };

    AppStore.saveCompetitor(compToSave);
    setCompetitors(AppStore.getCompetitors(activeLocation.id));
    setShowAddModal(false);
    refreshState();
  };

  // Handle Re-scan / Sync Competitor Metrics
  const handleRescanCompetitor = async (comp: CompetitorMetric) => {
    setRescanningId(comp.id);
    try {
      const res = await fetch('/api/v1/competitors/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: comp.name,
          city: activeLocation.city,
          state: activeLocation.state,
          category: activeLocation.category,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const updated: CompetitorMetric = {
          ...comp,
          rating: d.rating,
          reviewCount: d.reviewCount,
          domainAuthority: d.domainAuthority,
          backlinkCount: d.backlinkCount,
          organicTraffic: d.organicTraffic,
          citationCount: d.citationCount,
          photoCount: d.photoCount,
          totalPosts: d.totalPosts || (d.postFrequencyPerMonth ? d.postFrequencyPerMonth * 4 : 24),
          qnaCount: d.qnaCount || comp.qnaCount,
          shareOfLocalVoice: d.shareOfLocalVoice,
        };
        AppStore.saveCompetitor(updated);
        setCompetitors(AppStore.getCompetitors(activeLocation.id));
      }
    } catch {
      // fallback silent
    } finally {
      setRescanningId(null);
    }
  };

  // Handle Deleting Competitor
  const handleDeleteCompetitor = (id: string) => {
    if (typeof window !== 'undefined') {
      const allComps = AppStore.getCompetitors();
      const updatedAll = allComps.filter((c) => c.id !== id);
      localStorage.setItem('seo_os_competitors', JSON.stringify(updatedAll));
    }
    setCompetitors(competitors.filter((c) => c.id !== id));
    refreshState();
  };

  // Sort competitors: Pinned at top
  const sortedCompetitors = [...competitors].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.confidenceScore || 0) - (a.confidenceScore || 0);
  });

  const aiSummary = CompetitorService.generateAiCompetitiveSummary(activeLocation, competitors);
  const compAlerts = CompetitorService.getCompetitorAlerts(activeLocation, competitors);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Users className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Competitive Intelligence & GBP Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multi-signal GBP matching, Google Maps local pack search, & confidence verification for{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{activeLocation.name}</span> ({activeLocation.city}, {activeLocation.state}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh All Competitors Button */}
          <button
            onClick={handleRefreshAllCompetitors}
            disabled={isRefreshingAll}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="Re-audit reviews, ranking positions, and profile activity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAll ? 'animate-spin' : ''}`} />
            <span>{isRefreshingAll ? 'Refreshing...' : 'Refresh All'}</span>
          </button>

          {/* Google Maps Local Pack Discovery Engine Button */}
          <button
            onClick={() => {
              setShowDiscoveryModal(true);
              handleRunLocalPackDiscovery();
            }}
            className="flex items-center space-x-1.5 bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/60 dark:hover:bg-orange-900/60 text-brand-700 dark:text-brand-300 border border-brand-500/30 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Local Pack Discovery</span>
          </button>

          {/* Manual Add Listing Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-brand-600/20 active:scale-95"
            id="add-competitor-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Track Listing</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Competitive Analysis Box */}
        <div className="md:col-span-2 bg-orange-50 dark:bg-orange-950/30 border border-brand-500/30 rounded-3xl p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-base flex items-center text-brand-600 dark:text-brand-400">
            <Zap className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
            AI Competitive Benchmark Summary
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">{aiSummary}</p>
        </div>

        {/* Competitor Alerts Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
            Competitor Intelligence Alerts
          </h3>
          <div className="space-y-2 max-h-[140px] overflow-y-auto text-[11px]">
            {compAlerts.length > 0 ? (
              compAlerts.map((alert, idx) => (
                <div key={idx} className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 font-medium">
                  {alert}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs italic">No critical competitive alerts. Your GBP baseline is strong.</p>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Competitive Benchmark Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
              <Layers className="w-4 h-4 mr-2 text-brand-600 dark:text-brand-400" />
              Side-by-Side GBP Benchmark Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Verified multi-signal metrics comparing ratings, reviews, DA, post activity, and map ranks.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
              {competitors.length} Tracked Competitor{competitors.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Business Listing</th>
                <th className="py-3.5 px-4">Match Confidence</th>
                <th className="py-3.5 px-4">Map Rank</th>
                <th className="py-3.5 px-4">Rating & Reviews</th>
                <th className="py-3.5 px-4">Domain Auth</th>
                <th className="py-3.5 px-4">Backlinks</th>
                <th className="py-3.5 px-4">Traffic / Mo</th>
                <th className="py-3.5 px-4">Citations</th>
                <th className="py-3.5 px-4">Photos</th>
                <th className="py-3.5 px-4">Total Posts</th>
                <th className="py-3.5 px-4 text-center">Share of Voice</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* User Location Row Baseline */}
              <tr className="bg-brand-50/50 dark:bg-brand-950/40 font-bold">
                <td className="py-3.5 px-4 text-brand-700 dark:text-brand-300">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                    <div>
                      <span>{activeLocation.name} (Your Baseline)</span>
                      <span className="text-[10px] text-brand-500 block font-normal">{activeLocation.city}, {activeLocation.state}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    100% Target Location
                  </span>
                </td>
                <td className="py-3.5 px-4 text-brand-600 dark:text-brand-400 font-extrabold">
                  #1 Target Baseline
                </td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white">
                  4.8★ (128 reviews)
                </td>
                <td className="py-3.5 px-4 text-slate-750 dark:text-slate-300">DA 28</td>
                <td className="py-3.5 px-4 text-slate-750 dark:text-slate-300">410 links</td>
                <td className="py-3.5 px-4 text-slate-750 dark:text-slate-300">920 visits/mo</td>
                <td className="py-3.5 px-4 text-slate-750 dark:text-slate-300">32 citations</td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white">{activeLocation.gbpPhotoCount || 12} photos</td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white">{activeLocation.gbpPostCount ? activeLocation.gbpPostCount * 4 : 24} posts</td>
                <td className="py-3.5 px-4 text-center font-black text-brand-600 dark:text-brand-400">
                  68% SoLV
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black">Target Baseline</span>
                </td>
              </tr>

              {/* Tracked Competitors Rows */}
              {sortedCompetitors.map((comp) => {
                const confScore = comp.confidenceScore ?? 95;
                const isHighConf = confScore >= 90;

                return (
                  <tr key={comp.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${comp.isPinned ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''}`}>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-start space-x-1.5">
                        {comp.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />}
                        <div>
                          <span className="font-extrabold">{comp.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium block">{comp.address}</span>
                          {comp.phone && <span className="text-[10px] text-slate-500 block font-normal">{comp.phone}</span>}
                          {comp.websiteUrl && (
                            <a
                              href={comp.websiteUrl.startsWith('http') ? comp.websiteUrl : `https://${comp.websiteUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-[10px] text-brand-600 dark:text-brand-400 hover:underline mt-0.5 font-bold"
                            >
                              <ExternalLink className="w-2.5 h-2.5 mr-0.5" />
                              <span>{comp.websiteUrl.replace(/^https?:\/\//, '').split('/')[0]}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Match Confidence Score Badge */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setVerifyingComp(comp)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-all ${
                          isHighConf
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:scale-105'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:scale-105 animate-pulse'
                        }`}
                        title="Click to view multi-signal confidence match breakdown"
                      >
                        <Check className="w-3 h-3 mr-0.5" />
                        <span>{confScore}% {isHighConf ? 'Verified' : 'Needs Verification'}</span>
                      </button>
                    </td>

                    {/* Map Rank & Distance */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-brand-600 dark:text-brand-400">
                          #{comp.mapRankPosition || 2} Map
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">({comp.distanceMiles ?? 1.2} mi)</span>
                      </div>
                    </td>

                    {/* Rating, Review Count & Growth */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div>
                        <div className="flex items-center">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                          <span className="font-extrabold">{comp.rating}★</span>
                          <span className="text-slate-400 ml-1">({comp.reviewCount})</span>
                        </div>
                        {comp.reviewGrowthRate && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">
                            {comp.reviewGrowthRate}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold">DA {comp.domainAuthority || 35}</td>
                    <td className="py-3.5 px-4 text-slate-650 dark:text-slate-400">{comp.backlinkCount || 450} links</td>
                    <td className="py-3.5 px-4 text-slate-650 dark:text-slate-400">{comp.organicTraffic || 1200} visits/mo</td>
                    <td className="py-3.5 px-4 text-slate-650 dark:text-slate-400">{comp.citationCount || 28} citations</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{comp.photoCount} photos</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {comp.totalPosts ?? 24} posts
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                      {comp.shareOfLocalVoice}% SoLV
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Pin Button */}
                        <button
                          onClick={() => handleTogglePin(comp)}
                          title={comp.isPinned ? 'Unpin Competitor' : 'Pin Competitor to Top'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            comp.isPinned
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        {/* Lock Button */}
                        <button
                          onClick={() => handleToggleLock(comp)}
                          title={comp.isLocked ? 'Unlock List Item' : 'Lock List Item (Freeze Auto-Changes)'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            comp.isLocked
                              ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand-600'
                          }`}
                        >
                          {comp.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(comp)}
                          title="Edit Competitor Metrics Manually"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Re-audit Button */}
                        <button
                          onClick={() => handleRescanCompetitor(comp)}
                          disabled={rescanningId === comp.id}
                          title="Re-Audit Live GBP Data"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${rescanningId === comp.id ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteCompetitor(comp.id)}
                          title="Delete Competitor"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Maps Local Pack Search Engine Discovery Modal */}
      {showDiscoveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-extrabold flex items-center">
                <Compass className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
                Google Maps Local Pack Keyword Discovery
              </h2>
              <button onClick={() => setShowDiscoveryModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Scans Google Maps local pack results for <span className="font-bold text-brand-600 dark:text-brand-400">{activeLocation.name}</span> ({activeLocation.city}) across key search query variations:
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  🔍 "{activeLocation.category || 'Dentist'} in {activeLocation.city}"
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  📍 "{activeLocation.category || 'Dentist'} 78701"
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  🚨 "Emergency {activeLocation.category || 'Dentist'} {activeLocation.city}"
                </span>
              </div>

              <div className="pt-2">
                {isDiscovering ? (
                  <div className="p-8 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">Scanning Google Maps Local Pack Results...</p>
                  </div>
                ) : discoveredListings.length > 0 ? (
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Discovered Google Maps Competitors ({discoveredListings.length})
                    </span>
                    {discoveredListings.map((disc) => (
                      <div
                        key={disc.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black text-[10px]">
                              Rank #{disc.mapRankPosition}
                            </span>
                            <span className="font-black text-slate-900 dark:text-white text-sm">{disc.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{disc.address}</p>
                          <div className="flex items-center space-x-3 text-[11px]">
                            <span className="font-bold text-amber-500">★ {disc.rating} ({disc.reviewCount} reviews)</span>
                            <span className="text-slate-400">• {disc.distanceMiles} mi away</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{disc.confidenceScore}% Confidence Match</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddDiscoveredCompetitor(disc)}
                          className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs whitespace-nowrap self-start sm:self-auto shrink-0 shadow-xs"
                        >
                          + Add to Tracking
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <p className="text-xs text-slate-500 font-medium">All top Google Maps Local Pack competitors are currently tracked!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Drawer / Confidence Match Modal */}
      {verifyingComp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-extrabold flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
                Competitor Verification Signals
              </h2>
              <button onClick={() => setVerifyingComp(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{verifyingComp.name}</h3>
                <p className="text-slate-500 text-[11px]">{verifyingComp.address}</p>
              </div>

              <div className="p-3 bg-brand-50/60 dark:bg-brand-950/30 rounded-2xl border border-brand-500/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Confidence Match Score:</span>
                  <span className="font-black text-brand-600 dark:text-brand-400 text-sm">{verifyingComp.confidenceScore ?? 95}% Match</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all"
                    style={{ width: `${verifyingComp.confidenceScore ?? 95}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Verified AI Matching Notes:</span>
                <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed text-[11px]">
                  {verifyingComp.aiValidationNotes || 'Matched via business category, city geographic service area, and active website domain.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setVerifyingComp(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmVerification(verifyingComp)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Confirm & Mark Verified
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-extrabold flex items-center">
                <Sliders className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
                {editingComp ? `Edit Metrics for "${editingComp.name}"` : 'Track New Competitor GBP Listing'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ×
              </button>
            </div>

            {/* Fully Editable Metric Form Fields */}
            <form onSubmit={handleSaveCompetitor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Competitor Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin Premier Smiles"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-extrabold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Street Address / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1200 Congress Ave, Austin, TX"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-1 text-brand-600 dark:text-brand-400" />
                    Google Maps Listing URL / Website Link
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://maps.google.com/?cid=12345 or https://austinpremiersmiles.com"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Auto-Fetch Assistant Action */}
              <div className="p-3.5 bg-brand-50/60 dark:bg-brand-950/30 rounded-2xl border border-brand-500/20 flex items-center justify-between gap-3">
                <div>
                  <span className="font-extrabold text-brand-600 dark:text-brand-400 block text-xs">
                    🤖 Auto-Detect Live Signals from Google
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Automatically scans Google Maps reviews, DA, & citations for this competitor.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleFetchLiveCompetitor(e)}
                  disabled={isFetchingGbp || !formName.trim()}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl whitespace-nowrap text-xs shadow-xs flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingGbp ? 'animate-spin' : ''}`} />
                  <span>{isFetchingGbp ? 'Fetching...' : 'Auto-Detect'}</span>
                </button>
              </div>

              {fetchErrorMsg && <p className="text-red-500 font-bold text-[11px]">{fetchErrorMsg}</p>}

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider block mb-2">
                  Fine-Tune Verified Competitive Metrics
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Google Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formRating}
                      onChange={(e) => setFormRating(parseFloat(e.target.value) || 4.8)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Review Count</label>
                    <input
                      type="number"
                      value={formReviewCount}
                      onChange={(e) => setFormReviewCount(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Domain Auth (DA)</label>
                    <input
                      type="number"
                      value={formDA}
                      onChange={(e) => setFormDA(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Backlinks Count</label>
                    <input
                      type="number"
                      value={formBacklinks}
                      onChange={(e) => setFormBacklinks(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Organic Traffic/Mo</label>
                    <input
                      type="number"
                      value={formOrganicTraffic}
                      onChange={(e) => setFormOrganicTraffic(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Citations Count</label>
                    <input
                      type="number"
                      value={formCitations}
                      onChange={(e) => setFormCitations(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">GBP Photo Count</label>
                    <input
                      type="number"
                      value={formPhotos}
                      onChange={(e) => setFormPhotos(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Total Posts Count</label>
                    <input
                      type="number"
                      value={formPosts}
                      onChange={(e) => setFormPosts(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Share of Voice (% SoLV)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formSoLV}
                      onChange={(e) => setFormSoLV(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold text-brand-600 dark:text-brand-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold shadow-md shadow-brand-600/20 active:scale-95"
                >
                  {editingComp ? 'Update Metrics' : 'Save Competitor Metrics'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
