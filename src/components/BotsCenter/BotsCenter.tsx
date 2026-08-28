import React, { useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  Square,
  Plus,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Sliders,
  DollarSign,
  Clock,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { BotInstance, BotStrategyConfig } from '../../types';
import { BOT_STRATEGIES } from '../../data/strategies';
import { sound } from '../../services/sound';

export const BotsCenter: React.FC = () => {
  const { bots, startBot, pauseBot, stopBot, createBot, markets, activeAccount } = useTrading();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BotStrategyConfig>(BOT_STRATEGIES[0]);

  // Form states for creating bot
  const [botName, setBotName] = useState<string>('Martingale Trend Bot');
  const [targetSymbol, setTargetSymbol] = useState<string>('R_100');
  const [baseStake, setBaseStake] = useState<number>(5.0);
  const [takeProfit, setTakeProfit] = useState<number>(50.0);
  const [stopLoss, setStopLoss] = useState<number>(30.0);
  const [maxTrades, setMaxTrades] = useState<number>(20);

  const activeBotsCount = bots.filter(b => b.status === 'running').length;
  const totalBotTrades = bots.reduce((acc, b) => acc + b.totalTrades, 0);
  const totalBotProfit = bots.reduce((acc, b) => acc + b.profit, 0);

  const handleOpenDeploy = (template: BotStrategyConfig) => {
    sound.playClick();
    setSelectedTemplate(template);
    setBotName(`${template.name} #${bots.length + 1}`);
    setTargetSymbol(template.recommendedMarkets[0] || 'R_100');
    setBaseStake(typeof template.defaultParams.stake === 'number' ? template.defaultParams.stake : 10);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    await createBot({
      name: botName,
      strategyId: selectedTemplate.id,
      symbol: targetSymbol,
      symbolName: markets.find(m => m.symbol === targetSymbol)?.name || targetSymbol,
      baseStake: Number(baseStake),
      takeProfit: Number(takeProfit),
      stopLoss: Number(stopLoss),
      maxTrades: Number(maxTrades)
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span>Automated Trading Bots Center</span>
          </h2>
          <p className="text-xs text-slate-400">
            Algorithmic execution engines with strict risk guardrails, stop-loss protection, and automated trade sizing.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy New Bot</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono block uppercase">Active Automated Bots</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold font-mono text-cyan-400">{activeBotsCount}</span>
            <span className="text-xs text-slate-500">/ {bots.length} total</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono block uppercase">Total Bot Executions</span>
          <span className="text-2xl font-extrabold font-mono text-white">{totalBotTrades}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono block uppercase">Cumulative Bot P/L</span>
          <span
            className={`text-2xl font-extrabold font-mono ${
              totalBotProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalBotProfit >= 0 ? '+' : ''}${totalBotProfit.toFixed(2)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono block uppercase">Execution Engine</span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Deriv API V3 Engine</span>
          </div>
        </div>
      </div>

      {/* Strategy Templates Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Pre-Built Algorithmic Strategy Library</span>
          </h3>
          <span className="text-[11px] text-slate-400">Select template to configure &amp; deploy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOT_STRATEGIES.map(template => (
            <div
              key={template.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3 transition-all"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-white">{template.name}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                      template.riskLevel === 'low'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : template.riskLevel === 'medium'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                    }`}
                  >
                    {template.riskLevel} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Target Assets:</span>
                  <span className="text-slate-300">{template.recommendedMarkets.join(', ')}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Default Base Stake:</span>
                  <span className="text-emerald-400 font-bold">${template.defaultParams.stake || 10} USD</span>
                </div>
                <button
                  onClick={() => handleOpenDeploy(template)}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                >
                  Deploy {template.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Bots Management Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Active Deployed Bot Instances</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Live automated execution state, stop-loss thresholds, and real-time control toggles.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          {bots.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No bots currently deployed. Select a strategy above to start automated trading.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <th className="py-2.5 px-4">Bot Name</th>
                  <th className="py-2.5 px-4">Market</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Base Stake</th>
                  <th className="py-2.5 px-4">Trades (W/L)</th>
                  <th className="py-2.5 px-4">Take Profit / Stop Loss</th>
                  <th className="py-2.5 px-4">Current P/L</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {bots.map(bot => {
                  const isRunning = bot.status === 'running';
                  const isPaused = bot.status === 'paused';
                  const winRate = bot.totalTrades > 0 ? ((bot.wonTrades / bot.totalTrades) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={bot.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white font-sans">{bot.name}</td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{bot.symbolName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isRunning
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : isPaused
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {bot.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200">${bot.baseStake.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="text-white font-bold">{bot.totalTrades}</span>{' '}
                        <span className="text-slate-400 text-[11px]">
                          ({bot.wonTrades}W / {bot.lostTrades}L - {winRate}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        <span className="text-emerald-400 font-bold">+${bot.takeProfit}</span> /{' '}
                        <span className="text-rose-400 font-bold">-${bot.stopLoss}</span>
                      </td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          bot.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {bot.profit >= 0 ? '+' : ''}${bot.profit.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isRunning ? (
                            <button
                              onClick={() => {
                                sound.playClick();
                                pauseBot(bot.id);
                              }}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
                              title="Pause Bot"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                sound.playClick();
                                startBot(bot.id);
                              }}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                              title="Resume / Start Bot"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              sound.playClick();
                              stopBot(bot.id);
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700"
                            title="Stop / Terminate Bot"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bot Deploy Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl p-6 space-y-4 text-slate-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Deploy Automated Bot Instance</h3>
                <p className="text-[11px] text-slate-400">Configure parameters and risk guardrails</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Bot Name</label>
                <input
                  type="text"
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Market</label>
                  <select
                    value={targetSymbol}
                    onChange={e => setTargetSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  >
                    {markets.map(m => (
                      <option key={m.symbol} value={m.symbol}>
                        {m.name} ({m.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Base Stake ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={baseStake}
                    onChange={e => setBaseStake(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Take Profit Target ($ USD)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={takeProfit}
                    onChange={e => setTakeProfit(parseFloat(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Stop-Loss Circuit Breaker ($ USD)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={stopLoss}
                    onChange={e => setStopLoss(parseFloat(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Max Executions Cap</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={maxTrades}
                  onChange={e => setMaxTrades(parseInt(e.target.value, 10) || 10)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bot automatically terminates upon reaching Take-Profit or Stop-Loss caps.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Start Automation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
