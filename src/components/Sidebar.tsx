import React from 'react';
import {
  TrendingUp,
  LineChart,
  Bot,
  PieChart,
  Settings,
  Shield,
  Home,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';
import { useTrading, AppView } from '../context/TradingContext';
import { sound } from '../services/sound';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeView, setActiveView, openPositions, bots } = useTrading();

  const activeBotsCount = bots.filter(b => b.status === 'running').length;

  const navItems: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string | number; badgeColor?: string }[] = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'terminal', label: 'Trade Terminal', icon: TrendingUp, badge: openPositions.length > 0 ? openPositions.length : undefined, badgeColor: 'bg-emerald-500 text-slate-950' },
    { id: 'analysis', label: 'Analysis Center', icon: LineChart },
    { id: 'bots', label: 'Bots Center', icon: Bot, badge: activeBotsCount > 0 ? `${activeBotsCount} Live` : undefined, badgeColor: 'bg-cyan-500 text-slate-950' },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin & Logs', icon: Shield }
  ];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Navigation Links */}
      <div className="p-2 space-y-1.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setActiveView(item.id);
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all relative group ${
                isActive
                  ? 'bg-slate-800/90 text-emerald-400 border border-slate-700/60 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />

              {!collapsed && (
                <div className="flex-1 text-left flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info & Collapse Toggle */}
      <div className="p-2 border-t border-slate-800/80 space-y-2">
        {!collapsed && (
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/70 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>DERIV API V3</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              OAuth 2.0 PKCE engine with server-side token encryption.
            </div>
          </div>
        )}

        <button
          onClick={() => {
            sound.playClick();
            setCollapsed(!collapsed);
          }}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/60 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
