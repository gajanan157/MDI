import {
  CheckCircleIcon,
  EyeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { IcMappingGridLabels } from "../../../../../../shared/providerMasterI18n";
import type { ItemWithIdName } from "../types";
import {
  buildBankComparisonRows,
  buildBankMatchMismatchTooltip,
} from "@/app/pages/dashboards/providerManagernt/shared/bankDetailsComparison";
import {
  getNetworkDisplayStatusBadgeClass,
  getNetworkDisplayStatusFromFlags,
  type NetworkDisplayStatus,
} from "./networkDisplayStatus";

export function IcMappingBoolCell({
  value,
  labels,
}: Readonly<{
  value: boolean;
  labels: Pick<IcMappingGridLabels, "yes" | "no">;
}>) {
  return (
    <div className="flex h-full items-center justify-center py-0.5">
      {value ? (
        <CheckCircleIcon
          className="h-5 w-5 text-emerald-500"
          aria-label={labels.yes}
          strokeWidth={2.2}
        />
      ) : (
        <XCircleIcon
          className="h-5 w-5 text-red-500"
          aria-label={labels.no}
          strokeWidth={2.2}
        />
      )}
    </div>
  );
}

export function IcMappingNetworkStatusCell({
  providerNetworkIsActive,
  cashless,
  reimbursement,
  labels,
}: Readonly<{
  providerNetworkIsActive?: boolean | null;
  cashless?: boolean | null;
  reimbursement?: boolean | null;
  labels: Pick<
    IcMappingGridLabels,
    | "statusDepanelled"
    | "statusEmpanelled"
    | "statusWatchlist"
    | "statusBlacklist"
    | "statusActive"
    | "statusInactive"
  >;
}>) {
  const status = getNetworkDisplayStatusFromFlags(
    providerNetworkIsActive,
    cashless,
    reimbursement,
  );
  const text = resolveNetworkDisplayStatusLabel(status, labels);
  const badgeClass = getNetworkDisplayStatusBadgeClass(status);

  return (
    <div className="flex h-full items-center py-0.5">
      <span
        className={`inline-flex min-w-[52px] items-center justify-center rounded px-2 py-1 text-xs ${badgeClass}`}
      >
        {text}
      </span>
    </div>
  );
}

function resolveNetworkDisplayStatusLabel(
  status: NetworkDisplayStatus,
  labels: Pick<
    IcMappingGridLabels,
    | "statusDepanelled"
    | "statusEmpanelled"
    | "statusWatchlist"
    | "statusBlacklist"
    | "statusActive"
    | "statusInactive"
  >,
): string {
  switch (status) {
    case "EMPANELLED":
      return labels.statusEmpanelled;
    case "WATCHLIST":
      return labels.statusWatchlist;
    case "BLACKLIST":
      return labels.statusBlacklist;
    case "DEPANELLED":
    default:
      return labels.statusDepanelled;
  }
}

export function IcMappingPartyCodeCell({ data }: Readonly<{ data: ItemWithIdName }>) {
  const pending = data.partyCodeStatus === "pending";
  const badgeClass = pending
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

  return (
    <div className="flex min-w-0 py-0.5">
      <span
        className={`inline-flex w-fit rounded px-2 py-1 text-xs ${badgeClass}`}
      >
        {pending ? "Pending from IC" : (data.partyCode ?? "—")}
      </span>
    </div>
  );
}

export function IcMappingNetworkSourceCell({ data }: Readonly<{ data: ItemWithIdName }>) {
  const src = String(data.networkSource ?? "").trim();
  if (!src) {
    return (
      <div className="flex h-full items-center py-0.5">
        <span className="text-xs text-gray-400">—</span>
      </div>
    );
  }

  const sourceStyles: Record<string, string> = {
    IC: "bg-blue-100 text-blue-700",
    INSURER: "bg-blue-100 text-blue-700",
    TPA: "bg-purple-100 text-purple-700",
  };
  const badgeClass = sourceStyles[src.toUpperCase()] ?? "bg-slate-100 text-slate-700";

  return (
    <div className="flex h-full items-center py-0.5">
      <span
        className={`inline-flex min-w-[52px] items-center justify-center rounded px-2 py-1 text-xs ${badgeClass}`}
      >
        {src}
      </span>
    </div>
  );
}

function resolveBankMatchPresentation(
  matchStatus: NonNullable<ItemWithIdName["bankMatch"]>,
  labels: Pick<IcMappingGridLabels, "bankMatchMatched" | "bankMatchMismatch" | "bankMatchPending">,
): { badgeClass: string; label: string } {
  if (matchStatus === "matched") {
    return { badgeClass: "bg-green-100 text-green-700", label: labels.bankMatchMatched };
  }
  if (matchStatus === "mismatch") {
    return { badgeClass: "bg-red-100 text-red-700", label: labels.bankMatchMismatch };
  }
  return { badgeClass: "bg-yellow-100 text-yellow-700", label: labels.bankMatchPending };
}

function resolveAgreementPresentation(
  status: NonNullable<ItemWithIdName["agreementStatus"]>,
): { badgeClass: string } {
  if (status === "completed" || status === "active") {
    return { badgeClass: "bg-green-100 text-green-700" };
  }
  if (status === "pending") {
    return { badgeClass: "bg-yellow-100 text-yellow-700" };
  }
  return { badgeClass: "bg-slate-100 text-slate-700" };
}

function resolveAgreementDisplayText(
  data: ItemWithIdName,
  labels: Pick<IcMappingGridLabels, "agreementPending" | "agreementCompleted">,
): string {
  const display = data.agreement?.trim();
  if (display) return display;

  const status = data.agreementStatus ?? "pending";
  if (status === "pending") return labels.agreementPending;
  if (status === "completed") return labels.agreementCompleted;
  if (status === "active") return "Active";
  return "";
}

export function IcMappingAgreementCell({
  data,
  labels,
  onOpenPendingAgreement,
  onOpenCompletedAgreement,
}: Readonly<{
  data: ItemWithIdName;
  labels: Pick<IcMappingGridLabels, "agreementPending" | "agreementCompleted">;
  onOpenPendingAgreement?: (item: ItemWithIdName) => void;
  onOpenCompletedAgreement?: (item: ItemWithIdName) => void;
}>) {
  const status = data.agreementStatus ?? "pending";
  const display = resolveAgreementDisplayText(data, labels);
  if (!display) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const { badgeClass } = resolveAgreementPresentation(status);
  const isPending = status === "pending";
  const isCompleted = status === "completed" || status === "active";
  const hasAgreementId = Boolean(String(data.providerAgreementId ?? "").trim());
  const onClick =
    isPending && onOpenPendingAgreement
      ? onOpenPendingAgreement
      : isCompleted && hasAgreementId && onOpenCompletedAgreement
        ? onOpenCompletedAgreement
        : undefined;

  const badge = (
    <span
      className={`inline-flex max-w-full items-center truncate rounded px-2 py-1 text-xs ${badgeClass} ${
        onClick
          ? "cursor-pointer underline decoration-dotted underline-offset-2 hover:opacity-80"
          : ""
      }`}
      title={display}
    >
      {display}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="min-w-0 border-0 bg-transparent p-0 text-left"
        title={display}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          onClick(data);
        }}
      >
        {badge}
      </button>
    );
  }

  return badge;
}

const BANK_MATCH_FIELD_LABELS = {
  accountHolderName: "Account Holder Name",
  accountNumber: "Account Number",
  ifscCode: "IFSC Code",
  accountType: "Account Type",
  bankName: "Bank Name",
  branch: "Bank Branch",
  pan: "PAN",
};

export function IcMappingBankMatchCell({
  data,
  labels,
  onCompareBankMatch,
}: Readonly<{
  data: ItemWithIdName;
  labels: Pick<
    IcMappingGridLabels,
    | "bankMatchMatched"
    | "bankMatchMismatch"
    | "bankMatchPending"
    | "bankMatchCompare"
    | "bankMatchCompareTooltipHint"
  >;
  onCompareBankMatch?: (item: ItemWithIdName) => void;
}>) {
  const matchStatus = data.bankMatch ?? "pending";
  const { badgeClass, label } = resolveBankMatchPresentation(matchStatus, labels);
  const isMismatch = matchStatus === "mismatch";
  const tooltip = isMismatch
    ? buildBankMatchMismatchTooltip(
        buildBankComparisonRows(null, BANK_MATCH_FIELD_LABELS),
        labels.bankMatchCompareTooltipHint,
      )
    : label;

  const badge = (
    <span
      className={`inline-flex min-w-[70px] items-center justify-center rounded px-2 py-1 text-xs ${badgeClass}`}
      title={tooltip}
    >
      {label}
    </span>
  );

  if (!isMismatch || !onCompareBankMatch) {
    return <div className="flex h-full items-center py-0.5">{badge}</div>;
  }

  return (
    <button
      type="button"
      className="flex h-full min-w-0 items-center gap-1.5 rounded py-0.5 hover:bg-blue-50"
      title={tooltip}
      aria-label={labels.bankMatchCompare}
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation();
        onCompareBankMatch(data);
      }}
    >
      {badge}
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-blue-600">
        <EyeIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </span>
    </button>
  );
}
