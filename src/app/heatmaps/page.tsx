'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { GridTrackerService } from '@/services/grid-tracker';
import { GeoGridScan, GridSize, Keyword } from '@/lib/types';
import { GeoGridMap } from '@/components/heatmaps/geo-grid-map';
import { HistoricalPlayback } from '@/components/heatmaps/historical-playback';
import {
  Navigation,
  Play,
  TrendingUp,
  Activity,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';

export default function HeatmapsPage() {
  const { activeLocation, refreshState } = useOrg();
  const [scans, setScans] = useState<GeoGridScan[]>([]);
  const [activeScan, setActiveScan] = useState<GeoGridScan | null>(null);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Scan Modal Form state
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [gridSize, setGridSize] = useState<GridSize>('5x5');
  const [radiusMiles, setRadiusMiles] = useState<number>(2.0);

  useEffect(() => {
    if (activeLocation) {
      const locScans = AppStore.getGeoScans(activeLocation.id);
      setScans(locScans);
      if (locScans.length > 0) {
        setActiveScan(locScans[0]);
      }

      const keywords = AppStore.getKeywords(activeLocation.id);
      if (keywords.length > 0) {
        setSelectedKeyword(keywords[0].term);
      } else {
        setSelectedKeyword('emergency dentist austin');
      }
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to view Geo-Grid Rank Tracking Heatmaps.</p>
      </div>
    );
  }

  const handleLaunchScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKeyword.trim()) return;

    setIsScanning(true);
    try {
      const newScan = await GridTrackerService.runGeoGridScan(
        activeLocation,
        selectedKeyword,
        gridSize,
        radiusMiles
      );

      refreshState();
      const locScans = AppStore.getGeoScans(activeLocation.id);
      setScans(locScans);
      setActiveScan(newScan);
      setShowScanModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Navigation className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Geo-Grid Rank Tracker & Heatmaps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Local Falcon competitor module tracking Google Maps pack coverage for{' '}
            <span className="font-bold">{activeLocation.name}</span>
          </p>
        </div>

        <button
          onClick={() => setShowScanModal(true)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="launch-grid-scan-btn"
        >
          <Plus className="w-4 h-4" />
          <span>New Geo-Grid Scan</span>
        </button>
      </div>

      {/* Grid Scan Metrics Overview */}
      {activeScan && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Share of Local Voice (SoLV)
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {activeScan.shareOfLocalVoice}%
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Grid Points ranking #1-#3</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Average Grid Rank
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              #{activeScan.averageRank}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Across {activeScan.points.length} nodes</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Volatility Index
            </span>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-center">
              <Activity className="w-5 h-5 mr-1 text-indigo-500" />
              {activeScan.volatilityScore} <span className="text-xs text-slate-400 font-normal">/ 10</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Rank position variance</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              14-Day Trend Forecast
            </span>
            <div className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1 flex items-center">
              <Sparkles className="w-5 h-5 mr-1" />
              {activeScan.projectedTrend >= 0 ? `+${activeScan.projectedTrend}` : activeScan.projectedTrend}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Linear local pack projection</span>
          </div>
        </div>
      )}

      {/* Main Heatmap Visualizer */}
      {activeScan && (
        <div className="space-y-6">
          <GeoGridMap scan={activeScan} />
          <HistoricalPlayback
            scans={scans}
            selectedScanId={activeScan.id}
            onSelectScan={(s) => setActiveScan(s)}
          />
        </div>
      )}

      {/* New Geo-Grid Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-brand-500" />
              Configure Geo-Grid Scan
            </h2>

            <form onSubmit={handleLaunchScan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Keyword Term *
                </label>
                <input
                  type="text"
                  required
                  value={selectedKeyword}
                  onChange={(e) => setSelectedKeyword(e.target.value)}
                  placeholder="e.g. emergency dentist austin"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grid Size Matrix
                  </label>
                  <select
                    value={gridSize}
                    onChange={(e) => setGridSize(e.target.value as GridSize)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="3x3">3x3 (9 Points)</option>
                    <option value="5x5">5x5 (25 Points)</option>
                    <option value="7x7">7x7 (49 Points)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Distance Radius (Miles)
                  </label>
                  <select
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value={0.5}>0.5 Miles</option>
                    <option value={1.0}>1.0 Mile</option>
                    <option value={2.0}>2.0 Miles</option>
                    <option value={5.0}>5.0 Miles</option>
                    <option value={10.0}>10.0 Miles</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-brand-50/60 dark:bg-brand-950/40 rounded-xl border border-brand-100 dark:border-brand-900/60 text-brand-800 dark:text-brand-200">
                <span className="font-bold">Queue Job Processor: </span>
                Scheduled recurring scan rate-limited via BullMQ worker pool.
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScanModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm shadow-brand-600/20"
                >
                  {isScanning ? 'Scanning Grid...' : 'Run Heatmap Scan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
