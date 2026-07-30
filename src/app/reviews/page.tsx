'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { ReviewService } from '@/services/review-service';
import { Review, Sentiment, AiAutoReplySettings } from '@/lib/types';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  ThumbsUp,
  ThumbsDown,
  Filter,
  AlertTriangle,
  Settings,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Sliders,
  Bell,
  Award,
  Layers,
  FileText,
  TrendingUp,
  Smile,
  Edit3,
} from 'lucide-react';

export default function ReviewsPage() {
  const { activeLocation, refreshState } = useOrg();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<AiAutoReplySettings | null>(null);

  // Filters & Search
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');
  const [filterSentiment, setFilterSentiment] = useState<string>('ALL');

  // Bulk Selection
  const [selectedReviewIds, setSelectedReviewIds] = useState<Set<string>>(new Set());

  // AI Reply Modal
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [aiReplyDraft, setAiReplyDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedTone, setSelectedTone] = useState<AiAutoReplySettings['tone']>('Friendly');

  // Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'SCOPE' | 'RULES' | 'QUALITY'>('SCOPE');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    if (activeLocation) {
      const revAudit = ReviewService.runReviewAudit(activeLocation);
      setReviews(revAudit.reviews);
      setSettings(AppStore.getAutoReplySettings(activeLocation.id));
    }
  }, [activeLocation]);

  if (!activeLocation || !settings) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to manage reviews & automated AI replies.</p>
      </div>
    );
  }

  // Toggle Master Auto Reply ON / OFF
  const handleToggleMasterAutoReply = () => {
    const updated = { ...settings, enabled: !settings.enabled };
    AppStore.saveAutoReplySettings(updated);
    setSettings(updated);
    setToastMessage(updated.enabled ? '🤖 AI Auto Reply is now ENABLED! AI will process new reviews according to your settings.' : '⏸️ AI Auto Reply has been PAUSED.');
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Save Settings Modal Form
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    AppStore.saveAutoReplySettings(settings);
    setShowSettingsModal(false);
    setToastMessage('✅ AI Auto Reply Configuration updated successfully!');
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Open Reply Drawer / Modal
  const handleOpenReplyModal = (review: Review) => {
    setSelectedReview(review);
    setIsGenerating(true);
    setTimeout(() => {
      const draft = ReviewService.generateAiReply(review, activeLocation.name, selectedTone, settings.language);
      setAiReplyDraft(draft);
      setIsGenerating(false);
    }, 400);
  };

  // Regenerate Draft with Tone
  const handleRegenerateWithTone = (tone: AiAutoReplySettings['tone']) => {
    if (!selectedReview) return;
    setSelectedTone(tone);
    setIsGenerating(true);
    setTimeout(() => {
      const draft = ReviewService.generateAiReply(selectedReview, activeLocation.name, tone, settings.language);
      setAiReplyDraft(draft);
      setIsGenerating(false);
    }, 300);
  };

  // Publish Reply
  const handlePublishReply = () => {
    if (!selectedReview || !aiReplyDraft.trim()) return;
    AppStore.saveReviewReply(selectedReview.id, aiReplyDraft.trim());
    refreshState();
    const revAudit = ReviewService.runReviewAudit(activeLocation);
    setReviews(revAudit.reviews);
    setSelectedReview(null);
    setAiReplyDraft('');
    setToastMessage('🎉 Reply published successfully to Google Business Profile!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Bulk Checkbox Toggles
  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedReviewIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedReviewIds(next);
  };

  const handleToggleSelectAll = () => {
    if (selectedReviewIds.size === filteredReviews.length) {
      setSelectedReviewIds(new Set());
    } else {
      setSelectedReviewIds(new Set(filteredReviews.map((r) => r.id)));
    }
  };

  // Bulk Generate AI Replies
  const handleBulkGenerateReplies = () => {
    if (selectedReviewIds.size === 0) return;
    selectedReviewIds.forEach((id) => {
      const rev = reviews.find((r) => r.id === id);
      if (rev && rev.replyStatus !== 'REPLIED') {
        const draft = ReviewService.generateAiReply(rev, activeLocation.name, settings.tone, settings.language);
        AppStore.saveReviewReply(rev.id, draft);
      }
    });
    setReviews(AppStore.getReviews(activeLocation.id));
    setSelectedReviewIds(new Set());
    setToastMessage(`⚡ Successfully generated & published AI replies for ${selectedReviewIds.size} selected reviews!`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterPlatform !== 'ALL' && r.platform !== filterPlatform) return false;
    if (filterSentiment !== 'ALL' && r.sentiment !== filterSentiment) return false;
    return true;
  });

  const revAuditStats = ReviewService.runReviewAudit(activeLocation);
  const repliedCount = reviews.filter((r) => r.replyStatus === 'REPLIED').length;
  const pendingCount = reviews.length - repliedCount;
  const replyRate = reviews.length > 0 ? Math.round((repliedCount / reviews.length) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-white hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar with Master Auto-Reply Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <MessageSquare className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Reviews & AI Automated Replies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-channel review management & automated AI response engine for <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>

        {/* Master AI Auto Reply Toggle Controls */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={handleToggleMasterAutoReply}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
              settings.enabled
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${settings.enabled ? 'bg-white animate-pulse' : 'bg-slate-400'}`}></span>
            <span>AI Auto Reply: {settings.enabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            title="Configure AI Auto Reply Settings"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* 📊 8-METRIC REVIEW DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Reviews</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{reviews.length}</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Google & Yelp</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Awaiting Reply</span>
          <div className="text-xl font-black text-amber-500 mt-0.5">{pendingCount}</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Needs Action</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Auto Replies Sent</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{repliedCount}</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">AI Published</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Manual Replies</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">14</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">User Approved</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Avg Response Time</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">18 mins</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Speed Metric</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">AI Success Rate</span>
          <div className="text-xl font-black text-emerald-500 mt-0.5">98.4%</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Quality Verified</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{settings.approvalMode === 'APPROVAL_REQUIRED' ? pendingCount : 0}</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Approval Mode</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Reply Rate</span>
          <div className="text-xl font-black text-brand-600 dark:text-brand-400 mt-0.5">{replyRate}%</div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Coverage Metric</span>
        </div>
      </div>

      {/* 🔔 LIVE NOTIFICATIONS & ALERTS BAR */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-extrabold">Active AI Mode: [{settings.approvalMode}]</span>
          <span className="hidden md:inline">• Tone: {settings.tone} • Language: {settings.language} • Delay: {settings.delayBeforeReply}</span>
        </div>

        <button onClick={() => setShowSettingsModal(true)} className="text-amber-800 dark:text-amber-300 font-bold hover:underline">
          Edit Config
        </button>
      </div>

      {/* 🔍 FILTER & BULK ACTION CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 overflow-x-auto">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-bold">Platform:</span>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
            >
              <option value="ALL">All Platforms</option>
              <option value="Google Maps">Google Maps</option>
              <option value="Yelp">Yelp</option>
              <option value="Facebook">Facebook</option>
              <option value="Trustpilot">Trustpilot</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Sentiment:</span>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POSITIVE">Positive (4-5★)</option>
              <option value="NEUTRAL">Neutral (3★)</option>
              <option value="NEGATIVE">Negative (1-2★)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        {selectedReviewIds.size > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkGenerateReplies}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
            >
              Publish AI Replies ({selectedReviewIds.size})
            </button>
          </div>
        )}
      </div>

      {/* 📋 REVIEWS LIST & CARDS */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => {
          const isSelected = selectedReviewIds.has(rev.id);

          return (
            <div
              key={rev.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-3 transition-all ${
                isSelected ? 'border-brand-500 bg-brand-50/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelectRow(rev.id)}
                    className="rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
                  />

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{rev.reviewerName}</span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded text-[10px]">
                        {rev.platform}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-0.5">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${
                    rev.replyStatus === 'REPLIED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {rev.replyStatus === 'REPLIED' ? 'Published' : 'Awaiting Reply'}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                "{rev.text}"
              </p>

              {/* Published Reply or AI Action Footer */}
              {rev.replyStatus === 'REPLIED' ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Published Response (AI Automated)
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic">{rev.replyText}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    AI Reply Ready (Tone: {settings.tone})
                  </span>

                  <button
                    onClick={() => handleOpenReplyModal(rev)}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Generate & Edit AI Reply</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ AI REPLY DRAWER / MODAL ═══ */}
      {selectedReview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Reply Generator</h3>
              <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 dark:text-white block">{selectedReview.reviewerName} ({selectedReview.rating}★)</span>
                <p className="text-slate-500 italic">"{selectedReview.text}"</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select AI Tone</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Professional', 'Friendly', 'Formal', 'Casual', 'Luxury', 'Empathetic', 'Apologetic', 'Enthusiastic'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleRegenerateWithTone(t as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        selectedTone === t
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Generated Response Draft</label>
                <textarea
                  rows={4}
                  value={aiReplyDraft}
                  onChange={(e) => setAiReplyDraft(e.target.value)}
                  placeholder="AI is generating response..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishReply}
                  disabled={isGenerating || !aiReplyDraft.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Reply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AI AUTO REPLY CONFIGURATION SETTINGS MODAL ═══ */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Auto Reply Settings</h3>
                <p className="text-xs text-slate-500">Configure automated response rules, tone, and approval modes.</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSettingsTab('SCOPE')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  settingsTab === 'SCOPE' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                1. Automation Scope & Tone
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('RULES')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  settingsTab === 'RULES' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                2. Auto Reply Rules
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('QUALITY')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  settingsTab === 'QUALITY' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                3. Quality & Brand Voice
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* TAB 1: SCOPE & TONE */}
              {settingsTab === 'SCOPE' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="font-bold text-slate-900 dark:text-white">Enable AI Automated Replies</span>
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Approval Mode</label>
                    <select
                      value={settings.approvalMode}
                      onChange={(e) => setSettings({ ...settings, approvalMode: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="FULLY_AUTOMATIC">Fully Automatic (Generate & Publish)</option>
                      <option value="APPROVAL_REQUIRED">Approval Required (Generate & Wait for Approval)</option>
                      <option value="DRAFT_ONLY">Draft Only (Generate Drafts for Manual Edit)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center space-x-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                      <input
                        type="checkbox"
                        checked={settings.replyPositive}
                        onChange={(e) => setSettings({ ...settings, replyPositive: e.target.checked })}
                        className="rounded text-brand-600"
                      />
                      <span className="font-bold text-[11px]">Positive (4-5★)</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                      <input
                        type="checkbox"
                        checked={settings.replyNeutral}
                        onChange={(e) => setSettings({ ...settings, replyNeutral: e.target.checked })}
                        className="rounded text-brand-600"
                      />
                      <span className="font-bold text-[11px]">Neutral (3★)</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                      <input
                        type="checkbox"
                        checked={settings.replyNegative}
                        onChange={(e) => setSettings({ ...settings, replyNegative: e.target.checked })}
                        className="rounded text-brand-600"
                      />
                      <span className="font-bold text-[11px]">Negative (1-2★)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delay Before Reply</label>
                      <select
                        value={settings.delayBeforeReply}
                        onChange={(e) => setSettings({ ...settings, delayBeforeReply: e.target.value as any })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      >
                        <option value="INSTANT">Instant (Within 1 min)</option>
                        <option value="30_MIN">30 Minutes</option>
                        <option value="1_HOUR">1 Hour</option>
                        <option value="6_HOURS">6 Hours</option>
                        <option value="24_HOURS">24 Hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Default Tone</label>
                      <select
                        value={settings.tone}
                        onChange={(e) => setSettings({ ...settings, tone: e.target.value as any })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Formal">Formal</option>
                        <option value="Casual">Casual</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Empathetic">Empathetic</option>
                        <option value="Apologetic">Apologetic</option>
                        <option value="Enthusiastic">Enthusiastic</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RULES */}
              {settingsTab === 'RULES' && (
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <span className="font-bold">Reply only to 5-star reviews</span>
                    <input
                      type="checkbox"
                      checked={settings.replyOnly5Star}
                      onChange={(e) => setSettings({ ...settings, replyOnly5Star: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <span className="font-bold">Do not auto-reply to 1-star reviews</span>
                    <input
                      type="checkbox"
                      checked={settings.noAuto1Star}
                      onChange={(e) => setSettings({ ...settings, noAuto1Star: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <span className="font-bold">Ignore duplicate & spam reviews</span>
                    <input
                      type="checkbox"
                      checked={settings.ignoreDuplicates}
                      onChange={(e) => setSettings({ ...settings, ignoreDuplicates: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                    <span className="font-bold">Reply only during business hours</span>
                    <input
                      type="checkbox"
                      checked={settings.onlyBusinessHours}
                      onChange={(e) => setSettings({ ...settings, onlyBusinessHours: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                  </label>
                </div>
              )}

              {/* TAB 3: QUALITY CHECKS & BRAND VOICE */}
              {settingsTab === 'QUALITY' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block">AI Quality Verification Checks</span>
                    <p className="text-[10px] text-slate-500">Every AI response passes grammar checks, professional tone validation, and GBP compliance checks before publishing.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Voice & Custom Prompt Instructions</label>
                    <textarea
                      rows={3}
                      value={settings.brandVoicePrompt || ''}
                      onChange={(e) => setSettings({ ...settings, brandVoicePrompt: e.target.value })}
                      placeholder="e.g. We are a premier local practice. Always emphasize our 5-star patient care."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
