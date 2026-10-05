import type { ProviderContactPersonDetail } from "../../../../hospitalData";

export type ContactGroup = {
  groupId: string;
  displayRole: string;
  items: { index: number; person: ProviderContactPersonDetail }[];
};

export function contactGroupIdForRow(row: ProviderContactPersonDetail): string {
  const raw = row.providerContactPersonRole?.trim() ?? "";
  return raw.toLowerCase() || "__default__";
}

export function groupContactsByRole(rows: ProviderContactPersonDetail[]): ContactGroup[] {  const buckets = new Map<string, ContactGroup>();
  rows.forEach((person, index) => {
    const raw = person.providerContactPersonRole?.trim() ?? "";
    const displayRole = raw || "Contact person";
    const groupId = raw.toLowerCase() || "__default__";
    const existing = buckets.get(groupId);
    if (!existing) {
      buckets.set(groupId, { groupId, displayRole, items: [{ index, person }] });
    } else {
      existing.items.push({ index, person });
    }
  });
  return Array.from(buckets.values());
}

function isKeyContactPersonGroup(group: ContactGroup): boolean {
  const haystack = `${group.groupId} ${group.displayRole}`.toLowerCase();
  return haystack.includes("key contact");
}

export function sortContactGroupsKeyContactFirst(groups: ContactGroup[]): ContactGroup[] {
  const first: ContactGroup[] = [];
  const rest: ContactGroup[] = [];
  for (const g of groups) {
    (isKeyContactPersonGroup(g) ? first : rest).push(g);
  }
  return [...first, ...rest];
}
