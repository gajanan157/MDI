import React, { useState, useEffect } from 'react';
import { GitCompare, CheckCircle2, UserPlus, UserMinus, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { ReconciliationRecord, ReconciliationStatus } from '../../types';
import { getReconciliationReport } from '../../services/api';

export const ReconciliationView: React.FC = () => {
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getReconciliationReport();
    setRecords(data);
    setLoading(false);
  };

  const filteredRecords = records.filter(r => {
    const matchesFilter = filter === 'ALL' || r.reconciliationStatus === filter;
    const matchesSearch = 
      r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'EXISTING_MEMBER_MATCHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Matched 1:1
          </span>
        );
      case 'NEW_ENROLLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
            <UserPlus className="w-3 h-3 text-blue-600" /> New Addition
          </span>
        );
      case 'DELETED_FROM_ROSTER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">
            <UserMinus className="w-3 h-3 text-rose-600" /> Removed/Leaver
          </span>
        );
      case 'DATA_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Data Variance
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dummy vs. Live Policy Reconciliation</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              member-service (:8085)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare temporary placeholder Dummy policies with final Live insurer schedules. Reconciles joiners, leavers, and data variances.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-run Reconciliation Match
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Records ({records.length})
        </button>
        <button
          onClick={() => setFilter('EXISTING_MEMBER_MATCHED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'EXISTING_MEMBER_MATCHED'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Matched 1:1 ({records.filter(r => r.reconciliationStatus === 'EXISTING_MEMBER_MATCHED').length})
        </button>
        <button
          onClick={() => setFilter('NEW_ENROLLED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'NEW_ENROLLED'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          New Additions ({records.filter(r => r.reconciliationStatus === 'NEW_ENROLLED').length})
        </button>
        <button
          onClick={() => setFilter('DELETED_FROM_ROSTER')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'DELETED_FROM_ROSTER'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Leavers ({records.filter(r => r.reconciliationStatus === 'DELETED_FROM_ROSTER').length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Employee No</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Relation</th>
                <th className="py-3.5 px-4">Dummy Policy ID</th>
                <th className="py-3.5 px-4">Live Policy ID</th>
                <th className="py-3.5 px-4">Match Status</th>
                <th className="py-3.5 px-4">Variance Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{r.employeeNo}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.memberName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {r.relationship}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{r.dummyPolicyId}</td>
                  <td className="py-3.5 px-4 font-mono text-indigo-700 font-bold">{r.livePolicyId}</td>
                  <td className="py-3.5 px-4">{getStatusBadge(r.reconciliationStatus)}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">{r.varianceNote || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
