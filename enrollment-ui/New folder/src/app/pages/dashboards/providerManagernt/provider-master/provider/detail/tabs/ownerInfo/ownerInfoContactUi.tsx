import type { ComponentType, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  PhoneIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { translateContactPersonRole } from "../../../../../shared/providerMasterI18n";
import type { ProviderContactPersonDetail } from "../../../hospitalData";
import {
  contactMultiValueInputValue,
  splitMultiValueContactParts,
} from "../../schemas";
import { ContactPersonEditSection } from "./ContactPersonEditSection";
import type { ContactRowFieldErrors } from "./hooks/useOwnerTabHandlers";
import type { ContactGroup } from "./hooks/ownerContactGroups";
import {
  contactInitials,
  contactRowKey,
  resolveContactRoleTheme,
} from "./ownerInfoContactUi.helpers";

function groupContactNameList(group: ContactGroup): string[] {
  return group.items
    .map(({ person }) => person.providerContactPersonFullName?.trim())
    .filter((name): name is string => Boolean(name));
}

function CompactContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-2 py-0.5">
      <div className="flex min-w-0 shrink-0 items-center gap-1 text-slate-500">
        <Icon className="h-3 w-3 opacity-85" aria-hidden />
        <span className="text-[10px] font-medium leading-none text-slate-600">{label}</span>
      </div>
      <div className="min-w-0 max-w-[65%] flex-1 text-right text-[10px] leading-snug text-slate-900 sm:max-w-[70%] sm:text-[11px]">
        {children}
      </div>
    </div>
  );
}

function PhoneValueChips({ parts }: Readonly<{ parts: string[] }>) {
  if (parts.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex flex-wrap justify-end gap-0.5">
      {parts.map((num, i) => (
        <span
          key={`${i}-${num}`}
          className="inline-flex max-w-full rounded-md bg-slate-100 px-1 py-px font-mono text-[10px] text-slate-800 ring-1 ring-slate-200/90"
        >
          <span className="truncate">{num}</span>
        </span>
      ))}
    </div>
  );
}

type ContactPersonFieldsSectionProps = {
  person: ProviderContactPersonDetail;
  index: number;
  isEditingSection: boolean;
  rowErrors: ContactRowFieldErrors | undefined;
  contactLabels: ReturnType<typeof import("./hooks/useOwnerTabHandlers").useOwnerTabHandlers>["contactLabels"];
  canDelete: boolean;
  isDeleting: boolean;
  deleteLabel: string;
  deletingLabel: string;
  onDelete: () => void;
  updateContactAt: ReturnType<typeof import("./hooks/useOwnerTabHandlers").useOwnerTabHandlers>["updateContactAt"];
};

export function ContactPersonFieldsSection({
  person: p,
  index,
  isEditingSection,
  rowErrors,
  contactLabels,
  canDelete,
  isDeleting,
  deleteLabel,
  deletingLabel,
  onDelete,
  updateContactAt,
}: Readonly<ContactPersonFieldsSectionProps>) {
  const mobileParts = splitMultiValueContactParts(p.providerContactPersonMobileNo);
  const phoneParts = splitMultiValueContactParts(p.providerContactPersonTelephoneNo);
  const emailParts = splitMultiValueContactParts(p.providerContactPersonEmailId);

  if (isEditingSection) {
    return (
      <ContactPersonEditSection
        person={p}
        index={index}
        rowErrors={rowErrors}
        contactLabels={contactLabels}
        canDelete={canDelete}
        isDeleting={isDeleting}
        deleteLabel={deleteLabel}
        deletingLabel={deletingLabel}
        onDelete={onDelete}
        updateContactAt={updateContactAt}
        contactMultiValueInputValue={contactMultiValueInputValue}
      />
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-semibold text-primary-700 ring-1 ring-primary-100"
          aria-hidden
        >
          {contactInitials(p.providerContactPersonFullName)}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5">
          <h4 className="min-w-0 truncate text-xs font-semibold leading-tight text-slate-900">
            {p.providerContactPersonFullName?.trim() || "—"}
          </h4>
          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={isDeleting ? deletingLabel : deleteLabel}
              title={isDeleting ? deletingLabel : deleteLabel}
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-1.5 flex flex-1 flex-col gap-1">
        <CompactContactRow icon={DevicePhoneMobileIcon} label={contactLabels.mobile}>
          <PhoneValueChips parts={mobileParts} />
        </CompactContactRow>
        <CompactContactRow icon={PhoneIcon} label={contactLabels.telephone}>
          <PhoneValueChips parts={phoneParts} />
        </CompactContactRow>
        <CompactContactRow icon={EnvelopeIcon} label={contactLabels.email}>
          {emailParts.length === 0 ? (
            <span className="text-slate-400">—</span>
          ) : (
            <div className="flex flex-col gap-0.5">
              {emailParts.map((em, i) => (
                <a
                  key={`${i}-${em}`}
                  href={`mailto:${em}`}
                  className="break-all text-[10px] text-primary-700 underline-offset-2 hover:text-primary-800 hover:underline sm:text-[11px] dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {em}
                </a>
              ))}
            </div>
          )}
        </CompactContactRow>
      </div>
    </div>
  );
}

type ContactPersonGroupSectionProps = {
  group: ContactGroup;
  groupIndex: number;
  groupIsEditing: boolean;
  isGroupExpanded: boolean;
  contactLabels: ContactPersonFieldsSectionProps["contactLabels"];
  canWrite: boolean;
  contactPersonOwnerNotFound: boolean;
  hasContactPersonApiList: boolean;
  editingGroupId: string | null;
  contactValidationErrors: Record<number, ContactRowFieldErrors>;
  onDeleteContactPerson?: (contactPersonId: string, roleId?: string) => Promise<boolean> | boolean;
  deletingContactIds: Record<string, boolean>;
  toggleGroupExpanded: (groupId: string) => void;
  addContactPersonForRole: (role: string) => void;
  handleGroupCancel: (groupId: string) => void;
  handleGroupSave: (groupId: string) => void;
  startGroupEdit: (groupId: string) => void;
  handleDeleteContact: (index: number, person: ProviderContactPersonDetail) => void;
  updateContactAt: ContactPersonFieldsSectionProps["updateContactAt"];
};

type ContactPersonGroupHeaderProps = {
  group: ContactGroup;
  groupIsEditing: boolean;
  isGroupExpanded: boolean;
  displayRole: string;
  theme: ReturnType<typeof resolveContactRoleTheme>;
  contactNameList: string[];
  contactNamesPreview: string;
  sectionEditActions: React.ReactNode;
  viewModeEditButton: React.ReactNode;
  toggleGroupExpanded: (groupId: string) => void;
};

function ContactPersonGroupHeader({
  group,
  groupIsEditing,
  isGroupExpanded,
  displayRole,
  theme,
  contactNameList,
  contactNamesPreview,
  sectionEditActions,
  viewModeEditButton,
  toggleGroupExpanded,
}: Readonly<ContactPersonGroupHeaderProps>) {
  if (groupIsEditing) {
    return (
      <div
        className={clsx(
          "flex min-h-9 items-center gap-2 px-2.5 py-1.5",
          theme.headerExpanded,
        )}
      >
        <span
          className={clsx(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
            theme.iconBg,
            theme.iconText,
          )}
        >
          <UserCircleIcon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="min-w-0 truncate text-xs font-semibold text-slate-900">{displayRole}</h3>
        <span
          className={clsx(
            "inline-flex shrink-0 items-center rounded px-1.5 py-px text-[10px] font-bold tabular-nums ring-1 ring-inset",
            theme.badge,
          )}
        >
          {group.items.length}
        </span>
        {sectionEditActions}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center gap-1.5 px-2.5 py-1.5",
        isGroupExpanded ? theme.headerExpanded : "bg-white",
      )}
    >
      <button
        type="button"
        onClick={() => toggleGroupExpanded(group.groupId)}
        aria-expanded={isGroupExpanded}
        className={clsx(
          "group flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left transition-colors",
          !isGroupExpanded && "hover:bg-slate-50/80",
        )}
      >
        <span
          className={clsx(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
            theme.iconBg,
            theme.iconText,
          )}
        >
          <UserCircleIcon className="h-4 w-4" aria-hidden />
        </span>
        <h3
          className="max-w-[38%] shrink-0 truncate text-xs font-semibold text-slate-900 sm:max-w-[42%]"
          title={displayRole}
        >
          {displayRole}
        </h3>
        <span
          className={clsx(
            "inline-flex shrink-0 items-center rounded px-1.5 py-px text-[10px] font-bold tabular-nums ring-1 ring-inset",
            theme.badge,
          )}
        >
          {group.items.length}
        </span>
        {!isGroupExpanded ? (
          <span
            className={clsx(
              "min-w-0 flex-1 truncate text-right text-[11px]",
              contactNameList.length > 0 ? "font-medium text-slate-600" : "text-slate-400",
            )}
            title={contactNamesPreview}
          >
            {contactNamesPreview}
          </span>
        ) : (
          <span className="min-w-0 flex-1" aria-hidden />
        )}
        <span
          className={clsx(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded border transition",
            theme.chevronBox,
          )}
          aria-hidden
        >
          {isGroupExpanded ? (
            <ChevronDownIcon className="h-3.5 w-3.5" />
          ) : (
            <ChevronRightIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
      {viewModeEditButton}
    </div>
  );
}

function ContactPersonGroupSection({
  group,
  groupIndex,
  groupIsEditing,
  isGroupExpanded,
  contactLabels,
  canWrite,
  contactPersonOwnerNotFound,
  hasContactPersonApiList,
  editingGroupId,
  contactValidationErrors,
  onDeleteContactPerson,
  deletingContactIds,
  toggleGroupExpanded,
  addContactPersonForRole,
  handleGroupCancel,
  handleGroupSave,
  startGroupEdit,
  handleDeleteContact,
  updateContactAt,
}: Readonly<ContactPersonGroupSectionProps>) {
  const { t } = useTranslation();
  const contactNameList = groupContactNameList(group);
  const theme = resolveContactRoleTheme(group, groupIndex);
  const contactNamesPreview =
    contactNameList.length > 0 ? contactNameList.join(", ") : contactLabels.noNameOnFile;
  const displayRole = translateContactPersonRole(t, group.displayRole);
  const showSectionEdit =
    canWrite &&
    !contactPersonOwnerNotFound &&
    hasContactPersonApiList &&
    group.items.length > 0 &&
    editingGroupId === null;

  const sectionEditActions = groupIsEditing ? (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => addContactPersonForRole(group.displayRole)}
        className="inline-flex h-6 shrink-0 cursor-pointer items-center rounded border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
      >
        + Add
      </button>
      <button
        type="button"
        onClick={() => handleGroupCancel(group.groupId)}
        className="inline-flex h-6 shrink-0 cursor-pointer items-center rounded border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
      >
        {t("providerMaster.button.cancel")}
      </button>
      <button
        type="button"
        onClick={() => handleGroupSave(group.groupId)}
        className="inline-flex h-6 shrink-0 cursor-pointer items-center rounded border border-blue-600 bg-blue-600 px-2 text-[10px] font-semibold text-white hover:bg-blue-700"
      >
        {t("providerMaster.button.save")}
      </button>
    </div>
  ) : null;

  const viewModeEditButton = showSectionEdit ? (
    <button
      type="button"
      onClick={() => startGroupEdit(group.groupId)}
      className="inline-flex h-6 shrink-0 cursor-pointer items-center gap-0.5 rounded border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
    >
      <PencilSquareIcon className="h-3 w-3" aria-hidden />
      {t("providerMaster.common.edit")}
    </button>
  ) : null;

  return (
    <section
      className={clsx(
        "overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm ring-1 transition-shadow",
        theme.cardRing,
        isGroupExpanded && "shadow-md",
      )}
    >
      <div className={clsx("border-l-[3px]", theme.accentBorder)}>
        <ContactPersonGroupHeader
          group={group}
          groupIsEditing={groupIsEditing}
          isGroupExpanded={isGroupExpanded}
          displayRole={displayRole}
          theme={theme}
          contactNameList={contactNameList}
          contactNamesPreview={contactNamesPreview}
          sectionEditActions={sectionEditActions}
          viewModeEditButton={viewModeEditButton}
          toggleGroupExpanded={toggleGroupExpanded}
        />

        {isGroupExpanded ? (
          <div className="grid grid-cols-1 gap-2 border-t border-slate-100 bg-slate-50/40 p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.map(({ person, index }) => {
              const contactPersonId = person.providerContactPersonId?.trim();
              const isDeleting = !!(contactPersonId && deletingContactIds[contactPersonId]);
              const canDelete =
                canWrite && (contactPersonId ? Boolean(onDeleteContactPerson) : groupIsEditing);
              const rowErrors = contactValidationErrors[index];

              return (
                <article
                  key={contactRowKey(person, index)}
                  className="flex min-h-0 min-w-0 flex-col rounded-md border border-slate-200 border-l-[3px] border-l-primary-500 bg-white p-2 shadow-sm"
                >
                  <ContactPersonFieldsSection
                    person={person}
                    index={index}
                    isEditingSection={groupIsEditing}
                    rowErrors={rowErrors}
                    contactLabels={contactLabels}
                    canDelete={canDelete}
                    isDeleting={isDeleting}
                    deleteLabel={t("providerMaster.detailTabs.owner.deleteContact")}
                    deletingLabel={t("providerMaster.detailTabs.owner.deletingContact")}
                    onDelete={() => handleDeleteContact(index, person)}
                    updateContactAt={updateContactAt}
                  />
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export type ContactPersonGroupsListProps = Omit<
  ContactPersonGroupSectionProps,
  "group" | "groupIndex" | "groupIsEditing" | "isGroupExpanded"
> & {
  contactGroups: ContactGroup[];
  expandedGroupKeys: Set<string>;
  isGroupEditing: (groupId: string) => boolean;
};

export function ContactPersonGroupsList({
  contactGroups,
  expandedGroupKeys,
  isGroupEditing,
  ...groupProps
}: Readonly<ContactPersonGroupsListProps>) {
  return (
    <div className="space-y-1.5 pb-0.5">
      {contactGroups.map((group, groupIndex) => {
        const groupIsEditing = isGroupEditing(group.groupId);
        const isGroupExpanded = groupIsEditing || expandedGroupKeys.has(group.groupId);
        return (
          <ContactPersonGroupSection
            key={group.groupId}
            group={group}
            groupIndex={groupIndex}
            groupIsEditing={groupIsEditing}
            isGroupExpanded={isGroupExpanded}
            {...groupProps}
          />
        );
      })}
    </div>
  );
}
