import type { HospitalDetailRecord } from "../../hospitalData";

export function buildBlacklistedByIcs(
  providerProfile: HospitalDetailRecord | null,
  hospital: HospitalDetailRecord | null,
): string[] {
  if (providerProfile?.blacklistedByIcNames && providerProfile.blacklistedByIcNames.length > 0) {
    return providerProfile.blacklistedByIcNames;
  }
  if (hospital?.blacklistedByIcNames && hospital.blacklistedByIcNames.length > 0) {
    return hospital.blacklistedByIcNames;
  }
  return ["No IC information available"];
}
