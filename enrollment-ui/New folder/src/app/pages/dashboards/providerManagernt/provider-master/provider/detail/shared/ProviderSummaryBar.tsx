import { MapPinIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import {
  getProviderSummaryBarLabel,
  type ProviderSummaryFieldKey,
} from "../../../../shared/providerMasterI18n";
import { ProviderSummaryMetaChips } from "./ProviderSummaryMetaChips";

type ProviderSummaryItem = {
  key: ProviderSummaryFieldKey;
  value?: string | null;
};

type ProviderSummaryBarProps = {
  items: ProviderSummaryItem[];
  providerNetworkType?: string;
  tpaProviderNetwork?: string;
  insurerProviderNetwork?: string;
  /** Removes outer card chrome when nested inside a parent header shell. */
  embedded?: boolean;
  /** Record status (e.g. ACTIVE) shown as a pill next to the name. */
  status?: string | null;
  /** Shows a verified pill next to the status. */
  verified?: boolean;
  /** Secondary descriptors (type, class, city) rendered as muted chips. */
  descriptors?: string[];
};

function readValue(item?: ProviderSummaryItem): string {
  const text = String(item?.value ?? "").trim();
  return text === "—" ? "" : text;
}

function buildInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "PR";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function StatusPill({ status }: Readonly<{ status: string }>) {
  const normalized = status.trim().toUpperCase();
  const isActive = normalized === "ACTIVE";
  return (
    <span
      data-testid="provider-status-pill"
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}
        aria-hidden
      />
      {status}
    </span>
  );
}

function KeyValue({
  label,
  value,
  mono = false,
}: Readonly<{ label: string; value: string; mono?: boolean }>) {
  return (
    <div className="min-w-0" data-testid={`provider-summary-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate text-xs font-semibold text-slate-900 ${mono ? "font-mono tabular-nums" : ""}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

export function ProviderSummaryBar({
  items,
  providerNetworkType = "-",
  tpaProviderNetwork = "",
  insurerProviderNetwork = "",
  embedded = false,
  status,
  verified = false,
  descriptors = [],
}: Readonly<ProviderSummaryBarProps>) {
  const { t } = useTranslation();

  const providerName = readValue(items.find((item) => item.key === "providerName"));
  const address = readValue(items.find((item) => item.key === "address"));
  const providerCodeItem = items.find((item) => item.key === "providerCode");
  const rohiniItem = items.find((item) => item.key === "rohiniId");
  const providerCode = readValue(providerCodeItem);
  const rohiniId = readValue(rohiniItem);
  const networkType = providerNetworkType.trim() || "-";
  const statusText = String(status ?? "").trim();
  const chips = descriptors.map((entry) => entry.trim()).filter(Boolean);

  if (!providerName && !address && !providerCode && !rohiniId && networkType === "-") {
    return null;
  }

  return (
    <div
      data-testid="provider-summary-bar"
      className={
        embedded
          ? "px-3 py-2.5"
          : "rounded-lg border border-slate-200 bg-white px-3 py-2.5"
      }
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-700 font-heading text-sm font-bold tracking-tight text-white"
            aria-hidden
          >
            {buildInitials(providerName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2
                className="min-w-0 truncate font-heading text-base font-bold tracking-tight text-slate-900"
                title={providerName}
                data-testid="provider-summary-name"
              >
                {providerName || "—"}
              </h2>
              {statusText ? <StatusPill status={statusText} /> : null}
              {verified ? (
                <span
                  data-testid="provider-verified-pill"
                  className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700"
                >
                  {t("providerMaster.common.verified", { defaultValue: "Verified" })}
                </span>
              ) : null}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
              {address ? (
                <span className="inline-flex min-w-0 items-center gap-1" title={address}>
                  <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <span className="truncate">{address}</span>
                </span>
              ) : null}
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-sm border border-slate-200 bg-slate-50 px-1.5 py-px text-[10px] font-medium text-slate-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <dl className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-slate-200 lg:border-l lg:pl-4">
          {providerCode && providerCodeItem ? (
            <KeyValue label={getProviderSummaryBarLabel(providerCodeItem.key, t)} value={providerCode} mono />
          ) : null}
          {rohiniId && rohiniItem ? (
            <KeyValue label={getProviderSummaryBarLabel(rohiniItem.key, t)} value={rohiniId} mono />
          ) : null}
          <div className="flex shrink-0 items-center">
            <ProviderSummaryMetaChips
              networkType={networkType}
              tpaProviderNetwork={tpaProviderNetwork}
              insurerProviderNetwork={insurerProviderNetwork}
            />
          </div>
        </dl>
      </div>
    </div>
  );
}
