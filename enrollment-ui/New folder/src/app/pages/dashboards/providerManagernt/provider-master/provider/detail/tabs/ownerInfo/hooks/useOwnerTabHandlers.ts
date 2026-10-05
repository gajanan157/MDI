import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchProviderContactPersonRoles } from "@/store/features/providerClinicalSpecialties/providerClinicalSpecialtiesSlice";
import { postProviderContactPersons } from "@/store/features/provider/providerAPI";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import type { FieldConfig } from "@/components/shared/dialog/commonDialog";
import {
  getContactPersonDesignationValidationError,
  getContactPersonNameValidationError,
} from "@/utils/contactPersonNameInput";
import {
  getContactEmailCharValidationError,
  getContactPhoneCharValidationError,
} from "@/utils/contactFieldInput";
import {
  addContactPersonSchema,
  type AddContactPersonFormValues,
} from "../../../schemas";
import { syncAddContactPersonFieldErrors } from "../../../schemas/addContactPersonFieldSync";
import type { HospitalDetailRecord, ProviderContactPersonDetail } from "../../../../hospitalData";
import {
  getEmailPartsValidationMessage,
  getMobilePartsValidationMessage,
  getTelephonePartsValidationMessage,
  splitMultiValueContactParts,
} from "../../../schemas";
import { groupContactsByRole, sortContactGroupsKeyContactFirst, contactGroupIdForRow } from "./ownerContactGroups";
import {
  createContactPersonFieldLabels,
  translateContactPersonRole,
} from "../../../../../../shared/providerMasterI18n";

export type ContactRowFieldErrors = {
  name?: string;
  designation?: string;
  mobile?: string;
  telephone?: string;
  email?: string;
};

function resolveContactPersonNameError(name: string): string | undefined {
  if (!name) return "Please enter name";
  return getContactPersonNameValidationError(name);
}

function filterContactValidationErrorsForGroup(
  prev: Record<number, ContactRowFieldErrors>,
  editedContactList: ProviderContactPersonDetail[],
  groupId: string,
): Record<number, ContactRowFieldErrors> {
  const next: Record<number, ContactRowFieldErrors> = {};
  Object.entries(prev).forEach(([k, v]) => {
    const index = Number(k);
    const row = editedContactList[index];
    if (row && contactGroupIdForRow(row) === groupId) return;
    next[index] = v;
  });
  return next;
}

function resetEditedContactListFromServer(
  prev: ProviderContactPersonDetail[],
  groupId: string,
  serverRows: ProviderContactPersonDetail[],
): ProviderContactPersonDetail[] {
  const kept = prev.filter((row) => {
    if (contactGroupIdForRow(row) !== groupId) return true;
    return Boolean(row.providerContactPersonId?.trim());
  });
  return kept.map((row) => {
    if (contactGroupIdForRow(row) !== groupId) return row;
    const id = row.providerContactPersonId?.trim();
    if (!id) return row;
    const server = serverRows.find((r) => r.providerContactPersonId === id);
    return server ? { ...server } : row;
  });
}

type UseOwnerTabHandlersInput = {
  hospital: HospitalDetailRecord | null;
  providerId?: string;
  canWrite: boolean;
  onSaveContactPersons?: (rows: ProviderContactPersonDetail[]) => Promise<boolean> | boolean;
  onRefreshContactPersons?: () => Promise<boolean> | boolean;
  onDeleteContactPerson?: (contactPersonId: string, roleId?: string) => Promise<boolean> | boolean;
};

export function useOwnerTabHandlers({
  hospital,
  providerId,
  canWrite,
  onSaveContactPersons,
  onRefreshContactPersons,
  onDeleteContactPerson,
}: UseOwnerTabHandlersInput) {
  const { t } = useTranslation();
  const contactLabels = useMemo(
    () => createContactPersonFieldLabels(t),
    [t],
  );
  const dispatch = useAppDispatch();
  const { contactPersonRoleList } = useAppSelector((state) => state.providerClinicalSpecialties);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const contactPersonList = hospital?.providerContactPersons;
  const hasContactPersonApiList = contactPersonList !== undefined;
  const contactPersonRows = useMemo(
    () => contactPersonList ?? [],
    [contactPersonList],
  );

  const listFingerprint = useMemo(
    () => contactPersonRows.map((p, i) => p.providerContactPersonId ?? `${i}`).join("|"),
    [contactPersonRows],
  );

  const [editedContactList, setEditedContactList] = useState<ProviderContactPersonDetail[]>([]);
  const [contactValidationErrors, setContactValidationErrors] = useState<
    Record<number, ContactRowFieldErrors>
  >({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [contactNameInputError, setContactNameInputError] = useState("");
  const [contactDesignationInputError, setContactDesignationInputError] = useState("");
  const [contactMobileInputError, setContactMobileInputError] = useState("");
  const [contactTelephoneInputError, setContactTelephoneInputError] = useState("");
  const [contactEmailInputError, setContactEmailInputError] = useState("");
  const [deletingContactIds, setDeletingContactIds] = useState<Record<string, boolean>>({});

  const clearContactInputErrors = useCallback(() => {
    setContactNameInputError("");
    setContactDesignationInputError("");
    setContactMobileInputError("");
    setContactTelephoneInputError("");
    setContactEmailInputError("");
  }, []);

  const addContactDialogForm = useForm<AddContactPersonFormValues>({
    resolver: yupResolver(addContactPersonSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      providerContactPersonRole: "",
      providerContactPersonRoleId: "",
      providerContactPersonFullName: "",
      providerContactPersonDesignation: "",
      providerContactPersonMobileNo: "",
      providerContactPersonTelephoneNo: "",
      providerContactPersonEmailId: "",
    },
  });

  useEffect(() => {
    if (!addModalOpen) clearContactInputErrors();
  }, [addModalOpen, clearContactInputErrors]);

  useEffect(() => {
    if ((contactPersonRoleList?.length ?? 0) > 0) return;
    dispatch(fetchProviderContactPersonRoles(true));
  }, [dispatch, contactPersonRoleList]);

  useEffect(() => {
    if (!hasContactPersonApiList) {
      setEditedContactList([]);
      return;
    }
    setEditedContactList(contactPersonRows.map((p) => ({ ...p })));
    setEditingGroupId(null);
  }, [hasContactPersonApiList, listFingerprint, contactPersonRows]);

  const clearRowFieldError = useCallback((index: number, key: keyof ContactRowFieldErrors) => {
    setContactValidationErrors((prev) => {
      const row = prev[index];
      if (!row) return prev;
      const nextRow = { ...row, [key]: undefined };
      if (
        !nextRow.name &&
        !nextRow.designation &&
        !nextRow.mobile &&
        !nextRow.telephone &&
        !nextRow.email
      ) {
        const rest = { ...prev };
        delete rest[index];
        return rest;
      }
      return { ...prev, [index]: nextRow };
    });
  }, []);

  const setRowFieldError = useCallback(
    (index: number, key: keyof ContactRowFieldErrors, message: string) => {
      setContactValidationErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], [key]: message },
      }));
    },
    [],
  );


  const resetGroupFromServer = useCallback(
    (groupId: string) => {
      const serverRows = contactPersonRows;
      setEditedContactList((prev) =>
        resetEditedContactListFromServer(prev, groupId, serverRows),
      );
      setContactValidationErrors((prev) =>
        filterContactValidationErrorsForGroup(prev, editedContactList, groupId),
      );
      setEditingGroupId(null);
    },
    [contactPersonRows, editedContactList],
  );

  const handleGroupCancel = useCallback(
    (groupId: string) => {
      if (!hasContactPersonApiList) return;
      resetGroupFromServer(groupId);
    },
    [hasContactPersonApiList, resetGroupFromServer],
  );

  const validateContactRows = useCallback(
    (rows: { row: ProviderContactPersonDetail; index: number }[]) => {
      const nextErrors: Record<number, ContactRowFieldErrors> = {};
      rows.forEach(({ row, index }) => {
        const name = (row.providerContactPersonFullName ?? "").trim();
        const designation = (row.providerContactPersonDesignation ?? "").trim();
        const mParts = splitMultiValueContactParts(row.providerContactPersonMobileNo);
        const tParts = splitMultiValueContactParts(row.providerContactPersonTelephoneNo);
        const eParts = splitMultiValueContactParts(row.providerContactPersonEmailId);
        const mobileInput = mParts.join(", ");
        const telephoneInput = tParts.join(", ");
        const emailInput = eParts.join(", ");
        const nameErr = resolveContactPersonNameError(name);
        const designationErr = getContactPersonDesignationValidationError(designation);
        const mCharErr = getContactPhoneCharValidationError(mobileInput);
        const mErr =
          mCharErr ??
          (mParts.length === 0 ? "Please enter mobile no" : getMobilePartsValidationMessage(mParts));
        const tCharErr = getContactPhoneCharValidationError(telephoneInput);
        const tErr =
          tCharErr ?? getTelephonePartsValidationMessage(tParts);
        const eCharErr = getContactEmailCharValidationError(emailInput);
        const eErr =
          eCharErr ??
          (eParts.length === 0 ? "Please enter email" : getEmailPartsValidationMessage(eParts));
        if (nameErr || designationErr || mErr || tErr || eErr) {
          nextErrors[index] = {
            name: nameErr,
            designation: designationErr,
            mobile: mErr,
            telephone: tErr,
            email: eErr,
          };
        }
      });
      return nextErrors;
    },
    [],
  );

  const handleContactListSave = useCallback(async () => {
    if (onSaveContactPersons) {
      const ok = await onSaveContactPersons(editedContactList);
      if (!ok) return false;
    }
    setContactValidationErrors({});
    setEditingGroupId(null);
    return true;
  }, [onSaveContactPersons, editedContactList]);

  const handleGroupSave = useCallback(
    async (groupId: string) => {
      if (!hasContactPersonApiList) return;

      const groupRows = editedContactList
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => contactGroupIdForRow(row) === groupId);

      const nextErrors = validateContactRows(groupRows);
      if (Object.keys(nextErrors).length > 0) {
        setContactValidationErrors((prev) => {
          const cleared = { ...prev };
          groupRows.forEach(({ index }) => {
            delete cleared[index];
          });
          return { ...cleared, ...nextErrors };
        });
        return;
      }

      await handleContactListSave();
    },
    [editedContactList, handleContactListSave, hasContactPersonApiList, validateContactRows],
  );

  const startGroupEdit = useCallback((groupId: string) => {
    setEditingGroupId(groupId);
    setContactValidationErrors({});
    setEditedContactList((prev) =>
      prev.map((row) => {
        if (contactGroupIdForRow(row) !== groupId) return row;
        const fullName = row.providerContactPersonFullName ?? "";
        const designation = row.providerContactPersonDesignation ?? "";
        const mobile = splitMultiValueContactParts(row.providerContactPersonMobileNo).join(", ");
        const telephone = splitMultiValueContactParts(row.providerContactPersonTelephoneNo).join(", ");
        const email = splitMultiValueContactParts(row.providerContactPersonEmailId).join(", ");
        return {
          ...row,
          providerContactPersonFullName: fullName.trim() ? fullName : undefined,
          providerContactPersonDesignation: designation.trim() ? designation : undefined,
          providerContactPersonMobileNo: mobile.trim() ? mobile : undefined,
          providerContactPersonTelephoneNo: telephone.trim() ? telephone : undefined,
          providerContactPersonEmailId: email.trim() ? email : undefined,
        };
      }),
    );
  }, []);

  const updateContactAt = useCallback(
    (index: number, patch: Partial<ProviderContactPersonDetail>) => {
      setEditedContactList((prev) =>
        prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  const addContactPersonForRole = useCallback(
    (role: string) => {
      const matched = editedContactList.find(
        (row) => (row.providerContactPersonRole?.trim() ?? "") === role,
      );
      setEditedContactList((prev) => [
        ...prev,
        {
          providerContactPersonRoleId: matched?.providerContactPersonRoleId,
          providerContactPersonRole: role || "Contact person",
          providerContactPersonFullName: "",
          providerContactPersonDesignation: "",
          providerContactPersonMobileNo: "",
          providerContactPersonTelephoneNo: "",
          providerContactPersonEmailId: "",
          recordStatus: "Active",
        },
      ]);
      setEditingGroupId(role.toLowerCase() || "__default__");
    },
    [editedContactList],
  );

  const removeUnsavedContactAt = useCallback((index: number) => {
    setEditedContactList((prev) => prev.filter((_, i) => i !== index));
    setContactValidationErrors((prev) => {
      const next: Record<number, ContactRowFieldErrors> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const n = Number(k);
        if (n < index) next[n] = v;
        else if (n > index) next[n - 1] = v;
      });
      return next;
    });
  }, []);

  const handleDeleteContact = useCallback(
    async (index: number, person: ProviderContactPersonDetail) => {
      const contactPersonId = person.providerContactPersonId?.trim();
      if (!contactPersonId) {
        removeUnsavedContactAt(index);
        return;
      }
      if (!onDeleteContactPerson) return;
      setDeletingContactIds((prev) => ({ ...prev, [contactPersonId]: true }));
      const ok = await onDeleteContactPerson(
        contactPersonId,
        person.providerContactPersonRoleId?.trim(),
      );
      setDeletingContactIds((prev) => {
        const next = { ...prev };
        delete next[contactPersonId];
        return next;
      });
      if (!ok) return;
      setContactValidationErrors({});
    },
    [onDeleteContactPerson, removeUnsavedContactAt],
  );

  const roleOptions = useMemo(() => {
    const fromMaster = (contactPersonRoleList ?? [])
      .map((r) => r.name?.trim() ?? "")
      .filter(Boolean);
    const fromRows = contactPersonRows
      .map((r) => r.providerContactPersonRole?.trim() ?? "")
      .filter(Boolean);
    return [...new Set([...fromMaster, ...fromRows])];
  }, [contactPersonRows, contactPersonRoleList]);

  const roleIdByRole = useMemo(() => {
    const map = new Map<string, string>();
    const sourceRows = editedContactList.length > 0 ? editedContactList : contactPersonRows;
    (contactPersonRoleList ?? []).forEach((row) => {
      const role = row.name?.trim();
      const roleId = row.id?.trim();
      if (role && roleId && !map.has(role)) map.set(role, roleId);
    });
    sourceRows.forEach((row) => {
      const role = row.providerContactPersonRole?.trim();
      const roleId = row.providerContactPersonRoleId?.trim();
      if (role && roleId && !map.has(role)) map.set(role, roleId);
    });
    return map;
  }, [editedContactList, contactPersonRows, contactPersonRoleList]);

  const openAddContactModal = useCallback(() => {
    clearContactInputErrors();
    addContactDialogForm.reset(
      {
        providerContactPersonRoleId: roleIdByRole.get(roleOptions[0] ?? "Contact person"),
        providerContactPersonRole: roleOptions[0] ?? "Contact person",
        providerContactPersonFullName: "",
        providerContactPersonDesignation: "",
        providerContactPersonMobileNo: "",
        providerContactPersonTelephoneNo: "",
        providerContactPersonEmailId: "",
      },
      { keepIsSubmitted: false, keepTouched: false, keepErrors: false },
    );
    setAddModalOpen(true);
  }, [addContactDialogForm, clearContactInputErrors, roleIdByRole, roleOptions]);

  const handleAddContactFromModal = useCallback(
    async (values: AddContactPersonFormValues) => {
      const role = String(values.providerContactPersonRole ?? "").trim();
      const roleId = String(values.providerContactPersonRoleId ?? "").trim();
      const fullName = String(values.providerContactPersonFullName ?? "").trim();
      const designation = String(values.providerContactPersonDesignation ?? "").trim();
      const mobileNo = String(values.providerContactPersonMobileNo ?? "").trim();
      const telephoneNo = String(values.providerContactPersonTelephoneNo ?? "").trim();
      const email = String(values.providerContactPersonEmailId ?? "").trim();

      if (!providerId?.trim()) {
        showProviderError("Provider ID is missing.");
        return;
      }

      const normalizedContact: ProviderContactPersonDetail = {
        providerContactPersonRoleId: roleId || roleIdByRole.get(role) || undefined,
        providerContactPersonRole: role,
        providerContactPersonFullName: fullName,
        providerContactPersonDesignation: designation || undefined,
        providerContactPersonMobileNo: mobileNo,
        providerContactPersonTelephoneNo: telephoneNo || undefined,
        providerContactPersonEmailId: email,
      };

      const payload = {
        contactPersons: [
          {
            providerContactPersonRoleId: normalizedContact.providerContactPersonRoleId,
            providerContactPersonRole: normalizedContact.providerContactPersonRole,
            providerContactPersonFullName: normalizedContact.providerContactPersonFullName,
            providerContactPersonDesignation: normalizedContact.providerContactPersonDesignation,
            providerContactPersonTelephoneNo: splitMultiValueContactParts(
              normalizedContact.providerContactPersonTelephoneNo,
            ),
            providerContactPersonMobileNo: splitMultiValueContactParts(
              normalizedContact.providerContactPersonMobileNo,
            ),
            providerContactPersonEmailId: splitMultiValueContactParts(
              normalizedContact.providerContactPersonEmailId,
            ),
          },
        ],
      };

      const res = await postProviderContactPersons(providerId, payload);
      if (!res.success) {
        showProviderError(res.error, res.status);
        return;
      }

      const refreshed = onRefreshContactPersons ? await onRefreshContactPersons() : false;
      if (!refreshed) {
        setEditedContactList((prev) => [...prev, normalizedContact]);
      }
      setEditingGroupId(null);
      setAddModalOpen(false);
      toast.success((res.data as { message?: string })?.message, {
        position: "top-right",
        duration: 5000,
      });
    },
    [providerId, roleIdByRole, onRefreshContactPersons],
  );

  const selectedContactRole = addContactDialogForm.watch("providerContactPersonRole");
  const watchedContactName = addContactDialogForm.watch("providerContactPersonFullName");
  const watchedContactDesignation = addContactDialogForm.watch("providerContactPersonDesignation");
  const watchedContactMobile = addContactDialogForm.watch("providerContactPersonMobileNo");
  const watchedContactTelephone = addContactDialogForm.watch("providerContactPersonTelephoneNo");
  const watchedContactEmail = addContactDialogForm.watch("providerContactPersonEmailId");
  const addContactFormValues = addContactDialogForm.watch();
  const { touchedFields, isSubmitted } = addContactDialogForm.formState;

  useEffect(() => {
    if (!addModalOpen) return;
    const errors = syncAddContactPersonFieldErrors(addContactDialogForm.getValues(), {
      touchedFields,
      showRequiredErrors: isSubmitted,
    });
    setContactNameInputError(errors.name);
    setContactDesignationInputError(errors.designation);
    setContactMobileInputError(errors.mobile);
    setContactTelephoneInputError(errors.telephone);
    setContactEmailInputError(errors.email);
  }, [
    addModalOpen,
    addContactDialogForm,
    isSubmitted,
    touchedFields,
    watchedContactName,
    watchedContactDesignation,
    watchedContactMobile,
    watchedContactTelephone,
    watchedContactEmail,
    selectedContactRole,
  ]);

  const canSubmitAddContact = useMemo(
    () => addContactPersonSchema.isValidSync(addContactFormValues),
    [addContactFormValues],
  );

  const addContactDialogFields = useMemo<FieldConfig[]>(
    () => {
      const rolesForDropdown =
        roleOptions.length > 0 ? roleOptions : ["Contact person"];

      return [
      {
        name: "providerContactPersonRole",
        type: "dropdown",
        label: contactLabels.role,
        required: true,
        options: rolesForDropdown.map((role) => ({
          label: translateContactPersonRole(t, role),
          value: role,
        })),
        externalControl: {
          value: String(selectedContactRole ?? ""),
          onChange: (value) => {
            addContactDialogForm.setValue("providerContactPersonRole", value, {
              shouldValidate: true,
            });
            addContactDialogForm.setValue(
              "providerContactPersonRoleId",
              roleIdByRole.get(value) ?? "",
            );
          },
        },
      },
      {
        name: "providerContactPersonFullName",
        type: "input",
        label: contactLabels.name,
        required: true,
        error: contactNameInputError,
      },
      {
        name: "providerContactPersonDesignation",
        type: "input",
        label: contactLabels.designation,
        error: contactDesignationInputError,
      },
      {
        name: "providerContactPersonMobileNo",
        type: "input",
        label: contactLabels.mobileNo,
        required: true,
        inputType: "tel",
        error: contactMobileInputError,
      },
      {
        name: "providerContactPersonTelephoneNo",
        type: "input",
        label: contactLabels.telephoneNo,
        inputType: "tel",
        error: contactTelephoneInputError,
      },
      {
        name: "providerContactPersonEmailId",
        type: "input",
        label: contactLabels.email,
        required: true,
        inputType: "email",
        error: contactEmailInputError,
      },
    ];
    },
    [
      addContactDialogForm,
      contactDesignationInputError,
      contactEmailInputError,
      contactLabels,
      contactMobileInputError,
      contactNameInputError,
      contactTelephoneInputError,
      roleIdByRole,
      roleOptions,
      selectedContactRole,
      t,
    ],
  );

  const addContactDialogFormForDialog =
    addContactDialogForm as unknown as UseFormReturn<Record<string, unknown>>;

  const rowsToRender =
    hasContactPersonApiList && editedContactList.length > 0 ? editedContactList : contactPersonRows;
  const contactGroups = useMemo(
    () => sortContactGroupsKeyContactFirst(groupContactsByRole(rowsToRender)),
    [rowsToRender],
  );

  const isGroupEditing = useCallback(
    (groupId: string) => editingGroupId === groupId,
    [editingGroupId],
  );

  return {
    editingGroupId,
    hasContactPersonApiList,
    contactPersonRows,
    editedContactList,
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
    rowsToRender,
    contactGroups,
    canWrite,
    clearRowFieldError,
    setRowFieldError,
    startGroupEdit,
    handleGroupCancel,
    handleGroupSave,
    updateContactAt,
    addContactPersonForRole,
    removeUnsavedContactAt,
    handleDeleteContact,
    openAddContactModal,
    handleAddContactFromModal,
  };
}
