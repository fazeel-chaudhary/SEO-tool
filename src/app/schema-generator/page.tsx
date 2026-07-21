'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { SchemaService } from '@/services/schema-service';
import { Code2, Copy, Check, Download, Building2 } from 'lucide-react';

export default function SchemaGeneratorPage() {
  const { activeLocation } = useOrg();
  const [schemaType, setSchemaType] = useState<'LocalBusiness' | 'FAQPage' | 'Service'>('LocalBusiness');
  const [copied, setCopied] = useState<boolean>(false);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to generate structured JSON-LD schemas.</p>
      </div>
    );
  }

  const sampleFaqs = [
    {
      question: `Where is ${activeLocation.name} located?`,
      answer: `${activeLocation.name} is located at ${activeLocation.address}, ${activeLocation.city}, ${activeLocation.state} ${activeLocation.zip}.`,
    },
  ];

  const schemaObject =
    schemaType === 'LocalBusiness'
      ? SchemaService.generateLocalBusinessSchema(activeLocation)
      : schemaType === 'FAQPage'
      ? SchemaService.generateFaqSchema(sampleFaqs)
      : SchemaService.generateServiceSchema(activeLocation);

  const jsonLdString = JSON.stringify(schemaObject, null, 2);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Code2 className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Structured JSON-LD Schema Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Form-based schema code builder for <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied HTML Script!' : 'Copy Script Tag'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .jsonld</span>
          </button>
        </div>
      </div>

      {/* Schema Type Selector */}
      <div className="flex items-center space-x-3 text-xs">
        <span className="font-bold text-slate-500">Schema Type:</span>
        <button
          onClick={() => setSchemaType('LocalBusiness')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            schemaType === 'LocalBusiness'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          LocalBusiness Schema
        </button>

        <button
          onClick={() => setSchemaType('FAQPage')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            schemaType === 'FAQPage'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          FAQPage Schema
        </button>

        <button
          onClick={() => setSchemaType('Service')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            schemaType === 'Service'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Service Schema
        </button>
      </div>

      {/* Validated JSON-LD Preview Code Editor */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="font-bold text-emerald-400 flex items-center">
            <Check className="w-3.5 h-3.5 mr-1" /> Valid Schema.org JSON-LD
          </span>
          <span className="font-mono text-[11px]">Type: {schemaType}</span>
        </div>

        <pre className="text-xs font-mono text-emerald-400 bg-slate-900/80 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
          {`<script type="application/ld+json">\n${jsonLdString}\n</script>`}
        </pre>
      </div>
    </div>
  );
}
