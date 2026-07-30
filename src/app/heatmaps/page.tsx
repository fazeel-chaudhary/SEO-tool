'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { GridTrackerService } from '@/services/grid-tracker';
import { GeoGridScan, GridSize, Keyword, Project, GridScanSchedule, CenterMode, DeviceType } from '@/lib/types';
import { GeoGridMap } from '@/components/heatmaps/geo-grid-map';
import { HistoricalPlayback } from '@/components/heatmaps/historical-playback';
import {
  Navigation,
  Play,
  TrendingUp,
  Activity,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Plus,
  BarChart3,
  Sliders,
  Check,
  FolderPlus,
  Users,
  Star,
  FileSpreadsheet,
  Download,
  Share2,
  Mail,
  ArrowRightLeft,
  Trash2,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Award,
} from 'lucide-react';

export default function HeatmapsPage() {
  const { activeLocation, locations, refreshState } = useOrg();
  const [activeTab, setActiveTab] = useState<'GRID' | 'PROJECTS' | 'KEYWORDS' | 'COMPETITORS' | 'HISTORY' | 'REPORTS'>('GRID');

  // Grid Scan Data State
  const [scans, setScans] = useState<GeoGridScan[]>([]);
  const [activeScan, setActiveScan] = useState<GeoGridScan | null>(null);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Scan Config State (Up to 15x15 / 225 Points)
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [gridSize, setGridSize] = useState<GridSize>('5x5');
  const [radiusMiles, setRadiusMiles] = useState<number>(2.0);
  const [isCustomRadius, setIsCustomRadius] = useState<boolean>(false);
  const [customRadiusInput, setCustomRadiusInput] = useState<string>('2.0');
  const [centerMode, setCenterMode] = useState<CenterMode>('BUSINESS_LOCATION');
  const [deviceType, setDeviceType] = useState<DeviceType>('MOBILE');

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectFolder, setNewProjectFolder] = useState<string>('');

  // Keywords State
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [showAddKeywordModal, setShowAddKeywordModal] = useState<boolean>(false);
  const [newTerm, setNewTerm] = useState<string>('');
  const [csvText, setCsvText] = useState<string>('');

  // Schedules State
  const [schedules, setSchedules] = useState<GridScanSchedule[]>([]);
  const [showNewScheduleModal, setShowNewScheduleModal] = useState<boolean>(false);
  const [schedKeyword, setSchedKeyword] = useState<string>('');
  const [schedFrequency, setSchedFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [schedEmail, setSchedEmail] = useState<string>('admin@agency.com');

  // 2-Date History Comparison State
  const [compareScanAId, setCompareScanAId] = useState<string>('');
  const [compareScanBId, setCompareScanBId] = useState<string>('');

  useEffect(() => {
    if (activeLocation) {
      const locScans = AppStore.getGeoScans(activeLocation.id);
      setScans(locScans);
      if (locScans.length > 0) {
        setActiveScan(locScans[0]);
        if (locScans.length >= 2) {
          setCompareScanAId(locScans[1].id);
          setCompareScanBId(locScans[0].id);
        }
      }

      const kws = AppStore.getKeywords(activeLocation.id);
      setKeywords(kws);
      if (kws.length > 0) {
        setSelectedKeyword(kws[0].term);
        setSchedKeyword(kws[0].term);
      } else {
        setSelectedKeyword(`emergency ${activeLocation.category.toLowerCase()} ${activeLocation.city}`);
      }

      const projs = AppStore.getProjects(activeLocation.organizationId);
      setProjects(projs);

      const scheds = AppStore.getSchedules(activeLocation.id);
      setSchedules(scheds);
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to view the Local Ranking Grid Engine.</p>
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
        radiusMiles,
        centerMode,
        deviceType
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

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      folderName: newProjectFolder.trim() || 'General Campaign',
      assignedUserIds: ['user-1'],
      locationIds: [activeLocation.id],
      organizationId: activeLocation.organizationId,
      createdAt: new Date().toISOString(),
    };

    AppStore.saveProject(newProj);
    setProjects(AppStore.getProjects(activeLocation.organizationId));
    setShowNewProjectModal(false);
    setNewProjectName('');
    setNewProjectFolder('');
  };

  const handleAddKeywordSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim()) return;

    const newKw: Keyword = {
      id: `kw-${Date.now()}`,
      term: newTerm.trim(),
      city: activeLocation.city,
      locationId: activeLocation.id,
      latestRank: Math.floor(Math.random() * 5) + 1,
    };

    AppStore.saveKeyword(newKw);
    setKeywords(AppStore.getKeywords(activeLocation.id));
    setNewTerm('');
    setShowAddKeywordModal(false);
  };

  const handleCsvImport = () => {
    if (!csvText.trim()) return;
    AppStore.importKeywordsFromCsv(activeLocation.id, activeLocation.city, csvText);
    setKeywords(AppStore.getKeywords(activeLocation.id));
    setCsvText('');
    setShowAddKeywordModal(false);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedKeyword) return;

    const newSched: GridScanSchedule = {
      id: `sched-${Date.now()}`,
      locationId: activeLocation.id,
      keywordTerm: schedKeyword,
      gridSize,
      radiusMiles,
      frequency: schedFrequency,
      emailRecipients: [schedEmail],
      active: true,
      lastRunAt: 'Just now',
      nextRunAt: 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    AppStore.saveSchedule(newSched);
    setSchedules(AppStore.getSchedules(activeLocation.id));
    setShowNewScheduleModal(false);
  };

  // Mock comparison calculation between two historical scans
  const scanA = scans.find((s) => s.id === compareScanAId);
  const scanB = scans.find((s) => s.id === compareScanBId);
  const comparisonResult = scanA && scanB ? GridTrackerService.compareGeoScans(scanA, scanB) : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Navigation className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Enterprise Local Ranking Grid Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map-based rank tracking & competitor intelligence for <span className="font-bold">{activeLocation.name}</span> ({activeLocation.city})
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

      {/* 6 Primary Module Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('GRID')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'GRID' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-brand-600'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Heatmap & Grid Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('PROJECTS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'PROJECTS' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-brand-600'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Projects & Locations</span>
        </button>

        <button
          onClick={() => setActiveTab('KEYWORDS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'KEYWORDS' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-brand-600'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Keywords ({keywords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPETITORS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'COMPETITORS' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-brand-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Competitor Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'HISTORY' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-brand-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Scan History & Compare</span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'REPORTS' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-brand-600'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports & Scheduling</span>
        </button>
      </div>

      {/* 📌 MODULE TAB 1: HEATMAP & GRID ENGINE */}
      {activeTab === 'GRID' && (
        <div className="space-y-6">
          {/* Geo-Grid Heatmap Component */}
          {activeScan && (
            <div className="space-y-6">
              <GeoGridMap
                scan={activeScan}
                allScans={scans}
                onSelectScan={(s) => setActiveScan(s)}
              />
              <HistoricalPlayback
                scans={scans}
                selectedScanId={activeScan.id}
                onSelectScan={(s) => setActiveScan(s)}
              />
            </div>
          )}
        </div>
      )}

      {/* 📁 MODULE TAB 2: PROJECTS & LOCATIONS MANAGEMENT */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Projects ({projects.length})</h3>
              <p className="text-xs text-slate-500">Organize client campaigns, location folders, and team permissions.</p>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {proj.folderName}
                    </span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">{proj.name}</h4>
                  </div>
                  <button
                    onClick={() => AppStore.toggleFavoriteProject(proj.id)}
                    className={`p-1.5 rounded-lg ${proj.isFavorite ? 'text-amber-400' : 'text-slate-400'}`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <span>Locations: {proj.locationIds.length} connected</span>
                  <span>Assigned Team: {proj.assignedUserIds.length} member</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔑 MODULE TAB 3: KEYWORD MANAGEMENT & CSV IMPORTER */}
      {activeTab === 'KEYWORDS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Tracked Search Keywords ({keywords.length})</h3>
              <p className="text-xs text-slate-500">Manage target terms or import bulk keywords via CSV.</p>
            </div>
            <button
              onClick={() => setShowAddKeywordModal(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Import Keywords</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Keyword Term</th>
                  <th className="py-3 px-4">Target City</th>
                  <th className="py-3 px-4">Latest Map Rank</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center">
                      <Search className="w-3.5 h-3.5 mr-2 text-brand-600" />
                      {kw.term}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{kw.city}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      #{kw.latestRank || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          AppStore.deleteKeyword(kw.id);
                          setKeywords(AppStore.getKeywords(activeLocation.id));
                        }}
                        className="text-red-500 hover:text-red-700 font-bold text-[11px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ⚔️ MODULE TAB 4: COMPETITOR TRACKING & VISIBILITY */}
      {activeTab === 'COMPETITORS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-500" />
              Auto-Detected Local Competitors Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Competitors outranking <span className="font-bold">{activeLocation.name}</span> across grid points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Top Competitor #1</span>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Austin Metro Dental Specialist</h4>
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold">
                <span>Rating: 4.9★</span>
                <span>•</span>
                <span>185 Reviews</span>
                <span>•</span>
                <span>SoLV: 82%</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Top Competitor #2</span>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Downtown Dental Care</h4>
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold">
                <span>Rating: 4.8★</span>
                <span>•</span>
                <span>142 Reviews</span>
                <span>•</span>
                <span>SoLV: 74%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⏳ MODULE TAB 5: HISTORICAL SCAN TIMELINE & 2-DATE COMPARISON TOOL */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
              <ArrowRightLeft className="w-4 h-4 mr-2 text-indigo-500" />
              Side-by-Side 2-Date Scan Comparison Tool
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Older Scan (Date A)</label>
                <select
                  value={compareScanAId}
                  onChange={(e) => setCompareScanAId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  {scans.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.scannedAt).toLocaleDateString()} — "{s.keywordTerm}" (Avg #{s.averageRank})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Newer Scan (Date B)</label>
                <select
                  value={compareScanBId}
                  onChange={(e) => setCompareScanBId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  {scans.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.scannedAt).toLocaleDateString()} — "{s.keywordTerm}" (Avg #{s.averageRank})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {comparisonResult && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-xs space-y-2">
                <span className="font-extrabold text-indigo-950 dark:text-indigo-200 block text-sm">Scan Comparison Analysis</span>
                <div className="flex space-x-4 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">🟢 Rank Gains: {comparisonResult.totalGains} nodes</span>
                  <span className="text-red-500 font-bold">🔴 Rank Drops: {comparisonResult.totalDrops} nodes</span>
                  <span className="text-slate-500 font-bold">⚪ Unchanged: {comparisonResult.totalUnchanged} nodes</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📊 MODULE TAB 6: WHITE-LABEL REPORTS & SCAN SCHEDULER */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-brand-600" />
                  Automated Scan Scheduler ({schedules.length})
                </h3>
                <p className="text-xs text-slate-500">Configure daily, weekly, or monthly automated ranking scans with PDF email reports.</p>
              </div>
              <button
                onClick={() => setShowNewScheduleModal(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Schedule</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {schedules.map((sched) => (
                <div key={sched.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">"{sched.keywordTerm}" ({sched.frequency})</span>
                    <span className="text-slate-500 block text-[11px]">Recipients: {sched.emailRecipients.join(', ')}</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-[10px]">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEW GEO-GRID SCAN MODAL */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-brand-500" />
              Configure Custom Geo-Grid Scan
            </h2>

            <form onSubmit={handleLaunchScan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Keyword Term *</label>
                <input
                  type="text"
                  required
                  value={selectedKeyword}
                  onChange={(e) => setSelectedKeyword(e.target.value)}
                  placeholder={`e.g. emergency ${activeLocation.category.toLowerCase()} ${activeLocation.city}`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grid Size Matrix</label>
                  <select
                    value={gridSize}
                    onChange={(e) => setGridSize(e.target.value as GridSize)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="3x3">3x3 (9 Scan Points)</option>
                    <option value="5x5">5x5 (25 Scan Points)</option>
                    <option value="7x7">7x7 (49 Scan Points)</option>
                    <option value="9x9">9x9 (81 Scan Points)</option>
                    <option value="11x11">11x11 (121 Scan Points)</option>
                    <option value="13x13">13x13 (169 Scan Points)</option>
                    <option value="15x15">15x15 (225 Scan Points)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between items-center">
                    <span>Search Radius (Miles & km)</span>
                    {radiusMiles && (
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-extrabold">
                        {radiusMiles} mi ({(radiusMiles * 1.60934).toFixed(1)} km)
                      </span>
                    )}
                  </label>
                  <select
                    value={isCustomRadius ? 'CUSTOM' : radiusMiles.toString()}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomRadius(true);
                      } else {
                        setIsCustomRadius(false);
                        const val = parseFloat(e.target.value);
                        setRadiusMiles(val);
                        setCustomRadiusInput(val.toString());
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="0.5">0.5 Miles (0.8 km)</option>
                    <option value="1">1.0 Mile (1.6 km)</option>
                    <option value="2">2.0 Miles (3.2 km)</option>
                    <option value="3">3.0 Miles (4.8 km)</option>
                    <option value="5">5.0 Miles (8.0 km)</option>
                    <option value="7.5">7.5 Miles (12.1 km)</option>
                    <option value="10">10.0 Miles (16.1 km)</option>
                    <option value="15">15.0 Miles (24.1 km)</option>
                    <option value="20">20.0 Miles (32.2 km)</option>
                    <option value="CUSTOM">✏️ Custom Radius (Miles & km)...</option>
                  </select>

                  {isCustomRadius && (
                    <div className="mt-2 space-y-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        placeholder="Enter custom radius in miles (e.g. 3.5)"
                        value={customRadiusInput}
                        onChange={(e) => {
                          setCustomRadiusInput(e.target.value);
                          const parsed = parseFloat(e.target.value);
                          if (!isNaN(parsed) && parsed > 0) {
                            setRadiusMiles(parsed);
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Geodesic math: {radiusMiles} miles = {(radiusMiles * 1.60934).toFixed(2)} km radius boundary.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Scan Center Point</label>
                  <select
                    value={centerMode}
                    onChange={(e) => setCenterMode(e.target.value as CenterMode)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2"
                  >
                    <option value="BUSINESS_LOCATION">Business Location</option>
                    <option value="CITY_CENTER">City Center</option>
                    <option value="ZIP_CODE">ZIP Code Center</option>
                    <option value="CUSTOM_COORDS">Custom Coordinates</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Search Device</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2"
                  >
                    <option value="MOBILE">Mobile Device</option>
                    <option value="DESKTOP">Desktop Browser</option>
                  </select>
                </div>
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

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center">
              <FolderPlus className="w-5 h-5 mr-2 text-brand-500" />
              Create Project Folder
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Austin Expansion Campaign"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Folder Group Name</label>
                <input
                  type="text"
                  value={newProjectFolder}
                  onChange={(e) => setNewProjectFolder(e.target.value)}
                  placeholder="e.g. Client Accounts - Healthcare"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / CSV IMPORT KEYWORDS MODAL */}
      {showAddKeywordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Add or Bulk Import CSV Keywords
            </h2>

            <form onSubmit={handleAddKeywordSingle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Add Single Keyword</label>
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="e.g. emergency dentist austin"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Or Bulk Import CSV Keywords (One per line)</label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`emergency dentist austin\nbest cosmetic dentistry austin\nteeth whitening 78701`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddKeywordModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                {csvText.trim() ? (
                  <button
                    type="button"
                    onClick={handleCsvImport}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                  >
                    Import CSV Keywords
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
                  >
                    Add Keyword
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW SCHEDULE MODAL */}
      {showNewScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Create Automatic Scan Schedule
            </h2>

            <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Keyword Term *</label>
                <select
                  value={schedKeyword}
                  onChange={(e) => setSchedKeyword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  {keywords.map((k) => (
                    <option key={k.id} value={k.term}>{k.term}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Scan Frequency</label>
                  <select
                    value={schedFrequency}
                    onChange={(e) => setSchedFrequency(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="DAILY">Daily Scan</option>
                    <option value="WEEKLY">Weekly Scan</option>
                    <option value="MONTHLY">Monthly Scan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notification Email</label>
                  <input
                    type="email"
                    required
                    value={schedEmail}
                    onChange={(e) => setSchedEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
