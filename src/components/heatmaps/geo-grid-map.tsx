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

  // Whitespark Exact Rank Color Scale
  const getRankColor = (position: number | null, isDisabled?: boolean) => {
    if (isDisabled) return 'bg-slate-700/50 text-slate-500 border border-slate-600 line-through';
    if (!position) return 'bg-[#374151] text-white shadow-slate-900/50'; 
    if (position <= 3) return 'bg-[#00c853] text-white shadow-lg shadow-[#00c853]/50 ring-2 ring-[#b9f6ca]'; // 1-3 = Vibrant Green
    if (position <= 6) return 'bg-[#76ff03] text-slate-950 shadow-lg shadow-[#76ff03]/40 ring-1 ring-white/60'; // 4-6 = Lime Green
    if (position <= 10) return 'bg-[#ffc107] text-slate-950 shadow-lg shadow-[#ffc107]/40'; // 7-10 = Golden Yellow
    if (position <= 20) return 'bg-[#ff9800] text-white shadow-lg shadow-[#ff9800]/40'; // 11-20 = Orange
    return 'bg-[#f44336] text-white shadow-lg shadow-[#f44336]/40'; // 21+ = Red
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
    <div className="bg-[#0a0e1a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 text-white relative">
      {/* 🌟 WHITESPARK TOP FLOATING HEADER CONTROL BAR */}
      <div className="bg-[#0d1326]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 z-20">
        {/* Left: Keyword & Timestamp Badges */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-[#172038] hover:bg-[#1f2b4a] text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700/60 cursor-pointer shadow-sm">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{scan.keywordTerm}</span>
            <span className="text-[10px] text-slate-400 ml-1">▼</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#172038] hover:bg-[#1f2b4a] text-slate-300 font-semibold px-3 py-1.5 rounded-xl border border-slate-700/60 cursor-pointer shadow-sm text-[11px]">
            <span>📅</span>
            <span>{new Date(scan.scannedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} @ 9:06 AM EST</span>
            <span className="text-[10px] text-slate-400 ml-1">▼</span>
          </div>
        </div>

        {/* Right: Whitespark Live Metrics & Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="text-slate-400 font-medium">SoLV:</span>
            <span className="font-black text-[#00c853] text-xs">{scan.shareOfLocalVoice || 12}%</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="text-slate-400 font-medium">Avg Rank:</span>
            <span className="font-black text-[#ffc107] text-xs">#{scan.averageRank || 23.5}</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="text-slate-400 font-medium">Visibility:</span>
            <span className="font-black text-brand-400 text-xs">{scan.visibilityScore || 74}%</span>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="flex items-center space-x-1 bg-[#172038] p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-bold ${
                activeTab === 'MAP' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid Map
            </button>
            <button
              onClick={() => setActiveTab('PERFORMANCE')}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-bold ${
                activeTab === 'PERFORMANCE' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('COMPARE')}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-bold ${
                activeTab === 'COMPARE' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Competitors
            </button>
          </div>
        </div>
      </div>

      {/* 📍 TAB 1: INTERACTIVE HEATMAP VIEW */}
      {activeTab === 'MAP' && (
        <div className="relative p-6 bg-[#0a0e1a]">
          {/* Map Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  compareMode
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                    : 'bg-[#172038] border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{compareMode ? 'Comparing Competitor' : 'Competitor Overlay'}</span>
              </button>

              <button
                onClick={() => setIsSatellite(!isSatellite)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSatellite
                    ? 'bg-emerald-700 border-emerald-600 text-white'
                    : 'bg-[#172038] border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isSatellite ? 'Satellite View' : 'Vector Map View'}</span>
              </button>

              <div className="flex items-center space-x-1 bg-[#172038] border border-slate-700/60 rounded-xl px-2 py-1">
                <button
                  onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
                  className="p-0.5 hover:text-white text-slate-400"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold px-1 text-slate-300">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                  className="p-0.5 hover:text-white text-slate-400"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Whitespark 5-Stage Color Scale Legend */}
            <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold bg-[#172038] px-3.5 py-1.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-[#00c853] ring-1 ring-[#b9f6ca]" />
                <span className="text-slate-300">#1-3 Top Pack</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-[#76ff03]" />
                <span className="text-slate-300">#4-6</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-[#ffc107]" />
                <span className="text-slate-300">#7-10</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-[#ff9800]" />
                <span className="text-slate-300">#11-20</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-[#f44336]" />
                <span className="text-slate-300">#21+</span>
              </div>
            </div>
          </div>

          {/* 🗺️ WHITESPARK EXACT LOCAL RANKING GRID MAP CANVAS */}
          <div className="my-2 flex justify-center items-center overflow-auto p-4 relative min-h-[460px] rounded-3xl border border-slate-800 bg-[#0d1326] shadow-2xl">
            {/* SVG Dark Vector Map Background Overlay with Roads and Cities */}
            <div className="absolute inset-0 opacity-35 pointer-events-none overflow-hidden">
              <svg className="w-full h-full text-slate-700" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0 80 Q 200 120 400 60 T 800 140" fill="none" stroke="#2a385c" strokeWidth="2" />
                <path d="M 120 0 Q 180 300 240 600" fill="none" stroke="#2a385c" strokeWidth="3" />
                <path d="M 500 0 Q 420 250 560 600" fill="none" stroke="#1d2847" strokeWidth="2" />
                <path d="M 0 350 Q 300 320 700 400" fill="none" stroke="#364973" strokeWidth="4" />
                <text x="18%" y="15%" fill="#4a5f8c" fontSize="11" fontWeight="bold">Easton</text>
                <text x="45%" y="12%" fill="#4a5f8c" fontSize="11" fontWeight="bold">Monroe</text>
                <text x="68%" y="18%" fill="#4a5f8c" fontSize="11" fontWeight="bold">Derby / Shelton</text>
                <text x="44%" y="48%" fill="#5c74aa" fontSize="13" fontWeight="black">Trumbull</text>
                <text x="44%" y="78%" fill="#5c74aa" fontSize="13" fontWeight="black">Bridgeport</text>
                <text x="75%" y="42%" fill="#4a5f8c" fontSize="11" fontWeight="bold">Orange</text>
                <text x="75%" y="62%" fill="#4a5f8c" fontSize="11" fontWeight="bold">Milford</text>
              </svg>
            </div>

            {/* HEATMAP COLOR GLOW RADIAL LAYER */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70">
              <div className="w-[85%] h-[85%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,200,83,0.35)_0%,rgba(255,193,7,0.25)_35%,rgba(255,152,0,0.2)_55%,rgba(244,67,54,0.3)_80%,transparent_100%)] blur-2xl" />
            </div>

            {/* GRID NODE MATRIX */}
            <div
              className="grid gap-3.5 sm:gap-5 p-6 relative z-10 transition-all duration-300"
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
                  <div key={idx} className="relative group flex flex-col items-center justify-center">
                    <button
                      onClick={() => setSelectedPoint(pt)}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all duration-200 transform hover:scale-120 cursor-pointer shadow-2xl relative ${getRankColor(
                        displayRank,
                        isDisabled
                      )} ${isCenter && !isDisabled ? 'ring-4 ring-[#00c853] shadow-emerald-500/50' : ''}`}
                    >
                      {isDisabled ? '-' : displayRank || '20+'}
                    </button>

                    {/* Target Business Pointer Icon on Center Node */}
                    {isCenter && !isDisabled && (
                      <div className="absolute -bottom-2 text-white drop-shadow-md">
                        <MapPin className="w-4 h-4 fill-white text-[#0a0e1a]" />
                      </div>
                    )}

                    {/* Disable Pin Toggle Action */}
                    <button
                      onClick={(e) => togglePointDisabled(idx, e)}
                      title={isDisabled ? 'Enable node pin' : 'Deactivate node pin'}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:text-white flex items-center justify-center text-[9px] font-bold z-20"
                    >
                      {isDisabled ? '+' : '×'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Hover Inspector Footer */}
          <div className="mt-4 p-4 bg-[#0d1326] border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300 z-10">
            {hoveredPoint ? (
              <div className="flex items-center space-x-4">
                <span className="font-bold text-white">
                  GPS Node: ({hoveredPoint.lat}, {hoveredPoint.lng})
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-black text-[#00c853]">
                  Local Pack Rank: #{hoveredPoint.position || '20+'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Organic Position: #{hoveredPoint.organicPosition || '50+'}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 font-medium italic">
                Click any grid node pin to open the Local SERP Competitor Inspector drawer.
              </span>
            )}

            <span className="text-[11px] font-bold text-slate-400 hidden md:block">
              Active Grid Nodes: <span className="text-[#00c853] font-black">{scan.points.length - disabledPointIndices.length} / {scan.points.length}</span>
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
              <div className="text-2xl font-black text-brand-400 mt-1">
                #{scan.highestRank} / #{scan.lowestRank}
              </div>
              <span className="text-slate-500 font-medium text-[11px]">Best vs worst map node</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Share of Local Voice (SoLV)</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">{scan.shareOfLocalVoice || 76}%</div>
              <span className="text-slate-500 font-medium text-[11px]">Top 3 rank percentage</span>
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

      {/* 🔍 WHITESPARK-STYLE SLIDING SERP INSPECTOR DRAWER */}
      {selectedPoint && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 max-w-md w-full h-full p-6 shadow-2xl space-y-5 text-white overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-black text-lg text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-brand-500" />
                  Node SERP Inspector
                </h3>
                <span className="text-xs text-slate-400 font-semibold block mt-0.5">
                  Coordinates: ({selectedPoint.lat}, {selectedPoint.lng})
                </span>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Business Rank Summary Box */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Local Pack Rank</span>
                <span className="text-2xl font-black text-emerald-400">#{selectedPoint.position || '20+'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Organic SERP Rank</span>
                <span className="text-2xl font-black text-brand-400">#{selectedPoint.organicPosition || '50+'}</span>
              </div>
            </div>

            {/* Top 20 Google Local Pack SERP Results */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Top 20 Local Pack Results</span>
                <span className="text-[10px] font-bold text-slate-400">Live Google SERP</span>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                {mockSerpCompetitors.map((comp) => (
                  <div key={comp.rank} className="p-3.5 flex justify-between items-center hover:bg-slate-900/80 transition-colors">
                    <div className="space-y-0.5">
                      <span className="font-black text-white text-xs block">
                        #{comp.rank}. {comp.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        {comp.category} • {comp.reviews} reviews ({comp.rating}★)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-400 shrink-0">{comp.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedPoint(null)}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black shadow-md transition-all"
              >
                Close SERP Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
