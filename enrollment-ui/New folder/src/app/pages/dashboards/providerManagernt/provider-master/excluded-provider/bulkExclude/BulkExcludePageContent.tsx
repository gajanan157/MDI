import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import { usePermission } from "@/app/auth/usePermission";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { showErrorMessage } from "@/utils/errorHandler";
import {
  CommonSearch,
  Pagination,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  ProviderBusyOverlay,
  type SearchField,
  UploadResultDialog,
  useDisclosure,
} from "../../../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { ProviderDataToolbar } from "../../../shared/ProviderDataToolbar";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "../../../shared/providerButtonStyles";
import { showProviderError } from "../../../shared/ProviderAlertDialog";
import { isDuplicateFileName } from "../../../shared/duplicateFileName";
import {
  isAllowedSupportingDocument,
  SUPPORTING_DOCUMENT_INVALID_MESSAGE,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/config";
import {
  buildBulkIcMappingInwardDocumentViewPath,
  type BulkIcMappingInwardDocumentNavState,
} from "../../ic-corporate-mapping/config";
import type { BulkIcMappingInwardRow } from "../../ic-corporate-mapping/inward/rows";
import {
  isExcludedProviderListFile,
  isExcludedProviderListingType,
} from "../config";
import { submitExcludedProviderListUpload } from "../upload";
import { BlacklistUploadDialog } from "../BlacklistUploadDialog";
import {
  canSubmitBlacklistForm,
  extractBlacklistUploadError,
  resetBlacklistUploadForm,
  type BlacklistUploadFormValues,
} from "../blacklistUploadHelpers";
import { useProviderInwardContextIds } from "../../../shared/providerInwardDefaults";
import { ProviderExclusionSummary } from "../inward/ProviderExclusionSummary";
import { resolveListingTypeFromDocumentType } from "../inward/paths";
import { BulkExcludeInwardGridSection } from "./InwardGridSection";
import {
  BULK_EXCLUDE_PATH,
  buildBulkExcludeStagingPath,
} from "./config";
import {
  useBulkExcludeBreadcrumbs,
  useBulkExcludeInwardList,
  useBulkExcludeRouteInward,
} from "./usePage";

type BulkExcludePageContentProps = {
  refreshToken: number;
  onUploadSuccess: () => void;
};

export function BulkExcludePageContent({
  refreshToken,
  onUploadSuccess,
}: Readonly<BulkExcludePageContentProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canWrite } = usePermission("provider-excluded");
  const insurerMainList = useAppSelector((state) => state.insurer.insurerMainList);
  const {
    departmentId,
    inwardReceivedTpaBranchId,
    ready: inwardContextReady,
    branchMissing,
    departmentMissing,
  } = useProviderInwardContextIds();

  const {
    inwardNo: stagingInwardNo,
    stagingInward,
    loading: stagingInwardLoading,
    error: stagingInwardError,
  } = useBulkExcludeRouteInward();

  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const [searchSubmitting, setSearchSubmitting] = useState(false);

  const {
    filteredRows,
    handleSearch,
    page,
    pageSize,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
    loading,
  } = useBulkExcludeInwardList(refreshToken, {
    // Eye → staging: do not refetch the bulk-exclude inwards list.
    enabled: !stagingInwardNo,
  });

  const [blacklistUploadOpen, setBlacklistUploadOpen] = useState(false);
  const [blacklistUploading, setBlacklistUploading] = useState(false);
  const [blacklistUploadError, setBlacklistUploadError] = useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [remark, setRemark] = useState("");
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [supportingFile, setSupportingFile] = useState<File | null>(null);
  const [primaryFileName, setPrimaryFileName] = useState<string | null>(null);
  const [supportingFileName, setSupportingFileName] = useState<string | null>(null);
  const [primaryFileError, setPrimaryFileError] = useState("");
  const [supportingFileError, setSupportingFileError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResultMessage, setUploadResultMessage] = useState("");

  const blacklistForm = useForm<BlacklistUploadFormValues>({
    defaultValues: {
      uploadIcId: "",
      blacklistedBy: "",
      listingType: "",
      investigationRequired: false,
      emergencyExceptionAllowed: false,
      investigationApplicableFor: [],
      status: [],
    },
  });

  const onView = useCallback(
    (row: BulkIcMappingInwardRow) => {
      navigate(buildBulkExcludeStagingPath(row.inwardNo), {
        state: { inward: row },
      });
    },
    [navigate],
  );

  const onViewInwardDocuments = useCallback(
    (row: BulkIcMappingInwardRow) => {
      const navState: BulkIcMappingInwardDocumentNavState = {
        returnPath: BULK_EXCLUDE_PATH,
      };
      navigate(buildBulkIcMappingInwardDocumentViewPath(row.inwardNo), {
        state: navState,
      });
    },
    [navigate],
  );

  const searchFields: SearchField[] = useMemo(
    () => [
      {
        name: "inwardNo",
        label: t("providerMaster.icMapping.search.inwardNo"),
        type: "text",
      },
      {
        name: "insurerName",
        label: t("providerMaster.excludedProvider.search.insurerName"),
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

  const handleUploadClick = useCallback(() => {
    if (blacklistUploadOpen) {
      setBlacklistUploadOpen(false);
      return;
    }
    blacklistForm.reset({
      uploadIcId: "",
      blacklistedBy: "",
      listingType: "",
      investigationRequired: false,
      emergencyExceptionAllowed: false,
      investigationApplicableFor: [],
      status: [],
    });
    setEffectiveFrom("");
    setRemark("");
    setPrimaryFile(null);
    setSupportingFile(null);
    setPrimaryFileName(null);
    setSupportingFileName(null);
    setPrimaryFileError("");
    setSupportingFileError("");
    setBlacklistUploadError(null);
    setBlacklistUploadOpen(true);
  }, [blacklistForm, blacklistUploadOpen]);

  const applyPrimaryFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setPrimaryFile(null);
        setPrimaryFileName(null);
        setPrimaryFileError("");
        return;
      }
      if (!isExcludedProviderListFile(file)) {
        setPrimaryFile(null);
        setPrimaryFileName(null);
        setPrimaryFileError(
          t("providerMaster.excludedProvider.uploadDialog.documentInvalidFormat"),
        );
        return;
      }
      if (isDuplicateFileName(file.name, supportingFile?.name)) {
        setPrimaryFile(null);
        setPrimaryFileName(null);
        setPrimaryFileError(t("providerMaster.common.duplicateFileName"));
        return;
      }
      setPrimaryFile(file);
      setPrimaryFileName(file.name);
      setPrimaryFileError("");
    },
    [supportingFile?.name, t],
  );

  const applySupportingFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setSupportingFile(null);
        setSupportingFileName(null);
        setSupportingFileError("");
        return;
      }
      if (!isAllowedSupportingDocument(file)) {
        setSupportingFile(null);
        setSupportingFileName(null);
        setSupportingFileError(SUPPORTING_DOCUMENT_INVALID_MESSAGE);
        return;
      }
      if (isDuplicateFileName(file.name, primaryFile?.name)) {
        setSupportingFile(null);
        setSupportingFileName(null);
        setSupportingFileError(t("providerMaster.common.duplicateFileName"));
        return;
      }
      setSupportingFile(file);
      setSupportingFileName(file.name);
      setSupportingFileError("");
    },
    [primaryFile?.name, t],
  );

  const blacklistW = blacklistForm.watch();
  const canSubmitBlacklist = useMemo(
    () =>
      canSubmitBlacklistForm(
        blacklistW,
        effectiveFrom,
        Boolean(primaryFile),
        Boolean(supportingFile),
        remark,
      ) &&
      inwardContextReady &&
      !primaryFileError &&
      !supportingFileError,
    [
      blacklistW,
      effectiveFrom,
      primaryFile,
      supportingFile,
      remark,
      inwardContextReady,
      primaryFileError,
      supportingFileError,
    ],
  );

  const handleBlacklistSubmit = () => {
    (async () => {
      if (!primaryFile || !supportingFile) {
        setBlacklistUploadError(t("providerMaster.excludedProvider.selectBothDocuments"));
        return;
      }
      if (!inwardReceivedTpaBranchId || !departmentId) {
        setBlacklistUploadError(
          branchMissing || departmentMissing
            ? t("providerMaster.rohiniMaster.uploadForm.branchNotAvailable", {
                branch: "Pune-HO",
              })
            : t("providerMaster.rohiniMaster.uploadForm.branchDepartmentLoading"),
        );
        return;
      }

      const listingType = String(blacklistW.listingType ?? "").trim();
      if (!isExcludedProviderListingType(listingType)) {
        setBlacklistUploadError(
          t("providerMaster.excludedProvider.uploadDialog.selectRestrictionType"),
        );
        return;
      }

      setBlacklistUploading(true);
      setBlacklistUploadError(null);
      try {
        const insurerId = String(blacklistW.uploadIcId ?? "").trim();
        const insurerName =
          (insurerMainList ?? []).find((insurer) => insurer.id === insurerId)?.name ?? "";

        const result = await submitExcludedProviderListUpload({
          primaryFile,
          supportingFile,
          listingType,
          blacklistedBy: String(blacklistW.blacklistedBy ?? "").trim(),
          insurerId: insurerId || undefined,
          inwardReceivedTpaBranchId,
          departmentId,
          effectiveFrom,
          remark,
          insurerName: insurerName || undefined,
          status: Array.isArray(blacklistW.status) ? blacklistW.status : [],
          investigationRequired: Boolean(blacklistW.investigationRequired),
          emergencyExceptionAllowed: Boolean(blacklistW.emergencyExceptionAllowed),
          investigationApplicableFor: Array.isArray(blacklistW.investigationApplicableFor)
            ? blacklistW.investigationApplicableFor
            : [],
        });

        if (!result.ok) {
          const msg =
            result.message ?? t("providerMaster.excludedProvider.uploadOrValidationFailed");
          setBlacklistUploadError(msg);
          showProviderError(msg);
          return;
        }

        resetBlacklistUploadForm({
          blacklistForm,
          setBlacklistUploadOpen,
          setPrimaryFile,
          setSupportingFile,
          setPrimaryFileName,
          setSupportingFileName,
          setPrimaryFileError,
          setSupportingFileError,
          setEffectiveFrom,
          setRemark,
        });
        setUploadResultMessage(
          t("providerMaster.excludedProvider.inwardValidated"),
        );
        setUploadSuccess(true);
        onUploadSuccess();
      } catch (err: unknown) {
        const msg = extractBlacklistUploadError(
          err,
          t("providerMaster.excludedProvider.uploadOrValidationFailed"),
        );
        setBlacklistUploadError(msg);
        showProviderError(msg);
      } finally {
        setBlacklistUploading(false);
      }
    })();
  };

  const handleBackFromStaging = useCallback(() => {
    navigate(BULK_EXCLUDE_PATH);
  }, [navigate]);

  useEffect(() => {
    if (!stagingInwardNo || stagingInwardLoading || stagingInward || !stagingInwardError) {
      return;
    }
    showErrorMessage({ error: stagingInwardError });
    navigate(BULK_EXCLUDE_PATH, { replace: true });
  }, [
    navigate,
    stagingInward,
    stagingInwardError,
    stagingInwardLoading,
    stagingInwardNo,
  ]);

  useBulkExcludeBreadcrumbs({
    stagingInwardNo,
    onBackFromStaging: handleBackFromStaging,
  });

  if (stagingInwardNo) {
    if (stagingInwardLoading && !stagingInward) {
      return (
        <div className="flex min-h-0 w-full flex-1 items-center justify-center p-4 text-xs text-gray-500">
          {t("providerMaster.excludedProvider.bulkExclude.loadingInward", {
            inwardNo: stagingInwardNo,
            defaultValue: "Loading inward {{inwardNo}}…",
          })}
        </div>
      );
    }

    if (stagingInward) {
      // Bulk upload never shows restriction details form — that is only for
      // generic inward create/process on the provider dashboard.
      const listingType = resolveListingTypeFromDocumentType(stagingInward.documentType);

      return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <ProviderExclusionSummary
            inwardNo={stagingInward.inwardNo}
            documentType={listingType}
          />
        </div>
      );
    }

    return null;
  }

  return (
    <>
      <CompactPageHeader
        title={t("nav.dashboards.provider-masters-excluded-hospitals-bulk-exclude", {
          defaultValue: "Bulk Exclude",
        })}
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
            label={t("providerMaster.rohiniMaster.upload")}
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
          title={t("providerMaster.excludedProvider.bulkExclude.search.inwardTitle", {
            defaultValue: "Bulk exclude inward search",
          })}
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
          allowEmptySearch
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800 overflow-hidden">
        <BulkExcludeInwardGridSection
          rowData={filteredRows}
          onView={onView}
          onViewDocuments={onViewInwardDocuments}
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

      <BlacklistUploadDialog
        open={blacklistUploadOpen}
        onClose={() => {
          if (blacklistUploading) return;
          setBlacklistUploadOpen(false);
          setPrimaryFile(null);
          setSupportingFile(null);
          setPrimaryFileName(null);
          setSupportingFileName(null);
          setPrimaryFileError("");
          setSupportingFileError("");
          setBlacklistUploadError(null);
        }}
        uploading={blacklistUploading}
        error={blacklistUploadError}
        onClearError={() => setBlacklistUploadError(null)}
        form={blacklistForm}
        effectiveFrom={effectiveFrom}
        onEffectiveFromChange={setEffectiveFrom}
        remark={remark}
        onRemarkChange={setRemark}
        primaryFileName={primaryFileName}
        primaryFileError={primaryFileError}
        supportingFileName={supportingFileName}
        supportingFileError={supportingFileError}
        onPrimaryFileChange={applyPrimaryFile}
        onSupportingFileChange={applySupportingFile}
        canSubmit={canSubmitBlacklist}
        onSubmit={handleBlacklistSubmit}
        inwardNo={null}
      />

      <UploadResultDialog
        open={uploadSuccess}
        onClose={() => {
          setUploadSuccess(false);
          setUploadResultMessage("");
        }}
        title={t("providerMaster.excludedProvider.uploadSuccessful")}
        message={
          uploadResultMessage || t("providerMaster.excludedProvider.inwardValidated")
        }
      />

      <ProviderBusyOverlay
        open={blacklistUploading}
        message={t("providerMaster.excludedProvider.validating")}
      />
    </>
  );
}
