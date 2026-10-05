import { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { Search, Plus, Download, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, X, ArrowUpRight, Inbox, CheckCircle2, Clock3, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Action, Badge, PageHeading } from './components';
import { exportCsv } from './exportCsv';
import { modules, moduleRoutes, WorkspaceRecord } from './data';
import { useRecords } from './useRecords';
import { RecordForm } from './RecordForm';
import { RecordDrawer } from './RecordDrawer';

export default function DirectoryPage() {
  const { pathname } = useLocation();
  const moduleKey = moduleRoutes[pathname.slice(1)];
  return <Directory key={moduleKey} moduleKey={moduleKey} />;
}

const Directory = ({ moduleKey }: { moduleKey: string }) => {
  const config = modules[moduleKey];
  const { records, save } = useRecords(moduleKey);
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'All records';
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(false);
  const [type, setType] = useState('All types');
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(() => Number(localStorage.getItem('mdi-page-size')) || 6);
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(params.get('record'));
  const [form, setForm] = useState<WorkspaceRecord | 'new' | null>(params.has('new') ? 'new' : null);
  const filtered = useMemo(() => records.filter(r => (status === 'All records' || r.status === status) && (type === 'All types' || r.type === type) && [r.name, r.reference, r.entity, r.location, r.email].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort ? a.name.localeCompare(b.name) : b.updated.localeCompare(a.updated)), [records, status, type, query, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * size, currentPage * size);
  const detail = records.find(r => r.id === detailId);
  const counts = { total: records.length, active: records.filter(r => /^(Active|Approved|Completed|Enrolled)$/.test(r.status)).length, pending: records.filter(r => /review|pending|processing|renewal|exception/i.test(r.status)).length };
  const statusOptions = [...new Set([...config.statuses, ...records.map(r => r.status)])];
  const setStatus = (s: string) => { setParams(s === 'All records' ? {} : { status: s }); setPage(1); setSelected([]); };
  const onSave = (r: WorkspaceRecord) => save(records.some(x => x.id === r.id) ? records.map(x => x.id === r.id ? r : x) : [r, ...records]);
  const selectRow = (id: string) => setSelected(previous => previous.includes(id) ? previous.filter(s => s !== id) : [...previous, id]);
  const exportRows = () => { const rows = selected.length ? filtered.filter(r => selected.includes(r.id)) : filtered; if (!rows.length) return; exportCsv(rows.map(r => ({ Reference: r.reference, Name: r.name, Organisation: r.entity, Type: r.type, Location: r.location, Status: r.status, Updated: r.updated })), `${config.key}-sample-records.csv`); toast.success(`${rows.length} sample records exported.`); };
  return <div className="ws-page ws-directory">
    <PageHeading eyebrow={config.group} title={config.title} description={config.description}><Action data-testid="directory-export" onClick={exportRows} disabled={!filtered.length}><Download size={16} />Export</Action><Action primary data-testid="directory-create" onClick={() => setForm('new')}><Plus size={17} />New {config.singular}</Action></PageHeading>
    <div className="ws-directory-metrics">{[{ label: 'Total records', value: counts.total, icon: Building2, cls: '' }, { label: 'Active / completed', value: counts.active, icon: CheckCircle2, cls: 'success' }, { label: 'Awaiting action', value: counts.pending, icon: Clock3, cls: 'warning' }].map((m, i) => <div key={m.label} className={`ws-inline-metric ${m.cls}`}><m.icon size={18} /><span>{m.label}</span><strong data-testid={`directory-metric-${i}`}>{m.value.toLocaleString('en-IN')}</strong></div>)}</div>
    <section className="ws-data-section" aria-label={config.title}>
      <div className="ws-table-title"><h2>{config.key === 'enrolments' ? 'Enrolment queue' : 'All records'} <span data-testid="directory-total-count">{records.length}</span></h2><span className="ws-muted">Sample records</span></div>
      <div className="ws-table-tools"><div className="ws-local-search"><Search size={17} /><input placeholder={`Search ${config.title.toLowerCase()}…`} aria-label={`Search ${config.title}`} value={query} onChange={e => { setQuery(e.target.value); setPage(1); setSelected([]); }} data-testid="directory-search" />{query && <button aria-label="Clear record search" data-testid="directory-search-clear" onClick={() => setQuery('')}><X size={14} /></button>}</div><div className="ws-filter-controls"><select aria-label="Filter by status" data-testid="directory-status-filter" value={status} onChange={e => setStatus(e.target.value)}><option>All records</option>{statusOptions.map(s => <option key={s}>{s}</option>)}</select><Action data-testid="directory-filters-toggle" aria-expanded={filters} onClick={() => setFilters(!filters)}><SlidersHorizontal size={15} /><span>Filters</span>{type !== 'All types' && <i className="ws-filter-dot" />}</Action></div></div>
      {filters && <div className="ws-extra-filters"><label>{config.typeLabel}<select value={type} onChange={e => { setType(e.target.value); setPage(1); setSelected([]); }} data-testid="directory-type-filter"><option>All types</option>{[...new Set(records.map(r => r.type))].filter(Boolean).map(t => <option key={t}>{t}</option>)}</select></label><Action data-testid="directory-reset-filters" onClick={() => { setType('All types'); setStatus('All records'); setQuery(''); }}>Reset filters<X size={14} /></Action></div>}
      {selected.length > 0 && <div className="ws-selection-bar" data-testid="selection-summary"><span>{selected.length} selected</span><button onClick={exportRows} data-testid="export-selected">Export selected<Download size={13} /></button><button onClick={() => setSelected([])} data-testid="clear-selection">Clear selection</button></div>}
      <div className="ws-table-scroll"><table className="ws-table" data-testid="directory-table"><thead><tr><th className="ws-checkbox-cell"><input type="checkbox" aria-label="Select all visible records" data-testid="select-visible-records" checked={visible.length > 0 && visible.every(r => selected.includes(r.id))} onChange={e => setSelected(e.target.checked ? [...new Set([...selected, ...visible.map(r => r.id)])] : selected.filter(id => !visible.some(r => r.id === id)))} /></th><th><button onClick={() => setSort(!sort)} data-testid="directory-sort-name" aria-label={`Sort ${config.nameLabel} ${sort ? 'by last updated' : 'alphabetically'}`}>{config.nameLabel}<ArrowUpDown size={12} /></button></th><th className="ws-secondary-column">{config.entityLabel}</th><th className="ws-type-column">{config.typeLabel}</th><th>Status</th><th className="ws-date-column">Last updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map(r => <tr key={r.id} className={selected.includes(r.id) ? 'selected' : ''} data-testid={`record-row-${r.id}`}><td className="ws-checkbox-cell"><input aria-label={`Select ${r.name}`} type="checkbox" checked={selected.includes(r.id)} onChange={() => selectRow(r.id)} data-testid={`select-record-${r.id}`} /></td><td className="ws-name-cell"><button onClick={() => setDetailId(r.id)} data-testid={`open-record-${r.id}`}><span className={`ws-table-monogram tone-${r.name.length % 4}`}>{r.name.split(' ').slice(0, 2).map(s => s[0]).join('')}</span><span><strong>{r.name}</strong><small>{r.reference}</small></span></button></td><td className="ws-secondary-column"><span>{r.entity}</span></td><td className="ws-type-column"><span className="ws-type-tag">{r.type || '—'}</span></td><td><Badge status={r.status} id={`status-${r.id}`} /></td><td className="ws-date-column ws-muted">{new Date(r.updated + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td><td className="ws-row-action"><button aria-label={`View ${r.name}`} title="View record" onClick={() => setDetailId(r.id)} data-testid={`view-record-${r.id}`}><ArrowUpRight size={17} /></button></td></tr>)}</tbody></table>
        {!visible.length && <div className="ws-empty" data-testid="directory-empty"><Inbox size={32} /><h3>No matching records</h3><p>Try another name, reference or status.</p><Action data-testid="empty-reset-filters" onClick={() => { setQuery(''); setType('All types'); setStatus('All records'); }}>Clear filters</Action></div>}
      </div>
      <div className="ws-pagination"><span data-testid="pagination-summary">Showing <b>{filtered.length ? (currentPage - 1) * size + 1 : 0}–{Math.min(currentPage * size, filtered.length)}</b> of <b>{filtered.length}</b> records</span><div><label>Rows<select data-testid="directory-page-size" aria-label="Rows per page" value={size} onChange={e => { setSize(Number(e.target.value)); setPage(1); }}>{[6, 10, 20].map(n => <option key={n}>{n}</option>)}</select></label><Action className="ws-icon-button" aria-label="Previous page" data-testid="pagination-previous" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></Action><span data-testid="pagination-page">{currentPage} / {pages}</span><Action className="ws-icon-button" aria-label="Next page" data-testid="pagination-next" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></Action></div></div>
    </section>
    <div className="ws-page-footnote">All changes in this workspace are local demo changes.</div>
    {detail && !form && <RecordDrawer record={detail} config={config} close={() => setDetailId(null)} edit={() => setForm(detail)} update={status => onSave({ ...detail, status, updated: new Date().toISOString().slice(0, 10) })} />}
    {form && <RecordForm config={config} initial={form === 'new' ? undefined : form} close={() => setForm(null)} onSave={onSave} />}
  </div>;
};