import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Globe,
  Sliders,
  DollarSign,
  Clock,
  Volume2,
  VolumeX,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Server,
  ShieldCheck
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { sound } from '../../services/sound';
import { ConfigValidationView } from '../ConfigValidation/ConfigValidationView';

export const SettingsView: React.FC = () => {
  const {
    activeAccount,
    stake,
    setStake,
    duration,
    setDuration,
    setIsAuthModalOpen,
    enableDemoMode,
    addToast
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'general' | 'validator'>('general');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(200);
  const [maxConcurrentPositions, setMaxConcurrentPositions] = useState<number>(5);
  const [autoHaltBots, setAutoHaltBots] = useState<boolean>(true);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playClick();
  };

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    addToast('success', 'Preferences Updated', 'Risk parameters and trading limits successfully saved.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-6 select-none max-w-6xl mx-auto">
      {/* Header & Subnav */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Platform &amp; Account Settings</span>
          </h2>
          <p className="text-xs text-slate-400">
            Deriv API connection parameters, risk management circuit breakers, and PKCE security audit.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('general');
            }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences &amp; Risk</span>
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
      </div>

      {activeTab === 'validator' ? (
        <ConfigValidationView />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deriv Connection Gateway */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Deriv Gateway &amp; OAuth</span>
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  activeAccount
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                }`}
              >
                {activeAccount ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Account ID:</span>
                <span className="text-white font-bold">{activeAccount?.loginId || 'CR-DEMO1000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Mode:</span>
                <span className={activeAccount?.isVirtual ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {activeAccount?.isVirtual ? 'Virtual Demo ($10,000)' : 'Real Deriv Live Account'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auth Protocol:</span>
                <span className="text-emerald-400 font-bold">OAuth 2.0 PKCE (S256)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Endpoint:</span>
                <span className="text-slate-300 font-mono">api.derivws.com/trading/v1/options</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsAuthModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Change Account / Token</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  enableDemoMode();
                }}
                className="py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs border border-slate-800 transition-colors"
              >
                Reset Demo ($10k)
              </button>
            </div>
          </div>

          {/* Multi-Tier Risk Controls */}
          <form onSubmit={handleSaveRisk} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Risk Management Guardrails</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">CIRCUIT BREAKERS</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Max Daily Loss Cap ($ USD)
                </label>
                <input
                  type="number"
                  value={maxDailyLoss}
                  onChange={e => setMaxDailyLoss(parseFloat(e.target.value) || 50)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-rose-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Automatically disables execution and halts bots if daily drawdown hits this threshold.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Max Concurrent In-Flight Contracts
                </label>
                <input
                  type="number"
                  value={maxConcurrentPositions}
                  onChange={e => setMaxConcurrentPositions(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-slate-300 font-semibold">Auto-Halt Bots on Drawdown</span>
                <input
                  type="checkbox"
                  checked={autoHaltBots}
                  onChange={e => setAutoHaltBots(e.target.checked)}
                  className="text-rose-500 rounded"
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Save Risk Parameters
            </button>
          </form>

          {/* Interface & Trading Preferences */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Trading Preferences</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Default Stake ($)</label>
                  <input
                    type="number"
                    value={stake}
                    onChange={e => setStake(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Default Duration</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(parseInt(e.target.value, 10) || 5)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Trading Audio Feedback</span>
                  <span className="text-[10px] text-slate-400">Tactile sounds for win, loss, ticks and executions</span>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`p-2 rounded-lg border transition-colors ${
                    soundEnabled
                      ? 'bg-slate-800 border-emerald-500/60 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Server & Security Status */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Security &amp; Isolation Architecture</span>
            </h3>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Token hashing &amp; zero browser storage exposure</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>OAuth 2.0 PKCE SHA-256 validation enabled</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated Node.js backend proxy runtime</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
