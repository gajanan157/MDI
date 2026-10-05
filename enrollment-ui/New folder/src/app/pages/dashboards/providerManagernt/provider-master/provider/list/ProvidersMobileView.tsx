import { type ComponentType, type ReactNode } from "react";
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChevronRightIcon,
  EyeIcon,
  IdentificationIcon,
  MapPinIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { DocumentDuplicateIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "react-i18next";
import { useClipboard } from "@/hooks";
import {
  expiryAlertCellContent,
  msUntilExpiry,
} from "../../../shared/providerAgGrid";
import {
  formatNetworkSourceDisplay,
  formatProviderNetworkTypeDisplay,
  isNetworkProviderType,
} from "../../../shared/providerGridDisplayLabels";
import { formatProviderTaxonomyLabel } from "../utils/providerTypeConstants";
import type { ProviderGridRow } from "./utils/providerGridColumns";

type Props = {
  rows: ProviderGridRow[];
  onView: (row: ProviderGridRow) => void;
};

const AVATAR_TONES = [
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
] as const;

function ProviderTypeBadge({ value }: Readonly<{ value?: string | null }>) {
  const label = String(value ?? "").trim();
  if (!label) return null;
  return (
    <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
      {formatProviderTaxonomyLabel(label)}
    </span>
  );
}

function ProviderNetworkTypeBadge({ value }: Readonly<{ value?: string | null }>) {
  const label = formatProviderNetworkTypeDisplay(value);
  if (!label) return null;
  const isNetwork = isNetworkProviderType(value);
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        isNetwork
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {label}
    </span>
  );
}

function ProviderCodeChip({ code }: Readonly<{ code: string }>) {
  const { t } = useTranslation();
  const { copied, copy } = useClipboard({ timeout: 1500 });

  if (!code) return <span>—</span>;

  return (
    <div className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 dark:border-dark-500 dark:bg-dark-600">
      <span className="min-w-0 break-all text-[11px] font-semibold text-primary-700 dark:text-primary-400">
        {code}
      </span>
      <button
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-white hover:text-primary-700 dark:hover:bg-dark-500"
        title={
          copied
            ? t("providerMaster.list.copied")
            : t("providerMaster.list.copyCode")
        }
        aria-label={t("providerMaster.list.copyCode")}
        onClick={(event) => {
          event.stopPropagation();
          copy(code);
        }}
      >
        <DocumentDuplicateIcon className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

function MetaField({
  icon: Icon,
  label,
  children,
  className,
}: Readonly<{
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={`flex min-w-0 items-start gap-2 ${className ?? ""}`}>
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-dark-600 dark:text-gray-400">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-gray-500">
          {label}
        </p>
        <div className="mt-0.5 text-xs font-medium text-slate-800 dark:text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}

function ProviderMobileCard({
  row,
  index,
  onView,
}: Readonly<{
  row: ProviderGridRow;
  index: number;
  onView: (row: ProviderGridRow) => void;
}>) {
  const { t } = useTranslation();

  const providerCode = String(row.providerCode ?? "").trim();
  const providerName = row.providerName?.trim() || "—";
  const beds =
    row.noOfBeds == null || Number.isNaN(Number(row.noOfBeds))
      ? "—"
      : String(row.noOfBeds);
  const networkSource = formatNetworkSourceDisplay(row.networkSource) || "—";
  const rohiniCode = String(row.providerRohiniCode ?? "").trim() || "—";
  const city = row.city?.trim() || "—";
  const state = row.state?.trim() || "—";
  const address = row.address?.trim() || "—";
  const expiryAlert = expiryAlertCellContent(
    msUntilExpiry(row.effectiveToDate ?? ""),
    t,
  );
  const avatarTone = AVATAR_TONES[index % AVATAR_TONES.length];

  return (
    <article className="overflow-hidden rounded-xl border-2 border-slate-300 bg-white shadow-sm dark:border-dark-500 dark:bg-dark-800">
      <div className="flex items-start gap-3 p-3 pb-2">
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarTone}`}
          aria-hidden
        >
          <BuildingOffice2Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-dark-50">
            {providerName}
          </h3>

          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <ProviderTypeBadge value={row.providerType} />
            <ProviderNetworkTypeBadge value={row.providerNetworkType} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-slate-200 px-3 py-3 dark:border-dark-600">
        <MetaField
          icon={IdentificationIcon}
          label={t("providerMaster.table.providerCode")}
        >
          <ProviderCodeChip code={providerCode} />
        </MetaField>
        <MetaField
          icon={ShareIcon}
          label={t("providerMaster.table.networkSource")}
        >
          {networkSource}
        </MetaField>
        <MetaField
          icon={IdentificationIcon}
          label={t("providerMaster.table.providerRohiniCode")}
        >
          <span className="break-all">{rohiniCode}</span>
        </MetaField>
        <MetaField
          icon={CalendarDaysIcon}
          label={t("providerMaster.table.rohiniExpiryAlert")}
        >
          {expiryAlert}
        </MetaField>
        <MetaField
          icon={BuildingOffice2Icon}
          label={t("providerMaster.table.noOfBeds")}
        >
          {beds}
        </MetaField>
        <MetaField
          icon={MapPinIcon}
          label={t("providerMaster.list.cityState")}
        >
          {`${city} / ${state}`}
        </MetaField>
        <MetaField
          icon={MapPinIcon}
          label={t("providerMaster.table.address")}
          className="col-span-2"
        >
          <span className="leading-snug">{address}</span>
        </MetaField>
      </div>

      <button
        type="button"
        onClick={() => onView(row)}
        className="flex w-full items-center justify-between gap-2 border-t border-blue-100 bg-blue-50 px-3 py-2.5 text-left text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
      >
        <span className="inline-flex items-center gap-1.5">
          <EyeIcon className="h-4 w-4" aria-hidden />
          {t("providerMaster.button.viewDetails")}
        </span>
        <ChevronRightIcon className="h-4 w-4 shrink-0" aria-hidden />
      </button>
    </article>
  );
}

export default function ProvidersMobileView({
  rows,
  onView,
}: Readonly<Props>) {
  const { t } = useTranslation();

  if (!rows.length) {
    return (
      <div className="rounded-lg border-2 border-slate-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-dark-500 dark:bg-dark-700 dark:text-gray-400">
        {t("providerMaster.list.noProviders")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-2">
      {rows.map((row, index) => (
        <ProviderMobileCard
          key={row.id}
          row={row}
          index={index}
          onView={onView}
        />
      ))}
    </div>
  );
}
