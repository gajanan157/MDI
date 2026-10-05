import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import type { Path, Resolver, UseFormSetError } from "react-hook-form";
import {
  extractApiFieldErrors,
  normalizeApiErrorBody,
} from "@/app/api/apiService";
import type { CreateProviderBody } from "@/store/features/provider/providerTypes";
import {
  ALPHABET_ONLY_PATTERN,
  ALPHABET_ONLY_VALIDATION_MESSAGE,
} from "@/utils/alphabetOnlyInput";
import {
  getE164PhonePartsValidationMessage,
  getEmailPartsValidationMessage,
  getMobilePartsValidationMessage,
  getTelephonePartsValidationMessage,
  splitMultiValueContactParts,
} from "../detail/schemas/viewHospitalSchemas";
import { DEFAULT_PROVIDER_TYPE } from "../detail/tabs/providerDetails/options";

/** Form field keys — map 1:1 to POST `/v1/provider` camelCase body. */
export const ADD_PROVIDER_FIELD_KEYS = {
  providerName: "providerName",
  /** Locked display type (e.g. HOSPITAL) — not sent on create. */
  providerType: "providerType",
  /** Provider Category from `/v1/provider-type-master` (value = providerTypeId). */
  providerTypeId: "providerTypeId",
  providerNetworkType: "providerNetworkType",
  insurerIds: "insurerIds",
  providerRohiniNumber: "providerRohiniNumber",
  providerClinicalSpecialityIds: "providerClinicalSpecialityIds",
  providerOwnershipType: "providerOwnershipType",
  providerPanNo: "providerPanNo",
  providerWebsiteUrl: "providerWebsiteUrl",
  providerOfficialContactMobileNo: "providerOfficialContactMobileNo",
  providerOfficialContactTelephoneNo: "providerOfficialContactTelephoneNo",
  providerOfficialFaxNo: "providerOfficialFaxNo",
  providerOfficialContactEmailId: "providerOfficialContactEmailId",
  providerAddress: "providerAddress",
  providerCity: "providerCity",
  providerStateName: "providerStateName",
  providerDistrict: "providerDistrict",
  providerPostalCode: "providerPostalCode",
} as const;

export type AddProviderNetworkType = "NETWORK" | "NON_NETWORK";

const K = ADD_PROVIDER_FIELD_KEYS;

/** POST `/v1/provider` — 13-digit Rohini number. */
const ROHINI_NUMBER_REGEX = /^\d{13}$/;

/** Same PAN format as Banking Details tab: 5 letters + 4 digits + 1 letter. */
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;

/** India pin code: exactly 6 digits. */
const PIN_REGEX = /^\d{6}$/;

function optionalUpperTrim(value: string | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

export type AddProviderFormValues = {
  providerName: string;
  providerType: string;
  providerTypeId: string;
  providerNetworkType: AddProviderNetworkType | "";
  insurerIds: string[];
  providerRohiniNumber: string;
  providerClinicalSpecialityIds: string[];
  providerOwnershipType: string;
  providerPanNo: string;
  providerWebsiteUrl: string;
  providerOfficialContactMobileNo: string;
  providerOfficialContactTelephoneNo: string;
  providerOfficialFaxNo: string;
  providerOfficialContactEmailId: string;
  providerAddress: string;
  providerCity: string;
  providerStateName: string;
  providerDistrict: string;
  providerPostalCode: string;
};

export const ADD_PROVIDER_DEFAULT_VALUES: AddProviderFormValues = {
  [K.providerName]: "",
  [K.providerType]: DEFAULT_PROVIDER_TYPE,
  [K.providerTypeId]: "",
  [K.providerNetworkType]: "",
  [K.insurerIds]: [],
  [K.providerRohiniNumber]: "",
  [K.providerClinicalSpecialityIds]: [],
  [K.providerOwnershipType]: "",
  [K.providerPanNo]: "",
  [K.providerWebsiteUrl]: "",
  [K.providerOfficialContactMobileNo]: "",
  [K.providerOfficialContactTelephoneNo]: "",
  [K.providerOfficialFaxNo]: "",
  [K.providerOfficialContactEmailId]: "",
  [K.providerAddress]: "",
  [K.providerCity]: "",
  [K.providerStateName]: "",
  [K.providerDistrict]: "",
  [K.providerPostalCode]: "",
};

export const addProviderSchema: Yup.ObjectSchema<AddProviderFormValues> = Yup.object({
  providerName: Yup.string()
    .trim()
    .required("Provider Name is required")
    .max(255, "Provider Name must be at most 255 characters"),
  providerType: Yup.string().trim().default(DEFAULT_PROVIDER_TYPE),
  providerTypeId: Yup.string().trim().required("Provider Category is required"),
  providerNetworkType: Yup.string()
    .trim()
    .oneOf(["NETWORK", "NON_NETWORK"], "Select Network or Non-Network Provider")
    .required("Provider Network Type is required"),
  insurerIds: Yup.array()
    .of(Yup.string().defined())
    .default([])
    .defined()
    .when("providerNetworkType", {
      is: "NETWORK",
      then: (schema) =>
        schema.min(1, "Select at least one Insurance Company"),
    }),
  providerRohiniNumber: Yup.string()
    .trim()
    .default("")
    .when("providerNetworkType", {
      is: "NETWORK",
      then: (schema) =>
        schema
          .required("Rohini Number is required for Network Providers")
          .matches(ROHINI_NUMBER_REGEX, "Enter a valid 13-digit Rohini number"),
      otherwise: (schema) =>
        schema.matches(ROHINI_NUMBER_REGEX, {
          message: "Enter a valid 13-digit Rohini number",
          excludeEmptyString: true,
        }),
    }),
  providerClinicalSpecialityIds: Yup.array()
    .of(Yup.string().defined())
    .default([])
    .defined(),
  providerOwnershipType: Yup.string().trim().default(""),
  providerPanNo: Yup.string()
    .trim()
    .default("")
    .test("pan-format", "Enter a valid PAN (e.g. ABCDE1234F)", (value) => {
      const pan = optionalUpperTrim(value);
      if (!pan) return true;
      return PAN_REGEX.test(pan);
    }),
  providerWebsiteUrl: Yup.string()
    .trim()
    .default("")
    .test("website-url", "Enter a valid URL", (value) => {
      const url = (value ?? "").trim();
      if (!url) return true;
      const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      return Yup.string().url().isValidSync(withProtocol);
    }),
  providerOfficialContactMobileNo: Yup.string()
    .trim()
    .required("Mobile No is required")
    .test("mobile", "", function (value) {
      const msg = getMobilePartsValidationMessage(
        splitMultiValueContactParts(value ?? ""),
      );
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  providerOfficialContactTelephoneNo: Yup.string()
    .trim()
    .default("")
    .test("telephone", "", function (value) {
      const msg = getTelephonePartsValidationMessage(
        splitMultiValueContactParts(value ?? ""),
      );
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  providerOfficialFaxNo: Yup.string()
    .trim()
    .default("")
    .test("fax", "", function (value) {
      const msg = getE164PhonePartsValidationMessage(
        splitMultiValueContactParts(value ?? ""),
      );
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  providerOfficialContactEmailId: Yup.string()
    .trim()
    .required("Email is required")
    .test("email", "", function (value) {
      const msg = getEmailPartsValidationMessage([value ?? ""]);
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  providerAddress: Yup.string().trim().required("Address is required"),
  providerPostalCode: Yup.string()
    .trim()
    .required("Pincode is required")
    .matches(PIN_REGEX, "Pincode must be a valid 6-digit number"),
  providerCity: Yup.string().trim().required("City is required"),
  providerStateName: Yup.string().trim().required("State is required"),
  providerDistrict: Yup.string()
    .trim()
    .required("District is required")
    .test("district-alphabet", ALPHABET_ONLY_VALIDATION_MESSAGE, (value) => {
      const district = (value ?? "").trim();
      if (!district) return true;
      return ALPHABET_ONLY_PATTERN.test(district);
    }),
});

export const addProviderFormResolver: Resolver<AddProviderFormValues> = yupResolver(
  addProviderSchema,
) as unknown as Resolver<AddProviderFormValues>;

function trimOrEmpty(value: string): string {
  return String(value ?? "").trim();
}

function toOptionalString(value: string): string | undefined {
  const trimmed = trimOrEmpty(value);
  return trimmed !== "" ? trimmed : undefined;
}

function toOptionalIdList(value: string[] | undefined): string[] | undefined {
  const ids = (value ?? []).map((id) => String(id).trim()).filter(Boolean);
  return ids.length > 0 ? ids : undefined;
}

function toApiNetworkType(value: string): AddProviderNetworkType {
  return value === "NON_NETWORK" ? "NON_NETWORK" : "NETWORK";
}

function toNetworkInsurerIds(
  networkType: AddProviderNetworkType,
  insurerIds: string[] | undefined,
): string[] | undefined {
  if (networkType !== "NETWORK") return undefined;
  return toOptionalIdList(insurerIds);
}

type OptionalCreateProviderFields = Omit<
  CreateProviderBody,
  "providerName" | "providerTypeId" | "providerNetworkType"
>;

function pickDefinedFields(
  source: OptionalCreateProviderFields,
): Partial<OptionalCreateProviderFields> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined),
  ) as Partial<OptionalCreateProviderFields>;
}

/** Normalize to 10-digit Indian mobile when possible (API rejects leading 0 / +91). */
function normalizeMobileForApi(value: string): string {
  let compact = trimOrEmpty(value).replace(/[\s-]/g, "");
  if (compact.startsWith("+91")) compact = compact.slice(3);
  else if (compact.startsWith("91") && compact.length === 12) compact = compact.slice(2);
  else if (compact.startsWith("0") && compact.length === 11) compact = compact.slice(1);
  return compact;
}

function toOptionalStringArray(value: string): string[] | undefined {
  const trimmed = trimOrEmpty(value);
  if (!trimmed) return undefined;
  return [trimmed];
}

function toOptionalMobileArray(value: string): string[] | undefined {
  const normalized = normalizeMobileForApi(value);
  return normalized !== "" ? [normalized] : undefined;
}

function mapOwnershipTypeToApi(value: string): string | undefined {
  const trimmed = trimOrEmpty(value);
  if (!trimmed) return undefined;
  const upper = trimmed.toUpperCase();
  if (upper === "PRIVATE" || upper === "PUBLIC") return upper;
  if (trimmed.toLowerCase() === "private") return "PRIVATE";
  if (trimmed.toLowerCase() === "public") return "PUBLIC";
  return upper;
}

/** Builds POST `/v1/provider` body matching the create-provider API contract. */
export function buildAddProviderCreateBody(
  values: AddProviderFormValues,
): CreateProviderBody {
  const networkType = toApiNetworkType(trimOrEmpty(values.providerNetworkType));
  return {
    providerName: trimOrEmpty(values.providerName),
    providerTypeId: trimOrEmpty(values.providerTypeId),
    providerNetworkType: networkType,
    ...pickDefinedFields({
      insurerIds: toNetworkInsurerIds(networkType, values.insurerIds),
      providerRohiniNumber: toOptionalString(values.providerRohiniNumber),
      providerClinicalSpecialityIds: toOptionalIdList(
        values.providerClinicalSpecialityIds,
      ),
      providerOwnershipType: mapOwnershipTypeToApi(values.providerOwnershipType),
      providerPanNo: toOptionalString(optionalUpperTrim(values.providerPanNo)),
      providerWebsiteUrl: toOptionalString(values.providerWebsiteUrl),
      providerOfficialContactMobileNo: toOptionalMobileArray(
        values.providerOfficialContactMobileNo,
      ),
      providerOfficialContactTelephoneNo: toOptionalStringArray(
        values.providerOfficialContactTelephoneNo,
      ),
      providerOfficialFaxNo: toOptionalStringArray(values.providerOfficialFaxNo),
      providerOfficialContactEmailId: toOptionalStringArray(
        values.providerOfficialContactEmailId,
      ),
      providerAddress: toOptionalString(values.providerAddress),
      providerCity: toOptionalString(values.providerCity),
      providerStateName: toOptionalString(values.providerStateName),
      providerDistrict: toOptionalString(values.providerDistrict),
      providerPostalCode: toOptionalString(values.providerPostalCode),
    }),
  };
}

const ADD_PROVIDER_API_FIELD_MAP: Record<string, Path<AddProviderFormValues>> = {
  providerName: K.providerName,
  providerTypeId: K.providerTypeId,
  providerNetworkType: K.providerNetworkType,
  insurerIds: K.insurerIds,
  providerRohiniNumber: K.providerRohiniNumber,
  providerRohiniCode: K.providerRohiniNumber,
  rohiniNumber: K.providerRohiniNumber,
  rohiniId: K.providerRohiniNumber,
  providerClinicalSpecialityIds: K.providerClinicalSpecialityIds,
  providerOwnershipType: K.providerOwnershipType,
  providerPanNo: K.providerPanNo,
  providerWebsiteUrl: K.providerWebsiteUrl,
  providerOfficialContactMobileNo: K.providerOfficialContactMobileNo,
  "providerOfficialContactMobileNo[0]": K.providerOfficialContactMobileNo,
  providerOfficialContactTelephoneNo: K.providerOfficialContactTelephoneNo,
  "providerOfficialContactTelephoneNo[0]": K.providerOfficialContactTelephoneNo,
  providerOfficialFaxNo: K.providerOfficialFaxNo,
  "providerOfficialFaxNo[0]": K.providerOfficialFaxNo,
  providerOfficialContactEmailId: K.providerOfficialContactEmailId,
  "providerOfficialContactEmailId[0]": K.providerOfficialContactEmailId,
  providerAddress: K.providerAddress,
  providerCity: K.providerCity,
  providerStateName: K.providerStateName,
  providerDistrict: K.providerDistrict,
  providerPostalCode: K.providerPostalCode,
};

const MESSAGE_FIELD_HINTS: Array<{
  pattern: RegExp;
  field: Path<AddProviderFormValues>;
}> = [
  { pattern: /network\s*type|non[-\s]?network/i, field: K.providerNetworkType },
  { pattern: /rohini/i, field: K.providerRohiniNumber },
  { pattern: /mobile/i, field: K.providerOfficialContactMobileNo },
  { pattern: /telephone|phone/i, field: K.providerOfficialContactTelephoneNo },
  { pattern: /\bfax\b/i, field: K.providerOfficialFaxNo },
  { pattern: /email/i, field: K.providerOfficialContactEmailId },
  { pattern: /\bpan\b/i, field: K.providerPanNo },
  { pattern: /postal|pincode|pin\s*code/i, field: K.providerPostalCode },
];

function resolveFormField(apiKey: string): Path<AddProviderFormValues> | undefined {
  return (
    ADD_PROVIDER_API_FIELD_MAP[apiKey] ??
    ADD_PROVIDER_API_FIELD_MAP[apiKey.replace(/\[\d+\]$/, "")]
  );
}

function resolveFieldFromMessage(
  message: string,
): Path<AddProviderFormValues> | undefined {
  for (const hint of MESSAGE_FIELD_HINTS) {
    if (hint.pattern.test(message)) return hint.field;
  }
  return undefined;
}

function readApiErrorMessage(apiResponse: {
  errorPayload?: unknown;
  message?: string | null;
  error?: string | null;
}): string {
  const fromPayload = normalizeApiErrorBody(apiResponse.errorPayload, "");
  if (fromPayload.trim()) return fromPayload.trim();
  if (typeof apiResponse.message === "string" && apiResponse.message.trim()) {
    return apiResponse.message.trim();
  }
  if (typeof apiResponse.error === "string" && apiResponse.error.trim()) {
    return apiResponse.error.trim();
  }
  return "";
}

/**
 * Apply create-provider API errors onto RHF as under-field messages.
 * Returns true when at least one field error was applied.
 */
export function applyAddProviderApiFieldErrors(
  apiResponse: {
    errorPayload?: unknown;
    fields?: Record<string, string>;
    message?: string | null;
    error?: string | null;
  },
  setError: UseFormSetError<AddProviderFormValues>,
): boolean {
  const fromPayload = extractApiFieldErrors(apiResponse.errorPayload);
  const fieldErrors = apiResponse.fields
    ? { ...fromPayload, ...apiResponse.fields }
    : fromPayload;

  let applied = false;
  for (const [apiKey, message] of Object.entries(fieldErrors)) {
    if (!message?.trim()) continue;
    const formField = resolveFormField(apiKey);
    if (!formField) continue;
    setError(
      formField,
      { type: "server", message },
      { shouldFocus: !applied },
    );
    applied = true;
  }
  if (applied) return true;

  const message = readApiErrorMessage(apiResponse);
  if (!message) return false;

  const formField = resolveFieldFromMessage(message);
  if (!formField) return false;

  setError(formField, { type: "server", message }, { shouldFocus: true });
  return true;
}
