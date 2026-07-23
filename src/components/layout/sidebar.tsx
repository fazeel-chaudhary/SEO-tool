'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  Lightbulb,
  Building2,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  CreditCard,
  Globe,
  MessageSquare,
  Bell,
  Navigation,
  Users,
  Code2,
  Bot,
  FileText,
  Terminal,
  Send,
  ShieldAlert,
  X,
  LogOut,
  Clock,
} from 'lucide-react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { AuthService } from '@/services/auth-service';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { organizations, activeOrg, currentUser, setActiveOrg } = useOrg();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const openRecsCount = activeOrg
    ? AppStore.getRecommendations(activeOrg.id).filter((r) => r.status !== 'DONE').length
    : 0;

  const unreadNotifsCount = activeOrg
    ? AppStore.getNotifications(activeOrg.id).filter((n) => !n.read).length
    : 0;

  // Calculate 14-day free trial remaining days
  const getTrialDaysLeft = () => {
    if (!activeOrg?.trialStartedAt) return 14;
    const start = new Date(activeOrg.trialStartedAt).getTime();
    const now = new Date().getTime();
    const elapsedDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const remaining = 14 - elapsedDays;
    return remaining > 0 ? remaining : 0;
  };

  const trialDays = getTrialDaysLeft();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Locations',
      href: '/locations',
      icon: MapPin,
      count: activeOrg ? AppStore.getLocations(activeOrg.id).length : 0,
    },
    { label: 'AI SEO Assistant', href: '/assistant', icon: Bot },
    { label: 'Rank Tracker', href: '/rank-tracker', icon: TrendingUp },
    { label: 'Geo-Grid Heatmaps', href: '/heatmaps', icon: Navigation },
    { label: 'Directory Citations', href: '/citations', icon: Globe },
    { label: 'Citation Builder', href: '/citation-builder', icon: Send },
    { label: 'Reviews & AI Replies', href: '/reviews', icon: MessageSquare },
    { label: 'Review Request Funnels', href: '/review-campaigns', icon: MessageSquare },
    { label: 'Duplicate Suppressor', href: '/duplicate-suppressor', icon: ShieldAlert },
    { label: 'Competitor Intelligence', href: '/competitors', icon: Users },
    { label: 'Website Audit', href: '/website-audit', icon: Globe },
    { label: 'Backlinks & Outreach', href: '/backlinks', icon: Globe },
    { label: 'AI Content Studio', href: '/content-tools', icon: FileText },
    { label: 'JSON-LD Schema', href: '/schema-generator', icon: Code2 },
    { label: 'Automated Workflows', href: '/automation', icon: Zap },
    { label: 'White-Label Reports', href: '/reports', icon: FileText },
    { label: 'Developer API', href: '/developer', icon: Terminal },
    {
      label: 'Recommendations',
      href: '/recommendations',
      icon: Lightbulb,
      badge: openRecsCount > 0 ? openRecsCount : null,
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
    },
    { label: 'Billing & Plans', href: '/billing', icon: CreditCard },
  ];

  const isUserAdmin = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';
  const allNavItems = isUserAdmin
    ? [...navItems, { label: 'Admin Panel', href: '/admin', icon: ShieldCheck }]
    : navItems;

  const sidebarContent = (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full sticky top-0 transition-colors duration-200 z-30">
      {/* Brand Logo & Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 shrink-0">
          <img src="/logo.png" className="w-11 h-11 object-contain shrink-0" alt="Local SEO OS Logo" />
          <div className="flex flex-col shrink-0">
            <h1 className="font-black text-slate-900 dark:text-white leading-tight text-xs tracking-tight">
              Local<br />SEO
            </h1>
            <span className="text-[9px] uppercase tracking-wider font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap mt-1">
              Operating System
            </span>
          </div>
        </div>

        {/* Close button for mobile drawer */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 14-Day Free Trial Banner */}
      <div className="px-4 pt-3">
        <div className="p-3 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-brand-700 dark:text-brand-300 font-bold">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{trialDays} Days Free Trial Left</span>
          </div>
          <Link href="/billing" className="text-[10px] bg-brand-600 text-white font-extrabold px-2 py-0.5 rounded hover:bg-brand-700">
            Upgrade
          </Link>
        </div>
      </div>

      {/* Organization & Multi-Tenant Switcher */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
          Organization (Tenant)
        </label>
        <div className="relative">
          <select
            value={activeOrg?.id || ''}
            onChange={(e) => setActiveOrg(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-sm pr-8 appearance-none"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.type})
              </option>
            ))}
          </select>
          <Building2 className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Current User & Role Badge */}
        {currentUser && (
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[130px] font-medium">
              {currentUser.name}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold text-[10px]">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {currentUser.role}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Core OS
        </div>
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-white text-brand-700' : 'bg-amber-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : item.count !== undefined ? (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-brand-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out & Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] space-y-2">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Theme Mode</span>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
              title="Toggle Light / Dark Mode"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-600">Dark</span>
                </>
              )}
            </button>
          )}
        </div>
        <button
          onClick={() => AuthService.logout()}
          className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-all flex items-center justify-center space-x-2 text-xs"
          id="sidebar-signout-btn"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
