import React, { useState, useEffect } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { TradingDashboard } from './components/TradingDashboard/TradingDashboard';
import { AnalysisCenter } from './components/AnalysisCenter/AnalysisCenter';
import { BotsCenter } from './components/BotsCenter/BotsCenter';
import { PortfolioView } from './components/Portfolio/PortfolioView';
import { SettingsView } from './components/Settings/SettingsView';
import { AdminView } from './components/Admin/AdminView';
import { AuthModal } from './components/AuthModal';
import { MarketModal } from './components/TradingDashboard/MarketModal';
import { NotificationToast } from './components/NotificationToast';
import { OAuthCallback } from './components/OAuthCallback';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView } = useTrading();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
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
      {/* Top Header Navbar */}
      <Navbar onOpenMarketModal={() => setIsMarketModalOpen(true)} />

      {/* Body Area: Sidebar + Active View Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {isOAuthCallback ? (
            <OAuthCallback onComplete={() => setIsOAuthCallback(false)} />
          ) : activeView === 'landing' ? (
            <LandingPage />
          ) : activeView === 'terminal' ? (
            <TradingDashboard onOpenMarketModal={() => setIsMarketModalOpen(true)} />
          ) : activeView === 'analysis' ? (
            <AnalysisCenter onSelectMarket={(symbol) => {
              // Select market and transition to terminal
              setActiveView('terminal');
            }} />
          ) : activeView === 'bots' ? (
            <BotsCenter />
          ) : activeView === 'portfolio' ? (
            <PortfolioView />
          ) : activeView === 'settings' ? (
            <SettingsView />
          ) : activeView === 'admin' ? (
            <AdminView />
          ) : (
            <TradingDashboard onOpenMarketModal={() => setIsMarketModalOpen(true)} />
          )}
        </main>
      </div>

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
