'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { DeveloperApiService } from '@/services/developer-api-service';
import { ApiKey, WebhookEndpoint } from '@/lib/types';
import { Code2, Key, Webhook, Plus, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

export default function DeveloperPage() {
  const { activeOrg } = useOrg();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrg) {
      setApiKeys(AppStore.getApiKeys(activeOrg.id));
    }
  }, [activeOrg]);

  const handleGenerateKey = () => {
    if (!activeOrg) return;
    DeveloperApiService.generateApiKey('Production API Key', activeOrg.id);
    setApiKeys(AppStore.getApiKeys(activeOrg.id));
  };

  const handleCopyKey = (keyString: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKey(keyString);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Code2 className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Developer API & Webhooks Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            REST API credentials & webhook event listeners for <span className="font-bold">{activeOrg?.name}</span>
          </p>
        </div>

        <button
          onClick={handleGenerateKey}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="generate-api-key-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* API Key Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center">
          <Key className="w-4 h-4 mr-2 text-brand-500" />
          API Secret Keys
        </h3>

        <div className="space-y-3 text-xs">
          {apiKeys.map((k) => (
            <div
              key={k.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{k.name}</div>
                <div className="font-mono text-slate-500 text-[11px] mt-0.5">{k.key}</div>
              </div>

              <button
                onClick={() => handleCopyKey(k.key)}
                className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px]"
              >
                {copiedKey === k.key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === k.key ? 'Copied Key!' : 'Copy Key'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* REST API Endpoints Quick Reference */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center">
          <Terminal className="w-4 h-4 mr-2 text-emerald-400" />
          REST API Endpoints Reference
        </h3>

        <div className="space-y-3 text-xs font-mono">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                GET
              </span>
              <span className="text-slate-200">/api/v1/locations</span>
            </div>
            <span className="text-slate-500 text-[11px]">List all organization locations</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                GET
              </span>
              <span className="text-slate-200">/api/v1/rankings</span>
            </div>
            <span className="text-slate-500 text-[11px]">Fetch Local Pack rank snapshots</span>
          </div>
        </div>
      </div>
    </div>
  );
}
