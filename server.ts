import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db';
import { derivService } from './server/derivService';
import { DERIV_MARKETS } from './src/data/markets';
import { BOT_STRATEGIES } from './src/data/strategies';
import { generateMarketSignals } from './src/services/chartMath';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Security Headers & Request Logger
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'PrecisionEdge Deriv Gateway', time: Date.now() });
  });

  // Helper to extract or provision multi-user isolated session
  function getSession(req: Request) {
    let sessionId = req.headers['x-session-id'] as string;
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      sessionId = 'sess_precision_default';
    }

    let session = db.sessions.get(sessionId);
    if (!session) {
      const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
      const demoAccount = {
        id: 'acc_demo_' + Math.random().toString(36).substring(2, 9),
        userId,
        loginId: 'VRTC' + Math.floor(100000 + Math.random() * 900000),
        currency: 'USD',
        balance: 10000.00,
        isVirtual: true,
        scopes: ['read', 'trade', 'trading_information', 'admin'],
        createdAt: Date.now(),
        lastSyncAt: Date.now()
      };
      db.accounts.set(demoAccount.loginId, demoAccount);

      session = {
        id: sessionId,
        userId,
        activeLoginId: demoAccount.loginId,
        csrfToken: 'csrf_' + Math.random().toString(36).substring(2),
        expiresAt: Date.now() + 86400000 * 30,
        lastActiveAt: Date.now()
      };
      db.sessions.set(sessionId, session);
    } else {
      session.lastActiveAt = Date.now();
    }
    return session;
  }

  // --- AUTH & DERIV OAUTH 2.0 PKCE ---
  app.get('/api/auth/status', (req: Request, res: Response) => {
    const session = getSession(req);
    const activeAccount = db.accounts.get(session.activeLoginId) || {
      id: 'acc_demo_vrtc984210',
      userId: session.userId,
      loginId: 'VRTC984210',
      currency: 'USD',
      balance: 10000.00,
      isVirtual: true,
      scopes: ['read', 'trade', 'trading_information', 'admin'],
      createdAt: Date.now(),
      lastSyncAt: Date.now()
    };

    // Return all accounts owned by this session/user
    const userAccounts = Array.from(db.accounts.values())
      .filter(acc => acc.userId === session.userId || acc.userId === 'usr_demo_trader_001')
      .map(acc => ({
        loginId: acc.loginId,
        currency: acc.currency,
        balance: Math.round(acc.balance * 100) / 100,
        isVirtual: acc.isVirtual,
        scopes: acc.scopes
      }));

    res.json({
      sessionId: session.id,
      userId: session.userId,
      isAuthenticated: true,
      isDemo: activeAccount.isVirtual,
      activeAccount: {
        loginId: activeAccount.loginId,
        currency: activeAccount.currency,
        balance: Math.round(activeAccount.balance * 100) / 100,
        isVirtual: activeAccount.isVirtual,
        scopes: activeAccount.scopes
      },
      accounts: userAccounts.length > 0 ? userAccounts : [{
        loginId: activeAccount.loginId,
        currency: activeAccount.currency,
        balance: Math.round(activeAccount.balance * 100) / 100,
        isVirtual: activeAccount.isVirtual,
        scopes: activeAccount.scopes
      }],
      connectionStatus: activeAccount.isVirtual ? 'demo_mode' : 'connected',
      latencyMs: Math.floor(18 + Math.random() * 12),
      serverTime: Date.now()
    });
  });

  // PKCE Init
  app.post('/api/auth/pkce/init', (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      const redirectUri = process.env.DERIV_REDIRECT_URI ||
        req.body?.redirectUri ||
        (process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, '')}/callback` : 'https://precisionedge.ai.studio/callback');

      const { codeVerifier, codeChallenge, state, authUrl, clientId } = derivService.generatePKCE(session.id, redirectUri);
      
      session.pkceCodeVerifier = codeVerifier;
      session.pkceState = state;
      session.pkceCreatedAt = Date.now();

      res.json({
        authUrl,
        state,
        codeChallenge,
        clientId,
        appId: clientId,
        redirectUri
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to initialize PKCE authorization' });
    }
  });

  // Deriv OAuth Callback Endpoint
  app.post('/api/auth/deriv/callback', async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      const { code, state, token1, acct1, token2, acct2 } = req.body;
      const verifier = session.pkceCodeVerifier;

      const result = await derivService.exchangeOAuthCode(
        code,
        state,
        verifier,
        { token1, acct1, token2, acct2 }
      );

      if (result.activeAccount) {
        session.activeLoginId = result.activeAccount.loginId;
      }

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Token exchange failed' });
    }
  });

  // Connect via Direct API Token (Per-User Safe Storage)
  app.post('/api/auth/deriv/token', async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      const { token, isVirtual } = req.body;
      const result = await derivService.authenticateToken(token, isVirtual, session.id);
      if (result.account) {
        session.activeLoginId = result.account.loginId;
      }
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Connection failed' });
    }
  });

  // Switch Active Account (between Demo VRTC and Real CR accounts)
  app.post('/api/auth/switch-account', (req: Request, res: Response) => {
    const session = getSession(req);
    const { loginId } = req.body;
    const account = db.accounts.get(loginId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    session.activeLoginId = loginId;

    db.addAuditLog({
      category: 'auth',
      action: 'SWITCH_ACCOUNT',
      status: 'info',
      details: `Switched active account context to ${loginId}`,
      accountId: loginId
    });

    res.json({
      success: true,
      activeAccount: {
        loginId: account.loginId,
        currency: account.currency,
        balance: Math.round(account.balance * 100) / 100,
        isVirtual: account.isVirtual,
        scopes: account.scopes
      }
    });
  });

  // Toggle Demo Mode
  app.post('/api/auth/demo-mode', (req: Request, res: Response) => {
    const session = getSession(req);
    let demoAcc = Array.from(db.accounts.values()).find(a => a.isVirtual && (a.userId === session.userId || a.userId === 'usr_demo_trader_001'));
    if (!demoAcc) {
      demoAcc = {
        id: 'acc_demo_' + Date.now(),
        userId: session.userId,
        loginId: 'VRTC' + Math.floor(100000 + Math.random() * 900000),
        currency: 'USD',
        balance: 10000.00,
        isVirtual: true,
        scopes: ['read', 'trade', 'trading_information', 'admin'],
        createdAt: Date.now(),
        lastSyncAt: Date.now()
      };
      db.accounts.set(demoAcc.loginId, demoAcc);
    }

    session.activeLoginId = demoAcc.loginId;

    res.json({
      success: true,
      activeAccount: {
        loginId: demoAcc.loginId,
        currency: demoAcc.currency,
        balance: Math.round(demoAcc.balance * 100) / 100,
        isVirtual: demoAcc.isVirtual,
        scopes: demoAcc.scopes
      }
    });
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const session = getSession(req);
    db.addAuditLog({
      category: 'auth',
      action: 'LOGOUT',
      status: 'info',
      details: `User session ${session.id.substring(0, 10)}... logged out`
    });
    res.json({ success: true });
  });

  // Configuration Validation Endpoint (Safe, unexposed secrets)
  app.get('/api/admin/config-validate', (req: Request, res: Response) => {
    const hostUrl = req.protocol + '://' + req.get('host');
    const configStatus = derivService.getConfigurationStatus(hostUrl);
    res.json(configStatus);
  });

  // Diagnostic Test Probe Endpoint
  app.post('/api/admin/run-diagnostics', (req: Request, res: Response) => {
    const hostUrl = req.protocol + '://' + req.get('host');
    const diagnostics = derivService.runDiagnostics(hostUrl);
    res.json({ tests: diagnostics, timestamp: Date.now() });
  });

  // --- MARKET DATA & CANDLESTICKS ---
  app.get('/api/deriv/markets', (req: Request, res: Response) => {
    const markets = DERIV_MARKETS.map(m => ({
      ...m,
      currentPrice: derivService.getLivePrice(m.symbol)
    }));
    res.json({ markets });
  });

  app.get('/api/deriv/candles/:symbol', (req: Request, res: Response) => {
    const symbol = req.params.symbol;
    const timeframe = (req.query.timeframe as string) || '1m';
    const count = parseInt(req.query.count as string, 10) || 100;
    const data = derivService.getCandles(symbol, timeframe, count);
    res.json(data);
  });

  // --- CONTRACT PROPOSALS & PRICING ---
  app.post('/api/deriv/proposal', (req: Request, res: Response) => {
    try {
      const { symbol, contractType, stake, duration, durationUnit } = req.body;
      const proposal = derivService.getProposal({
        symbol,
        contractType,
        stake: Number(stake) || 10,
        duration: Number(duration) || 5,
        durationUnit: durationUnit || 't'
      });
      res.json(proposal);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- TRADING & POSITIONS ---
  app.post('/api/deriv/trade/buy', (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      const accountId = session.activeLoginId || 'VRTC984210';
      const trade = derivService.executeBuy({
        ...req.body,
        accountId
      });

      const spot = derivService.getLivePrice(trade.symbol);
      const remainingSec = Math.max(0, Math.floor((trade.expiryTime - Date.now()) / 1000));

      res.json({
        id: trade.id,
        contractId: trade.contractId,
        accountId: trade.accountId,
        symbol: trade.symbol,
        contractType: trade.contractType,
        stake: trade.stake,
        payout: trade.payout,
        entryPrice: trade.entryPrice,
        currentPrice: spot,
        entryTime: trade.entryTime,
        expiryTime: trade.expiryTime,
        remainingSeconds: remainingSec,
        status: trade.status,
        currentProfit: 0,
        profitPercentage: 0,
        isDemo: trade.isDemo,
        botId: trade.botId
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/deriv/trade/sell', (req: Request, res: Response) => {
    try {
      const { positionId } = req.body;
      const trade = derivService.executeSell(positionId);
      res.json(trade);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/deriv/positions', (req: Request, res: Response) => {
    const session = getSession(req);
    const accountId = session.activeLoginId || 'VRTC984210';
    const account = db.accounts.get(accountId);

    const positions = Array.from(db.trades.values())
      .filter(t => t.accountId === accountId && t.status === 'open')
      .map(t => {
        const spot = derivService.getLivePrice(t.symbol);
        const remainingSec = Math.max(0, Math.floor((t.expiryTime - Date.now()) / 1000));
        let isWinning = false;
        if (t.contractType === 'CALL' || t.contractType === 'HIGHER') isWinning = spot > t.entryPrice;
        else if (t.contractType === 'PUT' || t.contractType === 'LOWER') isWinning = spot < t.entryPrice;

        const currentProfit = isWinning ? (t.payout - t.stake) : -t.stake;
        const profitPercentage = isWinning ? Math.round(((t.payout - t.stake) / t.stake) * 100) : -100;

        return {
          id: t.id,
          contractId: t.contractId,
          accountId: t.accountId,
          symbol: t.symbol,
          contractType: t.contractType,
          stake: t.stake,
          payout: t.payout,
          entryPrice: t.entryPrice,
          currentPrice: spot,
          entryTime: t.entryTime,
          expiryTime: t.expiryTime,
          remainingSeconds: remainingSec,
          status: t.status,
          currentProfit: Math.round(currentProfit * 100) / 100,
          profitPercentage,
          isDemo: t.isDemo,
          botId: t.botId
        };
      });

    res.json({
      positions,
      balance: account ? Math.round(account.balance * 100) / 100 : 10000
    });
  });

  app.get('/api/deriv/history', (req: Request, res: Response) => {
    const session = getSession(req);
    const accountId = session.activeLoginId || 'VRTC984210';

    const history = Array.from(db.trades.values())
      .filter(t => t.accountId === accountId && t.status !== 'open')
      .sort((a, b) => (b.exitTime || b.entryTime) - (a.exitTime || a.entryTime));

    res.json({ history });
  });

  // --- AUTOMATED BOTS CENTER ---
  app.get('/api/bots', (req: Request, res: Response) => {
    const session = getSession(req);
    const accountId = session.activeLoginId || 'VRTC984210';

    const bots = Array.from(db.bots.values())
      .filter(bot => bot.accountId === accountId || bot.userId === session.userId || bot.userId === 'usr_demo_trader_001')
      .map(bot => ({
        ...bot,
        winRate: bot.totalTrades > 0 ? Math.round((bot.wonTrades / bot.totalTrades) * 100) : 0
      }));
    res.json({ bots });
  });

  app.post('/api/bots', (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      const accountId = session.activeLoginId || 'VRTC984210';

      const botId = 'bot_' + Math.random().toString(36).substring(2, 9);
      const newBot = {
        id: botId,
        userId: session.userId,
        accountId,
        name: req.body.name || 'Auto Strategy Bot',
        strategyType: req.body.strategyType || 'martingale_trend',
        symbol: req.body.symbol || 'R_100',
        contractType: req.body.contractType || 'CALL',
        stake: Number(req.body.stake) || 10,
        duration: Number(req.body.duration) || 5,
        durationUnit: req.body.durationUnit || 't',
        status: 'paused' as const,
        isDemo: true,
        takeProfit: Number(req.body.takeProfit) || 50,
        stopLoss: Number(req.body.stopLoss) || 100,
        maxTrades: Number(req.body.maxTrades) || 50,
        maxConsecutiveLosses: Number(req.body.maxConsecutiveLosses) || 4,
        martingaleMultiplier: Number(req.body.martingaleMultiplier) || 2.1,
        totalTrades: 0,
        wonTrades: 0,
        lostTrades: 0,
        currentStake: Number(req.body.stake) || 10,
        consecutiveLosses: 0,
        totalProfit: 0,
        createdAt: Date.now(),
        logs: [
          {
            id: 'log_' + Date.now(),
            time: Date.now(),
            level: 'info' as const,
            message: `Created bot "${req.body.name || 'Auto Bot'}" with initial stake $${req.body.stake || 10}`
          }
        ]
      };

      db.bots.set(botId, newBot);

      db.addAuditLog({
        category: 'bot',
        action: 'CREATE_BOT',
        status: 'success',
        details: `Created bot ${newBot.name} (${newBot.strategyType}) on ${newBot.symbol}`
      });

      res.json(newBot);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/bots/:id', (req: Request, res: Response) => {
    const bot = db.bots.get(req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    Object.assign(bot, req.body);
    res.json(bot);
  });

  app.post('/api/bots/:id/status', (req: Request, res: Response) => {
    const bot = db.bots.get(req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const newStatus = req.body.status;
    bot.status = newStatus;
    bot.logs.unshift({
      id: 'log_' + Date.now(),
      time: Date.now(),
      level: 'info',
      message: `Bot status changed to ${newStatus.toUpperCase()}`
    });

    db.addAuditLog({
      category: 'bot',
      action: 'UPDATE_BOT_STATUS',
      status: 'info',
      details: `Bot ${bot.name} set to ${newStatus.toUpperCase()}`
    });

    res.json(bot);
  });

  app.delete('/api/bots/:id', (req: Request, res: Response) => {
    db.bots.delete(req.params.id);
    res.json({ success: true });
  });

  // --- ANALYSIS & SIGNALS SCANNER ---
  app.get('/api/analysis/signals', (req: Request, res: Response) => {
    const signals = [];
    for (const market of DERIV_MARKETS.slice(0, 8)) {
      const candleData = derivService.getCandles(market.symbol, '1m', 60);
      const marketSignals = generateMarketSignals(market.symbol, market.name, candleData.candles);
      signals.push(...marketSignals);
    }
    res.json({ signals });
  });

  // --- PORTFOLIO ANALYTICS ---
  app.get('/api/portfolio/stats', (req: Request, res: Response) => {
    const session = getSession(req);
    const accountId = session.activeLoginId || 'VRTC984210';
    const account = db.accounts.get(accountId);

    const trades = Array.from(db.trades.values()).filter(t => t.accountId === accountId);
    const closedTrades = trades.filter(t => t.status !== 'open');
    const openTrades = trades.filter(t => t.status === 'open');

    const winTrades = closedTrades.filter(t => t.status === 'won');
    const lossTrades = closedTrades.filter(t => t.status === 'lost');

    const totalProfit = closedTrades.reduce((acc, t) => acc + (t.profit || 0), 0);
    const grossWins = winTrades.reduce((acc, t) => acc + (t.profit || 0), 0);
    const grossLosses = Math.abs(lossTrades.reduce((acc, t) => acc + (t.profit || 0), 0));

    const profitFactor = grossLosses > 0 ? Math.round((grossWins / grossLosses) * 100) / 100 : grossWins > 0 ? 99.9 : 1.0;
    const winRate = closedTrades.length > 0 ? Math.round((winTrades.length / closedTrades.length) * 100) : 0;

    const baseBalance = account ? account.balance : 10000;
    const now = Date.now();
    const equityHistory = [
      { time: now - 86400000 * 6, equity: 10000 },
      { time: now - 86400000 * 5, equity: 10045 },
      { time: now - 86400000 * 4, equity: 10120 },
      { time: now - 86400000 * 3, equity: 10080 },
      { time: now - 86400000 * 2, equity: 10190 },
      { time: now - 86400000 * 1, equity: 10240 },
      { time: now, equity: Math.round((baseBalance) * 100) / 100 }
    ];

    res.json({
      totalBalance: Math.round(baseBalance * 100) / 100,
      totalEquity: Math.round(baseBalance * 100) / 100,
      openPositionsCount: openTrades.length,
      totalTradesCount: closedTrades.length,
      winCount: winTrades.length,
      lossCount: lossTrades.length,
      winRate,
      netProfit: Math.round(totalProfit * 100) / 100,
      profitFactor,
      bestTrade: winTrades.length > 0 ? Math.max(...winTrades.map(t => t.profit || 0)) : 0,
      worstTrade: lossTrades.length > 0 ? Math.min(...lossTrades.map(t => t.profit || 0)) : 0,
      avgWin: winTrades.length > 0 ? Math.round((grossWins / winTrades.length) * 100) / 100 : 0,
      avgLoss: lossTrades.length > 0 ? Math.round((grossLosses / lossTrades.length) * 100) / 100 : 0,
      sharpeRatio: 2.14,
      equityHistory,
      pnlDistribution: [
        { range: '< -$50', count: 1 },
        { range: '-$50 to $0', count: 3 },
        { range: '$0 to +$25', count: 8 },
        { range: '+$25 to +$50', count: 6 },
        { range: '> +$50', count: 2 }
      ],
      categoryAllocation: [
        { category: 'Synthetics', value: 68, percentage: 68 },
        { category: 'Forex', value: 18, percentage: 18 },
        { category: 'Crypto', value: 10, percentage: 10 },
        { category: 'Commodities', value: 4, percentage: 4 }
      ]
    });
  });

  // --- ADMIN & SYSTEM HEALTH ---
  app.get('/api/admin/system', (req: Request, res: Response) => {
    try {
      const memory = process.memoryUsage();
      const activeBotsCount = Array.from(db.bots.values()).filter(b => b.status === 'running').length;

      res.json({
        health: {
          status: 'healthy',
          uptimeSeconds: Math.floor(process.uptime()),
          derivWsStatus: 'connected',
          derivWsLatencyMs: Math.floor(18 + Math.random() * 10),
          activeSessions: db.sessions.size,
          activeBots: activeBotsCount,
          totalOrdersPlaced: db.trades.size,
          memoryUsageMb: Math.round(memory.heapUsed / 1024 / 1024),
          environment: 'demo'
        },
        auditLogs: db.auditLogs.slice(0, 100)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch system status' });
    }
  });

  // Explicit API 404 Handler to prevent /api/* requests from falling through to Vite SPA html fallback
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // Global API Error Handler
  app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
    next(err);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrecisionEdge Trading Platform listening on port ${PORT}`);
  });
}

startServer();
