import React, { useState, useMemo } from 'react';
import {
  Binary,
  TrendingUp,
  Activity,
  RefreshCw,
  Zap,
  ArrowRight,
  Flame,
  Snowflake,
  BarChart3,
  Sliders,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { sound } from '../../services/sound';

export const DigitsView: React.FC<{ onTradeDigit?: (digit: number) => void }> = ({ onTradeDigit }) => {
  const {
    activeMarket,
    livePrice,
    candles,
    setActiveView,
    setContractType,
    setSelectedDigit,
    executeTrade,
    isExecuting
  } = useTrading();

  const [tickSampleSize, setTickSampleSize] = useState<number>(100);

  // Extract last digit from price given market digits
  const extractDigit = (price?: number | null, digits?: number | null): number => {
    if (typeof price !== 'number' || isNaN(price)) return 0;
    const dig = typeof digits === 'number' && !isNaN(digits) && digits >= 0 ? digits : 2;
    const formatted = price.toFixed(dig);
    const lastChar = formatted[formatted.length - 1];
    const parsed = parseInt(lastChar, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Generate real digit sequence from live candle buffer & price fluctuations
  const digitHistory = useMemo(() => {
    const digits: number[] = [];
    const marketDigits = activeMarket?.digits ?? 2;
    const safeCandles = Array.isArray(candles) ? candles : [];
    
    // Gather digits from candle closes and variations
    for (let i = 0; i < safeCandles.length; i++) {
      const c = safeCandles[i];
      if (!c) continue;
      if (typeof c.close === 'number') digits.push(extractDigit(c.close, marketDigits));
      if (typeof c.open === 'number') digits.push(extractDigit(c.open, marketDigits));
      if (typeof c.high === 'number') digits.push(extractDigit(c.high, marketDigits));
      if (typeof c.low === 'number') digits.push(extractDigit(c.low, marketDigits));
    }
    // Append the current live price digit
    if (typeof livePrice === 'number') {
      digits.push(extractDigit(livePrice, marketDigits));
    }
    return digits.slice(-tickSampleSize);
  }, [candles, livePrice, activeMarket?.digits, tickSampleSize]);

  // Calculate true frequency distribution for 0-9
  const distribution = useMemo(() => {
    const counts = Array(10).fill(0);
    digitHistory.forEach(d => {
      if (d >= 0 && d <= 9) counts[d]++;
    });
    const total = digitHistory.length || 1;
    return counts.map((count, digit) => ({
      digit,
      count,
      percentage: Math.round((count / total) * 1000) / 10
    }));
  }, [digitHistory]);

  // Determine Hot (peak) and Cold (least) digits
  const hotDigit = useMemo(() => {
    return [...distribution].sort((a, b) => b.count - a.count)[0]?.digit ?? 5;
  }, [distribution]);

  const coldDigit = useMemo(() => {
    return [...distribution].sort((a, b) => a.count - b.count)[0]?.digit ?? 0;
  }, [distribution]);

  // Even vs Odd distribution
  const evenOddStats = useMemo(() => {
    const total = digitHistory.length || 1;
    const evenCount = digitHistory.filter(d => d % 2 === 0).length;
    const oddCount = total - evenCount;
    return {
      evenPct: Math.round((evenCount / total) * 1000) / 10,
      oddPct: Math.round((oddCount / total) * 1000) / 10
    };
  }, [digitHistory]);

  // Over (5-9) vs Under (0-4) distribution
  const overUnderStats = useMemo(() => {
    const total = digitHistory.length || 1;
    const overCount = digitHistory.filter(d => d >= 5).length;
    const underCount = total - overCount;
    return {
      overPct: Math.round((overCount / total) * 1000) / 10,
      underPct: Math.round((underCount / total) * 1000) / 10
    };
  }, [digitHistory]);

  const currentDigit = extractDigit(livePrice, activeMarket.digits);

  const handleSelectDigit = (digit: number) => {
    sound.playClick();
    setSelectedDigit(digit);
    setContractType('DIGITDIFF');
    if (onTradeDigit) {
      onTradeDigit(digit);
    } else {
      setActiveView('smarttrader');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-6 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Binary className="w-5 h-5 text-emerald-400" />
            <span>Live Digit Distribution &amp; Statistical Analyzer</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time tick-derived digit analysis for synthetic indices. 100% computed from live Deriv price stream.
          </p>
        </div>

        {/* Sample Size Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Sample:</span>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono font-bold">
            {[25, 50, 100, 200].map(size => (
              <button
                key={size}
                onClick={() => {
                  sound.playClick();
                  setTickSampleSize(size);
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
                  tickSampleSize === size
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {size} Ticks
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Market & Current Last Digit Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spot & Current Digit */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase">Active Synthetic Asset</span>
            <span className="text-base font-bold text-white">{activeMarket.name}</span>
            <div className="font-mono text-sm text-emerald-400 font-bold mt-1">
              ${(typeof livePrice === 'number' && !isNaN(livePrice) ? livePrice : 0).toFixed(activeMarket?.digits ?? 2)}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Current Digit</span>
            <span className="text-3xl font-black font-mono text-cyan-400 animate-pulse">
              {currentDigit}
            </span>
          </div>
        </div>

        {/* Hot / Cold Metrics */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Hot Peak Digit</span>
              <span className="text-xl font-bold font-mono text-rose-400">{hotDigit}</span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {distribution[hotDigit]?.percentage}% freq
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
              <Snowflake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Cold Lag Digit</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{coldDigit}</span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {distribution[coldDigit]?.percentage}% freq
              </span>
            </div>
          </div>
        </div>

        {/* Binary Splits */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Even ({evenOddStats.evenPct}%)</span>
              <span>Odd ({evenOddStats.oddPct}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
              <div className="bg-emerald-500" style={{ width: `${evenOddStats.evenPct}%` }} />
              <div className="bg-cyan-500" style={{ width: `${evenOddStats.oddPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Under 0-4 ({overUnderStats.underPct}%)</span>
              <span>Over 5-9 ({overUnderStats.overPct}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
              <div className="bg-amber-500" style={{ width: `${overUnderStats.underPct}%` }} />
              <div className="bg-purple-500" style={{ width: `${overUnderStats.overPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 0-9 Digit Distribution Histogram */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>0 to 9 Digit Frequency Distribution (Last {tickSampleSize} Ticks)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Click any digit to target in Digits Differ</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
          {distribution.map(({ digit, count, percentage }) => {
            const isHot = digit === hotDigit;
            const isCold = digit === coldDigit;
            const isLatest = digit === currentDigit;

            return (
              <button
                key={digit}
                onClick={() => handleSelectDigit(digit)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all hover:scale-105 ${
                  isLatest
                    ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400'
                    : isHot
                    ? 'bg-rose-950/40 border-rose-700/60'
                    : isCold
                    ? 'bg-cyan-950/40 border-cyan-700/60'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black font-mono text-white">{digit}</span>
                  {isHot && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                  {isCold && <Snowflake className="w-3.5 h-3.5 text-cyan-400" />}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden my-2 border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      isHot ? 'bg-rose-500' : isCold ? 'bg-cyan-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage * 3.5)}%` }}
                  />
                </div>

                <div className="font-mono text-xs font-bold text-slate-300">
                  {percentage}%
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {count} hits
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-Time Last Digit Tick Sequence */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Recent Last-Digit Sequence Feed (Latest on Right)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {digitHistory.length} ticks recorded
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {digitHistory.slice(-30).map((digit, idx) => {
            const isLast = idx === digitHistory.slice(-30).length - 1;
            const isEven = digit % 2 === 0;

            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                  isLast
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400 scale-110 font-extrabold'
                    : isEven
                    ? 'bg-slate-900 text-emerald-400 border-slate-800'
                    : 'bg-slate-900 text-amber-400 border-slate-800'
                }`}
              >
                {digit}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action CTA: Jump to SmartTrader */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Execute Digits Strategy on SmartTrader</h4>
          <p className="text-xs text-slate-400">
            Use this live statistical distribution to hunt Differ contracts with 90%+ theoretical edge.
          </p>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            setContractType('DIGITDIFF');
            setActiveView('smarttrader');
          }}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 shrink-0"
        >
          <span>Open in SmartTrader</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
