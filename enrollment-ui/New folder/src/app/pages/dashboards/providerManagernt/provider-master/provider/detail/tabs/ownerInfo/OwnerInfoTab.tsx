import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusEditVerifyBar } from "../../shared/StatusEditVerifyBar";
import { PROVIDER_ACTION_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import type { HospitalDetailRecord } from "../../../hospitalData";
import { ConfigFormDialog } from "@/components/shared/dialog/commonDialog";
import { useOwnerTabHandlers } from "./hooks/useOwnerTabHandlers";
import { renderContactPersonTabContent } from "./renderContactPersonTabContent";
import { ContactPersonGroupsList } from "./ownerInfoContactUi";

interface OwnerInfoTabProps {
  hospital: HospitalDetailRecord | null;
  providerId?: string;
  canWrite?: boolean;
  canVerify?: boolean;
  providerBarSection: React.ReactNode;
  isLoadingApiData?: boolean;
  contactPersonOwnerNotFound?: boolean;
  contactPersonNotFoundMessage?: string | null;
  onSaveContactPersons?: (rows: ProviderContactPersonDetail[]) => Promise<boolean> | boolean;
  onRefreshContactPersons?: () => Promise<boolean> | boolean;
  onDeleteContactPerson?: (contactPersonId: string, roleId?: string) => Promise<boolean> | boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
}

export function OwnerInfoTab({
  hospital,
  providerId,
  canWrite = false,
  canVerify = false,
  providerBarSection,
  isLoadingApiData = false,
  contactPersonOwnerNotFound = false,
  contactPersonNotFoundMessage = null,
  onSaveContactPersons,
  onRefreshContactPersons,
  onDeleteContactPerson,
  verifyDisabled = false,
  verifyDisabledTitle,
}: Readonly<OwnerInfoTabProps>) {
  const { t, i18n } = useTranslation();
  const {
    editingGroupId,
    hasContactPersonApiList,
    contactPersonRows,
    contactValidationErrors,
    addModalOpen,
    setAddModalOpen,
    deletingContactIds,
    addContactDialogForm,
    addContactDialogFields,
    addContactDialogFormForDialog,
    canSubmitAddContact,
    contactLabels,
    isGroupEditing,
    contactGroups,
    startGroupEdit,
    handleGroupCancel,
    handleGroupSave,
    updateContactAt,
    addContactPersonForRole,
    handleDeleteContact,
    openAddContactModal,
    handleAddContactFromModal,
  } = useOwnerTabHandlers({
    hospital,
    providerId,
    canWrite,
    onSaveContactPersons,
    onRefreshContactPersons,
    onDeleteContactPerson,
  });

  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (editingGroupId) {
      setExpandedGroupKeys((prev) => new Set(prev).add(editingGroupId));
    }
  }, [editingGroupId]);

  const toggleGroupExpanded = (groupId: string) => {
    if (editingGroupId === groupId) return;
    setExpandedGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const providerStatus = hospital?.status ?? "";
  const blacklistedByIcs = hospital?.blacklistedByIcNames?.length
    ? hospital.blacklistedByIcNames
    : [t("providerMaster.detailTabs.owner.noIcInfo")];

  return (
    <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col gap-1 overflow-hidden bg-gray-50 p-1">
      <div className="shrink-0">{providerBarSection}</div>
      <div className="shrink-0">
      <StatusEditVerifyBar
        providerStatus={providerStatus}
        blacklistedByIcs={blacklistedByIcs}
        canWrite={canWrite}
        canVerify={canVerify}
        isEditMode={false}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
        hideEdit
        verifyDisabled={verifyDisabled}
        verifyDisabledTitle={verifyDisabledTitle}
        auditLog={{
          providerId: providerId ?? hospital?.id,
          tabId: "owners-info",
        }}
        extraActions={
          canWrite ? (
            <button
              type="button"
              onClick={openAddContactModal}
              className={`${PROVIDER_ACTION_BUTTON_CLASS} border border-slate-300 bg-blue-600 text-white hover:bg-blue-700`}
            >
              {contactLabels.addContactPerson}
            </button>
          ) : null
        }
      />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
      {renderContactPersonTabContent({
        contactPersonOwnerNotFound,
        notFoundTitle:
          contactPersonNotFoundMessage?.trim() || contactLabels.noContactDetails,
        hasContactPersonApiList,
        hasContactPersonRows: contactPersonRows.length > 0,
        isLoadingApiData,
        emptyOnFileTitle: contactLabels.noContactPersonsOnFile,
        contactGroupsContent: (
          <ContactPersonGroupsList
            contactGroups={contactGroups}
            expandedGroupKeys={expandedGroupKeys}
            editingGroupId={editingGroupId}
            contactValidationErrors={contactValidationErrors}
            contactLabels={contactLabels}
            canWrite={canWrite}
            contactPersonOwnerNotFound={contactPersonOwnerNotFound}
            hasContactPersonApiList={hasContactPersonApiList}
            onDeleteContactPerson={onDeleteContactPerson}
            deletingContactIds={deletingContactIds}
            isGroupEditing={isGroupEditing}
            toggleGroupExpanded={toggleGroupExpanded}
            addContactPersonForRole={addContactPersonForRole}
            handleGroupCancel={handleGroupCancel}
            handleGroupSave={handleGroupSave}
            startGroupEdit={startGroupEdit}
            handleDeleteContact={handleDeleteContact}
            updateContactAt={updateContactAt}
          />
        ),
      })}
      </div>

      <ConfigFormDialog
        key={`add-contact-person-${i18n.language}`}
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={contactLabels.addContactPerson}
        titleId="add-contact-person-dialog-title"
        fields={addContactDialogFields}
        form={addContactDialogFormForDialog}
        onSubmit={addContactDialogForm.handleSubmit(handleAddContactFromModal)}
        canSubmit={canSubmitAddContact}
        submitLabel={t("providerMaster.button.add")}
        cancelLabel={t("providerMaster.button.cancel")}
        maxColumns={2}
        widthClassName="w-full max-w-2xl"
        submitButtonClassName="!bg-blue-600 !text-white hover:!bg-blue-700 disabled:opacity-50"
      />
    </div>
  );
}
