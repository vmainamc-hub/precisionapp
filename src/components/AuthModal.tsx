import React, { useState } from 'react';
import {
  X,
  Shield,
  Key,
  Globe,
  CheckCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  AlertCircle,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { api } from '../services/api';
import { sound } from '../services/sound';
import { ConfigValidationView } from './ConfigValidation/ConfigValidationView';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, enableDemoMode, refreshAuth, addToast } = useTrading();
  const [tab, setTab] = useState<'oauth' | 'token' | 'demo' | 'validator'>('oauth');
  const [apiToken, setApiToken] = useState('');
  const [isVirtualToken, setIsVirtualToken] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleOAuthInit = async (openInPopup: boolean = false) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      sound.playClick();
      const res = await api.initPkceOAuth();
      addToast('info', 'Connecting to Deriv', 'Redirecting to Deriv OAuth 2.0 PKCE authentication flow...');
      
      if (openInPopup === true) {
        const popup = window.open(res.authUrl, 'DerivOAuth', 'width=600,height=750,scrollbars=yes,status=yes');
        const handleMessage = async (event: MessageEvent) => {
          if (event.data?.type === 'DERIV_AUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            await refreshAuth();
            setIsAuthModalOpen(false);
            if (popup && !popup.closed) {
              try {
                popup.close();
              } catch (e) {
                // ignore
              }
            }
          }
        };
        window.addEventListener('message', handleMessage);
      } else {
        // Direct browser redirect to Deriv (standard Web OAuth 2.0)
        window.location.href = res.authUrl;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize OAuth PKCE flow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiToken.trim()) {
      setErrorMessage('Please enter your Deriv API token');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      sound.playClick();
      const res = await api.connectWithToken(apiToken, isVirtualToken);
      await refreshAuth();
      sound.playWin();
      addToast('success', 'Connected to Deriv', `Authenticated account ${res.account.loginId}`);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      sound.playLoss();
      setErrorMessage(err.message || 'Failed to authenticate Deriv token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoActivate = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await enableDemoMode();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-slate-900 border border-slate-800 rounded-xl w-full shadow-2xl overflow-hidden text-slate-200 ${tab === 'validator' ? 'max-w-4xl max-h-[90vh] overflow-y-auto' : 'max-w-lg'}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Deriv Account Gateway</h3>
              <p className="text-[11px] text-slate-400">Secure OAuth 2.0 PKCE &amp; API Token Architecture</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setIsAuthModalOpen(false);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setTab('oauth')}
            className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              tab === 'oauth'
                ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deriv OAuth 2.0</span>
          </button>
          <button
            onClick={() => setTab('token')}
            className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              tab === 'token'
                ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Token</span>
          </button>
          <button
            onClick={() => setTab('demo')}
            className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              tab === 'demo'
                ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Instant Demo</span>
          </button>
          <button
            onClick={() => setTab('validator')}
            className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              tab === 'validator'
                ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Config Status</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {tab === 'oauth' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PKCE (Proof Key for Code Exchange) Flow</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  PrecisionEdge uses the official Deriv OAuth 2.0 protocol with SHA-256 code challenge. Tokens are exchanged exclusively on our secure Node.js backend.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-400">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Zero browser secret leak</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Per-user session isolation</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOAuthInit(false)}
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Authorize with Deriv Account</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setTab('validator')}
                className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Need to verify Deriv App ID and Redirect URI? View Config Validator →
              </button>
            </div>
          )}

          {tab === 'token' && (
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deriv API Token
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={e => setApiToken(e.target.value)}
                  placeholder="Paste your Deriv API token (e.g., a1-xxx...)"
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs font-mono text-white placeholder-slate-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Generate tokens in your Deriv Account Settings &gt; API Token (Read, Trade, Admin scopes recommended).
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tokenEnv"
                    checked={isVirtualToken}
                    onChange={() => setIsVirtualToken(true)}
                    className="text-emerald-500 focus:ring-0"
                  />
                  <span className="text-amber-400">Virtual / Demo Token</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tokenEnv"
                    checked={!isVirtualToken}
                    onChange={() => setIsVirtualToken(false)}
                    className="text-emerald-500 focus:ring-0"
                  />
                  <span className="text-emerald-400">Real Account Token</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Connect & Validate Token</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {tab === 'demo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-emerald-400 text-sm">Instant $10,000 Demo Environment</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Start trading immediately with 10,000 USD virtual balance. Test all 18+ synthetic indices, forex pairs, automated bots, technical indicators, and risk management tools without risk.
                </p>
              </div>

              <button
                onClick={handleDemoActivate}
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>Load Virtual Account ($10,000 USD)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {tab === 'validator' && (
            <ConfigValidationView
              isModal={true}
              onConnectClick={() => setTab('oauth')}
              onDemoClick={() => setTab('demo')}
              onClose={() => setIsAuthModalOpen(false)}
            />
          )}
        </div>

        {/* Security Notice Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Encrypted Server-Side Architecture</span>
          </div>
          <span>Deriv API Compatible</span>
        </div>
      </div>
    </div>
  );
};
