interface MapAssignmentsParams {
  assignments?: any[];
  includeContactPersonId?: boolean;
  includeChannelId?: boolean;
  assignmentId?: boolean;
}
export const mapAssignmentsToContactPersons = ({
  assignments = [],
  includeContactPersonId = false,
  includeChannelId = false,
  assignmentId = false,
}: MapAssignmentsParams) => {
  return assignments?.map((assignment: any) => {
    const person = assignment?.contactPerson ?? {};
        const firstContactRole = assignment?.contactRoles?.[0] ?? {};
    return {
      ...(includeContactPersonId && person?.contactPersonId
        ? { contactPersonId: person.contactPersonId }
        : {}),
      ...(assignmentId && assignment?.assignmentId
        ? { assignmentId: assignment?.assignmentId }
        : {}),

      prefix: person?.prefix ?? "",
      firstName: person?.firstName ?? "",
      middleName: person?.middleName ?? "",
      lastName: person?.lastName ?? "",
      gender: person?.gender ?? "",
      dateOfBirth: person?.dateOfBirth ?? "",
      designation: assignment?.designation ?? "",
      department: assignment?.department ?? "",
      priority: assignment?.priorityRank
        ? String(assignment.priorityRank)
        : "",
      notes: person?.notes ?? "",
domainId: firstContactRole?.domainId ?? "",
      roleId: firstContactRole?.roleId ?? "",
      ...(firstContactRole?.insurerPersonContactRoleId
        ? {
            insurerPersonContactRoleId:
              firstContactRole.insurerPersonContactRoleId,
          }
        : {}),

      contact_type_array:
        assignment?.contactChannels?.length > 0
          ? assignment.contactChannels.map((channel: any) => ({
              type: channel?.type ?? "",
              value: channel?.value ?? "",
              isWhatsappEnabled: channel?.isWhatsappEnabled ?? false,
              ...(includeChannelId && channel?.channelId
                ? { channelId: channel.channelId }
                : {}),
            }))
          : [{ type: "", value: "" }],
    };
  });
};
interface BuildContactPersonPayloadParams {
  formData: any;
  tenantId: string;
  insurerId?: string | null;
}
interface BuildContactPersonPayloadParams {
  formData: any;
  tenantId: string;
  insurerId?: string | null;
  includeContactPersonId?: boolean;
  includeChannelId?: boolean;
  assignmentId?: boolean;
}
export const buildContactPersonRequestList = ({
  formData,
  tenantId,
  insurerId,
  includeContactPersonId = false,
  includeChannelId = false,
  assignmentId = false,
}: BuildContactPersonPayloadParams) => {
  return formData?.map((person: any) => {
    const payload: any = {
      tenantId,
      ...(insurerId
        ? { insurerId: insurerId }
        : {}),
      ...(includeContactPersonId
        ? { contactPersonId: person.contactPersonId }
        : {}),
      ...(assignmentId
        ? { assignmentId: person.assignmentId }
        : {}),

      prefix: person?.prefix ?? "",
      firstName: person?.firstName ?? "",
      contactRoles:[
        {
          domainId: person?.domainId ?? "",
          roleId: person?.roleId ?? "",
          insurerPersonContactRoleId: person?.insurerPersonContactRoleId ?? "",
        }
      ],
      middleName: person?.middleName ?? "",
      lastName: person?.lastName ?? "",
      fullName: `${person?.firstName ?? ""} ${person?.middleName ?? ""} ${person?.lastName ?? ""}`.trim(),

      dateOfBirth: person?.dateOfBirth ?? null,
      gender: person?.gender ?? null,
      notes: person?.notes ?? null,
      designation: person?.designation,
      department: person?.department,
      priority: person.priority?.toString() ?? null,

      contactChannels:
        person?.contact_type_array?.map((contact: any) => ({
          type: contact?.type ?? "",
          value: contact?.value ?? "",
          isWhatsappEnabled: contact?.isWhatsappEnabled ?? false,
          ...(includeChannelId 
            ? { channelId: contact.channelId }
            : {}),
        })) ?? [],
    };

    return payload;
  });
};
const IGNORED_KEYS = ["tenantId"];

export const hasAnyValue = (obj: Record<string, any>): boolean => {
  return Object.entries(obj)?.some(([key, value]) => {
    // Ignore system keys
    if (IGNORED_KEYS?.includes(key)) return false;

    // Handle arrays
    if (Array.isArray(value)) {
      return value?.some((item) => hasAnyValue(item));
    }

    // Handle objects
    if (typeof value === "object" && value !== null) {
      return hasAnyValue(value);
    }

    // Ignore empty values
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      value === false
    ) {
      return false;
    }
    return true;
  });
};


export const buildContactPersonRequestList2 = ({
  formData,
  tenantId,
  insurerId,
  includeContactPersonId = false,
  includeChannelId = false,
  assignmentId = false,
}: BuildContactPersonPayloadParams) => {
  return formData?.contactPersons?.map((person: any) => {
    const payload: any = {
      tenantId,
      ...(insurerId
        ? { insurerId: insurerId }
        : {}),
      ...(includeContactPersonId
        ? { contactPersonId: person.contactPersonId }
        : {}),
      ...(assignmentId
        ? { assignmentId: person.assignmentId }
        : {}),

      prefix: person?.prefix ?? "",
      firstName: person?.firstName ?? "",
      middleName: person?.middleName ?? "",
      lastName: person?.lastName ?? "",
      fullName: `${person?.firstName ?? ""} ${person?.middleName ?? ""} ${person?.lastName ?? ""}`.trim(),

      dateOfBirth: person?.dateOfBirth ?? null,
      gender: person?.gender ?? null,
      notes: person?.notes ?? null,
      designation: person?.designation,
      department: person?.department,
      priority: person.priority?.toString() ?? null,

      contactChannels:
        person?.contact_type_array?.map((contact: any) => ({
          type: contact?.type ?? "",
          value: contact?.value ?? "",
          isWhatsappEnabled: contact?.isWhatsappEnabled ?? false,
          ...(includeChannelId 
            ? { channelId: contact.channelId }
            : {}),
        })) ?? [],
    };

    return payload;
  });
};