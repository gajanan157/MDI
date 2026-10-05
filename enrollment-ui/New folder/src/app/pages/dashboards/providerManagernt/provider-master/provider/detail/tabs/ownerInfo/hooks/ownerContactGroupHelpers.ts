import type { ProviderContactPersonDetail } from "../../../../hospitalData";
import type { ContactRowFieldErrors } from "./useOwnerTabHandlers";
import { contactGroupIdForRow } from "./ownerContactGroups";

export function restoreEditedContactsForGroup(
  prev: ProviderContactPersonDetail[],
  groupId: string,
  serverRows: ProviderContactPersonDetail[],
): ProviderContactPersonDetail[] {
  const kept = prev.filter((row) => {
    if (contactGroupIdForRow(row) !== groupId) return true;
    return Boolean(row.providerContactPersonId?.trim());
  });

  return kept.map((row) => {
    if (contactGroupIdForRow(row) !== groupId) return row;
    const id = row.providerContactPersonId?.trim();
    if (!id) return row;
    const server = serverRows.find((r) => r.providerContactPersonId === id);
    return server ? { ...server } : row;
  });
}

export function filterValidationErrorsOutsideGroup(
  prev: Record<number, ContactRowFieldErrors>,
  groupId: string,
  editedContactList: ProviderContactPersonDetail[],
): Record<number, ContactRowFieldErrors> {
  const next: Record<number, ContactRowFieldErrors> = {};
  for (const [key, value] of Object.entries(prev)) {
    const index = Number(key);
    const row = editedContactList[index];
    if (row && contactGroupIdForRow(row) === groupId) continue;
    next[index] = value;
  }
  return next;
}
