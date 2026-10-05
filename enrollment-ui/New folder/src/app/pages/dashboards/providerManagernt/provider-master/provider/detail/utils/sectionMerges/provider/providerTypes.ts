import type {
  ProviderDetailCertificate,
  ProviderDetailInfrastructure,
} from "../../../../hospitalData";
import {
  buildProviderOldCodePayloadFromIdentifiers,
  normalizeProviderDetailIdentifiers,
  pickProviderDetailRohiniCode,
  type NormalizedProviderDetailIdentifier,
} from "./providerDetailIdentifierNormalizer";

/** Nested contact block from GET `/v1/provider/{id}/details`. */
export interface ProviderContactDetailFromApi {
  providerWebsiteAvailableFlag?: boolean;
  providerWebsiteUrl?: string | null;
  providerTelephoneNo?: string[];
  providerFaxNo?: string[];
  providerMobileNo?: string[];
  providerEmailId?: string[];
}

/** GET `/v1/provider/{id}/details` — same field names as API. */
export interface ProviderDetailsFromApi {
  providerId: string;
  providerName: string;
  providerType: string;
  providerTypeId?: string;
  providerTypeName?: string;
  providerClass?: string;
  providerSubclass?: string;
  providerCode: string;
  providerIibRohiniCode: string;
  providerOldCode: string | null;
  recordStatus: string;
  providerIsVerified?: boolean;
  providerOwnershipType?: string;
  providerDayCareFlag?: boolean;
  providerCareTier?: string;
  providerInternalGrade?: string;
  providerOwnerName?: string;
  providerOwnerDesignation?: string;
  providerOwnerQualification?: string;
  providerSignatoryName?: string;
  providerSignatoryDesignation?: string;
  providerSystemOfMedicineName?: string;
  providerSystemOfMedicineId?: string;
  providerEmpanellmentId?: string;
  providerTpaServicingBranchId?: string;
  providerTpaServicingBranchName?: string;
  providerTpaServicingBranchCityMappingId?: string;
  providerServiceEmailId?: string;
  tpaServicingBranchName?: string;
  /** API returns a string array (comma-joined in the form). */
  tpaServicingBranchEmail?: string[];
  providerAddress?: string;
  providerAddressId?: string;
  providerPlotNo?: string;
  providerLocation?: string;
  providerTaluka?: string;
  providerStateCode?: string;
  providerCountryCode?: string;
  providerLatitude?: number | null;
  providerLongitude?: number | null;
  providerAddressStatus?: string;
  providerCity?: string;
  providerDistrict?: string;
  providerStateName?: string;
  providerZone?: string;
  providerPostalCode?: string;
  providerLocationType?: string;
  providerNetworkType?: string | null;
  tpaProviderNetwork?: string | null;
  insurerProviderNetwork?: string | null;
  providerRegistrationNo?: string;
  providerRegistrationAuthority?: string;
  providerPanNo?: string;
  providerPanHolderName?: string;
  providerTanNo?: string;
  providerContactDetail?: ProviderContactDetailFromApi;
  identifiers: NormalizedProviderDetailIdentifier[];
  certificates: ProviderDetailCertificate[];
  /** Clinical specialty display names (and/or ids when API returns strings). */
  clinicalSpecialties: string[];
  /** Specialty ids from `providerClinicalSpecialties` object rows when present. */
  clinicalSpecialtyIds?: string[];
  infrastructure?: ProviderDetailInfrastructure;
  blacklistedByIcNames?: string[];
  /** Unique `providerAgreementName` values from GET details `agreements` array. */
  agreementTypeNames?: string[];
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const text = value.trim();
    return text === "" ? undefined : text;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${value}` : undefined;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "bigint") {
    return `${value}`;
  }
  return undefined;
}

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readOptionalNumber(value: unknown): number | null | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function readNestedAddressField(
  item: Record<string, unknown>,
  key: string,
): string | undefined {
  return (
    readOptionalString(item[key]) ??
    readOptionalString(isApiRecord(item.address) ? item.address[key] : undefined)
  );
}

function readNullableString(value: unknown): string | null {
  if (value == null) return null;
  return readOptionalString(value) ?? null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Accepts API string[] or a single string (legacy). */
function readStringList(value: unknown): string[] {
  if (Array.isArray(value)) return readStringArray(value);
  const text = readOptionalString(value);
  return text ? [text] : [];
}

/** Parses `clinicalSpecialties` string[] or `providerClinicalSpecialties` object rows. */
function pushUniqueString(
  list: string[],
  seen: Set<string>,
  value: string | undefined,
): void {
  if (!value || seen.has(value)) return;
  seen.add(value);
  list.push(value);
}

function appendClinicalSpecialtyEntry(
  entry: unknown,
  names: string[],
  ids: string[],
  seenNames: Set<string>,
  seenIds: Set<string>,
): void {
  if (typeof entry === "string") {
    pushUniqueString(names, seenNames, entry.trim() || undefined);
    return;
  }
  if (entry == null || typeof entry !== "object") return;

  const row = entry as Record<string, unknown>;
  pushUniqueString(
    names,
    seenNames,
    readOptionalString(row.providerClinicalSpecialtyName) ??
      readOptionalString(row.name),
  );
  pushUniqueString(
    ids,
    seenIds,
    readOptionalString(row.providerClinicalSpecialtyId) ??
      readOptionalString(row.id),
  );
}

function readClinicalSpecialtiesFromApi(item: Record<string, unknown>): {
  names: string[];
  ids: string[];
} {
  const fromStringList = readStringArray(item.clinicalSpecialties);
  if (fromStringList.length > 0) {
    return { names: fromStringList, ids: [] };
  }

  const raw = item.providerClinicalSpecialties;
  if (!Array.isArray(raw)) {
    return { names: [], ids: [] };
  }

  const names: string[] = [];
  const ids: string[] = [];
  const seenNames = new Set<string>();
  const seenIds = new Set<string>();

  for (const entry of raw) {
    appendClinicalSpecialtyEntry(entry, names, ids, seenNames, seenIds);
  }

  return { names, ids };
}

function mapCertificateRow(raw: unknown): ProviderDetailCertificate | null {
  if (raw == null || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const type =
    readOptionalString(row.type) ??
    readOptionalString(row.providerCertificateTypeName);
  if (!type) return null;

  const cert: ProviderDetailCertificate = { type };
  const certificateId =
    readOptionalString(row.certificateId) ??
    readOptionalString(row.providerCertificateId);
  if (certificateId) cert.certificateId = certificateId;
  const description =
    readOptionalString(row.description) ??
    readOptionalString(row.providerCertificateDescription);
  if (description) cert.description = description;
  const status =
    readOptionalString(row.status) ??
    readOptionalString(row.providerCertificateStatus);
  if (status) cert.status = status;
  const validFrom =
    readOptionalString(row.validFrom) ??
    readOptionalString(row.providerCertificateValidFromDate);
  if (validFrom) cert.validFrom = validFrom;
  const validTo =
    readOptionalString(row.validTo) ??
    readOptionalString(row.providerCertificateValidToDate);
  if (validTo) cert.validTo = validTo;
  const registrationNo =
    readOptionalString(row.registrationNo) ??
    readOptionalString(row.providerCertificateRegistrationNumber);
  if (registrationNo) cert.registrationNo = registrationNo;
  const providerActName =
    readOptionalString(row.providerActName) ??
    readOptionalString(row.providerCertificateLevel);
  if (providerActName) cert.providerActName = providerActName;
  const providerActDescription = readOptionalString(row.providerActDescription);
  if (providerActDescription) cert.providerActDescription = providerActDescription;
  const fileMetadataId = readOptionalString(row.fileMetadataId);
  if (fileMetadataId) cert.fileMetadataId = fileMetadataId;
  return cert;
}

function mapRoomDetailList(
  roomDetailListRaw: unknown,
): ProviderDetailInfrastructure["roomDetailList"] {
  const roomDetailList: ProviderDetailInfrastructure["roomDetailList"] = [];
  if (!Array.isArray(roomDetailListRaw)) return roomDetailList;

  for (const row of roomDetailListRaw) {
    if (row == null || typeof row !== "object") continue;
    const bed = row as Record<string, unknown>;
    const providerBedTypeName = readOptionalString(bed.providerBedTypeName);
    const countRaw = bed.providerBedCount;
    const providerBedCount =
      countRaw != null && countRaw !== "" && !Number.isNaN(Number(countRaw))
        ? Number(countRaw)
        : undefined;
    if (providerBedTypeName || providerBedCount !== undefined) {
      roomDetailList.push({ providerBedTypeName, providerBedCount });
    }
  }
  return roomDetailList;
}

function mapInfrastructure(raw: unknown): ProviderDetailInfrastructure | undefined {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const inf = raw as Record<string, unknown>;
  const totalRaw = inf.totalBedCount;
  const totalBedCount =
    totalRaw != null && totalRaw !== "" && !Number.isNaN(Number(totalRaw))
      ? Number(totalRaw)
      : undefined;

  const roomDetailList = mapRoomDetailList(inf.roomDetailList);

  if (totalBedCount === undefined && roomDetailList.length === 0) return undefined;
  return { totalBedCount, roomDetailList };
}

function mapContactDetail(raw: unknown): ProviderContactDetailFromApi | undefined {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const contact = raw as Record<string, unknown>;
  return {
    providerWebsiteAvailableFlag: contact.providerWebsiteAvailableFlag === true,
    providerWebsiteUrl: readNullableString(contact.providerWebsiteUrl),
    providerTelephoneNo: readStringArray(contact.providerTelephoneNo),
    providerFaxNo: readStringArray(contact.providerFaxNo),
    providerMobileNo: readStringArray(contact.providerMobileNo),
    providerEmailId: readStringArray(contact.providerEmailId),
  };
}

function resolveContactDetailFromApi(
  item: Record<string, unknown>,
): ProviderContactDetailFromApi | undefined {
  const nested = mapContactDetail(item.providerContactDetail);
  const rootTelephone = readStringArray(item.providerOfficialTelephone);
  const rootFax = readStringArray(item.providerOfficialFax);
  const rootMobile = readStringArray(item.providerOfficialMobile);
  const rootEmail = readStringArray(item.providerOfficialEmail);
  const rootWebsiteUrl = readNullableString(item.providerWebsiteUrl);
  const hasRootContact =
    rootTelephone.length > 0 ||
    rootFax.length > 0 ||
    rootMobile.length > 0 ||
    rootEmail.length > 0 ||
    Boolean(rootWebsiteUrl);

  if (!nested && !hasRootContact) return undefined;

  return {
    providerWebsiteAvailableFlag:
      nested?.providerWebsiteAvailableFlag ?? Boolean(rootWebsiteUrl),
    providerWebsiteUrl:
      nested?.providerWebsiteUrl ?? (rootWebsiteUrl || null),
    providerTelephoneNo:
      nested?.providerTelephoneNo?.length ? nested.providerTelephoneNo : rootTelephone,
    providerFaxNo: nested?.providerFaxNo?.length ? nested.providerFaxNo : rootFax,
    providerMobileNo:
      nested?.providerMobileNo?.length ? nested.providerMobileNo : rootMobile,
    providerEmailId: nested?.providerEmailId?.length ? nested.providerEmailId : rootEmail,
  };
}

function readAgreementTypeNamesFromApi(item: Record<string, unknown>): string[] {
  if (!Array.isArray(item.agreements)) return [];

  const seen = new Set<string>();
  const names: string[] = [];

  item.agreements.forEach((entry) => {
    if (entry == null || typeof entry !== "object") return;
    const agreementName = readOptionalString(
      (entry as Record<string, unknown>).providerAgreementName,
    );
    if (!agreementName || seen.has(agreementName)) return;
    seen.add(agreementName);
    names.push(agreementName);
  });

  return names;
}

/** Validates GET `/v1/provider/{id}/details` and returns API field names as-is. */
export function resolveProviderDetailsFromApi(raw: unknown): ProviderDetailsFromApi | null {
  if (raw == null || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const providerId = readOptionalString(item.providerId);
  if (!providerId) return null;

  const certificates = Array.isArray(item.certificates)
    ? item.certificates
        .map(mapCertificateRow)
        .filter((row): row is ProviderDetailCertificate => row != null)
    : [];

  const blacklistedByIcNames = Array.isArray(item.blacklistedByIcNames)
    ? readStringArray(item.blacklistedByIcNames)
    : undefined;

  const identifiers = normalizeProviderDetailIdentifiers(item.identifiers);
  const rohiniFromIdentifiers = pickProviderDetailRohiniCode(identifiers);

  const providerIibRohiniCode =
    readOptionalString(item.providerIibRohiniCode) ?? rohiniFromIdentifiers;

  const providerOldCodeFromApi = readNullableString(item.providerOldCode);
  const providerOldCode =
    providerOldCodeFromApi ||
    buildProviderOldCodePayloadFromIdentifiers(identifiers) ||
    null;

  const clinicalSpecialtyParsed = readClinicalSpecialtiesFromApi(item);
  const clinicalSpecialties = clinicalSpecialtyParsed.names;
  const clinicalSpecialtyIds =
    clinicalSpecialtyParsed.ids.length > 0
      ? clinicalSpecialtyParsed.ids
      : undefined;

  const agreementTypeNames = readAgreementTypeNamesFromApi(item);

  return {
    providerId,
    providerName: readOptionalString(item.providerName) ?? "",
    providerType: readOptionalString(item.providerType) ?? "",
    providerTypeId: readOptionalString(item.providerTypeId),
    providerTypeName: readOptionalString(item.providerTypeName),
    providerClass: readOptionalString(item.providerClass),
    providerSubclass: readOptionalString(item.providerSubclass),
    providerCode: readOptionalString(item.providerCode) ?? "",
    providerIibRohiniCode,
    providerOldCode,
    recordStatus: readOptionalString(item.recordStatus) ?? "",
    providerIsVerified: item.providerIsVerified === true,
    providerOwnershipType: readOptionalString(item.providerOwnershipType),
    providerDayCareFlag:
      item.providerDayCareFlag === true || item.providerDaycareHospitalFlag === true,
    providerCareTier: readOptionalString(item.providerCareTier),
    providerInternalGrade: readOptionalString(item.providerInternalGrade),
    providerOwnerName: readOptionalString(item.providerOwnerName),
    providerOwnerDesignation: readOptionalString(item.providerOwnerDesignation),
    providerOwnerQualification: readOptionalString(item.providerOwnerQualification),
    providerSignatoryName: readOptionalString(item.providerSignatoryName),
    providerSignatoryDesignation: readOptionalString(item.providerSignatoryDesignation),
    providerSystemOfMedicineName: readOptionalString(item.providerSystemOfMedicineName),
    providerSystemOfMedicineId: readOptionalString(item.providerSystemOfMedicineId),
    providerEmpanellmentId:
      readOptionalString(item.providerEmpanellmentId) ??
      readOptionalString(
        isApiRecord(item.empanelment)
          ? item.empanelment.providerEmpanellmentId
          : undefined,
      ),
    providerTpaServicingBranchId: readOptionalString(item.providerTpaServicingBranchId),
    providerTpaServicingBranchName: readOptionalString(
      item.providerTpaServicingBranchName ?? item.tpaServicingBranchName,
    ),
    providerTpaServicingBranchCityMappingId:
      readOptionalString(item.providerTpaServicingBranchCityMappingId) ??
      readOptionalString(
        isApiRecord(item.tpaServicingBranch)
          ? item.tpaServicingBranch.providerTpaServicingBranchCityMappingId
          : undefined,
      ),
    providerServiceEmailId: readOptionalString(item.providerServiceEmailId),
    tpaServicingBranchName: readOptionalString(
      item.tpaServicingBranchName ?? item.providerTpaServicingBranchName,
    ),
    tpaServicingBranchEmail: (() => {
      const nestedEmails = isApiRecord(item.tpaServicingBranch)
        ? readStringList(item.tpaServicingBranch.tpaServicingBranchEmail)
        : [];
      const fromApi = readStringList(item.tpaServicingBranchEmail);
      if (nestedEmails.length > 0) return nestedEmails;
      if (fromApi.length > 0) return fromApi;
      return readStringList(item.providerServiceEmailId);
    })(),
    providerAddress: readNestedAddressField(item, "providerAddress"),
    providerAddressId: readNestedAddressField(item, "providerAddressId"),
    providerPlotNo: readNestedAddressField(item, "providerPlotNo"),
    providerLocation: readNestedAddressField(item, "providerLocation"),
    providerTaluka: readNestedAddressField(item, "providerTaluka"),
    providerStateCode: readNestedAddressField(item, "providerStateCode"),
    providerCountryCode: readNestedAddressField(item, "providerCountryCode"),
    providerLatitude: readOptionalNumber(
      item.providerLatitude ??
        (isApiRecord(item.address) ? item.address.providerLatitude : undefined),
    ),
    providerLongitude: readOptionalNumber(
      item.providerLongitude ??
        (isApiRecord(item.address) ? item.address.providerLongitude : undefined),
    ),
    providerAddressStatus: readNestedAddressField(item, "providerAddressStatus"),
    providerCity: readNestedAddressField(item, "providerCity"),
    providerDistrict: readNestedAddressField(item, "providerDistrict"),
    providerStateName: readNestedAddressField(item, "providerStateName"),
    providerZone: readNestedAddressField(item, "providerZone"),
    providerPostalCode: readNestedAddressField(item, "providerPostalCode"),
    providerNetworkType: readNullableString(item.providerNetworkType),
    tpaProviderNetwork: readNullableString(item.tpaProviderNetwork),
    insurerProviderNetwork: readNullableString(item.insurerProviderNetwork),
    providerRegistrationNo: readOptionalString(item.providerRegistrationNo),
    providerRegistrationAuthority: readOptionalString(item.providerRegistrationAuthority),
    providerPanNo: readOptionalString(item.providerPanNo),
    providerPanHolderName: readOptionalString(item.providerPanHolderName),
    providerTanNo: readOptionalString(item.providerTanNo),
    providerContactDetail: resolveContactDetailFromApi(item),
    identifiers,
    certificates,
    clinicalSpecialties,
    clinicalSpecialtyIds,
    infrastructure: mapInfrastructure(item.infrastructure),
    blacklistedByIcNames,
    agreementTypeNames: agreementTypeNames.length > 0 ? agreementTypeNames : undefined,
  };
}
