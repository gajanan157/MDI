import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { Bell, Radio, Shield, UserCheck, Settings, ShieldCheck } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

export const Header: React.FC = () => {
  const { role, setRole, userName } = useRole();
  const { isConnected, unreadCount } = useWebSocket();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & System Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">MD INDIA</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200/50">TPA</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Corporate Health Enrollment System</p>
            </div>
          </div>

          {/* Center: Maker-Checker Role Switcher */}
          <div className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 px-3 flex items-center gap-1">
              Active Role:
            </span>
            <button
              onClick={() => setRole('PROCESSOR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'PROCESSOR'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Processor (Maker)
            </button>
            <button
              onClick={() => setRole('QC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'QC'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              QC (Checker)
            </button>
            <button
              onClick={() => setRole('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'ADMIN'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* Right: WebSocket Indicator & Notifications & User Profile */}
          <div className="flex items-center gap-3">
            {/* Real-time WebSocket Status Pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                : 'bg-amber-50 text-amber-700 border-amber-200/60'
            }`}>
              <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              <span className="text-[11px] font-semibold">{isConnected ? 'WebSocket Online' : 'WS Reconnecting'}</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{userName}</p>
                <p className="text-[11px] text-indigo-600 font-semibold">{role} Role</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Notification Panel */}
      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
