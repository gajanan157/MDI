import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight, Search, Bell, X, ArrowUpRight, CircleHelp, Menu } from 'lucide-react';
import { navigation, utilityNavigation, allNavigation, routeName } from './navigation';
import { Action, Overlay } from './components';
import { isMockAuthEnabled } from '@/utils/mockAuth';
import logo from '@/assets/mdilogo.svg';
import { useThemeContext } from '@/app/contexts/theme/context';
import { useKeycloak } from '@/app/contexts/keycloak/KeycloakProvider';
import './workspace.css';

export default function WorkspaceLayout() {
  const { pathname } = useLocation();
  const { setThemeMode, themeMode } = useThemeContext();
  const { userInfo } = useKeycloak();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('mdi-sidebar') === 'collapsed');
  const [mobile, setMobile] = useState(false);
  const [group, setGroup] = useState('enrolment');
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState<'notifications' | 'help' | null>(null);
  const [read, setRead] = useState(false);
  useEffect(() => { setMobile(false); setSearch(''); const match = navigation.find(g => g.items.some(([, path]) => pathname === path)); if (match) setGroup(match.id); }, [pathname]);
  useEffect(() => { document.documentElement.dataset.workspace = 'true'; document.documentElement.dataset.density = localStorage.getItem('mdi-density') || 'comfortable'; return () => { delete document.documentElement.dataset.workspace; }; }, []);
  useEffect(() => { if (themeMode !== 'light') setThemeMode('light'); }, [themeMode, setThemeMode]);
  useEffect(() => { localStorage.setItem('mdi-sidebar', collapsed ? 'collapsed' : 'expanded'); }, [collapsed]);
  useEffect(() => { document.title = `${routeName(pathname)} · MD India`; }, [pathname]);
  const activeGroup = navigation.find(g => g.items.some(([, path]) => pathname === path));
  const results = allNavigation.filter(item => `${item.label} ${item.group}`.toLowerCase().includes(search.toLowerCase())).slice(0, 7);
  return <div className={`ws-shell ${collapsed ? 'ws-collapsed' : ''} ${mobile ? 'ws-mobile-open' : ''}`}>
    <a className="ws-skip" href="#workspace-main" data-testid="skip-to-content">Skip to content</a>
    {mobile && <button className="ws-sidebar-shade" aria-label="Close navigation" onClick={() => setMobile(false)} data-testid="mobile-nav-backdrop" />}
    <aside className="ws-sidebar" aria-label="Main navigation">
      <Link to="/enrolment-system/dashboard" className="ws-brand" data-testid="brand-home"><img src={logo} alt="MD India" /><span>MD<span className="ws-brand-light">INDIA</span><small>OPERATIONS WORKSPACE</small></span></Link>
      <div className="ws-workspace-name"><span className="ws-workspace-avatar">M</span><span>MD India Health Insurance<small>TPA Operations</small></span><span className="ws-workspace-tag">IN</span></div>
      <div className="ws-nav-caption">WORKSPACE</div>
      <nav className="ws-nav">
        {navigation.map(g => <div className="ws-nav-group" key={g.id}>
          <button className={`ws-group-toggle ${group === g.id ? 'is-current' : ''}`} title={g.label} onClick={() => { if (collapsed) setCollapsed(false); setGroup(group === g.id && !collapsed ? '' : g.id); }} aria-expanded={!collapsed && group === g.id} data-testid={`nav-group-${g.id}`}><g.icon size={18} /><span>{g.label}</span><ChevronDown size={14} className={group === g.id ? 'rotate' : ''} /></button>
          {!collapsed && group === g.id && <div className="ws-nav-children">{g.items.map(([label, path]) => <NavLink key={path} to={path} title={label} data-testid={`nav-${path.replaceAll('/', '-').slice(1)}`} className={({ isActive }) => isActive ? 'active' : ''}><span>{label}</span>{pathname === path && <span className="ws-nav-dot" />}</NavLink>)}</div>}
        </div>)}
        <div className="ws-nav-caption">ADMINISTRATION</div>
        {utilityNavigation.map(item => <NavLink key={item.path} to={item.path} title={item.label} data-testid={`nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={({ isActive }) => `ws-utility-link ${isActive ? 'active' : ''}`}><item.icon size={18} /><span>{item.label}</span></NavLink>)}
      </nav>
      <div className="ws-sidebar-footer"><button onClick={() => setPanel('help')} data-testid="workspace-help" title="Support information"><CircleHelp size={17} /><span>Help & support</span><ArrowUpRight size={14} /></button><Link to="/settings/general" data-testid="sidebar-account" title="Account settings"><span className="ws-user-avatar">{(userInfo?.name || 'MD India').split(' ').slice(0, 2).map((s: string) => s[0]).join('')}</span><span className="ws-user-name">{userInfo?.name || 'MD India Admin'}<small>Operations administrator</small></span><ChevronRight size={15} /></Link></div>
    </aside>
    <div className="ws-main-frame">
      <header className="ws-topbar">
        <Action className="ws-icon-button ws-desktop-toggle" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)} data-testid="sidebar-toggle">{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}</Action>
        <Action className="ws-icon-button ws-mobile-toggle" aria-label="Open navigation" onClick={() => setMobile(true)} data-testid="mobile-nav-open"><Menu size={20} /></Action>
        <div className="ws-breadcrumb" data-testid="workspace-breadcrumb"><span>{activeGroup?.label ?? 'Administration'}</span><ChevronRight size={13} /><strong>{routeName(pathname)}</strong></div>
        <div className="ws-topbar-right"><div className="ws-global-search"><Search size={16} /><input aria-label="Search modules" placeholder="Search workspace…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setSearch(''); }} data-testid="global-search" />{search && <button onClick={() => setSearch('')} aria-label="Clear search" data-testid="global-search-clear"><X size={14} /></button>}
          {search && <div className="ws-search-results" data-testid="global-search-results">{results.length ? results.map(item => <Link key={item.path} to={item.path} data-testid={`search-result-${item.path.replaceAll('/', '-')}`}><span>{item.label}<small>{item.group}</small></span><ArrowUpRight size={15} /></Link>) : <p>No matching modules.</p>}</div>}
        </div>{isMockAuthEnabled() && <span className="ws-demo-label" data-testid="demo-environment"><i />Demo workspace</span>}<Action className="ws-icon-button ws-notification-button" aria-label="Notifications" title="Notifications" onClick={() => setPanel('notifications')} data-testid="notifications-open"><Bell size={18} />{!read && <i />}</Action></div>
      </header>
      <main id="workspace-main" tabIndex={-1} className="ws-content" data-testid="workspace-main"><Outlet /></main>
      <footer className="ws-statusbar"><span data-testid="workspace-environment-status"><i />{isMockAuthEnabled() ? 'Preview environment · Sample data' : 'Operations workspace'}</span><span>MD India Health Insurance TPA <b>•</b> India</span></footer>
    </div>
    <Overlay open={panel !== null} close={() => setPanel(null)} title={panel === 'help' ? 'Workspace support' : 'Notifications'} drawer>
      <div className="ws-dialog-body">{panel === 'help' ? <><div className="ws-eyebrow">MD INDIA OPERATIONS</div><h3>Need a hand?</h3><p>Contact your organisation’s administrator for workflow, access or policy queries.</p><div className="ws-info-note" data-testid="support-demo-notice">This is a demo environment. Authentication, records and workflow updates are MOCKED. Changes to sample records are saved in this browser only.</div></> : <><div className="ws-info-note" data-testid="notification-demo-notice">Sample notifications · No live notification service connected.</div>{!read ? <><div className="ws-notification"><strong>Corporate enrolment queue</strong><p>Sample policy batches are ready for review.</p><Link to="/enrolment-system/corporate-enrolment" onClick={() => setPanel(null)} data-testid="notification-review">View queue <ArrowUpRight size={14} /></Link></div><Action onClick={() => setRead(true)} data-testid="mark-notifications-read">Mark all as read</Action></> : <p data-testid="notifications-empty">You're all caught up.</p>}</>}</div>
    </Overlay>
  </div>;
}