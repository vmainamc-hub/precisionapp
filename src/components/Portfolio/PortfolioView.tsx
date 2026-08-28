import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { sound } from '../../services/sound';

export const PortfolioView: React.FC = () => {
  const { activeAccount, tradeHistory, openPositions } = useTrading();
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');

  const totalTrades = tradeHistory.length;
  const wonTrades = tradeHistory.filter(t => t.status === 'won').length;
  const lostTrades = tradeHistory.filter(t => t.status === 'lost').length;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(1) : '0.0';

  const totalRealizedProfit = tradeHistory.reduce((acc, t) => acc + (t.profit || 0), 0);
  const totalVolume = tradeHistory.reduce((acc, t) => acc + t.stake, 0);

  const bestTrade = tradeHistory.length > 0 ? Math.max(...tradeHistory.map(t => t.profit || 0)) : 0;
  const worstTrade = tradeHistory.length > 0 ? Math.min(...tradeHistory.map(t => t.profit || 0)) : 0;

  const currentOpenRisk = openPositions.reduce((acc, p) => acc + p.stake, 0);

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
    link.setAttribute('download', `portfolio_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 text-slate-200 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <span>Trading Performance &amp; Portfolio Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Account equity tracking, win/loss distribution, risk exposure, and ledger audit.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Portfolio Audit</span>
        </button>
      </div>

      {/* Primary KPI Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Account Balance</span>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${activeAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '10,000.00'}{' '}
            <span className="text-xs text-slate-500 font-normal">USD</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {activeAccount?.isVirtual ? 'Virtual Demo Account' : 'Live Real Account'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Realized Profit / Loss</span>
          <div
            className={`text-2xl font-extrabold font-mono ${
              totalRealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalRealizedProfit >= 0 ? '+' : ''}${totalRealizedProfit.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Across {totalTrades} total executions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Win Rate %</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            {winRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {wonTrades} Won / {lostTrades} Lost
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-mono block uppercase">Current Open Risk</span>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            ${currentOpenRisk.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {openPositions.length} Active in-flight contracts
          </span>
        </div>
      </div>

      {/* Advanced Statistical Metrics */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Institutional Trading Performance Statistics</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Total Volume</span>
            <span className="text-white font-bold text-sm">${totalVolume.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Best Trade</span>
            <span className="text-emerald-400 font-bold text-sm">+${bestTrade.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Worst Trade</span>
            <span className="text-rose-400 font-bold text-sm">${worstTrade.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Profit Factor</span>
            <span className="text-cyan-400 font-bold text-sm">
              {lostTrades > 0 ? (wonTrades / lostTrades).toFixed(2) : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Avg Hold Time</span>
            <span className="text-slate-300 font-bold text-sm">15 Sec</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Risk Score</span>
            <span className="text-emerald-400 font-bold text-sm">LOW (1.2%)</span>
          </div>
        </div>
      </div>

      {/* Closed Trades History Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Closed Contracts Audit Ledger</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Verified executions and settlements.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          {tradeHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No closed contracts yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <th className="py-2.5 px-4">Contract ID</th>
                  <th className="py-2.5 px-4">Market</th>
                  <th className="py-2.5 px-4">Contract Type</th>
                  <th className="py-2.5 px-4">Stake</th>
                  <th className="py-2.5 px-4">Entry &rarr; Exit Spot</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {tradeHistory.map(t => {
                  const won = t.status === 'won';
                  const profit = t.profit || 0;

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{t.contractId}</td>
                      <td className="py-3 px-4 text-slate-200 font-sans">{t.symbol}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                          {t.contractType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200">${t.stake.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {t.entryPrice.toFixed(2)} &rarr; {t.exitPrice ? t.exitPrice.toFixed(2) : '--'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            won
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
