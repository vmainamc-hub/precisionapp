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
  Menu,
  X,
  Binary,
  Bot,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { useTrading, AppView } from '../context/TradingContext';
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
    setSoundEnabled,
    openPositions,
    bots
  } = useTrading();

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const activeBotsCount = bots.filter(b => b.status === 'running').length;

  const navLinks: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'smarttrader', label: 'SmartTrader', icon: Zap },
    { id: 'digits', label: 'Digits', icon: Binary },
    { id: 'bots', label: 'Bots', icon: Bot, badge: activeBotsCount > 0 ? activeBotsCount : undefined },
    { id: 'history', label: 'History', icon: Clock, badge: openPositions.length > 0 ? openPositions.length : undefined },
    { id: 'account', label: 'Account', icon: User }
  ];

  const formatPrice = (price?: number, digits?: number) => {
    const safeDigits = typeof digits === 'number' && !isNaN(digits) && digits >= 0 ? digits : 2;
    const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return safePrice.toLocaleString('en-US', {
      minimumFractionDigits: safeDigits,
      maximumFractionDigits: safeDigits
    });
  };

  const isNavActive = (id: AppView) => {
    if (activeView === id) return true;
    if (id === 'smarttrader' && activeView === 'terminal') return true;
    if (id === 'dashboard' && activeView === 'landing') return true;
    if (id === 'history' && activeView === 'portfolio') return true;
    if (id === 'account' && (activeView === 'settings' || activeView === 'admin')) return true;
    if (id === 'digits' && activeView === 'analysis') return true;
    return false;
  };

  const handleNavClick = (id: AppView) => {
    sound.playClick();
    setActiveView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-3 md:px-5 flex items-center justify-between z-30 select-none sticky top-0">
      {/* Brand & Market Selector */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-slate-950 font-black" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-sm tracking-tight text-white">PrecisionEdge</span>
              <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block tracking-wide">Trading Terminal</span>
          </div>
        </button>

        {/* Primary Horizontal Top Navigation (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 text-xs font-semibold">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isNavActive(link.id);

            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
                  active
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      active ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Top Right Controls & Account Info */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Deriv Connection Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Deriv WS</span>
          <span className="text-emerald-400 font-bold">22ms</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            sound.playClick();
          }}
          title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Account Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
          >
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider ${
                    activeAccount?.isVirtual
                      ? 'bg-amber-950/90 text-amber-400 border border-amber-800/60'
                      : 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/60'
                  }`}
                >
                  {activeAccount?.isVirtual ? 'Demo' : 'Real'}
                </span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {activeAccount?.loginId || 'CR-DEMO'}
                </span>
              </div>
              <div className="font-mono text-xs md:text-sm font-bold text-emerald-400 leading-tight">
                ${activeAccount ? (activeAccount.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} USD
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Account Dropdown Menu */}
          {isAccountDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 text-xs text-slate-400 border-b border-slate-800 flex justify-between items-center">
                <span>Switch Deriv Account</span>
                <span className="text-[10px] font-mono text-emerald-400">OAuth / Demo</span>
              </div>

              <div className="py-1.5 space-y-1">
                {accounts.map(acc => (
                  <button
                    key={acc.loginId}
                    onClick={() => {
                      switchAccount(acc.loginId);
                      setIsAccountDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors ${
                      activeAccount?.loginId === acc.loginId
                        ? 'bg-slate-800 text-white font-semibold'
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
                      ${(acc?.balance ?? 0).toFixed(2)}
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
                  className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add $1,000 Demo Funds</span>
                </button>
              )}

              <div className="mt-2 pt-2 border-t border-slate-800 flex gap-1.5">
                <button
                  onClick={() => {
                    setIsAccountDropdownOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="flex-1 px-2.5 py-1.5 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-colors"
                >
                  Connect Deriv
                </button>
                <button
                  onClick={() => {
                    setIsAccountDropdownOpen(false);
                    logout();
                  }}
                  title="Logout"
                  className="p-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Connect Deriv Button */}
        <button
          onClick={() => {
            sound.playClick();
            setIsAuthModalOpen(true);
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-105"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Connect Deriv</span>
        </button>

        {/* Mobile Menu Toggle (Small screens only) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 p-3 space-y-1.5 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isNavActive(link.id);

            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-slate-900 text-slate-200">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="w-full py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Connect Deriv Account</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
