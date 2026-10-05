import type { Office, ContactPerson } from "./hierarchyUtils";

interface ApiAddress {
  address?: string;
  city?: string;
  stateName?: string;
  postalCode?: string;
  countryCode?: string;
  addressUse?: string;
  addressType?: string;
}

interface ApiUnderwritingOffice {
  insurerOfficeId: string;
  insurerOfficeCode: string;
  insurerOfficeName: string;
  insurerOfficeType: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  address?: ApiAddress | null;
  serviceAllocation: string;
  serviceTypes?: Array<{
    name: string;
    label: string;
    enabled: boolean;
    startDate: string;
    endDate: string;
  }>;
  assignments?: any;
}

interface ApiDivisionalOffice {
  insurerOfficeId: string | null;
  insurerOfficeCode: string | null;
  insurerOfficeName: string | null;
  insurerOfficeType: string;
  underwritingOffices?: ApiUnderwritingOffice[];
  serviceAllocation: string;
  address?: ApiAddress | null;
  serviceTypes?: Array<{
    name: string;
    label: string;
    enabled: boolean;
    startDate: string;
    endDate: string;
  }>;
  assignments?: any;
}

interface ApiRegionalOffice {
  insurerOfficeId: string | null;
  insurerOfficeCode: string | null;
  insurerOfficeName: string | null;
  insurerOfficeType: string;
  serviceAllocation: string;
  serviceTypes?: Array<{
    name: string;
    label: string;
    enabled: boolean;
    startDate: string;
    endDate: string;
  }>;
  divisionalOffices?: ApiDivisionalOffice[];
  address?: ApiAddress | null;
  assignments?: any;
}

interface ApiParentOffice {
  insurerOfficeId: string;
  insurerOfficeCode: string;
  insurerOfficeName: string;
  insurerOfficeType: string;
  serviceAllocation: string;
  serviceTypes?: Array<{
    name: string;
    label: string;
    enabled: boolean;
    startDate: string;
    endDate: string;
  }>;
  regionalOffices?: ApiRegionalOffice[];
  address?: ApiAddress | null;
  assignments?: any;
}

export interface ApiResponse {
  insurer: any;
  parentOffice: ApiParentOffice[];
}

const mapAddress = (a?: ApiAddress | null) => ({
  address: a?.address,
  city: a?.city,
  state: a?.stateName,
  addressUse: a?.addressUse,
  addressType: a?.addressType,
});


const extractContacts = (
  assignments: any[] | null | undefined,
): ContactPerson[] => {
  if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
    return [];
  }

  const contacts = assignments
    .filter((assignment) => assignment?.contactPerson)
    .map((assignment) => {
      const contactPerson = assignment.contactPerson;
      const channels = assignment.contactChannels || [];

      // Extract email and phone from contactChannels
      const emailChannel = channels.find(
        (ch: any) =>
          ch?.type === "email" &&
          ch?.value &&
          ch?.value !== "NULL" &&
          ch?.value.trim() !== "",
      );
      const phoneChannel = channels.find(
        (ch: any) =>
          (ch?.type === "mobile" || ch?.type === "phone") &&
          ch?.value &&
          ch?.value !== "NULL" &&
          ch?.value.trim() !== "",
      );

      // Build name from available fields
      let name = "Unknown";
      if (contactPerson.fullName) {
        name = contactPerson.fullName.trim();
      } else if (contactPerson.firstName || contactPerson.lastName) {
        name =
          `${contactPerson.firstName || ""} ${contactPerson.lastName || ""}`.trim();
      }

      const contact: ContactPerson = {
        name,
        email: emailChannel?.value?.trim(),
        phone: phoneChannel?.value?.trim(),
        designation: assignment.designation?.trim() || undefined,
      };

      return contact;
    })
    .filter((contact) => {
      return contact.name !== "Unknown" || contact.email || contact.phone;
    });
  return contacts;
};

const transformUO = (uo: ApiUnderwritingOffice): Office => ({
  id: uo.insurerOfficeId,
  office_code: uo.insurerOfficeCode,
  office_name: uo.insurerOfficeName,
  servicing_allocation:
    uo?.serviceAllocation === "corporate" ||
    uo?.serviceAllocation === "retail" ||
    uo?.serviceAllocation === "both"
      ? uo.serviceAllocation
      : undefined,
  serviceTypes: uo?.serviceTypes,
  office_type: "UO",
  status: "active",
  children: [],
  contacts: extractContacts(uo.assignments),
  ...mapAddress(uo.address),
});

const transformDO = (doff: ApiDivisionalOffice): Office[] => {
  const uos =
    doff.underwritingOffices
      ?.filter((uo) => uo.insurerOfficeId)
      .map(transformUO) ?? [];
  if (!doff.insurerOfficeId) {
    return uos;
  }

  return [
    {
      id: doff.insurerOfficeId,
      office_code: doff.insurerOfficeCode!,
      office_name: doff.insurerOfficeName!,
      office_type: doff.insurerOfficeType,
      servicing_allocation:
        doff?.serviceAllocation === "corporate" ||
        doff?.serviceAllocation === "retail" ||
        doff?.serviceAllocation === "both"
          ? doff.serviceAllocation
          : undefined,
      serviceTypes: doff?.serviceTypes,
      status: "active",
      children: uos,
      contacts: extractContacts(doff.assignments),
      ...mapAddress(doff.address),
    },
  ];
};

const transformRO = (ro: ApiRegionalOffice): Office => {
  const children: Office[] = [];

  ro.divisionalOffices?.forEach((d) => {
    children.push(...transformDO(d));
  });

  return {
    id: ro.insurerOfficeId!,
    office_code: ro.insurerOfficeCode!,
    office_name: ro.insurerOfficeName!,
    office_type: ro.insurerOfficeType,
    servicing_allocation:
      ro?.serviceAllocation === "corporate" ||
      ro?.serviceAllocation === "retail" ||
      ro?.serviceAllocation === "both"
        ? ro.serviceAllocation
        : undefined,
    serviceTypes: ro?.serviceTypes,
    status: "active",
    children,
    contacts: extractContacts(ro.assignments),
    ...mapAddress(ro.address),
  };
};

const transformHO = (ho: ApiParentOffice): Office => ({
  id: ho.insurerOfficeId,
  office_code: ho.insurerOfficeCode,
  office_name: ho.insurerOfficeName,
  office_type: ho.insurerOfficeType,
  servicing_allocation:
    ho?.serviceAllocation === "corporate" ||
    ho?.serviceAllocation === "retail" ||
    ho?.serviceAllocation === "both"
      ? ho.serviceAllocation
      : undefined,
  serviceTypes: ho?.serviceTypes,
  status: "active",
  children: ho.regionalOffices?.map(transformRO) ?? [],
  contacts: extractContacts(ho.assignments),
  ...mapAddress(ho.address),
});

export function transformApiResponse(api: ApiResponse): Office[] {
  return api.parentOffice?.map(transformHO) ?? [];
}

export function isApiResponseFormat(data: unknown): data is ApiResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "parentOffice" in data &&
    Array.isArray((data as any).parentOffice)
  );
}
