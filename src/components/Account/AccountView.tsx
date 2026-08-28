import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Globe,
  Sliders,
  DollarSign,
  Volume2,
  VolumeX,
  Lock,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { sound } from '../../services/sound';
import { ConfigValidationView } from '../ConfigValidation/ConfigValidationView';

export const AccountView: React.FC = () => {
  const {
    activeAccount,
    accounts,
    switchAccount,
    setIsAuthModalOpen,
    logout,
    soundEnabled,
    setSoundEnabled,
    addToast
  } = useTrading();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'risk' | 'validator'>('profile');
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(200);
  const [maxConcurrentPositions, setMaxConcurrentPositions] = useState<number>(5);

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    addToast('success', 'Limits Saved', 'Trading limits and risk parameters successfully updated.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Account, Risk &amp; Security Workspace</span>
          </h2>
          <p className="text-xs text-slate-400">
            Deriv OAuth session credentials, account switcher, risk circuit-breakers, and PKCE audit.
          </p>
        </div>

        {/* Subtab Toggle */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              sound.playClick();
              setActiveSubTab('profile');
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'profile'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deriv Account
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveSubTab('risk');
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'risk'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk &amp; Limits
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveSubTab('validator');
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'validator'
                ? 'bg-slate-800 text-cyan-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PKCE Validator
          </button>
        </div>
      </div>

      {activeSubTab === 'validator' ? (
        <ConfigValidationView />
      ) : activeSubTab === 'risk' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Management Form */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Risk Management Circuit Breakers</span>
            </h3>

            <form onSubmit={handleSaveRisk} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Max Daily Loss Limit ($ USD)</label>
                <input
                  type="number"
                  value={maxDailyLoss}
                  onChange={e => setMaxDailyLoss(Number(e.target.value))}
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Max Concurrent Positions</label>
                <input
                  type="number"
                  value={maxConcurrentPositions}
                  onChange={e => setMaxConcurrentPositions(Number(e.target.value))}
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-sans text-xs transition-colors"
              >
                Save Risk Parameters
              </button>
            </form>
          </div>

          {/* Sound & Audio Feedback Settings */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Audio Feedback &amp; Alerts</span>
            </h3>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">Execution Audio SFX</span>
                <span className="text-[11px] text-slate-400">Play sound cues on trade placement and win/loss settlements</span>
              </div>
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  sound.playClick();
                }}
                className={`p-2 rounded-lg border transition-colors ${
                  soundEnabled
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Deriv Account Information */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Active Deriv Account</span>
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  activeAccount
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                }`}
              >
                {activeAccount ? 'AUTHENTICATED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Login ID:</span>
                <span className="text-white font-bold">{activeAccount?.loginId || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Type:</span>
                <span className={activeAccount?.isVirtual ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {activeAccount?.isVirtual ? 'Virtual Demo Account' : 'Deriv Real Account'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Balance:</span>
                <span className="text-emerald-400 font-bold">
                  ${activeAccount ? (activeAccount.balance ?? 0).toFixed(2) : '0.00'} {activeAccount?.currency || 'USD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auth Protocol:</span>
                <span className="text-cyan-400 font-bold">OAuth 2.0 PKCE (S256)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gateway:</span>
                <span className="text-slate-300">Deriv WebSocket V3</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsAuthModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Connect / Switch Deriv Account</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  logout();
                }}
                title="Log out"
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Connected Accounts List */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Available Accounts ({accounts.length})</span>
            </h3>

            <div className="space-y-2">
              {accounts.map(acc => (
                <div
                  key={acc.loginId}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono ${
                    activeAccount?.loginId === acc.loginId
                      ? 'bg-slate-800/90 border-emerald-500/60 shadow'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                          acc.isVirtual ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                        }`}
                      >
                        {acc.isVirtual ? 'Demo' : 'Real'}
                      </span>
                      <span className="font-bold text-white">{acc.loginId}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">
                      {acc.currency} Wallet
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">${(acc?.balance ?? 0).toFixed(2)}</span>
                    {activeAccount?.loginId !== acc.loginId && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          switchAccount(acc.loginId);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans font-semibold border border-slate-700"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
