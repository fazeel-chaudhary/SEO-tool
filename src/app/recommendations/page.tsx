'use client';

import React, { useEffect, useState } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { Recommendation } from '@/lib/types';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function RecommendationsPage() {
  const { activeOrg, activeLocation, refreshState } = useOrg();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    if (activeOrg) {
      const recs = AppStore.getRecommendations(activeOrg.id, activeLocation?.id);
      setRecommendations(recs);
    }
  }, [activeOrg, activeLocation]);

  const handleStatusUpdate = (recId: string, status: Recommendation['status']) => {
    AppStore.updateRecommendationStatus(recId, status);
    refreshState();
    if (activeOrg) {
      setRecommendations(AppStore.getRecommendations(activeOrg.id, activeLocation?.id));
    }
  };

  const filteredRecs = recommendations.filter((rec) => {
    if (filterPriority !== 'ALL' && rec.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && rec.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Lightbulb className="w-7 h-7 mr-2.5 text-amber-500 fill-amber-500/20" />
            Recommendations Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Structured action items generated from audit engine checks for{' '}
            <span className="font-bold">{activeOrg?.name}</span>
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {filteredRecs.length === 0 ? (
          <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No Matching Recommendations</h3>
            <p className="text-xs text-slate-500 mt-1">All audit tasks matching your filters are completed!</p>
          </div>
        ) : (
          filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                rec.status === 'DONE'
                  ? 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      rec.priority === 'HIGH'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    Impact: {rec.impact}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    Difficulty: {rec.difficulty}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {rec.timeEstimate}
                  </span>
                </div>

                <div className="flex items-center space-x-2 self-start md:self-auto">
                  <label className="text-[11px] font-bold text-slate-500">Status:</label>
                  <select
                    value={rec.status}
                    onChange={(e) =>
                      handleStatusUpdate(rec.id, e.target.value as Recommendation['status'])
                    }
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{rec.description}</p>
              </div>

              <div className="p-3 bg-brand-50/60 dark:bg-brand-950/40 rounded-xl border border-brand-100 dark:border-brand-900/60 flex items-start space-x-2 text-xs">
                <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-brand-800 dark:text-brand-200">Recommended Action: </span>
                  <span className="text-brand-700 dark:text-brand-300">{rec.actionableStep}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
