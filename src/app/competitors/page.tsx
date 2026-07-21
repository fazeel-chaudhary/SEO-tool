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
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function CompetitorsPage() {
  const { activeLocation, refreshState } = useOrg();
  const [competitors, setCompetitors] = useState<CompetitorMetric[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add Competitor form state
  const [compName, setCompName] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compRating, setCompRating] = useState('4.8');
  const [compReviews, setCompReviews] = useState('210');

  useEffect(() => {
    if (activeLocation) {
      const comps = AppStore.getCompetitors(activeLocation.id);
      setCompetitors(comps);
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

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    const newComp: CompetitorMetric = {
      id: `comp-${Date.now()}`,
      name: compName.trim(),
      address: compAddress.trim() || `${activeLocation.city}, TX`,
      category: activeLocation.category,
      rating: parseFloat(compRating) || 4.8,
      reviewCount: parseInt(compReviews, 10) || 150,
      photoCount: 35,
      postFrequencyPerMonth: 3,
      shareOfLocalVoice: 62,
      locationId: activeLocation.id,
      createdAt: new Date().toISOString(),
    };

    AppStore.saveCompetitor(newComp);
    setCompetitors(AppStore.getCompetitors(activeLocation.id));
    refreshState();
    setShowAddModal(false);
    setCompName('');
  };

  const aiSummary = CompetitorService.generateAiCompetitiveSummary(activeLocation, competitors);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Users className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Competitive Intelligence Benchmark
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparing local GBP listings & ranking factors against{' '}
            <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="add-competitor-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Track Competitor GBP</span>
        </button>
      </div>

      {/* AI Competitive Analysis Box */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-3">
        <h3 className="font-extrabold text-lg flex items-center text-brand-400">
          <Zap className="w-5 h-5 mr-2 text-brand-400" />
          AI Ranking Factor Summary
        </h3>
        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{aiSummary}</p>
      </div>

      {/* Side-by-Side Benchmark Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
          Side-by-Side Metric Comparison Matrix
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Business Listing</th>
                <th className="py-3.5 px-4">Rating & Reviews</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Photo Count</th>
                <th className="py-3.5 px-4">Post Frequency</th>
                <th className="py-3.5 px-4 text-right">Share of Voice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Active Location Row */}
              <tr className="bg-brand-50/50 dark:bg-brand-950/40 font-bold">
                <td className="py-3.5 px-4 text-brand-700 dark:text-brand-300 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-brand-600" />
                  {activeLocation.name} (Your Location)
                </td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white">
                  4.8★ (128 reviews)
                </td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{activeLocation.category}</td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white">{activeLocation.gbpPhotoCount} photos</td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white">{activeLocation.gbpPostCount} posts/mo</td>
                <td className="py-3.5 px-4 text-right font-black text-brand-600 dark:text-brand-400">
                  68% SoLV
                </td>
              </tr>

              {/* Competitors Rows */}
              {competitors.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{comp.name}</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 flex items-center">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                    {comp.rating}★ ({comp.reviewCount} reviews)
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{comp.category}</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{comp.photoCount} photos</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {comp.postFrequencyPerMonth} posts/mo
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                    {comp.shareOfLocalVoice}% SoLV
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Track Competitor Listing
            </h2>

            <form onSubmit={handleAddCompetitor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Competitor Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Austin Central Dentistry"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={compAddress}
                  onChange={(e) => setCompAddress(e.target.value)}
                  placeholder="600 Congress Ave, Austin, TX 78701"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="text"
                    value={compRating}
                    onChange={(e) => setCompRating(e.target.value)}
                    placeholder="4.8"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Review Count
                  </label>
                  <input
                    type="text"
                    value={compReviews}
                    onChange={(e) => setCompReviews(e.target.value)}
                    placeholder="210"
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
                  Track Competitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
