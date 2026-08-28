import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  ShieldAlert
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { ContractType, DurationUnit } from '../../types';
import { sound } from '../../services/sound';

export const TradePanel: React.FC = () => {
  const {
    activeMarket,
    livePrice,
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
    activeAccount
  } = useTrading();

  const [oneClickTrading, setOneClickTrading] = useState<boolean>(false);

  // Contract Categories
  const contractTypes: { id: ContractType; label: string; desc: string }[] = [
    { id: 'CALL', label: 'Rise / Fall', desc: 'Price ends higher or lower than entry spot.' },
    { id: 'HIGHER', label: 'Higher / Lower', desc: 'Price ends strictly higher than barrier.' },
    { id: 'ONETOUCH', label: 'Touch / No Touch', desc: 'Wins if spot touches price target barrier.' },
    { id: 'MULTUP', label: 'Multipliers', desc: 'Amplified dynamic returns up to x100.' },
    { id: 'DIGITDIFF', label: 'Digits Differ', desc: '90%+ win rate statistical digit hunter.' }
  ];

  const durationUnits: { id: DurationUnit; label: string }[] = [
    { id: 't', label: 'Ticks' },
    { id: 's', label: 'Sec' },
    { id: 'm', label: 'Min' },
    { id: 'h', label: 'Hours' }
  ];

  const quickStakes = [5, 10, 25, 50, 100];

  const handleBuyAction = async () => {
    sound.playClick();
    await executeTrade('CALL');
  };

  const handleSellAction = async () => {
    sound.playClick();
    await executeTrade('PUT');
  };

  const netProfit = currentProposal?.netProfit || (stake * 0.95);
  const payout = currentProposal?.payout || (stake + netProfit);
  const payoutRate = currentProposal?.payoutPercentage || 95;

  return (
    <div className="w-full lg:w-80 bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between select-none text-slate-200">
      <div className="space-y-3.5">
        {/* Header: Contract Type Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Contract Type
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {contractTypes.slice(0, 4).map(ct => (
              <button
                key={ct.id}
                onClick={() => {
                  sound.playClick();
                  setContractType(ct.id);
                }}
                className={`py-1.5 px-2 rounded text-xs font-semibold transition-all ${
                  contractType === ct.id
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Digits selection if digit contract */}
        {contractType === 'DIGITDIFF' && (
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-semibold">Target Digit (0-9)</span>
              <span className="text-cyan-400 font-mono font-bold">Selected: {selectedDigit}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDigit(d)}
                  className={`py-1 rounded text-xs font-mono font-bold ${
                    selectedDigit === d
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duration Picker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Duration</span>
            </span>
            <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
              {durationUnits.map(unit => (
                <button
                  key={unit.id}
                  onClick={() => {
                    sound.playClick();
                    setDurationUnit(unit.id);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    durationUnit === unit.id
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {unit.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="3600"
              value={duration}
              onChange={e => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm font-mono font-bold text-white text-center"
            />
            <div className="flex gap-1">
              {[5, 10, 15, 30].map(v => (
                <button
                  key={v}
                  onClick={() => {
                    sound.playClick();
                    setDuration(v);
                  }}
                  className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stake Amount */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Stake (USD)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Bal: ${activeAccount?.balance.toFixed(2) || '10000.00'}
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              min="0.5"
              step="1"
              value={stake}
              onChange={e => setStake(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-base font-mono font-bold text-white text-center"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">USD</span>
          </div>

          {/* Quick Stake Chips */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {quickStakes.map(s => (
              <button
                key={s}
                onClick={() => {
                  sound.playClick();
                  setStake(s);
                }}
                className={`py-1 rounded text-xs font-mono font-bold border transition-colors ${
                  stake === s
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                +${s}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1 pt-0.5">
            <button
              onClick={() => {
                sound.playClick();
                setStake(Math.max(0.5, Math.round(stake / 2)));
              }}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-400"
            >
              1/2x
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setStake(Math.round(stake * 2));
              }}
              className="py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-400"
            >
              2x
            </button>
          </div>
        </div>

        {/* Payout & P/L ROI Summary */}
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Net Profit</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              +${netProfit.toFixed(2)} USD
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Payout</span>
            <span className="font-mono font-bold text-white">
              ${payout.toFixed(2)} USD
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400">Payout Return Rate</span>
            <span className="font-mono font-bold text-cyan-400">
              +{payoutRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Buy / Call & Sell / Put */}
      <div className="pt-4 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {/* Rise / Call / Higher Button */}
          <button
            onClick={handleBuyAction}
            disabled={isExecuting}
            className="group py-3.5 px-3 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold shadow-lg shadow-emerald-950/60 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
          >
            <div className="flex items-center gap-1.5 text-sm">
              <TrendingUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>RISE</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-200 font-normal">
              Higher &gt; Spot
            </span>
          </button>

          {/* Fall / Put / Lower Button */}
          <button
            onClick={handleSellAction}
            disabled={isExecuting}
            className="group py-3.5 px-3 rounded-lg bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold shadow-lg shadow-rose-950/60 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
          >
            <div className="flex items-center gap-1.5 text-sm">
              <TrendingDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>FALL</span>
            </div>
            <span className="text-[10px] font-mono text-rose-200 font-normal">
              Lower &lt; Spot
            </span>
          </button>
        </div>

        {/* One Click Trading Toggle & Environment Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={oneClickTrading}
              onChange={e => setOneClickTrading(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-0"
            />
            <span>Instant Execution</span>
          </label>

          <span className="font-mono text-[10px] text-amber-400">
            {activeAccount?.isVirtual ? 'DEMO SIMULATION' : 'LIVE DERIV'}
          </span>
        </div>
      </div>
    </div>
  );
};
