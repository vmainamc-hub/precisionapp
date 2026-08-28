import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Radio,
  Binary,
  Bot,
  PieChart,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { sound } from '../../services/sound';

export const DashboardOverview: React.FC<{ onOpenMarketModal: () => void }> = ({ onOpenMarketModal }) => {
  const {
    markets,
    setActiveMarket,
    setActiveView,
    activeAccount,
    openPositions,
    tradeHistory,
    bots,
    livePrice
  } = useTrading();

  const activeBots = bots.filter(b => b.status === 'running');
  const totalVolume = tradeHistory.reduce((acc, t) => acc + t.stake, 0);
  const totalProfit = tradeHistory.reduce((acc, t) => acc + (t.profit || 0), 0);

  const handleSelectMarket = (symbol: string) => {
    sound.playClick();
    const target = markets.find(m => m.symbol === symbol);
    if (target) {
      setActiveMarket(target);
      setActiveView('smarttrader');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-6 select-none max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Market Dashboard &amp; Trading Overview</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time synthetic volatility indices, account equity telemetry, and algorithmic engines.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('smarttrader');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all hover:scale-105"
          >
            <span>Launch SmartTrader</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span className="uppercase">Account Balance</span>
            <span className={activeAccount?.isVirtual ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {activeAccount?.isVirtual ? 'DEMO' : 'REAL'}
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${(activeAccount?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs text-slate-500 font-normal">USD</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {activeAccount?.loginId || 'No Account Connected'}
          </span>
        </div>

        {/* In-Flight Active Positions */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Active Positions</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            {openPositions.length} Contracts
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            ${openPositions.reduce((acc, p) => acc + (p?.stake || 0), 0).toFixed(2)} active risk exposure
          </span>
        </div>

        {/* Realized PnL */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Realized P&amp;L</span>
          <div className={`text-2xl font-extrabold font-mono ${(totalProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(totalProfit ?? 0) >= 0 ? '+' : ''}${(totalProfit ?? 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {tradeHistory.length} total closed trades
          </span>
        </div>

        {/* Active Automated Bots */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Automated Bots</span>
          <div className="text-2xl font-extrabold font-mono text-purple-400">
            {activeBots.length} Running
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {bots.length} configured strategies
          </span>
        </div>
      </div>

      {/* Synthetic Volatility Markets Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Deriv Synthetic Volatility Indices</span>
          </h3>
          <button
            onClick={() => {
              sound.playClick();
              onOpenMarketModal();
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            View All Markets →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {markets.slice(0, 8).map(m => {
            const isPos = m.change24h >= 0;
            return (
              <div
                key={m.symbol}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">{m.subcategory}</span>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isPos
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60'
                        : 'bg-rose-950 text-rose-400 border border-rose-900/60'
                    }`}
                  >
                    {isPos ? '+' : ''}{(m?.change24h ?? 0).toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Spot Price</span>
                    <span className="font-mono text-sm font-bold text-slate-200">
                      ${(m?.basePrice ?? 0).toFixed(m?.digits ?? 2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectMarket(m.symbol)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Trade
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards: SmartTrader, Digits, Bots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('smarttrader');
          }}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">SmartTrader</h4>
          <p className="text-xs text-slate-400 mt-1">
            Unified analysis workspace with real-time contract evaluation, digit distribution, and 1-click execution.
          </p>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveView('digits');
          }}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
            <Binary className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Digits Analyzer</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 to 9 digit frequency distribution, hot/cold digit alerts, and even/odd tick telemetry.
          </p>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveView('bots');
          }}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Bots Center</h4>
          <p className="text-xs text-slate-400 mt-1">
            Automated strategy execution engines with strict risk management stop-loss and take-profit rules.
          </p>
        </button>
      </div>
    </div>
  );
};
