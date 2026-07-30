'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { RankTrackerService, KeywordSuggestion, AiValidationResult } from '@/services/rank-tracker';
import { Keyword, KeywordRecommendation, KeywordPrediction, KeywordCompetitor, RankingSnapshot } from '@/lib/types';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Target,
  BarChart3,
  Award,
  HelpCircle,
  Check,
  Globe,
  Smartphone,
  Monitor,
  Building2,
  Sliders,
  ShieldCheck,
  Lightbulb,
  Users,
  Eye,
  Trash2,
  X,
  Sparkles,
  Layers,
  FileText,
  Calendar,
} from 'lucide-react';

export default function RankTrackerPage() {
  const { activeLocation, refreshState } = useOrg();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add Keyword Form State
  const [term, setTerm] = useState('');
  const [country, setCountry] = useState('United States');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [customCoords, setCustomCoords] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [deviceType, setDeviceType] = useState<'DESKTOP' | 'MOBILE'>('MOBILE');
  const [language, setLanguage] = useState('English');
  const [searchEngine, setSearchEngine] = useState<'GOOGLE' | 'GOOGLE_MAPS' | 'BING' | 'BOTH'>('GOOGLE_MAPS');
  const [trackType, setTrackType] = useState<'ORGANIC' | 'LOCAL_PACK' | 'GOOGLE_MAPS' | 'BOTH'>('BOTH');

  // AI Validation State
  const [aiValidation, setAiValidation] = useState<AiValidationResult | null>(null);
  const [isValidatingAi, setIsValidatingAi] = useState(false);

  // Modal View States for Selected Keyword
  const [activeKeywordModal, setActiveKeywordModal] = useState<Keyword | null>(null);
  const [modalType, setModalType] = useState<'COMPETITORS' | 'RECOMMENDATIONS' | 'PREDICTION' | 'HISTORY' | null>(null);

  // Suggestions State
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);

  useEffect(() => {
    if (activeLocation) {
      const rawKws = AppStore.getKeywords(activeLocation.id);
      const enrichedKws = rawKws.map((kw) =>
        RankTrackerService.enrichKeywordData(kw, activeLocation.category, activeLocation.city)
      );
      setKeywords(enrichedKws);
      setCity(activeLocation.city);
      setZip(activeLocation.zip);
      setState(activeLocation.state || '');

      const suggs = RankTrackerService.getSuggestedKeywords(
        activeLocation.category,
        activeLocation.city,
        activeLocation.zip
      );
      setSuggestions(suggs);
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to manage keyword rank tracking.</p>
      </div>
    );
  }

  const handleValidateKeywordAi = () => {
    if (!term.trim()) return;
    setIsValidatingAi(true);
    setTimeout(() => {
      const res = RankTrackerService.validateKeywordWithAI(term, activeLocation.category, city || activeLocation.city);
      setAiValidation(res);
      setIsValidatingAi(false);
    }, 300);
  };

  const handleAddKeywordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTerm = term.trim();
    if (!finalTerm) return;

    const locString = `${city || activeLocation.city}, ${state || activeLocation.state || ''} ${zip || activeLocation.zip || ''}, ${country}`;

    const rawKw: Keyword = {
      id: `kw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      term: finalTerm,
      city: city || activeLocation.city,
      state: state || activeLocation.state || '',
      country,
      zip: zip || activeLocation.zip,
      targetLocation: locString.trim(),
      searchRadiusKm: radiusKm,
      deviceType,
      language,
      searchEngine,
      trackType,
      locationId: activeLocation.id,
      createdAt: new Date().toISOString(),
    };

    const enrichedKw = RankTrackerService.enrichKeywordData(rawKw, activeLocation.category, activeLocation.city);

    AppStore.saveKeyword(enrichedKw);
    await RankTrackerService.checkKeywordRank(enrichedKw);

    const updatedList = AppStore.getKeywords(activeLocation.id).map((k) =>
      RankTrackerService.enrichKeywordData(k, activeLocation.category, activeLocation.city)
    );
    setKeywords(updatedList);
    refreshState();
    setShowAddModal(false);
    setTerm('');
    setAiValidation(null);
  };

  const handleDeleteKeyword = (id: string) => {
    if (confirm('Are you sure you want to remove this keyword from rank tracking?')) {
      AppStore.deleteKeyword(id);
      const updatedList = AppStore.getKeywords(activeLocation.id).map((k) =>
        RankTrackerService.enrichKeywordData(k, activeLocation.category, activeLocation.city)
      );
      setKeywords(updatedList);
      refreshState();
    }
  };

  const handleRefreshRankings = async () => {
    setIsRefreshing(true);
    await RankTrackerService.refreshAllLocationKeywords(activeLocation.id);
    const updatedList = AppStore.getKeywords(activeLocation.id).map((k) =>
      RankTrackerService.enrichKeywordData(k, activeLocation.category, activeLocation.city)
    );
    setKeywords(updatedList);
    refreshState();
    setIsRefreshing(false);
  };

  // Ranking Analysis Summary Metrics
  const totalKeywords = keywords.length;
  const top3Count = keywords.filter((k) => (k.googleMapsRank || k.latestRank || 99) <= 3).length;
  const avgMapsRank = totalKeywords > 0
    ? (keywords.reduce((acc, k) => acc + (k.googleMapsRank || k.latestRank || 10), 0) / totalKeywords).toFixed(1)
    : 'N/A';
  const avgVisibility = totalKeywords > 0
    ? Math.round(keywords.reduce((acc, k) => acc + (k.visibilityScore || 70), 0) / totalKeywords)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <TrendingUp className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Keyword Rank Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hyper-local Google Maps & Organic search rank intelligence for <span className="font-bold">{activeLocation.name}</span> ({activeLocation.city})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshRankings}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
            id="refresh-ranks-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Rankings...' : 'Check All Ranks'}</span>
          </button>

          <button
            onClick={() => {
              setTerm('');
              setAiValidation(null);
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95"
            id="add-keyword-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Keyword</span>
          </button>
        </div>
      </div>

      {/* 📊 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tracked Keywords</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center">
            <Search className="w-5 h-5 mr-2 text-brand-600" />
            {totalKeywords} terms
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Location-Targeted Analysis</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Avg Google Maps Rank</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            #{avgMapsRank}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Local Pack Average Position</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Top 3 Map Pack Share</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            {top3Count} / {totalKeywords} terms
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Ranking in Top 3 Local Pack</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Avg Visibility Score</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            {avgVisibility}%
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Share of Local Voice</span>
        </div>
      </div>

      {/* 💡 Suggested Keywords Catalog */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center">
            <Target className="w-4 h-4 mr-2 text-emerald-500" />
            High-Value AI Suggested Keywords for {activeLocation.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Targeted specifically for <span className="font-bold">{activeLocation.category}</span> in <span className="font-bold">{activeLocation.city}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:border-brand-400 transition-all"
            >
              <div className="min-w-0 pr-2">
                <span className="font-bold text-slate-900 dark:text-white block truncate">{sug.term}</span>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                  <span className="bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold px-1.5 py-0.2 rounded">{sug.categoryType}</span>
                  <span>{sug.estimatedVolume}/mo</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setTerm(sug.term);
                  setShowAddModal(true);
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Track</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 📋 Location-Based Keyword Tracking Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-brand-600" />
            Tracked Keywords Dashboard ({keywords.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Location: {activeLocation.city}, {activeLocation.state}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Keyword & Search Config</th>
                <th className="px-4 py-3">Target Location</th>
                <th className="px-4 py-3 text-center">Google Maps</th>
                <th className="px-4 py-3 text-center">Local Pack</th>
                <th className="px-4 py-3 text-center">Organic Rank</th>
                <th className="px-4 py-3 text-center">Change</th>
                <th className="px-4 py-3 text-center">Visibility</th>
                <th className="px-4 py-3 text-center">Volume / Diff</th>
                <th className="px-4 py-3 text-center">AI Opportunity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {keywords.map((kw) => (
                <tr key={kw.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Keyword & Config */}
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">{kw.term}</div>
                    <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-300 flex items-center">
                        {kw.deviceType === 'MOBILE' ? <Smartphone className="w-2.5 h-2.5 mr-1 text-emerald-500" /> : <Monitor className="w-2.5 h-2.5 mr-1 text-indigo-500" />}
                        {kw.deviceType || 'MOBILE'}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-300">
                        📍 {kw.searchRadiusKm || 5} km radius
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-300">
                        {kw.searchEngine || 'GOOGLE_MAPS'}
                      </span>
                    </div>
                  </td>

                  {/* Target Location */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{kw.city}, {kw.state || activeLocation.state}</div>
                    <div className="text-[10px] text-slate-400">{kw.zip || activeLocation.zip} • {kw.country || 'USA'}</div>
                  </td>

                  {/* Google Maps Rank */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center font-black px-2.5 py-1 rounded-xl text-xs ${
                      (kw.googleMapsRank || 99) <= 3
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : (kw.googleMapsRank || 99) <= 10
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      #{(kw.googleMapsRank || kw.latestRank || 'N/A')}
                    </span>
                  </td>

                  {/* Local Pack Rank */}
                  <td className="px-4 py-3 text-center">
                    <span className="font-black text-slate-800 dark:text-slate-200">
                      #{(kw.localPackRank || kw.latestRank || 'N/A')}
                    </span>
                  </td>

                  {/* Organic Rank */}
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-slate-500">
                      #{(kw.organicRank || (kw.googleMapsRank ? kw.googleMapsRank + 3 : 'N/A'))}
                    </span>
                  </td>

                  {/* Previous / Change */}
                  <td className="px-4 py-3 text-center">
                    {kw.rankChange !== undefined && kw.rankChange !== 0 ? (
                      <span className={`inline-flex items-center font-extrabold text-[11px] ${kw.rankChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {kw.rankChange > 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        {kw.rankChange > 0 ? `+${kw.rankChange}` : kw.rankChange}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-bold flex items-center justify-center">
                        <Minus className="w-3 h-3 mr-0.5" /> 0
                      </span>
                    )}
                  </td>

                  {/* Visibility Score */}
                  <td className="px-4 py-3 text-center">
                    <div className="font-extrabold text-slate-800 dark:text-slate-200">{kw.visibilityScore || 85}%</div>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${kw.visibilityScore || 85}%` }}></div>
                    </div>
                  </td>

                  {/* Search Volume / Difficulty */}
                  <td className="px-4 py-3 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{kw.searchVolume || 2400}/mo</div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      (kw.difficulty || 40) > 60
                        ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      Diff: {kw.difficulty || 32}%
                    </span>
                  </td>

                  {/* AI Opportunity Score */}
                  <td className="px-4 py-3 text-center">
                    <span className="font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-1 rounded-xl border border-brand-200 dark:border-brand-900">
                      {kw.opportunityScore || 88}/100
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => { setActiveKeywordModal(kw); setModalType('COMPETITORS'); }}
                        title="View Top 10 Competitors"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => { setActiveKeywordModal(kw); setModalType('RECOMMENDATIONS'); }}
                        title="View AI Action Recommendations"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition-colors"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => { setActiveKeywordModal(kw); setModalType('PREDICTION'); }}
                        title="View Ranking Prediction"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-brand-600 dark:text-brand-400 transition-colors"
                      >
                        <Target className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteKeyword(kw.id)}
                        title="Remove Keyword"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ ADD KEYWORD MODAL (WORKFLOW SPECIFICATION) ═══ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-brand-600" />
                  Add Location-Targeted Keyword
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure precise location parameters and AI validation for <span className="font-bold">{activeLocation.name}</span>
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddKeywordSubmit} className="space-y-4 text-xs">
              {/* Keyword & AI Validation Button */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keyword Term *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder={`e.g. emergency ${activeLocation.category.toLowerCase()} ${activeLocation.city}`}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleValidateKeywordAi}
                    disabled={!term.trim() || isValidatingAi}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center space-x-1 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isValidatingAi ? 'Validating...' : 'AI Validate'}</span>
                  </button>
                </div>
              </div>

              {/* AI Validation Result Box */}
              {aiValidation && (
                <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
                      AI Keyword Suitability Score: {aiValidation.relevanceScore}%
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {aiValidation.isRelevant ? 'SUITABLE' : 'BROAD MATCH'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{aiValidation.notes}</p>
                  
                  {aiValidation.suggestedVariations.length > 0 && (
                    <div className="pt-1.5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">High-Value Suggested Variations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiValidation.suggestedVariations.map((varTerm, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTerm(varTerm)}
                            className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 text-slate-800 dark:text-slate-200 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3 text-indigo-500" />
                            <span>{varTerm}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Target Location Grid */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block">Geographic Location Parameters</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-semibold"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">State / Region</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. IL or TX"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Chicago"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ZIP / Postcode</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="e.g. 60601"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Search Radius & Device Config */}
              <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Search Radius</label>
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value={1}>1 km (0.6 mi)</option>
                    <option value={3}>3 km (1.8 mi)</option>
                    <option value={5}>5 km (3.1 mi)</option>
                    <option value={10}>10 km (6.2 mi)</option>
                    <option value={25}>25 km (15.5 mi)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Device Type</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value as 'DESKTOP' | 'MOBILE')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="MOBILE">📱 Mobile</option>
                    <option value="DESKTOP">💻 Desktop</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Track Type</label>
                  <select
                    value={trackType}
                    onChange={(e) => setTrackType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="BOTH">Both (Local + Organic)</option>
                    <option value="GOOGLE_MAPS">Google Maps</option>
                    <option value="LOCAL_PACK">Local Pack</option>
                    <option value="ORGANIC">Organic Search</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm shadow-brand-600/20"
                >
                  Start Tracking Keyword
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ COMPETITORS MODAL ═══ */}
      {activeKeywordModal && modalType === 'COMPETITORS' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-500" />
                  Top Competitors Comparison for "{activeKeywordModal.term}"
                </h3>
                <p className="text-xs text-slate-500">Location: {activeKeywordModal.city} ({activeKeywordModal.searchRadiusKm || 5} km radius)</p>
              </div>
              <button onClick={() => { setActiveKeywordModal(null); setModalType(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeKeywordModal.competitors?.map((comp, idx) => (
                  <div key={idx} className="py-3 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-lg">
                          #{comp.rank}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">{comp.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-amber-500 font-bold">★ {comp.rating} ({comp.reviewCount} reviews)</span>
                        <span className="text-slate-400">📍 {comp.distanceKm}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                      💡 <span className="font-bold text-slate-800 dark:text-slate-200">Why they rank above:</span> {comp.whyTheyRankAbove}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setActiveKeywordModal(null); setModalType(null); }} className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs">
              Close Competitor Insights
            </button>
          </div>
        </div>
      )}

      {/* ═══ AI RECOMMENDATIONS MODAL ═══ */}
      {activeKeywordModal && modalType === 'RECOMMENDATIONS' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-emerald-500" />
                  AI Action Recommendations for "{activeKeywordModal.term}"
                </h3>
                <p className="text-xs text-slate-500">Prioritized action plan to advance rank position</p>
              </div>
              <button onClick={() => { setActiveKeywordModal(null); setModalType(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-96 overflow-y-auto pr-1">
              {activeKeywordModal.recommendations?.map((rec, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 dark:text-white">{rec.action}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                      rec.impact === 'HIGH' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {rec.impact} IMPACT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{rec.description}</p>
                </div>
              ))}
            </div>

            <button onClick={() => { setActiveKeywordModal(null); setModalType(null); }} className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs">
              Close Recommendations
            </button>
          </div>
        </div>
      )}

      {/* ═══ RANK PREDICTION MODAL ═══ */}
      {activeKeywordModal && modalType === 'PREDICTION' && activeKeywordModal.prediction && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
                  <Target className="w-5 h-5 mr-2 text-brand-600" />
                  Ranking Prediction Analysis
                </h3>
                <p className="text-xs text-slate-500">Term: "{activeKeywordModal.term}"</p>
              </div>
              <button onClick={() => { setActiveKeywordModal(null); setModalType(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-brand-50 dark:bg-brand-950/50 rounded-2xl border border-brand-200 dark:border-brand-900">
                  <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 block uppercase">Est. Map Position</span>
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-400">#{activeKeywordModal.prediction.estimatedRank}</span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase">Confidence Score</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeKeywordModal.prediction.confidenceScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Top 3 Probability</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white">{activeKeywordModal.prediction.probTop3}%</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Top 10 Probability</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white">{activeKeywordModal.prediction.probTop10}%</span>
                </div>
              </div>

              <p className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 rounded-xl font-medium leading-relaxed text-[11px]">
                💡 {activeKeywordModal.prediction.aiNotes}
              </p>
            </div>

            <button onClick={() => { setActiveKeywordModal(null); setModalType(null); }} className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs">
              Close Prediction Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
