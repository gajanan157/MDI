import type { BulkIcMappingType } from "../types";
import type { NormalizedStagingProviderInsurerCounts } from "./normalizer";
import type {
  BulkIcMappingStagingMainTab,
  BulkIcMappingStagingSubTab,
} from "./utils";
import {
  ProviderStagingSummaryCards,
  type ProviderStagingSummaryCardConfig,
} from "../../../shared/ProviderStagingSummaryCards";

type BulkIcMappingStagingSummaryCardsProps = {
  counts: NormalizedStagingProviderInsurerCounts;
  activeMainTab: BulkIcMappingStagingMainTab;
  activeSubTab: BulkIcMappingStagingSubTab;
  onTabSelect: (mainTab: BulkIcMappingStagingMainTab, subTab: BulkIcMappingStagingSubTab) => void;
  mappingType?: BulkIcMappingType;
  className?: string;
};

const CARD_ACTIVE_RING: Record<BulkIcMappingStagingMainTab, string> = {
  total: "ring-blue-400",
  process: "ring-amber-400",
};

const IC_FAIL_SECTION_KEYS = ["fail", "processingFail", "notFound"] as const;

function buildEmpanelSummaryCards(
  counts: NormalizedStagingProviderInsurerCounts,
): ProviderStagingSummaryCardConfig<
  BulkIcMappingStagingMainTab,
  BulkIcMappingStagingSubTab
>[] {
  return [
    {
      key: "total",
      label: "Total",
      headerClass: "bg-blue-500",
      activeRingClass: CARD_ACTIVE_RING.total,
      total: counts.totalReceived,
      sections: [
        {
          key: "success",
          label: "Validation Success",
          count: counts.validCount,
          className: "!px-4",
        },
        {
          key: "fail",
          label: "Validation Failed",
          count: counts.validationFailedCount,
          className: "!px-4",
        },
      ],
    },
    {
      key: "process",
      label: "Processed",
      headerClass: "bg-amber-500",
      activeRingClass: CARD_ACTIVE_RING.process,
      total: counts.validCount,
      sections: [
        {
          key: "alreadyExist",
          label: "Already Mapped",
          count: counts.alreadyMappedCount,
        },
        {
          key: "newAdd",
          label: "New Provider Created",
          count: counts.createdCount,
        },
        {
          key: "newMap",
          label: "New Mapping Created",
          count: counts.mappedCount,
        },
        {
          key: "processingFail",
          label: "Processing Failed",
          count: counts.processingFailedCount,
        },
      ],
    },
  ];
}

/** De-empanelment summary tiles — keys from staging/status `additionalData`. */
function buildDepanelSummaryCards(
  counts: NormalizedStagingProviderInsurerCounts,
): ProviderStagingSummaryCardConfig<
  BulkIcMappingStagingMainTab,
  BulkIcMappingStagingSubTab
>[] {
  return [
    {
      key: "total",
      label: "Total Records",
      headerClass: "bg-blue-500",
      activeRingClass: CARD_ACTIVE_RING.total,
      total: counts.totalReceived,
      sections: [
        { key: "success", label: "Success", count: counts.validCount },
        {
          key: "fail",
          label: "Fail",
          count: counts.validationFailedCount,
        },
      ],
    },
    {
      key: "process",
      label: "Processed",
      headerClass: "bg-amber-500",
      activeRingClass: CARD_ACTIVE_RING.process,
      total: counts.validCount,
      sections: [
        {
          key: "newMap",
          label: "Newly De-empanelled",
          count: counts.deEmpanelledCount,
        },
        {
          key: "alreadyExist",
          label: "Already De-empanelled",
          count: counts.alreadyDeEmpanelledCount,
        },
        {
          key: "notFound",
          label: "Provider Not Found",
          count: counts.notFoundForDeEmpanelmentCount,
        },
        {
          key: "processingFail",
          label: "Fail",
          count: counts.processingFailedCount,
        },
      ],
    },
  ];
}

export function BulkIcMappingStagingSummaryCards({
  counts,
  activeMainTab,
  activeSubTab,
  onTabSelect,
  mappingType = "empanel",
  className,
}: Readonly<BulkIcMappingStagingSummaryCardsProps>) {
  const cards =
    mappingType === "depanelled"
      ? buildDepanelSummaryCards(counts)
      : buildEmpanelSummaryCards(counts);

  return (
    <ProviderStagingSummaryCards
      cards={cards}
      activeMainTab={activeMainTab}
      activeSubTab={activeSubTab}
      onTabSelect={onTabSelect}
      failSectionKeys={IC_FAIL_SECTION_KEYS}
      className={className}
    />
  );
}
