import type { RestrictionScopeKind } from "./restrictionScopeTypes";
import type { NormalizedProviderRestriction } from "./utils";
import {
  buildRestrictionScopeDisplay,
  SCOPE_TYPE_BADGE_CLASS,
  SCOPE_VALUE_BADGE_CLASS,
} from "./restrictionScopeDisplay.helpers";

const SCOPE_HEADER_ITEMS: Array<{ label: string; kind: RestrictionScopeKind }> = [
  { label: "Corporate", kind: "corporate" },
  { label: "RO", kind: "ro" },
  { label: "Policy", kind: "policy" },
];

export function RestrictionScopeColumnHeader() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-1">
      {SCOPE_HEADER_ITEMS.map((item, index) => (
        <span key={item.kind} className="inline-flex items-center gap-1">
          {index > 0 ? <span className="text-[11px] font-semibold text-slate-400">/</span> : null}
          <span className={SCOPE_TYPE_BADGE_CLASS[item.kind]}>{item.label}</span>
        </span>
      ))}
    </div>
  );
}

export function RestrictionScopeCell({ row }: Readonly<{ row: NormalizedProviderRestriction }>) {
  const scope = buildRestrictionScopeDisplay(row);
  if (!scope) {
    return <span className="text-[10px] text-slate-400">—</span>;
  }

  const typeClass = SCOPE_TYPE_BADGE_CLASS[scope.kind];
  const valueClass = SCOPE_VALUE_BADGE_CLASS[scope.kind];

  return (
    <div className="inline-flex max-w-none flex-row flex-wrap items-center gap-1 py-0.5 leading-snug">
      <span className={`${typeClass} shrink-0`}>{scope.typeLabel}</span>
      {scope.values.length === 0 ? (
        <span className="text-[10px] text-slate-400">—</span>
      ) : (
        scope.values.map((value) => (
          <span key={value} className={valueClass} title={value}>
            {value}
          </span>
        ))
      )}
    </div>
  );
}
