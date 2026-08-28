import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { BlocklyWorkspace } from './BlocklyWorkspace';
import { BotControlPanel } from './BotControlPanel';
import { BotTelemetry } from './BotTelemetry';
import { DerivBotRuntime } from '../../services/bot/botRuntime';
import {
  BotStrategyTelemetry,
  BotStatus,
  BotLog
} from '../../services/bot/botTypes';
import { validateStrategyXml, OFFICIAL_STRATEGY_TEMPLATES } from '../../services/bot/botXml';
import { useTrading } from '../../context/TradingContext';
import { sound } from '../../services/sound';

export const BotsCenter: React.FC = () => {
  const { activeAccount, activeMarket, addToast } = useTrading();

  // Strategy code & XML state from Blockly canvas
  const [currentXml, setCurrentXml] = useState<string>(OFFICIAL_STRATEGY_TEMPLATES[0].xml);
  const [currentCode, setCurrentCode] = useState<string>('');

  // Runtime parameters
  const [baseStake, setBaseStake] = useState<number>(10);
  const [takeProfit, setTakeProfit] = useState<number>(50);
  const [stopLoss, setStopLoss] = useState<number>(30);
  const [maxTrades, setMaxTrades] = useState<number>(20);

  // Runtime & Telemetry state
  const [status, setStatus] = useState<BotStatus>('idle');
  const [telemetry, setTelemetry] = useState<BotStrategyTelemetry | null>(null);

  const runtimeRef = useRef<DerivBotRuntime | null>(null);

  const handleWorkspaceChange = useCallback((xml: string, code: string) => {
    setCurrentXml(xml);
    setCurrentCode(code);
  }, []);

  const handleStartBot = () => {
    sound.playClick();

    // 1. Validate Strategy XML before launch
    const validation = validateStrategyXml(currentXml);
    if (!validation.isValid) {
      addToast('error', 'Strategy Validation Error', validation.errors.join('. '));
      return;
    }

    if (!currentCode || currentCode.trim().length === 0) {
      addToast('error', 'Code Generation Empty', 'Please assemble blocks on the canvas before running.');
      return;
    }

    // Terminate existing runtime if any
    if (runtimeRef.current) {
      runtimeRef.current.stop('Starting new strategy execution');
    }

    const isReal = activeAccount ? !activeAccount.isVirtual : false;

    // 2. Initialize Deriv Bot Sandboxed Runtime
    const runtime = new DerivBotRuntime({
      botId: 'bot_' + Math.random().toString(36).substring(2, 9),
      botName: 'Deriv DBot Strategy',
      symbol: activeMarket.symbol,
      symbolName: activeMarket.name,
      contractType: validation.detectedContractType || 'CALL',
      baseStake: Number(baseStake),
      takeProfit: Number(takeProfit),
      stopLoss: Number(stopLoss),
      maxTrades: Number(maxTrades),
      duration: 5,
      durationUnit: 't',
      code: currentCode,
      isRealAccount: isReal,
      accountId: activeAccount?.loginId || 'CR_DEMO',
      onTelemetryUpdate: updatedTel => {
        setTelemetry(updatedTel);
        setStatus(updatedTel.status);
      },
      onLog: log => {
        if (log.level === 'error') {
          addToast('error', 'Bot Alert', log.message);
        } else if (log.level === 'success') {
          addToast('success', 'Contract Won', log.message);
        }
      }
    });

    runtimeRef.current = runtime;
    runtime.start();
    setStatus('running');
    setTelemetry(runtime.getTelemetry());
    addToast('success', 'Bot Initialized', `Strategy executing on ${activeMarket.name}`);
  };

  const handlePauseBot = () => {
    sound.playClick();
    if (runtimeRef.current) {
      runtimeRef.current.pause();
      setStatus('paused');
    }
  };

  const handleResumeBot = () => {
    sound.playClick();
    if (runtimeRef.current) {
      runtimeRef.current.resume();
      setStatus('running');
    }
  };

  const handleStopBot = () => {
    sound.playClick();
    if (runtimeRef.current) {
      runtimeRef.current.stop('Manual stop triggered by user');
      setStatus('stopped');
      addToast('info', 'Bot Terminated', 'Emergency kill switch executed');
    }
  };

  const handleClearLogs = () => {
    setTelemetry(prev => (prev ? { ...prev, logs: [] } : null));
  };

  useEffect(() => {
    return () => {
      if (runtimeRef.current) {
        runtimeRef.current.stop('Navigation unmount');
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden select-none">
      {/* Top Banner: Deriv Official Compatibility Notice */}
      <div className="h-10 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">Deriv Bot Studio (Official DBot Compatibility)</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800 font-mono">
            Blockly v10 + JS-Interpreter + Deriv WebSocket v3
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sandboxed Client Execution</span>
          </div>
          <a
            href="https://bot.deriv.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>Deriv DBot Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Workspace Area (Blockly + Control Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Blockly Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <BlocklyWorkspace onWorkspaceChange={handleWorkspaceChange} />
          </div>

          {/* Bottom Telemetry & Execution Log Drawer */}
          <BotTelemetry telemetry={telemetry} onClearLogs={handleClearLogs} />
        </div>

        {/* Right Sidebar Control & Guardrails */}
        <BotControlPanel
          status={status}
          telemetry={telemetry}
          baseStake={baseStake}
          setBaseStake={setBaseStake}
          takeProfit={takeProfit}
          setTakeProfit={setTakeProfit}
          stopLoss={stopLoss}
          setStopLoss={setStopLoss}
          maxTrades={maxTrades}
          setMaxTrades={setMaxTrades}
          onStart={handleStartBot}
          onPause={handlePauseBot}
          onResume={handleResumeBot}
          onStop={handleStopBot}
        />
      </div>
    </div>
  );
};
