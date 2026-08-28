import React, { useState } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Navbar } from './components/Navbar';
import { SmartTraderView } from './components/SmartTrader/SmartTraderView';
import { DigitsView } from './components/DigitsCenter/DigitsView';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { BotsCenter } from './components/BotsCenter/BotsCenter';
import { HistoryView } from './components/History/HistoryView';
import { AccountView } from './components/Account/AccountView';
import { AuthModal } from './components/AuthModal';
import { MarketModal } from './components/TradingDashboard/MarketModal';
import { NotificationToast } from './components/NotificationToast';
import { OAuthCallback } from './components/OAuthCallback';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView } = useTrading();
  const [isMarketModalOpen, setIsMarketModalOpen] = useState<boolean>(false);

  // Check if current URL is an OAuth callback
  const [isOAuthCallback, setIsOAuthCallback] = useState<boolean>(() => {
    const p = window.location.pathname.toLowerCase();
    const s = window.location.search;
    const h = window.location.hash;
    return (
      p.includes('/callback') ||
      p.endsWith('callback') ||
      s.includes('code=') ||
      s.includes('token1=') ||
      s.includes('error=') ||
      s.includes('acct1=') ||
      h.includes('code=') ||
      h.includes('token1=') ||
      h.includes('error=')
    );
  });

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Horizontal Top Navigation */}
      <Navbar onOpenMarketModal={() => setIsMarketModalOpen(true)} />

      {/* Main Content Workspace (Full Width, No Left Sidebar) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isOAuthCallback ? (
          <OAuthCallback onComplete={() => setIsOAuthCallback(false)} />
        ) : activeView === 'dashboard' || activeView === 'landing' ? (
          <DashboardOverview onOpenMarketModal={() => setIsMarketModalOpen(true)} />
        ) : activeView === 'digits' || activeView === 'analysis' ? (
          <DigitsView onTradeDigit={() => setActiveView('smarttrader')} />
        ) : activeView === 'bots' ? (
          <BotsCenter />
        ) : activeView === 'history' || activeView === 'portfolio' ? (
          <HistoryView />
        ) : activeView === 'account' || activeView === 'settings' || activeView === 'admin' ? (
          <AccountView />
        ) : (
          <SmartTraderView onOpenMarketModal={() => setIsMarketModalOpen(true)} />
        )}
      </main>

      {/* Global Modals & Notifications */}
      <AuthModal />
      <MarketModal
        isOpen={isMarketModalOpen}
        onClose={() => setIsMarketModalOpen(false)}
      />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <TradingProvider>
      <MainLayout />
    </TradingProvider>
  );
}
