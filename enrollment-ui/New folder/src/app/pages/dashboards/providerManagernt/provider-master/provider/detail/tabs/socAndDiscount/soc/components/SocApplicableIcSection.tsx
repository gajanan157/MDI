import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ProviderSectionSeeMoreToggle } from "../../../providerDetails/Cards";
import type { SocApplicableIc, SocGipsaSocVariant } from "../data/socListData";
import type { SocCorporateSelection } from "../utils/socAgreementCorporateRules";
import { SOC_APPLICABLE_IC_PREVIEW_COUNT } from "../utils/socDetailTheme";
import { SocApplicableIcTable } from "./SocDetailTable";

type SocApplicableIcSectionProps = {
  isSocViewMode: boolean;
  gipsaSocVariant?: SocGipsaSocVariant;
  selectedApplicableIcIds?: string[];
  onSelectedApplicableIcIdsChange?: (ids: string[]) => void;
  applicableIcsSummary?: string;
  applicableIcs: SocApplicableIc[];
  corporates?: SocCorporateSelection[];
  /** Corporate SOC checked — search/filter and table focus on corporates. */
  isCorporateMode?: boolean;
  insurerOptions?: { value: string; label: string }[];
  insurerOptionsLoading?: boolean;
  canSelectIc?: boolean;
  singleIcMode?: boolean;
  icRequired?: boolean;
  className?: string;
};

export function SocApplicableIcSection({
  isSocViewMode,
  applicableIcs,
  corporates = [],
  isCorporateMode = false,
  icRequired = false,
  className = "",
}: Readonly<SocApplicableIcSectionProps>) {
  const { t } = useTranslation();
  const AI = "providerMaster.soc.applicableIc";
  const [icListExpanded, setIcListExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery("");
    setIcListExpanded(false);
  }, [isCorporateMode]);

  const insurerNameAbove = useMemo(() => {
    if (!isCorporateMode) return "";
    const names = applicableIcs
      .map((row) => row.insurerName.trim())
      .filter(Boolean);
    return [...new Set(names)].join(", ");
  }, [applicableIcs, isCorporateMode]);

  const tableRows = useMemo(() => {
    // Corporate mode: only corporate rows (insurer shown above the table).
    if (isCorporateMode) {
      if (corporates.length === 0) return [];
      const effectiveFrom = applicableIcs[0]?.effectiveFrom ?? "";
      const insurerId = applicableIcs[0]?.insurerId ?? "corp";
      return corporates.map((corporate) => ({
        id: `${insurerId}__${corporate.id}`,
        name: "",
        effectiveFrom,
        corporate: corporate.name.trim(),
      }));
    }

    return applicableIcs.map((row) => ({
      id: row.insurerId,
      name: row.insurerName,
      effectiveFrom: row.effectiveFrom,
      corporate: "",
    }));
  }, [applicableIcs, corporates, isCorporateMode]);

  const hasMoreIcRows = tableRows.length > SOC_APPLICABLE_IC_PREVIEW_COUNT;

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tableRows;

    if (isCorporateMode) {
      return tableRows.filter((row) => row.corporate.toLowerCase().includes(q));
    }

    return tableRows.filter((row) => row.name.toLowerCase().includes(q));
  }, [isCorporateMode, searchQuery, tableRows]);

  const visibleRows = useMemo(() => {
    if (icListExpanded || filteredRows.length <= SOC_APPLICABLE_IC_PREVIEW_COUNT) {
      return filteredRows;
    }
    return filteredRows.slice(0, SOC_APPLICABLE_IC_PREVIEW_COUNT);
  }, [filteredRows, icListExpanded]);

  const hasSearch = Boolean(searchQuery.trim());
  const showEmptyState = filteredRows.length === 0;

  const emptyMessage = (() => {
    if (hasSearch) {
      return isCorporateMode
        ? t(`${AI}.noCorporatesMatchSearch`)
        : t(`${AI}.noInsurersMatchSearch`);
    }
    if (isCorporateMode && applicableIcs.length === 0) {
      return t(`${AI}.selectInsurerForCorporate`);
    }
    if (isCorporateMode && corporates.length === 0) {
      return t(`${AI}.noCorporatesYet`);
    }
    return t(`${AI}.noInsurersYet`);
  })();

  const searchPlaceholder = isCorporateMode
    ? t(`${AI}.searchCorporate`)
    : t(`${AI}.searchInsurer`);

  const baseTitle = t(`${AI}.title`);
  const sectionTitle =
    isCorporateMode && insurerNameAbove
      ? baseTitle + " : " + insurerNameAbove
      : baseTitle;

  return (
    <div className={`flex h-full min-w-0 flex-col ${className}`.trim()}>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-1 border-b border-slate-200/80 px-2 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <UserGroupIcon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <h3 className="min-w-0 truncate text-[11px] font-semibold text-slate-900" title={sectionTitle}>
              {isCorporateMode && insurerNameAbove ? (
                <>
                  {baseTitle}
                  {" : "}
                  <span className="input-label font-normal text-black">{insurerNameAbove}</span>
                </>
              ) : (
                baseTitle
              )}
              {icRequired && !isSocViewMode ? (
                <span className="ms-0.5 text-red-600" aria-hidden="true">
                  *
                </span>
              ) : null}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {hasMoreIcRows ? (
              <ProviderSectionSeeMoreToggle
                expanded={icListExpanded}
                onToggle={() => setIcListExpanded((open) => !open)}
              />
            ) : null}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-2 py-1.5">
          {!isSocViewMode ? (
            <div className="relative mb-1.5 shrink-0">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-7 w-full rounded-md border border-slate-300 bg-white py-1 pr-2 pl-8 text-[11px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          ) : null}

          {showEmptyState ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-2 py-3 text-center">
              <ClipboardDocumentListIcon className="mb-0.5 h-5 w-5 text-slate-300" aria-hidden />
              <p className="text-[11px] font-medium text-slate-600">{emptyMessage}</p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto">
              <SocApplicableIcTable
                rows={visibleRows}
                corporateLayout={isCorporateMode}
                showActions={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
