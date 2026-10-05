import type { InfrastructureFormValues } from "../../../schemas";

/** Standard bed rows for create/edit when API has no dynamic room list. */
export const INFRASTRUCTURE_STANDARD_BED_ROWS = [
  { formKey: "icuBeds", bedTypeName: "ICU Beds", viewLabel: "ICU Beds" },
  { formKey: "ccuBeds", bedTypeName: "ICCU Beds", viewLabel: "CCU Beds" },
  { formKey: "nicuBeds", bedTypeName: "NICU Beds", viewLabel: "NICU Beds" },
  { formKey: "generalBeds", bedTypeName: "General Bed", viewLabel: "General Bed" },
  { formKey: "singleBeds", bedTypeName: "Single Bed", viewLabel: "Single Bed" },
  { formKey: "twinSharing", bedTypeName: "Twin Sharing", viewLabel: "Twin Sharing" },
  { formKey: "suite", bedTypeName: "Suite", viewLabel: "Suite" },
  { formKey: "labourRooms", bedTypeName: "Labour Rooms", viewLabel: "Labour Rooms" },
  { formKey: "majorOt", bedTypeName: "Major OT", viewLabel: "Major OT" },
  { formKey: "minorOt", bedTypeName: "Minor OT", viewLabel: "Minor OT" },
] as const satisfies ReadonlyArray<{
  formKey: keyof Omit<InfrastructureFormValues, "totalBeds">;
  bedTypeName: string;
  viewLabel: string;
}>;

export const EMPTY_INFRASTRUCTURE_FORM: InfrastructureFormValues = {
  totalBeds: "",
  icuBeds: "",
  ccuBeds: "",
  twinSharing: "",
  suite: "",
  labourRooms: "",
  majorOt: "",
  minorOt: "",
  generalBeds: "",
  singleBeds: "",
  nicuBeds: "",
};
