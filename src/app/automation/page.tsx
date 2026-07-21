'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { AutomationService } from '@/services/automation-service';
import { AutomationRule } from '@/lib/types';
import { Zap, Play, Clock, CheckCircle2, Building2 } from 'lucide-react';

export default function AutomationPage() {
  const { activeLocation, refreshState } = useOrg();
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);

  useEffect(() => {
    if (activeLocation) {
      setAutomations(AppStore.getAutomations(activeLocation.id));
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to manage automated background workflows.</p>
      </div>
    );
  }

  const handleToggle = (id: string) => {
    AppStore.toggleAutomation(id);
    refreshState();
    setAutomations(AppStore.getAutomations(activeLocation.id));
  };

  const handleRunNow = (rule: AutomationRule) => {
    setRunningId(rule.id);
    AutomationService.runAutomation(rule.id, activeLocation);
    refreshState();
    setTimeout(() => setRunningId(null), 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <Zap className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400 fill-brand-600/20" />
          Automated Local SEO Workflows
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Scheduled background audits, AI review reply drafting, & competitor change monitoring for{' '}
          <span className="font-bold">{activeLocation.name}</span>
        </p>
      </div>

      <div className="space-y-4">
        {automations.map((rule) => (
          <div
            key={rule.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{rule.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 uppercase">
                  {rule.frequency}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{rule.description}</p>
              <span className="text-[11px] text-slate-400 font-medium block">
                Last executed: {new Date(rule.lastRun).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center space-x-3 self-start md:self-auto">
              <button
                onClick={() => handleRunNow(rule)}
                disabled={runningId === rule.id}
                className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Play className={`w-3.5 h-3.5 ${runningId === rule.id ? 'animate-spin' : ''}`} />
                <span>{runningId === rule.id ? 'Running...' : 'Run Workflow Now'}</span>
              </button>

              <button
                onClick={() => handleToggle(rule.id)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${
                  rule.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    rule.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
