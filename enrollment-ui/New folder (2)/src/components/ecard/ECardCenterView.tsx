import React, { useState } from 'react';
import { CreditCard, Download, ShieldCheck, QrCode, Phone, Sparkles, Search } from 'lucide-react';

export const ECardCenterView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('Standard Corporate Floater');
  const [cardNumberQuery, setCardNumberQuery] = useState('HC-880011-A');

  const cardData = {
    memberName: 'Vikram Joshi',
    relation: 'SELF',
    employeeNo: 'TCS10921',
    age: 38,
    gender: 'MALE',
    corporateName: 'Tata Consultancy Services Ltd',
    insurerName: 'The New India Assurance Co. Ltd',
    policyNo: '110200/34/26/10000492',
    healthCardNumber: cardNumberQuery,
    validDates: '01/10/2026 to 30/09/2027',
    uhid: 'MD-2026-880011'
  };

  const handleDownload = () => {
    window.open(`/v1/ecards/pdf?healthCardNumber=${cardData.healthCardNumber}&corporateId=CORP-201`, '_blank');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Digital E-Card Center</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              ecard-service (:8086)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic health card rendering and PDF document generation powered by OpenPDF.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Download OpenPDF Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Card Configuration */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Card & Template Customization</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-Card Design Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Standard Corporate Floater">Standard Corporate Floater (Default)</option>
                <option value="VIP Executive Plan">Executive / C-Suite Gold Template</option>
                <option value="Senior Citizen Parents">Senior Citizens Floater Layout</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Health Card ID / UHID Lookup</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cardNumberQuery}
                  onChange={(e) => setCardNumberQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>IRDAI Compliant E-Card Layout</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Rendered with OpenPDF vectors, barcode/QR checksum, and high-DPI typography. Ready for immediate cashless hospital admission.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Card Preview */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-100/70 rounded-2xl border border-slate-200/80 p-8">
          <div className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-7 shadow-2xl relative overflow-hidden border border-indigo-700/60">
            {/* Ambient gradients */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

            {/* Top Bar of Card */}
            <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-sm tracking-wider uppercase text-white block">MD INDIA TPA</span>
                  <span className="text-[10px] text-teal-300 font-medium block">Digital Health Card</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-200 font-semibold block">{cardData.insurerName}</span>
                <span className="text-[10px] text-indigo-300 font-mono block">PSU Health Line</span>
              </div>
            </div>

            {/* Middle Section: Member Photo & Details */}
            <div className="mt-5 flex items-start gap-4">
              <div className="w-24 h-28 rounded-2xl bg-slate-800/80 border border-indigo-500/30 flex flex-col items-center justify-center text-slate-400 shrink-0">
                <div className="w-12 h-12 rounded-full bg-indigo-700/50 flex items-center justify-center text-white font-bold text-base mb-1">
                  VJ
                </div>
                <span className="text-[10px] text-teal-300 uppercase font-bold">{cardData.relation}</span>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <h4 className="font-extrabold text-base text-white truncate">{cardData.memberName}</h4>
                <p className="text-xs text-indigo-200">
                  Emp No: <strong className="text-white font-mono">{cardData.employeeNo}</strong> • Age: {cardData.age} Yrs ({cardData.gender})
                </p>
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Corporate Proposer</span>
                  <span className="text-xs font-semibold text-slate-100 block truncate">{cardData.corporateName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Policy Number</span>
                  <span className="text-xs font-mono font-bold text-teal-300 block">{cardData.policyNo}</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Health Card Number & Cashless Helpline */}
            <div className="mt-6 pt-3.5 border-t border-indigo-700/60 flex items-end justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Health Card ID / UHID</span>
                <span className="font-mono text-sm font-bold text-white tracking-wider block">
                  {cardData.healthCardNumber}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Valid: {cardData.validDates}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <div className="w-12 h-12 rounded-xl bg-white p-1 text-slate-900 flex items-center justify-center shadow-xs">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
                <span className="text-[9px] text-slate-300 mt-1">Cashless QR</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>24x7 Cashless Hospitalization Toll-Free: <strong>1800-209-7777</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
