import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  FileEdit, 
  ShieldCheck, 
  Users, 
  GitCompare, 
  CreditCard 
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export type ActiveTab = 'dashboard' | 'inward' | 'processor' | 'qc' | 'member' | 'reconciliation' | 'ecard';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  qcPendingCount?: number;
  exceptionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  qcPendingCount = 2,
  exceptionCount = 1 
}) => {
  const { role } = useRole();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard & Metrics',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inward' as ActiveTab,
      label: 'Inward Management',
      icon: Inbox,
      badge: null
    },
    {
      id: 'processor' as ActiveTab,
      label: 'Processor Entry (5 Tabs)',
      icon: FileEdit,
      badge: role === 'PROCESSOR' ? 'Maker' : null
    },
    {
      id: 'qc' as ActiveTab,
      label: 'QC Approval (The Hinge)',
      icon: ShieldCheck,
      badge: qcPendingCount > 0 ? `${qcPendingCount} Pending` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'member' as ActiveTab,
      label: 'Member Processing Hub',
      icon: Users,
      badge: exceptionCount > 0 ? `${exceptionCount} Exc` : null,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'reconciliation' as ActiveTab,
      label: 'Dummy vs Live Match',
      icon: GitCompare,
      badge: null
    },
    {
      id: 'ecard' as ActiveTab,
      label: 'E-Card Card Center',
      icon: CreditCard,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5 flex-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Enrolment Lifecycle
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Context Helper Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            Maker-Checker Mode
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {role === 'PROCESSOR' && 'You are currently a Maker. You fill the 5 tabs and submit drafts for QC approval.'}
            {role === 'QC' && 'You are currently a Checker. You review policy schedules, approve to trigger member load, and sign off underwriting exceptions.'}
            {role === 'ADMIN' && 'You are a Supervisor. You oversee inward registrations, assignments, and audit logs.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
