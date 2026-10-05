import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { modules, WorkspaceRecord } from './data';

const storageKey = (key: string) => `mdi-workspace-v1-${key}`;
const read = (key: string): WorkspaceRecord[] => {
  try { const saved = JSON.parse(localStorage.getItem(storageKey(key)) || 'null'); if (Array.isArray(saved) && saved.every(r => r && typeof r.id === 'string' && typeof r.name === 'string')) return saved; } catch { /* A damaged browser cache must not block the workspace. */ }
  return modules[key].records;
};
export function useRecords(key: string) {
  const [records, setRecords] = useState(() => read(key));
  useEffect(() => { const reload = () => setRecords(read(key)); reload(); window.addEventListener('mdi-records-changed', reload); window.addEventListener('storage', reload); return () => { window.removeEventListener('mdi-records-changed', reload); window.removeEventListener('storage', reload); }; }, [key]);
  const save = (next: WorkspaceRecord[]) => {
    try { localStorage.setItem(storageKey(key), JSON.stringify(next)); setRecords(next); window.dispatchEvent(new Event('mdi-records-changed')); return true; }
    catch { toast.error('Browser storage is unavailable. Your changes were not saved.'); return false; }
  };
  return { records, save };
}