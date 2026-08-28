import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { LiveCanvasChart } from './LiveCanvasChart';
import { TradePanel } from './TradePanel';
import { PositionsPanel } from './PositionsPanel';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Flame,
  Radio,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { sound } from '../../services/sound';

export const TradingDashboard: React.FC<{ onOpenMarketModal: () => void }> = ({ onOpenMarketModal }) => {
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
    setIndicators
  } = useTrading();

  const isPositive = priceChange24h >= 0;

  return (
    <div className="flex-1 flex flex-col p-2.5 md:p-3 gap-2.5 overflow-y-auto bg-slate-950 text-slate-200">
      {/* Ticker Stats Bar */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 px-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenMarketModal();
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
              {activeMarket.symbol.slice(0, 3)}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs md:text-sm text-white">{activeMarket.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{activeMarket.subcategory}</span>
            </div>
          </button>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Live Spot Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base md:text-xl font-extrabold text-white">
              {livePrice.toLocaleString('en-US', {
                minimumFractionDigits: activeMarket.digits,
                maximumFractionDigits: activeMarket.digits
              })}
            </span>
            <span
              className={`text-xs font-mono font-bold flex items-center ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {isPositive ? '+' : ''}
              {priceChange24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 24h High/Low/Volatility details */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden md:block text-right">
            <span className="text-[10px] text-slate-400 block uppercase">24h High</span>
            <span className="text-slate-200 font-semibold">{activeMarket.high24h.toFixed(activeMarket.digits)}</span>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-[10px] text-slate-400 block uppercase">24h Low</span>
            <span className="text-slate-200 font-semibold">{activeMarket.low24h.toFixed(activeMarket.digits)}</span>
          </div>
          <div className="hidden lg:block text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Volatility Index</span>
            <span className="text-cyan-400 font-bold">{activeMarket.volatility}% Constant</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Precision</span>
            <span className="text-slate-300">{activeMarket.pipSize} Pip</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Workspace: Chart on Left, Trade Panel on Right */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2.5 min-h-[420px]">
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

        <TradePanel />
      </div>

      {/* Positions & Trade History Table */}
      <PositionsPanel />
    </div>
  );
};
