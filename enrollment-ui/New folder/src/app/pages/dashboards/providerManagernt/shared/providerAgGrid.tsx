import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";

/** Milliseconds until `dateValue` (date-only strings use end-of-day). */
export function msUntilExpiry(dateValue: string, now = Date.now()): number {
  if (!dateValue) return Number.POSITIVE_INFINITY;

  // Handles: 2026-Dec-06
  const expiry = new Date(dateValue);

  if (Number.isNaN(expiry.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  // End of expiry day
  expiry.setHours(23, 59, 59, 999);

  return expiry.getTime() - now;
}

const MS_DAY = 24 * 60 * 60 * 1000;
/** Red “Warning: expires in …” pill when expiry is within this many days. */
const SEVEN_DAYS_MS = 7 * MS_DAY;
const THIRTY_DAYS_MS = 30 * MS_DAY;

/** Highlight state for Rohini / network provider code cells from `effectiveToDate`. */
export type RohiniExpiryHighlight = "none" | "urgent" | "expired";

export function rohiniExpiryHighlight(
  effectiveToDate: string | null | undefined,
  now = Date.now(),
): RohiniExpiryHighlight {
  const ms = msUntilExpiry(String(effectiveToDate ?? ""), now);
  if (ms === Number.POSITIVE_INFINITY) return "none";
  if (ms < 0) return "expired";
  if (ms <= THIRTY_DAYS_MS) return "urgent";
  return "none";
}

const VIEW_BTN_CLASS =
  "flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100";

function expiryDayUnitEn(days: number): string {
  return days === 1 ? "day" : "days";
}

/** English-only expiry pill text for provider grid cells (not locale-translated). */
export function expiryAlertCellContentEn(msLeft: number): ReactNode {
  const empty = "—";

  if (msLeft === Number.POSITIVE_INFINITY) return empty;

  if (msLeft < 0) {
    const daysAgo = Math.floor(Math.abs(msLeft) / MS_DAY);
    if (daysAgo === 0) {
      return (
        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
          Expired less than 1 day ago
        </span>
      );
    }
    const unit = expiryDayUnitEn(daysAgo);
    return (
      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
        {`Expired ${daysAgo} ${unit} ago`}
      </span>
    );
  }

  if (msLeft <= SEVEN_DAYS_MS) {
    const daysLeft = Math.ceil(msLeft / MS_DAY);
    const unit = expiryDayUnitEn(daysLeft);
    return (
      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
        {`Warning: expires in ${daysLeft} ${unit}`}
      </span>
    );
  }

  const daysLeft = Math.ceil(msLeft / MS_DAY);
  const unit = expiryDayUnitEn(daysLeft);
  const cls =
    msLeft <= THIRTY_DAYS_MS
      ? "rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700"
      : "rounded bg-green-100 px-2 py-1 text-xs text-green-700";

  return (
    <span className={cls}>
      {`Expires in ${daysLeft} ${unit}`}
    </span>
  );
}

export function expiryAlertTooltipEn(msLeft: number): string {
  if (msLeft === Number.POSITIVE_INFINITY) return "No expiry date";

  if (msLeft < 0) {
    const daysAgo = Math.floor(Math.abs(msLeft) / MS_DAY);
    const unit = expiryDayUnitEn(daysAgo);
    return `Expired ${daysAgo} ${unit} ago`;
  }

  const daysLeft = Math.ceil(msLeft / MS_DAY);
  const unit = expiryDayUnitEn(daysLeft);
  return `Expires in ${daysLeft} ${unit}`;
}

export function createExpiryAlertCellRendererEn<R>(
  getExpiryDateString: (row: R) => string,
  getMsUntil: (date: string) => number = msUntilExpiry,
) {
  return (params: { data?: R }) => {
    const row = params.data;
    if (!row) return "—";
    return expiryAlertCellContentEn(getMsUntil(getExpiryDateString(row)));
  };
}

function expiryDayUnit(days: number, t: TFunction): string {
  return days === 1
    ? t("providerMaster.expiry.day")
    : t("providerMaster.expiry.days");
}

export function expiryAlertCellContent(msLeft: number, t: TFunction): ReactNode {
  const empty = t("providerMaster.expiry.emptyValue");

  if (msLeft === Number.POSITIVE_INFINITY) return empty;

  if (msLeft < 0) {
    const daysAgo = Math.floor(Math.abs(msLeft) / MS_DAY);
    if (daysAgo === 0) {
      return (
        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
          {t("providerMaster.expiry.expiredLessThanOneDay")}
        </span>
      );
    }
    const unit = expiryDayUnit(daysAgo, t);
    return (
      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
        {t("providerMaster.expiry.expiredAgo", { days: daysAgo, unit })}
      </span>
    );
  }

  if (msLeft <= SEVEN_DAYS_MS) {
    const daysLeft = Math.ceil(msLeft / MS_DAY);
    const unit = expiryDayUnit(daysLeft, t);
    return (
      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
        {t("providerMaster.expiry.warningExpiresIn", { days: daysLeft, unit })}
      </span>
    );
  }

  const daysLeft = Math.ceil(msLeft / MS_DAY);
  const unit = expiryDayUnit(daysLeft, t);
  const cls =
    msLeft <= THIRTY_DAYS_MS
      ? "rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700"
      : "rounded bg-green-100 px-2 py-1 text-xs text-green-700";

  return (
    <span className={cls}>
      {t("providerMaster.expiry.expiresIn", { days: daysLeft, unit })}
    </span>
  );
}

export function createExpiryAlertCellRenderer<R>(
  getExpiryDateString: (row: R) => string,
  getMsUntil: (date: string) => number = msUntilExpiry,
  t: TFunction,
) {
  return (params: { data?: R }) => {
    const row = params.data;
    if (!row) return t("providerMaster.expiry.emptyValue");
    return expiryAlertCellContent(getMsUntil(getExpiryDateString(row)), t);
  };
}

export function createRohiniCodeCellRenderer<
  R extends { effectiveToDate?: string | null },
>(t: TFunction) {
  return (params: { value?: string | number | null; data?: R }) => {
    const code = String(params.value ?? "").trim();
    const empty = t("providerMaster.expiry.emptyValue");
    if (!code) return empty;
    const hl = rohiniExpiryHighlight(params.data?.effectiveToDate);
    if (hl === "none") return code;
    const cls =
      hl === "expired"
        ? "rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800 ring-1 ring-red-200/70"
        : "rounded bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-900 ring-1 ring-orange-200/80";
    return <span className={cls}>{code}</span>;
  };
}

export function viewEyeCellRenderer<T>(
  onView: (row: T) => void,
  opts?: { title?: string; ariaLabel?: string },
) {
  const title = opts?.title ?? "View details";
  const ariaLabel = opts?.ariaLabel ?? title;
  return (params: { data?: T }) => {
    const row = params.data;
    if (row == null) return null;
    return (
      <div className="flex h-full items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(row);
          }}
          className={VIEW_BTN_CLASS}
          title={title}
          aria-label={ariaLabel}
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };
}

export type ViewEyeActionColumnOverrides = Partial<{
  headerName: string;
  field: string;
  /** Default `"left"`. Pass `null` to leave the column unpinned. */
  pinned: "left" | "right" | null;
  minWidth: number;
  maxWidth: number;
  suppressMovable: boolean;
  title: string;
  ariaLabel: string;
}>;

export function viewEyeActionColumn<T>(
  onView: (row: T) => void,
  t: TFunction,
  overrides?: ViewEyeActionColumnOverrides,
) {
  const title = overrides?.title ?? t("providerMaster.common.view");
  const pinned =
    overrides?.pinned === null ? undefined : (overrides?.pinned ?? "left");
  return {
    headerName: overrides?.headerName ?? t("providerMaster.common.actions"),
    field: overrides?.field ?? "actions",
    pinned,
    minWidth: overrides?.minWidth ?? 40,
    maxWidth: overrides?.maxWidth ?? 100,
    sortable: false,
    filter: false,
    suppressMovable: overrides?.suppressMovable,
    cellRenderer: viewEyeCellRenderer(onView, {
      title,
      ariaLabel: overrides?.ariaLabel ?? title,
    }),
  };
}

export function activeInactiveStatusPillRenderer(params: { value?: string }) {
  const v = String(params.value ?? "").trim();
  const normalized = v.toLowerCase();

  // Match provider list pill style: rounded + tonal bg/text (no border/shadow).
  let tone = "bg-slate-100 text-slate-700";
  if (normalized === "active") {
    tone = "bg-green-100 text-green-700";
  } else if (normalized === "terminated" || normalized.includes("terminat")) {
    tone = "bg-red-100 text-red-700";
  } else if (normalized === "inactive") {
    tone = "bg-yellow-100 text-yellow-700";
  }

  return (
    <span className={`inline-flex rounded px-2 py-1 text-xs ${tone}`}>
      {v || "—"}
    </span>
  );
}

export function presignedDownloadLinkCellRenderer(
  params: {
    data?: { presignedUrl?: string; fileName?: string };
  },
  t: TFunction,
) {
  const url = params?.data?.presignedUrl;
  const fileName = params?.data?.fileName?.trim() || "download";
  const empty = t("providerMaster.expiry.emptyValue");
  if (!url) return empty;
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(String(res.status));
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = objectUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(objectUrl);
        } catch {
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      }}
      className="text-primary-600 dark:text-primary-400 inline-flex cursor-pointer items-center gap-1 underline"
    >
      <ArrowDownTrayIcon className="h-4 w-4 shrink-0" aria-hidden />
      {t("providerMaster.common.download")}
    </button>
  );
}

export function createPresignedDownloadLinkCellRenderer(t: TFunction) {
  return (params: { data?: { presignedUrl?: string; fileName?: string } }) =>
    presignedDownloadLinkCellRenderer(params, t);
}
