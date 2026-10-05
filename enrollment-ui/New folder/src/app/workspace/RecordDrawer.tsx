import { useState } from 'react';
import { ArrowUpRight, Pencil, CheckCheck, Clock3 } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Action, Badge, Overlay } from './components';
import { ModuleConfig, WorkspaceRecord } from './data';

export const RecordDrawer = ({ record, config, close, edit, update }: { record: WorkspaceRecord; config: ModuleConfig; close: () => void; edit: () => void; update: (status: string) => boolean }) => {
  const [tab, setTab] = useState('Overview');
  const nextStatus = config.key === 'enrolments' || config.key === 'retail' ? ({ Pending: 'Processing', Processing: 'QC review', 'QC review': 'Completed', Exception: 'Processing' } as Record<string, string>)[record.status] : record.status === 'In review' || record.status === 'Renewal due' ? (config.key === 'products' ? 'Approved' : 'Active') : undefined;
  return <Overlay open close={close} title={`${config.singular[0].toUpperCase()}${config.singular.slice(1)} details`} drawer>
    <div className="ws-record-identity"><div className="ws-record-monogram">{record.name.slice(0, 2).toUpperCase()}</div><h2 data-testid="drawer-record-name">{record.name}</h2><p className="ws-mono">{record.reference}</p><Badge status={record.status} id="drawer-record-status" /></div>
    <div className="ws-tabs" role="tablist" aria-label="Record details">{['Overview', 'Activity'].map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''} data-testid={`drawer-tab-${t.toLowerCase()}`}>{t}</button>)}</div>
    <div className="ws-dialog-body" role="tabpanel" data-testid="drawer-tab-panel">{tab === 'Overview' ? <><dl className="ws-detail-list">{[[config.entityLabel, record.entity], [config.typeLabel, record.type], ['Location', record.location], ['Contact email', record.email || 'Not provided'], ['Assigned to', record.owner], ['Last updated', record.updated], ...(record.members ? [[config.key === 'providers' ? 'Beds' : 'Members', String(record.members)]] : [])].map(([label, value]) => <div key={label}><dt>{label}</dt><dd data-testid={`detail-${label.toLowerCase().replaceAll(' ', '-')}`}>{value || '—'}</dd></div>)}</dl>{record.note && <div className="ws-record-note"><h3>Latest note</h3><p>{record.note}</p></div>}<div className="ws-info-note" data-testid="drawer-demo-notice">Sample record · Updates apply only to this browser.</div></> : <div className="ws-activity"><Clock3 size={18} /><div><strong>Latest sample record update</strong><p>{record.updated} · {record.owner}</p><p>Current status: {record.status}</p><small>Live audit history is not connected in this preview.</small></div></div>}</div>
    <div className="ws-dialog-actions"><Action onClick={edit} data-testid="record-edit"><Pencil size={15} />Edit details</Action>{nextStatus && <Action primary data-testid="record-advance-status" onClick={() => { if (update(nextStatus)) toast.success(`Sample status updated to ${nextStatus}.`); }}><CheckCheck size={16} />{nextStatus === 'Completed' ? 'Complete review' : `Move to ${nextStatus.toLowerCase()}`}</Action>}</div>
    {record.fullPath && <Link className="ws-full-record-link" to={record.fullPath} data-testid="record-open-full-workflow">Open full workflow<ArrowUpRight size={15} /></Link>}
  </Overlay>;
};