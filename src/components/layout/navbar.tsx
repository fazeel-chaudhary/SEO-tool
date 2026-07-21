'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { MapPin, RefreshCw, CheckCircle2, AlertCircle, Menu, X } from 'lucide-react';
import { GbpService } from '@/services/gbp-service';
import { RankTrackerService } from '@/services/rank-tracker';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export function Navbar({ onToggleMobileSidebar, isMobileSidebarOpen }: NavbarProps) {
  const { locations, activeLocation, setActiveLocationId, refreshState } = useOrg();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleTriggerSync = async () => {
    if (!activeLocation) return;
    setIsSyncing(true);
    setSyncStatus('Syncing GBP profile & Google Maps rankings...');

    try {
      if (!activeLocation.gbpConnected) {
        await GbpService.connectAndSyncGbp(activeLocation.id);
      } else {
        await GbpService.syncProfileData(activeLocation.id);
      }

      await RankTrackerService.refreshAllLocationKeywords(activeLocation.id);
      refreshState();
      setSyncStatus('Sync complete! Health score & rankings updated.');
    } catch (e) {
      console.error(e);
      setSyncStatus('Sync completed with warning.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Mobile Hamburger & Location Selector */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden transition-colors"
          title="Toggle Navigation Menu"
          id="mobile-hamburger-btn"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 hidden sm:block" />
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">Location:</span>
          <select
            value={activeLocation?.id || ''}
            onChange={(e) => setActiveLocationId(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer max-w-[160px] sm:max-w-none truncate"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.city}, {loc.state})
              </option>
            ))}
          </select>
        </div>

        {activeLocation && (
          <span
            className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
              activeLocation.gbpConnected
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
            }`}
          >
            {activeLocation.gbpConnected ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                GBP Connected
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
                GBP Disconnected
              </>
            )}
          </span>
        )}
      </div>

      {/* Action Status & Sync Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {syncStatus && (
          <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium animate-pulse hidden lg:inline">
            {syncStatus}
          </span>
        )}

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing || !activeLocation}
          className="flex items-center space-x-1.5 sm:space-x-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-brand-600/20 active:scale-95 shrink-0"
          id="sync-now-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync GBP & Rank Now'}</span>
          <span className="sm:hidden">{isSyncing ? 'Syncing' : 'Sync'}</span>
        </button>
      </div>
    </header>
  );
}
