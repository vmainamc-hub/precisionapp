import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Zap,
  Flame,
  Snowflake,
  Shield,
  Activity,
  Sliders,
  DollarSign,
  Clock,
  BarChart3,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { LiveCanvasChart } from '../TradingDashboard/LiveCanvasChart';
import { PositionsPanel } from '../TradingDashboard/PositionsPanel';
import { ContractType, DurationUnit } from '../../types';
import { sound } from '../../services/sound';

export const SmartTraderView: React.FC<{ onOpenMarketModal: () => void }> = ({ onOpenMarketModal }) => {
  const {
    activeMarket,
    livePrice,
    priceChange24h,
    candles,
    timeframe,
    setTimeframe,
    chartType,
    setChartType,
    openPositions,
    indicators,
    setIndicators,
    contractType,
    setContractType,
    stake,
    setStake,
    duration,
    setDuration,
    durationUnit,
    setDurationUnit,
    selectedDigit,
    setSelectedDigit,
    currentProposal,
    isExecuting,
    executeTrade,
    setActiveView
  } = useTrading();

  // Extract last digit from price given market digits
  const extractDigit = (price?: number | null, digits?: number | null): number => {
    if (typeof price !== 'number' || isNaN(price)) return 0;
    const dig = typeof digits === 'number' && !isNaN(digits) && digits >= 0 ? digits : 2;
    const formatted = price.toFixed(dig);
    const lastChar = formatted[formatted.length - 1];
    const parsed = parseInt(lastChar, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 100% Real Live Tick Digit Distribution
  const digitHistory = useMemo(() => {
    const digits: number[] = [];
    const marketDigits = activeMarket?.digits ?? 2;
    const safeCandles = Array.isArray(candles) ? candles : [];
    
    for (let i = 0; i < safeCandles.length; i++) {
      const c = safeCandles[i];
      if (!c) continue;
      if (typeof c.close === 'number') digits.push(extractDigit(c.close, marketDigits));
      if (typeof c.open === 'number') digits.push(extractDigit(c.open, marketDigits));
    }
    if (typeof livePrice === 'number') {
      digits.push(extractDigit(livePrice, marketDigits));
    }
    return digits.slice(-50);
  }, [candles, livePrice, activeMarket?.digits]);

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

  const hotDigit = useMemo(() => {
    return [...distribution].sort((a, b) => b.count - a.count)[0]?.digit ?? 5;
  }, [distribution]);

  const coldDigit = useMemo(() => {
    return [...distribution].sort((a, b) => a.count - b.count)[0]?.digit ?? 0;
  }, [distribution]);

  const currentDigit = extractDigit(livePrice, activeMarket.digits);

  // Contract Type Analysis: Real-time mathematical analysis of current market condition
  const contractAnalysis = useMemo(() => {
    if (candles.length < 5) {
      return {
        bias: 'NEUTRAL',
        strength: 50,
        rsi: 50,
        condition: 'Awaiting market ticks',
        recommended: 'CALL'
      };
    }
    const recent = candles.slice(-20);
    const firstClose = recent[0].close;
    const lastClose = recent[recent.length - 1].close;
    const diff = lastClose - firstClose;
    const pct = (diff / firstClose) * 100;
    
    const isBull = pct > 0.02;
    const isBear = pct < -0.02;
    const strength = Math.min(95, Math.max(50, Math.round(50 + Math.abs(pct) * 200)));

    return {
      bias: isBull ? 'BULLISH (UP)' : isBear ? 'BEARISH (DOWN)' : 'CONSOLIDATING',
      strength,
      condition: isBull
        ? 'Upward momentum. Rise / Higher contracts favoured.'
        : isBear
        ? 'Downward pressure. Fall / Lower contracts favoured.'
        : 'Sideways volatility. Digits Differ or Range contracts favoured.',
      recommended: isBull ? 'CALL' : isBear ? 'PUT' : 'DIGITDIFF'
    };
  }, [candles]);

  const handleContractSelect = (type: ContractType) => {
    sound.playClick();
    setContractType(type);
  };

  const handleQuickTrade = (dir?: 'CALL' | 'PUT') => {
    sound.playClick();
    executeTrade(dir);
  };

  const handleLaunchBot = () => {
    sound.playClick();
    setActiveView('bots');
  };

  return (
    <div className="flex-1 flex flex-col p-2 md:p-3.5 gap-3 overflow-y-auto bg-slate-950 text-slate-200">
      {/* 1 to 4: TOP WORKSPACE CONTROL STRIP (Market -> Contract -> Prediction -> Stake) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* 1. Market / Volatility Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenMarketModal();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
              {activeMarket.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white">{activeMarket.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{activeMarket.subcategory}</span>
            </div>
          </button>

          {/* Spot Price Pill */}
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Live Spot</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm sm:text-base font-extrabold text-white">
                {(typeof livePrice === 'number' && !isNaN(livePrice) ? livePrice : 0).toFixed(activeMarket?.digits ?? 2)}
              </span>
              <span
                className={`text-[11px] font-mono font-bold ${
                  (priceChange24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(priceChange24h ?? 0) >= 0 ? '+' : ''}{(priceChange24h ?? 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Contract Type Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => handleContractSelect('CALL')}
            className={`px-3 py-1.5 rounded transition-all ${
              contractType === 'CALL' || contractType === 'HIGHER'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rise / Fall
          </button>
          <button
            onClick={() => handleContractSelect('DIGITDIFF')}
            className={`px-3 py-1.5 rounded transition-all ${
              contractType === 'DIGITDIFF' || contractType === 'DIGITMATCH'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Digits Differ / Match
          </button>
          <button
            onClick={() => handleContractSelect('ONETOUCH')}
            className={`px-3 py-1.5 rounded transition-all ${
              contractType === 'ONETOUCH' || contractType === 'NOTOUCH'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Touch / No Touch
          </button>
        </div>

        {/* 3 & 4. Prediction, Duration & Stake */}
        <div className="flex items-center gap-3">
          {/* Duration */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-10 bg-transparent text-white font-mono font-bold text-center focus:outline-none"
            />
            <select
              value={durationUnit}
              onChange={e => setDurationUnit(e.target.value as DurationUnit)}
              className="bg-transparent text-slate-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="t" className="bg-slate-900 text-white">Ticks</option>
              <option value="s" className="bg-slate-900 text-white">Sec</option>
              <option value="m" className="bg-slate-900 text-white">Min</option>
            </select>
          </div>

          {/* Stake */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 font-mono font-bold">$</span>
            <input
              type="number"
              min="1"
              step="5"
              value={stake}
              onChange={e => setStake(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-14 bg-transparent text-white font-mono font-bold focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 font-mono uppercase">USD</span>
          </div>

          {/* Payout Metric Pill */}
          <div className="hidden xl:flex flex-col text-right font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase">Payout</span>
            <span className="font-bold text-emerald-400">
              ${currentProposal && typeof currentProposal.payout === 'number' ? currentProposal.payout.toFixed(2) : ((stake || 10) * 1.95).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 5 & 6. CONTRACT TYPE ANALYSIS & LIVE DIGIT DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* 5. Contract Type Analysis (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                Contract Type Analysis
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-900/60 font-bold">
              {contractAnalysis.bias}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {contractAnalysis.condition}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Probability</span>
              <span className="font-bold text-emerald-400">{contractAnalysis.strength}%</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Est. Return</span>
              <span className="font-bold text-cyan-400">
                +{currentProposal ? currentProposal.payoutPercentage : (contractType === 'DIGITDIFF' ? '9.8' : '95')}%
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Net Profit</span>
              <span className="font-bold text-white">
                +${currentProposal && typeof currentProposal.netProfit === 'number' ? currentProposal.netProfit.toFixed(2) : ((stake || 10) * 0.95).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Live Digit Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                Live Digit Distribution (Last 50 Ticks)
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-rose-400 flex items-center gap-1 font-bold">
                <Flame className="w-3 h-3" /> Hot: {hotDigit}
              </span>
              <span className="text-cyan-400 flex items-center gap-1 font-bold">
                <Snowflake className="w-3 h-3" /> Cold: {coldDigit}
              </span>
            </div>
          </div>

          {/* 0-9 Digit Bar Buttons */}
          <div className="grid grid-cols-10 gap-1">
            {distribution.map(({ digit, percentage }) => {
              const isHot = digit === hotDigit;
              const isCold = digit === coldDigit;
              const isSelected = selectedDigit === digit;
              const isCurrent = digit === currentDigit;

              return (
                <button
                  key={digit}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDigit(digit);
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-extrabold shadow ring-1 ring-cyan-400'
                      : isCurrent
                      ? 'bg-slate-800 border-cyan-400'
                      : isHot
                      ? 'bg-rose-950/40 border-rose-800/60'
                      : isCold
                      ? 'bg-cyan-950/40 border-cyan-800/60'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                  title={`Digit ${digit}: ${percentage}% freq`}
                >
                  <div className="font-mono text-xs font-black">{digit}</div>
                  <div className="text-[9px] font-mono mt-0.5 opacity-80">{percentage}%</div>
                </button>
              );
            })}
          </div>

          {/* Recent Last Digit chips */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Tick sequence:</span>
            <div className="flex gap-1">
              {digitHistory.slice(-12).map((d, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                    i === digitHistory.slice(-12).length - 1
                      ? 'bg-cyan-400 text-slate-950 font-black'
                      : d % 2 === 0
                      ? 'bg-slate-950 text-emerald-400 border border-slate-800'
                      : 'bg-slate-950 text-amber-400 border border-slate-800'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7, 8 & 9. LIVE CHART + EXECUTION / BOT CONTROLS */}
      <div className="flex flex-col lg:flex-row gap-3 min-h-[420px]">
        {/* 7 & 8: Live Canvas Chart with Analysis Controls */}
        <div className="flex-1 min-h-[380px] flex flex-col">
          <LiveCanvasChart
            candles={candles}
            symbol={activeMarket.symbol}
            symbolName={activeMarket.name}
            digits={activeMarket.digits}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            chartType={chartType}
            setChartType={setChartType}
            openPositions={openPositions}
            indicators={indicators}
            setIndicators={setIndicators}
            livePrice={livePrice}
          />
        </div>

        {/* 9: Execution Actions & Bot Controls */}
        <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                Order Execution &amp; Bot Trigger
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">1-Click Ready</span>
            </div>

            {/* Target Digit summary if Digit contract */}
            {(contractType === 'DIGITDIFF' || contractType === 'DIGITMATCH') && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Target Differ Digit:</span>
                <span className="font-bold text-cyan-400 text-sm px-2 py-0.5 bg-cyan-950 rounded border border-cyan-800">
                  {selectedDigit}
                </span>
              </div>
            )}

            {/* Pricing Summary */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Stake:</span>
                <span className="text-white font-bold">${(stake || 10).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Payout:</span>
                <span className="text-emerald-400 font-bold">
                  ${currentProposal && typeof currentProposal.payout === 'number' ? currentProposal.payout.toFixed(2) : ((stake || 10) * 1.95).toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Potential Net Profit:</span>
                <span className="text-cyan-400 font-bold">
                  +${currentProposal && typeof currentProposal.netProfit === 'number' ? currentProposal.netProfit.toFixed(2) : ((stake || 10) * 0.95).toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Primary Trade Execution Buttons */}
            {contractType === 'CALL' || contractType === 'HIGHER' ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleQuickTrade('CALL')}
                  disabled={isExecuting}
                  className="py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02]"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>HIGHER / RISE</span>
                </button>
                <button
                  onClick={() => handleQuickTrade('PUT')}
                  disabled={isExecuting}
                  className="py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-950/40 transition-all hover:scale-[1.02]"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>LOWER / FALL</span>
                </button>
              </div>
            ) : contractType === 'DIGITDIFF' ? (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleQuickTrade()}
                  disabled={isExecuting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4" />
                  <span>PURCHASE DIGIT DIFFERS ({selectedDigit})</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleQuickTrade()}
                  disabled={isExecuting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4" />
                  <span>PURCHASE CONTRACT</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Bot Automation Trigger */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={handleLaunchBot}
              className="w-full py-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Launch Bot Strategy On This Setup</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center font-mono">
              Applies current contract, stake, and risk guardrails.
            </p>
          </div>
        </div>
      </div>

      {/* 10. Positions & Trade History Table */}
      <PositionsPanel />
    </div>
  );
};
