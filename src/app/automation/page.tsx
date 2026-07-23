'use client';

import React, { useState, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AppStore } from '@/services/store';
import { AutomationService } from '@/services/automation-service';
import { GbpService } from '@/services/gbp-service';
import { AutomationRule, IntegrationConnector, NotificationItem } from '@/lib/types';
import {
  Zap,
  Play,
  CheckCircle2,
  Building2,
  ToggleLeft,
  ToggleRight,
  Activity,
  Calendar,
  AlertTriangle,
  History,
  ShieldCheck,
  RefreshCw,
  Cpu,
  HelpCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';

export default function AutomationPage() {
  const { activeLocation, refreshState, activeOrg } = useOrg();
  const [runningId, setRunningId] = useState<string | null>(null);
  
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationConnector[]>([]);
  const [activityLogs, setActivityLogs] = useState<NotificationItem[]>([]);
  
  // Beautiful feedback card state
  const [executionResult, setExecutionResult] = useState<{
    ruleId: string;
    ruleName: string;
    message: string;
    details: string;
    success: boolean;
  } | null>(null);

  // Load rules and integrations
  const loadData = () => {
    if (activeLocation) {
      const rules = AppStore.getAutomations(activeLocation.id);
      setAutomations(rules);
      
      const connectors = AppStore.getIntegrations(activeLocation.id);
      // Sync Google Business Profile status with location
      const syncedConnectors = connectors.map((c) => {
        if (c.name === 'Google Business Profile') {
          return {
            ...c,
            status: (activeLocation.gbpConnected ? 'CONNECTED' : 'DISCONNECTED') as 'CONNECTED' | 'DISCONNECTED',
            lastSync: activeLocation.gbpLastPostDate
              ? `Sync: ${new Date(activeLocation.gbpLastPostDate).toLocaleDateString()}`
              : c.lastSync,
          };
        }
        return c;
      });
      setIntegrations(syncedConnectors);

      // Load automation logs
      const allNotifs = AppStore.getNotifications(activeLocation.organizationId);
      const autoLogs = allNotifs.filter(
        (n) => n.locationId === activeLocation.id && n.type === 'AUTOMATION'
      );
      setActivityLogs(autoLogs);
    }
  };

  useEffect(() => {
    loadData();
    setExecutionResult(null);
  }, [activeLocation]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl max-w-lg mx-auto mt-12 shadow-sm">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-pulse" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Location Selected</h2>
        <p className="text-xs text-slate-500 mt-2">Select a business location from the organization sidebar to configure automated local SEO triggers.</p>
      </div>
    );
  }

  // Toggle automated rule status
  const handleToggleWorkflow = (id: string) => {
    AppStore.toggleAutomation(id);
    loadData();
    refreshState();
  };

  // Run a workflow right now
  const handleRunNow = async (id: string, name: string) => {
    setRunningId(id);
    setExecutionResult(null);
    try {
      const result = await AutomationService.runAutomation(id, activeLocation);
      
      setExecutionResult({
        ruleId: id,
        ruleName: name,
        message: result.message,
        details: result.details,
        success: result.success,
      });

      // Reload lists
      loadData();
      refreshState();
    } catch (e) {
      console.error(e);
      setExecutionResult({
        ruleId: id,
        ruleName: name,
        message: 'Internal Execution Failure',
        details: 'An unexpected runtime error blocked the background process.',
        success: false,
      });
    } finally {
      setRunningId(null);
    }
  };

  // Toggle integration connector connection
  const handleToggleIntegration = async (connName: string) => {
    const updated = integrations.map((c) => {
      if (c.name === connName) {
        const isCurrentlyConnected = c.status === 'CONNECTED';
        return {
          ...c,
          status: (isCurrentlyConnected ? 'DISCONNECTED' : 'CONNECTED') as 'CONNECTED' | 'DISCONNECTED',
          lastSync: isCurrentlyConnected ? undefined : 'Live sync active',
        };
      }
      return c;
    });

    // Special behavior for Google Business Profile
    if (connName === 'Google Business Profile') {
      if (activeLocation.gbpConnected) {
        // Disconnect
        const updatedLoc = { ...activeLocation, gbpConnected: false };
        AppStore.saveLocation(updatedLoc);
      } else {
        // Connect and run verification audit
        await GbpService.connectAndSyncGbp(activeLocation.id);
      }
    }

    AppStore.saveIntegrations(activeLocation.id, updated);
    
    // Save Audit Log
    const targetStatus = integrations.find(i => i.name === connName)?.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    AppStore.saveAuditLog({
      id: `log-int-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeOrg?.users?.[0]?.id || 'usr-1',
      userName: activeOrg?.users?.[0]?.name || 'Alex Rivera',
      action: targetStatus === 'CONNECTED' ? 'CONNECT_INTEGRATION' : 'DISCONNECT_INTEGRATION',
      details: `${targetStatus === 'CONNECTED' ? 'Connected' : 'Disconnected'} integration "${connName}" for business "${activeLocation.name}".`,
      ipAddress: 'Client Console Browser',
    });

    loadData();
    refreshState();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <Zap className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400 fill-brand-600/20" />
          Automation & Integrations Control Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure background cron tasks and connect external directory APIs for <span className="font-bold text-slate-700 dark:text-slate-300">{activeLocation.name}</span>.
        </p>
      </div>

      {/* Execution Results Banner */}
      {executionResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3.5 shadow-sm animate-fadeIn ${
            executionResult.success
              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
              : 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
          }`}
          id="automation-execution-banner"
        >
          {executionResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Workflow "{executionResult.ruleName}" Completed
            </h4>
            <p className="text-slate-700 dark:text-slate-350 mt-1 font-semibold">
              {executionResult.message}
            </p>
            <div className="bg-white/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 mt-2 font-mono text-[10px] text-slate-600 dark:text-slate-400">
              {executionResult.details}
            </div>
          </div>
        </div>
      )}

      {/* Main Configurations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Column: Automations */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between font-bold text-xs text-slate-700 dark:text-slate-350">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-brand-500" />
              Automated Workflows & Triggers ({automations.length})
            </span>
            <span className="text-[10px] text-brand-600 uppercase font-black tracking-wider">Cron System Active</span>
          </div>

          <div className="space-y-3.5">
            {automations.map((rule) => (
              <div
                key={rule.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md transition-all duration-250"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center">
                      <Activity className="w-4 h-4 mr-1.5 text-brand-500 shrink-0" />
                      {rule.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>

                  <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 uppercase tracking-widest rounded shrink-0">
                    {rule.frequency}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold text-[10px] flex items-center">
                    <History className="w-3 h-3 mr-1 shrink-0" />
                    Last Checked: {rule.lastRun ? new Date(rule.lastRun).toLocaleString() : 'Never run'}
                  </span>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRunNow(rule.id, rule.name)}
                      disabled={runningId === rule.id}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 disabled:opacity-50 text-slate-750 dark:text-slate-300 rounded-lg text-[10px] font-extrabold transition-all flex items-center space-x-1 border border-slate-200/40 dark:border-slate-700/30"
                      id={`run-now-${rule.id}`}
                    >
                      <Play className={`w-3 h-3 text-brand-500 ${runningId === rule.id ? 'animate-spin' : ''}`} />
                      <span>{runningId === rule.id ? 'Running...' : 'Run Now'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleWorkflow(rule.id)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-colors focus:outline-none"
                      title={rule.status === 'ACTIVE' ? 'Pause Rule' : 'Activate Rule'}
                      id={`toggle-rule-${rule.id}`}
                    >
                      {rule.status === 'ACTIVE' ? (
                        <ToggleRight className="w-7 h-7 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Connectors */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between font-bold text-xs text-slate-700 dark:text-slate-350">
            <span>Integrations & API Channels ({integrations.length})</span>
            <span className="text-[10px] text-indigo-500 uppercase font-black tracking-wider">Sync Pipelines</span>
          </div>

          <div className="space-y-2.5">
            {integrations.map((conn) => (
              <div
                key={conn.name}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between text-xs hover:border-slate-355 dark:hover:border-slate-700 transition-all duration-200"
              >
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-slate-900 dark:text-white">{conn.name}</h4>
                  <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">{conn.category}</span>
                    {conn.status === 'CONNECTED' && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 font-extrabold flex items-center">
                          <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                          {conn.lastSync || 'Active'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleIntegration(conn.name)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[10px] border tracking-wider uppercase ${
                    conn.status === 'CONNECTED'
                      ? 'bg-emerald-50/70 border-emerald-200/50 dark:bg-emerald-950/40 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-brand-600 border-brand-700 hover:bg-brand-700 text-white shadow-sm'
                  }`}
                  id={`integration-btn-${conn.name.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {conn.status === 'CONNECTED' ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log Feed Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center">
            <History className="w-4.5 h-4.5 mr-2 text-indigo-500" />
            Automation Activity Log
          </h3>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded font-bold text-slate-500">
            Showing {activityLogs.length} recent executions
          </span>
        </div>

        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
          {activityLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No automation runs logged yet. Click "Run Now" to trigger background tasks.
            </div>
          ) : (
            activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-slate-800/80 rounded-xl text-xs flex items-start space-x-3 hover:border-slate-250 transition-all"
              >
                <div className="p-1.5 bg-brand-50 dark:bg-brand-950 text-brand-600 rounded-lg shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5 text-brand-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-850 dark:text-slate-200">
                      {log.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-405 leading-relaxed text-[11px]">
                    {log.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
