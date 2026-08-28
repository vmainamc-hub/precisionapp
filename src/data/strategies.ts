import { BotStrategyConfig } from '../types';

export const BOT_STRATEGIES: BotStrategyConfig[] = [
  {
    id: 'martingale_trend',
    name: 'Martingale Trend Follower',
    description: 'Enters trades aligned with the EMA fast/slow trend direction. Doubles or multiplies the stake after a loss to recover drawdowns upon the next win.',
    riskLevel: 'high',
    recommendedMarkets: ['R_100', '1HZ100V', 'R_75', 'frxEURUSD'],
    defaultParams: {
      stake: 10,
      duration: 5,
      durationUnit: 't',
      contractType: 'CALL',
      martingaleMultiplier: 2.1,
      maxConsecutiveLosses: 5,
      takeProfit: 50,
      stopLoss: 100,
      trendFilterPeriod: 14
    }
  },
  {
    id: 'rsi_reversal',
    name: 'RSI Mean Reversion Scalper',
    description: 'Monitors the Relative Strength Index (14). Automatically triggers a Rise (Call) when oversold (< 30) and Fall (Put) when overbought (> 70).',
    riskLevel: 'medium',
    recommendedMarkets: ['R_50', 'R_25', 'frxGBPUSD', 'cmdGOLD'],
    defaultParams: {
      stake: 15,
      duration: 1,
      durationUnit: 'm',
      rsiOverbought: 70,
      rsiOversold: 30,
      martingaleMultiplier: 1.5,
      maxConsecutiveLosses: 4,
      takeProfit: 60,
      stopLoss: 80
    }
  },
  {
    id: 'bollinger_breakout',
    name: 'Bollinger Bandwidth Breakout',
    description: 'Detects volatility expansion when price pierces upper or lower 2.0 standard deviation bands. Rides immediate momentum candles.',
    riskLevel: 'medium',
    recommendedMarkets: ['CRASH_1000', 'BOOM_1000', 'R_100', 'cryBTCUSD'],
    defaultParams: {
      stake: 20,
      duration: 30,
      durationUnit: 's',
      period: 20,
      stdDev: 2.0,
      martingaleMultiplier: 1.8,
      maxConsecutiveLosses: 3,
      takeProfit: 100,
      stopLoss: 120
    }
  },
  {
    id: 'digit_differ',
    name: 'Synthetic Digits Differ Hunter',
    description: 'Targets synthetic indices last-digit statistical anomalies. Wins when the exit tick last digit differs from the predicted peak repetition digit.',
    riskLevel: 'low',
    recommendedMarkets: ['1HZ100V', 'R_100', 'R_75', 'R_50'],
    defaultParams: {
      stake: 25,
      duration: 1,
      durationUnit: 't',
      targetDigit: 5,
      martingaleMultiplier: 10.5,
      maxConsecutiveLosses: 2,
      takeProfit: 75,
      stopLoss: 150
    }
  },
  {
    id: 'dalembert_conservative',
    name: "D'Alembert Linear Scaler",
    description: 'Increases stake by 1 unit after a loss and decreases by 1 unit after a win. Much safer progression curve than standard exponential martingale.',
    riskLevel: 'low',
    recommendedMarkets: ['STEP_INDEX', 'frxUSDJPY', 'R_25', 'cryETHUSD'],
    defaultParams: {
      stake: 10,
      unitStep: 5,
      duration: 1,
      durationUnit: 'm',
      contractType: 'CALL',
      maxConsecutiveLosses: 6,
      takeProfit: 80,
      stopLoss: 90
    }
  }
];
