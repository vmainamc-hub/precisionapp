import React, { useState } from 'react';
import {
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Flame,
  Globe,
  Coins,
  Gem,
  Check
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { SymbolInfo } from '../../types';
import { sound } from '../../services/sound';

export const MarketModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { markets, activeMarket, setActiveMarket, livePrice } = useTrading();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Markets' },
    { id: 'synthetics', label: 'Synthetics', icon: Flame },
    { id: 'forex', label: 'Forex', icon: Globe },
    { id: 'crypto', label: 'Crypto', icon: Coins },
    { id: 'commodities', label: 'Commodities', icon: Gem }
  ];

  const filteredMarkets = markets.filter(m => {
    const matchesCat = activeCategory === 'all' || m.category === activeCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectMarket = (m: SymbolInfo) => {
    sound.playClick();
    setActiveMarket(m);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-200">
        {/* Header with Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Select Trading Market</h3>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by index name, symbol (e.g. Volatility 100, Crash, EUR/USD)..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-white placeholder-slate-500"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Market List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {filteredMarkets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No markets matched your search criteria.
            </div>
          ) : (
            filteredMarkets.map(m => {
              const isSelected = activeMarket.symbol === m.symbol;
              const isPositive = m.change24h >= 0;

              return (
                <button
                  key={m.symbol}
                  onClick={() => handleSelectMarket(m)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border border-emerald-500/50 shadow'
                      : 'hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                      {m.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100">{m.name}</span>
                        {m.isPopular && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/50">
                            HOT
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        {m.description}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-bold text-xs text-white">
                      {m.basePrice.toLocaleString('en-US', {
                        minimumFractionDigits: m.digits,
                        maximumFractionDigits: m.digits
                      })}
                    </div>
                    <div
                      className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {m.change24h.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
          <span>{filteredMarkets.length} Available Deriv Asset Feeds</span>
          <span>Deriv Synthetic Random-Walk &amp; Financials</span>
        </div>
      </div>
    </div>
  );
};
