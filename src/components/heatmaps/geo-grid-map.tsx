'use client';

import React, { useState } from 'react';
import { GeoGridScan, GridPoint } from '@/lib/types';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

interface GeoGridMapProps {
  scan: GeoGridScan;
}

export function GeoGridMap({ scan }: GeoGridMapProps) {
  const [hoveredPoint, setHoveredPoint] = useState<GridPoint | null>(null);

  const dim = scan.gridSize === '3x3' ? 3 : scan.gridSize === '5x5' ? 5 : 7;

  const getRankColor = (position: number | null) => {
    if (!position) return 'bg-red-500 text-white shadow-red-500/30';
    if (position <= 3) return 'bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-300';
    if (position <= 5) return 'bg-lime-500 text-white shadow-lime-500/30';
    if (position <= 10) return 'bg-amber-400 text-slate-900 shadow-amber-400/30';
    if (position <= 20) return 'bg-orange-500 text-white shadow-orange-500/30';
    return 'bg-red-500 text-white shadow-red-500/30';
  };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-between">
      {/* Map Header Overlay */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              "{scan.keywordTerm}" Geo-Grid Map
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Grid: {scan.gridSize} • Radius: {scan.radiusMiles} miles
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center space-x-3 text-[10px] font-bold">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-300">#1-#3</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-lime-500" />
            <span className="text-slate-300">#4-#5</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-slate-300">#6-#10</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-300">#20+</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas Grid Matrix */}
      <div className="my-8 flex justify-center items-center">
        <div
          className="grid gap-4 sm:gap-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`,
          }}
        >
          {scan.points.map((pt, idx) => {
            const isCenter = Math.floor(scan.points.length / 2) === idx;
            return (
              <button
                key={idx}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center transition-all duration-200 transform hover:scale-115 cursor-pointer shadow-lg relative ${getRankColor(
                  pt.position
                )} ${isCenter ? 'ring-4 ring-white shadow-xl animate-pulse' : ''}`}
              >
                {pt.position || '20+'}
                {isCenter && (
                  <MapPin className="w-3 h-3 text-white absolute -top-1 -right-1 fill-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Node Hover Tooltip Footer */}
      <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300 z-10">
        {hoveredPoint ? (
          <div className="flex items-center space-x-4">
            <span className="font-bold text-white">
              GPS Node: ({hoveredPoint.lat}, {hoveredPoint.lng})
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-extrabold text-brand-400">
              Rank #{hoveredPoint.position || '20+'} in Local Pack
            </span>
          </div>
        ) : (
          <span className="text-slate-400 font-medium italic">
            Hover over any grid node to inspect exact GPS coordinates & Local Pack rank position.
          </span>
        )}

        <span className="text-[11px] font-bold text-slate-400 hidden md:block">
          Share of Local Voice (SoLV): <span className="text-emerald-400 font-black">{scan.shareOfLocalVoice}%</span>
        </span>
      </div>
    </div>
  );
}
