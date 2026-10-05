import { Link } from 'react-router';
import { ArrowRight, Building2, ClipboardCheck, FileCheck2, ShieldCheck, Plus, Search } from 'lucide-react';
import { PageHeading, Badge } from './components';
import { useRecords } from './useRecords';

export default function EmpanelmentPage() {
  const { records } = useRecords('providers');
  return <div className="ws-page"><PageHeading eyebrow="Provider management" title="Hospital empanelment" description="Build a stronger network, one healthcare partner at a time."><Link className="ws-button ws-primary" to="/provider-masters/create" data-testid="empanelment-create"><Plus size={16} />Register hospital</Link></PageHeading>
    <div className="ws-empanel-intro"><div><span className="ws-eyebrow">NETWORK ONBOARDING</span><h2>A clear path to your provider network.</h2><p>Registration, verification and approval in one connected workflow.</p><Link to="/provider-masters/create" className="ws-button ws-primary" data-testid="empanelment-start">Start registration<ArrowRight size={16} /></Link></div><div className="ws-empanel-stat"><Building2 size={32} /><strong data-testid="empanelment-provider-count">{records.length}</strong><span>Sample network providers</span></div></div>
    <div className="ws-empanel-steps">{[{ icon: Building2, name: 'Hospital details', note: 'Identity, location & infrastructure' }, { icon: FileCheck2, name: 'Documentation', note: 'Registrations & compliance' }, { icon: ClipboardCheck, name: 'Verification', note: 'Provider information review' }, { icon: ShieldCheck, name: 'Network approval', note: 'Agreement & empanelment' }].map((step, i) => <div key={step.name}><span className="ws-step-number">0{i + 1}</span><step.icon size={22} /><h3>{step.name}</h3><p>{step.note}</p></div>)}</div>
    <div className="ws-section-heading"><h2>Recently added providers</h2><Link className="ws-text-link" to="/provider-masters/providers" data-testid="empanelment-directory"><Search size={14} />View directory<ArrowRight size={14} /></Link></div><div className="ws-provider-preview-grid">{records.slice(0, 3).map(r => <Link className="ws-provider-preview" key={r.id} to={`/provider-masters/providers?record=${r.id}`} data-testid={`empanelment-provider-${r.id}`}><Building2 size={22} /><h3>{r.name}</h3><p>{r.location}</p><Badge status={r.status} id={`empanelment-status-${r.id}`} /><ArrowRight size={16} /></Link>)}</div>
  </div>;
}