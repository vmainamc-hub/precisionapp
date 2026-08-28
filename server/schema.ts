export interface UserRecord {
  id: string;
  email: string;
  fullname: string;
  createdAt: number;
  lastLoginAt: number;
  role: 'trader' | 'admin';
}

export interface DerivAccountRecord {
  id: string;
  userId: string;
  loginId: string;
  currency: string;
  balance: number;
  isVirtual: boolean;
  tokenHash?: string;
  scopes: string[];
  createdAt: number;
  lastSyncAt: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  activeLoginId: string;
  csrfToken: string;
  pkceCodeVerifier?: string;
  pkceState?: string;
  pkceCreatedAt?: number;
  tokens?: Record<string, string>; // Map of loginId -> encrypted/server-side Deriv token
  isVirtual?: boolean;
  expiresAt: number;
  lastActiveAt?: number;
}

export interface TradeRecord {
  id: string;
  contractId: string;
  userId: string;
  accountId: string;
  symbol: string;
  contractType: string;
  stake: number;
  payout: number;
  entryPrice: number;
  exitPrice?: number;
  barrier?: number;
  multiplier?: number;
  entryTime: number;
  expiryTime: number;
  exitTime?: number;
  status: 'open' | 'won' | 'lost' | 'sold';
  profit?: number;
  isDemo: boolean;
  botId?: string;
}

export interface BotRecord {
  id: string;
  userId: string;
  accountId: string;
  name: string;
  strategyType: string;
  symbol: string;
  contractType: string;
  stake: number;
  duration: number;
  durationUnit: string;
  status: 'running' | 'paused' | 'stopped';
  isDemo: boolean;
  takeProfit: number;
  stopLoss: number;
  maxTrades: number;
  maxConsecutiveLosses: number;
  martingaleMultiplier: number;
  totalTrades: number;
  wonTrades: number;
  lostTrades: number;
  currentStake: number;
  consecutiveLosses: number;
  totalProfit: number;
  createdAt: number;
  lastRunAt?: number;
  logs: {
    id: string;
    time: number;
    level: 'info' | 'trade' | 'risk' | 'error';
    message: string;
    details?: any;
  }[];
}

export interface AuditLogRecord {
  id: string;
  timestamp: number;
  category: 'auth' | 'order' | 'bot' | 'risk' | 'system';
  action: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string;
  ipAddress?: string;
  accountId?: string;
  userId?: string;
}

export interface UserPreferencesRecord {
  userId: string;
  defaultStake: number;
  defaultDuration: number;
  defaultDurationUnit: string;
  oneClickTrading: boolean;
  soundEffects: boolean;
  chartTheme: 'dark' | 'midnight';
  showCrosshair: boolean;
  confirmOrders: boolean;
  maxDailyLoss: number;
  maxConcurrentTrades: number;
}

export interface CandleRecord {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
