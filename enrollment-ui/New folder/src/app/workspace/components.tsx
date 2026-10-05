import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export const Action = ({ children, primary = false, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) => (
  <button type="button" className={`ws-button ${primary ? 'ws-primary' : ''} ${className}`} {...props}>{children}</button>
);
export const Badge = ({ status, id }: { status: string; id: string }) => {
  const tone = /active|completed|approved|enrolled|verified/i.test(status) && !/inactive/i.test(status) ? 'success' : /rejected|exception|excluded|inactive/i.test(status) ? 'danger' : /review|qc|progress/i.test(status) ? 'info' : 'warning';
  return <span className={`ws-badge ${tone}`} data-testid={id}><i />{status}</span>;
};
export const PageHeading = ({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) => (
  <div className="ws-heading"><div><div className="ws-eyebrow">{eyebrow}</div><h1 data-testid="workspace-page-title">{title}</h1><p>{description}</p></div><div className="ws-heading-actions">{children}</div></div>
);
export const Overlay = ({ open, close, title, children, drawer = false }: { open: boolean; close: () => void; title: string; children: ReactNode; drawer?: boolean }) => (
  <Dialog open={open} onClose={close} className={`ws-dialog ${drawer ? 'ws-drawer' : ''}`} data-testid={drawer ? 'record-drawer' : 'workspace-dialog'}>
    <DialogBackdrop className="ws-backdrop" /><div className="ws-dialog-position"><DialogPanel className="ws-dialog-panel">
      <div className="ws-dialog-heading"><DialogTitle>{title}</DialogTitle><Action onClick={close} aria-label="Close dialog" data-testid="dialog-close" className="ws-icon-button"><X size={18} /></Action></div>{children}
    </DialogPanel></div>
  </Dialog>
);
export const SectionLink = ({ to, children, id }: { to: string; children: ReactNode; id: string }) => <Link className="ws-text-link" to={to} data-testid={id}>{children}<ChevronRight size={14} /></Link>;
