import { Candle, MarketSignal } from '../types';

export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  let prevEma: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    if (prevEma === null) {
      const slice = data.slice(0, period);
      const sum = slice.reduce((a, b) => a + b, 0);
      prevEma = sum / period;
      result.push(prevEma);
    } else {
      const ema = (data[i] - prevEma) * multiplier + prevEma;
      result.push(ema);
      prevEma = ema;
    }
  }
  return result;
}

export function calculateBollingerBands(
  closes: number[],
  period = 20,
  stdDevMult = 2
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = calculateSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    const ma = middle[i];
    if (ma === null || i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    const slice = closes.slice(i - period + 1, i + 1);
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - ma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    upper.push(ma + stdDev * stdDevMult);
    lower.push(ma - stdDev * stdDevMult);
  }

  return { upper, middle, lower };
}

export function calculateRSI(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (closes.length < period + 1) {
    return closes.map(() => null);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < period; i++) {
    result.push(null);
  }

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - (100 / (1 + rs)));

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - (100 / (1 + rs)));
  }

  return result;
}

export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macdLine: (number | null)[]; signalLine: (number | null)[]; histogram: (number | null)[] } {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = [];
  const rawMacdValues: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    const fast = fastEMA[i];
    const slow = slowEMA[i];
    if (fast !== null && slow !== null) {
      const val = fast - slow;
      macdLine.push(val);
      rawMacdValues.push(val);
    } else {
      macdLine.push(null);
    }
  }

  // Calculate signal line (EMA of MACD line)
  const signalEmaRaw = calculateEMA(rawMacdValues, signalPeriod);
  const signalLine: (number | null)[] = [];
  const histogram: (number | null)[] = [];

  let rawIdx = 0;
  for (let i = 0; i < closes.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
      histogram.push(null);
    } else {
      const sig = signalEmaRaw[rawIdx];
      signalLine.push(sig);
      if (sig !== null && macdLine[i] !== null) {
        histogram.push(macdLine[i]! - sig);
      } else {
        histogram.push(null);
      }
      rawIdx++;
    }
  }

  return { macdLine, signalLine, histogram };
}

export function calculateSupportResistance(candles: Candle[]): { support: number; resistance: number } {
  if (candles.length < 10) {
    const last = candles[candles.length - 1]?.close || 100;
    return { support: last * 0.98, resistance: last * 1.02 };
  }

  const highs = candles.slice(-50).map(c => c.high);
  const lows = candles.slice(-50).map(c => c.low);

  const resistance = Math.max(...highs);
  const support = Math.min(...lows);

  return { support, resistance };
}

export function generateMarketSignals(
  symbol: string,
  symbolName: string,
  candles: Candle[]
): MarketSignal[] {
  if (candles.length < 30) return [];

  const closes = candles.map(c => c.close);
  const rsi = calculateRSI(closes, 14);
  const lastRsi = rsi[rsi.length - 1] ?? 50;
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const { upper, lower } = calculateBollingerBands(closes, 20, 2);
  const { macdLine, signalLine } = calculateMACD(closes);
  const { support, resistance } = calculateSupportResistance(candles);

  const lastClose = closes[closes.length - 1];
  const lastEma9 = ema9[ema9.length - 1] ?? lastClose;
  const lastEma21 = ema21[ema21.length - 1] ?? lastClose;
  const lastUpper = upper[upper.length - 1] ?? (lastClose * 1.01);
  const lastLower = lower[lower.length - 1] ?? (lastClose * 0.99);
  const lastMacd = macdLine[macdLine.length - 1] ?? 0;
  const lastSig = signalLine[signalLine.length - 1] ?? 0;

  const signals: MarketSignal[] = [];

  // RSI Signal
  let rsiSignalType: MarketSignal['signalType'] = 'NEUTRAL';
  let rsiReason = 'RSI within balanced zone (30-70).';
  let rsiConf = 55;

  if (lastRsi < 25) {
    rsiSignalType = 'STRONG_BUY';
    rsiReason = `Deep oversold condition at RSI ${lastRsi.toFixed(1)}. Rebound probability elevated.`;
    rsiConf = 88;
  } else if (lastRsi < 35) {
    rsiSignalType = 'BUY';
    rsiReason = `Oversold territory at RSI ${lastRsi.toFixed(1)}. Buying pressure accumulating.`;
    rsiConf = 74;
  } else if (lastRsi > 75) {
    rsiSignalType = 'STRONG_SELL';
    rsiReason = `Heavy overbought condition at RSI ${lastRsi.toFixed(1)}. Exhaustion reversal expected.`;
    rsiConf = 86;
  } else if (lastRsi > 65) {
    rsiSignalType = 'SELL';
    rsiReason = `Overbought zone at RSI ${lastRsi.toFixed(1)}. Risk of immediate pullback.`;
    rsiConf = 72;
  }

  signals.push({
    id: `${symbol}-rsi-${Date.now()}`,
    symbol,
    symbolName,
    timeframe: '1m',
    signalType: rsiSignalType,
    confidence: rsiConf,
    indicator: 'RSI (14)',
    reason: rsiReason,
    rsiValue: Math.round(lastRsi * 10) / 10,
    trend: lastClose > lastEma21 ? 'bullish' : 'bearish',
    supportPrice: support,
    resistancePrice: resistance,
    timestamp: Date.now()
  });

  // EMA Crossover Signal
  let emaSignalType: MarketSignal['signalType'] = 'NEUTRAL';
  let emaReason = 'EMA 9 & EMA 21 moving in tandem.';
  let emaConf = 60;

  if (lastEma9 > lastEma21 && lastClose > lastEma9) {
    emaSignalType = 'BUY';
    emaReason = 'Bullish alignment: Price holds above EMA 9 with EMA 9 > EMA 21.';
    emaConf = 78;
  } else if (lastEma9 < lastEma21 && lastClose < lastEma9) {
    emaSignalType = 'SELL';
    emaReason = 'Bearish momentum: Price below EMA 9 with EMA 9 < EMA 21.';
    emaConf = 76;
  }

  signals.push({
    id: `${symbol}-ema-${Date.now()}`,
    symbol,
    symbolName,
    timeframe: '5m',
    signalType: emaSignalType,
    confidence: emaConf,
    indicator: 'EMA Cross (9/21)',
    reason: emaReason,
    rsiValue: Math.round(lastRsi * 10) / 10,
    trend: lastEma9 > lastEma21 ? 'bullish' : 'bearish',
    supportPrice: support,
    resistancePrice: resistance,
    timestamp: Date.now()
  });

  // Bollinger Bands Signal
  if (lastClose <= lastLower * 1.002) {
    signals.push({
      id: `${symbol}-bb-${Date.now()}`,
      symbol,
      symbolName,
      timeframe: '1m',
      signalType: 'BUY',
      confidence: 82,
      indicator: 'Bollinger Bands (20,2)',
      reason: 'Price touching Lower Bollinger Band. Mean-reversion expected toward central baseline.',
      rsiValue: Math.round(lastRsi * 10) / 10,
      trend: 'sideways',
      supportPrice: support,
      resistancePrice: resistance,
      timestamp: Date.now()
    });
  } else if (lastClose >= lastUpper * 0.998) {
    signals.push({
      id: `${symbol}-bb-${Date.now()}`,
      symbol,
      symbolName,
      timeframe: '1m',
      signalType: 'SELL',
      confidence: 80,
      indicator: 'Bollinger Bands (20,2)',
      reason: 'Price piercing Upper Bollinger Band. Reversion toward mean anticipated.',
      rsiValue: Math.round(lastRsi * 10) / 10,
      trend: 'sideways',
      supportPrice: support,
      resistancePrice: resistance,
      timestamp: Date.now()
    });
  }

  return signals;
}
