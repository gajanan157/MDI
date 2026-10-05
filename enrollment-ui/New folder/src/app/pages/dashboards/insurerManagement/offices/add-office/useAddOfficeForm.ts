import { handleFormApiErrors } from "@/app/pages/AdminDepartment/tpabranches/handleFormApiErrors";
import { mergeRefs } from "@/app/pages/AdminDepartment/tpabranches/function";
import { usePermission } from "@/app/auth/usePermission";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useDisclosure } from "@/hooks";
import { useCreateOffice } from "@/hooks/useOffices";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { showErrorMessage } from "@/utils/errorHandler";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { Path, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { saveInsurerOffice } from "../function";
import {
  applyServerValidationErrors,
  buildOfficeFormResetValues,
  buildOfficeSavePayload,
  getInsurerCompanyOptions,
  getOfficeTypeDropdownOptions,
  getSuperiorOfficeOptionsWithFallback,
  getSuperiorOfficeTypeOptions,
  isDivisionOrUnderwritingOffice,
  isHeadOfficeLocked,
  loadOfficeBranchById,
  mapAssignmentsFromRow,
  mapRowToServicesData,
  mergeServiceEntries,
  processOfficeSaveResult,
  removeContactPersonAt,
  shouldShowReportingOfficeField,
} from "./addOfficeFormHelpers";
import { OfficeFormValues, officeSchema } from "./schema";
import { useSuperiorOfficeOptions } from "./useSuperiorOfficeOptions";

type LocationState = {
  mode?: "view" | "edit" | "create";
};

const defaultFormValues: OfficeFormValues = {
  icName: "",
  officeType: "",
  superiorOfficeType: "",
  superiorOffice: "",
  officeName: "",
  officeCode: "",
  tenantId: "",
  active: "",
  underwritingCenter: false,
  effectiveFrom: null,
  effectiveTo: null,
  address: {
    address: "",
    city: "",
    stateName: "",
    addressType: "both",
    postalCode: "",
  },
  serviceTypes: {
    mediclaim: { enabled: false, startDate: "", endDate: "" },
    uhis: { enabled: false, startDate: "", endDate: "" },
    bank: { enabled: false, startDate: "", endDate: "" },
    online: { enabled: false, startDate: "", endDate: "" },
  },
};

export function useAddOfficeForm() {
  const isEditModeRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const insurerOfficeNameRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { mode: incomingMode } = (state as LocationState) || {};
  const mode = incomingMode ?? "create";
  const param = useParams();
  const dispatch = useAppDispatch();
  const createOffice = useCreateOffice();
  const { canWrite } = usePermission("insurer-office");
  const { t } = useTranslation();
  const isEditMode = Boolean(param?.id);

  const [row, setRow] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssign, setIsAssign] = useState(false);
  const [editing, setEditing] = useState(!isEditMode);
  const [insurerLists, setInsurerLists] = useState<Array<{ label: string; value: string }>>([]);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [contactPersonFields, setContactPersonFields] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editIndex2, setEditIndex2] = useState<number | null>(null);
  const [mobileerror, setMobileError] = useState("");
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [assignObj] = useState<any | null>(null);
  const [isOpen, { close }] = useDisclosure();

  const form = useForm<OfficeFormValues>({
    resolver: yupResolver(officeSchema as any),
    mode: "onChange",
    defaultValues: defaultFormValues,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
    setError,
  } = form;

  const officeTypeWatch = watch("officeType");
  const superiorOfficeTypeWatch = watch("superiorOfficeType");
  const icNameWatch = watch("icName");
  const officeType = watch("officeType");
  const readOnly = isEditMode && !editing;

  const insurerList = useAppSelector((store) => store.insurerList);
  const insuranceCompanyOptions = getInsurerCompanyOptions(
    isEditMode,
    insurerLists,
    insurerList.insurerList,
  );
  const officeTypeOptions = getOfficeTypeDropdownOptions(isEditMode, officeType);
  const headOfficeLocked = isHeadOfficeLocked(isEditMode, officeType);
  const showReportingOfficeType = isDivisionOrUnderwritingOffice(
    officeTypeWatch ?? undefined,
    row?.officeType,
  );
  const showReportingOffice = shouldShowReportingOfficeField(
    superiorOfficeTypeWatch ?? undefined,
    row?.superiorInsurerOffice?.officeType,
    officeTypeWatch ?? undefined,
    row?.officeType,
  );

  const superiorOfficeOptions = useSuperiorOfficeOptions({
    superiorOfficeType: superiorOfficeTypeWatch ?? undefined,
    officeType: officeTypeWatch ?? undefined,
    insurerId: icNameWatch ?? undefined,
    officeId: param?.id,
    isEditing: editing,
    isEditModeRef,
    setValue,
  });
  const reportingOfficeOptions = getSuperiorOfficeOptionsWithFallback(
    superiorOfficeOptions,
    row?.superiorInsurerOffice,
  );

  useBreadcrumb([
    { title: t("office.breadcrumbs.offices"), path: "/insurer-management/office" },
    {
      title: isEditMode
        ? t("office.breadcrumbs.viewOffice")
        : t("office.breadcrumbs.addNewOffice"),
    },
  ]);

  useEffect(() => {
    dispatch(fetchInsurerList());
  }, [dispatch]);

  useEffect(() => {
    if (!param?.id) return;
    loadOfficeBranchById(param.id).then((result) => {
      if (!result.ok) {
        showErrorMessage(result.error);
        return;
      }
      setRow(result.data);
      setServicesData(mapRowToServicesData(result.data));
    });
  }, [param?.id, isAssign]);

  useEffect(() => {
    if (officeTypeWatch === "UO") {
      setValue("underwritingCenter", true, { shouldDirty: true, shouldValidate: true });
    }
  }, [officeTypeWatch, setValue]);

  useEffect(() => {
    if (isEditMode && row) {
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
    }
  }, [isEditMode, row]);

  useEffect(() => {
    if (!isInitialLoadRef.current && (officeTypeWatch === "HO" || officeTypeWatch === "RO")) {
      setValue("superiorOfficeType", "");
      setValue("superiorOffice", "");
    }
  }, [officeTypeWatch, setValue]);

  useEffect(() => {
    if (isEditMode && row) {
      const stateList = [{ label: row.insurerName, value: row.insurerId }];
      if (!insurerLists.length) setInsurerLists(stateList);
      setContactPersonFields(mapAssignmentsFromRow(row));
      reset(buildOfficeFormResetValues(row), { keepDefaultValues: false });
      setEditing(false);
      setServicesData(mapRowToServicesData(row));
      return;
    }
    setEditing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, row]);

  useEffect(() => {
    if (servicesData.length !== 0) setServicesError("");
  }, [servicesData]);

  const insurerOfficeFieldMap = {
    officeName: "officeName",
    officeCode: "officeCode",
  } satisfies Record<string, Path<OfficeFormValues>>;

  const submitOffice = async (data: OfficeFormValues) => {
    if (isEditMode && !row?.insurerOfficeId) {
      toast.error("Missing office id for update", { position: "top-right", duration: 5000 });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildOfficeSavePayload({
        data,
        row,
        servicesData,
        contactPersonFields,
        isUpdate: isEditMode,
      });
      const result = isEditMode
        ? await saveInsurerOffice(payload, String(row.insurerOfficeId), "")
        : await saveInsurerOffice(payload, "", data.icName);

      processOfficeSaveResult(result, {
        setError,
        fieldMap: insurerOfficeFieldMap,
        nameInputRef: insurerOfficeNameRef,
        setMobileError,
        setIsSubmitting,
        showError: (saveResult) =>
          showErrorMessage(saveResult as Parameters<typeof showErrorMessage>[0]),
        handleFormApiErrors: (saveResult, setFormError, fieldMap) =>
          handleFormApiErrors(
            saveResult as Parameters<typeof handleFormApiErrors>[0],
            setFormError,
            fieldMap,
          ),
        onSuccess: () => {
          toast.success(
            result?.data?.message ??
              (isEditMode ? "Office updated" : "Office created successfully"),
            { position: "top-right", duration: 5000 },
          );
          navigate("/insurer-management/office");
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save office";
      toast.error(String(message), { position: "top-right", duration: 5000 });
      applyServerValidationErrors(err, setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit: SubmitHandler<OfficeFormValues> = async (data) => {
    if (servicesData.length === 0) {
      setServicesError("Please add at least one service.");
      return;
    }
    setServicesError(null);
    await submitOffice(data);
  };

  const onCancel = () => {
    if (isEditMode && editing) {
      setEditing(false);
      if (row) reset(undefined);
      return;
    }
    navigate("/insurer-management/office");
  };

  const onEdit = () => {
    isEditModeRef.current = true;
    setEditing(true);
  };

  const handleOpenModal = () => {
    setOpenServiceModal(true);
    setEditIndex2(null);
  };

  const handleAddService = (data: Record<string, { servicingAllocationFor?: unknown } & Record<string, unknown>>) => {
    setServicesData((current) => mergeServiceEntries(current, data));
    setOpenServiceModal(false);
  };

  const handleEditService = (index: number) => {
    setEditIndex2(index);
    setOpenServiceModal(true);
  };

  const handleDeleteService = (serviceName: string) => {
    setServicesData((current) => current.filter((service) => service.serviceName !== serviceName));
  };

  const handleOpenAddContact = () => {
    setOpenContactModal(true);
    setEditIndex(null);
  };

  const handleEditContact = (index: number) => {
    setEditIndex(index);
    setOpenContactModal(true);
  };

  const handleRemoveContact = (index: number) => {
    setContactPersonFields((current) => removeContactPersonAt(current, index));
  };

  const officeNameRegistration = register("officeName");
  const officeCodeRegistration = register("officeCode");

  return {
    t,
    canWrite,
    isEditMode,
    editing,
    readOnly,
    isSubmitting,
    createOffice,
    errors,
    control,
    register,
    setValue,
    watch,
    handleSubmit,
    handleFormSubmit,
    onCancel,
    onEdit,
    insuranceCompanyOptions,
    officeTypeOptions,
    headOfficeLocked,
    showReportingOfficeType,
    showReportingOffice,
    reportingOfficeTypeOptions: getSuperiorOfficeTypeOptions(officeTypeWatch ?? ""),
    reportingOfficeOptions,
    officeTypeWatch,
    servicesError,
    servicesData,
    readOnlyClassName: readOnly ? "pointer-events-none opacity-50" : "",
    handleOpenModal,
    handleEditService,
    handleDeleteService,
    handleOpenAddContact,
    handleEditContact,
    handleRemoveContact,
    contactPersonFields,
    mobileerror,
    openContactModal,
    setOpenContactModal,
    editIndex,
    setContactPersonFields,
    openServiceModal,
    setOpenServiceModal,
    handleAddService,
    editIndex2,
    isOpen,
    close,
    assignObj,
    setIsAssign,
    insurerOfficeNameRef,
    officeNameRegistration,
    officeCodeRegistration,
    mergeRefs,
  };
}
