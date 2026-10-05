import type { HospitalDetailRecord, ProviderContactPersonDetail } from "../../hospitalData";
import type { ProviderDetailsFromApi } from "./providerDetailSectionMerges";
import { parseInfrastructureBedFieldsFromPayload } from "./providerDetailSectionMerges";

export function applyProviderContactPersonsToDetail(
  base: HospitalDetailRecord,
  providerContactPersons: ProviderContactPersonDetail[],
): HospitalDetailRecord {
  return { ...base, providerContactPersons };
}

export function minimalNetworkProviderShell(providerId: string): HospitalDetailRecord {
  return {
    id: providerId,
    hospitalName: "",
    hospitalCode: "",
    rohiniCode: "",
    registrationValidTill: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    location: "",
    status: "",
    providerCode: "",
    isActive: false,
  };
}

export function preserveLazyContactFields(
  next: HospitalDetailRecord,
  prev: HospitalDetailRecord | null,
): HospitalDetailRecord {
  if (!prev) return next;
  return {
    ...next,
    providerContactPersons: prev.providerContactPersons ?? next.providerContactPersons,
    primaryContactName: prev.primaryContactName ?? next.primaryContactName,
    primaryContactDesignation: prev.primaryContactDesignation ?? next.primaryContactDesignation,
    primaryContactMobile: prev.primaryContactMobile ?? next.primaryContactMobile,
    primaryContactTelephone: prev.primaryContactTelephone ?? next.primaryContactTelephone,
    primaryContactEmail: prev.primaryContactEmail ?? next.primaryContactEmail,
  };
}

export function mergeRefreshedProviderDetails(
  mapped: HospitalDetailRecord,
  prev: HospitalDetailRecord | null,
): HospitalDetailRecord {
  return {
    ...mapped,
    providerContactPersons: prev?.providerContactPersons ?? mapped.providerContactPersons,
    primaryContactName: prev?.primaryContactName ?? mapped.primaryContactName,
    primaryContactDesignation: prev?.primaryContactDesignation ?? mapped.primaryContactDesignation,
    primaryContactMobile: prev?.primaryContactMobile ?? mapped.primaryContactMobile,
    primaryContactTelephone: prev?.primaryContactTelephone ?? mapped.primaryContactTelephone,
    primaryContactEmail: prev?.primaryContactEmail ?? mapped.primaryContactEmail,
  };
}

/** Extracts provider UUID from paths like `/provider-masters/providers/{id}/...` */
export function extractProviderIdFromPath(pathname: string): string | undefined {
  return pathname.match(/\/provider-masters\/providers\/([^/]+)/)?.[1];
}

/** Builds legacy `HospitalDetailRecord` shell for tabs that still read list UI field names. */
export function buildSharedProviderProfileFromDetails(
  details: ProviderDetailsFromApi,
  prev: HospitalDetailRecord | null,
): HospitalDetailRecord {
  const bedPatch = parseInfrastructureBedFieldsFromPayload(details.infrastructure);
  const locationLine =
    details.providerAddress ??
    [details.providerCity, details.providerStateName].filter(Boolean).join(", ");

  return {
    id: details.providerId,
    hospitalName: details.providerName,
    hospitalCode: details.providerCode,
    rohiniCode: details.providerIibRohiniCode,
    registrationValidTill: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    location: locationLine,
    status: details.recordStatus,
    providerCode: details.providerCode,
    isActive:
      details.recordStatus.trim().toLowerCase() === "active" ||
      details.providerIsVerified === true,
    blacklistedByIcNames: details.blacklistedByIcNames,
    providerDetailInfrastructure: details.infrastructure,
    providerContactPersons: prev?.providerContactPersons,
    ...bedPatch,
  };
}
