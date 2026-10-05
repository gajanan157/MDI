import React, { useEffect, useState } from 'react';
import { 
  Inbox, 
  Plus, 
  Search, 
  FileText, 
  FileSpreadsheet, 
  Code, 
  CheckCircle, 
  Clock, 
  UploadCloud, 
  X, 
  ChevronRight, 
  Filter 
} from 'lucide-react';
import { InwardRecord, ChannelType } from '../../types';
import { getInwards, generateInwardNo, createInward } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { ActiveTab } from '../common/Sidebar';

interface InwardManagementViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const InwardManagementView: React.FC<InwardManagementViewProps> = ({ onNavigate }) => {
  const [inwards, setInwards] = useState<InwardRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { broadcastNotification } = useWebSocket();

  // New Inward Form State
  const [formInwardNo, setFormInwardNo] = useState('');
  const [formInwardType, setFormInwardType] = useState<'ENROLLMENT' | 'ENDORSEMENT'>('ENROLLMENT');
  const [formCorporate, setFormCorporate] = useState('Tata Consultancy Services Ltd');
  const [formInsurer, setFormInsurer] = useState('The New India Assurance Co. Ltd');
  const [formChannel, setFormChannel] = useState<ChannelType>('BROKER');
  const [formMembers, setFormMembers] = useState(5000);
  const [pdfFileName, setPdfFileName] = useState('Policy_Schedule_Oct2026.pdf');
  const [excelFileName, setExcelFileName] = useState('Employee_Roster_5000.xlsx');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInwards();
  }, []);

  const loadInwards = async () => {
    setLoading(true);
    const data = await getInwards();
    setInwards(data);
    setLoading(false);
  };

  const handleOpenModal = async () => {
    const nextNo = await generateInwardNo();
    setFormInwardNo(nextNo);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newRecord = await createInward({
      inwardNo: formInwardNo,
      inwardType: formInwardType,
      corporateName: formCorporate,
      corporateId: 'CORP-' + Math.floor(100 + Math.random() * 900),
      insurerName: formInsurer,
      insurerId: 'INS-001',
      channelType: formChannel,
      totalMembersExpected: Number(formMembers),
      policyScheduleFileName: pdfFileName,
      memberRosterFileName: excelFileName
    });

    setInwards(prev => [newRecord, ...prev]);
    setSubmitting(false);
    setIsModalOpen(false);

    // Broadcast WebSocket notification to all subscribers
    broadcastNotification({
      title: 'New Inward Registered',
      message: `${newRecord.inwardNo} created for ${newRecord.corporateName} with ${newRecord.totalMembersExpected.toLocaleString()} members.`,
      type: 'SUCCESS',
      category: 'WORKFLOW',
      relatedId: newRecord.inwardNo
    });
  };

  const filteredInwards = inwards.filter(i => 
    i.inwardNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.corporateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.insurerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INWARD_GENERATED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">Intake Received</span>;
      case 'PROCESSOR_IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Maker Drafting</span>;
      case 'QC_PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">QC Review Pending</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Policy Approved</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inward Management</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              inward-service (:8082)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Register incoming policy documents, upload insurer schedules & member rosters, and route to assignment queues.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register New Inward
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Inward No, Corporate, or Insurer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Showing <strong>{filteredInwards.length}</strong> registered inwards</span>
        </div>
      </div>

      {/* Inward Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Inward No</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Corporate Proposer</th>
                <th className="py-3.5 px-4">Underwriting Insurer</th>
                <th className="py-3.5 px-4">Expected Members</th>
                <th className="py-3.5 px-4">Uploaded Files</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredInwards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No inward records found matching query
                  </td>
                </tr>
              ) : (
                filteredInwards.map((item) => (
                  <tr key={item.inwardNo} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {item.inwardNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.inwardType === 'ENROLLMENT' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {item.inwardType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.corporateName}
                      <span className="block text-[10px] text-slate-400 font-normal">Channel: {item.channelType}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.insurerName}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {item.totalMembersExpected.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {item.policyScheduleFileName && (
                          <span title={item.policyScheduleFileName} className="p-1 rounded bg-rose-50 text-rose-600 cursor-pointer">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {item.memberRosterFileName && (
                          <span title={item.memberRosterFileName} className="p-1 rounded bg-emerald-50 text-emerald-600 cursor-pointer">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span title="PSU XML Available" className="p-1 rounded bg-blue-50 text-blue-600 cursor-pointer">
                          <Code className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'QC_PENDING' ? (
                        <button
                          onClick={() => onNavigate('qc')}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          Review in QC
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : item.status === 'COMPLETED' ? (
                        <button
                          onClick={() => onNavigate('member')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          Member Hub
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('processor')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          Edit 5 Tabs
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Inward Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Register Inward Request</h3>
                  <p className="text-xs text-slate-500">Auto-generates sequential Inward tracking ID</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Generated Inward No</label>
                <input
                  type="text"
                  readOnly
                  value={formInwardNo}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-700 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inward Type</label>
                  <select
                    value={formInwardType}
                    onChange={(e: any) => setFormInwardType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="ENROLLMENT">Fresh Enrollment</option>
                    <option value="ENDORSEMENT">Policy Endorsement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Distribution Channel</label>
                  <select
                    value={formChannel}
                    onChange={(e: any) => setFormChannel(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="BROKER">Broker (Intermediary)</option>
                    <option value="AGENT">Direct Agent</option>
                    <option value="DIRECT">Direct Corporate Proposer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Client</label>
                <input
                  type="text"
                  value={formCorporate}
                  onChange={(e) => setFormCorporate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Tata Consultancy Services Ltd"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Underwriting Insurer</label>
                  <select
                    value={formInsurer}
                    onChange={(e) => setFormInsurer(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="The New India Assurance Co. Ltd">New India Assurance (PSU)</option>
                    <option value="National Insurance Co. Ltd">National Insurance (PSU)</option>
                    <option value="United India Insurance Co.">United India Insurance (PSU)</option>
                    <option value="The Oriental Insurance Co.">Oriental Insurance (PSU)</option>
                    <option value="ICICI Lombard General Insurance">ICICI Lombard (Private)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Members</label>
                  <input
                    type="number"
                    value={formMembers}
                    onChange={(e) => setFormMembers(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Upload Dropzones */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">Attach Policy Documents</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/60 text-center hover:bg-slate-100/50 transition-colors">
                  <UploadCloud className="w-6 h-6 mx-auto text-indigo-500 mb-1" />
                  <p className="text-xs text-slate-700 font-semibold">Policy Schedule PDF & Member Excel File</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Files: {pdfFileName}, {excelFileName}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {submitting ? 'Registering...' : 'Register & Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
