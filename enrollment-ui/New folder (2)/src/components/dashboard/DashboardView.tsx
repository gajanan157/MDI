import React, { useEffect, useState } from 'react';
import { 
  Inbox, 
  FileEdit, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Users, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { StageCounts } from '../../types';
import { getStageCounts } from '../../services/api';
import { ActiveTab } from '../common/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [counts, setCounts] = useState<StageCounts>({
    total: 12,
    inwardGenerated: 3,
    processorPending: 4,
    qcPending: 2,
    underwritingExceptions: 1,
    completed: 2
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStageCounts().then((data) => {
      setCounts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-2 border border-indigo-400/20">
            <Activity className="w-3.5 h-3.5 text-indigo-300" />
            Operations Command Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight">MD India Health Insurance TPA</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Corporate health policy onboarding engine with automated PSU schedule intake, 
            Maker-Checker governance, Layer 3 rule validation, and instant E-Card generation.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('inward')}
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2"
          >
            <Inbox className="w-4 h-4 text-indigo-600" />
            New Inward Intake
          </button>
          <button
            onClick={() => onNavigate('qc')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/30 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Review QC Queue ({counts.qcPending})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Inward Intake */}
        <div 
          onClick={() => onNavigate('inward')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inward Intake</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{counts.total}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">files received</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
            View inward registry <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Maker In Progress */}
        <div 
          onClick={() => onNavigate('processor')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Processor Drafts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{counts.processorPending}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">in maker draft</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
            Edit 5-tab schedules <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* QC Approval Pending (The Hinge) */}
        <div 
          onClick={() => onNavigate('qc')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">QC Pending</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-indigo-900">{counts.qcPending}</span>
            <span className="text-xs text-indigo-600 ml-1.5 font-semibold">The Hinge Queue</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
            Checker approval <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Underwriting Exceptions */}
        <div 
          onClick={() => onNavigate('member')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">UW Exceptions</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-rose-600">{counts.underwritingExceptions}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">needs sign-off</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
            Clear exceptions <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Completed & Live Policies */}
        <div 
          onClick={() => onNavigate('member')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Policies</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600">{counts.completed}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">active & carded</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            View roster <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Lifecycle Flowchart Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">End-to-End Enrollment Architecture</h3>
        <p className="text-xs text-slate-500 mb-6">
          How policy paperwork travels from inward registration to digital card issuance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Step 1 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage 1</span>
              <h4 className="text-xs font-bold text-slate-800 mt-1">1. Inward Intake</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Upload policy PDF schedule, Excel member roster, and PSU XML file. Generates unique Inward No.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
              <span>inward-service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage 2</span>
              <h4 className="text-xs font-bold text-slate-800 mt-1">2. Maker Entry (5 Tabs)</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Processor fills Insurer, Corporate, Policy Terms, Broker, and SPOC tabs. Saves drafts progressively.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
              <span>policy-service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 3 - The Hinge */}
          <div className="bg-indigo-50/70 border-2 border-indigo-500 rounded-xl p-4 flex flex-col justify-between relative shadow-sm">
            <div className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
              The Hinge
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Stage 3 (Checker)</span>
              <h4 className="text-xs font-bold text-indigo-950 mt-1">3. QC Policy Approval</h4>
              <p className="text-[11px] text-indigo-900/80 mt-1">
                QC verifies policy schedule. Approval creates live policy, returns policyId, and starts background member processing.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-indigo-200 flex items-center justify-between text-[11px] text-indigo-700 font-bold">
              <span>v1/enroll/policy/QC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage 4</span>
              <h4 className="text-xs font-bold text-slate-800 mt-1">4. Member Rule Engine</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Evaluates Layer 3 family rules (Spouse, Child, Parents). Rows route to Enrolled, Failed, Discrepancy, or Exception queues.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
              <span>member-service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage 5</span>
              <h4 className="text-xs font-bold text-slate-800 mt-1">5. Card Issuance</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                UHID and Health Card IDs issued. Instant generation of branded PDF E-Cards with emergency cashless info.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
              <span>ecard-service</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SLA & Operating Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800">SLA & Turnaround Standards</h4>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-600">Inward to Processor Assignment</span>
              <span className="font-semibold text-emerald-600">&lt; 2 hours</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-600">Processor Drafting & QC Review</span>
              <span className="font-semibold text-emerald-600">&lt; 4 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Member Ingestion (5k Roster)</span>
              <span className="font-semibold text-emerald-600">&lt; 30 seconds</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800">Maker-Checker Compliance</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every policy schedule requires explicit dual authorization. Inward drafts cannot be pushed to live 
            service without a designated QC Checker verification against the underwritten PDF schedule.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
            <span>Audit Trail Enforced</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800">Event-Driven Architecture</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Powered by Kafka KRaft message brokers, PostgreSQL, Spring Boot 3.3 Virtual Threads, 
            and Apache APISIX Gateway for sub-millisecond route dispatch.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            <span>Kafka KRaft Topics Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
