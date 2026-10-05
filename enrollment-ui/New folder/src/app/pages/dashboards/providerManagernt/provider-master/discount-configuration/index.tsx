import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { Page, PageContent } from "../../shared/providerShell";

export default function DiscountConfigurationPage() {
  const { t } = useTranslation();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const pageTitle = t("nav.dashboards.provider-masters-discount-configuration");

  useEffect(() => {
    setBreadcrumbs([
      { title: t("providerMaster.moduleName") },
      { title: t("providerMaster.providerMasterLabel") },
      { title: pageTitle },
    ]);
    return () => setBreadcrumbs([]);
  }, [pageTitle, setBreadcrumbs, t]);

  return (
    <Page title={pageTitle}>
      <PageContent className="flex min-h-0 flex-1 flex-col p-1" />
    </Page>
  );
}
