type NetworkSourceCapsuleCellProps = {
  value?: string | null;
};

const SOURCE_STYLES: Record<string, string> = {
  IC: "bg-blue-100 text-blue-700 ring-1 ring-blue-200/80",
  INSURER: "bg-blue-100 text-blue-700 ring-1 ring-blue-200/80",
  TPA: "bg-purple-100 text-purple-700 ring-1 ring-purple-200/80",
};

export function NetworkSourceCapsuleCell({ value }: Readonly<NetworkSourceCapsuleCellProps>) {
  const label = String(value ?? "").trim();
  if (!label) {
    return (
      <div className="flex h-full items-center">
        <span className="text-[11px] text-gray-400">—</span>
      </div>
    );
  }

  const badgeClass =
    SOURCE_STYLES[label.toUpperCase()] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80";

  return (
    <div className="flex h-full items-center py-0.5">
      <span
        className={`inline-flex min-w-[52px] items-center justify-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}
      >
        {label}
      </span>
    </div>
  );
}
