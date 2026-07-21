'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { NotificationItem } from '@/lib/types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  TrendingDown,
  Globe,
  Mail,
  Shield,
} from 'lucide-react';

export default function NotificationsPage() {
  const { activeOrg, refreshState } = useOrg();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (activeOrg) {
      setNotifications(AppStore.getNotifications(activeOrg.id));
    }
  }, [activeOrg]);

  const handleMarkRead = (id: string) => {
    AppStore.markNotificationRead(id);
    refreshState();
    if (activeOrg) {
      setNotifications(AppStore.getNotifications(activeOrg.id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Bell className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
            Alerts & Notification Feed
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time event notifications & email digest configuration for{' '}
            <span className="font-bold">{activeOrg?.name}</span>
          </p>
        </div>

        {/* Email Alert Preference Toggle */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm text-xs">
          <Mail className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Email Digest Alerts</span>
          <button
            onClick={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
            className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-1 ${
              emailAlertsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                emailAlertsEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">All Clear!</h3>
            <p className="text-xs text-slate-500 mt-1">No pending alerts for your organization.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.read
                  ? 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 mt-0.5">
                  {n.type === 'NEGATIVE_REVIEW' ? (
                    <MessageSquare className="w-4 h-4 text-red-500" />
                  ) : n.type === 'MISSING_CITATION' ? (
                    <Globe className="w-4 h-4 text-amber-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-brand-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
