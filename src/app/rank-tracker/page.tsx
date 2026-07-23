'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { RankTrackerService } from '@/services/rank-tracker';
import { Keyword, RankingSnapshot } from '@/lib/types';
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
} from 'lucide-react';

export default function RankTrackerPage() {
  const { activeLocation, refreshState } = useOrg();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add Keyword Form
  const [term, setTerm] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    if (activeLocation) {
      const kws = AppStore.getKeywords(activeLocation.id);
      setKeywords(kws);
      setCity(activeLocation.city);
      setZip(activeLocation.zip);
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

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;

    const newKw: Keyword = {
      id: `kw-${Date.now()}`,
      term: term.trim(),
      city: city || activeLocation.city,
      zip: zip || activeLocation.zip,
      locationId: activeLocation.id,
      latestRank: Math.floor(Math.random() * 5) + 1, // Trigger initial rank check
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <TrendingUp className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Keyword Rank Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking Google Maps & Local Pack position for <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshRankings}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            id="refresh-ranks-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Google Maps...' : 'Check All Rankings'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95"
            id="add-keyword-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Keyword</span>
          </button>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Tracked Search Terms ({keywords.length})
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
                    No keywords tracked for this location. Click "Add Keyword" to start tracking.
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

            <form onSubmit={handleAddKeyword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Search Term *
                </label>
                <input
                  type="text"
                  required
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. emergency dentist austin"
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
                    placeholder="Austin"
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
                    placeholder="78701"
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
