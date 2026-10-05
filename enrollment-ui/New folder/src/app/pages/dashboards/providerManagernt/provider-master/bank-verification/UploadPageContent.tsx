import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import { usePermission } from "@/app/auth/usePermission";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchBulkBankDetailsInwards } from "@/store/features/bulkBankDetails/bulkBankDetailsSlice";
import { showErrorMessage } from "@/utils/errorHandler";
import {
  CommonSearch,
  Pagination,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  type SearchField,
  useDisclosure,
} from "../../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { ProviderDataToolbar } from "../../shared/ProviderDataToolbar";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "../../shared/providerButtonStyles";
import {
  BANK_VERIFICATION_LIST_PATH,
  BANK_VERIFICATION_UPLOAD_PATH,
  buildBankVerificationInwardPath,
  buildInwardDocumentViewPath,
  type BankVerificationInwardDocumentNavState,
} from "./config";
import {
  createMinimalBankVerificationInwardRow,
  type BankVerificationInwardRow,
} from "./inwardTypes";
import { InwardGridSection } from "./InwardGridSection";
import { UploadSection } from "./UploadSection";
import { useBankVerificationInwardList } from "./useInwardList";
import { VerificationResultsView } from "./verificationResults/View";

type BankVerificationRouteInwardState = {
  inward?: BankVerificationInwardRow;
};

function readRouteInwardState(
  locationState: unknown,
  inwardNo: string,
): BankVerificationInwardRow | null {
  const inward = (locationState as BankVerificationRouteInwardState | null)?.inward;
  if (inward?.inwardNo !== inwardNo) {
    return null;
  }
  return inward ?? null;
}

export function BankVerificationUploadPageContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { inwardNo: inwardNoParam } = useParams<{ inwardNo?: string }>();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const { canWrite } = usePermission("provider-bank-verification");
  const pageTitle = t("nav.dashboards.provider-masters-bank-verification");
  const uploadTitle = t(
    "nav.dashboards.provider-masters-bank-verification-upload",
    { defaultValue: "Bulk Bank Verification" },
  );
  const inwardNo = inwardNoParam ? decodeURIComponent(inwardNoParam).trim() : "";
  const [refreshToken, setRefreshToken] = useState(0);
  const [uploadFormOpen, setUploadFormOpen] = useState(false);
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const [searchSubmitting, setSearchSubmitting] = useState(false);
  const [selectedInward, setSelectedInward] = useState<BankVerificationInwardRow | null>(
    () => (inwardNo ? readRouteInwardState(location.state, inwardNo) : null),
  );
  const [inwardLoading, setInwardLoading] = useState(Boolean(inwardNo));
  const [inwardError, setInwardError] = useState<string | null>(null);

  const {
    filteredRows,
    totalItems,
    page,
    pageSize,
    loading,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
  } = useBankVerificationInwardList(refreshToken);

  const handleBackToLanding = useCallback(() => {
    navigate(BANK_VERIFICATION_LIST_PATH);
  }, [navigate]);

  const handleBackFromResults = useCallback(() => {
    navigate(BANK_VERIFICATION_UPLOAD_PATH);
  }, [navigate]);

  useEffect(() => {
    if (!inwardNo) {
      setSelectedInward(null);
      setInwardLoading(false);
      setInwardError(null);
      return;
    }

    const routeInward = readRouteInwardState(location.state, inwardNo);
    if (routeInward) {
      setSelectedInward(routeInward);
    }

    let cancelled = false;

    const loadInward = async () => {
      setInwardLoading(true);
      setInwardError(null);
      try {
        const result = await dispatch(
          fetchBulkBankDetailsInwards({
            page: 1,
            size: 1,
            inwardNo,
          }),
        ).unwrap();

        if (cancelled) return;

        const row = result.rows.find((item) => item.inwardNo === inwardNo) ?? result.rows[0];
        if (!row) {
          if (routeInward) {
            setSelectedInward(routeInward);
            setInwardError(null);
            return;
          }
          setSelectedInward(createMinimalBankVerificationInwardRow(inwardNo));
          setInwardError(null);
          return;
        }

        setSelectedInward(row);
        setInwardError(null);
      } catch (err) {
        if (cancelled) return;
        if (routeInward) {
          setSelectedInward(routeInward);
          setInwardError(null);
          return;
        }
        const message = typeof err === "string" ? err : "";
        setInwardError(message || t("providerMaster.bankVerification.errors.loadInwardFailed"));
        setSelectedInward(createMinimalBankVerificationInwardRow(inwardNo));
      } finally {
        if (!cancelled) setInwardLoading(false);
      }
    };

    loadInward();

    return () => {
      cancelled = true;
    };
  }, [dispatch, inwardNo, location.state, t]);

  useEffect(() => {
    if (inwardNo && selectedInward) {
      setBreadcrumbs([
        { title: t("providerMaster.moduleName") },
        { title: t("providerMaster.providerMasterLabel") },
        { title: pageTitle, onClick: handleBackToLanding },
        { title: uploadTitle, onClick: handleBackFromResults },
        { title: inwardNo },
      ]);
      return () => setBreadcrumbs([]);
    }

    setBreadcrumbs([
      { title: t("providerMaster.moduleName") },
      { title: t("providerMaster.providerMasterLabel") },
      { title: pageTitle, onClick: handleBackToLanding },
      { title: uploadTitle },
    ]);
    return () => setBreadcrumbs([]);
  }, [
    handleBackFromResults,
    handleBackToLanding,
    inwardNo,
    pageTitle,
    selectedInward,
    setBreadcrumbs,
    t,
    uploadTitle,
  ]);

  useEffect(() => {
    if (!inwardNo || inwardLoading || selectedInward || !inwardError) return;
    showErrorMessage({ error: inwardError });
    navigate(BANK_VERIFICATION_UPLOAD_PATH, { replace: true });
  }, [inwardError, inwardLoading, inwardNo, navigate, selectedInward]);

  const refreshRows = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  const handleUploadClick = useCallback(() => {
    setUploadFormOpen((open) => !open);
  }, []);

  const handleFormCancel = useCallback(() => {
    setUploadFormOpen(false);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    refreshRows();
    setUploadFormOpen(false);
  }, [refreshRows]);

  const onView = useCallback(
    (row: BankVerificationInwardRow) => {
      navigate(buildBankVerificationInwardPath(row.inwardNo), { state: { inward: row } });
    },
    [navigate],
  );

  const onViewDocuments = useCallback(
    (row: BankVerificationInwardRow) => {
      const navState: BankVerificationInwardDocumentNavState = {
        returnPath: BANK_VERIFICATION_UPLOAD_PATH,
      };
      navigate(buildInwardDocumentViewPath(row.inwardNo), {
        state: navState,
      });
    },
    [navigate],
  );

  const searchFields: SearchField[] = useMemo(
    () => [
      {
        name: "inwardNo",
        label: t("providerMaster.bankVerification.search.inwardNo"),
        type: "text",
      },
      {
        name: "insurerName",
        label: t("providerMaster.bankVerification.search.insurerName"),
        type: "text",
      },
    ],
    [t],
  );

  const handleSearchSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      setSearchSubmitting(true);
      handleSearch(data);
      setSearchSubmitting(false);
    },
    [handleSearch],
  );

  if (inwardNo) {
    if (inwardLoading && !selectedInward) {
      return (
        <div className="flex min-h-0 w-full flex-1 items-center justify-center p-4 text-xs text-gray-500">
          {t("providerMaster.bankVerification.loading.inward", { inwardNo })}
        </div>
      );
    }

    if (selectedInward) {
      return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <VerificationResultsView inward={selectedInward} />
        </div>
      );
    }

    return null;
  }

  return (
    <>
      <CompactPageHeader
        title={uploadTitle}
        totalCount={totalItems}
        countLabel="Inwards"
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
            onClick={handleUploadClick}
            label={t("providerMaster.bankVerification.upload")}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
          />
        )}
      </CompactPageHeader>

      {isSearchOpen ? (
        <CommonSearch
          fields={searchFields}
          onSearch={handleSearchSubmit}
          isSubmitting={searchSubmitting}
          title={t("providerMaster.bankVerification.search.inwardTitle")}
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
          allowEmptySearch
        />
      ) : null}

      {uploadFormOpen && canWrite ? (
        <div className="shrink-0 overflow-y-auto">
          <UploadSection
            disabled={!canWrite}
            onCancel={handleFormCancel}
            onUploaded={handleUploadSuccess}
          />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800 overflow-hidden">
        <InwardGridSection
          rowData={filteredRows}
          t={t}
          onView={onView}
          onViewDocuments={onViewDocuments}
          loading={loading}
        />
      </div>

      <Pagination
        className="shrink-0"
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
      />
    </>
  );
}
