
export interface SearchFilters {
  officeName: string;
  officeCode: string;
  officeType: string;
  contactPerson: string;
  status: string;
}

export interface ContactPerson {
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
}

export interface Office {
  id: string;
  office_code: string;
  office_name: string;
  office_type: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  address?: string;
  addressUse?: string;
  addressType?: string;
  status?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  contacts?: ContactPerson[];
  children?: Office[];
  // Additional optional properties for demo data
  service_period?: string;
  servicing_allocation?: "corporate" | "retail" | "both";
  serviceTypes?: Array<{
    name: string;
    label: string;
    enabled: boolean;
    startDate: string;
    endDate: string;
  }>;
  image?: string;
}

export interface FlatOffice extends Office {
  level: number;
  parentId?: string;
  parentName?: string;
  hasChildren: boolean;
  isVisible: boolean;
}


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

export const normalizeInsurerHierarchy = (apiData: any[]): Office[] => {
  if (!Array.isArray(apiData)) return [];

  return apiData.map((ho) => ({
    id: ho.insurerOfficeId,
    office_code: ho.insurerOfficeCode,
    office_name: ho.insurerOfficeName,
    office_type: ho.insurerOfficeType,
    servicing_allocation: ho?.serviceAllocation,
    services: ho?.serviceType,
    city: ho.address?.city,
    state: ho.address?.stateName,
    status: "active",
    contacts: extractContacts(ho.assignments),
    children: normalizeRegionalOffices(ho.regionalOffices),
  }));
};

const normalizeRegionalOffices = (ros: any[] = []): Office[] =>
  ros.map((ro) => ({
    id: ro.insurerOfficeId,
    office_code: ro.insurerOfficeCode,
    office_name: ro.insurerOfficeName,
    office_type: ro.insurerOfficeType ?? "RO",
    servicing_allocation: ro?.serviceAllocation,
    services: ro?.serviceType,
    city: ro.address?.city,
    state: ro.address?.stateName,
    status: "active",
    contacts: extractContacts(ro.assignments),
    children: normalizeDivisionalOffices(ro.divisionalOffices),
  }));

const normalizeDivisionalOffices = (dos: any[] = []): Office[] =>
  dos.map((doff) => ({
    id: doff.insurerOfficeId ?? crypto.randomUUID(),
    office_code: doff.insurerOfficeCode ?? "",
    office_name: doff.insurerOfficeName ?? "",
    office_type: doff.insurerOfficeType ?? "DO",
    servicing_allocation: doff?.serviceAllocation,
    services: doff?.serviceType,
    city: doff.address?.city,
    state: doff.address?.stateName,
    status: "active",
    contacts: extractContacts(doff.assignments),
    children: normalizeUnderwritingOffices(doff.underwritingOffices),
  }));

const normalizeUnderwritingOffices = (uos: any[] = []): Office[] =>
  uos.map((uo) => ({
    id: uo.insurerOfficeId,
    office_code: uo.insurerOfficeCode,
    office_name: uo.insurerOfficeName,
    servicing_allocation: uo?.serviceAllocation,
    services: uo?.serviceType,
    office_type: uo.insurerOfficeType ?? "UO",
    city: uo.address?.city,
    state: uo.address?.stateName,
    status: "active",
    contacts: extractContacts(uo.assignments),
    children: [],
  }));


const matchesFilters = (office: Office, filters: SearchFilters): boolean => {
  const nameMatch =
    !filters.officeName ||
    office.office_name.toLowerCase().includes(filters.officeName.toLowerCase());

  const codeMatch =
    !filters.officeCode ||
    office.office_code.toLowerCase().includes(filters.officeCode.toLowerCase());

  const typeMatch =
    !filters.officeType || office.office_type === filters.officeType;

  const contactMatch =
    !filters.contactPerson ||
    office.contacts?.some((c) =>
      c.name.toLowerCase().includes(filters.contactPerson.toLowerCase()),
    );

  const statusMatch =
    !filters.status || (office.status ?? "") === filters.status;

  return Boolean(
    nameMatch && codeMatch && typeMatch && contactMatch && statusMatch,
  );
};

const hasMatchingChild = (office: Office, filters: SearchFilters): boolean =>
  office.children?.some(
    (child) =>
      matchesFilters(child, filters) || hasMatchingChild(child, filters),
  ) ?? false;


export const flattenHierarchy = (
  offices: Office[],
  expandedIds: Set<string>,
  filters: SearchFilters,
  level = 0,
  parentId?: string,
  parentName?: string,
): FlatOffice[] => {
  const result: FlatOffice[] = [];
  const hasActiveFilters = Object.values(filters).some(Boolean);

  offices.forEach((office) => {
    const hasChildren = !!office.children?.length;
    const isExpanded = expandedIds.has(office.id);

    const officeMatches = matchesFilters(office, filters);
    const childMatches = hasMatchingChild(office, filters);

    const shouldShow = !hasActiveFilters || officeMatches || childMatches;

    if (!shouldShow) return;

    result.push({
      ...office,
      level,
      parentId,
      parentName,
      hasChildren,
      isVisible: true,
    });

    if (hasChildren && isExpanded) {
      result.push(
        ...flattenHierarchy(
          office.children!,
          expandedIds,
          filters,
          level + 1,
          office.id,
          office.office_name,
        ),
      );
    }
  });

  return result;
};
