import { useState, type ReactNode } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { PROVIDER_ACTION_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { ProviderTabEmptyState } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/shared/ProviderTabEmptyState";
import { StatusEditVerifyBar } from "../../shared/StatusEditVerifyBar";
import type { HospitalDetailRecord } from "../../../hospitalData";
import { ProviderSectionSeeMoreToggle } from "../providerDetails/Cards";
import { ProviderTabLoadingState } from "../../shared/ProviderTabLoadingState";
import { ProviderOwnerFormPage } from "./ProviderOwnerFormPage";
import { ProviderOwnerViewCard } from "./ProviderOwnerViewCard";
import { useProviderOwnerFormPage, useProviderOwnerTab } from "./useProviderOwnerPage";

type ProviderOwnerTabProps = {
  providerId?: string;
  hospital: HospitalDetailRecord | null;
  canWrite?: boolean;
  canVerify?: boolean;
  providerBarSection: ReactNode;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  ownerUrlKey?: string;
  ownerUrlSuffix?: "edit";
};

const VISIBLE_OWNER_COUNT = 2;

export function ProviderOwnerTab({
  providerId,
  hospital,
  canWrite = false,
  canVerify = false,
  providerBarSection,
  verifyDisabled = false,
  verifyDisabledTitle,
  ownerUrlKey,
  ownerUrlSuffix,
}: Readonly<ProviderOwnerTabProps>) {
  const { t } = useTranslation();
  const isCreateRoute = ownerUrlKey === "new";
  const isEditRoute = Boolean(ownerUrlKey && ownerUrlSuffix === "edit" && ownerUrlKey !== "new");
  const isOwnerFormRoute = isCreateRoute || isEditRoute;

  const ownerTab = useProviderOwnerTab(isOwnerFormRoute ? undefined : providerId);
  const [showAllOwners, setShowAllOwners] = useState(false);

  const ownerFormPage = useProviderOwnerFormPage({
    providerId,
    ownerId: isEditRoute ? ownerUrlKey : undefined,
    isEditMode: isEditRoute,
  });

  const providerStatus = hospital?.status ?? "";
  const blacklistedByIcs = hospital?.blacklistedByIcNames?.length
    ? hospital.blacklistedByIcNames
    : ["No IC information available"];

  const owners = ownerTab.owners;
  const hasMoreOwners = owners.length > VISIBLE_OWNER_COUNT;
  const visibleOwners = showAllOwners ? owners : owners.slice(0, VISIBLE_OWNER_COUNT);

  if (isOwnerFormRoute) {
    return (
      <ProviderOwnerFormPage
        providerBarSection={providerBarSection}
        providerId={providerId ?? hospital?.id}
        providerStatus={providerStatus}
        blacklistedByIcs={blacklistedByIcs}
        canVerify={canVerify}
        verifyDisabled={verifyDisabled}
        verifyDisabledTitle={verifyDisabledTitle}
        loading={ownerFormPage.loading}
        saving={ownerFormPage.saving}
        defaultFormValues={ownerFormPage.defaultFormValues}
        onCancel={ownerFormPage.handleCancel}
        onSubmit={(values) => {
          ownerFormPage.handleSaveOwner(values).catch(() => {});
        }}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden bg-gray-50 p-1">
      <div className="shrink-0">{providerBarSection}</div>

      <div className="shrink-0">
        <StatusEditVerifyBar
          providerStatus={providerStatus}
          blacklistedByIcs={blacklistedByIcs}
          canWrite={canWrite}
          canVerify={canVerify}
          isEditMode={false}
          onEdit={() => undefined}
          onCancel={() => undefined}
          onSave={() => undefined}
          hideEdit
          verifyDisabled={verifyDisabled}
          verifyDisabledTitle={verifyDisabledTitle}
          auditLog={{
            providerId: providerId ?? hospital?.id,
            tabId: "provider-owner",
          }}
          extraActions={
            canWrite ? (
              <Button
                type="button"
                color="primary"
                variant="filled"
                className={`${PROVIDER_ACTION_BUTTON_CLASS} cursor-pointer`}
                onClick={ownerTab.openCreateForm}
              >
                {t("providerMaster.detailTabs.owner.addOwner")}
              </Button>
            ) : null
          }
        />
      </div>

      <div
        className={`min-h-0 flex-1 overflow-x-hidden ${
          showAllOwners ? "overflow-y-auto" : "overflow-y-hidden"
        }`}
      >
        {(() => {
          if (ownerTab.loading) return <ProviderTabLoadingState />;
          if (ownerTab.owners.length === 0) {
            return (
              <div className="flex h-full min-h-0 flex-col">
                <ProviderTabEmptyState
                  icon={UserGroupIcon}
                  title={t("providerMaster.detailTabs.owner.noOwnerInfo")}
                  description=""
                />
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 gap-1 pb-1">
              {visibleOwners.map((owner) => (
                <ProviderOwnerViewCard
                  key={owner.providerOwnerId || owner.providerOwnerName}
                  owner={owner}
                  canWrite={canWrite}
                  onEdit={() => ownerTab.openEditForm(owner)}
                />
              ))}
              {hasMoreOwners ? (
                <div className="flex justify-center py-1">
                  <ProviderSectionSeeMoreToggle
                    expanded={showAllOwners}
                    onToggle={() => setShowAllOwners((open) => !open)}
                  />
                </div>
              ) : null}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
