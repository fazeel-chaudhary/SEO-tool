'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { AiContentService } from '@/services/ai-content-service';
import { Copy, Check, FileText, Send, HelpCircle, Building2, Zap } from 'lucide-react';

export default function ContentToolsPage() {
  const { activeLocation } = useOrg();
  const [activeTab, setActiveTab] = useState<'LOCATION_PAGE' | 'GBP_POST' | 'FAQS'>('LOCATION_PAGE');
  const [copied, setCopied] = useState<boolean>(false);

  // Form State
  const [offerTopic, setOfferTopic] = useState<string>('Teeth Whitening Special Offer');

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to generate context-injected AI content.</p>
      </div>
    );
  }

  const locationCopy = AiContentService.generateLocationPageCopy(activeLocation);
  const gbpPost = AiContentService.generateGbpPost(activeLocation, offerTopic);
  const faqs = AiContentService.generateLocalFaqs(activeLocation);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <Zap className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
          AI Local Content Generator Studio
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Context-injected content generation for <span className="font-bold">{activeLocation.name}</span> in{' '}
          <span className="font-bold">{activeLocation.city}, {activeLocation.state}</span>
        </p>
      </div>

      {/* Content Tools Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('LOCATION_PAGE')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'LOCATION_PAGE'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Location Landing Page Copy</span>
        </button>

        <button
          onClick={() => setActiveTab('GBP_POST')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'GBP_POST'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Google Business Post</span>
        </button>

        <button
          onClick={() => setActiveTab('FAQS')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'FAQS'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Local Q&A FAQs</span>
        </button>
      </div>

      {/* Tab 1: Location Page Copy */}
      {activeTab === 'LOCATION_PAGE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Generated Location Page Copy (Markdown)
            </h3>
            <button
              onClick={() => handleCopy(locationCopy)}
              className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Copy'}</span>
            </button>
          </div>

          <textarea
            readOnly
            rows={14}
            value={locationCopy}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none"
          />
        </div>
      )}

      {/* Tab 2: GBP Post Generator */}
      {activeTab === 'GBP_POST' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="space-y-2 text-xs">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Post Topic / Promotion Offer
            </label>
            <input
              type="text"
              value={offerTopic}
              onChange={(e) => setOfferTopic(e.target.value)}
              placeholder="e.g. Free Consultation for New Patients"
              className="w-full max-w-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              {gbpPost.headline}
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300">{gbpPost.body}</p>

            <div className="pt-2 flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm">
                CTA: {gbpPost.callToAction}
              </span>
              <button
                onClick={() => handleCopy(`${gbpPost.headline}\n\n${gbpPost.body}`)}
                className="flex items-center space-x-1 text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Post Text</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Local Q&A FAQs */}
      {activeTab === 'FAQS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Generated Local FAQ Q&A Set
          </h3>

          <div className="space-y-3 text-xs">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Q: {faq.question}
                </div>
                <p className="text-slate-600 dark:text-slate-300">A: {faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
