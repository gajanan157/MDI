import type { ProviderEquipmentAssetDetail } from "@/store/features/providerInfrastructure/providerInfrastructureTypes";

/** `equipment_type` master (Equipment Type Master). */
export const EQUIPMENT_TYPE_OPTIONS = [
  "MRI Machine",
  "CT Scan",
  "X-Ray Machine",
  "Ultrasound / Sonography",
  "Mammography Unit",
  "C-Arm",
  "Cath Lab",
  "Linear Accelerator (LINAC)",
  "Dialysis Machine",
  "Ventilator",
  "Defibrillator",
  "Anaesthesia Workstation",
  "Patient Monitor",
  "Infusion Pump",
  "ECG Machine",
  "Hematology Analyzer",
  "Biochemistry Analyzer",
  "Autoclave / Sterilizer",
  "OT Light",
  "Boyle's Apparatus",
] as const;

/** `operational_status` master (Operational Status Master). */
export const EQUIPMENT_OPERATIONAL_STATUS_OPTIONS = [
  "Active",
  "Inactive",
  "Under Maintenance",
] as const;

/**
 * RHF row for the equipment asset cards.
 * Numeric/date fields are kept as strings for friendly editing.
 */
export type EquipmentAssetFormRow = {
  rowKey: string;
  providerEquipmentAssetDetailId: string | null;
  equipmentType: string;
  serialNumber: string;
  modelNumber: string;
  quantity: string;
  operationalStatus: string;
  purchaseDate: string;
  installationDate: string;
  validTo: string;
  amcFlag: boolean;
  amcValidFrom: string;
  amcValidTo: string;
  calibrationRequiredFlag: boolean;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  maintenanceDueDate: string;
  supportingDocument: string;
  remarks: string;
  isActive: boolean;
  /** True when the row came from the API. */
  fromApi: boolean;
};

let sequence = 0;

/** Stable unique key — serial number is the natural key, with a fallback. */
export function equipmentAssetRowKey(
  serialNumber: string,
  equipmentType: string,
): string {
  const serial = serialNumber.trim().toLowerCase();
  if (serial) return `sn:${serial}`;
  const type = equipmentType.trim().toLowerCase();
  sequence += 1;
  return `new:${type || "equipment"}:${sequence}`;
}

export type { ProviderEquipmentAssetDetail };
