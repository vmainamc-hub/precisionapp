import React, { useState, useEffect } from 'react';
import {
  Shield,
  Server,
  Activity,
  Cpu,
  Database,
  Terminal,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { SystemStatus, AuditLog } from '../../types';
import { sound } from '../../services/sound';
import { ConfigValidationView } from '../ConfigValidation/ConfigValidationView';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'validator'>('telemetry');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logFilter, setLogFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [statusRes, logsRes] = await Promise.all([
        api.getSystemStatus(),
        api.getAuditLogs()
      ]);
      setSystemStatus(statusRes);
      setLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'all') return true;
    return l.level.toLowerCase() === logFilter.toLowerCase();
  });

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Admin Foundation &amp; System Health Center</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time server telemetry, connection pools, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('telemetry');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry &amp; Logs</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('validator');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'validator'
                  ? 'bg-slate-800 text-cyan-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Config &amp; PKCE Validator</span>
            </button>
          </div>

          {activeTab === 'telemetry' && (
            <button
              onClick={() => {
                sound.playClick();
                fetchAdminData();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'validator' ? (
        <ConfigValidationView />
      ) : (
        <>
          {/* System Status Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono block uppercase">Deriv WS Latency</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  {systemStatus?.derivWsLatency || 22} ms
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {systemStatus?.serverTime ? new Date(systemStatus.serverTime).toLocaleTimeString() : 'Active'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono block uppercase">Active Market Streams</span>
              <div className="text-2xl font-extrabold font-mono text-cyan-400">
                {systemStatus?.activeMarketCount || 18} Feeds
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Continuous 1-Tick Resolution</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono block uppercase">Active Bot Instances</span>
              <div className="text-2xl font-extrabold font-mono text-amber-400">
                {systemStatus?.activeBotsCount || 0} Engines
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Server-side execution loop</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono block uppercase">In-Flight Open Contracts</span>
              <div className="text-2xl font-extrabold font-mono text-white">
                {systemStatus?.openPositionsCount || 0}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Total settled: {systemStatus?.totalTradesExecuted || 0}</span>
            </div>
          </div>

          {/* Backend Architecture & Health Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Server Environment &amp; Deriv Gateway Specs</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Node.js Engine</span>
                <span className="text-slate-200 font-bold">Node 20 LTS (V8 ESModules)</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Deriv API Gateway</span>
                <span className="text-emerald-400 font-bold">OAuth 2.0 PKCE / WS API v3</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Security Layer</span>
                <span className="text-cyan-400 font-bold">AES-GCM / SHA-256</span>
              </div>
            </div>
          </div>

          {/* Real-time System Audit Logs */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden space-y-0">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time System &amp; Security Audit Logs</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Immutable ledger of auth attempts, order routing, bot triggers, and risk alarms.
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs">
                {['all', 'info', 'warn', 'error'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2.5 py-1 rounded font-semibold uppercase text-[11px] ${
                      logFilter === lvl
                        ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 font-mono text-xs max-h-96 overflow-y-auto space-y-1.5 bg-slate-950">
              {filteredLogs.length === 0 ? (
                <div className="py-6 text-center text-slate-500">No logs found.</div>
              ) : (
                filteredLogs.map(log => {
                  const isError = log.level === 'error';
                  const isWarn = log.level === 'warn';

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 py-1 px-2 rounded hover:bg-slate-900/60 transition-colors text-[11px]"
                    >
                      <span className="text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`font-bold uppercase shrink-0 w-12 ${
                          isError ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        [{log.level}]
                      </span>
                      <span className="text-slate-300 font-bold shrink-0">{log.category}:</span>
                      <span className="text-slate-200 flex-1">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
