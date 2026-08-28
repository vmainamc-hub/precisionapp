import Interpreter from 'js-interpreter';
import { BotStrategyTelemetry, BotLog, BotStatus } from './botTypes';
import { api } from '../api';
import { sound } from '../sound';

export interface RuntimeConfig {
  botId: string;
  botName: string;
  symbol: string;
  symbolName: string;
  contractType: string;
  baseStake: number;
  takeProfit: number;
  stopLoss: number;
  maxTrades: number;
  duration: number;
  durationUnit: string;
  code: string;
  isRealAccount: boolean;
  accountId: string;
  onTelemetryUpdate: (telemetry: BotStrategyTelemetry) => void;
  onLog: (log: BotLog) => void;
}

export class DerivBotRuntime {
  private config: RuntimeConfig;
  private status: BotStatus = 'idle';
  private telemetry: BotStrategyTelemetry;
  private interpreter: any = null;
  private isKilled: boolean = false;
  private isContractActive: boolean = false;
  private tickInterval: any = null;
  private recentPrices: number[] = [];
  private lastEvaluatedPrice: number = 0;

  constructor(config: RuntimeConfig) {
    this.config = config;
    this.telemetry = {
      botId: config.botId,
      botName: config.botName,
      status: 'idle',
      symbol: config.symbol,
      symbolName: config.symbolName,
      contractType: config.contractType,
      currentStake: config.baseStake,
      baseStake: config.baseStake,
      takeProfit: config.takeProfit,
      stopLoss: config.stopLoss,
      maxTrades: config.maxTrades,
      totalTrades: 0,
      wonTrades: 0,
      lostTrades: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      netProfit: 0,
      startTime: null,
      endTime: null,
      lastTradeTime: null,
      logs: []
    };
  }

  public getTelemetry(): BotStrategyTelemetry {
    return { ...this.telemetry };
  }

  public getStatus(): BotStatus {
    return this.status;
  }

  private addLog(level: BotLog['level'], message: string, data?: any) {
    const log: BotLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      time: Date.now(),
      level,
      message,
      data
    };
    this.telemetry.logs.unshift(log);
    if (this.telemetry.logs.length > 200) {
      this.telemetry.logs.pop();
    }
    this.config.onLog(log);
    this.config.onTelemetryUpdate({ ...this.telemetry });
  }

  // --- Initializer & Sandboxing ---
  private initInterpreter(customCode: string) {
    const initScope = (interpreter: any, globalObject: any) => {
      // 1. Context Object
      const botContextObj = interpreter.nativeToCustom({
        symbol: this.config.symbol,
        tradeType: this.config.contractType,
        baseStake: this.telemetry.baseStake,
        currentStake: this.telemetry.currentStake,
        duration: this.config.duration,
        durationUnit: this.config.durationUnit,
        netProfit: this.telemetry.netProfit,
        totalTrades: this.telemetry.totalTrades
      });
      interpreter.setProperty(globalObject, 'botContext', botContextObj);

      // 2. Native Bridge: Purchase Action
      const wrapperPurchase = (contractType: string) => {
        if (this.isKilled || this.isContractActive || this.status !== 'running') return;
        this.executeOrder(contractType);
      };
      interpreter.setProperty(
        globalObject,
        'derivPurchase',
        interpreter.createNativeFunction(wrapperPurchase)
      );

      // 3. Native Bridge: Trade Again Action
      const wrapperTradeAgain = () => {
        if (this.isKilled || this.status !== 'running') return;
        this.addLog('info', 'Strategy called "Trade Again". Awaiting next tick signal.');
      };
      interpreter.setProperty(
        globalObject,
        'derivTradeAgain',
        interpreter.createNativeFunction(wrapperTradeAgain)
      );

      // 4. Native Bridge: Stop Bot
      const wrapperStopBot = (reason: string) => {
        this.stop(reason || 'Strategy requested stop');
      };
      interpreter.setProperty(
        globalObject,
        'derivStopBot',
        interpreter.createNativeFunction(wrapperStopBot)
      );

      // 5. Indicators & Data
      const wrapperGetRSI = (period: number) => {
        const prices = this.recentPrices;
        if (prices.length < period + 1) return 50.0;
        let gains = 0;
        let losses = 0;
        for (let i = prices.length - period; i < prices.length; i++) {
          const diff = prices[i] - prices[i - 1];
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) return 100.0;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
      };
      interpreter.setProperty(
        globalObject,
        'derivGetRSI',
        interpreter.createNativeFunction(wrapperGetRSI)
      );

      const wrapperGetSMA = (period: number) => {
        const prices = this.recentPrices;
        const slice = prices.slice(-period);
        if (slice.length === 0) return this.lastEvaluatedPrice;
        const sum = slice.reduce((a, b) => a + b, 0);
        return sum / slice.length;
      };
      interpreter.setProperty(
        globalObject,
        'derivGetSMA',
        interpreter.createNativeFunction(wrapperGetSMA)
      );

      const wrapperGetEMA = (period: number) => {
        const prices = this.recentPrices;
        if (prices.length === 0) return this.lastEvaluatedPrice;
        const k = 2 / (period + 1);
        let ema = prices[0];
        for (let i = 1; i < prices.length; i++) {
          ema = prices[i] * k + ema * (1 - k);
        }
        return ema;
      };
      interpreter.setProperty(
        globalObject,
        'derivGetEMA',
        interpreter.createNativeFunction(wrapperGetEMA)
      );

      const wrapperGetLastDigit = () => {
        const spot = this.lastEvaluatedPrice;
        return Math.floor(spot * 100) % 10;
      };
      interpreter.setProperty(
        globalObject,
        'derivGetLastDigit',
        interpreter.createNativeFunction(wrapperGetLastDigit)
      );

      const wrapperGetTickPrice = () => {
        return this.lastEvaluatedPrice;
      };
      interpreter.setProperty(
        globalObject,
        'derivGetTickPrice',
        interpreter.createNativeFunction(wrapperGetTickPrice)
      );
    };

    try {
      this.interpreter = new Interpreter(customCode, initScope);
      // Run top-level definitions
      this.interpreter.run();
    } catch (e: any) {
      this.addLog('error', `Interpreter syntax/init error: ${e.message}`);
      this.status = 'error';
    }
  }

  // --- Start & Loop Control ---
  public async start(): Promise<void> {
    if (this.isKilled) return;

    this.status = 'running';
    this.telemetry.status = 'running';
    this.telemetry.startTime = Date.now();
    this.addLog('info', `Bot "${this.config.botName}" started in ${this.config.isRealAccount ? 'REAL MONEY' : 'DEMO'} mode.`);

    // Initialize Interpreter with generated JS code
    this.initInterpreter(this.config.code);

    // Start Live Tick Loop (1s evaluation)
    this.startTickLoop();
  }

  private startTickLoop() {
    if (this.tickInterval) clearInterval(this.tickInterval);

    this.tickInterval = setInterval(async () => {
      if (this.isKilled || this.status !== 'running' || this.isContractActive) return;

      // Risk Guards Check
      if (this.checkRiskCircuitBreakers()) return;

      try {
        // Fetch real-time candles/tick from API
        const data = await api.getCandles(this.config.symbol, '1m', 30);
        if (data && data.currentPrice) {
          this.lastEvaluatedPrice = data.currentPrice;
          this.recentPrices = (data.candles || []).map((c: any) => c.close);
          if (this.recentPrices.length === 0) this.recentPrices = [data.currentPrice];

          // Trigger onBeforePurchase inside sandbox
          this.evaluateBeforePurchase();
        }
      } catch (err: any) {
        // transient network
      }
    }, 1500);
  }

  private evaluateBeforePurchase() {
    if (!this.interpreter || this.isContractActive || this.status !== 'running') return;

    try {
      // Execute `onBeforePurchase(lastPrice)`
      const evalCode = `if (typeof onBeforePurchase === 'function') { onBeforePurchase(${this.lastEvaluatedPrice}); }`;
      this.interpreter.appendCode(evalCode);
      this.interpreter.run();
    } catch (err: any) {
      this.addLog('error', `Error executing before_purchase block: ${err.message}`);
    }
  }

  // --- Order Execution ---
  private async executeOrder(contractType: string) {
    if (this.isContractActive || this.status !== 'running') return;

    this.isContractActive = true;
    const stakeToUse = this.telemetry.currentStake || this.config.baseStake;

    this.addLog('trade', `Placing order: ${contractType} on ${this.config.symbolName} ($${stakeToUse.toFixed(2)})`);

    try {
      sound.playBuy();

      // Request proposal and execute buy
      const prop = await api.getProposal({
        symbol: this.config.symbol,
        contractType: contractType as any,
        stake: stakeToUse,
        duration: this.config.duration || 5,
        durationUnit: (this.config.durationUnit as any) || 't'
      });

      const trade = await api.buyContract({
        symbol: this.config.symbol,
        contractType: contractType as any,
        stake: stakeToUse,
        proposalId: prop.id,
        duration: this.config.duration || 5,
        durationUnit: (this.config.durationUnit as any) || 't',
        botId: this.config.botId,
        accountId: this.config.accountId
      });

      this.telemetry.activeContractId = trade.id;
      this.telemetry.lastTradeTime = Date.now();
      this.addLog('trade', `Contract #${trade.contractId} opened at $${trade.entryPrice.toFixed(2)}`);

      // Monitor settlement
      this.monitorContractSettlement(trade.id);
    } catch (err: any) {
      this.isContractActive = false;
      this.addLog('error', `Order failed: ${err.message || 'Deriv API rejected proposal'}`);
    }
  }

  private monitorContractSettlement(tradeId: string) {
    const checkInterval = setInterval(async () => {
      if (this.isKilled) {
        clearInterval(checkInterval);
        return;
      }

      try {
        const hist = await api.getTradeHistory();
        const settledTrade = (hist.history || []).find((t: any) => t.id === tradeId && t.status !== 'open');

        if (settledTrade) {
          clearInterval(checkInterval);
          this.isContractActive = false;
          this.telemetry.activeContractId = undefined;
          this.handleContractSettled(settledTrade);
        }
      } catch {
        // Retry next poll
      }
    }, 1000);
  }

  private handleContractSettled(trade: any) {
    const isWin = trade.status === 'won';
    const profit = trade.profit || 0;

    this.telemetry.totalTrades++;
    this.telemetry.netProfit = Math.round((this.telemetry.netProfit + profit) * 100) / 100;

    if (isWin) {
      this.telemetry.wonTrades++;
      this.telemetry.consecutiveWins++;
      this.telemetry.consecutiveLosses = 0;
      sound.playWin();
      this.addLog('success', `Trade WON (+$${profit.toFixed(2)}). Total P/L: $${this.telemetry.netProfit.toFixed(2)}`);
    } else {
      this.telemetry.lostTrades++;
      this.telemetry.consecutiveLosses++;
      this.telemetry.consecutiveWins = 0;
      sound.playLoss();
      this.addLog('risk', `Trade LOST (-$${Math.abs(profit).toFixed(2)}). Total P/L: $${this.telemetry.netProfit.toFixed(2)}`);
    }

    // Evaluate `after_purchase` in Sandbox
    if (this.interpreter && this.status === 'running') {
      try {
        const contractResultObj = JSON.stringify({
          isWin,
          profit,
          payout: trade.payout || 0,
          entrySpot: trade.entryPrice || 0,
          exitSpot: trade.exitPrice || 0,
          lastDigit: Math.floor((trade.exitPrice || 0) * 100) % 10
        });

        const afterCode = `
          if (typeof onAfterPurchase === 'function') {
            onAfterPurchase(${contractResultObj});
          }
        `;
        this.interpreter.appendCode(afterCode);
        this.interpreter.run();

        // Sync back current stake if changed in sandbox
        const botContextVal = this.interpreter.getProperty(this.interpreter.globalObject, 'botContext');
        if (botContextVal && botContextVal.properties && botContextVal.properties.currentStake) {
          this.telemetry.currentStake = Number(botContextVal.properties.currentStake.data) || this.telemetry.baseStake;
        }
      } catch (err: any) {
        this.addLog('error', `Error in after_purchase block: ${err.message}`);
      }
    }

    this.config.onTelemetryUpdate({ ...this.telemetry });
  }

  // --- Safety & Circuit Breakers ---
  private checkRiskCircuitBreakers(): boolean {
    if (this.telemetry.totalTrades >= this.config.maxTrades) {
      this.stop(`Max executions limit reached (${this.config.maxTrades} trades).`);
      return true;
    }

    if (this.telemetry.netProfit >= this.config.takeProfit) {
      this.stop(`Take-Profit reached (+$${this.telemetry.netProfit.toFixed(2)} / target $${this.config.takeProfit}). Gains secured.`);
      return true;
    }

    if (this.telemetry.netProfit <= -this.config.stopLoss) {
      this.stop(`Stop-Loss limit reached (-$${Math.abs(this.telemetry.netProfit).toFixed(2)} / limit $${this.config.stopLoss}). Execution halted.`);
      return true;
    }

    return false;
  }

  public pause(): void {
    if (this.status !== 'running') return;
    this.status = 'paused';
    this.telemetry.status = 'paused';
    this.addLog('info', 'Bot paused by user.');
    this.config.onTelemetryUpdate({ ...this.telemetry });
  }

  public resume(): void {
    if (this.status !== 'paused') return;
    this.status = 'running';
    this.telemetry.status = 'running';
    this.addLog('info', 'Bot resumed.');
    this.config.onTelemetryUpdate({ ...this.telemetry });
  }

  // --- Independent Emergency Kill Switch ---
  public stop(reason?: string): void {
    this.isKilled = true;
    this.status = 'stopped';
    this.telemetry.status = 'stopped';
    this.telemetry.endTime = Date.now();

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    sound.playClick();
    this.addLog('risk', `EMERGENCY STOP TRIGGERED: ${reason || 'User manual kill switch'}`);
    this.config.onTelemetryUpdate({ ...this.telemetry });
  }
}
