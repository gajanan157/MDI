import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  Search, 
  CreditCard, 
  FileSpreadsheet, 
  ShieldCheck, 
  Clock, 
  Filter, 
  RefreshCw 
} from 'lucide-react';
import { MemberRecord, ProgressData } from '../../types';
import { getMembers, getEnrollmentProgress, approveMemberException } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { useRole } from '../../context/RoleContext';
import { ECardModal } from '../ecard/ECardModal';

type SubTab = 'ENROLLED' | 'FAILED' | 'DISCREPANCY' | 'EXCEPTION';

export const MemberProcessingHub: React.FC = () => {
  const { broadcastNotification } = useWebSocket();
  const { role } = useRole();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('ENROLLED');
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<MemberRecord | null>(null);

  // Underwriting Exception Modal State
  const [exceptionModalMember, setExceptionModalMember] = useState<MemberRecord | null>(null);
  const [uwRemark, setUwRemark] = useState('Special Underwriting Approval granted as per Corporate Group terms');
  const [isApprovingUw, setIsApprovingUw] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const prog = await getEnrollmentProgress();
    setProgress(prog);
    const memList = await getMembers();
    setMembers(memList);
  };

  const handleApproveException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionModalMember) return;

    setIsApprovingUw(true);
    await approveMemberException(exceptionModalMember.uhid, uwRemark);
    setIsApprovingUw(false);

    // Broadcast WebSocket notification
    broadcastNotification({
      title: 'Underwriting Exception Cleared',
      message: `QC cleared exception for ${exceptionModalMember.memberName} (${exceptionModalMember.uhid}). Member is now Enrolled!`,
      type: 'SUCCESS',
      category: 'MEMBER',
      relatedId: exceptionModalMember.uhid
    });

    setExceptionModalMember(null);
    loadData();
  };

  const enrolledMembers = members.filter(m => m.enrollmentStatus === 'ENROLLED' || m.enrollmentStatus === 'CARD_GENERATED');
  const failedMembers = members.filter(m => m.enrollmentStatus === 'VALIDATION_FAILED');
  const discrepancyMembers = members.filter(m => m.enrollmentStatus === 'DISCREPANCY');
  const exceptionMembers = members.filter(m => m.enrollmentStatus === 'EXCEPTION_PENDING');

  const getCurrentList = () => {
    switch (activeSubTab) {
      case 'ENROLLED':
        return enrolledMembers;
      case 'FAILED':
        return failedMembers;
      case 'DISCREPANCY':
        return discrepancyMembers;
      case 'EXCEPTION':
        return exceptionMembers;
    }
  };

  const filteredList = getCurrentList().filter(m =>
    m.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.employeeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.uhid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Progress Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Member Data Processing Engine</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {progress?.status || 'COMPLETED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Policy POL-10001 (Tata Consultancy Services) • 5,000 members loaded from Excel roster
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Statistics
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Roster Rule Evaluation Progress</span>
            <span className="font-bold text-indigo-700">{progress?.percentage || 100}% Processed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress?.percentage || 100}%` }}
            />
          </div>
        </div>

        {/* Sub-Queue Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => setActiveSubTab('ENROLLED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeSubTab === 'ENROLLED'
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Enrolled Clean</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-extrabold text-emerald-950 mt-1">{progress?.enrolledCount || 4982}</p>
            <p className="text-[10px] text-emerald-700 font-medium">Ready for E-Cards</p>
          </button>

          <button
            onClick={() => setActiveSubTab('FAILED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeSubTab === 'FAILED'
                ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase">Validation Failed</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-xl font-extrabold text-rose-950 mt-1">{failedMembers.length}</p>
            <p className="text-[10px] text-rose-700 font-medium">Invalid syntax/format</p>
          </button>

          <button
            onClick={() => setActiveSubTab('DISCREPANCY')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeSubTab === 'DISCREPANCY'
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase">Discrepancies</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-extrabold text-amber-950 mt-1">{discrepancyMembers.length}</p>
            <p className="text-[10px] text-amber-700 font-medium">Family rule flags</p>
          </button>

          <button
            onClick={() => setActiveSubTab('EXCEPTION')}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
              activeSubTab === 'EXCEPTION'
                ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 uppercase">UW Exceptions</span>
              <AlertTriangle className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-extrabold text-purple-950 mt-1">{exceptionMembers.length}</p>
            <p className="text-[10px] text-purple-700 font-medium">Awaiting QC Sign-off</p>
          </button>
        </div>
      </div>

      {/* Search & Export Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Member Name, Emp No, UHID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Clean Roster (.xlsx)
          </button>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Emp No</th>
                <th className="py-3.5 px-4">Relation</th>
                <th className="py-3.5 px-4">DOB / Age</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">UHID</th>
                <th className="py-3.5 px-4">Status / Remarks</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No members found in this queue
                  </td>
                </tr>
              ) : (
                filteredList.map((m) => (
                  <tr key={m.uhid} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {m.memberName}
                      {m.email && <span className="block text-[10px] text-slate-400 font-normal">{m.email}</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">{m.employeeNo}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {m.relationship}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {m.dateOfBirth} ({m.age} Yrs)
                    </td>
                    <td className="py-3 px-4">{m.gender}</td>
                    <td className="py-3 px-4 font-mono text-indigo-700 font-bold">{m.uhid}</td>
                    <td className="py-3 px-4">
                      {m.enrollmentStatus === 'ENROLLED' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                        </span>
                      )}
                      {m.enrollmentStatus === 'VALIDATION_FAILED' && (
                        <span className="text-rose-600 font-medium text-[11px] block">
                          {m.validationError}
                        </span>
                      )}
                      {m.enrollmentStatus === 'DISCREPANCY' && (
                        <span className="text-amber-700 font-medium text-[11px] block">
                          {m.discrepancyRemark}
                        </span>
                      )}
                      {m.enrollmentStatus === 'EXCEPTION_PENDING' && (
                        <div>
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                            {m.exceptionCategory}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{m.exceptionReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {m.enrollmentStatus === 'ENROLLED' ? (
                        <button
                          onClick={() => setSelectedMemberForCard(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          View E-Card
                        </button>
                      ) : m.enrollmentStatus === 'EXCEPTION_PENDING' ? (
                        <button
                          onClick={() => setExceptionModalMember(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          QC Sign-off
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Flagged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital E-Card Preview Modal */}
      {selectedMemberForCard && (
        <ECardModal
          member={selectedMemberForCard}
          onClose={() => setSelectedMemberForCard(null)}
        />
      )}

      {/* QC Underwriting Exception Approval Modal */}
      {exceptionModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 bg-purple-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Underwriting Exception Sign-Off</h3>
                  <p className="text-xs text-slate-500">Authorized QC Underwriter sign-off required</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleApproveException} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <p>Member: <strong className="text-slate-900">{exceptionModalMember.memberName}</strong> ({exceptionModalMember.relationship})</p>
                <p>Age: <strong className="text-slate-900">{exceptionModalMember.age} Yrs</strong></p>
                <p>Exception Flag: <span className="font-bold text-purple-700">{exceptionModalMember.exceptionCategory}</span></p>
                <p className="text-slate-500 text-[11px] mt-1">{exceptionModalMember.exceptionReason}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Underwriter Audit Remarks</label>
                <textarea
                  rows={3}
                  value={uwRemark}
                  onChange={(e) => setUwRemark(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExceptionModalMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApprovingUw}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isApprovingUw ? 'Signing off...' : 'Authorize & Enroll Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
