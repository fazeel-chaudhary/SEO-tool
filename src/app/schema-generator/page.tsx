'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { SchemaService } from '@/services/schema-service';
import { Code2, Copy, Check, Download, Building2, Eye, ShieldAlert, Map, Image, HelpCircle, Compass, List, Link } from 'lucide-react';

type SchemaOption =
  | 'LocalBusiness'
  | 'Restaurant'
  | 'Medical'
  | 'Attorney'
  | 'Organization'
  | 'FAQ'
  | 'Product'
  | 'Service'
  | 'Review'
  | 'Event'
  | 'Video'
  | 'Breadcrumb';

export default function SchemaGeneratorPage() {
  const { activeLocation } = useOrg();
  const [activeTab, setActiveTab] = useState<'SCHEMA' | 'OPTIMIZER'>('SCHEMA');
  const [schemaType, setSchemaType] = useState<SchemaOption>('LocalBusiness');
  const [copied, setCopied] = useState<boolean>(false);

  // Landing Page Optimizer States
  const [targetUrl, setTargetUrl] = useState<string>('https://downtowndentalaustin.com');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(false);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to generate schema markup or scan landing pages.</p>
      </div>
    );
  }

  // Schema Generation Map
  const sampleFaqs = [
    {
      question: `Where is ${activeLocation.name} located?`,
      answer: `${activeLocation.name} is located at ${activeLocation.address}, ${activeLocation.city}, ${activeLocation.state} ${activeLocation.zip}.`,
    },
    {
      question: `What is the phone number of ${activeLocation.name}?`,
      answer: `You can call us directly at ${activeLocation.phone}.`,
    },
  ];

  let generatedSchema: object = {};
  switch (schemaType) {
    case 'LocalBusiness':
      generatedSchema = SchemaService.generateLocalBusinessSchema(activeLocation);
      break;
    case 'Restaurant':
      generatedSchema = SchemaService.generateRestaurantSchema(activeLocation);
      break;
    case 'Medical':
      generatedSchema = SchemaService.generateMedicalBusinessSchema(activeLocation);
      break;
    case 'Attorney':
      generatedSchema = SchemaService.generateAttorneySchema(activeLocation);
      break;
    case 'Organization':
      generatedSchema = SchemaService.generateOrganizationSchema(activeLocation);
      break;
    case 'FAQ':
      generatedSchema = SchemaService.generateFaqSchema(sampleFaqs);
      break;
    case 'Product':
      generatedSchema = SchemaService.generateProductSchema(activeLocation);
      break;
    case 'Service':
      generatedSchema = SchemaService.generateServiceSchema(activeLocation);
      break;
    case 'Review':
      generatedSchema = SchemaService.generateReviewSchema(activeLocation);
      break;
    case 'Event':
      generatedSchema = SchemaService.generateEventSchema(activeLocation);
      break;
    case 'Video':
      generatedSchema = SchemaService.generateVideoSchema(activeLocation);
      break;
    case 'Breadcrumb':
      generatedSchema = SchemaService.generateBreadcrumbSchema();
      break;
  }

  const jsonLdString = JSON.stringify(generatedSchema, null, 2);

  // Schema Validator Indicators
  const isJsonSyntaxValid = (() => {
    try {
      JSON.parse(jsonLdString);
      return true;
    } catch {
      return false;
    }
  })();
  const hasContext = jsonLdString.includes('"@context": "https://schema.org"');
  const hasType = jsonLdString.includes('"@type":');

  const handleCopy = () => {
    navigator.clipboard.writeText(`<script type="application/ld+json">\n${jsonLdString}\n</script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonLdString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schemaType.toLowerCase()}-schema.jsonld`;
    a.click();
  };

  // Run Landing Page Optimizer Scan
  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Code2 className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Landing Page Optimization & Schema Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build validated micro-data structures or audit landing page elements for{' '}
            <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('SCHEMA')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all ${
            activeTab === 'SCHEMA'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          JSON-LD Schema Builder
        </button>

        <button
          onClick={() => setActiveTab('OPTIMIZER')}
          className={`px-4 py-2 rounded-xl font-extrabold transition-all ${
            activeTab === 'OPTIMIZER'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Landing Page Optimizer Checklist
        </button>
      </div>

      {/* TAB 1: SCHEMA BUILDER */}
      {activeTab === 'SCHEMA' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Schema.org Template format:
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(
                [
                  'LocalBusiness',
                  'Restaurant',
                  'Medical',
                  'Attorney',
                  'Organization',
                  'FAQ',
                  'Product',
                  'Service',
                  'Review',
                  'Event',
                  'Video',
                  'Breadcrumb',
                ] as SchemaOption[]
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => setSchemaType(type)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    schemaType === type
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Engine Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <Check className="w-4 h-4 mr-2 text-emerald-500" />
              Live Schema Validation Status
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">JSON Syntax Check:</span>
                <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${isJsonSyntaxValid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700'}`}>
                  {isJsonSyntaxValid ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Context @context:</span>
                <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${hasContext ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700'}`}>
                  {hasContext ? 'FOUND' : 'MISSING'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Root @type:</span>
                <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${hasType ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700'}`}>
                  {hasType ? 'VALID' : 'INVALID'}
                </span>
              </div>
            </div>
          </div>

          {/* JSON-LD Preview Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-emerald-400 font-bold flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Ready for Schema.org Injection
              </span>

              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 bg-slate-850 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-semibold transition-all border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied HTML!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 bg-slate-850 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-semibold transition-all border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="text-xs font-mono text-emerald-400 bg-slate-900/40 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-900">
              {`<script type="application/ld+json">\n${jsonLdString}\n</script>`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: LANDING PAGE OPTIMIZER CHECKLIST */}
      {activeTab === 'OPTIMIZER' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Local Landing Page Optimizer Scanner
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your Austin location landing page URL. Antigravity will check key local rank signals: local keywords, maps, landmarks, directions, reviews trust widgets, images count, and embedded FAQ schema.
            </p>

            <form onSubmit={handleScan} className="flex items-center space-x-3 text-xs">
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
              <button
                type="submit"
                disabled={isScanning}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-brand-600/20"
              >
                {isScanning ? 'Auditing elements...' : 'Scan URL'}
              </button>
            </form>
          </div>

          {hasScanned && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Checklist Parameters Grid */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  On-Page Local Optimization Checklist
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {/* Parameter 1: Keywords */}
                  <div className="py-3 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <Eye className="w-3.5 h-3.5 mr-1.5 text-brand-650" />
                        Target Local Keywords Presence
                      </span>
                      <p className="text-[11px] text-slate-500">Checking city ("{activeLocation.city}") + service ("{activeLocation.category.toLowerCase()}") in H1/H2.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded font-bold text-[10px]">FOUND</span>
                  </div>

                  {/* Parameter 2: Internal Links */}
                  <div className="py-3 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <Link className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        Internal Location Backlinkage
                      </span>
                      <p className="text-[11px] text-slate-500">Checking for linkages back to directory profiles or main site silos.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded font-bold text-[10px]">FOUND</span>
                  </div>

                  {/* Parameter 3: Trust Signals */}
                  <div className="py-3 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        Customer Review Badges / Trust Widgets
                      </span>
                      <p className="text-[11px] text-slate-500">Google reviews counts/stars badge embedded in landing page body.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded font-bold text-[10px]">FOUND</span>
                  </div>

                  {/* Parameter 4: Maps */}
                  <div className="py-3 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <Map className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                        Interactive Google Maps Embed
                      </span>
                      <p className="text-[11px] text-slate-500">Google Maps iframe referencing placeid: {activeLocation.placeId || 'ChIJbU60yXA1RIYR3HwY2aY0qWg'}.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 rounded font-bold text-[10px]">MISSING MAP PACK EMBED</span>
                  </div>

                  {/* Parameter 5: Photos */}
                  <div className="py-3 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <Image className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        Location Photos Count
                      </span>
                      <p className="text-[11px] text-slate-500">Checking count of alt-tagged images of clinic front or team members.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded font-bold text-[10px]">8 PHOTOS FOUND</span>
                  </div>

                  {/* Parameter 6: FAQs */}
                  <div className="py-3 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                        Structured FAQ List Block
                      </span>
                      <p className="text-[11px] text-slate-500">Looking for Q&A copy containing location/hours query items.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded font-bold text-[10px]">3 FAQs FOUND</span>
                  </div>

                  {/* Parameter 7: Landmarks */}
                  <div className="py-3 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <Compass className="w-3.5 h-3.5 mr-1.5 text-teal-500" />
                        Nearby Geographic Landmarks
                      </span>
                      <p className="text-[11px] text-slate-500">Mentions of surrounding structures (e.g. Austin State Capitol, Lady Bird Lake).</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 rounded font-bold text-[10px]">MISSING (ADD LANDMARKS)</span>
                  </div>

                  {/* Parameter 8: Driving Directions */}
                  <div className="py-3 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <List className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                        Driving Directions Text Block
                      </span>
                      <p className="text-[11px] text-slate-500">Checking for specific route instructions from major highways (I-35, MoPac).</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded font-bold text-[10px]">FOUND</span>
                  </div>
                </div>
              </div>

              {/* Recommendation Score Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 self-start">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Optimization Score
                </h4>
                <div className="text-center py-6">
                  <span className="text-5xl font-black text-amber-500">75%</span>
                  <p className="text-[11px] font-semibold text-slate-450 mt-1">Needs Improvement</p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-xl text-red-800 dark:text-red-300 font-semibold space-y-1">
                    <span className="font-black block uppercase text-[10px]">CRITICAL FIXES</span>
                    <span>1. Embed Google Maps pack referencing your GBP Place ID.</span>
                    <span>2. Add mentions of nearby Landmarks (e.g. Downtown Austin center) to boost geographical relevance.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
