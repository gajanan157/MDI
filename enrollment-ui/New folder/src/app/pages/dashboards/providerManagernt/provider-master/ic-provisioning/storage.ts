import type { NewConfigurationFormValues } from "./config";
import { CONFIG_TYPE_OPTIONS, normalizeFormValues } from "./config";
import { IC_PROVISION_ROWS, type IcProvisionRow } from "./dummyData";

const STORAGE_KEY = "provider-ic-provisioning-rows";

function inferFormValues(row: IcProvisionRow): NewConfigurationFormValues {
  const configTypeValue =
    CONFIG_TYPE_OPTIONS.find(
      (option) =>
        option.label === row.configType ||
        option.label.replace("Provider ", "") === row.configType,
    )?.value ?? "CODE_MAPPING";

  const matchingFields = row.matchingFields.toUpperCase();
  const documentTypes = row.fileType
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  return normalizeFormValues({
    configType: [configTypeValue],
    documentType: documentTypes.length ? documentTypes : ["CSV"],
    frequency: row.frequency.toUpperCase() === "DAILY" ? "DAILY" : row.frequency,
    passwordProtected: row.passwordProtected,
    insuranceCompany: row.formValues?.insuranceCompany ?? [],
    matchingPan: matchingFields.includes("PAN"),
    matchingRohini: matchingFields.includes("ROHINI"),
    commMode: row.commMode,
    newIcFromMaster: row.formValues?.newIcFromMaster ?? [],
  });
}

function seedRows(): IcProvisionRow[] {
  return IC_PROVISION_ROWS.map((row) => ({
    ...row,
    formValues: row.formValues ?? inferFormValues(row),
  }));
}

export function loadIcProvisionRows(): IcProvisionRow[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedRows();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as IcProvisionRow[];
  } catch {
    return seedRows();
  }
}

export function saveIcProvisionRows(rows: IcProvisionRow[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function getIcProvisionRowById(id: string): IcProvisionRow | undefined {
  return loadIcProvisionRows().find((row) => row.id === id);
}

export function upsertIcProvisionRow(row: IcProvisionRow) {
  const rows = loadIcProvisionRows();
  const index = rows.findIndex((item) => item.id === row.id);
  if (index >= 0) {
    rows[index] = row;
  } else {
    rows.unshift(row);
  }
  saveIcProvisionRows(rows);
}
