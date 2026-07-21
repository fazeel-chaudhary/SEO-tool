'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { ReviewCampaign } from '@/lib/types';
import { Send, Plus, MessageSquare, Mail, Smartphone, CheckCircle2, Building2 } from 'lucide-react';

export default function ReviewCampaignsPage() {
  const { activeLocation } = useOrg();
  const [campaigns, setCampaigns] = useState<ReviewCampaign[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [campName, setCampName] = useState('');
  const [campType, setCampType] = useState<'SMS' | 'EMAIL'>('SMS');

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
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <MessageSquare className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Review Request Campaign Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated SMS & Email review request funnels for{' '}
            <span className="font-bold">{activeLocation.name}</span> (Competing with Whitespark)
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

      {/* Modal */}
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
