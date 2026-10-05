import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, Radio } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { activeToast, dismissToast } = useWebSocket();

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (activeToast.type) {
      case 'SUCCESS':
        return 'border-l-4 border-l-emerald-500';
      case 'WARNING':
        return 'border-l-4 border-l-amber-500';
      case 'ERROR':
        return 'border-l-4 border-l-rose-500';
      default:
        return 'border-l-4 border-l-blue-500';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className={`bg-white rounded-xl shadow-2xl border border-slate-200/80 p-4 flex items-start gap-3.5 backdrop-blur-md bg-white/95 ${getBorderColor()}`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              Live WebSocket Notification
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 leading-snug">{activeToast.title}</h4>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{activeToast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
