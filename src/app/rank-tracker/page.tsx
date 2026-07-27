'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { RankTrackerService, KeywordSuggestion, RankPredictionResult } from '@/services/rank-tracker';
import { Keyword } from '@/lib/types';
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
  Zap,
  Target,
  BarChart3,
  Award,
  HelpCircle,
  Check,
} from 'lucide-react';

export default function RankTrackerPage() {
  const { activeLocation, refreshState } = useOrg();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add Keyword Form State
  const [term, setTerm] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  // Predictive Rank Simulation State
  const [predictionInput, setPredictionInput] = useState('');
  const [predictionResult, setPredictionResult] = useState<RankPredictionResult | null>(null);

  // Suggestions State
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);

  useEffect(() => {
    if (activeLocation) {
      const kws = AppStore.getKeywords(activeLocation.id);
      setKeywords(kws);
      setCity(activeLocation.city);
      setZip(activeLocation.zip);

      // Generate suggested keywords for this business & location
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

  const handleAddKeyword = async (termToAdd: string, targetCity?: string, targetZip?: string) => {
    const finalTerm = termToAdd.trim();
    if (!finalTerm) return;

    // Run prediction to get initial rank
    const pred = RankTrackerService.predictKeywordRank(finalTerm, activeLocation.category, activeLocation.city);

    const newKw: Keyword = {
      id: `kw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      term: finalTerm,
      city: targetCity || city || activeLocation.city,
      zip: targetZip || zip || activeLocation.zip,
      locationId: activeLocation.id,
      latestRank: pred.predictedInitialRank,
      rankChange: 0,
    };

    AppStore.saveKeyword(newKw);
    await RankTrackerService.checkKeywordRank(newKw);
    setKeywords(AppStore.getKeywords(activeLocation.id));
    refreshState();
    setShowAddModal(false);
    setTerm('');
  };

  const handleRefreshRankings = async () => {
    setIsRefreshing(true);
    await RankTrackerService.refreshAllLocationKeywords(activeLocation.id);
    setKeywords(AppStore.getKeywords(activeLocation.id));
    refreshState();
    setIsRefreshing(false);
  };

  const handleRunPrediction = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const res = RankTrackerService.predictKeywordRank(searchTerm, activeLocation.category, activeLocation.city);
    setPredictionResult(res);
  };

  // Ranking Analysis Summary Metrics
  const totalKeywords = keywords.length;
  const top3Count = keywords.filter((k) => (k.latestRank || 99) <= 3).length;
  const top10Count = keywords.filter((k) => (k.latestRank || 99) > 3 && (k.latestRank || 99) <= 10).length;
  const avgRank = totalKeywords > 0
    ? (keywords.reduce((acc, k) => acc + (k.latestRank || 15), 0) / totalKeywords).toFixed(1)
    : 'N/A';
  const top3Percentage = totalKeywords > 0 ? Math.round((top3Count / totalKeywords) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <TrendingUp className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Keyword Rank Tracker & AI Impact Predictor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyzing Google Maps positions & predicting keyword additions for <span className="font-bold">{activeLocation.name}</span> ({activeLocation.city})
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95"
            id="add-keyword-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Keyword</span>
          </button>
        </div>
      </div>

      {/* 📊 Section 1: Ranking Analysis Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tracked Keywords</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center">
            <Search className="w-5 h-5 mr-2 text-brand-600" />
            {totalKeywords} terms
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Active Map Pack tracking</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Map Pack Position</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            #{avgRank}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Local Pack Average</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Top 3 Map Pack Share</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            {top3Percentage}% ({top3Count} terms)
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Ranking in Top 3 Local Pack</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Opportunity Keywords</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            {top10Count} terms
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Ranking #4 - #10</span>
        </div>
      </div>

      {/* 🔮 Section 2: AI Predictive Rank Impact Analyzer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
            <Zap className="w-5 h-5 mr-2 text-indigo-500" />
            AI Ranking Impact Predictor — "What will be my rank if I add a keyword?"
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test any keyword term to analyze predicted initial position, search volume, difficulty, and estimated call traffic.
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          <input
            type="text"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunPrediction(predictionInput)}
            placeholder={`e.g. emergency ${activeLocation.category.toLowerCase()} ${activeLocation.city}`}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <button
            onClick={() => handleRunPrediction(predictionInput)}
            disabled={!predictionInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Analyze Impact</span>
          </button>
        </div>

        {predictionResult && (
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-indigo-950 dark:text-indigo-200 text-sm">
                Prediction for "{predictionResult.term}"
              </span>
              <button
                onClick={() => handleAddKeyword(predictionResult.term)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Track This Keyword Now</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Predicted Initial Rank</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">#{predictionResult.predictedInitialRank}</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Potential</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">#{predictionResult.potentialRank}</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Keyword Difficulty</span>
                <span className="text-xl font-black text-amber-500">{predictionResult.difficulty}%</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Traffic Impact</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-1 block">{predictionResult.estimatedTrafficImpact}</span>
              </div>
            </div>

            <p className="text-indigo-900 dark:text-indigo-300 font-semibold text-[11px] leading-relaxed pt-1">
              💡 <span className="font-bold">AI Optimization Advice:</span> {predictionResult.aiAdvice}
            </p>
          </div>
        )}
      </div>

      {/* 💡 Section 3: Recommended Keywords Catalog tailored to Business & Location */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
            <Target className="w-5 h-5 mr-2 text-emerald-500" />
            Suggested Business & Location Keywords ({suggestions.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tailored specifically for <span className="font-bold">{activeLocation.category}</span> businesses in <span className="font-bold">{activeLocation.city}</span> to boost local search visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {suggestions.map((sugg, idx) => {
            const isTracked = keywords.some((k) => k.term.toLowerCase() === sugg.term.toLowerCase());
            return (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300 uppercase">
                      {sugg.categoryType}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Est. Initial: #{sugg.predictedInitialRank}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mt-2">{sugg.term}</h4>

                  <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-500 mt-1">
                    <span>Vol: {sugg.estimatedVolume}/mo</span>
                    <span>•</span>
                    <span>KD: {sugg.difficulty}%</span>
                  </div>
                </div>

                <button
                  onClick={() => !isTracked && handleAddKeyword(sugg.term)}
                  disabled={isTracked}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                    isTracked
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  {isTracked ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Already Tracked</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Track Keyword</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📌 Section 4: Currently Tracked Search Terms Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
            Active Tracked Search Terms ({keywords.length})
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            Provider: <span className="text-brand-600 font-bold">Search Ranking API Engine (Local Pack)</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Keyword Term</th>
                <th className="py-3 px-4">Target Location</th>
                <th className="py-3 px-4">Map Pack Rank</th>
                <th className="py-3 px-4">Rank Trend</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {keywords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No keywords tracked for this location. Select a suggested keyword above or click "Add Keyword".
                  </td>
                </tr>
              ) : (
                keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center">
                      <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                      {kw.term}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {kw.city} {kw.zip ? `(${kw.zip})` : ''}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded font-bold ${
                          (kw.latestRank || 99) <= 3
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : (kw.latestRank || 99) <= 10
                            ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        #{kw.latestRank || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {kw.rankChange && kw.rankChange > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                          <ArrowUpRight className="w-4 h-4 mr-0.5" />
                          +{kw.rankChange}
                        </span>
                      ) : kw.rankChange && kw.rankChange < 0 ? (
                        <span className="text-red-500 font-bold flex items-center">
                          <ArrowDownRight className="w-4 h-4 mr-0.5" />
                          {kw.rankChange}
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center font-medium">
                          <Minus className="w-4 h-4 mr-0.5" /> No change
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active Tracking
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Keyword Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Add Target Keyword
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddKeyword(term, city, zip);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Search Term *
                </label>
                <input
                  type="text"
                  required
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder={`e.g. emergency ${activeLocation.category.toLowerCase()} ${activeLocation.city}`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={activeLocation.city}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder={activeLocation.zip}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm shadow-brand-600/20"
                >
                  Track Keyword
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
