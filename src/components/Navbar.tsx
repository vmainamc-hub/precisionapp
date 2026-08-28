import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Zap,
  Volume2,
  VolumeX,
  ChevronDown,
  ShieldCheck,
  Plus,
  Radio,
  User,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { sound } from '../services/sound';

export const Navbar: React.FC<{ onOpenMarketModal: () => void }> = ({ onOpenMarketModal }) => {
  const {
    activeView,
    setActiveView,
    activeMarket,
    livePrice,
    priceChange24h,
    activeAccount,
    accounts,
    switchAccount,
    topUpDemoBalance,
    setIsAuthModalOpen,
    logout,
    soundEnabled,
    setSoundEnabled
  } = useTrading();

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const formatPrice = (price: number, digits: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800/80 px-3 md:px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Market Quick Pill */}
      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('landing');
          }}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-sm tracking-tight text-white">PrecisionEdge</span>
              <span className="text-[10px] px-1 py-0.5 rounded font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block tracking-wide">Deriv Terminal</span>
          </div>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

        {/* Market Selector Pill */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenMarketModal();
          }}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 transition-colors text-left"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-xs md:text-sm text-slate-100">{activeMarket.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs md:text-sm font-bold text-white">
              {formatPrice(livePrice, activeMarket.digits)}
            </span>
            <span
              className={`text-[11px] font-mono font-medium hidden sm:inline ${
                priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {priceChange24h >= 0 ? '+' : ''}
              {priceChange24h.toFixed(2)}%
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Center Navigation Shortcuts (Tablet/Desktop) */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-900/70 p-1 rounded-lg border border-slate-800/80 text-xs">
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('terminal');
          }}
          className={`px-3 py-1 rounded font-medium transition-all ${
            activeView === 'terminal'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          Trade
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('analysis');
          }}
          className={`px-3 py-1 rounded font-medium transition-all ${
            activeView === 'analysis'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          Analysis Center
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('bots');
          }}
          className={`px-3 py-1 rounded font-medium transition-all ${
            activeView === 'bots'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          Bots Center
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('portfolio');
          }}
          className={`px-3 py-1 rounded font-medium transition-all ${
            activeView === 'portfolio'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          Portfolio
        </button>
      </div>

      {/* Account Info, Status & Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Latency & Connection Status */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800/60 font-mono">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Deriv WS</span>
          <span className="text-emerald-400 font-semibold">22ms</span>
        </div>

        {/* Audio FX Toggle */}
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            sound.playClick();
          }}
          title={soundEnabled ? 'Mute audio feedback' : 'Unmute audio feedback'}
          className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Account Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
          >
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider ${
                    activeAccount?.isVirtual
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                  }`}
                >
                  {activeAccount?.isVirtual ? 'Demo' : 'Real'}
                </span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {activeAccount?.loginId || 'VRTC984210'}
                </span>
              </div>
              <div className="font-mono text-xs md:text-sm font-bold text-emerald-400 leading-tight">
                ${activeAccount ? activeAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '10,000.00'} USD
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Account Dropdown Menu */}
          {isAccountDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 text-xs text-slate-400 border-b border-slate-800 flex justify-between items-center">
                <span>Switch Deriv Account</span>
                <span className="text-[10px] font-mono text-emerald-400">OAuth / Demo</span>
              </div>

              <div className="py-1 space-y-1">
                {accounts.map(acc => (
                  <button
                    key={acc.loginId}
                    onClick={() => {
                      switchAccount(acc.loginId);
                      setIsAccountDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded text-xs text-left transition-colors ${
                      activeAccount?.loginId === acc.loginId
                        ? 'bg-slate-800/90 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase font-bold ${
                            acc.isVirtual ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                          }`}
                        >
                          {acc.isVirtual ? 'Demo' : 'Real'}
                        </span>
                        <span>{acc.loginId}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {acc.isVirtual ? 'Virtual Account' : 'Deriv Real Account'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      ${acc.balance.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Demo Top Up Button */}
              {activeAccount?.isVirtual && (
                <button
                  onClick={() => {
                    topUpDemoBalance();
                    setIsAccountDropdownOpen(false);
                  }}
                  className="w-full mt-1.5 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add $1,000 Demo Funds</span>
                </button>
              )}

              <div className="mt-2 pt-2 border-t border-slate-800 flex gap-1">
                <button
                  onClick={() => {
                    setIsAccountDropdownOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="flex-1 px-2 py-1.5 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium transition-colors"
                >
                  Connect Deriv
                </button>
                <button
                  onClick={() => {
                    setIsAccountDropdownOpen(false);
                    logout();
                  }}
                  title="Logout"
                  className="p-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Connect Deriv CTA Button */}
        <button
          onClick={() => {
            sound.playClick();
            setIsAuthModalOpen(true);
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02]"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Connect Deriv</span>
        </button>
      </div>
    </header>
  );
};
