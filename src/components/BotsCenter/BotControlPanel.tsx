import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  AlertTriangle,
  Shield,
  Zap,
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Lock,
  Activity
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { BotStrategyTelemetry, BotStatus } from '../../services/bot/botTypes';
import { sound } from '../../services/sound';

interface BotControlPanelProps {
  status: BotStatus;
  telemetry: BotStrategyTelemetry | null;
  baseStake: number;
  setBaseStake: (stake: number) => void;
  takeProfit: number;
  setTakeProfit: (tp: number) => void;
  stopLoss: number;
  setStopLoss: (sl: number) => void;
  maxTrades: number;
  setMaxTrades: (max: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const BotControlPanel: React.FC<BotControlPanelProps> = ({
  status,
  telemetry,
  baseStake,
  setBaseStake,
  takeProfit,
  setTakeProfit,
  stopLoss,
  setStopLoss,
  maxTrades,
  setMaxTrades,
  onStart,
  onPause,
  onResume,
  onStop
}) => {
  const { activeAccount, activeMarket } = useTrading();
  const [isRealConfirmOpen, setIsRealConfirmOpen] = useState(false);

  const isReal = activeAccount ? !activeAccount.isVirtual : false;
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  const totalTrades = telemetry?.totalTrades || 0;
  const wonTrades = telemetry?.wonTrades || 0;
  const lostTrades = telemetry?.lostTrades || 0;
  const netProfit = telemetry?.netProfit || 0;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(1) : '0.0';

  const handleStartClick = () => {
    sound.playClick();
    if (isReal) {
      setIsRealConfirmOpen(true);
    } else {
      onStart();
    }
  };

  const handleConfirmRealStart = () => {
    setIsRealConfirmOpen(false);
    onStart();
  };

  return (
    <div className="w-80 md:w-96 border-l border-slate-800 bg-slate-900/95 flex flex-col h-full overflow-y-auto select-none p-4 space-y-4">
      {/* Account Safety Header */}
      <div
        className={`p-3 rounded-xl border flex flex-col space-y-2 ${
          isReal
            ? 'bg-amber-950/40 border-amber-500/50'
            : 'bg-emerald-950/30 border-emerald-500/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isReal ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`text-xs font-bold font-mono uppercase ${
                isReal ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {isReal ? 'REAL MONEY ACCOUNT' : 'DEMO VIRTUAL ACCOUNT'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
            {activeAccount?.loginId || 'CR_DEMO'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Available Balance:</span>
          <span className="text-white font-bold text-sm">
            ${(activeAccount?.balance || 10000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {activeAccount?.currency || 'USD'}
          </span>
        </div>
      </div>

      {/* Target Market Overview */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Selected Asset:</span>
          <span className="text-cyan-400 font-bold font-mono">{activeMarket?.name || 'Volatility 100'}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>Contract Engine:</span>
          <span className="text-slate-200">Deriv WebSocket v3</span>
        </div>
      </div>

      {/* Risk & Parameter Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Risk Guardrails &amp; Sizing</span>
          </span>
          {isRunning && (
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              <Lock className="w-3 h-3" /> Locked while active
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Base Stake ($)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              disabled={isRunning}
              value={baseStake}
              onChange={e => setBaseStake(parseFloat(e.target.value) || 1)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Max Executions</label>
            <input
              type="number"
              min="1"
              max="500"
              disabled={isRunning}
              value={maxTrades}
              onChange={e => setMaxTrades(parseInt(e.target.value, 10) || 10)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Take-Profit ($)</label>
            <input
              type="number"
              step="1"
              min="1"
              disabled={isRunning}
              value={takeProfit}
              onChange={e => setTakeProfit(parseFloat(e.target.value) || 10)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Stop-Loss ($)</label>
            <input
              type="number"
              step="1"
              min="1"
              disabled={isRunning}
              value={stopLoss}
              onChange={e => setStopLoss(parseFloat(e.target.value) || 10)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 font-mono font-bold text-xs focus:outline-none focus:border-rose-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Execution Status & Live Metrics */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Live Telemetry</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              isRunning
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : isPaused
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block">Total Runs</span>
            <span className="text-white font-bold">{totalTrades}</span>{' '}
            <span className="text-slate-400 text-[10px]">({wonTrades}W / {lostTrades}L)</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block">Win Rate</span>
            <span className="text-white font-bold">{winRate}%</span>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-800/80 flex justify-between items-center">
            <span className="text-[11px] text-slate-400">Net Bot P/L:</span>
            <span
              className={`text-base font-bold ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-2 pt-2">
        {!isRunning && !isPaused ? (
          <button
            onClick={handleStartClick}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Run Strategy (Deriv DBot)</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {isRunning ? (
              <button
                onClick={() => {
                  sound.playClick();
                  onPause();
                }}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onResume();
                }}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onStop();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {/* Emergency Kill Switch */}
        <button
          onClick={() => {
            onStop();
          }}
          className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/50 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Square className="w-3.5 h-3.5 fill-rose-400" />
          <span>Emergency Kill Switch</span>
        </button>
      </div>

      {/* Real Account Confirmation Modal */}
      {isRealConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/60 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4 text-slate-200">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-white">Confirm Real Money Bot Execution</h3>
                <p className="text-xs text-amber-400/90 font-mono">Account ID: {activeAccount?.loginId}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Asset:</span>
                <span className="text-white font-bold">{activeMarket?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Base Stake:</span>
                <span className="text-emerald-400 font-bold">${baseStake.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Circuit Breakers:</span>
                <span className="text-white">TP +${takeProfit} / SL -${stopLoss}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Automated orders will be sent directly to Deriv API v3 with real funds. You can trigger the Emergency Stop at any time.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRealConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRealStart}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Confirm &amp; Start Real Bot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
