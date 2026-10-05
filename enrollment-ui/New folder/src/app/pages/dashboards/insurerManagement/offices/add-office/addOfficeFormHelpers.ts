import type { RefObject } from "react";
import { Path, UseFormSetError } from "react-hook-form";
import { insurerApi } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { SERVICE_TYPES } from "@/components/shared/form/ServiceTypeSection";
import { Tenent_Id } from "@/utils/tenent";
import { buildServiceTypesPayload, servicesList } from "./AddServiceModal";
import {
  buildContactPersonRequestList,
  hasAnyValue,
  mapAssignmentsToContactPersons,
} from "./funcation";
import { OfficeFormValues } from "./schema";

export const OFFICE_SERVICE_KEYS = ["mediclaim", "uhis", "bank", "online"] as const;

export function mergeServiceTypesWithAssignments(
  serviceTypes: Record<string, any>,
  assignments: any[],
) {
  return SERVICE_TYPES.map((service) => {
    const key = service.name;
    const serviceInfo = serviceTypes[key];

    if (!serviceInfo?.allocationId) {
      return { ...service, enabled: false, assignments: [] };
    }

    const matchedAssignments = assignments.filter(
      (item) => item?.allocationId === serviceInfo.allocationId,
    );

    return {
      ...service,
      enabled: serviceInfo.enabled,
      allocationId: serviceInfo.allocationId,
      startDate: serviceInfo.startDate,
      endDate: serviceInfo.endDate,
      assignments: matchedAssignments,
    };
  });
}

function toIsoDateString(date: Date): string | null {
  return !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}

function fmtStringDate(value: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return toIsoDateString(new Date(value));
}

function fmtObjectDate(value: object): string | null {
  if ("value" in value) return fmtSingle((value as { value: unknown }).value);
  if (typeof (value as { toISOString?: () => string }).toISOString === "function") {
    return (value as { toISOString: () => string }).toISOString().slice(0, 10);
  }
  return null;
}

export function fmtSingle(d: unknown): string | null {
  if (d === null || d === undefined || d === "") return null;
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  if (typeof d === "string") return fmtStringDate(d);
  if (typeof d === "number") return toIsoDateString(new Date(d));
  if (d && typeof d === "object") return fmtObjectDate(d);
  return null;
}

export function normalizeServiceTypes(src: Record<string, any>) {
  const getObj = (key: string) => {
    const obj = src?.[key] ?? src?.[key.toUpperCase()] ?? null;
    if (!obj) return { enabled: false };
    const allocationId = obj.allocationId;
    const enabled = Boolean(obj.enabled ?? obj.isEnabled ?? false);
    const start = fmtSingle(obj.startDate ?? obj.start_date ?? obj.start ?? null);
    const end = fmtSingle(obj.endDate ?? obj.end_date ?? obj.end ?? null);
    const out: Record<string, unknown> = { enabled };
    if (allocationId) out.allocationId = allocationId;
    if (start) out.startDate = start;
    if (end) out.endDate = end;
    return out;
  };

  const res: Record<string, unknown> = {};
  OFFICE_SERVICE_KEYS.forEach((k) => {
    res[k] = getObj(k);
  });
  return res;
}

export function normalizeAddressFromRow(row: Record<string, any>) {
  const addr = row.address ?? {};
  if (typeof addr === "string") {
    return {
      address: addr,
      city: "",
      stateName: "",
      addressType: "both",
      postalCode: "",
    };
  }
  return {
    address: addr.address ?? "",
    city: addr.city ?? "",
    stateName: addr.stateName ?? "",
    addressType: addr.addressType ?? "both",
    postalCode: addr.postalCode ?? "",
  };
}

export function buildOfficeFormResetValues(row: Record<string, any>): Partial<OfficeFormValues> {
  const incomingServiceTypes =
    row.serviceTypes ?? row.service_period ?? row.servicePeriod ?? {};

  return {
    officeName: row.officeName ?? row.name ?? "",
    officeCode: row.officeCode ?? "",
    icName: row.icName ?? row.insurerId ?? "",
    officeType: row.officeType ?? "",
    active: row.active ?? row.active_flag ?? "",
    underwritingCenter: Boolean(row.underwritingCenter ?? row.isUnderwriting ?? false),
    address: normalizeAddressFromRow(row),
    serviceTypes: normalizeServiceTypes(incomingServiceTypes) as OfficeFormValues["serviceTypes"],
    effectiveFrom: row.effectiveFrom ?? null,
    effectiveTo: row.effectiveTo ?? null,
    superiorOfficeType: row?.superiorInsurerOffice?.officeType ?? "",
    superiorOffice: row?.superiorInsurerOffice?.insurerOfficeId ?? "",
    tenantId: "",
  };
}

export function mapRowToServicesData(row: Record<string, any>) {
  if (!row?.serviceTypes) return [];

  return servicesList
    .map((service) => {
      const val = row.serviceTypes[service.name];
      if (!val || val.enabled === false) return null;
      return {
        serviceName: service.name,
        label: service.label,
        enabled: val.enabled,
        allocationId: val.allocationId,
        startDate: val.startDate,
        endDate: val.endDate,
        servicingAllocationFor: val.servicingAllocationFor,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
}

export function getSuperiorOfficeTypeOptions(officeType: string) {
  if (officeType === "DO") {
    return [{ label: "RO (Regional Office)", value: "RO" }];
  }
  if (officeType === "UO") {
    return [
      { label: "RO (Regional Office)", value: "RO" },
      { label: "DO (Divisional Office)", value: "DO" },
    ];
  }
  return [];
}

export function isDivisionOrUnderwritingOffice(
  officeType?: string,
  rowOfficeType?: string,
) {
  const types = new Set(["DO", "UO"]);
  return types.has(officeType ?? "") || types.has(rowOfficeType ?? "");
}

export function shouldShowReportingOfficeField(
  superiorOfficeType?: string,
  rowSuperiorOfficeType?: string,
  officeType?: string,
  rowOfficeType?: string,
) {
  return Boolean(superiorOfficeType || rowSuperiorOfficeType) &&
    isDivisionOrUnderwritingOffice(officeType, rowOfficeType);
}

export function getOfficeTypeDropdownOptions(
  isEditMode: boolean,
  currentOfficeType?: string,
) {
  const headOfficeOption =
    isEditMode && currentOfficeType === "HO"
      ? [{ label: "HO (Head Office)", value: "HO" }]
      : [];

  return [
    ...headOfficeOption,
    { label: "RO (Regional Office)", value: "RO" },
    { label: "DO (Divisional Office)", value: "DO" },
    { label: "UO (Under Writting Office)", value: "UO" },
  ];
}

export function isHeadOfficeLocked(isEditMode: boolean, officeType?: string) {
  return isEditMode && officeType === "HO";
}

export function getSuperiorOfficeOptionsWithFallback(
  options: { label: string; value: string }[],
  superiorInsurerOffice?: { insurerOfficeId?: string; officeName?: string },
) {
  if (!superiorInsurerOffice?.insurerOfficeId) return options;

  const exists = options.some(
    (o) => o.value === superiorInsurerOffice.insurerOfficeId,
  );
  if (exists) return options;

  return [
    {
      label: superiorInsurerOffice.officeName ?? "",
      value: superiorInsurerOffice.insurerOfficeId,
    },
    ...options,
  ];
}

export function applyServerValidationErrors(
  err: unknown,
  setError: UseFormSetError<OfficeFormValues>,
) {
  const data =
    (err as { response?: { data?: unknown }; data?: unknown })?.response?.data ??
    (err as { data?: unknown })?.data ??
    err ??
    null;
  if (!data || typeof data !== "object") return;

  const record = data as Record<string, unknown>;
  if (record.errors && typeof record.errors === "object") {
    Object.entries(record.errors as Record<string, unknown>).forEach(([field, msg]) => {
      const message = Array.isArray(msg) ? String(msg[0]) : String(msg);
      try {
        setError(field as Path<OfficeFormValues>, { type: "server", message });
      } catch {
        // ignore unknown fields
      }
    });
    return;
  }

  const fieldErrors = (record as { fieldErrors?: Array<{ field?: string; message?: string }> })
    .fieldErrors;
  if (!Array.isArray(fieldErrors)) return;

  fieldErrors.forEach((fe) => {
    if (!fe.field) return;
    setError(fe.field as Path<OfficeFormValues>, {
      type: "server",
      message: fe.message || "Invalid",
    });
  });
}

export type OfficeSaveResultContext = {
  setError: UseFormSetError<OfficeFormValues>;
  fieldMap: Record<string, Path<OfficeFormValues>>;
  nameInputRef: RefObject<HTMLInputElement | null>;
  setMobileError: (message: string) => void;
  setIsSubmitting: (value: boolean) => void;
  onSuccess: () => void;
  showError: (result: unknown) => void;
  handleFormApiErrors: (
    result: unknown,
    setError: UseFormSetError<OfficeFormValues>,
    fieldMap: Record<string, Path<OfficeFormValues>>,
  ) => void;
};

export function processOfficeSaveResult(
  result: {
    success?: boolean;
    status?: number;
    data?: { message?: string };
    error?: { mobileNumber?: string; email?: string };
  } | null | undefined,
  ctx: OfficeSaveResultContext,
) {
  if (result?.success) {
    ctx.onSuccess();
    return;
  }

  if (result?.status === 409) {
    const conflictMessage = result.error?.mobileNumber ?? result.error?.email;
    if (conflictMessage) {
      ctx.setMobileError(conflictMessage);
      ctx.setIsSubmitting(false);
      return;
    }

    ctx.nameInputRef.current?.focus();
    ctx.nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    ctx.handleFormApiErrors(result, ctx.setError, ctx.fieldMap);
    ctx.setIsSubmitting(false);
    ctx.setMobileError("");
    return;
  }

  ctx.showError(result);
  applyServerValidationErrors(result, ctx.setError);
  ctx.setIsSubmitting(false);
  ctx.setMobileError("");
}

export function mapAssignmentsFromRow(row: Record<string, any>) {
  return mapAssignmentsToContactPersons({
    assignments: row?.assignments,
    includeContactPersonId: true,
    includeChannelId: true,
    assignmentId: true,
  });
}

export function mergeServiceEntries(
  existingServices: Array<Record<string, unknown>>,
  formData: Record<string, { servicingAllocationFor?: unknown } & Record<string, unknown>>,
) {
  const selectedServices = Object.entries(formData)
    .filter(([, val]) => val.servicingAllocationFor)
    .map(([key, val]) => ({ serviceName: key, enabled: true, ...val }));

  const updatedServices = [...existingServices];
  selectedServices.forEach((newService) => {
    const existingIndex = updatedServices.findIndex(
      (service) => service.serviceName === newService.serviceName,
    );
    if (existingIndex > -1) {
      updatedServices[existingIndex] = newService;
    } else {
      updatedServices.push(newService);
    }
  });
  return updatedServices;
}

type BuildOfficePayloadParams = {
  data: OfficeFormValues;
  row?: Record<string, any>;
  servicesData: Array<Record<string, unknown>>;
  contactPersonFields: Array<Record<string, unknown>>;
  isUpdate: boolean;
};

export function buildOfficeSavePayload({
  data,
  row,
  servicesData,
  contactPersonFields,
  isUpdate,
}: BuildOfficePayloadParams) {
  const effectiveFromFormatted = fmtSingle(
    (data as OfficeFormValues & { effectiveFrom?: unknown }).effectiveFrom ??
      row?.effectiveFrom ??
      new Date(),
  );
  const effectiveToFormatted = fmtSingle(
    (data as OfficeFormValues & { effectiveTo?: unknown }).effectiveTo ??
      row?.effectiveTo ??
      new Date("2099-12-31"),
  );
  const serviceTypes = buildServiceTypesPayload(servicesData);
  const addrFromForm = (data as OfficeFormValues & { address?: Record<string, unknown> }).address ?? {};
  const existingAddr = row?.address ?? {};
  const address = {
    addressId: existingAddr?.addressId ?? existingAddr?.id ?? undefined,
    addressType: addrFromForm.addressType ?? existingAddr?.addressType ?? "both",
    address: addrFromForm.address ?? existingAddr?.address ?? "",
    stateName: addrFromForm.stateName ?? existingAddr?.stateName?.toUpperCase() ?? "",
    city: addrFromForm.city ?? existingAddr?.city ?? "",
    countryCode: addrFromForm.countryCode ?? existingAddr?.countryCode ?? "IN",
    postalCode: addrFromForm.postalCode ?? existingAddr?.postalCode ?? "",
    addressStatus: addrFromForm.addressStatus ?? existingAddr?.addressStatus ?? "ACTIVE",
  };

  const contactPersonRequestList = buildContactPersonRequestList({
    formData: contactPersonFields,
    tenantId: Tenent_Id,
    insurerId: row?.insurerId,
    includeContactPersonId: isUpdate,
    includeChannelId: isUpdate,
    assignmentId: isUpdate,
  });
  const cleanedAssignments =
    contactPersonRequestList?.length > 0 && hasAnyValue(contactPersonRequestList[0])
      ? contactPersonRequestList
      : [];

  return {
    insurerId: (data as OfficeFormValues & { icName?: string }).icName ?? row?.insurerId ?? null,
    officeType: String((data as OfficeFormValues & { officeType?: string }).officeType ?? row?.officeType ?? "OTHER"),
    superiorOfficeType:
      (data as OfficeFormValues & { superiorOfficeType?: string }).superiorOfficeType ??
      row?.superiorOfficeType ??
      null,
    superiorOfficeId:
      (data as OfficeFormValues & { superiorOffice?: string }).superiorOffice ??
      row?.superiorOffice ??
      null,
    officeCode: data.officeCode ?? row?.officeCode ?? "",
    officeName: data.officeName ?? row?.officeName ?? "",
    underwritingCenter: Boolean(data.underwritingCenter ?? row?.underwritingCenter ?? false),
    servicingAllocationFor:
      (data as OfficeFormValues & { servicingAllocationFor?: string }).servicingAllocationFor ??
      row?.servicingAllocationFor ??
      "both",
    address,
    serviceTypes,
    effectiveFrom: effectiveFromFormatted,
    effectiveTo: effectiveToFormatted,
    contactPersonRequestList: cleanedAssignments,
    ...(isUpdate && { insurerOfficeId: row?.insurerOfficeId }),
  };
}

export function getInsurerCompanyOptions(
  isEditMode: boolean,
  insurerLists: Array<{ label: string; value: string }>,
  insurerList: Array<{ insurerId?: string; insurerName?: string }> | undefined,
) {
  if (isEditMode) return insurerLists;
  return (
    insurerList?.map((insurer) => ({
      value: insurer.insurerId ?? "",
      label: insurer.insurerName ?? "",
    })) ?? []
  );
}

export function removeContactPersonAt<T>(contacts: T[], index: number): T[] {
  return contacts.filter((_, contactIndex) => contactIndex !== index);
}

export function formatServicingAllocation(
  allocation: string | undefined,
  bothLabel: string,
) {
  return allocation === "both" ? bothLabel : allocation;
}

export async function loadOfficeBranchById(officeId: string) {
  const result = await fetchUser(
    insurerApi,
    `/v1/insurer/insurer-office/${officeId}`,
  );
  if (!result?.success || !result?.data) {
    return { ok: false as const, error: result };
  }

  const data = result.data.data;
  const serviceTypes = data.serviceTypes || {};
  const assignments = data.assignments || [];
  return {
    ok: true as const,
    data,
    assignments,
    mergedServiceTypes: mergeServiceTypesWithAssignments(serviceTypes, assignments),
  };
}
