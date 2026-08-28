import React, { useEffect, useState, useRef } from 'react';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  RotateCcw,
  Cpu,
  Lock,
  ExternalLink,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { useTrading } from '../context/TradingContext';
import { sound } from '../services/sound';

interface ParsedAuthParams {
  code?: string | null;
  state?: string | null;
  token1?: string | null;
  acct1?: string | null;
  cur1?: string | null;
  token2?: string | null;
  acct2?: string | null;
  cur2?: string | null;
  error?: string | null;
  errorDescription?: string | null;
  errorCode?: string | null;
}

export const OAuthCallback: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { refreshAuth, setActiveView, addToast, enableDemoMode, setIsAuthModalOpen } = useTrading();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [step, setStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [authenticatedAccount, setAuthenticatedAccount] = useState<{
    loginId: string;
    isVirtual: boolean;
    currency: string;
    balance: number;
  } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);
  const hasExecutedRef = useRef<boolean>(false);

  // Parse authorization parameters from query search & hash fragment
  const parseAuthParams = (): ParsedAuthParams => {
    const searchParams = new URLSearchParams(window.location.search);
    
    // Hash might contain #/callback?params or #params
    let hashString = window.location.hash.replace(/^#/, '');
    if (hashString.includes('?')) {
      hashString = hashString.split('?')[1];
    }
    const hashParams = new URLSearchParams(hashString);

    const getParam = (key: string) => searchParams.get(key) || hashParams.get(key);

    return {
      code: getParam('code'),
      state: getParam('state'),
      token1: getParam('token1'),
      acct1: getParam('acct1'),
      cur1: getParam('cur1'),
      token2: getParam('token2'),
      acct2: getParam('acct2'),
      cur2: getParam('cur2'),
      error: getParam('error'),
      errorDescription: getParam('error_description') || getParam('message') || getParam('reason'),
      errorCode: getParam('error_code')
    };
  };

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const executeCallback = async () => {
      const params = parseAuthParams();

      // Check for explicit error returned by Deriv
      if (params.error || params.errorCode) {
        setStatus('error');
        sound.playLoss();
        const errTitle = params.error === 'access_denied' 
          ? 'Deriv Authorization Denied'
          : `Deriv OAuth Error: ${params.error || params.errorCode}`;
        
        const errDesc = params.errorDescription || 
          (params.error === 'access_denied'
            ? 'The authorization request was cancelled on the Deriv sign-in screen.'
            : 'Deriv could not complete the authorization exchange. Please check your App ID and redirect URI configuration.');

        setErrorMessage(errTitle);
        setErrorDetails(errDesc);
        return;
      }

      // Check if neither code nor token parameters exist
      if (!params.code && !params.token1) {
        setStatus('error');
        setErrorMessage('No Authorization Data Received');
        setErrorDetails('Deriv did not return a valid PKCE code or account token. Please initiate authorization again from PrecisionEdge.');
        return;
      }

      try {
        setStep(2); // Exchanging on server
        let result: any = null;

        if (params.code) {
          // OAuth 2.0 PKCE Code Exchange
          result = await api.handleOAuthCallback({
            code: params.code,
            state: params.state || undefined
          });
        } else if (params.token1 && params.acct1) {
          // Direct token parameters from Deriv
          result = await api.handleOAuthCallback({
            token1: params.token1,
            acct1: params.acct1,
            token2: params.token2 || undefined,
            acct2: params.acct2 || undefined,
            state: params.state || undefined
          });
        }

        setStep(3); // Syncing account context
        await refreshAuth();
        sound.playWin();

        const activeAcc = result?.activeAccount || {
          loginId: params.acct1 || 'VRTC_AUTHORIZED',
          isVirtual: (params.acct1 || '').startsWith('VRT') || (params.acct1 || '').startsWith('VRTC'),
          currency: params.cur1 || 'USD',
          balance: 10000.00
        };

        setAuthenticatedAccount(activeAcc);
        setStatus('success');
        addToast(
          'success',
          'Deriv Connected Successfully',
          `Authorized account ${activeAcc.loginId} (${activeAcc.isVirtual ? 'Demo' : 'Real'})`
        );

        // Notify opener window if popup was used
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({ type: 'DERIV_AUTH_SUCCESS', account: activeAcc }, '*');
          } catch (e) {
            // cross-origin popup broadcast catch
          }
        }
      } catch (err: any) {
        console.error('Deriv OAuth Exchange Failed', err);
        setStatus('error');
        sound.playLoss();
        setErrorMessage('Authentication Exchange Failed');
        setErrorDetails(err.message || 'Failed to exchange authorization code with Deriv server.');
      }
    };

    executeCallback();
  }, [refreshAuth, addToast]);

  // Countdown timer for automatic redirect to dashboard
  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNavigateToDashboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleNavigateToDashboard = () => {
    sound.playClick();
    // Clean URL params back to root /
    try {
      const cleanUrl = window.location.origin + window.location.pathname.replace(/\/callback\/?$/, '') || '/';
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (e) {
      // ignore
    }
    if (onComplete) onComplete();
    setActiveView('terminal');
  };

  const handleRetryOAuth = async () => {
    try {
      sound.playClick();
      setStatus('loading');
      setStep(1);
      setErrorMessage('');
      const res = await api.initPkceOAuth();
      window.location.href = res.authUrl;
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('Failed to restart Deriv OAuth');
      setErrorDetails(err.message || 'Could not initiate PKCE challenge.');
    }
  };

  const handleFallbackDemo = async () => {
    try {
      sound.playClick();
      await enableDemoMode();
      handleNavigateToDashboard();
    } catch (err) {
      handleNavigateToDashboard();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 text-slate-100 min-h-[500px]">
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-lg w-full text-center space-y-5 shadow-2xl relative overflow-hidden">
        {/* Glow Header Background */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            status === 'loading'
              ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 animate-pulse'
              : status === 'success'
              ? 'bg-emerald-500'
              : 'bg-rose-500'
          }`}
        />

        {/* Central Icon */}
        <div className="pt-2">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-inner ${
              status === 'loading'
                ? 'bg-slate-950 border-emerald-500/40 text-emerald-400'
                : status === 'success'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                : 'bg-rose-950/60 border-rose-500 text-rose-400'
            }`}
          >
            {status === 'loading' && <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-emerald-400 animate-in zoom-in-50 duration-300" />}
            {status === 'error' && <AlertCircle className="w-8 h-8 text-rose-400 animate-in zoom-in-50 duration-300" />}
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {status === 'loading' && 'Authenticating with Deriv'}
            {status === 'success' && 'Deriv Account Connected!'}
            {status === 'error' && (errorMessage || 'Authentication Failed')}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            {status === 'loading' && 'Validating cryptographic PKCE state & establishing authorized connection...'}
            {status === 'success' && 'Secure token exchange complete. Your active account is ready for trading.'}
            {status === 'error' && (errorDetails || 'The authorization request could not be completed.')}
          </p>
        </div>

        {/* Loading Progress Stepper */}
        {status === 'loading' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2.5 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span className={step >= 1 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                1. Received authorization code from Deriv
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span className={step >= 2 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                2. Verifying SHA-256 code challenge on Node backend
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span className={step >= 3 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                3. Synchronizing balances &amp; WebSockets feeds
              </span>
            </div>
          </div>
        )}

        {/* Success Account Preview */}
        {status === 'success' && authenticatedAccount && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/60 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Authorized Account:</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                    authenticatedAccount.isVirtual
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  }`}
                >
                  {authenticatedAccount.isVirtual ? 'Virtual / Demo' : 'Real Account'}
                </span>
                <span className="font-mono font-bold text-white">{authenticatedAccount.loginId}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Available Balance:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                ${authenticatedAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {authenticatedAccount.currency}
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNavigateToDashboard}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Launch PrecisionEdge Dashboard ({redirectCountdown}s)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error Actions & Troubleshooting */}
        {status === 'error' && (
          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Troubleshooting Tips:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>Check that your Deriv App ID is registered with redirect URI: <code className="text-cyan-300 font-mono">https://precisionedge.ai.studio/callback</code></li>
                <li>Make sure third-party cookies or pop-up blockers are not interrupting the redirect</li>
                <li>You can always use the instant $10,000 USD virtual demo account for testing</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleRetryOAuth}
                className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Deriv Login</span>
              </button>

              <button
                onClick={handleFallbackDemo}
                className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Try Demo Account</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  sound.playClick();
                  const cleanUrl = window.location.origin + window.location.pathname.replace(/\/callback\/?$/, '') || '/';
                  window.history.replaceState({}, document.title, cleanUrl);
                  if (onComplete) onComplete();
                  setActiveView('landing');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Overview
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  const cleanUrl = window.location.origin + window.location.pathname.replace(/\/callback\/?$/, '') || '/';
                  window.history.replaceState({}, document.title, cleanUrl);
                  if (onComplete) onComplete();
                  setActiveView('settings');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>View Config Status</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
