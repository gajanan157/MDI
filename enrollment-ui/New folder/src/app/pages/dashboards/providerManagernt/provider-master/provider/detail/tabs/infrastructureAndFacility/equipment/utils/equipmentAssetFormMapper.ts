import type {
  ProviderEquipmentAssetDetail,
  ProviderInfrastructure,
} from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import {
  equipmentAssetRowKey,
  type EquipmentAssetFormRow,
} from "./equipmentAssetTypes";

function numToStr(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

function strToNum(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function rowFromApi(row: ProviderEquipmentAssetDetail): EquipmentAssetFormRow {
  return {
    rowKey: equipmentAssetRowKey(row.serialNumber, row.equipmentType),
    providerEquipmentAssetDetailId: row.providerEquipmentAssetDetailId ?? null,
    equipmentType: row.equipmentType,
    serialNumber: row.serialNumber,
    modelNumber: row.modelNumber,
    quantity: numToStr(row.quantity),
    operationalStatus: row.operationalStatus,
    purchaseDate: row.purchaseDate,
    installationDate: row.installationDate,
    validTo: row.validTo,
    amcFlag: row.amcFlag,
    amcValidFrom: row.amcValidFrom,
    amcValidTo: row.amcValidTo,
    calibrationRequiredFlag: row.calibrationRequiredFlag,
    lastCalibrationDate: row.lastCalibrationDate,
    nextCalibrationDate: row.nextCalibrationDate,
    maintenanceDueDate: row.maintenanceDueDate,
    supportingDocument: row.supportingDocument,
    remarks: row.remarks,
    isActive: row.isActive,
    fromApi: true,
  };
}

export function createEmptyEquipmentAssetFormRow(
  equipmentType: string,
): EquipmentAssetFormRow {
  return {
    rowKey: equipmentAssetRowKey("", equipmentType),
    providerEquipmentAssetDetailId: null,
    equipmentType,
    serialNumber: "",
    modelNumber: "",
    quantity: "1",
    operationalStatus: "Active",
    purchaseDate: "",
    installationDate: "",
    validTo: "",
    amcFlag: false,
    amcValidFrom: "",
    amcValidTo: "",
    calibrationRequiredFlag: false,
    lastCalibrationDate: "",
    nextCalibrationDate: "",
    maintenanceDueDate: "",
    supportingDocument: "",
    remarks: "",
    isActive: true,
    fromApi: false,
  };
}

/** Demo rows shown until the equipment-asset API is live. */
const DUMMY_EQUIPMENT: Partial<ProviderEquipmentAssetDetail>[] = [
  {
    equipmentType: "MRI Machine",
    serialNumber: "MRI-SIE-2019-4471",
    modelNumber: "Magnetom Aera 1.5T",
    quantity: 1,
    operationalStatus: "Active",
    purchaseDate: "2019-02-18",
    installationDate: "2019-04-05",
    validTo: "2027-04-04",
    amcFlag: true,
    amcValidFrom: "2024-04-05",
    amcValidTo: "2026-04-04",
    calibrationRequiredFlag: true,
    lastCalibrationDate: "2025-05-12",
    nextCalibrationDate: "2026-05-11",
    maintenanceDueDate: "2026-01-15",
    remarks: "AERB licensed installation",
  },
  {
    equipmentType: "CT Scan",
    serialNumber: "CT-GE-2021-8890",
    modelNumber: "Revolution EVO 128-slice",
    quantity: 1,
    operationalStatus: "Active",
    purchaseDate: "2021-07-09",
    installationDate: "2021-08-20",
    validTo: "2026-08-19",
    amcFlag: true,
    amcValidFrom: "2024-08-20",
    amcValidTo: "2025-08-19",
    calibrationRequiredFlag: true,
    lastCalibrationDate: "2025-03-01",
    nextCalibrationDate: "2026-03-01",
    maintenanceDueDate: "2025-12-01",
  },
  {
    equipmentType: "Ventilator",
    serialNumber: "VENT-DR-2020-1123",
    modelNumber: "Dräger Evita V300",
    quantity: 12,
    operationalStatus: "Active",
    purchaseDate: "2020-05-14",
    installationDate: "2020-05-25",
    validTo: "",
    amcFlag: true,
    amcValidFrom: "2024-05-25",
    amcValidTo: "2026-05-24",
    calibrationRequiredFlag: true,
    lastCalibrationDate: "2025-06-10",
    nextCalibrationDate: "2026-06-10",
    maintenanceDueDate: "2026-03-01",
  },
  {
    equipmentType: "Defibrillator",
    serialNumber: "DEF-PHIL-2022-5567",
    modelNumber: "HeartStart XL+",
    quantity: 8,
    operationalStatus: "Active",
    purchaseDate: "2022-01-30",
    installationDate: "2022-02-08",
    validTo: "",
    amcFlag: false,
    calibrationRequiredFlag: true,
    lastCalibrationDate: "2024-11-20",
    nextCalibrationDate: "2025-11-20",
    maintenanceDueDate: "2025-10-01",
  },
  {
    equipmentType: "Hematology Analyzer",
    serialNumber: "HEM-SYS-2023-3341",
    modelNumber: "Sysmex XN-1000",
    quantity: 2,
    operationalStatus: "Active",
    purchaseDate: "2023-03-22",
    installationDate: "2023-04-10",
    validTo: "",
    amcFlag: true,
    amcValidFrom: "2025-04-10",
    amcValidTo: "2027-04-09",
    calibrationRequiredFlag: true,
    lastCalibrationDate: "2025-07-01",
    nextCalibrationDate: "2026-01-01",
    maintenanceDueDate: "2026-02-15",
  },
  {
    equipmentType: "Dialysis Machine",
    serialNumber: "DIA-FRE-2021-9987",
    modelNumber: "Fresenius 4008S",
    quantity: 10,
    operationalStatus: "Under Maintenance",
    purchaseDate: "2021-09-01",
    installationDate: "2021-09-18",
    validTo: "",
    amcFlag: true,
    amcValidFrom: "2024-09-18",
    amcValidTo: "2025-09-17",
    calibrationRequiredFlag: false,
    maintenanceDueDate: "2025-11-30",
    remarks: "2 units awaiting spare parts",
  },
  {
    equipmentType: "C-Arm",
    serialNumber: "CARM-ZIE-2018-2205",
    modelNumber: "Ziehm Vision RFD",
    quantity: 1,
    operationalStatus: "Inactive",
    purchaseDate: "2018-06-11",
    installationDate: "2018-07-02",
    validTo: "2025-07-01",
    amcFlag: false,
    calibrationRequiredFlag: true,
    lastCalibrationDate: "2023-08-15",
    nextCalibrationDate: "2024-08-15",
    maintenanceDueDate: "2024-09-01",
    remarks: "Pending AERB renewal",
  },
];

function dummyEquipmentRows(): EquipmentAssetFormRow[] {
  return DUMMY_EQUIPMENT.map((partial) =>
    rowFromApi({
      providerEquipmentAssetDetailId: null,
      equipmentType: "",
      serialNumber: "",
      modelNumber: "",
      quantity: null,
      operationalStatus: "Active",
      purchaseDate: "",
      installationDate: "",
      validTo: "",
      amcFlag: false,
      amcValidFrom: "",
      amcValidTo: "",
      calibrationRequiredFlag: false,
      lastCalibrationDate: "",
      nextCalibrationDate: "",
      maintenanceDueDate: "",
      supportingDocument: "",
      remarks: "",
      isActive: true,
      ...partial,
    }),
  ).map((row) => ({ ...row, fromApi: false }));
}

/** API rows → RHF form rows. Falls back to demo rows when the API has none. */
export function equipmentAssetFormRowsFromApi(
  infrastructure: ProviderInfrastructure | null | undefined,
): EquipmentAssetFormRow[] {
  const apiRows = (infrastructure?.equipmentAssetList ?? []).map(rowFromApi);
  return apiRows.length > 0 ? apiRows : dummyEquipmentRows();
}

export function equipmentAssetPatchPayloadFromForm(
  rows: EquipmentAssetFormRow[],
): ProviderEquipmentAssetDetail[] {
  return rows
    .filter((row) => row.equipmentType.trim())
    .map((row) => ({
      providerEquipmentAssetDetailId: row.providerEquipmentAssetDetailId ?? null,
      equipmentType: row.equipmentType.trim(),
      serialNumber: row.serialNumber.trim(),
      modelNumber: row.modelNumber.trim(),
      quantity: strToNum(row.quantity),
      operationalStatus: row.operationalStatus.trim(),
      purchaseDate: row.purchaseDate.trim(),
      installationDate: row.installationDate.trim(),
      validTo: row.validTo.trim(),
      amcFlag: row.amcFlag,
      amcValidFrom: row.amcFlag ? row.amcValidFrom.trim() : "",
      amcValidTo: row.amcFlag ? row.amcValidTo.trim() : "",
      calibrationRequiredFlag: row.calibrationRequiredFlag,
      lastCalibrationDate: row.calibrationRequiredFlag
        ? row.lastCalibrationDate.trim()
        : "",
      nextCalibrationDate: row.calibrationRequiredFlag
        ? row.nextCalibrationDate.trim()
        : "",
      maintenanceDueDate: row.maintenanceDueDate.trim(),
      supportingDocument: row.supportingDocument.trim(),
      remarks: row.remarks.trim(),
      isActive: row.isActive,
    }));
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Days until (positive) / since (negative) a date, or null when unparseable. */
export function daysUntil(value: string, now: Date = new Date()): number | null {
  const date = parseDate(value);
  if (!date) return null;
  return Math.round((date.getTime() - now.getTime()) / DAY_MS);
}

export type EquipmentAssetAlert = {
  level: "danger" | "warning";
  label: string;
};

const EQUIPMENT_ALERT_SOON_DAYS = 30;

/** danger when a date has passed, warning when it falls within the soon window. */
function expiryAlert(
  value: string,
  now: Date,
  expiredLabel: string,
  dueLabel: (days: number) => string,
): EquipmentAssetAlert | null {
  const days = daysUntil(value, now);
  if (days == null) return null;
  if (days < 0) return { level: "danger", label: expiredLabel };
  if (days <= EQUIPMENT_ALERT_SOON_DAYS) {
    return { level: "warning", label: dueLabel(days) };
  }
  return null;
}

/** Lifecycle alerts (expiry / overdue) surfaced on the card. */
export function equipmentAssetAlerts(
  row: EquipmentAssetFormRow,
  now: Date = new Date(),
): EquipmentAssetAlert[] {
  const candidates: Array<EquipmentAssetAlert | null> = [
    expiryAlert(
      row.validTo,
      now,
      "Licence expired",
      (d) => `Licence expires in ${d}d`,
    ),
    row.amcFlag
      ? expiryAlert(row.amcValidTo, now, "AMC expired", (d) => `AMC expires in ${d}d`)
      : null,
    row.calibrationRequiredFlag
      ? expiryAlert(
          row.nextCalibrationDate,
          now,
          "Calibration overdue",
          (d) => `Calibration due in ${d}d`,
        )
      : null,
    expiryAlert(
      row.maintenanceDueDate,
      now,
      "Maintenance overdue",
      (d) => `Maintenance due in ${d}d`,
    ),
  ];

  return candidates.filter(
    (alert): alert is EquipmentAssetAlert => alert !== null,
  );
}

/** Field-consistency warnings (bad date ordering, missing serial). */
export function equipmentAssetRowWarning(
  row: EquipmentAssetFormRow,
): string | null {
  if (!row.serialNumber.trim()) return "Serial number is required";

  const purchase = parseDate(row.purchaseDate);
  const install = parseDate(row.installationDate);
  if (purchase && install && install.getTime() < purchase.getTime()) {
    return "Installation date is before the purchase date";
  }

  if (row.amcFlag) {
    const from = parseDate(row.amcValidFrom);
    const to = parseDate(row.amcValidTo);
    if (from && to && to.getTime() < from.getTime()) {
      return "AMC valid-to is before valid-from";
    }
  }

  if (row.calibrationRequiredFlag) {
    const last = parseDate(row.lastCalibrationDate);
    const next = parseDate(row.nextCalibrationDate);
    if (last && next && next.getTime() < last.getTime()) {
      return "Next calibration is before the last calibration";
    }
  }
  return null;
}

/** Human-friendly date display, e.g. "05 Apr 2019". */
export function formatDisplayDate(value: string): string {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
