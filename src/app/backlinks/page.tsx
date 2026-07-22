'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/org-context';
import { Globe, Plus, Link, Send, Mail, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';

interface BacklinkOpportunity {
  site: string;
  category: 'Blogs' | 'Directories' | 'Chambers' | 'Newspapers' | 'Universities' | 'Schools' | 'Organizations';
  domainAuthority: number;
  estDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  outreachStatus: 'NOT_STARTED' | 'SENT' | 'REPLIED' | 'SECURED';
}

export default function BacklinksPage() {
  const { activeLocation } = useOrg();
  const [opportunities, setOpportunities] = useState<BacklinkOpportunity[]>([
    { site: 'austinlocalbusinessblogs.com', category: 'Blogs', domainAuthority: 42, estDifficulty: 'EASY', outreachStatus: 'NOT_STARTED' },
    { site: 'austinchamber.org', category: 'Chambers', domainAuthority: 68, estDifficulty: 'MEDIUM', outreachStatus: 'SECURED' },
    { site: 'austinchronicle.com', category: 'Newspapers', domainAuthority: 82, estDifficulty: 'HARD', outreachStatus: 'SENT' },
    { site: 'utexas.edu/local-resources', category: 'Universities', domainAuthority: 93, estDifficulty: 'HARD', outreachStatus: 'REPLIED' },
    { site: 'austinschools.org/sponsors', category: 'Schools', domainAuthority: 55, estDifficulty: 'EASY', outreachStatus: 'NOT_STARTED' },
    { site: 'centraltxnonprofits.org', category: 'Organizations', domainAuthority: 48, estDifficulty: 'EASY', outreachStatus: 'NOT_STARTED' },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [showOutreachTemplate, setShowOutreachTemplate] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Globe className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to manage local backlinks and outreach campaigns.</p>
      </div>
    );
  }

  const filteredOpps = opportunities.filter(
    (o) => activeCategory === 'ALL' || o.category === activeCategory
  );

  const handleUpdateStatus = (siteName: string, status: BacklinkOpportunity['outreachStatus']) => {
    setOpportunities(
      opportunities.map((o) => (o.site === siteName ? { ...o, outreachStatus: status } : o))
    );
  };

  const templates: Record<string, { subject: string; body: string }> = {
    Blogs: {
      subject: `Guest Post Proposal: Dental Health Trends in Austin`,
      body: `Hi Editor,\n\nI’m writing to you from ${activeLocation.name}. We love your blog covering local businesses in ${activeLocation.city}.\n\nWould you be open to a free guest post from our team about "5 Modern Dental Care Tips for Austin Families"? We’d share it with our audience too.\n\nBest,\n${activeLocation.name} team`,
    },
    Chambers: {
      subject: `Local Business Directory Listing inquiry - ${activeLocation.name}`,
      body: `Hi Chamber Team,\n\nWe recently established our verified profile at ${activeLocation.address} in ${activeLocation.city} and would love to join the local chamber listing index.\n\nPlease send us the registration form and benefits details.\n\nWarm regards,\n${activeLocation.name}`,
    },
    Newspapers: {
      subject: `Press Update: ${activeLocation.name} Expands Local Services in Austin`,
      body: `Hello Press Room,\n\nI wanted to share a quick update: ${activeLocation.name} is launching state-of-the-art dental screening technology at our Austin office (${activeLocation.address}).\n\nWould you be interested in a brief interview or sharing this press release?\n\nBest,\n${activeLocation.name}`,
    },
    Universities: {
      subject: `Resource Page Link Update: local health providers`,
      body: `Hi Alumni Resources,\n\nI noticed you maintain a page listing verified local healthcare offices for students in ${activeLocation.city}.\n\nOur clinic (${activeLocation.name}) is fully accredited and accepts student plans. Could you add us to your directory lists?\n\nThanks,\n${activeLocation.name}`,
    },
    Schools: {
      subject: `Sponsorship Request: Austin High School Athletics sponsor`,
      body: `Dear Athletic Director,\n\nAt ${activeLocation.name}, we’re proud supporters of local high school athletics. We’d love to sponsor the upcoming sports season and secure a banner link on your community partners page.\n\nPlease let us know the sponsorship levels.\n\nBest,\n${activeLocation.name}`,
    },
    Organizations: {
      subject: `Community Partnership Link opportunity`,
      body: `Hi Partnership Team,\n\nWe’re looking to support local nonprofit drives in ${activeLocation.city} this quarter. We’d love to donate and get listed on your community support registry.\n\nBest regards,\n${activeLocation.name}`,
    },
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <Link className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
          Local Backlinks & Outreach Manager
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track referring domain profiles and secure local links for <span className="font-bold">{activeLocation.name}</span>
        </p>
      </div>

      {/* Category selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-500">Filter Opportunity Categories:</span>
        <div className="flex flex-wrap gap-2 text-xs">
          {['ALL', 'Blogs', 'Directories', 'Chambers', 'Newspapers', 'Universities', 'Schools', 'Organizations'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
          Local Link Opportunities ({filteredOpps.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Opportunity Domain</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">DA Score</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Outreach Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOpps.map((opp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    {opp.site}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-500">{opp.category}</td>
                  <td className="py-3 px-4 font-bold">{opp.domainAuthority}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        opp.estDifficulty === 'EASY'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : opp.estDifficulty === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-red-100 text-red-750'
                      }`}
                    >
                      {opp.estDifficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={opp.outreachStatus}
                      onChange={(e) => handleUpdateStatus(opp.site, e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-2 font-bold focus:outline-none"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="SENT">Outreach Sent</option>
                      <option value="REPLIED">Replied</option>
                      <option value="SECURED">Link Secured</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setShowOutreachTemplate(opp.category)}
                      className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                      Get Template
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outreach Suggestions Email Template modal */}
      {showOutreachTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Outreach Suggestions — {showOutreachTemplate}
              </h3>
              <button
                onClick={() => setShowOutreachTemplate(null)}
                className="text-slate-400 font-bold hover:text-slate-650"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="font-bold text-slate-500">Subject:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {templates[showOutreachTemplate]?.subject}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="font-bold text-slate-500">Email Body Suggestion:</span>
                <textarea
                  readOnly
                  rows={8}
                  value={templates[showOutreachTemplate]?.body}
                  className="w-full bg-transparent font-medium text-slate-700 dark:text-slate-300 resize-none focus:outline-none leading-relaxed"
                />
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `Subject: ${templates[showOutreachTemplate]?.subject}\n\n${templates[showOutreachTemplate]?.body}`
                  )
                }
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                <span>{copied ? 'Copied Template!' : 'Copy Outreach Template'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
