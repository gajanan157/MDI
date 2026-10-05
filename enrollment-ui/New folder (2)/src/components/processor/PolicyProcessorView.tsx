import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Briefcase, 
  FileText, 
  Users, 
  PhoneCall, 
  Save, 
  Send, 
  CheckCircle2, 
  Info, 
  Layers 
} from 'lucide-react';
import { PolicyScheduleDraft, PolicyRecordType, ChannelType } from '../../types';
import { getWorkItem, savePolicyDraft } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { useRole } from '../../context/RoleContext';
import { ActiveTab } from '../common/Sidebar';

interface PolicyProcessorViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

type TabType = 'INSURER' | 'CORPORATE' | 'POLICY' | 'BROKER' | 'SPOC';

export const PolicyProcessorView: React.FC<PolicyProcessorViewProps> = ({ onNavigate }) => {
  const { broadcastNotification } = useWebSocket();
  const { role } = useRole();
  const [currentTab, setCurrentTab] = useState<TabType>('POLICY');
  const [inwardNo, setInwardNo] = useState('INW-2026-1001');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<PolicyScheduleDraft>({
    insurerObject: {
      insurerId: 'INS-001',
      insurerName: 'The New India Assurance Co. Ltd',
      insurerType: 'PSU',
      issuingOfficeCode: 'NIA-PUN-01',
      issuingOfficeName: 'Pune Regional Branch 110200',
      regionalOfficeName: 'Western Region Head',
      divisionalOfficeName: 'Divisional Office III'
    },
    corporateObject: {
      corporateGroupId: 'GRP-TATA',
      corporateGroupName: 'Tata Sons Group',
      corporateId: 'CORP-201',
      corporateName: 'Tata Consultancy Services Ltd',
      industryType: 'Information Technology',
      panNumber: 'AAACT2001B',
      gstNumber: '27AAACT2001B1Z2'
    },
    policyObject: {
      policyNumber: '110200/34/26/10000492',
      policyRecordType: 'LIVE',
      policyPlan: 'FLOATER',
      sumInsured: 500000,
      netPremium: 4500000,
      grossPremium: 5310000,
      policyStartDate: '2026-10-01',
      policyEndDate: '2027-09-30',
      tpaCommissionRate: 5.5,
      familyDefinition: '1E+1S+2C (Self + Spouse + 2 Children)'
    },
    brokerObject: {
      channelType: 'BROKER',
      brokerId: 'BRK-MARSH-01',
      brokerName: 'Marsh McLennan Insurance Brokers Pvt Ltd',
      brokerLicenseNumber: 'IRDAI/DB/401/2026'
    },
    spocObject: {
      tpaServicingBranch: 'MD India Pune Corporate HQ (Deccan)',
      tpaSpocName: 'Sanjay Deshmukh',
      tpaSpocEmail: 'sanjay.deshmukh@mdindia.com',
      tpaSpocPhone: '+91 98220 12345',
      clientHrName: 'Anita Kulkarni (Head HR Operations)',
      clientHrEmail: 'anita.kulkarni@tcs.com',
      clientHrPhone: '+91 98900 54321'
    }
  });

  useEffect(() => {
    getWorkItem(inwardNo).then((wi) => {
      if (wi?.policyScheduleJson) {
        setFormData(wi.policyScheduleJson);
      }
    });
  }, [inwardNo]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveSuccessMessage(null);
    await savePolicyDraft(formData, inwardNo, false);
    setIsSaving(false);
    setSaveSuccessMessage('Draft saved successfully! (policy-service /v1/policy-endorsements/process)');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleSubmitToQc = async () => {
    setIsSubmitting(true);
    await savePolicyDraft(formData, inwardNo, true);
    setIsSubmitting(false);

    // Broadcast WebSocket notification to all agents & QC queue
    broadcastNotification({
      title: 'Policy Submitted for QC Sign-Off',
      message: `Processor submitted ${formData.policyObject.policyNumber} (Inward ${inwardNo}) for Maker-Checker review.`,
      type: 'WARNING',
      category: 'POLICY',
      relatedId: inwardNo
    });

    onNavigate('qc');
  };

  const tabs = [
    { id: 'INSURER' as TabType, label: '1. Insurer Details', icon: Building2 },
    { id: 'CORPORATE' as TabType, label: '2. Corporate Proposer', icon: Briefcase },
    { id: 'POLICY' as TabType, label: '3. Policy Terms', icon: FileText },
    { id: 'BROKER' as TabType, label: '4. Intermediary / Broker', icon: Users },
    { id: 'SPOC' as TabType, label: '5. SPOC & Servicing', icon: PhoneCall },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Processor Workspace (Maker)</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              5-Tab Schedule Intake
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fill the 5 mandatory tabs extracted from the underwritten policy schedule. Maker saves drafts incrementally before sending to QC.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-slate-500" />
            {isSaving ? 'Saving Draft...' : 'Save Draft Tab'}
          </button>
          <button
            onClick={handleSubmitToQc}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit to QC Checker'}
          </button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Inward Work Item Header Info */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">{formData.corporateObject.corporateName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200">
                {inwardNo}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Insurer: {formData.insurerObject.insurerName} • Policy Type: {formData.policyObject.policyRecordType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-300">
          <div>
            <span className="text-slate-500 block">Sum Insured</span>
            <span className="font-bold text-white">₹{formData.policyObject.sumInsured.toLocaleString()}</span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-slate-500 block">Net Premium</span>
            <span className="font-bold text-white">₹{formData.policyObject.netPremium.toLocaleString()}</span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-slate-500 block">Current Status</span>
            <span className="font-bold text-amber-400">MAKER DRAFT</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        {/* Tab 1: Insurer */}
        {currentTab === 'INSURER' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-800">Underwriting Insurer & Branch Hierarchy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Insurer Name</label>
                <input
                  type="text"
                  value={formData.insurerObject.insurerName}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurerObject: { ...formData.insurerObject, insurerName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Insurer Sector</label>
                <select
                  value={formData.insurerObject.insurerType}
                  onChange={(e: any) => setFormData({
                    ...formData,
                    insurerObject: { ...formData.insurerObject, insurerType: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="PSU">Public Sector Undertaking (PSU)</option>
                  <option value="PRIVATE">Private Insurer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Office Code</label>
                <input
                  type="text"
                  value={formData.insurerObject.issuingOfficeCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurerObject: { ...formData.insurerObject, issuingOfficeCode: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Office Name</label>
                <input
                  type="text"
                  value={formData.insurerObject.issuingOfficeName}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurerObject: { ...formData.insurerObject, issuingOfficeName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Regional Office</label>
                <input
                  type="text"
                  value={formData.insurerObject.regionalOfficeName}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurerObject: { ...formData.insurerObject, regionalOfficeName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Divisional Office</label>
                <input
                  type="text"
                  value={formData.insurerObject.divisionalOfficeName}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurerObject: { ...formData.insurerObject, divisionalOfficeName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Corporate */}
        {currentTab === 'CORPORATE' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-800">Corporate Proposer & Group Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Proposer Name</label>
                <input
                  type="text"
                  value={formData.corporateObject.corporateName}
                  onChange={(e) => setFormData({
                    ...formData,
                    corporateObject: { ...formData.corporateObject, corporateName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Group (Parent)</label>
                <input
                  type="text"
                  value={formData.corporateObject.corporateGroupName}
                  onChange={(e) => setFormData({
                    ...formData,
                    corporateObject: { ...formData.corporateObject, corporateGroupName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Vertical</label>
                <input
                  type="text"
                  value={formData.corporateObject.industryType}
                  onChange={(e) => setFormData({
                    ...formData,
                    corporateObject: { ...formData.corporateObject, industryType: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  value={formData.corporateObject.panNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    corporateObject: { ...formData.corporateObject, panNumber: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.corporateObject.gstNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    corporateObject: { ...formData.corporateObject, gstNumber: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Policy Terms */}
        {currentTab === 'POLICY' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-800">Policy Terms & Premium Financials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Insurer Policy Number</label>
                <input
                  type="text"
                  value={formData.policyObject.policyNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, policyNumber: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Record Type</label>
                <select
                  value={formData.policyObject.policyRecordType}
                  onChange={(e: any) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, policyRecordType: e.target.value as PolicyRecordType }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="LIVE">LIVE Policy (Real Insurer Number)</option>
                  <option value="DUMMY">DUMMY Policy (Temporary Placeholder)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Structure</label>
                <select
                  value={formData.policyObject.policyPlan}
                  onChange={(e: any) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, policyPlan: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="FLOATER">Family Floater</option>
                  <option value="NON_FLOATER">Individual Non-Floater</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sum Insured (₹)</label>
                <input
                  type="number"
                  value={formData.policyObject.sumInsured}
                  onChange={(e) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, sumInsured: Number(e.target.value) }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Net Premium (₹)</label>
                <input
                  type="number"
                  value={formData.policyObject.netPremium}
                  onChange={(e) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, netPremium: Number(e.target.value) }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Premium (₹)</label>
                <input
                  type="number"
                  value={formData.policyObject.grossPremium}
                  onChange={(e) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, grossPremium: Number(e.target.value) }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Start Date</label>
                <input
                  type="date"
                  value={formData.policyObject.policyStartDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, policyStartDate: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Policy End Date</label>
                <input
                  type="date"
                  value={formData.policyObject.policyEndDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, policyEndDate: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Family Definition</label>
                <input
                  type="text"
                  value={formData.policyObject.familyDefinition}
                  onChange={(e) => setFormData({
                    ...formData,
                    policyObject: { ...formData.policyObject, familyDefinition: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Broker */}
        {currentTab === 'BROKER' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-800">Intermediary & Distribution Channel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Type</label>
                <select
                  value={formData.brokerObject.channelType}
                  onChange={(e: any) => setFormData({
                    ...formData,
                    brokerObject: { ...formData.brokerObject, channelType: e.target.value as ChannelType }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="BROKER">Broker (IRDA Registered)</option>
                  <option value="AGENT">Direct Corporate Agent</option>
                  <option value="DIRECT">Direct (No Intermediary)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Broker Company Name</label>
                <input
                  type="text"
                  value={formData.brokerObject.brokerName}
                  onChange={(e) => setFormData({
                    ...formData,
                    brokerObject: { ...formData.brokerObject, brokerName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Broker License Number</label>
                <input
                  type="text"
                  value={formData.brokerObject.brokerLicenseNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    brokerObject: { ...formData.brokerObject, brokerLicenseNumber: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: SPOC */}
        {currentTab === 'SPOC' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-800">TPA Servicing Branch & HR Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">MD India Servicing Branch</label>
                <input
                  type="text"
                  value={formData.spocObject.tpaServicingBranch}
                  onChange={(e) => setFormData({
                    ...formData,
                    spocObject: { ...formData.spocObject, tpaServicingBranch: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TPA Account Manager (SPOC)</label>
                <input
                  type="text"
                  value={formData.spocObject.tpaSpocName}
                  onChange={(e) => setFormData({
                    ...formData,
                    spocObject: { ...formData.spocObject, tpaSpocName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TPA SPOC Email</label>
                <input
                  type="email"
                  value={formData.spocObject.tpaSpocEmail}
                  onChange={(e) => setFormData({
                    ...formData,
                    spocObject: { ...formData.spocObject, tpaSpocEmail: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TPA SPOC Phone</label>
                <input
                  type="text"
                  value={formData.spocObject.tpaSpocPhone}
                  onChange={(e) => setFormData({
                    ...formData,
                    spocObject: { ...formData.spocObject, tpaSpocPhone: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client HR Head Name</label>
                <input
                  type="text"
                  value={formData.spocObject.clientHrName}
                  onChange={(e) => setFormData({
                    ...formData,
                    spocObject: { ...formData.spocObject, clientHrName: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client HR Email</label>
                <input
                  type="email"
                  value={formData.spocObject.clientHrEmail}
                  onChange={(e) => setFormData({
                    ...formData,
                    spocObject: { ...formData.spocObject, clientHrEmail: e.target.value }
                  })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
