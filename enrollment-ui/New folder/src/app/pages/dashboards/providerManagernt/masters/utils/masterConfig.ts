const DEFAULT_DESCRIPTION_LABEL = "Description";

function defineProviderMaster<const K extends string>(
  key: K,
  title: string,
  codeLabel: string,
  nameLabel: string,
  descriptionLabel: string = DEFAULT_DESCRIPTION_LABEL,
) {
  return { key, title, codeLabel, nameLabel, descriptionLabel };
}

const PROVIDER_MASTER_CONFIG_DEFS = [
  defineProviderMaster("gipsa_ppn_city_master", "GIPSA PPN City Master", "City Code", "City Name"),
  defineProviderMaster("provider_act_master", "Provider Act Master", "Act Code", "Act Name"),
  defineProviderMaster("provider_bed_type_master", "Provider Bed Type Master", "Bed Type Code", "Bed Type Name"),
  defineProviderMaster("provider_room_type_master", "Provider Room Type Master", "Room Type Code", "Room Type Name"),
  defineProviderMaster(
    "provider_clinical_specialties_master",
    "Provider Clinical Specialties Master",
    "Specialty Code",
    "Clinical Specialty",
  ),
  defineProviderMaster(
    "provider_contact_person_role_master",
    "Provider Contact Person Role Master",
    "Role Code",
    "Role Name",
  ),
  defineProviderMaster(
    "provider_discount_type_master",
    "Provider Discount Type Master",
    "Type Code",
    "Type Name",
  ),
  defineProviderMaster(
    "provider_discount_sub_type_master",
    "Provider Discount Sub-Type Master",
    "Sub-Type Code",
    "Sub-Type Name",
  ),
  defineProviderMaster(
    "provider_discount_inclusion_exclusion_master",
    "Provider Discount Inclusion Exclusion Master",
    "Type Code",
    "Type Name",
  ),
  defineProviderMaster(
    "provider_doctor_master",
    "Provider Doctor Master",
    "Doctor Code",
    "Doctor Name",
    "Specialty / Description",
  ),
  defineProviderMaster(
    "provider_equipment_master",
    "Provider Equipment Master",
    "Equipment Code",
    "Equipment Name",
  ),
  defineProviderMaster(
    "provider_facility_master",
    "Provider Facility Master",
    "Facility Code",
    "Facility Name",
  ),
  defineProviderMaster(
    "provider_identifier_type_master",
    "Provider Identifier",
    "Identifier Code",
    "Identifier Name",
  ),
  defineProviderMaster(
    "provider_investigation_master",
    "Provider Investigation Master",
    "Investigation Code",
    "Investigation Name",
  ),
  defineProviderMaster(
    "provider_soc_exclusion_inclusion_type_master",
    "Provider SOC Exclusion Inclusion Type Master",
    "Type Code",
    "Type Name",
  ),
  defineProviderMaster(
    "provider_support_service_master",
    "Provider Support Service Master",
    "Service Code",
    "Support Service",
  ),
  defineProviderMaster(
    "provider_system_of_medicine_master",
    "Provider System of Medicine Master",
    "System Code",
    "System of Medicine",
  ),
  defineProviderMaster("provider_taxonomy", "Provider Type Master", "Type Code", "Display Name"),
  defineProviderMaster(
    "insurer_provider_network_mode",
    "Insurer Provider Network Mode",
    "Network Mode Type",
    "Tariff Type",
    "Insurer Name",
  ),
] as const;

export type ProviderMasterKey = (typeof PROVIDER_MASTER_CONFIG_DEFS)[number]["key"];

export type ProviderMasterRecordStatus = "ACTIVE" | "INACTIVE";
export type ProviderMasterExtraValue = string | boolean;

export interface ProviderMasterRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  recordStatus: ProviderMasterRecordStatus;
  // updatedOn: string;
  extra?: Record<string, ProviderMasterExtraValue>;
}

export interface ProviderMasterConfig {
  key: ProviderMasterKey;
  title: string;
  codeLabel: string;
  nameLabel: string;
  descriptionLabel: string;
}

/** Masters loaded from backend APIs — no local seed rows. */
export const API_BACKED_PROVIDER_MASTER_KEYS: ProviderMasterKey[] = [
  "provider_identifier_type_master",
  "provider_taxonomy",
  "insurer_provider_network_mode",
  "provider_discount_type_master",
  "provider_discount_sub_type_master",
  "provider_discount_inclusion_exclusion_master",
];

export const PROVIDER_MASTER_CONFIGS: ProviderMasterConfig[] = [
  ...PROVIDER_MASTER_CONFIG_DEFS,
];

function buildSeedCodePrefix(key: ProviderMasterKey): string {
  return key
    .split("_")
    .filter((part) => part !== "provider" && part !== "master")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

function createDefaultSeedRow(
  config: ProviderMasterConfig,
  index: number,
): ProviderMasterRecord {
  const prefix = buildSeedCodePrefix(config.key);

  return {
    id: `${config.key}-1`,
    code: `${prefix || "MST"}-${String(index + 1).padStart(3, "0")}`,
    name: config.title.replace(" Master", ""),
    description: `Default ${config.title.toLowerCase()} record`,
    recordStatus: "ACTIVE",
    // updatedOn: today,
  };
}

export const PROVIDER_MASTER_SEED_ROWS = PROVIDER_MASTER_CONFIGS.reduce(
  (acc, config, index) => {
    acc[config.key] = API_BACKED_PROVIDER_MASTER_KEYS.includes(config.key)
      ? []
      : [createDefaultSeedRow(config, index)];
    return acc;
  },
  {} as Record<ProviderMasterKey, ProviderMasterRecord[]>,
);

export const DEFAULT_PROVIDER_MASTER_KEY: ProviderMasterKey =
  PROVIDER_MASTER_CONFIG_DEFS[0].key;

export function getProviderMastersListPath(
  masterKey: ProviderMasterKey = DEFAULT_PROVIDER_MASTER_KEY,
): string {
  return `/provider-masters/masters?master=${encodeURIComponent(masterKey)}`;
}

export function isProviderMasterKey(value: string): value is ProviderMasterKey {
  return PROVIDER_MASTER_CONFIGS.some((config) => config.key === value);
}
