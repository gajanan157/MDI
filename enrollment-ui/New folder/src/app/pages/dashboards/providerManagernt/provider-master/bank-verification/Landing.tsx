import {
  AgGridSuperWrapper,
  CommonSearch,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  type SearchField,
  useDisclosure,
} from "../../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { ProviderDataToolbar } from "../../shared/ProviderDataToolbar";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "../../shared/providerButtonStyles";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import { useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { usePermission } from "@/app/auth/usePermission";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { LoadingState } from "@/components/shared/LoadingState";
import { useBankAccountSearchList } from "./useBankAccountSearchList";
import { BANK_MATCH_STATUS_OPTIONS } from "@/store/features/providerBankAccountSearch/providerBankAccountSearchApi";
import { createBankDetailsLandingColumns } from "./landingGridColumns";
import {
  providerBankDetailsPath,
  type ProviderBankDetailsNavState,
} from "../provider/utils/providersPaths";
import type { IcWiseGridRow } from "../ic-corporate-mapping/types";

type BankVerificationLandingProps = {
  onOpenUpload: () => void;
};

export default function BankVerificationLanding({
  onOpenUpload,
}: Readonly<BankVerificationLandingProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { canWrite } = usePermission("provider-bank-verification");
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const insurerList = useAppSelector((state) => state.insurerList.insurerList);

  const {
    rows,
    page,
    pageSize,
    totalItems,
    loading,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
  } = useBankAccountSearchList();

  useEffect(() => {
    if ((insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, insurerList]);

  const icOptions = useMemo(
    () =>
      (insurerList ?? []).map((insurer) => ({
        value: insurer.insurerId,
        label: insurer.insurerName,
      })),
    [insurerList],
  );

  const searchFields: SearchField[] = useMemo(
    () => [
      {
        name: "providerName",
        label: t("providerMaster.bankVerification.search.providerName", {
          defaultValue: "Provider Name",
        }),
        type: "text",
      },
      {
        name: "rohiniCode",
        label: t("providerMaster.bankVerification.search.rohiniNumber", {
          defaultValue: "ROHINI Number",
        }),
        type: "text",
      },
      {
        name: "insurerId",
        label: t("providerMaster.bankVerification.search.insuranceCompany", {
          defaultValue: "Insurance Company",
        }),
        type: "dropdown",
        options: icOptions,
      },
      {
        name: "panNumber",
        label: t("providerMaster.bankVerification.search.panNumber", {
          defaultValue: "PAN Number",
        }),
        type: "text",
      },
      {
        name: "matchStatus",
        label: t("providerMaster.bankVerification.search.matchStatus", {
          defaultValue: "Bank Match Status",
        }),
        type: "dropdown",
        options: BANK_MATCH_STATUS_OPTIONS.map((option) => ({ ...option })),
      },
      {
        name: "insurerRecord",
        label: t("providerMaster.bankVerification.search.recordSource", {
          defaultValue: "Record Source",
        }),
        type: "dropdown",
        options: [
          { value: "true", label: "Insurer record" },
          { value: "false", label: "Provider record" },
        ],
      },
    ],
    [icOptions, t],
  );

  const openProviderBankDetails = useCallback(
    (row: IcWiseGridRow, startEdit: boolean) => {
      const providerId = row.providerId?.trim();
      if (!providerId) return;
      const state: ProviderBankDetailsNavState | undefined = startEdit
        ? { startBankDetailsEdit: true }
        : undefined;
      navigate(providerBankDetailsPath(providerId), { state });
    },
    [navigate],
  );

  const gridColumns = useMemo(
    () =>
      createBankDetailsLandingColumns(t, {
        onView: (row) => openProviderBankDetails(row, false),
        onEdit: (row) => openProviderBankDetails(row, true),
      }),
    [openProviderBankDetails, t],
  );

  return (
    <>
      <CompactPageHeader
        title={t("nav.dashboards.provider-masters-bank-verification")}
        totalCount={totalItems}
        countLabel="Records"
        isRefreshing={loading}
      >
        <CheckListButton
          onClick={toggleSearch}
          label={
            isSearchOpen
              ? t("providerMaster.button.hideSearch")
              : t("providerMaster.button.search")
          }
          bgColor="bg-blue-600"
          textColor="text-white"
          size="text-xs"
          className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
          isSearch
        />
        {canWrite && (
          <CheckListButton
            onClick={onOpenUpload}
            label={t("providerMaster.bankVerification.bulkUpload", {
              defaultValue: "Bulk Bank Verification",
            })}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
          />
        )}
      </CompactPageHeader>

      {isSearchOpen ? (
        <CommonSearch
          key="bank-verification-landing-search"
          fields={searchFields}
          onSearch={(data) => handleSearch(data as Record<string, unknown>)}
          isSubmitting={loading}
          title={t("providerMaster.bankVerification.search.summaryTitle", {
            defaultValue: "IC-Provider bank details search",
          })}
          showToggleButton={false}
          isOpen={true}
          onToggle={toggleSearch}
          allowEmptySearch
        />
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <LoadingState
              message={t("providerMaster.bankVerification.loading.summary", {
                defaultValue: "Loading IC-Provider bank details...",
              })}
            />
          </div>
        ) : null}
        <AgGridSuperWrapper
          rowData={rows}
          columnDefs={gridColumns}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
          height="100%"
          domLayout="normal"
        />
      </div>
    </>
  );
}
