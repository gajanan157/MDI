import type { ReactNode } from "react";

export function DiscountAgreementOptionLabel({
  name,
  insurerNames,
  status,
}: Readonly<{
  name: string;
  insurerNames: string[];
  status?: string;
}>): ReactNode {
  const showStatus = Boolean(status);
  if (insurerNames.length === 0) {
    return showStatus ? `${name} · ${status}` : name;
  }

  return (
    <span className="flex w-full min-w-0 flex-col items-start gap-0.5 leading-tight">
      <span className="max-w-full truncate text-[11px] font-normal text-slate-600">{name}</span>
      <span
        title={insurerNames.join(", ")}
        className="max-w-full truncate text-[11px] font-semibold text-purple-700"
      >
        {insurerNames.join(", ")}
      </span>
      {showStatus ? (
        <span className="text-[10px] font-medium text-slate-500">{status}</span>
      ) : null}
    </span>
  );
}
