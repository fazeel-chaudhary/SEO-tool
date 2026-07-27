'use client';

import React, { useState } from 'react';
import { GeoGridScan, GridPoint } from '@/lib/types';
import {
  MapPin,
  Navigation,
  Eye,
  ArrowRightLeft,
  Award,
  Star,
  Building2,
  Download,
  Check,
  RefreshCw,
  X,
  FileText,
  Layers,
  ZoomIn,
  ZoomOut,
  Smartphone,
  Monitor,
} from 'lucide-react';

interface GeoGridMapProps {
  scan: GeoGridScan;
}

export function GeoGridMap({ scan }: GeoGridMapProps) {
  const [activeTab, setActiveTab] = useState<'MAP' | 'PERFORMANCE' | 'COMPARE' | 'EXPORT'>('MAP');
  const [hoveredPoint, setHoveredPoint] = useState<GridPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GridPoint | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [isSatellite, setIsSatellite] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [disabledPointIndices, setDisabledPointIndices] = useState<number[]>([]);

  // Dimension based on GridSize ('3x3', '5x5', '7x7', '9x9', '11x11', '13x13', '15x15')
  const getGridDim = (size: string) => {
    switch (size) {
      case '3x3': return 3;
      case '5x5': return 5;
      case '7x7': return 7;
      case '9x9': return 9;
      case '11x11': return 11;
      case '13x13': return 13;
      case '15x15': return 15;
      default: return 5;
    }
  };

  const dim = getGridDim(scan.gridSize);

  // Toggle active node pin
  const togglePointDisabled = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabledPointIndices.includes(idx)) {
      setDisabledPointIndices(disabledPointIndices.filter((i) => i !== idx));
    } else {
      setDisabledPointIndices([...disabledPointIndices, idx]);
    }
  };

  // 6-Stage Rank Color Scale
  const getRankColor = (position: number | null, isDisabled?: boolean) => {
    if (isDisabled) return 'bg-slate-700/50 text-slate-500 border border-slate-600 line-through';
    if (!position) return 'bg-slate-600 text-white shadow-slate-600/30'; // Not Ranked = Grey
    if (position <= 3) return 'bg-emerald-600 text-white shadow-emerald-600/40 ring-2 ring-emerald-300'; // 1-3 = Dark Green
    if (position <= 10) return 'bg-emerald-500 text-white shadow-emerald-500/30'; // 4-10 = Green
    if (position <= 20) return 'bg-amber-500 text-slate-950 shadow-amber-500/30'; // 11-20 = Yellow
    if (position <= 50) return 'bg-orange-500 text-white shadow-orange-500/30'; // 21-50 = Orange
    return 'bg-red-500 text-white shadow-red-500/30'; // 50+ = Red
  };

  const mockSerpCompetitors = [
    { rank: 1, name: 'Metro Area Top Specialist', rating: 4.9, reviews: 198, category: 'Primary Service', distance: '0.2 mi' },
    { rank: 2, name: 'Downtown Care Center', rating: 4.8, reviews: 142, category: 'Local Provider', distance: '0.4 mi' },
    { rank: 3, name: 'Capital Regional Hub', rating: 4.7, reviews: 88, category: 'Service Clinic', distance: '0.7 mi' },
    { rank: 4, name: 'Express Local Specialists', rating: 4.6, reviews: 64, category: 'General Specialist', distance: '0.9 mi' },
    { rank: 5, name: 'Emergency Service Center', rating: 4.5, reviews: 52, category: 'Emergency Services', distance: '1.2 mi' },
  ];

  const handleExportCsv = () => {
    const csvLines = [
      `Local Ranking Grid Export - ${scan.keywordTerm}`,
      `Scanned At,${new Date(scan.scannedAt).toLocaleDateString()}`,
      `Grid Size,${scan.gridSize}`,
      `Radius,${scan.radiusMiles} miles`,
      `Visibility Score,${scan.visibilityScore}%`,
      `Share of Local Voice (SoLV),${scan.shareOfLocalVoice}%`,
      `Average Rank,#${scan.averageRank}`,
      `Highest Rank,#${scan.highestRank}`,
      `Lowest Rank,#${scan.lowestRank}`,
      ``,
      `Node Index,Latitude,Longitude,Local Pack Rank,Organic Rank,Status`,
      ...scan.points.map((pt, i) => `${i + 1},${pt.lat},${pt.lng},${pt.position || '20+'},${pt.organicPosition || '50+'},${disabledPointIndices.includes(i) ? 'Disabled' : 'Active'}`),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `local_ranking_grid_${scan.keywordTerm.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-white">
      {/* Top Bar Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-md">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center">
              "{scan.keywordTerm}" Local Ranking Grid
            </h3>
            <span className="text-xs text-slate-400 font-medium flex items-center space-x-2">
              <span>Grid: {scan.gridSize} ({scan.points.length} scan points)</span>
              <span>•</span>
              <span>Radius: {scan.radiusMiles} miles</span>
              <span>•</span>
              <span className="text-indigo-400 flex items-center">
                {scan.deviceType === 'MOBILE' ? <Smartphone className="w-3 h-3 mr-1" /> : <Monitor className="w-3 h-3 mr-1" />}
                {scan.deviceType || 'MOBILE'}
              </span>
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('MAP')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'MAP' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Grid Heatmap
          </button>
          <button
            onClick={() => setActiveTab('PERFORMANCE')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'PERFORMANCE' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('COMPARE')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'COMPARE' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Competitors
          </button>
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'EXPORT' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Export
          </button>
        </div>
      </div>

      {/* 📍 TAB 1: INTERACTIVE HEATMAP VIEW */}
      {activeTab === 'MAP' && (
        <div className="space-y-6">
          {/* Map Controls & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  compareMode
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{compareMode ? 'Comparing with Top Competitor' : 'Competitor Overlay'}</span>
              </button>

              <button
                onClick={() => setIsSatellite(!isSatellite)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSatellite
                    ? 'bg-emerald-700 border-emerald-600 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isSatellite ? 'Satellite View' : 'Vector Map View'}</span>
              </button>

              <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1">
                <button
                  onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
                  className="p-0.5 hover:text-white text-slate-400"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                  className="p-0.5 hover:text-white text-slate-400"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 6-Stage Color Legend */}
            <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-emerald-600" />
                <span className="text-slate-300">#1-3</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-300">#4-10</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span className="text-slate-300">#11-20</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-slate-300">#21-50</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-slate-300">#50+</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-slate-600" />
                <span className="text-slate-400">Unranked</span>
              </div>
            </div>
          </div>

          {/* Interactive Heatmap Matrix Canvas */}
          <div className="my-4 flex justify-center items-center overflow-auto p-4">
            <div
              className={`grid gap-3 sm:gap-4 p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 ${
                isSatellite
                  ? 'bg-slate-950/95 border-emerald-900/60 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]'
                  : 'bg-slate-950 border-slate-800'
              }`}
              style={{
                gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`,
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center center',
              }}
            >
              {scan.points.map((pt, idx) => {
                const isCenter = Math.floor(scan.points.length / 2) === idx;
                const isDisabled = disabledPointIndices.includes(idx);
                const displayRank = compareMode ? Math.min(20, (pt.position || 15) + Math.floor(Math.random() * 3) - 1) : pt.position;

                return (
                  <div key={idx} className="relative group">
                    <button
                      onClick={() => setSelectedPoint(pt)}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center transition-all duration-200 transform hover:scale-115 cursor-pointer shadow-lg relative ${getRankColor(
                        displayRank,
                        isDisabled
                      )} ${isCenter && !isDisabled ? 'ring-4 ring-white shadow-xl animate-pulse' : ''}`}
                    >
                      {isDisabled ? '-' : displayRank || '20+'}
                      {isCenter && !isDisabled && (
                        <MapPin className="w-3 h-3 text-white absolute -top-1 -right-1 fill-white" />
                      )}
                    </button>

                    {/* Disable Pin Toggle Action */}
                    <button
                      onClick={(e) => togglePointDisabled(idx, e)}
                      title={isDisabled ? 'Enable node pin' : 'Deactivate node pin'}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:text-white flex items-center justify-center text-[9px] font-bold z-10"
                    >
                      {isDisabled ? '+' : '×'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Hover Inspector Footer */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300 z-10">
            {hoveredPoint ? (
              <div className="flex items-center space-x-4">
                <span className="font-bold text-white">
                  GPS Node: ({hoveredPoint.lat}, {hoveredPoint.lng})
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-extrabold text-brand-400">
                  Local Pack Position: #{hoveredPoint.position || '20+'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Organic Position: #{hoveredPoint.organicPosition || '50+'}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 font-medium italic">
                Click any grid node pin to open SERP Competitor Inspector drawer.
              </span>
            )}

            <span className="text-[11px] font-bold text-slate-400 hidden md:block">
              Active Nodes: <span className="text-emerald-400 font-black">{scan.points.length - disabledPointIndices.length} / {scan.points.length}</span>
            </span>
          </div>
        </div>
      )}

      {/* 📊 TAB 2: PERFORMANCE METRICS */}
      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-5 text-xs">
          <h4 className="font-extrabold text-sm text-white">Ranking Performance Breakdown</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Visibility Score</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">{scan.visibilityScore}%</div>
              <span className="text-slate-500 font-medium text-[11px]">Weighted local pack index</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Average Rank</span>
              <div className="text-3xl font-black text-white mt-1">#{scan.averageRank}</div>
              <span className="text-slate-500 font-medium text-[11px]">Across active node pins</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Highest / Lowest Rank</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                #{scan.highestRank} / #{scan.lowestRank}
              </div>
              <span className="text-slate-500 font-medium text-[11px]">Best vs worst map node</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">14-Day Trend Forecast</span>
              <div className="text-2xl font-black text-brand-400 mt-1">+{scan.projectedTrend} positions</div>
              <span className="text-slate-500 font-medium text-[11px]">Projected rank momentum</span>
            </div>
          </div>
        </div>
      )}

      {/* ⚔️ TAB 3: COMPETITORS MATRIX */}
      {activeTab === 'COMPARE' && (
        <div className="space-y-4 text-xs">
          <h4 className="font-extrabold text-sm text-white">Top Competitor Local Pack Rankings</h4>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Reviews</th>
                  <th className="p-3 text-right">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {mockSerpCompetitors.map((comp) => (
                  <tr key={comp.rank} className="hover:bg-slate-900/50">
                    <td className="p-3 font-black text-brand-400">#{comp.rank}</td>
                    <td className="p-3 font-bold text-white">{comp.name}</td>
                    <td className="p-3 text-slate-300">{comp.category}</td>
                    <td className="p-3 font-bold text-amber-400">{comp.rating}★</td>
                    <td className="p-3 text-slate-300">{comp.reviews} reviews</td>
                    <td className="p-3 text-right text-slate-400">{comp.distance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📥 TAB 4: EXPORT REPORT */}
      {activeTab === 'EXPORT' && (
        <div className="space-y-4 text-xs">
          <h4 className="font-extrabold text-sm text-white">Download Local Ranking Grid Data</h4>
          <p className="text-slate-400">Export high-resolution CSV spreadsheets or printable PDF white-label reports for clients.</p>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleExportCsv}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Spreadsheet</span>
            </button>
          </div>
        </div>
      )}

      {/* 🔍 GRID CELL SERP INSPECTOR MODAL */}
      {selectedPoint && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-brand-500" />
                  Local SERP Inspector Node
                </h3>
                <span className="text-xs text-slate-400 font-semibold">
                  Coordinates: ({selectedPoint.lat}, {selectedPoint.lng}) • Address: {selectedPoint.address || 'Local Grid Node'}
                </span>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Local Pack Rank</span>
                <span className="text-xl font-black text-emerald-400">#{selectedPoint.position || '20+'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Organic SERP Rank</span>
                <span className="text-xl font-black text-indigo-400">#{selectedPoint.organicPosition || '50+'}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Competitors at this Node</span>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                {mockSerpCompetitors.map((comp) => (
                  <div key={comp.rank} className="p-3 flex justify-between items-center hover:bg-slate-900/60">
                    <div>
                      <span className="font-extrabold text-white text-xs block">{comp.rank}. {comp.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{comp.category} • {comp.reviews} reviews ({comp.rating}★)</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{comp.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPoint(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
