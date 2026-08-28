import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SymbolInfo,
  Candle,
  ContractType,
  DurationUnit,
  ProposalResponse,
  TradePosition,
  ClosedTrade,
  UserSession,
  DerivAccountInfo,
  TechnicalIndicatorState,
  BotInstance
} from '../types';
import { DERIV_MARKETS } from '../data/markets';
import { api } from '../services/api';
import { sound } from '../services/sound';

export type AppView = 'landing' | 'terminal' | 'analysis' | 'bots' | 'portfolio' | 'settings' | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

interface TradingContextType {
  // Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;

  // Market & Pricing
  markets: SymbolInfo[];
  activeMarket: SymbolInfo;
  setActiveMarket: (market: SymbolInfo) => void;
  candles: Candle[];
  livePrice: number;
  priceChange24h: number;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  chartType: 'candles' | 'line' | 'heikin_ashi';
  setChartType: (type: 'candles' | 'line' | 'heikin_ashi') => void;

  // Account & Auth
  session: UserSession | null;
  accounts: DerivAccountInfo[];
  activeAccount: DerivAccountInfo | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  switchAccount: (loginId: string) => Promise<void>;
  enableDemoMode: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  topUpDemoBalance: () => void;

  // Trading Execution
  contractType: ContractType;
  setContractType: (type: ContractType) => void;
  stake: number;
  setStake: (stake: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  durationUnit: DurationUnit;
  setDurationUnit: (unit: DurationUnit) => void;
  selectedDigit: number;
  setSelectedDigit: (digit: number) => void;
  currentProposal: ProposalResponse | null;
  isExecuting: boolean;
  executeTrade: (direction?: 'CALL' | 'PUT') => Promise<void>;
  sellPosition: (positionId: string) => Promise<void>;

  // Positions & History
  openPositions: TradePosition[];
  tradeHistory: ClosedTrade[];
  refreshPositions: () => Promise<void>;

  // Indicators State
  indicators: TechnicalIndicatorState;
  setIndicators: React.Dispatch<React.SetStateAction<TechnicalIndicatorState>>;

  // Bots
  bots: BotInstance[];
  refreshBots: () => Promise<void>;

  // Notifications & Sound
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const defaultIndicators: TechnicalIndicatorState = {
  showEma9: true,
  showEma21: true,
  showSma50: false,
  showBollinger: true,
  showRsi: true,
  showMacd: false,
  rsiPeriod: 14,
  bollingerPeriod: 20,
  bollingerStdDev: 2,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9
};

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeView, setActiveView] = useState<AppView>('landing');

  // Markets
  const [markets] = useState<SymbolInfo[]>(DERIV_MARKETS);
  const [activeMarket, setActiveMarket] = useState<SymbolInfo>(DERIV_MARKETS[0]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [livePrice, setLivePrice] = useState<number>(DERIV_MARKETS[0].basePrice);
  const [priceChange24h, setPriceChange24h] = useState<number>(DERIV_MARKETS[0].change24h);
  const [timeframe, setTimeframe] = useState<string>('1m');
  const [chartType, setChartType] = useState<'candles' | 'line' | 'heikin_ashi'>('candles');

  // Auth & Session
  const [session, setSession] = useState<UserSession | null>(null);
  const [accounts, setAccounts] = useState<DerivAccountInfo[]>([]);
  const [activeAccount, setActiveAccount] = useState<DerivAccountInfo | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Trading parameters
  const [contractType, setContractType] = useState<ContractType>('CALL');
  const [stake, setStake] = useState<number>(10);
  const [duration, setDuration] = useState<number>(5);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('t');
  const [selectedDigit, setSelectedDigit] = useState<number>(5);
  const [currentProposal, setCurrentProposal] = useState<ProposalResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Positions & History
  const [openPositions, setOpenPositions] = useState<TradePosition[]>([]);
  const [tradeHistory, setTradeHistory] = useState<ClosedTrade[]>([]);

  // Indicators
  const [indicators, setIndicators] = useState<TechnicalIndicatorState>(defaultIndicators);

  // Bots
  const [bots, setBots] = useState<BotInstance[]>([]);

  // Toasts & Audio
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch initial Auth Status
  const refreshAuth = useCallback(async () => {
    try {
      const data = await api.getAuthStatus();
      if (data && data.activeAccount) {
        setSession({
          userId: 'usr_demo_trader_001',
          isAuthenticated: data.isAuthenticated,
          isDemo: data.isDemo,
          activeAccount: data.activeAccount,
          accounts: data.accounts,
          connectionStatus: data.connectionStatus,
          latencyMs: data.latencyMs,
          serverTime: data.serverTime
        });
        setAccounts(data.accounts || []);
        setActiveAccount(data.activeAccount);
      }
    } catch (err) {
      console.warn('Auth status sync retry in progress...');
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Fetch Candles & Live Prices
  const loadCandleData = useCallback(async () => {
    try {
      const data = await api.getCandles(activeMarket.symbol, timeframe, 120);
      if (data && Array.isArray(data.candles) && data.candles.length > 0) {
        setCandles(data.candles);
        setLivePrice(data.currentPrice);
        setPriceChange24h(data.change24h);
      }
    } catch (err) {
      // transient network or reconnecting
    }
  }, [activeMarket.symbol, timeframe]);

  useEffect(() => {
    loadCandleData();
    const interval = setInterval(loadCandleData, 1000);
    return () => clearInterval(interval);
  }, [loadCandleData]);

  // Update proposal dynamically when parameters change
  useEffect(() => {
    let isMounted = true;
    const fetchProp = async () => {
      try {
        const prop = await api.getProposal({
          symbol: activeMarket.symbol,
          contractType,
          stake,
          duration,
          durationUnit,
          selectedDigit
        });
        if (isMounted && prop) {
          setCurrentProposal(prop);
        }
      } catch (err) {
        // Fallback calculation
        if (isMounted) {
          const rate = contractType === 'DIGITDIFF' ? 0.098 : 0.95;
          const net = stake * rate;
          setCurrentProposal({
            id: 'prp_local',
            symbol: activeMarket.symbol,
            contractType,
            stake,
            payout: stake + net,
            netProfit: net,
            payoutPercentage: Math.round(rate * 100),
            spot: livePrice,
            askPrice: stake
          });
        }
      }
    };

    fetchProp();
    return () => {
      isMounted = false;
    };
  }, [activeMarket.symbol, contractType, stake, duration, durationUnit, selectedDigit, livePrice]);

  // Refresh positions and history
  const refreshPositions = useCallback(async () => {
    try {
      const [posData, histData] = await Promise.all([
        api.getPositions(),
        api.getTradeHistory()
      ]);
      if (posData && Array.isArray(posData.positions)) {
        setOpenPositions(posData.positions);
        if (posData.balance !== undefined) {
          setActiveAccount(prev => prev ? { ...prev, balance: posData.balance } : null);
        }
      }
      if (histData && Array.isArray(histData.history)) {
        setTradeHistory(histData.history);
      }
    } catch (err) {
      // transient network or reconnecting
    }
  }, []);

  useEffect(() => {
    refreshPositions();
    const interval = setInterval(refreshPositions, 1000);
    return () => clearInterval(interval);
  }, [refreshPositions]);

  // Refresh bots
  const refreshBots = useCallback(async () => {
    try {
      const res = await api.getBots();
      if (res && Array.isArray(res.bots)) {
        setBots(res.bots);
      }
    } catch (err) {
      // transient network or reconnecting
    }
  }, []);

  useEffect(() => {
    refreshBots();
    const interval = setInterval(refreshBots, 3000);
    return () => clearInterval(interval);
  }, [refreshBots]);

  // Execute Trade Action
  const executeTrade = async (overrideDirection?: 'CALL' | 'PUT') => {
    if (isExecuting) return;
    setIsExecuting(true);

    const chosenType = overrideDirection || contractType;

    try {
      if (chosenType === 'CALL' || chosenType === 'HIGHER') {
        sound.playBuy();
      } else {
        sound.playSell();
      }

      const trade = await api.buyContract({
        symbol: activeMarket.symbol,
        contractType: chosenType,
        stake,
        duration,
        durationUnit,
        selectedDigit
      });

      addToast(
        'success',
        'Order Executed',
        `Bought ${chosenType} on ${activeMarket.name} (Stake: $${stake.toFixed(2)})`
      );

      await refreshPositions();
    } catch (err: any) {
      sound.playLoss();
      addToast('error', 'Execution Error', err.message || 'Trade placement failed');
    } finally {
      setIsExecuting(false);
    }
  };

  // Sell Active Position Early
  const sellPosition = async (positionId: string) => {
    try {
      sound.playClick();
      const closed = await api.sellContract(positionId);
      const profit = closed.profit || 0;
      if (profit >= 0) {
        sound.playWin();
        addToast('success', 'Position Closed', `Profit: +$${profit.toFixed(2)} USD`);
      } else {
        sound.playLoss();
        addToast('info', 'Position Closed', `Result: -$${Math.abs(profit).toFixed(2)} USD`);
      }
      await refreshPositions();
    } catch (err: any) {
      addToast('error', 'Failed to Close', err.message || 'Could not close position');
    }
  };

  // Switch Account
  const switchAccount = async (loginId: string) => {
    try {
      sound.playClick();
      const res = await api.switchAccount(loginId);
      setActiveAccount(res.activeAccount);
      addToast('info', 'Account Switched', `Active account: ${res.activeAccount.loginId}`);
      await refreshPositions();
    } catch (err: any) {
      addToast('error', 'Switch Failed', err.message);
    }
  };

  // Enable Demo Mode
  const enableDemoMode = async () => {
    try {
      sound.playClick();
      const res = await api.enableDemoMode();
      setActiveAccount(res.activeAccount);
      addToast('success', 'Demo Mode Active', 'Loaded Virtual Trading Account ($10,000 USD)');
      await refreshPositions();
    } catch (err: any) {
      addToast('error', 'Failed Demo Mode', err.message);
    }
  };

  // Logout
  const logout = async () => {
    try {
      sound.playClick();
      await api.logout();
      await refreshAuth();
      addToast('info', 'Logged Out', 'Session ended successfully');
    } catch (err: any) {
      addToast('error', 'Logout Error', err.message);
    }
  };

  // Quick Top Up Demo Funds ($1,000.00)
  const topUpDemoBalance = () => {
    sound.playWin();
    setActiveAccount(prev => prev ? { ...prev, balance: prev.balance + 1000 } : null);
    addToast('success', 'Demo Funds Added', '+$1,000.00 USD added to Demo Balance');
  };

  return (
    <TradingContext.Provider
      value={{
        activeView,
        setActiveView,
        markets,
        activeMarket,
        setActiveMarket,
        candles,
        livePrice,
        priceChange24h,
        timeframe,
        setTimeframe,
        chartType,
        setChartType,
        session,
        accounts,
        activeAccount,
        isAuthModalOpen,
        setIsAuthModalOpen,
        switchAccount,
        enableDemoMode,
        logout,
        refreshAuth,
        topUpDemoBalance,
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
        sellPosition,
        openPositions,
        tradeHistory,
        refreshPositions,
        indicators,
        setIndicators,
        bots,
        refreshBots,
        toasts,
        addToast,
        removeToast,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
