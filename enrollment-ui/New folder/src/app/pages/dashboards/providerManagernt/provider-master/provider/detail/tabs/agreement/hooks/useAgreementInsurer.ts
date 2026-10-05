import { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { TRIPARTITE_SELECTED_IC_WHITELIST_TOKENS } from "../utils/agreementFormConfig";

export type InsurerDropdownOption = { value: string; label: string };

/** Backend list items may use `insurerId`/`insurerName` or `id`/`name` (see `Insurer` type). */
function rowToInsurerOption(row: Record<string, unknown>): InsurerDropdownOption | null {
  const rawId = row.insurerId ?? row.id;
  if (rawId == null || rawId === "") return null;
  const idStr = String(rawId);
  const label =
    (typeof row.insurerName === "string" && row.insurerName.trim()) ||
    (typeof row.name === "string" && row.name.trim()) ||
    (typeof row.brandName === "string" && row.brandName.trim()) ||
    idStr;
  return { value: idStr, label };
}

/** Stable order in UI: NIC → OIC → NIA → UIIC → Magma (then any extra matches last). */
function tripartiteSelectedIcSortKey(label: string): number {
  const h = label.toLowerCase();
  if (h.includes("national insurance")) return 0;
  if (h.includes("oriental insurance")) return 1;
  if (h.includes("new india assurance")) return 2;
  if (h.includes("united india") || h.includes("uiic") || /\buic\b/.test(h)) return 3;
  if (h.includes("magma")) return 4;
  return 50;
}

function matchUnitedIndiaInsurer(hay: string, code: string, irdai: string, compact: string): boolean {
  if (hay.includes("united india")) return true;
  if (hay.includes("uiic") || compact.includes("uiic")) return true;
  if (/\buic\b/.test(hay) || code === "uic" || irdai === "uic") return true;
  if (hay.includes("ullc") || compact.includes("ullc")) return true;
  return false;
}

function matchTripartiteWhitelistTokens(
  name: string,
  brand: string,
  code: string,
  irdai: string,
  compact: string,
): boolean {
  for (const token of TRIPARTITE_SELECTED_IC_WHITELIST_TOKENS) {
    if (token === "magma") continue;
    if (code === token || irdai === token) return true;
    if (compact === token || compact.endsWith(token)) return true;
    try {
      const re = new RegExp(`\\b${token}\\b`, "i");
      if (re.test(name) || re.test(brand)) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

/**
 * Tripartite + scope "Selected ICs": NIC, OIC, NIA, UIIC (United India), Magma.
 * `GET /v1/insurer` list often has only `insurerName` — match on company-name phrases, not `\bnic\b`
 * (which misses "National Insurance Company Limited").
 */
export function insurerRowMatchesTripartiteSelectedIcWhitelist(
  row: Record<string, unknown>,
): boolean {
  const code = String(row.code ?? "").toLowerCase().trim();
  const irdai = String(row.irdaiInsurerCode ?? "").toLowerCase().trim();
  const name = String(row.name ?? row.insurerName ?? "").toLowerCase();
  const brand = String(row.brandName ?? "").toLowerCase();
  const compact = `${code}${irdai}`.replace(/\s+/g, "");
  const hay = `${name} ${brand} ${code} ${irdai}`;

  if (hay.includes("magma")) return true;
  if (hay.includes("national insurance")) return true;
  if (hay.includes("oriental insurance")) return true;
  if (hay.includes("new india assurance")) return true;
  if (matchUnitedIndiaInsurer(hay, code, irdai, compact)) return true;

  return matchTripartiteWhitelistTokens(name, brand, code, irdai, compact);
}

/** Tripartite + "Selected ICs": subset of insurer API list. */
export function buildTripartiteInsurerOptions(rows: unknown[]): InsurerDropdownOption[] {
  const rowsArr = Array.isArray(rows) ? rows : [];
  const opts = rowsArr
    .filter((r) =>
      insurerRowMatchesTripartiteSelectedIcWhitelist(r as Record<string, unknown>),
    )
    .map((i) => rowToInsurerOption(i as Record<string, unknown>))
    .filter((o): o is InsurerDropdownOption => o != null);
  return [...opts].sort(
    (a, b) => tripartiteSelectedIcSortKey(a.label) - tripartiteSelectedIcSortKey(b.label) || a.label.localeCompare(b.label),
  );
}

/**
 * Loads insurers from `GET /v1/insurer` (see `fetchInsurerListAPI`) for Agreement "Selected ICs" multi-select.
 */
export function useAgreementInsurerOptions(): {
  options: InsurerDropdownOption[];
  loading: boolean;
  /** Raw rows from API (for tripartite filtering). */
  rawRows: unknown[];
} {
  const dispatch = useAppDispatch();
  const { insurerList, loading } = useAppSelector((s) => s.insurerList);

  useEffect(() => {
    dispatch(fetchInsurerList());
  }, [dispatch]);

  const rawRows = useMemo(
    () => (Array.isArray(insurerList) ? insurerList : []),
    [insurerList],
  );

  const options = useMemo(() => {
    return rawRows
      .map((i) => rowToInsurerOption(i as unknown as Record<string, unknown>))
      .filter((o): o is InsurerDropdownOption => o != null);
  }, [rawRows]);

  return { options, loading, rawRows };
}

export function labelsForSelectedIcIds(
  ids: string[] | string | unknown,
  optionList: InsurerDropdownOption[],
): string[] {
  const idList = normalizeSelectedIcIds(ids);
  return idList.map((id) => {
    const hit = optionList.find((o) => String(o.value) === String(id));
    return hit?.label ?? id;
  });
}

export function normalizeSelectedIcIds(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    const t = input.trim();
    if (!t) return [];
    return t
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}
