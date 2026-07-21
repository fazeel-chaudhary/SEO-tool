'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { ReviewService } from '@/services/review-service';
import { Review, Sentiment } from '@/lib/types';
import {
  MessageSquare,
  Star,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from 'lucide-react';

export default function ReviewsPage() {
  const { activeLocation, refreshState } = useOrg();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');
  const [filterSentiment, setFilterSentiment] = useState<string>('ALL');

  // AI Reply Modal state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [aiReplyDraft, setAiReplyDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (activeLocation) {
      const revAudit = ReviewService.runReviewAudit(activeLocation);
      setReviews(revAudit.reviews);
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to manage reviews & AI replies.</p>
      </div>
    );
  }

  const handleOpenReplyModal = (review: Review) => {
    setSelectedReview(review);
    setIsGenerating(true);
    // Trigger AI Reply draft generation
    setTimeout(() => {
      const draft = ReviewService.generateAiReply(review, activeLocation.name);
      setAiReplyDraft(draft);
      setIsGenerating(false);
    }, 400);
  };

  const handlePublishReply = () => {
    if (!selectedReview || !aiReplyDraft.trim()) return;
    AppStore.saveReviewReply(selectedReview.id, aiReplyDraft.trim());
    refreshState();
    const revAudit = ReviewService.runReviewAudit(activeLocation);
    setReviews(revAudit.reviews);
    setSelectedReview(null);
    setAiReplyDraft('');
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterPlatform !== 'ALL' && r.platform !== filterPlatform) return false;
    if (filterSentiment !== 'ALL' && r.sentiment !== filterSentiment) return false;
    return true;
  });

  const revAuditStats = ReviewService.runReviewAudit(activeLocation);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <MessageSquare className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Review Management & AI Replies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated reviews from Google Maps, Yelp & Facebook for{' '}
            <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>
      </div>

      {/* Review Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Average Rating
          </span>
          <div className="flex items-center space-x-2 mt-1">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {revAuditStats.averageRating}
            </div>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">From {reviews.length} total reviews</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Response Rate
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {revAuditStats.responseRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Google Maps Trust Signal</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pending Replies
          </span>
          <div className="text-3xl font-black text-amber-500 mt-1">
            {revAuditStats.unansweredCount}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Requires business action</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AI Sentiment
          </span>
          <div className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1 flex items-center">
            <Sparkles className="w-6 h-6 mr-1.5" />
            Positive
          </div>
          <span className="text-[11px] text-slate-500 font-medium">AI Sentiment Classification</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Platform:</span>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Platforms</option>
              <option value="Google Maps">Google Maps</option>
              <option value="Yelp">Yelp</option>
              <option value="Facebook">Facebook</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">Sentiment:</span>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>
          </div>
        </div>
      </div>

      {/* Review Cards Feed */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                  {rev.reviewerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {rev.reviewerName}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {rev.platform}
                    </span>
                    <span>•</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`}
                    />
                  ))}
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    rev.sentiment === 'POSITIVE'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : rev.sentiment === 'NEGATIVE'
                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {rev.sentiment}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rev.text}</p>

            {/* Published Reply or Reply Action */}
            {rev.replyStatus === 'REPLIED' && rev.replyText ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Published Business Reply
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{rev.replyText}</p>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleOpenReplyModal(rev)}
                  className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft AI Reply</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-brand-500" />
                AI Reply Assistant
              </h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Original review quote */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                {selectedReview.reviewerName} ({selectedReview.rating}★)
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">"{selectedReview.text}"</p>
            </div>

            {/* AI Draft editor */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Generated AI Reply Draft (Editable)
              </label>
              {isGenerating ? (
                <div className="p-8 text-center text-brand-600 font-semibold animate-pulse">
                  Gemini AI is crafting an empathetic, keyword-optimized response...
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={aiReplyDraft}
                  onChange={(e) => setAiReplyDraft(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishReply}
                disabled={isGenerating || !aiReplyDraft.trim()}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm shadow-brand-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Reply to {selectedReview.platform}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
