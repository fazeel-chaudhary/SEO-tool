'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { Security } from '@/lib/security';
import { User, Location, Citation, Keyword, Review, AiPrompt, AuditLog } from '@/lib/types';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Building,
  Globe,
  TrendingUp,
  MessageSquare,
  Bot,
  CreditCard,
  FileText,
  Activity,
  Trash2,
  Plus,
  Edit2,
  Lock,
  Database,
  CheckCircle,
  HelpCircle,
  Search,
  Check,
  RotateCw,
  Sliders,
  Settings,
  Mail,
  Zap,
} from 'lucide-react';

export default function AdminPanelPage() {
  const { currentUser, activeLocation, refreshState } = useOrg();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'businesses' | 'citations' | 'keywords' | 'reviews' | 'prompts' | 'billing' | 'security'>('overview');
  
  // Database states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [locationsList, setLocationsList] = useState<Location[]>([]);
  const [citationsList, setCitationsList] = useState<Citation[]>([]);
  const [keywordsList, setKeywordsList] = useState<Keyword[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [promptsList, setAiPrompts] = useState<AiPrompt[]>([]);
  const [auditLogsList, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Pagination limits
  const [logPage, setLogPage] = useState<number>(1);
  const logsPerPage = 5;

  // Modals / Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'MEMBER' as User['role'], organizationId: 'org-agency-1' });
  const [userErrors, setUserErrors] = useState<{ name?: string; email?: string }>({});
  
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Performance simulation states
  const [cacheClearLoading, setCacheClearLoading] = useState<boolean>(false);
  const [dbOptimizing, setDbOptimizing] = useState<boolean>(false);

  // Load all system databases
  const loadSystemDb = () => {
    setUsersList(AppStore.getUsers());
    setLocationsList(AppStore.getLocations());
    setCitationsList(AppStore.getCitations());
    setKeywordsList(AppStore.getKeywords());
    setReviewsList(AppStore.getReviews());
    setAiPrompts(AppStore.getAiPrompts());
    setAuditLogs(AppStore.getAuditLogs());
  };

  useEffect(() => {
    loadSystemDb();
  }, []);

  // Guard: Check if authorized (OWNER or ADMIN only)
  const isAuthorized = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';

  if (!isAuthorized) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl max-w-lg mx-auto mt-16 shadow-md">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="font-extrabold text-slate-900 dark:text-white text-xl">Access Denied</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Your current account role <span className="font-bold text-red-500">"{currentUser?.role || 'CLIENT_VIEWER'}"</span> lacks administrative authorization to view system logs or configurations.
        </p>
      </div>
    );
  }

  // 1. Add User logic (with sanitization & validation)
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserErrors({});
    
    // Sanitize input
    const cleanName = Security.sanitizeInput(newUser.name);
    const cleanEmail = Security.sanitizeInput(newUser.email);
    
    let hasError = false;
    const errors: { name?: string; email?: string } = {};

    if (!cleanName) {
      errors.name = 'Name is required.';
      hasError = true;
    }
    if (!Security.validateEmail(cleanEmail)) {
      errors.email = 'Please provide a valid email address.';
      hasError = true;
    }

    if (hasError) {
      setUserErrors(errors);
      return;
    }

    const createdUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: newUser.role,
      organizationId: newUser.organizationId
    };

    AppStore.saveUser(createdUser);
    
    // Audit log security transaction
    AppStore.saveAuditLog({
      id: `log-sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'CREATE_USER',
      details: `Created new user "${cleanName}" (${cleanEmail}) with role "${newUser.role}".`,
      ipAddress: 'Admin Session Panel'
    });

    setNewUser({ name: '', email: '', role: 'MEMBER', organizationId: 'org-agency-1' });
    loadSystemDb();
    refreshState();
  };

  // 2. Delete User
  const handleDeleteUser = (id: string, name: string) => {
    if (id === currentUser.id) {
      alert("Cannot delete your own administrative session.");
      return;
    }
    
    AppStore.deleteUser(id);
    
    // Audit Log
    AppStore.saveAuditLog({
      id: `log-sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'DELETE_USER',
      details: `Deleted user profile "${name}" (ID: ${id}).`,
      ipAddress: 'Admin Session Panel'
    });

    loadSystemDb();
    refreshState();
  };

  // 3. Edit Prompt template logic
  const handleStartEditPrompt = (prompt: AiPrompt) => {
    setEditingPromptId(prompt.id);
    setPromptTemplate(prompt.template);
  };

  const handleSavePrompt = (id: string) => {
    const prompt = promptsList.find(p => p.id === id);
    if (prompt) {
      const cleanTemplate = Security.sanitizeInput(promptTemplate);
      const updatedPrompt = {
        ...prompt,
        template: cleanTemplate,
        lastUpdated: new Date().toISOString()
      };
      AppStore.saveAiPrompt(updatedPrompt);
      
      // Audit log
      AppStore.saveAuditLog({
        id: `log-sec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'UPDATE_AI_PROMPT',
        details: `Updated template guidelines for Prompt engine: "${prompt.name}" (ID: ${id}).`,
        ipAddress: 'Admin Session Panel'
      });

      setEditingPromptId(null);
      loadSystemDb();
    }
  };

  // 4. Redis cache clean simulation
  const handleClearRedisCache = () => {
    setCacheClearLoading(true);
    setTimeout(() => {
      setCacheClearLoading(false);
      
      AppStore.saveAuditLog({
        id: `log-sec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'REDIS_CACHE_CLEAR',
        details: 'Flushed Redis session store cache. 4,281 cached metadata queries invalidated.',
        ipAddress: 'Internal Shell Trigger'
      });
      loadSystemDb();
      alert("Redis Cache cleared successfully. 100% database query routing active.");
    }, 1200);
  };

  // 5. Optimize Database Indexes
  const handleOptimizeDbIndexes = () => {
    setDbOptimizing(true);
    setTimeout(() => {
      setDbOptimizing(false);
      AppStore.saveAuditLog({
        id: `log-sec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'DB_INDEX_OPTIMIZE',
        details: 'Triggered PostgreSQL query optimization analyzer. Re-indexed keywords table.',
        ipAddress: 'Postgres Optimizer daemon'
      });
      loadSystemDb();
      alert("Database optimization completed. 15 indexes updated successfully.");
    }, 1500);
  };

  // Filter lists based on SearchQuery
  const filteredUsers = usersList.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLocations = locationsList.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.city.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCitations = citationsList.filter(c => c.directoryName.toLowerCase().includes(searchQuery.toLowerCase()) || c.status.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredKeywords = keywordsList.filter(k => k.term.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredReviews = reviewsList.filter(r => r.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) || (r.text && r.text.toLowerCase().includes(searchQuery.toLowerCase())));

  // Pagination for logs
  const paginatedLogs = auditLogsList.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);
  const totalLogPages = Math.ceil(auditLogsList.length / logsPerPage);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Lock className="w-7 h-7 mr-2.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10" />
            Global Admin Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Super-user environment to configure subscription templates, moderate reviews, manage security layers, and check logs.
          </p>
        </div>

        {/* Quick Search */}
        {activeTab !== 'overview' && activeTab !== 'prompts' && activeTab !== 'security' && activeTab !== 'billing' && (
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search registry records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              id="admin-search-input"
            />
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2 bg-slate-50/50 dark:bg-slate-950/20 p-1.5 rounded-xl">
        {[
          { id: 'overview', label: 'Platform Stats', icon: Activity },
          { id: 'users', label: 'Users DB', icon: Users },
          { id: 'businesses', label: 'Locations', icon: Building },
          { id: 'citations', label: 'Citations Cache', icon: Globe },
          { id: 'keywords', label: 'Keywords DB', icon: TrendingUp },
          { id: 'reviews', label: 'Reviews Mod', icon: MessageSquare },
          { id: 'prompts', label: 'AI Prompt tuning', icon: Bot },
          { id: 'billing', label: 'Billing Logs', icon: CreditCard },
          { id: 'security', label: 'Security & Logs', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-lg shrink-0 transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800'
              }`}
              id={`admin-tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
        
        {/* 1. Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pb-3">Platform Operations Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-1">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Active Users</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{usersList.length}</p>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Uptime: 99.98%
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-1">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Tracked Businesses</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{locationsList.length}</p>
                <div className="text-[10px] text-brand-600 font-bold">
                  Active tenants: {AppStore.getOrganizations().length}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-1">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Monthly Recurring Revenue</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">$14,250</p>
                <div className="text-[10px] text-emerald-600 font-bold">
                  +12.4% vs last month
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-1">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Redis Cache Uptime</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">96.8%</p>
                <div className="text-[10px] text-brand-500 font-bold">
                  Hits: 4.8M / 5M operations
                </div>
              </div>
            </div>

            {/* Performance Monitoring Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-slate-950 dark:text-slate-200 text-sm flex items-center">
                  <Database className="w-4 h-4 mr-2 text-indigo-500" />
                  Database Index Optimization health
                </h4>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl">
                    <span>Keywords Lookup Index</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold rounded text-[10px]">HEALTHY</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl">
                    <span>RankingSnapshots Partitioned Indexes</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold rounded text-[10px]">HEALTHY</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl">
                    <span>AuditResult JSON-LD fields index</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold rounded text-[10px]">RE-INDEX REQ</span>
                  </div>
                </div>
              </div>

              {/* API Load */}
              <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-slate-950 dark:text-slate-200 text-sm flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-brand-500" />
                  Live API latency
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span>GET /api/v1/rankings</span>
                    <span className="font-mono font-semibold">12ms (average)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>POST /api/v1/locations</span>
                    <span className="font-mono font-semibold">45ms (average)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Local Search Rank API Checks load</span>
                    <span className="font-mono font-semibold">1,284 requests/min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. User Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">User Registry</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Users: {filteredUsers.length}</span>
            </div>

            {/* Add User form */}
            <form onSubmit={handleAddUser} className="bg-slate-50 dark:bg-slate-950/30 p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl gap-4 grid grid-cols-1 sm:grid-cols-4 items-end">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className={`w-full p-2 border bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    userErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  id="new-user-name-input"
                />
                {userErrors.name && <span className="text-[10px] text-red-500">{userErrors.name}</span>}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                <input
                  type="text"
                  placeholder="e.g. sarah@agency.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={`w-full p-2 border bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    userErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  id="new-user-email-input"
                />
                {userErrors.email && <span className="text-[10px] text-red-500">{userErrors.email}</span>}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">System Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  id="new-user-role-select"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="OWNER">OWNER</option>
                  <option value="CLIENT_VIEWER">CLIENT_VIEWER</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1"
                id="add-user-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </form>

            {/* Users list table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-650 dark:text-slate-350">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-black">
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Email</th>
                    <th className="py-2.5">Tenant Organization</th>
                    <th className="py-2.5">Role</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{user.name}</td>
                      <td className="py-3 font-mono">{user.email}</td>
                      <td className="py-3">
                        {AppStore.getOrganization(user.organizationId)?.name || 'Default Agency'}
                      </td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Delete User"
                          id={`delete-user-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Business Locations */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Locations & GBP Status</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Locations: {filteredLocations.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-650 dark:text-slate-350">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-black">
                    <th className="py-2.5">Business Name</th>
                    <th className="py-2.5">Address</th>
                    <th className="py-2.5">Primary Category</th>
                    <th className="py-2.5">GBP Status</th>
                    <th className="py-2.5">Post Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLocations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{loc.name}</td>
                      <td className="py-3">{loc.address}, {loc.city}</td>
                      <td className="py-3 font-semibold text-brand-650">{loc.category}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${
                          loc.gbpStatus === 'SUSPENDED'
                            ? 'bg-red-50 text-red-650 dark:bg-red-950 dark:text-red-400'
                            : 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950 dark:text-emerald-400'
                        }`}>
                          {loc.gbpStatus || 'UNCONNECTED'}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{loc.gbpPostCount} posts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Citation Cache */}
        {activeTab === 'citations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Citation Directory Sync Cache</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Entries: {filteredCitations.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-650 dark:text-slate-350">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-black">
                    <th className="py-2.5">Directory</th>
                    <th className="py-2.5">NAP Details</th>
                    <th className="py-2.5">Confidence</th>
                    <th className="py-2.5">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCitations.slice(0, 8).map((cit) => (
                    <tr key={cit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{cit.directoryName}</td>
                      <td className="py-3 font-mono text-[11px] leading-relaxed">
                        {cit.napData ? `${cit.napData.name} | ${cit.napData.phone}` : 'No local NAP data cache'}
                      </td>
                      <td className="py-3 font-mono font-semibold">{cit.confidenceScore}%</td>
                      <td className="py-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
                          cit.status === 'CORRECT'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                            : cit.status === 'INCORRECT'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-red-50 text-red-650 dark:bg-red-950 dark:text-red-400'
                        }`}>
                          {cit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCitations.length > 8 && (
                <div className="text-[10px] text-slate-400 italic pt-2 text-center">
                  Citations list truncated. Use query filter to pinpoint specific records.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Keywords Database */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Global Keyword Pool</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Keywords: {filteredKeywords.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-650 dark:text-slate-350">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-black">
                    <th className="py-2.5">Term</th>
                    <th className="py-2.5">Location/City</th>
                    <th className="py-2.5">Latest Rank</th>
                    <th className="py-2.5">Ranking Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredKeywords.map((kw) => (
                    <tr key={kw.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{kw.term}</td>
                      <td className="py-3">{kw.city}</td>
                      <td className="py-3 font-mono font-bold text-brand-600">
                        {kw.latestRank ? `#${kw.latestRank}` : 'Unchecked'}
                      </td>
                      <td className={`py-3 font-mono font-bold ${
                        (kw.rankChange || 0) > 0 ? 'text-emerald-600' : (kw.rankChange || 0) < 0 ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        {(kw.rankChange || 0) > 0 ? `+${kw.rankChange}` : kw.rankChange || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Review Moderation */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Reviews Registry & Moderation</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Reviews: {filteredReviews.length}</span>
            </div>

            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div key={rev.id} className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white">{rev.reviewerName}</h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="font-semibold text-amber-500">{'★'.repeat(rev.rating)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{rev.platform}</span>
                      </div>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      rev.sentiment === 'POSITIVE'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : rev.sentiment === 'NEGATIVE'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                        : 'bg-slate-100 text-slate-650'
                    }`}>
                      {rev.sentiment}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed italic">
                    "{rev.text || 'No review text comment'}"
                  </p>

                  {rev.replyText && (
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-400">
                      <span className="font-bold text-brand-600 block text-[10px] uppercase mb-0.5">Auto-Reply Text:</span>
                      {rev.replyText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. AI Prompt Configurator */}
        {activeTab === 'prompts' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pb-3">AI Prompts Tuning</h3>
            <div className="space-y-4">
              {promptsList.map((prompt) => (
                <div key={prompt.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{prompt.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{prompt.description}</p>
                    </div>

                    {editingPromptId === prompt.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSavePrompt(prompt.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] uppercase shadow-sm"
                          id={`save-prompt-${prompt.id}`}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPromptId(null)}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditPrompt(prompt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] uppercase border border-slate-200/30 flex items-center"
                        id={`edit-prompt-${prompt.id}`}
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </button>
                    )}
                  </div>

                  {editingPromptId === prompt.id ? (
                    <textarea
                      value={promptTemplate}
                      onChange={(e) => setPromptTemplate(e.target.value)}
                      rows={5}
                      className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-[11px] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-350 whitespace-pre-wrap">
                      {prompt.template}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center justify-between font-semibold pt-1">
                    <span>Guideline Engine ID: {prompt.id}</span>
                    <span>Last Updated: {new Date(prompt.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Billing Logs */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pb-3">Billing System Gateway Logs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/20 rounded-2xl text-xs space-y-1">
                <span className="text-slate-400 font-bold">Billing Gateway Mode</span>
                <p className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">TEST_LIVE (Simulated)</p>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/20 rounded-2xl text-xs space-y-1">
                <span className="text-slate-400 font-bold">Active Subscriptions</span>
                <p className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">48 active plans</p>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/20 rounded-2xl text-xs space-y-1">
                <span className="text-slate-400 font-bold">Failed Payments (Retries)</span>
                <p className="font-mono font-extrabold text-red-500 text-sm">0 profiles flagged</p>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Simulated Payment Webhook Stream</h4>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-[10px] space-y-2 max-h-60 overflow-y-auto">
                <p className="text-slate-500">[2026-07-23T20:10:00Z] payment_webhook_received: invoice.payment_succeeded | customer_id: cus_N928103, amount: $199.00</p>
                <p className="text-slate-500">[2026-07-23T18:45:00Z] payment_webhook_received: customer.subscription_updated | plan_id: agency_tier_monthly</p>
                <p className="text-slate-500">[2026-07-23T12:00:00Z] payment_webhook_received: customer.created | email: doctor.smith@downtowndental.com</p>
              </div>
            </div>
          </div>
        )}

        {/* 9. Security & System Logs */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base border-b pb-3">Security Panel & Audit Logs</h3>
            
            {/* Action Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between bg-slate-50/40">
                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-slate-900 dark:text-white">Flush Redis Cache Memory</h4>
                  <p className="text-[10px] text-slate-400">Cleans redundant SEO crawls assets cached locally.</p>
                </div>
                <button
                  onClick={handleClearRedisCache}
                  disabled={cacheClearLoading}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow-sm disabled:opacity-50"
                  id="flush-redis-btn"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${cacheClearLoading ? 'animate-spin' : ''}`} />
                  <span>{cacheClearLoading ? 'Flushing...' : 'Flush Cache'}</span>
                </button>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between bg-slate-50/40">
                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-slate-900 dark:text-white">Re-Index DB Columns</h4>
                  <p className="text-[10px] text-slate-400">Run EXPLAIN ANALYZE index sweeps for local queries.</p>
                </div>
                <button
                  onClick={handleOptimizeDbIndexes}
                  disabled={dbOptimizing}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow-sm disabled:opacity-50"
                  id="reindex-db-btn"
                >
                  <Sliders className={`w-3.5 h-3.5 ${dbOptimizing ? 'animate-spin' : ''}`} />
                  <span>{dbOptimizing ? 'Optimizing...' : 'Optimize Index'}</span>
                </button>
              </div>
            </div>

            {/* HTTP Secure Headers Audit */}
            <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
              <h4 className="font-extrabold text-slate-950 dark:text-slate-200 text-sm flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
                Next.js HTTP Secure Headers Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {[
                  { name: 'X-Frame-Options: DENY (Anti-Clickjacking)', status: true },
                  { name: 'X-Content-Type-Options: nosniff', status: true },
                  { name: 'Content-Security-Policy (CSP) Scripts whitelist', status: true },
                  { name: 'Strict-Transport-Security (HSTS 1 Year)', status: true },
                  { name: 'X-XSS-Protection: 1; mode=block', status: true },
                  { name: 'CSRF Validation middleware', status: true },
                ].map((header, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-850 dark:text-slate-300">{header.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Paginated Audit Logs Feed */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">System Audit Logs</h4>
                <span className="text-[10px] text-slate-400 font-bold">Page {logPage} of {totalLogPages}</span>
              </div>

              <div className="space-y-3.5 font-mono text-[10px]">
                {paginatedLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1 hover:border-slate-250 transition-all">
                    <div className="flex justify-between items-center text-slate-400 font-semibold">
                      <span>[{new Date(log.timestamp).toLocaleString()}] {log.action}</span>
                      <span>IP: {log.ipAddress}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">
                      User <span className="font-bold text-brand-600">"{log.userName}"</span>: {log.details}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="flex justify-center space-x-2 pt-2">
                <button
                  disabled={logPage === 1}
                  onClick={() => setLogPage(logPage - 1)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg disabled:opacity-50"
                  id="admin-logs-prev-btn"
                >
                  Prev
                </button>
                <button
                  disabled={logPage === totalLogPages}
                  onClick={() => setLogPage(logPage + 1)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg disabled:opacity-50"
                  id="admin-logs-next-btn"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
