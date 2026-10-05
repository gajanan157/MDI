import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { Page, PageContent } from "../../shared/providerShell";
import { getExcludedProviderBreadcrumbs } from "../../shared/providerMasterI18n";
import ExcludedProvidersContent from "./ExcludedProvidersContent";
import { BulkExcludePageContent } from "./bulkExclude/BulkExcludePageContent";
import { isBulkExcludePathname } from "./bulkExclude/config";

export default function BlacklistedHospitalsPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const bulkExcludeRoute = isBulkExcludePathname(pathname);
  const [inwardListRefreshToken, setInwardListRefreshToken] = useState(0);

  useEffect(() => {
    if (bulkExcludeRoute) {
      return () => setBreadcrumbs([]);
    }
    setBreadcrumbs([...getExcludedProviderBreadcrumbs(t)]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs, t, bulkExcludeRoute]);

  const pageTitle = bulkExcludeRoute
    ? t("nav.dashboards.provider-masters-excluded-hospitals-bulk-exclude", {
        defaultValue: "Bulk Exclude",
      })
    : t("nav.dashboards.provider-masters-excluded-hospitals");

  return (
    <Page title={pageTitle}>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        {!bulkExcludeRoute ? (
          <ExcludedProvidersContent
            onBulkExclude={() => navigate("/provider-masters/excluded-hospitals/bulk-exclude")}
          />
        ) : (
          <BulkExcludePageContent
            refreshToken={inwardListRefreshToken}
            onUploadSuccess={() => setInwardListRefreshToken((token) => token + 1)}
          />
        )}
      </div>
    </Page>
  );
}
