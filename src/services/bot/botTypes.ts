export type BotStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'error';

export interface BotLog {
  id: string;
  time: number;
  level: 'info' | 'trade' | 'risk' | 'error' | 'success';
  message: string;
  data?: any;
}

export interface BotStrategyTelemetry {
  botId: string;
  botName: string;
  status: BotStatus;
  symbol: string;
  symbolName: string;
  contractType: string;
  currentStake: number;
  baseStake: number;
  takeProfit: number;
  stopLoss: number;
  maxTrades: number;
  totalTrades: number;
  wonTrades: number;
  lostTrades: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  netProfit: number;
  startTime: number | null;
  endTime: number | null;
  lastTradeTime: number | null;
  activeContractId?: string;
  activeContractProposalId?: string;
  logs: BotLog[];
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
  market: string;
  contractType: string;
  defaultStake: number;
  xml: string;
}

export interface XmlValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rootsFound: {
    tradeDefinition: boolean;
    beforePurchase: boolean;
    duringPurchase: boolean;
    afterPurchase: boolean;
  };
  detectedSymbol?: string;
  detectedContractType?: string;
  detectedStake?: number;
}
