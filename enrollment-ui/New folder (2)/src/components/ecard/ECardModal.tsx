import React from 'react';
import { MemberRecord } from '../../types';
import { X, Download, ShieldCheck, QrCode, Phone, CheckCircle, CreditCard } from 'lucide-react';

interface ECardModalProps {
  member: MemberRecord | null;
  corporateName?: string;
  insurerName?: string;
  policyNo?: string;
  onClose: () => void;
}

export const ECardModal: React.FC<ECardModalProps> = ({
  member,
  corporateName = 'Tata Consultancy Services Ltd',
  insurerName = 'The New India Assurance Co. Ltd',
  policyNo = '110200/34/26/10000492',
  onClose
}) => {
  if (!member) return null;

  const handleDownloadPdf = () => {
    // Hits ecard-service endpoint /v1/ecards/pdf or triggers download
    const url = `/v1/ecards/pdf?healthCardNumber=${member.healthCardNumber || member.uhid}&corporateId=CORP-201`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">MD India Digital Health E-Card</h3>
              <p className="text-xs text-slate-500">Official cashless hospitalization identification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* E-Card Graphic Container */}
        <div className="p-6 flex flex-col items-center">
          {/* Physical Card Mockup */}
          <div className="w-full rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden border border-indigo-700/50">
            {/* Background design elements */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

            {/* Top Bar of Card */}
            <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-xs tracking-wider uppercase text-white block">MD INDIA TPA</span>
                  <span className="text-[9px] text-teal-300 block">Health Insurance Card</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-300 font-medium block">{insurerName}</span>
                <span className="text-[9px] text-indigo-300 font-mono block">PSU Health Line</span>
              </div>
            </div>

            {/* Middle Section: Member Photo & Details */}
            <div className="mt-4 flex items-start gap-4">
              <div className="w-20 h-24 rounded-xl bg-slate-800/80 border border-indigo-500/30 flex flex-col items-center justify-center text-slate-400 shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-700/50 flex items-center justify-center text-white font-bold text-sm mb-1">
                  {member.memberName.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[9px] text-teal-300 uppercase font-semibold">{member.relationship}</span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-extrabold text-sm text-white truncate">{member.memberName}</h4>
                <p className="text-[11px] text-indigo-200">
                  Emp No: <strong className="text-white font-mono">{member.employeeNo}</strong> • Age: {member.age} Yrs ({member.gender})
                </p>
                <div className="pt-1">
                  <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Corporate Proposer</span>
                  <span className="text-xs font-semibold text-slate-100 block truncate">{corporateName}</span>
                </div>
                <div className="pt-0.5">
                  <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Policy Number</span>
                  <span className="text-xs font-mono font-bold text-teal-300 block">{policyNo}</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Health Card Number & Cashless Helpline */}
            <div className="mt-5 pt-3 border-t border-indigo-700/60 flex items-end justify-between">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Health Card ID / UHID</span>
                <span className="font-mono text-xs font-bold text-white tracking-wider block">
                  {member.healthCardNumber || member.uhid}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Valid: 01/10/2026 to 30/09/2027
                </span>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-10 h-10 rounded-lg bg-white p-1 text-slate-900 flex items-center justify-center shadow-xs">
                  <QrCode className="w-8 h-8 text-slate-900" />
                </div>
                <span className="text-[8px] text-slate-300 mt-0.5">Hospital QR Scan</span>
              </div>
            </div>
          </div>

          {/* Cashless Hospitalization Notice */}
          <div className="mt-4 w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>MD India 24/7 Cashless Hospital Toll-Free Helpline:</span>
            </div>
            <strong className="font-mono font-bold text-slate-900">1800-209-7777</strong>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Verified Active in TPA System
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download OpenPDF Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
