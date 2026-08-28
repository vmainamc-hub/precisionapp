import {
  DerivAccountInfo,
  ProposalRequest,
  ProposalResponse,
  TradePosition,
  ClosedTrade,
  BotInstance,
  MarketSignal,
  PortfolioAnalytics,
  SystemHealth,
  AuditLogItem,
  ConfigValidationResult,
  DiagnosticTestResult
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }
      if (fallback !== undefined) return fallback;
      throw new Error(`HTTP error ${res.status}`);
    }

    if (!contentType.includes('application/json')) {
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(`Unexpected response from server`);
    }

    return await res.json();
  } catch (err: any) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export const api = {
  // Authentication & Deriv OAuth
  async getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    isDemo: boolean;
    activeAccount: DerivAccountInfo;
    accounts: DerivAccountInfo[];
    connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'demo_mode';
    latencyMs: number;
    serverTime: number;
  }> {
    return fetchJson('/api/auth/status', undefined, {
      isAuthenticated: true,
      isDemo: true,
      activeAccount: {
        loginId: 'VRTC984210',
        currency: 'USD',
        balance: 10000,
        isVirtual: true,
        scopes: ['read', 'trade', 'trading_information', 'admin']
      },
      accounts: [{
        loginId: 'VRTC984210',
        currency: 'USD',
        balance: 10000,
        isVirtual: true,
        scopes: ['read', 'trade', 'trading_information', 'admin']
      }],
      connectionStatus: 'demo_mode',
      latencyMs: 24,
      serverTime: Date.now()
    });
  },

  async initPkceOAuth(customRedirectUri?: string): Promise<{
    authUrl: string;
    state: string;
    codeChallenge: string;
    redirectUri?: string;
    appId?: string;
  }> {
    const redirectUri = customRedirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/callback` : undefined);
    return fetchJson('/api/auth/pkce/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirectUri })
    });
  },

  async handleOAuthCallback(
    paramsOrCode: string | {
      code?: string | null;
      state?: string | null;
      token1?: string | null;
      acct1?: string | null;
      token2?: string | null;
      acct2?: string | null;
    },
    state?: string
  ): Promise<{
    success: boolean;
    activeAccount: DerivAccountInfo;
    accounts?: DerivAccountInfo[];
    message?: string;
  }> {
    const body = typeof paramsOrCode === 'string'
      ? { code: paramsOrCode, state: state || 'pe_default' }
      : paramsOrCode;

    return fetchJson('/api/auth/deriv/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  },

  async connectWithToken(token: string, isVirtual = true): Promise<{
    success: boolean;
    account: DerivAccountInfo;
    message: string;
  }> {
    return fetchJson('/api/auth/deriv/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, isVirtual })
    });
  },

  async switchAccount(loginId: string): Promise<{ success: boolean; activeAccount: DerivAccountInfo }> {
    return fetchJson('/api/auth/switch-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId })
    });
  },

  async enableDemoMode(): Promise<{ success: boolean; activeAccount: DerivAccountInfo }> {
    return fetchJson('/api/auth/demo-mode', { method: 'POST' });
  },

  async logout(): Promise<{ success: boolean }> {
    return fetchJson('/api/auth/logout', { method: 'POST' }, { success: true });
  },

  // Market & Pricing Data
  async getCandles(symbol: string, timeframe = '1m', count = 100): Promise<{
    symbol: string;
    candles: { time: number; open: number; high: number; low: number; close: number; volume?: number }[];
    currentPrice: number;
    change24h: number;
  }> {
    return fetchJson(`/api/deriv/candles/${encodeURIComponent(symbol)}?timeframe=${timeframe}&count=${count}`, undefined, {
      symbol,
      candles: [],
      currentPrice: 100,
      change24h: 0
    });
  },

  async getProposal(req: ProposalRequest): Promise<ProposalResponse> {
    return fetchJson('/api/deriv/proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
  },

  // Trading & Execution
  async buyContract(req: ProposalRequest & { botId?: string }): Promise<TradePosition> {
    return fetchJson('/api/deriv/trade/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
  },

  async sellContract(positionId: string): Promise<ClosedTrade> {
    return fetchJson('/api/deriv/trade/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId })
    });
  },

  async getPositions(): Promise<{ positions: TradePosition[]; balance: number }> {
    return fetchJson('/api/deriv/positions', undefined, { positions: [], balance: 10000 });
  },

  async getTradeHistory(): Promise<{ history: ClosedTrade[] }> {
    return fetchJson('/api/deriv/history', undefined, { history: [] });
  },

  // Bot Engine
  async getBots(): Promise<{ bots: BotInstance[] }> {
    return fetchJson('/api/bots', undefined, { bots: [] });
  },

  async createBot(botData: Partial<BotInstance>): Promise<BotInstance> {
    return fetchJson('/api/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(botData)
    });
  },

  async updateBot(botId: string, updates: Partial<BotInstance>): Promise<BotInstance> {
    return fetchJson(`/api/bots/${botId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  },

  async setBotStatus(botId: string, status: 'running' | 'paused' | 'stopped'): Promise<BotInstance> {
    return fetchJson(`/api/bots/${botId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  },

  async deleteBot(botId: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/bots/${botId}`, { method: 'DELETE' }, { success: true });
  },

  // Analysis & Scanner
  async getSignals(): Promise<{ signals: MarketSignal[] }> {
    return fetchJson('/api/analysis/signals', undefined, { signals: [] });
  },

  // Portfolio
  async getPortfolioAnalytics(): Promise<PortfolioAnalytics> {
    return fetchJson('/api/portfolio/stats');
  },

  // Admin & System
  async getSystemHealth(): Promise<{ health: SystemHealth; auditLogs: AuditLogItem[] }> {
    return fetchJson('/api/admin/system', undefined, {
      health: {
        status: 'healthy',
        uptimeSeconds: 100,
        derivWsStatus: 'connected',
        derivWsLatencyMs: 22,
        activeSessions: 1,
        activeBots: 0,
        totalOrdersPlaced: 0,
        memoryUsageMb: 45,
        environment: 'demo'
      },
      auditLogs: []
    });
  },

  async getConfigValidation(): Promise<ConfigValidationResult> {
    return fetchJson('/api/admin/config-validate');
  },

  async runDiagnostics(): Promise<{ tests: DiagnosticTestResult[]; timestamp: number }> {
    return fetchJson('/api/admin/run-diagnostics', { method: 'POST' });
  },

  async getSystemStatus(): Promise<{
    derivWsLatency: number;
    activeMarketCount: number;
    activeBotsCount: number;
    openPositionsCount: number;
    totalTradesExecuted: number;
    serverTime: number;
  }> {
    const data = await fetchJson<{ health?: SystemHealth }>('/api/admin/system', undefined, {});
    return {
      derivWsLatency: data.health?.derivWsLatencyMs || 22,
      activeMarketCount: 18,
      activeBotsCount: data.health?.activeBots || 0,
      openPositionsCount: 0,
      totalTradesExecuted: data.health?.totalOrdersPlaced || 0,
      serverTime: Date.now()
    };
  },

  async getAuditLogs(): Promise<{ logs: any[] }> {
    const data = await fetchJson<{ auditLogs?: any[] }>('/api/admin/system', undefined, {});
    return {
      logs: (data.auditLogs || []).map((l: any) => ({
        id: l.id,
        timestamp: l.timestamp,
        level: l.status === 'error' ? 'error' : l.status === 'warning' ? 'warn' : 'info',
        category: l.category,
        message: `${l.action} - ${l.details}`,
        details: l
      }))
    };
  }
};
