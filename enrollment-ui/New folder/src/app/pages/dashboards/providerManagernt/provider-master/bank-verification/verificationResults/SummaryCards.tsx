import type { TFunction } from "i18next";
import {
  ProviderStagingSummaryCards,
  type ProviderStagingSummaryCardConfig,
} from "../../../shared/ProviderStagingSummaryCards";
import type {
  BankVerificationResultCounts,
  BankVerificationSummaryFilter,
} from "./types";

type BankVerificationMainTab = "total" | "process";

type VerificationSummaryCardsProps = {
  counts: BankVerificationResultCounts;
  activeFilter: BankVerificationSummaryFilter;
  onFilterChange: (filter: BankVerificationSummaryFilter) => void;
  t: TFunction;
};

const CARD_ACTIVE_RING: Record<BankVerificationMainTab, string> = {
  total: "ring-blue-400",
  process: "ring-amber-400",
};

const FAIL_SECTION_KEYS = [
  "NOT_MATCHED",
  "PENDING",
  "BANK_DETAILS_MISSING",
  "PROVIDER_NOT_FOUND",
  "VALIDATION_FAILED",
  "PROCESSING_FAILED",
] as const;

function buildCards(
  counts: BankVerificationResultCounts,
  t: TFunction,
): ProviderStagingSummaryCardConfig<BankVerificationMainTab, BankVerificationSummaryFilter>[] {
  return [
    {
      key: "total",
      label: t("providerMaster.bankVerification.results.total"),
      headerClass: "bg-blue-500",
      activeRingClass: CARD_ACTIVE_RING.total,
      total: counts.total,
      sections: [
        {
          key: "all",
          label: t("providerMaster.bankVerification.results.totalRecords"),
          count: counts.total,
          className: "!px-4",
        },
        {
          key: "VALIDATION_FAILED",
          label: t("providerMaster.bankVerification.results.validationFailed"),
          count: counts.validationFailedCount,
          className: "!px-4",
        },
      ],
    },
    {
      key: "process",
      label: t("providerMaster.bankVerification.results.processed"),
      headerClass: "bg-amber-500",
      activeRingClass: CARD_ACTIVE_RING.process,
      total: counts.processed,
      sections: [
        {
          key: "MATCHED",
          label: t("providerMaster.bankVerification.results.matched"),
          count: counts.matched,
        },
        {
          key: "NOT_MATCHED",
          label: t("providerMaster.bankVerification.results.notMatched"),
          count: counts.notMatched,
        },
        {
          key: "PENDING",
          label: t("providerMaster.bankVerification.results.pending"),
          count: counts.pending,
        },
        {
          key: "BANK_DETAILS_MISSING",
          label: t("providerMaster.bankVerification.results.bankDetailsMissing"),
          count: counts.bankDetailsMissing,
        },
        {
          key: "PROVIDER_NOT_FOUND",
          label: t("providerMaster.bankVerification.results.providerNotFound"),
          count: counts.providerNotFound,
        },
        {
          key: "PROCESSING_FAILED",
          label: t("providerMaster.bankVerification.results.processingFailed"),
          count: counts.processingFailedCount,
        },
      ],
    },
  ];
}

function tabsFromFilter(filter: BankVerificationSummaryFilter): {
  main: BankVerificationMainTab;
  sub: BankVerificationSummaryFilter;
} {
  if (filter === "all" || filter === "VALIDATION_FAILED") {
    return { main: "total", sub: filter };
  }
  return { main: "process", sub: filter };
}

export function VerificationSummaryCards({
  counts,
  activeFilter,
  onFilterChange,
  t,
}: Readonly<VerificationSummaryCardsProps>) {
  const { main, sub } = tabsFromFilter(activeFilter);

  return (
    <ProviderStagingSummaryCards
      cards={buildCards(counts, t)}
      activeMainTab={main}
      activeSubTab={sub}
      onTabSelect={(_nextMain, nextSub) => {
        onFilterChange(nextSub);
      }}
      failSectionKeys={FAIL_SECTION_KEYS}
    />
  );
}
