import React, { useState } from 'react';
import {
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BotStrategyTelemetry, BotLog } from '../../services/bot/botTypes';
import { sound } from '../../services/sound';

interface BotTelemetryProps {
  telemetry: BotStrategyTelemetry | null;
  onClearLogs?: () => void;
}

export const BotTelemetry: React.FC<BotTelemetryProps> = ({
  telemetry,
  onClearLogs
}) => {
  const [filter, setFilter] = useState<'all' | 'trade' | 'risk' | 'error'>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logs = telemetry?.logs || [];
  const filteredLogs = logs.filter(l => {
    if (filter === 'all') return true;
    return l.level === filter;
  });

  return (
    <div className="h-60 border-t border-slate-800 bg-slate-950 flex flex-col select-none">
      {/* Header Bar */}
      <div className="h-9 px-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Execution Telemetry &amp; Log</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded ${
                filter === 'all' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('trade')}
              className={`px-2 py-0.5 rounded ${
                filter === 'trade' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trades
            </button>
            <button
              onClick={() => setFilter('risk')}
              className={`px-2 py-0.5 rounded ${
                filter === 'risk' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-0.5 rounded ${
                filter === 'error' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Errors
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {telemetry?.activeContractId && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-[10px] text-amber-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Active Contract In-Flight</span>
            </div>
          )}

          {onClearLogs && (
            <button
              onClick={() => {
                sound.playClick();
                onClearLogs();
              }}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
              title="Clear Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Log Stream Container */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5">
        {filteredLogs.length === 0 ? (
          <div className="py-6 text-center text-slate-600 text-xs">
            Awaiting strategy initialization or next live tick signal...
          </div>
        ) : (
          filteredLogs.map(log => {
            const timeStr = new Date(log.time).toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={log.id}
                className="flex items-start gap-2 py-0.5 border-b border-slate-900/80 hover:bg-slate-900/40 px-1 rounded transition-colors"
              >
                <span className="text-slate-500 shrink-0 select-none">[{timeStr}]</span>

                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                    log.level === 'trade'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      : log.level === 'success'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                      : log.level === 'risk'
                      ? 'bg-amber-950 text-amber-400 border border-amber-900'
                      : log.level === 'error'
                      ? 'bg-rose-950 text-rose-400 border border-rose-900'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {log.level}
                </span>

                <span
                  className={`flex-1 break-all ${
                    log.level === 'trade'
                      ? 'text-emerald-300'
                      : log.level === 'success'
                      ? 'text-emerald-400 font-semibold'
                      : log.level === 'risk'
                      ? 'text-amber-300'
                      : log.level === 'error'
                      ? 'text-rose-400 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
