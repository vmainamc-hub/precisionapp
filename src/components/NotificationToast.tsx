import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useTrading } from '../context/TradingContext';

export const NotificationToast: React.FC = () => {
  const { toasts, removeToast } = useTrading();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let Icon = Info;
        let borderColor = 'border-slate-700';
        let iconColor = 'text-cyan-400';
        let bgGradient = 'from-slate-900 via-slate-900 to-slate-950';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'border-emerald-700/60';
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderColor = 'border-rose-700/60';
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderColor = 'border-amber-700/60';
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-lg border bg-gradient-to-r ${bgGradient} ${borderColor} shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-100">{toast.title}</div>
              <div className="text-xs text-slate-300 break-words leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
