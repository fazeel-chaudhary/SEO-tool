'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { DuplicateListing } from '@/lib/types';
import { ShieldAlert, CheckCircle2, AlertTriangle, Trash2, Building2 } from 'lucide-react';

export default function DuplicateSuppressorPage() {
  const { activeLocation, refreshState } = useOrg();
  const [duplicates, setDuplicates] = useState<DuplicateListing[]>([]);

  useEffect(() => {
    if (activeLocation) {
      setDuplicates(AppStore.getDuplicateListings(activeLocation.id));
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to inspect & suppress duplicate listings.</p>
      </div>
    );
  }

  const handleSuppress = (id: string) => {
    AppStore.suppressDuplicate(id);
    refreshState();
    setDuplicates(AppStore.getDuplicateListings(activeLocation.id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <ShieldAlert className="w-7 h-7 mr-2.5 text-amber-500" />
          Duplicate Listing Suppressor & Cleansing Tool
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detect and suppress duplicate directory listings that cannibalize local pack authority for{' '}
          <span className="font-bold">{activeLocation.name}</span> (Competing with Moz Local)
        </p>
      </div>

      <div className="space-y-4">
        {duplicates.map((dup) => (
          <div
            key={dup.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-base">{dup.directoryName}:</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">"{dup.duplicateName}"</span>
              </div>
              <p className="text-xs text-slate-500">Address: {dup.duplicateAddress}</p>
              <span className="text-[11px] text-slate-400 font-medium block">
                Detected: {new Date(dup.detectedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center space-x-3 self-start md:self-auto">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                  dup.suppressionStatus === 'SUPPRESSED'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                {dup.suppressionStatus === 'SUPPRESSED' ? 'Suppressed & Merged' : 'Duplicate Active'}
              </span>

              {dup.suppressionStatus !== 'SUPPRESSED' && (
                <button
                  onClick={() => handleSuppress(dup.id)}
                  className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Request Suppression</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
