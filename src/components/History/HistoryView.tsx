import React, { useState } from 'react';
import {
  Clock,
  PieChart,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { sound } from '../../services/sound';

export const HistoryView: React.FC = () => {
  const { tradeHistory, openPositions, activeAccount, sellPosition } = useTrading();
  const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'open'>('all');

  const totalTrades = tradeHistory.length;
  const wonTrades = tradeHistory.filter(t => t.status === 'won').length;
  const lostTrades = tradeHistory.filter(t => t.status === 'lost').length;
  const winRate = totalTrades > 0 ? (((wonTrades || 0) / totalTrades) * 100).toFixed(1) : '0.0';
  const totalProfit = tradeHistory.reduce((acc, t) => acc + (t?.profit || 0), 0);
  const totalVolume = tradeHistory.reduce((acc, t) => acc + (t?.stake || 0), 0);

  const filteredHistory = tradeHistory.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'won') return t.status === 'won';
    if (filter === 'lost') return t.status === 'lost';
    return true;
  });

  const exportCSV = () => {
    sound.playClick();
    if (tradeHistory.length === 0) return;

    const headers = ['Contract ID,Symbol,Type,Stake,Payout,Status,Profit,Time\n'];
    const rows = tradeHistory.map(t => [
      t.contractId,
      t.symbol,
      t.contractType,
      t.stake,
      t.payout,
      t.status,
      t.profit || 0,
      new Date(t.entryTime).toISOString()
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trade_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-6 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Trading History &amp; Contract Ledger</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time execution log, closed contract settlements, win/loss analytics, and CSV audit export.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={tradeHistory.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Realized Profit / Loss</span>
          <div className={`text-2xl font-extrabold font-mono ${(totalProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(totalProfit ?? 0) >= 0 ? '+' : ''}${(totalProfit ?? 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Net performance across settlements</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Win Rate %</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            {winRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{wonTrades} Won / {lostTrades} Lost</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Total Turnover</span>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${(totalVolume ?? 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{totalTrades} Total executions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Open Positions</span>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {openPositions.length} Contracts
          </div>
          <span className="text-[11px] text-slate-500 font-mono">In-flight active trades</span>
        </div>
      </div>

      {/* Active In-Flight Positions (if any) */}
      {openPositions.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Active In-Flight Positions ({openPositions.length})</span>
          </h3>

          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <th className="py-2 px-3">Contract ID</th>
                  <th className="py-2 px-3">Symbol</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Stake</th>
                  <th className="py-2 px-3">Payout</th>
                  <th className="py-2 px-3">Entry</th>
                  <th className="py-2 px-3">Current</th>
                  <th className="py-2 px-3">Expires In</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {openPositions.map(pos => (
                  <tr key={pos.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-300">#{pos.contractId}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{pos.symbol}</td>
                    <td className="py-2.5 px-3 font-semibold text-cyan-400">{pos.contractType}</td>
                    <td className="py-2.5 px-3 text-slate-200">${(pos?.stake ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">${(pos?.payout ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-400">{(pos?.entryPrice ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-white">{(pos?.currentPrice ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-amber-400">{pos.remainingSeconds}s</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          sound.playClick();
                          sellPosition(pos.id);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[10px] font-bold"
                      >
                        Sell Back
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Closed Trade History Ledger */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-sm text-white">Closed Contract History</h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded font-semibold ${
                filter === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({tradeHistory.length})
            </button>
            <button
              onClick={() => setFilter('won')}
              className={`px-2.5 py-1 rounded font-semibold ${
                filter === 'won' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Won ({wonTrades})
            </button>
            <button
              onClick={() => setFilter('lost')}
              className={`px-2.5 py-1 rounded font-semibold ${
                filter === 'lost' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lost ({lostTrades})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">Contract ID</th>
                <th className="py-2.5 px-4">Symbol</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Stake</th>
                <th className="py-2.5 px-4">Payout</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No closed contracts found in this filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(trade => {
                  const isWon = trade.status === 'won';
                  return (
                    <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(trade.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">#{trade.contractId}</td>
                      <td className="py-3 px-4 text-white font-bold">{trade.symbol}</td>
                      <td className="py-3 px-4 text-cyan-400">{trade.contractType}</td>
                      <td className="py-3 px-4 text-slate-300">${(trade?.stake ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-300">${(trade?.payout ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isWon
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {trade.status}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isWon ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(trade?.profit ?? 0) >= 0 ? '+' : ''}${(trade?.profit ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
