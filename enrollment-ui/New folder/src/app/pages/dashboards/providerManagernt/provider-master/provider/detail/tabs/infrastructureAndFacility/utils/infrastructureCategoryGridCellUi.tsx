import type { ReactNode } from "react";
import clsx from "clsx";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { INFRA_BADGE_SHAPE_CLASS } from "./infrastructureCategoryUiConfig";

export function CellAlign({
  align,
  children,
}: Readonly<{
  align: "left" | "center";
  children: ReactNode;
}>) {
  return (
    <div
      className={clsx(
        "flex h-full w-full items-center",
        align === "center" ? "justify-center" : "justify-start",
      )}
    >
      {children}
    </div>
  );
}

export function YesNoBadge({ value }: Readonly<{ value: boolean }>) {
  if (value) {
    return (
      <span className={`inline-flex items-center ${INFRA_BADGE_SHAPE_CLASS} bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold leading-tight text-emerald-700 ring-1 ring-emerald-200/80 shadow-sm`}>
        Yes
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center ${INFRA_BADGE_SHAPE_CLASS} bg-rose-50 px-2 py-0.5 text-[10px] font-semibold leading-tight text-rose-700 ring-1 ring-rose-200/80 shadow-sm`}>
      No
    </span>
  );
}

export function VerifiedBadge({ value }: Readonly<{ value: boolean }>) {
  if (value) {
    return (
      <span className={`inline-flex items-center gap-0.5 ${INFRA_BADGE_SHAPE_CLASS} bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold leading-tight text-emerald-700 ring-1 ring-emerald-200/80 shadow-sm`}>
        <CheckCircleIcon className="h-3 w-3" aria-hidden />
        Yes
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-0.5 ${INFRA_BADGE_SHAPE_CLASS} bg-rose-50 px-2 py-0.5 text-[10px] font-semibold leading-tight text-rose-700 ring-1 ring-rose-200/80 shadow-sm`}>
      <ExclamationTriangleIcon className="h-3 w-3" aria-hidden />
      No
    </span>
  );
}

export function OperationalStatusBadge({ value }: Readonly<{ value: string }>) {
  const trimmed = value.trim();
  if (!trimmed) {
    return <span className="text-[10px] leading-tight text-slate-400">-</span>;
  }
  if (trimmed === "Active") {
    return (
      <span className={`inline-flex ${INFRA_BADGE_SHAPE_CLASS} bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold leading-tight text-emerald-700 ring-1 ring-emerald-200/80 shadow-sm`}>
        Active
      </span>
    );
  }
  if (trimmed === "Inactive") {
    return (
      <span className={`inline-flex ${INFRA_BADGE_SHAPE_CLASS} bg-slate-100 px-2 py-0.5 text-[10px] font-semibold leading-tight text-slate-600 ring-1 ring-slate-200 shadow-sm`}>
        Inactive
      </span>
    );
  }
  return (
    <span className={`inline-flex ${INFRA_BADGE_SHAPE_CLASS} bg-amber-50 px-2 py-0.5 text-[10px] font-semibold leading-tight text-amber-800 ring-1 ring-amber-200/80 shadow-sm`}>
      {trimmed}
    </span>
  );
}
