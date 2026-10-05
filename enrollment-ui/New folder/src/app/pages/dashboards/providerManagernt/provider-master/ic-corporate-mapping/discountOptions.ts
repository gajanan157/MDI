/** Discount type dropdown options (after discount document upload). */
export const DISCOUNT_TYPE_OPTIONS = [
  { label: "Select discount type", value: "" },
  { label: "Individual Discount", value: "individual" },
  { label: "Net Bill Discount", value: "netBill" },
  { label: "Approved Amount Discount", value: "approvedAmountDiscount" },
  { label: "Package Discount", value: "package" },
];

/** Same lists as Network Provider SOC → Discount tab. */
export const DISCOUNT_CATEGORY_OPTIONS = [
  { label: "Bed charges", value: "bedCharges" },
  { label: "ICU charges", value: "icuCharges" },
  { label: "Discount on Nursing charges", value: "discountOnNursingCharges" },
  { label: "Discount on total bill", value: "discountOnTotalBill" },
  { label: "Discount on health checkup packages", value: "discountOnHealthCheckupPackages" },
  { label: "Discount on consultation charges", value: "discountOnConsultationCharges" },
  { label: "Discount on investigation", value: "discountOnInvestigation" },
  { label: "Discount on surgical charges", value: "discountOnSurgicalCharges" },
  { label: "Discount on visit charges", value: "discountOnVisitCharges" },
  { label: "Discount on surgeon charges", value: "discountOnSurgeonCharges" },
  { label: "Discount on asst surgeon charges", value: "discountOnAsstSurgeonCharges" },
  { label: "Discount on consumable charges", value: "discountOnConsumableCharges" },
  { label: "Discount on implant charges", value: "discountOnImplantCharges" },
  { label: "Discount on NPPA implant charges", value: "discountOnNppaImplantCharges" },
  { label: "Discount on DAPCCO drug charges", value: "discountOnDapccoDrugCharges" },
  { label: "Discount on blood components", value: "discountOnBloodComponents" },
  { label: "Discount on Anaesthetist charges", value: "discountOnAnaesthetistCharges" },
  { label: "Discount on Medicine discount", value: "discountOnMedicineDiscount" },
  { label: "Discount on IPD", value: "discountOnIpd" },
  { label: "Discount on OPD", value: "discountOnOpd" },
];

/**
 * Multi-select options for discount **Inclusion** / **Exclusion**.
 * Same line-item set as discount categories for consistent UX.
 */
export const DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS = DISCOUNT_CATEGORY_OPTIONS;

/** OPD multiselect (Bulk IC / provider discount). */
export const OPD_LIST_OPTIONS = [
  { label: "Discount on OPD", value: "discountOnOpd" },
  { label: "OPD consultation", value: "opdConsultation" },
  { label: "OPD investigation / diagnostics", value: "opdInvestigation" },
  { label: "OPD pharmacy", value: "opdPharmacy" },
  { label: "OPD minor procedure", value: "opdMinorProcedure" },
  { label: "OPD health checkup", value: "opdHealthCheckup" },
];

/** IPD multiselect — inpatient line items. */
export const IPD_LIST_OPTIONS = [
  { label: "Bed charges", value: "bedCharges" },
  { label: "ICU charges", value: "icuCharges" },
  { label: "Discount on Nursing charges", value: "discountOnNursingCharges" },
  { label: "Discount on total bill", value: "discountOnTotalBill" },
  { label: "Discount on IPD", value: "discountOnIpd" },
  { label: "Discount on surgical charges", value: "discountOnSurgicalCharges" },
  { label: "Discount on investigation", value: "discountOnInvestigation" },
  { label: "Discount on implant charges", value: "discountOnImplantCharges" },
  { label: "Discount on Medicine discount", value: "discountOnMedicineDiscount" },
];

/** Not covered lines — same pool as inclusion/exclusion unless API provides a different list. */
export const NOT_COVERED_LIST_OPTIONS = DISCOUNT_BILL_INCLUSION_EXCLUSION_OPTIONS;

/** @deprecated Use NOT_COVERED_LIST_OPTIONS */
export const ADDITIONAL_DISCOUNT_OPTIONS = NOT_COVERED_LIST_OPTIONS;

export const DISCOUNT_APPLICABLE_ON_OPTIONS = [
  { label: "Select", value: "" },
  { label: "PPN SOC", value: "ppnSoc" },
  { label: "Private Ic SOC", value: "billAmount" },
  { label: "Non PPN Package", value: "roomRent" },
  { label: "No Package", value: "roomRent" },
];

/** Hospital billing components for individual discount rows. */
export const DISCOUNT_COMPONENT_OPTIONS = [
  { label: "Select component", value: "" },
  { label: "Room Rent", value: "roomRent" },
  { label: "ICU Bed", value: "icuBed" },
  { label: "Consultation", value: "consultation" },
  { label: "Investigation", value: "investigation" },
  { label: "Procedure", value: "procedure" },
  { label: "OT Charges", value: "otCharges" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Implants", value: "implants" },
];

/** Per-component applicable-on options (individual discount rows). */
export const DISCOUNT_COMPONENT_APPLICABLE_ON_OPTIONS = [
  { label: "Select", value: "" },
  { label: "Approved Amount", value: "approvedAmount" },
  { label: "PPN SOC", value: "ppnSoc" },
  { label: "Private Ic SOC", value: "billAmount" },
];
