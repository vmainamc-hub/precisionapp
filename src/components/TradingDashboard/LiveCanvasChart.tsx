import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Candle,
  TradePosition,
  TechnicalIndicatorState
} from '../../types';
import {
  calculateEMA,
  calculateSMA,
  calculateBollingerBands,
  calculateRSI,
  calculateMACD
} from '../../services/chartMath';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  Activity,
  Layers
} from 'lucide-react';
import { sound } from '../../services/sound';

interface LiveCanvasChartProps {
  candles: Candle[];
  symbol: string;
  symbolName: string;
  digits: number;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  chartType: 'candles' | 'line' | 'heikin_ashi';
  setChartType: (type: 'candles' | 'line' | 'heikin_ashi') => void;
  openPositions: TradePosition[];
  indicators: TechnicalIndicatorState;
  setIndicators: React.Dispatch<React.SetStateAction<TechnicalIndicatorState>>;
  livePrice: number;
}

export const LiveCanvasChart: React.FC<LiveCanvasChartProps> = ({
  candles,
  symbol,
  symbolName,
  digits,
  timeframe,
  setTimeframe,
  chartType,
  setChartType,
  openPositions,
  indicators,
  setIndicators,
  livePrice
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(60); // number of visible candles
  const [showIndicatorMenu, setShowIndicatorMenu] = useState<boolean>(false);

  // Timeframes available
  const timeframes = ['1s', '5s', '1m', '5m', '15m', '1h', '1D'];

  // Draw chart on canvas
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (candles.length === 0) {
      ctx.restore();
      return;
    }

    // Process Heikin-Ashi if selected
    let processedCandles = [...candles];
    if (chartType === 'heikin_ashi') {
      const haCandles: Candle[] = [];
      for (let i = 0; i < candles.length; i++) {
        const curr = candles[i];
        const prev = haCandles[i - 1] || curr;
        const haClose = (curr.open + curr.high + curr.low + curr.close) / 4;
        const haOpen = i === 0 ? (curr.open + curr.close) / 2 : (prev.open + prev.close) / 2;
        const haHigh = Math.max(curr.high, haOpen, haClose);
        const haLow = Math.min(curr.low, haOpen, haClose);
        haCandles.push({ time: curr.time, open: haOpen, high: haHigh, low: haLow, close: haClose });
      }
      processedCandles = haCandles;
    }

    // Visible slice
    const visibleCandles = processedCandles.slice(-zoomLevel);
    const visibleCount = visibleCandles.length;
    if (visibleCount < 2) {
      ctx.restore();
      return;
    }

    // Layout partitions: Main chart vs Sub-indicators
    const rightMargin = 70;
    const topMargin = 25;
    const hasRsi = indicators.showRsi;
    const hasMacd = indicators.showMacd;
    const subPanelsCount = (hasRsi ? 1 : 0) + (hasMacd ? 1 : 0);
    const subPanelHeight = subPanelsCount > 0 ? Math.min(90, (height - topMargin) * 0.22) : 0;
    const mainChartHeight = height - topMargin - (subPanelsCount * subPanelHeight) - 20;
    const chartWidth = width - rightMargin;

    // Price scaling bounds
    const highs = visibleCandles.map(c => c.high);
    const lows = visibleCandles.map(c => c.low);
    let minPrice = Math.min(...lows);
    let maxPrice = Math.max(...highs);

    // Padding for price scale
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;

    const priceToY = (p: number) => {
      return topMargin + (1 - (p - minPrice) / (maxPrice - minPrice)) * mainChartHeight;
    };

    const yToPrice = (y: number) => {
      return maxPrice - ((y - topMargin) / mainChartHeight) * (maxPrice - minPrice);
    };

    const candleWidth = Math.max(2, (chartWidth / visibleCount) * 0.7);
    const candleSpacing = chartWidth / visibleCount;

    // --- 1. Draw Grid Lines ---
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;

    const safeDigits = typeof digits === 'number' && !isNaN(digits) && digits >= 0 ? digits : 2;

    // Horizontal price grid
    const priceSteps = 6;
    for (let i = 0; i <= priceSteps; i++) {
      const p = minPrice + (i / priceSteps) * (maxPrice - minPrice);
      const y = priceToY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText((p || 0).toFixed(safeDigits), chartWidth + 6, y + 3);
    }

    // Vertical time grid
    const timeSteps = 6;
    for (let i = 0; i < visibleCount; i += Math.ceil(visibleCount / timeSteps)) {
      const x = i * candleSpacing + candleSpacing / 2;
      ctx.beginPath();
      ctx.moveTo(x, topMargin);
      ctx.lineTo(x, topMargin + mainChartHeight);
      ctx.stroke();

      const time = new Date(visibleCandles[i].time * 1000);
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, topMargin + mainChartHeight + 14);
    }

    // --- 2. Technical Indicators Overlay ---
    const allCloses = processedCandles.map(c => c.close);

    // Bollinger Bands
    if (indicators.showBollinger) {
      const { upper, lower, middle } = calculateBollingerBands(allCloses, indicators.bollingerPeriod, indicators.bollingerStdDev);
      const visibleUpper = upper.slice(-zoomLevel);
      const visibleLower = lower.slice(-zoomLevel);
      const visibleMiddle = middle.slice(-zoomLevel);

      // Shaded band fill
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const u = visibleUpper[i];
        if (u !== null) {
          const x = i * candleSpacing + candleSpacing / 2;
          const y = priceToY(u);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      for (let i = visibleCount - 1; i >= 0; i--) {
        const l = visibleLower[i];
        if (l !== null) {
          const x = i * candleSpacing + candleSpacing / 2;
          const y = priceToY(l);
          ctx.lineTo(x, y);
        }
      }
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fill();

      // Middle Line
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      visibleMiddle.forEach((m, idx) => {
        if (m !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = priceToY(m);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // EMA 9 (Cyan)
    if (indicators.showEma9) {
      const ema9 = calculateEMA(allCloses, 9).slice(-zoomLevel);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ema9.forEach((v, idx) => {
        if (v !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = priceToY(v);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // EMA 21 (Amber)
    if (indicators.showEma21) {
      const ema21 = calculateEMA(allCloses, 21).slice(-zoomLevel);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ema21.forEach((v, idx) => {
        if (v !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = priceToY(v);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // SMA 50 (Purple)
    if (indicators.showSma50) {
      const sma50 = calculateSMA(allCloses, 50).slice(-zoomLevel);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      sma50.forEach((v, idx) => {
        if (v !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = priceToY(v);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // --- 3. Draw Candlesticks or Line ---
    if (chartType === 'line') {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = idx * candleSpacing + candleSpacing / 2;
        const y = priceToY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Subtle gradient below line
      ctx.lineTo((visibleCount - 1) * candleSpacing + candleSpacing / 2, topMargin + mainChartHeight);
      ctx.lineTo(candleSpacing / 2, topMargin + mainChartHeight);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, topMargin, 0, topMargin + mainChartHeight);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();
    } else {
      // Candlesticks (Standard or Heikin-Ashi)
      visibleCandles.forEach((candle, idx) => {
        const x = idx * candleSpacing + candleSpacing / 2;
        const isBullish = candle.close >= candle.open;
        const color = isBullish ? '#10b981' : '#f43f5e';

        const yOpen = priceToY(candle.open);
        const yClose = priceToY(candle.close);
        const yHigh = priceToY(candle.high);
        const yLow = priceToY(candle.low);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Body
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    }

    // --- 4. Current Live Price Horizontal Pulse Line ---
    const liveY = priceToY(livePrice);
    if (liveY >= topMargin && liveY <= topMargin + mainChartHeight) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, liveY);
      ctx.lineTo(chartWidth, liveY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Live price tag on right margin
      ctx.fillStyle = '#10b981';
      ctx.fillRect(chartWidth + 2, liveY - 9, rightMargin - 4, 18);
      ctx.fillStyle = '#020617';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText((livePrice || 0).toFixed(safeDigits), chartWidth + 6, liveY + 3.5);
    }

    // --- 5. Open Positions Overlay Lines ---
    openPositions
      .filter(p => p.symbol === symbol)
      .forEach(pos => {
        const posY = priceToY(pos.entryPrice);
        const isCall = pos.contractType === 'CALL' || pos.contractType === 'HIGHER';
        const color = isCall ? '#10b981' : '#f43f5e';

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(0, posY);
        ctx.lineTo(chartWidth, posY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Entry tag
        ctx.fillStyle = isCall ? 'rgba(16, 185, 129, 0.9)' : 'rgba(244, 63, 94, 0.9)';
        ctx.fillRect(4, posY - 8, 120, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `${pos.contractType} $${pos.stake} (${pos.remainingSeconds}s)`,
          8,
          posY + 3.5
        );
      });

    // --- 6. Sub-Panels: RSI (14) ---
    let currentSubY = topMargin + mainChartHeight + 20;

    if (hasRsi) {
      const rsiAll = calculateRSI(allCloses, indicators.rsiPeriod);
      const rsiVisible = rsiAll.slice(-zoomLevel);

      // Panel Header & Box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, currentSubY, chartWidth, subPanelHeight);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(0, currentSubY, chartWidth, subPanelHeight);

      // Levels: 70 Overbought, 30 Oversold
      const rsiToY = (v: number) => currentSubY + (1 - v / 100) * subPanelHeight;

      // 70 Line
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, rsiToY(70));
      ctx.lineTo(chartWidth, rsiToY(70));
      ctx.stroke();

      // 30 Line
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, rsiToY(30));
      ctx.lineTo(chartWidth, rsiToY(30));
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Curve
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      rsiVisible.forEach((val, idx) => {
        if (val !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = rsiToY(val);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Label
      const lastRsi = rsiVisible[rsiVisible.length - 1];
      ctx.fillStyle = '#c084fc';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`RSI (${indicators.rsiPeriod}): ${typeof lastRsi === 'number' && !isNaN(lastRsi) ? lastRsi.toFixed(1) : '--'}`, 6, currentSubY + 14);

      currentSubY += subPanelHeight + 10;
    }

    // --- 7. Sub-Panels: MACD ---
    if (hasMacd) {
      const { histogram, macdLine, signalLine } = calculateMACD(allCloses);
      const histVis = histogram.slice(-zoomLevel);
      const macdVis = macdLine.slice(-zoomLevel);
      const sigVis = signalLine.slice(-zoomLevel);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, currentSubY, chartWidth, subPanelHeight);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(0, currentSubY, chartWidth, subPanelHeight);

      const maxMacd = Math.max(0.001, ...histVis.map(v => (v !== null ? Math.abs(v) : 0)));
      const macdToY = (v: number) => currentSubY + subPanelHeight / 2 - (v / maxMacd) * (subPanelHeight * 0.4);

      // Zero line
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(0, currentSubY + subPanelHeight / 2);
      ctx.lineTo(chartWidth, currentSubY + subPanelHeight / 2);
      ctx.stroke();

      // Histogram Bars
      histVis.forEach((val, idx) => {
        if (val !== null) {
          const x = idx * candleSpacing + candleSpacing / 2;
          const yZero = currentSubY + subPanelHeight / 2;
          const y = macdToY(val);
          ctx.fillStyle = val >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(244, 63, 94, 0.7)';
          ctx.fillRect(x - candleWidth / 2, Math.min(yZero, y), candleWidth, Math.abs(y - yZero));
        }
      });

      // Label
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('MACD (12, 26, 9)', 6, currentSubY + 14);

      currentSubY += subPanelHeight + 10;
    }

    // --- 8. Crosshair & Hover Tooltip ---
    if (mousePos && mousePos.x < chartWidth && mousePos.y < topMargin + mainChartHeight) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, topMargin);
      ctx.lineTo(mousePos.x, topMargin + mainChartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price at cursor
      const cursorPrice = yToPrice(mousePos.y);
      ctx.fillStyle = '#334155';
      ctx.fillRect(chartWidth + 2, mousePos.y - 8, rightMargin - 4, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText((cursorPrice || 0).toFixed(safeDigits), chartWidth + 6, mousePos.y + 3.5);

      // Identify hovered candle
      const candleIdx = Math.floor(mousePos.x / candleSpacing);
      if (candleIdx >= 0 && candleIdx < visibleCandles.length) {
        const c = visibleCandles[candleIdx];
        setHoveredCandle(c);
      }
    } else {
      setHoveredCandle(null);
    }

    ctx.restore();
  }, [candles, zoomLevel, chartType, indicators, livePrice, openPositions, mousePos, digits, symbol]);

  // Handle Resizing
  useEffect(() => {
    const handleResize = () => {
      renderChart();
    };

    const container = containerRef.current;
    if (container) {
      const observer = new ResizeObserver(() => renderChart());
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Mouse Interaction Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-slate-950 border border-slate-800/80 rounded-lg overflow-hidden select-none relative min-h-[380px]">
      {/* Top Toolbar: Symbol, Timeframes, Chart Type, Indicators */}
      <div className="h-10 px-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 z-10 text-xs">
        {/* Left: Timeframe Switcher */}
        <div className="flex items-center gap-1">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => {
                sound.playClick();
                setTimeframe(tf);
              }}
              className={`px-2 py-1 rounded font-mono font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tf}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Chart Type Selector */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                chartType === 'candles' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                chartType === 'line' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('heikin_ashi')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                chartType === 'heikin_ashi' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Heikin
            </button>
          </div>
        </div>

        {/* Right: Indicators & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          {/* Indicators Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Indicators</span>
            </button>

            {/* Indicator Config Menu */}
            {showIndicatorMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-2.5 z-50 text-xs space-y-2 animate-in fade-in">
                <div className="font-bold text-slate-200 pb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>Overlay Indicators</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800 cursor-pointer">
                    <span className="text-cyan-400 font-mono">EMA 9 (Fast)</span>
                    <input
                      type="checkbox"
                      checked={indicators.showEma9}
                      onChange={e => setIndicators(prev => ({ ...prev, showEma9: e.target.checked }))}
                      className="text-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800 cursor-pointer">
                    <span className="text-amber-400 font-mono">EMA 21 (Slow)</span>
                    <input
                      type="checkbox"
                      checked={indicators.showEma21}
                      onChange={e => setIndicators(prev => ({ ...prev, showEma21: e.target.checked }))}
                      className="text-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800 cursor-pointer">
                    <span className="text-purple-400 font-mono">SMA 50 (Trend)</span>
                    <input
                      type="checkbox"
                      checked={indicators.showSma50}
                      onChange={e => setIndicators(prev => ({ ...prev, showSma50: e.target.checked }))}
                      className="text-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800 cursor-pointer">
                    <span className="text-blue-400 font-mono">Bollinger Bands (20,2)</span>
                    <input
                      type="checkbox"
                      checked={indicators.showBollinger}
                      onChange={e => setIndicators(prev => ({ ...prev, showBollinger: e.target.checked }))}
                      className="text-emerald-500 rounded"
                    />
                  </label>

                  <div className="pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Oscillators</span>
                    <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800 cursor-pointer">
                      <span className="text-purple-300 font-mono">RSI (14)</span>
                      <input
                        type="checkbox"
                        checked={indicators.showRsi}
                        onChange={e => setIndicators(prev => ({ ...prev, showRsi: e.target.checked }))}
                        className="text-emerald-500 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800 cursor-pointer">
                      <span className="text-sky-300 font-mono">MACD (12,26,9)</span>
                      <input
                        type="checkbox"
                        checked={indicators.showMacd}
                        onChange={e => setIndicators(prev => ({ ...prev, showMacd: e.target.checked }))}
                        className="text-emerald-500 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zoom Buttons */}
          <button
            onClick={() => setZoomLevel(prev => Math.max(20, prev - 15))}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.min(180, prev + 15))}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(60)}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* OHLC Bar Header */}
      {activeCandle && (
        <div className="absolute top-11 left-3 z-10 flex items-center gap-3 text-[11px] font-mono pointer-events-none bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-800/60 text-slate-400">
          <div><span className="text-slate-500">O:</span> <span className="text-slate-200">{(activeCandle.open ?? 0).toFixed(digits ?? 2)}</span></div>
          <div><span className="text-slate-500">H:</span> <span className="text-slate-200">{(activeCandle.high ?? 0).toFixed(digits ?? 2)}</span></div>
          <div><span className="text-slate-500">L:</span> <span className="text-slate-200">{(activeCandle.low ?? 0).toFixed(digits ?? 2)}</span></div>
          <div>
            <span className="text-slate-500">C:</span>{' '}
            <span className={(activeCandle.close ?? 0) >= (activeCandle.open ?? 0) ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {(activeCandle.close ?? 0).toFixed(digits ?? 2)}
            </span>
          </div>
          {activeCandle.volume && (
            <div><span className="text-slate-500">Vol:</span> <span className="text-slate-300">{activeCandle.volume}</span></div>
          )}
        </div>
      )}

      {/* Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full flex-1 cursor-crosshair block"
      />
    </div>
  );
};
