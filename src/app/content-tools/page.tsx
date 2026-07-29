'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { AiContentService } from '@/services/ai-content-service';
import { Copy, Check, FileText, Send, HelpCircle, Building2, Search, Layers, TrendingUp, DollarSign, Award, BookOpen, AlertTriangle } from 'lucide-react';

export default function ContentToolsPage() {
  const { activeLocation } = useOrg();
  const [activeTab, setActiveTab] = useState<'KEYWORDS' | 'CONTENT'>('KEYWORDS');
  const [activeContentSubTab, setActiveContentSubTab] = useState<'LOCATION' | 'SERVICE' | 'GBP' | 'FAQ' | 'REVIEWS' | 'LANDING' | 'SCHEMA' | 'PRESS'>('LOCATION');
  const [copied, setCopied] = useState<boolean>(false);

  // Form States
  const [offerTopic, setOfferTopic] = useState<string>('Teeth Whitening Special Offer');
  const [serviceName, setServiceName] = useState<string>('Cosmetic Veneers');
  const [pressReleaseTopic, setPressReleaseTopic] = useState<string>('New State-of-the-Art 3D Dental Scanning technology');

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to access Keyword Discovery and AI Content Studio.</p>
      </div>
    );
  }

  // AI Content Generator logic
  const locationCopy = AiContentService.generateLocationPageCopy(activeLocation);
  const gbpPost = AiContentService.generateGbpPost(activeLocation, offerTopic);
  const faqs = AiContentService.generateLocalFaqs(activeLocation);

  const serviceCopy = `# Premium ${serviceName} in ${activeLocation.city}, ${activeLocation.state}
Looking for professional ${serviceName.toLowerCase()} in ${activeLocation.city}? at ${activeLocation.name}, we provide customized treatment plans. Call us at ${activeLocation.phone} to consult our specialists today.`;

  const reviewsCopy = `Dear Valued Customer, thank you for choosing ${activeLocation.name} in ${activeLocation.city}! We appreciate your rating and look forward to serving your family again.`;

  const landingCopy = `<!DOCTYPE html>
<html>
<head>
  <title>${activeLocation.name} | ${activeLocation.category} in ${activeLocation.city}</title>
</head>
<body>
  <h1>${activeLocation.name} serves ${activeLocation.city}</h1>
</body>
</html>`;

  const schemaJson = `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${activeLocation.name}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "${activeLocation.address}",
    "addressLocality": "${activeLocation.city}",
    "addressRegion": "${activeLocation.state}",
    "postalCode": "${activeLocation.zip}"
  },
  "telephone": "${activeLocation.phone}"
}`;

  const pressReleaseCopy = `FOR IMMEDIATE RELEASE\n\n${activeLocation.name} Announces ${pressReleaseTopic} in ${activeLocation.city}, ${activeLocation.state}.\n\nAustin, TX — ${activeLocation.name} is proud to announce ${pressReleaseTopic.toLowerCase()} to better serve the local ${activeLocation.city} community.`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock Keyword Data with categories
  const keywordRegistry = [
    { term: `${activeLocation.category.toLowerCase()} ${activeLocation.city.toLowerCase()}`, type: 'City Keyword', vol: 2400, cpc: 5.20, kd: 35, trend: 'STABLE' },
    { term: `best ${activeLocation.category.toLowerCase()} downtown ${activeLocation.city.toLowerCase()}`, type: 'Neighborhood Keyword', vol: 480, cpc: 6.10, kd: 22, trend: 'UP' },
    { term: `${activeLocation.category.toLowerCase()} near me`, type: 'Near Me Keyword', vol: 18500, cpc: 4.50, kd: 48, trend: 'SPIKE' },
    { term: `where is the closest ${activeLocation.category.toLowerCase()} open now`, type: 'Voice Search', vol: 320, cpc: 3.80, kd: 18, trend: 'UP' },
    { term: `how much does ${activeLocation.category.toLowerCase()} cost in ${activeLocation.city.toLowerCase()}`, type: 'Questions', vol: 720, cpc: 2.90, kd: 15, trend: 'STABLE' },
    { term: `summer ${activeLocation.category.toLowerCase()} specials ${activeLocation.city.toLowerCase()}`, type: 'Seasonal Trends', vol: 900, cpc: 3.40, kd: 12, trend: 'HIGH SUMMER' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <FileText className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Keyword Discovery & AI Content Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze local search intents and generate customized content for <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>
      </div>

      {/* Main Studio Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('KEYWORDS')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'KEYWORDS'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Keyword Discovery & Research</span>
        </button>

        <button
          onClick={() => setActiveTab('CONTENT')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'CONTENT'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Content Generator Studio</span>
        </button>
      </div>

      {/* TAB 1: KEYWORDS DISCOVERY */}
      {activeTab === 'KEYWORDS' && (
        <div className="space-y-6">
          {/* Keyword Metrics Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
              Discovered Target Local Intent Keywords
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Search Term</th>
                    <th className="py-3.5 px-4">Intent Type</th>
                    <th className="py-3.5 px-4">Vol</th>
                    <th className="py-3.5 px-4">CPC</th>
                    <th className="py-3.5 px-4">KD %</th>
                    <th className="py-3.5 px-4 text-right">Seasonal Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {keywordRegistry.map((kw, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{kw.term}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">{kw.type}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{kw.vol}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">${kw.cpc.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-bold">{kw.kd}%</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                          {kw.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Keyword Clustering */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
                <Layers className="w-5 h-5 mr-2 text-brand-500" />
                AI Keyword Clustering (Semantic Groups)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white">Cluster 1: Transactional / Near Me Intent</span>
                  <p className="text-slate-500 font-medium">Keywords: "{activeLocation.category.toLowerCase()} near me", "emergency {activeLocation.category.toLowerCase()} austin"</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white">Cluster 2: Informational / Conversational Questions</span>
                  <p className="text-slate-500 font-medium">Keywords: "how much does {activeLocation.category.toLowerCase()} cost", "where is closest dental clinic open now"</p>
                </div>
              </div>
            </div>

            {/* SERP Competitor Analysis */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                SERP Market Share Analysis
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Yelp Local Directory</span>
                  <span className="text-slate-900 dark:text-white font-bold">24% SERP Share</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Healthgrades Listings</span>
                  <span className="text-slate-900 dark:text-white font-bold">18% SERP Share</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Organic Website Packs</span>
                  <span className="text-slate-900 dark:text-white font-bold">42% SERP Share</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI CONTENT GENERATOR STUDIO */}
      {activeTab === 'CONTENT' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Content Submenu */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col space-y-1 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2">Generator Tools</span>
            <button
              onClick={() => setActiveContentSubTab('LOCATION')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-all ${
                activeContentSubTab === 'LOCATION' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-650' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Location Pages
            </button>
            <button
              onClick={() => setActiveContentSubTab('SERVICE')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-all ${
                activeContentSubTab === 'SERVICE' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-650' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Service Pages
            </button>
            <button
              onClick={() => setActiveContentSubTab('GBP')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-all ${
                activeContentSubTab === 'GBP' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-650' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              GBP Posts
            </button>
            <button
              onClick={() => setActiveContentSubTab('FAQ')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-all ${
                activeContentSubTab === 'FAQ' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-650' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              FAQs list
            </button>
            <button
              onClick={() => setActiveContentSubTab('REVIEWS')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-all ${
                activeContentSubTab === 'REVIEWS' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-650' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Review Responses
            </button>
            <button
              onClick={() => setActiveContentSubTab('LANDING')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-all ${
                activeContentSubTab === 'LANDING' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-650' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Landing Pages
            </button>
            <button
              onClick={() => setActiveContentSubTab('SCHEMA')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-all ${
                activeContentSubTab === 'SCHEMA' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-650' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Local JSON Schema
            </button>
            <button
              onClick={() => setActiveContentSubTab('PRESS')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold transition-all ${
                activeContentSubTab === 'PRESS' ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-650' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Press Releases
            </button>
          </div>

          {/* Generator Preview Panel */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            {/* Context Forms */}
            {activeContentSubTab === 'SERVICE' && (
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Target Service Name</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full max-w-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {activeContentSubTab === 'GBP' && (
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300">GBP Offer Topic</label>
                <input
                  type="text"
                  value={offerTopic}
                  onChange={(e) => setOfferTopic(e.target.value)}
                  className="w-full max-w-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {activeContentSubTab === 'PRESS' && (
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300">News Announcement Topic</label>
                <input
                  type="text"
                  value={pressReleaseTopic}
                  onChange={(e) => setPressReleaseTopic(e.target.value)}
                  className="w-full max-w-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Generated Copy Render */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Sandbox Copy Output</span>
                <button
                  onClick={() => {
                    const text =
                      activeContentSubTab === 'LOCATION' ? locationCopy :
                      activeContentSubTab === 'SERVICE' ? serviceCopy :
                      activeContentSubTab === 'GBP' ? `${gbpPost.headline}\n\n${gbpPost.body}` :
                      activeContentSubTab === 'FAQ' ? JSON.stringify(faqs, null, 2) :
                      activeContentSubTab === 'REVIEWS' ? reviewsCopy :
                      activeContentSubTab === 'LANDING' ? landingCopy :
                      activeContentSubTab === 'SCHEMA' ? schemaJson : pressReleaseCopy;
                    handleCopy(text);
                  }}
                  className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Output!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={12}
                value={
                  activeContentSubTab === 'LOCATION' ? locationCopy :
                  activeContentSubTab === 'SERVICE' ? serviceCopy :
                  activeContentSubTab === 'GBP' ? `${gbpPost.headline}\n\n${gbpPost.body}` :
                  activeContentSubTab === 'FAQ' ? JSON.stringify(faqs, null, 2) :
                  activeContentSubTab === 'REVIEWS' ? reviewsCopy :
                  activeContentSubTab === 'LANDING' ? landingCopy :
                  activeContentSubTab === 'SCHEMA' ? schemaJson : pressReleaseCopy
                }
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
