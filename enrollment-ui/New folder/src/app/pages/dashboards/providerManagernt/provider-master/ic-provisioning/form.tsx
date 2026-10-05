import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { usePermission } from "@/app/auth/usePermission";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { Page, PageContent } from "../../shared/providerShell";
import { ConfigurationForm } from "./ConfigurationForm";
import { normalizeFormValues } from "./config";
import { getIcProvisionRowById, upsertIcProvisionRow } from "./storage";

export default function IcProvisioningFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const pageTitle = t("nav.dashboards.provider-masters-ic-provisioning");
  const isEdit = Boolean(id);
  const record = id ? getIcProvisionRowById(id) : undefined;
  const { canWrite } = usePermission("provider-ic-provisioning");

  const formTitle = isEdit
    ? t("providerMaster.icProvisioning.editConfigurationTitle")
    : t("providerMaster.icProvisioning.newConfigurationTitle");

  useEffect(() => {
    setBreadcrumbs([
      { title: t("providerMaster.moduleName") },
      { title: t("providerMaster.providerMasterLabel") },
      { title: pageTitle, path: "/provider-masters/ic-provisioning" },
      { title: formTitle },
    ]);
    return () => setBreadcrumbs([]);
  }, [formTitle, pageTitle, setBreadcrumbs, t]);

  useEffect(() => {
    if (isEdit && !record) {
      navigate("/provider-masters/ic-provisioning", { replace: true });
    }
  }, [isEdit, navigate, record]);

  const initialValues = useMemo(
    () => normalizeFormValues(record?.formValues),
    [record],
  );

  if (isEdit && !record) return null;

  return (
    <Page title={formTitle}>
      <PageContent className="flex min-h-0 flex-1 flex-col bg-gray-50/50 p-2 dark:bg-dark-900/20">
        <ConfigurationForm
          recordId={id}
          icCode={record?.icCode}
          canWrite={canWrite}
          initialValues={initialValues}
          onCancel={() => navigate("/provider-masters/ic-provisioning")}
          onSave={(row) => {
            upsertIcProvisionRow(row);
            toast.success(
              isEdit
                ? t("providerMaster.icProvisioning.updateSuccess")
                : t("providerMaster.icProvisioning.saveSuccess"),
            );
            navigate("/provider-masters/ic-provisioning");
          }}
        />
      </PageContent>
    </Page>
  );
}
