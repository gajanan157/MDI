import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Action, Overlay } from './components';
import { ModuleConfig, WorkspaceRecord } from './data';

export const RecordForm = ({ config, initial, close, onSave }: { config: ModuleConfig; initial?: WorkspaceRecord; close: () => void; onSave: (record: WorkspaceRecord) => boolean }) => {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ name: initial?.name || '', reference: initial?.reference || '', entity: initial?.entity || '', type: initial?.type || '', location: initial?.location || '', email: initial?.email || '', members: initial?.members || 0, owner: initial?.owner || 'Pooja Deshmukh', note: initial?.note || '' });
  const [error, setError] = useState('');
  const update = (key: string, value: string) => { setValues(v => ({ ...v, [key]: value })); setError(''); };
  const field = (key: keyof typeof values, label: string, required = false, type = 'text') => <label className="ws-field" key={key}>{label}{required && <span className="ws-required"> *</span>}<input data-testid={`record-form-${key}`} value={values[key]} onChange={e => update(key, e.target.value)} required={required} type={type} min={type === 'number' ? 0 : undefined} maxLength={type === 'number' ? undefined : 200} /></label>;
  const advance = () => {
    if (step === 0 && (!values.name.trim() || !values.reference.trim() || !values.entity.trim())) { setError('Enter the name, reference and organisation to continue.'); return; }
    if (step === 1 && values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) { setError('Enter a valid email address.'); return; }
    if (step === 1 && (!Number.isInteger(Number(values.members)) || Number(values.members) < 0)) { setError('Member count must be a whole number, zero or greater.'); return; }
    setError(''); setStep(step + 1);
  };
  const submit = () => {
    const r: WorkspaceRecord = { ...values, name: values.name.trim(), reference: values.reference.trim(), entity: values.entity.trim(), members: Number(values.members), id: initial?.id ?? `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, status: initial?.status ?? config.statuses[0], updated: new Date().toISOString().slice(0, 10), fullPath: initial?.fullPath };
    if (onSave(r)) { toast.success(`${initial ? 'Updated' : 'Created'} sample ${config.singular}. Saved in this browser.`); close(); }
  };
  return <Overlay open close={close} title={`${initial ? 'Edit' : 'New'} ${config.singular}`}>
    <div className="ws-wizard-steps">{['Basic details', 'Additional details', 'Review'].map((s, i) => <div key={s} className={step >= i ? 'current' : ''} data-testid={`form-step-${i}`}><span>{step > i ? <Check size={13} /> : i + 1}</span>{s}</div>)}</div>
    <form noValidate onSubmit={e => { e.preventDefault(); if (step < 2) advance(); else submit(); }}>
      <div className="ws-dialog-body"><div className="ws-info-note" data-testid="form-demo-notice">Demo record · Saved locally. No changes are sent to a server.</div>
        {step === 0 && <div className="ws-form-grid">{field('name', config.nameLabel, true)}{field('reference', 'Reference / code', true)}{field('entity', config.entityLabel, true)}{field('type', config.typeLabel)}</div>}
        {step === 1 && <div className="ws-form-grid">{field('location', 'City / location')}{field('email', 'Contact email', false, 'email')}{field('owner', 'Assigned to')}{field('members', config.key === 'providers' ? 'Number of beds' : 'Member count', false, 'number')}<label className="ws-field ws-span-two">Notes<textarea data-testid="record-form-note" rows={3} value={values.note} onChange={e => update('note', e.target.value)} maxLength={1000} /></label></div>}
        {step === 2 && <div className="ws-form-review"><CheckCircle2 size={28} /><h3>Ready to {initial ? 'save changes' : `create ${config.singular}`}</h3><dl>{[['Name', values.name], ['Reference', values.reference], [config.entityLabel, values.entity], [config.typeLabel, values.type || '—'], ['Assigned to', values.owner || 'Unassigned']].map(([k, v]) => <div key={k}><dt>{k}</dt><dd data-testid={`review-${k.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`}>{v}</dd></div>)}</dl></div>}
        {error && <p className="ws-error" role="alert" data-testid="record-form-error">{error}</p>}
      </div>
      <div className="ws-dialog-actions"><Action onClick={step ? () => setStep(step - 1) : close} data-testid="record-form-back">{step ? <><ArrowLeft size={15} />Back</> : 'Cancel'}</Action><span>Step {step + 1} of 3</span><Action type="submit" primary data-testid="record-form-next">{step === 2 ? <><Check size={15} />{initial ? 'Save changes' : 'Create record'}</> : <>Continue<ArrowRight size={15} /></>}</Action></div>
    </form>
  </Overlay>;
};