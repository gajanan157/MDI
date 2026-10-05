import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useSearchParams } from "react-router";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { Page, PageContent } from "../../../shared/providerShell";
import type { ProviderInwardRow } from "../../../dashboard/inward/providerInwardTypes";
import { ProviderExclusionDetailsForm } from "./ProviderExclusionDetailsForm";
import { ProviderExclusionSummary } from "./ProviderExclusionSummary";
import {
  PROVIDER_DASHBOARD_PATH,
  resolveListingTypeFromDocumentType,
  type ProviderExclusionInwardNavState,
} from "./paths";

/**
 * Enrollment-style shell for PROVIDER_EXCLUSION_RECORDS / PROVIDER_WATCHLIST_RECORDS.
 * - Pending → Provider Details form (footer actions + DocumentDropdown)
 * - Completed / summary view → Bulk-IC-style staging (counts + grid)
 */
export default function ProviderExclusionInwardLayout() {
  const { t } = useTranslation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navState = location.state as ProviderExclusionInwardNavState | null;

  const inwardNo = String(params.inwardNo ?? "").trim();
  const status = (
    searchParams.get("status") ||
    navState?.row?.status ||
    ""
  ).toUpperCase();
  const documentType =
    searchParams.get("documentType") ||
    navState?.row?.documentType ||
    "";
  const sourceEntity =
    searchParams.get("sourceEntity") ||
    navState?.row?.sourceEntity ||
    "";
  const view = (searchParams.get("view") || "").toLowerCase();

  const listingType = resolveListingTypeFromDocumentType(documentType);
  const showSummary = view === "summary" || status === "COMPLETED";

  useBreadcrumb([
    {
      title: t("nav.dashboards.provider-masters", {
        defaultValue: "Provider Management",
      }),
    },
    {
      title: t("providerMaster.dashboard.pageTitle"),
      path: PROVIDER_DASHBOARD_PATH,
    },
    ...(inwardNo ? [{ title: inwardNo }] : []),
  ]);

  const rowHint = useMemo(() => navState?.row as ProviderInwardRow | undefined, [
    navState?.row,
  ]);

  if (!inwardNo) {
    return (
      <Page title="Inward">
        <PageContent>
          <p className="text-sm text-gray-600">Inward number is missing.</p>
        </PageContent>
      </Page>
    );
  }

  return (
    <Page
      title={
        showSummary
          ? t("summary.title", { defaultValue: "Summary" })
          : t("providerMaster.excludedProvider.inward.providerDetailsTab", {
              defaultValue: "Provider Details",
            })
      }
    >
      <PageContent
        noPadding
        className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
      >
        {showSummary ? (
          <ProviderExclusionSummary
            inwardNo={inwardNo}
            documentType={listingType}
          />
        ) : (
          <ProviderExclusionDetailsForm
            inwardNo={inwardNo}
            documentType={listingType}
            sourceEntity={sourceEntity || rowHint?.sourceEntity || ""}
            sourceEntityId={rowHint?.sourceEntityId || ""}
            sourceEntityType={rowHint?.sourceEntityType || ""}
            s3BucketName={rowHint?.s3BucketName || ""}
            s3SubBucketName={rowHint?.s3SubBucketName || ""}
            status={status || rowHint?.statusLabel || ""}
          />
        )}
      </PageContent>
    </Page>
  );
}
