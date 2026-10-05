import type { ProviderContactPersonDetail } from "../../../hospitalData";
import type { ContactGroup } from "./hooks/ownerContactGroups";

export function contactRowKey(p: ProviderContactPersonDetail, index: number): string {
  return p.providerContactPersonId ?? `contact-${index}`;
}

export type ContactRoleTheme = {
  iconBg: string;
  iconText: string;
  cardRing: string;
  accentBorder: string;
  headerExpanded: string;
  badge: string;
  chevronBox: string;
};

const CONTACT_ROLE_THEMES: ContactRoleTheme[] = [
  {
    iconBg: "bg-blue-50 ring-blue-100",
    iconText: "text-blue-600",
    cardRing: "ring-blue-100",
    accentBorder: "border-l-blue-500",
    headerExpanded: "bg-gradient-to-r from-blue-50/90 via-white to-white",
    badge: "bg-blue-100 text-blue-800 ring-blue-200/80",
    chevronBox: "border-slate-200 bg-white text-slate-500 group-hover:border-blue-300 group-hover:text-blue-600",
  },
  {
    iconBg: "bg-violet-50 ring-violet-100",
    iconText: "text-violet-600",
    cardRing: "ring-violet-100",
    accentBorder: "border-l-violet-500",
    headerExpanded: "bg-gradient-to-r from-violet-50/90 via-white to-white",
    badge: "bg-violet-100 text-violet-800 ring-violet-200/80",
    chevronBox: "border-slate-200 bg-white text-slate-500 group-hover:border-violet-300 group-hover:text-violet-600",
  },
  {
    iconBg: "bg-emerald-50 ring-emerald-100",
    iconText: "text-emerald-600",
    cardRing: "ring-emerald-100",
    accentBorder: "border-l-emerald-500",
    headerExpanded: "bg-gradient-to-r from-emerald-50/90 via-white to-white",
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
    chevronBox: "border-slate-200 bg-white text-slate-500 group-hover:border-emerald-300 group-hover:text-emerald-600",
  },
  {
    iconBg: "bg-amber-50 ring-amber-100",
    iconText: "text-amber-600",
    cardRing: "ring-amber-100",
    accentBorder: "border-l-amber-500",
    headerExpanded: "bg-gradient-to-r from-amber-50/90 via-white to-white",
    badge: "bg-amber-100 text-amber-800 ring-amber-200/80",
    chevronBox: "border-slate-200 bg-white text-slate-500 group-hover:border-amber-300 group-hover:text-amber-600",
  },
];

export function resolveContactRoleTheme(group: ContactGroup, index: number): ContactRoleTheme {
  const haystack = `${group.groupId} ${group.displayRole}`.toLowerCase();
  if (haystack.includes("key contact")) return CONTACT_ROLE_THEMES[0];
  if (haystack.includes("ceo") || haystack.includes("chief executive")) return CONTACT_ROLE_THEMES[1];
  if (haystack.includes("tpa")) return CONTACT_ROLE_THEMES[2];
  return CONTACT_ROLE_THEMES[index % CONTACT_ROLE_THEMES.length];
}

export function contactInitials(name: string | undefined): string {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
