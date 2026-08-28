import {
  UserRecord,
  DerivAccountRecord,
  SessionRecord,
  TradeRecord,
  BotRecord,
  AuditLogRecord,
  UserPreferencesRecord
} from './schema';

class MemoryDatabase {
  users: Map<string, UserRecord> = new Map();
  accounts: Map<string, DerivAccountRecord> = new Map();
  sessions: Map<string, SessionRecord> = new Map();
  trades: Map<string, TradeRecord> = new Map();
  bots: Map<string, BotRecord> = new Map();
  auditLogs: AuditLogRecord[] = [];
  preferences: Map<string, UserPreferencesRecord> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Default Demo Trader
    const demoUser: UserRecord = {
      id: 'usr_demo_trader_001',
      email: 'demo.trader@precisionedge.io',
      fullname: 'Demo Trader',
      createdAt: Date.now() - 86400000 * 14,
      lastLoginAt: Date.now(),
      role: 'trader'
    };
    this.users.set(demoUser.id, demoUser);

    // Default Virtual / Demo Deriv Account
    const demoAccount: DerivAccountRecord = {
      id: 'acc_demo_vrtc984210',
      userId: demoUser.id,
      loginId: 'VRTC984210',
      currency: 'USD',
      balance: 10000.00,
      isVirtual: true,
      scopes: ['read', 'trade', 'trading_information', 'admin'],
      createdAt: Date.now() - 86400000 * 14,
      lastSyncAt: Date.now()
    };
    this.accounts.set(demoAccount.loginId, demoAccount);

    // Default Session
    const defaultSession: SessionRecord = {
      id: 'sess_precision_default',
      userId: demoUser.id,
      activeLoginId: demoAccount.loginId,
      csrfToken: 'csrf_' + Math.random().toString(36).substring(2),
      expiresAt: Date.now() + 86400000 * 30
    };
    this.sessions.set(defaultSession.id, defaultSession);

    // Default Preferences
    this.preferences.set(demoUser.id, {
      userId: demoUser.id,
      defaultStake: 10,
      defaultDuration: 5,
      defaultDurationUnit: 't',
      oneClickTrading: false,
      soundEffects: true,
      chartTheme: 'dark',
      showCrosshair: true,
      confirmOrders: true,
      maxDailyLoss: 250,
      maxConcurrentTrades: 5
    });

    // Seed realistic historical trades
    const seedTrades: Partial<TradeRecord>[] = [
      {
        contractId: 'cnt_894101',
        symbol: 'R_100',
        contractType: 'CALL',
        stake: 25,
        payout: 48.75,
        entryPrice: 2432.10,
        exitPrice: 2445.60,
        entryTime: Date.now() - 3600000 * 5,
        expiryTime: Date.now() - 3600000 * 5 + 60000,
        exitTime: Date.now() - 3600000 * 5 + 60000,
        status: 'won',
        profit: 23.75,
        isDemo: true
      },
      {
        contractId: 'cnt_894102',
        symbol: '1HZ100V',
        contractType: 'PUT',
        stake: 50,
        payout: 97.50,
        entryPrice: 1115.80,
        exitPrice: 1108.20,
        entryTime: Date.now() - 3600000 * 4,
        expiryTime: Date.now() - 3600000 * 4 + 30000,
        exitTime: Date.now() - 3600000 * 4 + 30000,
        status: 'won',
        profit: 47.50,
        isDemo: true
      },
      {
        contractId: 'cnt_894103',
        symbol: 'R_75',
        contractType: 'CALL',
        stake: 30,
        payout: 58.50,
        entryPrice: 38210.00,
        exitPrice: 38190.50,
        entryTime: Date.now() - 3600000 * 3,
        expiryTime: Date.now() - 3600000 * 3 + 120000,
        exitTime: Date.now() - 3600000 * 3 + 120000,
        status: 'lost',
        profit: -30.00,
        isDemo: true
      },
      {
        contractId: 'cnt_894104',
        symbol: 'CRASH_1000',
        contractType: 'PUT',
        stake: 40,
        payout: 78.00,
        entryPrice: 6280.00,
        exitPrice: 6245.00,
        entryTime: Date.now() - 3600000 * 2,
        expiryTime: Date.now() - 3600000 * 2 + 60000,
        exitTime: Date.now() - 3600000 * 2 + 60000,
        status: 'won',
        profit: 38.00,
        isDemo: true
      },
      {
        contractId: 'cnt_894105',
        symbol: 'BOOM_1000',
        contractType: 'CALL',
        stake: 20,
        payout: 39.00,
        entryPrice: 14750.00,
        exitPrice: 14810.00,
        entryTime: Date.now() - 3600000 * 1,
        expiryTime: Date.now() - 3600000 * 1 + 45000,
        exitTime: Date.now() - 3600000 * 1 + 45000,
        status: 'won',
        profit: 19.00,
        isDemo: true
      }
    ];

    seedTrades.forEach((st, idx) => {
      const id = `trd_${idx + 1}`;
      this.trades.set(id, {
        id,
        contractId: st.contractId!,
        userId: demoUser.id,
        accountId: demoAccount.loginId,
        symbol: st.symbol!,
        contractType: st.contractType!,
        stake: st.stake!,
        payout: st.payout!,
        entryPrice: st.entryPrice!,
        exitPrice: st.exitPrice,
        entryTime: st.entryTime!,
        expiryTime: st.expiryTime!,
        exitTime: st.exitTime,
        status: st.status as any,
        profit: st.profit,
        isDemo: true
      });
    });

    // Seed pre-configured Sample Bot
    const sampleBot: BotRecord = {
      id: 'bot_sample_martingale_01',
      userId: demoUser.id,
      accountId: demoAccount.loginId,
      name: 'R_100 Momentum Scalper',
      strategyType: 'martingale_trend',
      symbol: 'R_100',
      contractType: 'CALL',
      stake: 10,
      duration: 5,
      durationUnit: 't',
      status: 'paused',
      isDemo: true,
      takeProfit: 50,
      stopLoss: 100,
      maxTrades: 25,
      maxConsecutiveLosses: 4,
      martingaleMultiplier: 2.1,
      totalTrades: 12,
      wonTrades: 8,
      lostTrades: 4,
      currentStake: 10,
      consecutiveLosses: 0,
      totalProfit: 42.80,
      createdAt: Date.now() - 86400000 * 3,
      lastRunAt: Date.now() - 3600000,
      logs: [
        {
          id: 'log_1',
          time: Date.now() - 3600000 * 2,
          level: 'info',
          message: 'Bot initialized with Martingale Multiplier 2.1x on Volatility 100 Index'
        },
        {
          id: 'log_2',
          time: Date.now() - 3600000,
          level: 'trade',
          message: 'Executed CALL contract on R_100. P/L: +$9.50'
        }
      ]
    };
    this.bots.set(sampleBot.id, sampleBot);

    // Initial Audit Logs
    this.addAuditLog({
      category: 'system',
      action: 'SERVER_BOOT',
      status: 'info',
      details: 'PrecisionEdge Trading Server initialized with Deriv API integration layer'
    });

    this.addAuditLog({
      category: 'auth',
      action: 'DEMO_SESSION_ACTIVE',
      status: 'success',
      details: `Active session linked to Demo Account VRTC984210 ($10,000.00 USD)`
    });
  }

  addAuditLog(log: Omit<AuditLogRecord, 'id' | 'timestamp'>) {
    const item: AuditLogRecord = {
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      ...log
    };
    this.auditLogs.unshift(item);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return item;
  }
}

export const db = new MemoryDatabase();
