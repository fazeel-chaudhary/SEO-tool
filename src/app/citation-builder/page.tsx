'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { CitationSubmission } from '@/lib/types';
import { Globe, Plus, ExternalLink, CheckCircle2, Clock, Send, Building2 } from 'lucide-react';

export default function CitationBuilderPage() {
  const { activeLocation } = useOrg();
  const [submissions, setSubmissions] = useState<CitationSubmission[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [dirName, setDirName] = useState('');
  const [dirDomain, setDirDomain] = useState('');
  const [dirCategory, setDirCategory] = useState('Major Directory');

  useEffect(() => {
    if (activeLocation) {
      setSubmissions(AppStore.getCitationSubmissions(activeLocation.id));
    }
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to manage directory citation submissions.</p>
      </div>
    );
  }

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirName.trim()) return;

    const newSub: CitationSubmission = {
      id: `sub-${Date.now()}`,
      directoryName: dirName.trim(),
      domain: dirDomain.trim() || 'directory.com',
      category: dirCategory,
      submissionStatus: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      locationId: activeLocation.id,
    };

    AppStore.saveCitationSubmission(newSub);
    setSubmissions(AppStore.getCitationSubmissions(activeLocation.id));
    setShowModal(false);
    setDirName('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Globe className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Citation Builder & Submission Launcher
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated directory submissions & NAP citation push updates for{' '}
            <span className="font-bold">{activeLocation.name}</span> (Competing with BrightLocal)
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 active:scale-95 self-start sm:self-auto"
          id="new-citation-submission-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Directory Submission</span>
        </button>
      </div>

      {/* Directory Submissions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
          Active Citation Push Submissions ({submissions.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Directory Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-right">Listing Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{sub.directoryName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{sub.category}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.submissionStatus === 'LIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : sub.submissionStatus === 'IN_PROGRESS'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                      }`}
                    >
                      {sub.submissionStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {sub.liveUrl ? (
                      <a
                        href={sub.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center justify-end"
                      >
                        <span>View Listing</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Processing...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Launch Directory Submission
            </h2>

            <form onSubmit={handleCreateSubmission} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Directory Name *
                </label>
                <input
                  type="text"
                  required
                  value={dirName}
                  onChange={(e) => setDirName(e.target.value)}
                  placeholder="e.g. TripAdvisor, Foursquare"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={dirDomain}
                  onChange={(e) => setDirDomain(e.target.value)}
                  placeholder="tripadvisor.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm shadow-brand-600/20"
                >
                  Submit Citation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
