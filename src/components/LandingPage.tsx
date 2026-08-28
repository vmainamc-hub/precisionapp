import React from 'react';
import {
  Zap,
  TrendingUp,
  LineChart,
  Bot,
  Shield,
  Radio,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles,
  BarChart3,
  Globe,
  Sliders
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { sound } from '../services/sound';

export const LandingPage: React.FC = () => {
  const { setActiveView, setIsAuthModalOpen, enableDemoMode, markets, livePrice } = useTrading();

  const handleConnectDeriv = () => {
    sound.playClick();
    setIsAuthModalOpen(true);
  };

  const handleTryDemo = async () => {
    sound.playClick();
    await enableDemoMode();
    setActiveView('terminal');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 select-none">
      {/* Live Market Ticker Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 py-2 overflow-x-auto whitespace-nowrap px-4 text-xs font-mono">
        <div className="flex items-center gap-6 animate-none max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE DERIV FEEDS:</span>
          </div>
          {markets.slice(0, 7).map(m => (
            <div key={m.symbol} className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400 font-semibold">{m.name}:</span>
              <span className="text-white font-bold">{m.basePrice.toFixed(m.digits)}</span>
              <span className={m.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {m.change24h >= 0 ? '+' : ''}{m.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">PrecisionEdge v2.4</span>
            <span className="text-slate-500">|</span>
            <span>Deriv API V3 Gateway Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Trade Smarter. Analyze Deeper.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Execute with Precision.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Professional third-party web trading platform designed specifically for Deriv synthetic indices, binary options, multipliers, and financial markets. High-performance interactive charts, automated bot strategies, and multi-tier risk management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleConnectDeriv}
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Shield className="w-4 h-4" />
              <span>Connect Deriv Account</span>
            </button>

            <button
              onClick={handleTryDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Try Instant $10k Demo</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveView('settings');
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-cyan-400 border border-cyan-900/60 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verify Deriv Config &amp; PKCE</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-slate-800/80 text-left">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Tick Latency</span>
              <span className="text-xl font-bold font-mono text-emerald-400">&lt; 25 ms</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Synthetic Indices</span>
              <span className="text-xl font-bold font-mono text-white">24/7 / 365</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-mono block">OAuth Flow</span>
              <span className="text-xl font-bold font-mono text-cyan-400">PKCE SHA-256</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Auto Strategies</span>
              <span className="text-xl font-bold font-mono text-amber-400">5 Engine Models</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Terminal Snapshot */}
        <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/80 p-2 sm:p-4 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-slate-300 font-bold ml-2">PrecisionEdge Trading Terminal Preview</span>
            </div>
            <button
              onClick={() => setActiveView('terminal')}
              className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Launch Live Workstation</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
            <div className="md:col-span-2 bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">Volatility 100 Index</span>
                  <span className="text-white font-bold">{livePrice.toFixed(2)}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                  95% Payout Active
                </span>
              </div>
              <div className="h-44 bg-slate-900/60 rounded flex items-center justify-center border border-slate-800/60 text-slate-500 text-xs font-mono">
                [ 60 FPS HTML5 Canvas Chart with EMA 9/21, Bollinger Bands &amp; RSI ]
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between space-y-3 text-xs">
              <div className="space-y-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Order Ticket</span>
                <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800 font-mono">
                  <span className="text-slate-400">Stake</span>
                  <span className="text-white font-bold">$25.00 USD</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800 font-mono">
                  <span className="text-slate-400">Potential Return</span>
                  <span className="text-emerald-400 font-bold">+$23.75 USD</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveView('terminal')}
                  className="py-2 rounded bg-emerald-600 text-white font-bold text-center"
                >
                  RISE
                </button>
                <button
                  onClick={() => setActiveView('terminal')}
                  className="py-2 rounded bg-rose-600 text-white font-bold text-center"
                >
                  FALL
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Engineered for Precision Trading
          </h2>
          <p className="text-sm text-slate-400">
            Every module is tuned for microsecond response times and institutional risk compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Institutional Trading Terminal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trade Rise/Fall, Higher/Lower, Touch/No-Touch, Multipliers and Digits contracts with instant order routing, one-click execution, and dynamic early sell-back options.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Advanced Technical Analysis Center</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-timeframe trend matrix, automated support &amp; resistance level detection, RSI (14), MACD, Bollinger Bands, and live algorithmic market scanner.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Automated Trading Bots Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deploy pre-configured Martingale Trend Followers, RSI Mean Reversion, Bollinger Scalpers, and Digits Differ hunters with strict Stop-Loss and Take-Profit guardrails.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Multi-Tier Risk Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Account-level daily maximum drawdown circuit breaker, max concurrent open positions limiter, and automated consecutive loss cooldown triggers.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Real-Time Market Data Stream</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-second tick streaming across continuous synthetic volatility indices, Crash/Boom step engines, major FX currency pairs, and top crypto assets.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Enterprise Security &amp; Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deriv OAuth 2.0 PKCE with SHA-256 challenges, server-side secret isolation, zero browser token exposure, and immutable audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* Security Architecture Showcase */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-800/80 bg-slate-900/30 rounded-2xl my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 text-xs font-mono text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero Client Credential Leakage</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Built on Institutional OAuth 2.0 PKCE Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Unlike amateur web applications that store Deriv API tokens directly in local browser storage, PrecisionEdge routes all authentications through secure server-side PKCE handshakes.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SHA-256 code challenge generation on server</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted session tokens &amp; CSRF protection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Isolated Node.js proxy to Deriv WebSocket Gateway</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-slate-500 pb-1 border-b border-slate-800">// Deriv OAuth 2.0 PKCE Pipeline</div>
            <div className="text-cyan-400">POST /api/auth/pkce/init &rarr; code_challenge (S256)</div>
            <div className="text-emerald-400">GET https://auth.deriv.com/oauth2/auth?response_type=code</div>
            <div className="text-amber-400">POST /api/auth/deriv/callback &rarr; Server Token Exchange</div>
            <div className="text-purple-400">WSS wss://api.derivws.com/trading/v1/options/ws</div>
            <div className="text-slate-400 pt-2 border-t border-slate-800/80 text-[11px]">
              Status: <span className="text-emerald-400 font-bold">READY FOR LIVE CONNECTION</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Deriv Regulatory Disclaimer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 md:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-sm text-white">PrecisionEdge</span>
              <span className="text-[11px] text-slate-400">| Trade Smarter. Analyze Deeper. Execute with Precision.</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-xs">
              <button onClick={() => setActiveView('terminal')} className="hover:text-white">Terminal</button>
              <button onClick={() => setActiveView('analysis')} className="hover:text-white">Analysis</button>
              <button onClick={() => setActiveView('bots')} className="hover:text-white">Bots</button>
              <button onClick={() => setActiveView('portfolio')} className="hover:text-white">Portfolio</button>
              <button onClick={() => setActiveView('settings')} className="hover:text-white">Settings</button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] leading-relaxed text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300 uppercase font-mono">Third-Party Platform &amp; Risk Disclosure</p>
            <p>
              PrecisionEdge is an independent third-party trading interface built to integrate with the Deriv API. PrecisionEdge is not owned by or directly affiliated with Deriv. Deriv is a registered trademark of Deriv Services Ltd.
            </p>
            <p>
              Trading synthetic indices, binary options, multipliers, and CFDs carries a high level of risk and may not be suitable for all investors. You should ensure that you fully understand the risks involved before entering any transactions. Never risk capital you cannot afford to lose. All technical signals and bot strategies are decision support tools only and do not constitute financial advice.
            </p>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-4 border-t border-slate-900">
            <span>&copy; 2026 PrecisionEdge Technologies. All rights reserved.</span>
            <span className="font-mono text-emerald-400">DERIV API COMPLIANT GATEWAY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
