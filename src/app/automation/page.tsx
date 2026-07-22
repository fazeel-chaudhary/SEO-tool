'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { Zap, Play, CheckCircle2, Building2, ToggleLeft, ToggleRight, Database, ShieldAlert, Cpu, Chrome, CreditCard, Facebook, Compass, HelpCircle, Activity } from 'lucide-react';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  lastRun: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface IntegrationConnector {
  name: string;
  category: 'Search & Maps' | 'Social & Reviews' | 'AI & CRM' | 'Payment';
  status: 'CONNECTED' | 'DISCONNECTED';
  lastSync?: string;
}

export default function AutomationPage() {
  const { activeLocation } = useOrg();
  const [runningId, setRunningId] = useState<string | null>(null);

  // 8 Target Back-End Automations
  const [automations, setAutomations] = useState<AutomationWorkflow[]>([
    { id: 'auto-1', name: 'Scheduled Site Audits', description: 'Crawl landing pages for heading status, schema validations, and link health.', frequency: 'WEEKLY', lastRun: '2026-07-22T08:00:00Z', status: 'ACTIVE' },
    { id: 'auto-2', name: 'Citation Consistency Monitoring', description: 'Audit directory profile lists for NAP conflicts or duplicate listings.', frequency: 'DAILY', lastRun: '2026-07-23T01:00:00Z', status: 'ACTIVE' },
    { id: 'auto-3', name: 'AI Review Replies Broadcast', description: 'Automatically publish AI-generated replies to new positive reviews.', frequency: 'HOURLY', lastRun: '2026-07-23T02:00:00Z', status: 'INACTIVE' },
    { id: 'auto-4', name: 'Keyword Tracking Rank Checks', description: 'Query SerpApi local pack coordinates positions and log volatility index.', frequency: 'DAILY', lastRun: '2026-07-23T00:00:00Z', status: 'ACTIVE' },
    { id: 'auto-5', name: 'Competitor Change Monitoring', description: 'Scan rival search visibility shifts and review volume speed updates.', frequency: 'WEEKLY', lastRun: '2026-07-20T12:00:00Z', status: 'INACTIVE' },
    { id: 'auto-6', name: 'GBP Posting Campaign Scheduler', description: 'Automatically schedule promotional discount posts on active profiles.', frequency: 'WEEKLY', lastRun: '2026-07-21T09:00:00Z', status: 'ACTIVE' },
    { id: 'auto-7', name: 'Reports Compilation & Export', description: 'Generate white-label PDF/CSV dashboards and email to client lists.', frequency: 'MONTHLY', lastRun: '2026-07-01T00:00:00Z', status: 'ACTIVE' },
    { id: 'auto-8', name: 'Alerts & GBP Suspension Notifications', description: 'Send high-priority warnings via SMTP/Slack if profile health drops.', frequency: 'HOURLY', lastRun: '2026-07-23T02:15:00Z', status: 'ACTIVE' },
  ]);

  // 13 Integration Connectors
  const [integrations, setIntegrations] = useState<IntegrationConnector[]>([
    { name: 'Google Business Profile', category: 'Search & Maps', status: 'CONNECTED', lastSync: '10 mins ago' },
    { name: 'Google Analytics', category: 'Search & Maps', status: 'CONNECTED', lastSync: '1 hour ago' },
    { name: 'Google Search Console', category: 'Search & Maps', status: 'CONNECTED', lastSync: '1 hour ago' },
    { name: 'Google Maps API', category: 'Search & Maps', status: 'CONNECTED', lastSync: 'Live' },
    { name: 'Bing Places', category: 'Search & Maps', status: 'DISCONNECTED' },
    { name: 'Apple Business Connect', category: 'Search & Maps', status: 'CONNECTED', lastSync: '1 day ago' },
    { name: 'Facebook Graph API', category: 'Social & Reviews', status: 'CONNECTED', lastSync: '2 hours ago' },
    { name: 'Yelp Fusion API', category: 'Social & Reviews', status: 'CONNECTED', lastSync: '5 mins ago' },
    { name: 'Trustpilot API', category: 'Social & Reviews', status: 'DISCONNECTED' },
    { name: 'Stripe Billing Connect', category: 'Payment', status: 'CONNECTED', lastSync: 'Real-time' },
    { name: 'OpenAI (GPT-4o)', category: 'AI & CRM', status: 'CONNECTED', lastSync: 'Live' },
    { name: 'Gemini 1.5 Pro', category: 'AI & CRM', status: 'CONNECTED', lastSync: 'Live' },
    { name: 'HubSpot / Salesforce CRM', category: 'AI & CRM', status: 'DISCONNECTED' },
  ]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to manage automated workflows & integrations.</p>
      </div>
    );
  }

  const handleToggleWorkflow = (id: string) => {
    setAutomations(
      automations.map((a) =>
        a.id === id ? { ...a, status: a.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : a
      )
    );
  };

  const handleRunNow = (id: string, name: string) => {
    setRunningId(id);
    setTimeout(() => {
      setRunningId(null);
      // Update last run time to now
      setAutomations(
        automations.map((a) =>
          a.id === id ? { ...a, lastRun: new Date().toISOString() } : a
        )
      );
      alert(`Workflow "${name}" executed successfully! Clean cache, generated assets and triggered sync webhooks.`);
    }, 1000);
  };

  const handleToggleIntegration = (name: string) => {
    setIntegrations(
      integrations.map((i) =>
        i.name === name
          ? {
              ...i,
              status: i.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED',
              lastSync: i.status === 'DISCONNECTED' ? 'Just connected' : undefined,
            }
          : i
      )
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <Zap className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400 fill-brand-600/20" />
          Automation & Integrations Control Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Connect external platforms and automate repetitive local SEO audits, replies, posts, and reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Column: Automations list */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between font-bold text-xs text-slate-700 dark:text-slate-350">
            <span>Automated Workflows & Triggers ({automations.length})</span>
            <span className="text-[10px] text-brand-600 uppercase">Background Cron System</span>
          </div>

          <div className="space-y-3.5">
            {automations.map((rule) => (
              <div
                key={rule.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center">
                      <Activity className="w-4 h-4 mr-1.5 text-brand-600 shrink-0" />
                      {rule.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rule.description}</p>
                  </div>

                  <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider rounded shrink-0">
                    {rule.frequency}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold text-[10px]">
                    Last Run: {new Date(rule.lastRun).toLocaleString()}
                  </span>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRunNow(rule.id, rule.name)}
                      disabled={runningId === rule.id}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1"
                    >
                      <Play className={`w-3 h-3 ${runningId === rule.id ? 'animate-spin' : ''}`} />
                      <span>{runningId === rule.id ? 'Running...' : 'Run Now'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleWorkflow(rule.id)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-colors focus:outline-none"
                    >
                      {rule.status === 'ACTIVE' ? (
                        <ToggleRight className="w-7 h-7 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Connectors list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between font-bold text-xs text-slate-700 dark:text-slate-355">
            <span>Integrations & Connectors ({integrations.length})</span>
            <span className="text-[10px] text-indigo-500 uppercase">External Sync</span>
          </div>

          <div className="space-y-2.5">
            {integrations.map((conn) => (
              <div
                key={conn.name}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">{conn.name}</h4>
                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] font-semibold text-slate-400">
                    <span>{conn.category}</span>
                    {conn.lastSync && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">Sync: {conn.lastSync}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleIntegration(conn.name)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] ${
                    conn.status === 'CONNECTED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 hover:border-red-200/50'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/10'
                  }`}
                >
                  {conn.status === 'CONNECTED' ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
