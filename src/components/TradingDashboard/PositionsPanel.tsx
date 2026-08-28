import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { TradePosition, ClosedTrade } from '../../types';
import { sound } from '../../services/sound';

export const PositionsPanel: React.FC = () => {
  const { openPositions, tradeHistory, sellPosition, refreshPositions, activeMarket } = useTrading();
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');

  const filteredHistory = tradeHistory.filter(t => {
    if (filterSymbol === 'ALL') return true;
    return t.symbol === filterSymbol;
  });

  const exportHistoryCSV = () => {
    sound.playClick();
    if (tradeHistory.length === 0) return;

    const headers = ['Contract ID,Account,Symbol,Type,Stake,Payout,Entry Price,Exit Price,Entry Time,Exit Time,Status,Profit\n'];
    const rows = tradeHistory.map(t => [
      t.contractId,
      t.accountId,
      t.symbol,
      t.contractType,
      t.stake,
      t.payout,
      t.entryPrice,
      t.exitPrice || '',
      new Date(t.entryTime).toISOString(),
      t.exitTime ? new Date(t.exitTime).toISOString() : '',
      t.status,
      t.profit || 0
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `precisionedge_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-950 border border-slate-800/80 rounded-lg flex flex-col h-64 overflow-hidden select-none text-slate-200">
      {/* Header Tabs & Actions */}
      <div className="h-10 px-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('open');
            }}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'open'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Open Positions</span>
            {openPositions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold flex items-center justify-center">
                {openPositions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
            }}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Trade History</span>
            <span className="text-[10px] font-mono text-slate-400">({tradeHistory.length})</span>
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {activeTab === 'history' && (
            <button
              onClick={exportHistoryCSV}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              refreshPositions();
            }}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {activeTab === 'open' ? (
          openPositions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1 py-6">
              <Clock className="w-6 h-6 text-slate-400" />
              <p className="text-xs font-medium">No open positions</p>
              <p className="text-[10px] text-slate-400">Execute a RISE or FALL trade above to enter position</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 text-[10px] uppercase border-b border-slate-800/80">
                  <th className="py-2 px-3">Contract</th>
                  <th className="py-2 px-3">Market</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Stake</th>
                  <th className="py-2 px-3">Entry Spot</th>
                  <th className="py-2 px-3">Live Spot</th>
                  <th className="py-2 px-3">Time Left</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {openPositions.map(pos => {
                  const isCall = pos.contractType === 'CALL' || pos.contractType === 'HIGHER';

                  return (
                    <tr key={pos.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-200">{pos.contractId}</td>
                      <td className="py-2 px-3 text-slate-300 font-sans font-semibold">{pos.symbol}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCall
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                          }`}
                        >
                          {pos.contractType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-200">${pos.stake.toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-400">{pos.entryPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">{pos.currentPrice.toFixed(2)}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                          {pos.remainingSeconds}s
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => sellPosition(pos.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-semibold border border-slate-700 transition-colors"
                        >
                          Sell Early
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          /* History Tab */
          tradeHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1 py-6">
              <CheckCircle2 className="w-6 h-6 text-slate-400" />
              <p className="text-xs font-medium">No trade history yet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 text-[10px] uppercase border-b border-slate-800/80">
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Contract</th>
                  <th className="py-2 px-3">Market</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Stake</th>
                  <th className="py-2 px-3">Entry / Exit</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">P / L (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredHistory.map(t => {
                  const won = t.status === 'won';
                  const profit = t.profit || 0;

                  return (
                    <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2 px-3 text-[11px] text-slate-400">
                        {new Date(t.entryTime).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-bold">{t.contractId}</td>
                      <td className="py-2 px-3 text-slate-200 font-sans">{t.symbol}</td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {t.contractType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">${t.stake.toFixed(2)}</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">
                        {t.entryPrice.toFixed(2)} &rarr; {t.exitPrice ? t.exitPrice.toFixed(2) : '--'}
                      </td>
                      <td className="py-2 px-3">
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
                        className={`py-2 px-3 text-right font-bold text-xs ${
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
          )
        )}
      </div>
    </div>
  );
};
