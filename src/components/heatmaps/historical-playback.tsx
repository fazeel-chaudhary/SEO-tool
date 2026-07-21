'use client';

import React from 'react';
import { GeoGridScan } from '@/lib/types';
import { Play, Pause, History, Calendar } from 'lucide-react';

interface HistoricalPlaybackProps {
  scans: GeoGridScan[];
  selectedScanId: string;
  onSelectScan: (scan: GeoGridScan) => void;
}

export function HistoricalPlayback({
  scans,
  selectedScanId,
  onSelectScan,
}: HistoricalPlaybackProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const selectedIndex = scans.findIndex((s) => s.id === selectedScanId);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && scans.length > 1) {
      timer = setInterval(() => {
        const nextIdx = (selectedIndex + 1) % scans.length;
        onSelectScan(scans[nextIdx]);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedIndex, scans, onSelectScan]);

  if (scans.length <= 1) {
    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-brand-500" />
          <span>Historical Playback: 1 scan snapshot recorded so far.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h4 className="font-extrabold text-slate-900 dark:text-white">Historical Heatmap Timeline</h4>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all text-xs"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause Playback' : 'Play Timeline'}</span>
        </button>
      </div>

      {/* Time Slider Controls */}
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={scans.length - 1}
          value={selectedIndex >= 0 ? selectedIndex : 0}
          onChange={(e) => {
            const idx = parseInt(e.target.value, 10);
            onSelectScan(scans[idx]);
          }}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />

        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
          {scans.map((s, idx) => (
            <span
              key={s.id}
              onClick={() => onSelectScan(s)}
              className={`cursor-pointer transition-colors ${
                s.id === selectedScanId ? 'text-brand-600 dark:text-brand-400 font-extrabold' : ''
              }`}
            >
              {new Date(s.scannedAt).toLocaleDateString()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
