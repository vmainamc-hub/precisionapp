export interface SymbolInfo {
  symbol: string;
  name: string;
  category: 'synthetics' | 'forex' | 'crypto' | 'commodities';
  subcategory: string;
  basePrice: number;
  pipSize: number;
  digits: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volatility: number;
  description: string;
  isPopular?: boolean;
}

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Tick {
  symbol: string;
  price: number;
  time: number;
  change?: number;
}

export type ContractType = 
  | 'CALL' // Rise / Higher
  | 'PUT' // Fall / Lower
  | 'HIGHER'
  | 'LOWER'
  | 'ONETOUCH'
  | 'NOTOUCH'
  | 'MULTUP'
  | 'MULTDOWN'
  | 'DIGITMATCH'
  | 'DIGITDIFF';

export type DurationUnit = 't' | 's' | 'm' | 'h' | 'd';

export interface ProposalRequest {
  symbol: string;
  contractType: ContractType;
  stake: number;
  duration: number;
  durationUnit: DurationUnit;
  barrier?: number;
  multiplier?: number;
  selectedDigit?: number;
  proposalId?: string;
  accountId?: string;
}

export interface ProposalResponse {
  id: string;
  symbol: string;
  contractType: ContractType;
  stake: number;
  payout: number;
  netProfit: number;
  payoutPercentage: number;
  spot: number;
  barrier?: number;
  askPrice: number;
}

export interface TradePosition {
  id: string;
  contractId: string;
  accountId: string;
  symbol: string;
  contractType: ContractType;
  stake: number;
  payout: number;
  entryPrice: number;
  currentPrice: number;
  barrier?: number;
  multiplier?: number;
  entryTime: number;
  expiryTime: number;
  remainingSeconds: number;
  status: 'open' | 'won' | 'lost' | 'sold';
  currentProfit: number;
  profitPercentage: number;
  isDemo: boolean;
  botId?: string;
}

export interface ClosedTrade {
  id: string;
  contractId: string;
  accountId: string;
  symbol: string;
  contractType: ContractType;
  stake: number;
  payout: number;
  entryPrice: number;
  exitPrice: number;
  barrier?: number;
  entryTime: number;
  exitTime: number;
  status: 'won' | 'lost' | 'sold';
  profit: number;
  isDemo: boolean;
  botId?: string;
  strategyName?: string;
}

export interface DerivAccountInfo {
  loginId: string;
  currency: string;
  balance: number;
  isVirtual: boolean; // Demo vs Real
  email?: string;
  fullname?: string;
  tokenType?: string;
  scopes: string[];
}

export interface UserSession {
  userId: string;
  isAuthenticated: boolean;
  isDemo: boolean;
  activeAccount: DerivAccountInfo;
  accounts: DerivAccountInfo[];
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'demo_mode';
  latencyMs: number;
  serverTime: number;
}

export type BotStrategyType = 
  | 'martingale_trend'
  | 'rsi_reversal'
  | 'bollinger_breakout'
  | 'digit_differ'
  | 'dalembert_conservative';

export interface BotStrategyConfig {
  id: BotStrategyType;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedMarkets: string[];
  defaultParams: Record<string, number | string>;
}

export interface BotInstance {
  id: string;
  name: string;
  strategyType: BotStrategyType;
  symbol: string;
  contractType: ContractType;
  stake: number;
  duration: number;
  durationUnit: DurationUnit;
  status: 'running' | 'paused' | 'stopped';
  isDemo: boolean;
  // Risk settings
  takeProfit: number;
  stopLoss: number;
  maxTrades: number;
  maxConsecutiveLosses: number;
  martingaleMultiplier: number;
  // Live stats
  totalTrades: number;
  wonTrades: number;
  lostTrades: number;
  currentStake: number;
  consecutiveLosses: number;
  totalProfit: number;
  createdAt: number;
  lastRunAt?: number;
  logs: BotLogEntry[];
}

export interface BotLogEntry {
  id: string;
  time: number;
  level: 'info' | 'trade' | 'risk' | 'error';
  message: string;
  details?: Record<string, any>;
}

export interface TechnicalIndicatorState {
  showEma9: boolean;
  showEma21: boolean;
  showSma50: boolean;
  showBollinger: boolean;
  showRsi: boolean;
  showMacd: boolean;
  rsiPeriod: number;
  bollingerPeriod: number;
  bollingerStdDev: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
}

export interface MarketSignal {
  id: string;
  symbol: string;
  symbolName: string;
  timeframe: string;
  signalType: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  indicator: string;
  reason: string;
  rsiValue: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  supportPrice: number;
  resistancePrice: number;
  timestamp: number;
}

export interface PortfolioAnalytics {
  totalBalance: number;
  totalEquity: number;
  openPositionsCount: number;
  totalTradesCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  netProfit: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
  sharpeRatio: number;
  equityHistory: { time: number; equity: number }[];
  pnlDistribution: { range: string; count: number }[];
  categoryAllocation: { category: string; value: number; percentage: number }[];
}

export interface AuditLogItem {
  id: string;
  timestamp: number;
  category: 'auth' | 'order' | 'bot' | 'risk' | 'system';
  action: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string;
  ipAddress?: string;
  accountId?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'maintenance';
  uptimeSeconds: number;
  derivWsStatus: 'connected' | 'standby_mock' | 'error';
  derivWsLatencyMs: number;
  activeSessions: number;
  activeBots: number;
  totalOrdersPlaced: number;
  memoryUsageMb: number;
  environment: 'demo' | 'production';
}

export interface SystemStatus {
  derivWsLatency: number;
  activeMarketCount: number;
  activeBotsCount: number;
  openPositionsCount: number;
  totalTradesExecuted: number;
  serverTime: number;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  level: string;
  category: string;
  message: string;
  details?: any;
}

export interface ConfigItem {
  key: string;
  name: string;
  value: string;
  status: 'configured' | 'default' | 'missing' | 'optional';
  isRequired: boolean;
  description: string;
  recommendation?: string;
}

export interface ConfigValidationResult {
  isReadyForOAuth: boolean;
  isDemoMode: boolean;
  appId: string;
  redirectUri: string;
  wsEndpoint: string;
  environment: 'demo' | 'real';
  multiUserPkceActive: boolean;
  globalTokenRequired: boolean;
  activeSessionsCount: number;
  items: ConfigItem[];
  instructions: {
    title: string;
    steps: string[];
    portalUrl: string;
  };
}

export interface DiagnosticTestResult {
  id: string;
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  latencyMs?: number;
}

export interface TradingPreferences {
  defaultStake: number;
  defaultDuration: number;
  defaultDurationUnit: DurationUnit;
  oneClickTrading: boolean;
  soundEffects: boolean;
  chartTheme: 'dark' | 'midnight';
  showCrosshair: boolean;
  confirmOrders: boolean;
  maxDailyLoss: number;
  maxConcurrentTrades: number;
}
