import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Building, 
  Briefcase, 
  FileText, 
  Coins, 
  ArrowRight, 
  Check, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { approvePolicyQC } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { ActiveTab } from '../common/Sidebar';

interface QCApprovalViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const QCApprovalView: React.FC<QCApprovalViewProps> = ({ onNavigate }) => {
  const { broadcastNotification } = useWebSocket();
  const [inwardNo] = useState('INW-2026-1001');
  const [isApproving, setIsApproving] = useState(false);
  const [approvedPolicyId, setApprovedPolicyId] = useState<string | null>(null);

  // Verification Checklist State
  const [checks, setChecks] = useState({
    insurerVerified: true,
    premiumVerified: true,
    datesVerified: true,
    rosterAttached: true
  });

  const allChecked = Object.values(checks).every(Boolean);

  const mockDraft = {
    insurerName: 'The New India Assurance Co. Ltd (PSU)',
    branchCode: 'NIA-PUN-01 (Branch 110200)',
    corporateName: 'Tata Consultancy Services Ltd',
    corporateId: 'CORP-201',
    policyNumber: '110200/34/26/10000492',
    policyRecordType: 'LIVE' as const,
    policyPlan: 'FLOATER',
    sumInsured: 500000,
    netPremium: 4500000,
    grossPremium: 5310000,
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    familyDefinition: '1E+1S+2C (Self + Spouse + 2 Children)',
    brokerName: 'Marsh McLennan Insurance Brokers Pvt Ltd',
    processorName: 'Rahul Sharma (Processor Maker)'
  };

  const handleApprove = async () => {
    setIsApproving(true);
    
    // Simulate API call to POST /v1/enroll/policy/QC
    const res = await approvePolicyQC(inwardNo, {
      insurerObject: {
        insurerId: 'INS-001',
        insurerName: mockDraft.insurerName,
        insurerType: 'PSU',
        issuingOfficeCode: 'NIA-PUN-01',
        issuingOfficeName: mockDraft.branchCode
      },
      corporateObject: {
        corporateId: mockDraft.corporateId,
        corporateName: mockDraft.corporateName
      },
      policyObject: {
        policyNumber: mockDraft.policyNumber,
        policyRecordType: mockDraft.policyRecordType,
        policyPlan: mockDraft.policyPlan,
        sumInsured: mockDraft.sumInsured,
        netPremium: mockDraft.netPremium,
        grossPremium: mockDraft.grossPremium,
        policyStartDate: mockDraft.startDate,
        policyEndDate: mockDraft.endDate
      },
      brokerObject: {
        channelType: 'BROKER',
        brokerName: mockDraft.brokerName
      },
      spocObject: {
        tpaServicingBranch: 'Pune HQ',
        tpaSpocName: 'Sanjay Deshmukh',
        tpaSpocEmail: 'sanjay.deshmukh@mdindia.com',
        tpaSpocPhone: '9822012345',
        clientHrName: 'Anita Kulkarni',
        clientHrEmail: 'anita.kulkarni@tcs.com',
        clientHrPhone: '9890054321'
      }
    });

    setApprovedPolicyId(res.policyId);
    setIsApproving(false);

    // Dispatches real-time WebSocket notification for all subscribers
    broadcastNotification({
      title: 'Policy Approved (The Hinge)!',
      message: `QC approved policy ${res.policyId} for ${mockDraft.corporateName}. Initiating background member data ingestion.`,
      type: 'SUCCESS',
      category: 'POLICY',
      relatedId: res.policyId
    });
  };

  const handleProceedToMembers = () => {
    onNavigate('member');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">QC Review & Maker-Checker Approval</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              The Hinge Transition
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Checker reviews policy draft submitted by Maker against original underwritten schedules. 
            Approval locks the policy, assigns permanent Policy ID, and initiates member processing.
          </p>
        </div>
      </div>

      {/* The Hinge Success Modal / Hero Banner */}
      {approvedPolicyId ? (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              The Hinge Triggered Successfully
            </div>
            <h2 className="text-2xl font-black">
              Policy Approved & Live in System!
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              New policy record created with Permanent ID <strong className="font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">{approvedPolicyId}</strong>.
              Event published to Kafka topic <code className="text-xs bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">policy-approved-topic</code>.
              Member ingestion engine is currently evaluating 5,000 employees and dependants.
            </p>
            <div className="pt-2">
              <button
                onClick={handleProceedToMembers}
                className="px-6 py-3 bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                Proceed Directly to Member Processing Hub
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Review Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule Terms Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maker Submitted Schedule</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{mockDraft.corporateName}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inward Tracking</span>
                <p className="font-mono text-xs font-bold text-indigo-700">{inwardNo}</p>
              </div>
            </div>

            {/* Grid of Verified Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" /> Underwriting Insurer
                </span>
                <p className="font-bold text-slate-900">{mockDraft.insurerName}</p>
                <p className="text-[11px] text-slate-500">{mockDraft.branchCode}</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Proposer Entity
                </span>
                <p className="font-bold text-slate-900">{mockDraft.corporateName}</p>
                <p className="text-[11px] text-slate-500">Code: {mockDraft.corporateId}</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" /> Policy Number & Plan
                </span>
                <p className="font-mono font-bold text-indigo-700">{mockDraft.policyNumber}</p>
                <p className="text-[11px] text-slate-500">Plan: {mockDraft.policyPlan} • Floater ({mockDraft.familyDefinition})</p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-indigo-500" /> Sum Insured & Premium
                </span>
                <p className="font-bold text-slate-900">₹{mockDraft.sumInsured.toLocaleString()} Floater</p>
                <p className="text-[11px] text-emerald-700 font-semibold">Net: ₹{mockDraft.netPremium.toLocaleString()} | Gross: ₹{mockDraft.grossPremium.toLocaleString()}</p>
              </div>
            </div>

            {/* Inception Dates */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Inception Coverage Period:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {mockDraft.startDate} to {mockDraft.endDate} (365 Days)
                </p>
              </div>
              <div>
                <span className="text-slate-500">Intermediary:</span>
                <p className="font-bold text-slate-800 mt-0.5">{mockDraft.brokerName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Checker Verification Checklist & Approve Button */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                QC Verification Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Confirm all items before executing policy sign-off.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.insurerVerified}
                  onChange={(e) => setChecks({ ...checks, insurerVerified: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <span className="text-slate-700">Insurer Branch Code & GST matched with master directory</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.premiumVerified}
                  onChange={(e) => setChecks({ ...checks, premiumVerified: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <span className="text-slate-700">Net & Gross Premium reconciliation matches bank instrument</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.datesVerified}
                  onChange={(e) => setChecks({ ...checks, datesVerified: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <span className="text-slate-700">Policy inception & expiry dates confirmed with broker slip</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.rosterAttached}
                  onChange={(e) => setChecks({ ...checks, rosterAttached: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <span className="text-slate-700">Member Excel roster (5,000 rows) verified for ingestion</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleApprove}
                disabled={!allChecked || isApproving || Boolean(approvedPolicyId)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {isApproving ? 'Executing The Hinge...' : 'Approve Policy & Start Member Load'}
              </button>

              <button
                type="button"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reassign to Maker with Remarks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
