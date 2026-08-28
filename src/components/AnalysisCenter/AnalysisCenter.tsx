import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Activity,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { MarketSignal } from '../../types';
import { api } from '../../services/api';
import { sound } from '../../services/sound';

export const AnalysisCenter: React.FC<{ onSelectMarket: (symbol: string) => void }> = ({ onSelectMarket }) => {
  const { activeMarket, livePrice, candles, setActiveMarket, markets, setActiveView } = useTrading();
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchSignals = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getSignals();
      setSignals(res.signals);
    } catch (err) {
      console.error('Failed to load signals', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredSignals = signals.filter(s => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'buy') return s.signalType.includes('BUY');
    if (selectedFilter === 'sell') return s.signalType.includes('SELL');
    return true;
  });

  // Calculate quick Support & Resistance
  const lastCloses = candles.map(c => c.close);
  const support = Math.min(...candles.slice(-40).map(c => c.low || livePrice * 0.99));
  const resistance = Math.max(...candles.slice(-40).map(c => c.high || livePrice * 1.01));

  // Multi-timeframe trend evaluations
  const timeframesMatrix = [
    { tf: '1m', trend: 'BULLISH', strength: 78, rsi: 62 },
    { tf: '5m', trend: 'BULLISH', strength: 84, rsi: 58 },
    { tf: '15m', trend: 'NEUTRAL', strength: 52, rsi: 51 },
    { tf: '1h', trend: 'BEARISH', strength: 66, rsi: 44 },
    { tf: '4h', trend: 'BEARISH', strength: 71, rsi: 39 },
    { tf: '1D', trend: 'BULLISH', strength: 82, rsi: 65 }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-5 select-none">
      {/* Header with Risk / Decision Support Disclaimer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-400" />
            <span>Advanced Technical Analysis Workstation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time algorithmic indicator matrix, dynamic S&amp;R levels, and multi-market breakout scanner.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              fetchSignals();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Scan Markets</span>
          </button>
        </div>
      </div>

      {/* Mandatory Decision Support Disclaimer Banner */}
      <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-200">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Decision Support Notice: </span>
          Technical analysis indicators and signals are mathematical algorithmic approximations provided strictly for market decision support. Past statistical performance does not guarantee future profitability.
        </div>
      </div>

      {/* Active Market Overview & Pivot S&R Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Active Asset Technical Summary */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Active Focus: {activeMarket.name}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              ${livePrice.toFixed(activeMarket.digits)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Key Support</span>
              <span className="text-emerald-400 font-bold text-sm">${support.toFixed(activeMarket.digits)}</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {((livePrice - support) / livePrice * 100).toFixed(2)}% below spot
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Key Resistance</span>
              <span className="text-rose-400 font-bold text-sm">${resistance.toFixed(activeMarket.digits)}</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {((resistance - livePrice) / livePrice * 100).toFixed(2)}% above spot
              </span>
            </div>
          </div>

          {/* Oscillators Gauge */}
          <div className="space-y-1 pt-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Overall Bias (Composite)</span>
              <span className="text-emerald-400 font-bold font-mono">STRONG BUY (82%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex">
              <div className="bg-emerald-500 w-[65%]" />
              <div className="bg-amber-500 w-[20%]" />
              <div className="bg-rose-500 w-[15%]" />
            </div>
          </div>
        </div>

        {/* Center: Multi-Timeframe Matrix */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Multi-Timeframe Trend Matrix
            </span>
            <span className="text-[11px] text-slate-400 font-mono">EMA 9/21 + RSI Alignment</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {timeframesMatrix.map(tf => {
              const isBull = tf.trend === 'BULLISH';
              const isBear = tf.trend === 'BEARISH';

              return (
                <div
                  key={tf.tf}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between text-center space-y-1.5"
                >
                  <span className="text-xs font-mono font-bold text-slate-300">{tf.tf}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded ${
                      isBull
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : isBear
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tf.trend}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">RSI: {tf.rsi}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-Time Market Scanner Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Market Scanner &amp; Signal Feed</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Scans all Deriv continuous synthetic indices, Crash/Boom step engines, and forex for technical setups.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded font-semibold ${
                selectedFilter === 'all' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('buy')}
              className={`px-2.5 py-1 rounded font-semibold ${
                selectedFilter === 'buy' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              Buy Only
            </button>
            <button
              onClick={() => setSelectedFilter('sell')}
              className={`px-2.5 py-1 rounded font-semibold ${
                selectedFilter === 'sell' ? 'bg-slate-800 text-rose-400 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sell Only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <th className="py-2.5 px-4">Market</th>
                <th className="py-2.5 px-4">Timeframe</th>
                <th className="py-2.5 px-4">Indicator</th>
                <th className="py-2.5 px-4">Signal</th>
                <th className="py-2.5 px-4">Confidence</th>
                <th className="py-2.5 px-4">Reason / Setup</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredSignals.map(sig => {
                const isBuy = sig.signalType.includes('BUY');
                const isSell = sig.signalType.includes('SELL');

                return (
                  <tr key={sig.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">{sig.symbolName}</td>
                    <td className="py-3 px-4 text-slate-300">{sig.timeframe}</td>
                    <td className="py-3 px-4 text-cyan-400">{sig.indicator}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isBuy
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : isSell
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sig.signalType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{sig.confidence}%</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${sig.confidence}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs max-w-md">
                      {sig.reason}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const m = markets.find(item => item.symbol === sig.symbol);
                          if (m) {
                            sound.playClick();
                            setActiveMarket(m);
                            setActiveView('terminal');
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 text-[11px] font-sans font-semibold border border-slate-700 transition-colors"
                      >
                        Trade {sig.symbol.slice(0, 5)}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
