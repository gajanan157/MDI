import type { ProviderInfrastructure } from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import { INFRASTRUCTURE_CATEGORY_MASTER } from "./infrastructureCategoryMaster";
import { INFRASTRUCTURE_CATEGORY_ITEM_KEYS } from "./infrastructureCategoryFieldKeys";
import type {
  InfrastructureApiItem,
  InfrastructureCategoryGroup,
  InfrastructureOperationalStatus,
  NormalizedInfrastructureCategoryItem,
} from "./infrastructureCategoryTypes";

/** Partial API records for create/demo until full infrastructure API is available. */
export const DUMMY_INFRASTRUCTURE_API_ITEMS: InfrastructureApiItem[] = [
  {
    infraCategory: "Bed Infrastructure",
    infraType: "ICU Bed",
    availabilityFlag: true,
    totalCount: 12,
    operationalStatus: "Active",
    remarks: "Fully operational",
    verifiedFlag: false,
    verifiedBy: "",
    verifiedOn: "",
  },
  {
    infraCategory: "Bed Infrastructure",
    infraType: "General Ward",
    availabilityFlag: true,
    totalCount: 40,
    operationalStatus: "Active",
    remarks: "",
    verifiedFlag: true,
    verifiedBy: "Admin User",
    verifiedOn: "2026-06-15",
  },
  {
    infraCategory: "OT Infrastructure",
    infraType: "Major OT",
    availabilityFlag: true,
    totalCount: 2,
    operationalStatus: "Active",
    remarks: "",
    verifiedFlag: false,
    verifiedBy: "",
    verifiedOn: "",
  },
  {
    infraCategory: "Equipment Infrastructure",
    infraType: "Ventilator",
    availabilityFlag: true,
    totalCount: 8,
    operationalStatus: "Under Maintenance",
    remarks: "2 units under service",
    verifiedFlag: false,
    verifiedBy: "",
    verifiedOn: "",
  },
];

function normalizeOperationalStatus(value: string | null | undefined): InfrastructureOperationalStatus {
  const trimmed = String(value ?? "").trim();
  if (
    trimmed === "Active" ||
    trimmed === "Inactive" ||
    trimmed === "Under Maintenance"
  ) {
    return trimmed;
  }
  return "";
}

function normalizeCategoryTypeKey(infraCategory: string, infraType: string): string {
  return `${infraCategory.trim().toLowerCase()}|${infraType.trim().toLowerCase()}`;
}

export function getInfrastructureCategoryTypeKey(
  infraCategory: string,
  infraType: string,
): string {
  return normalizeCategoryTypeKey(infraCategory, infraType);
}

function defaultMasterItem(
  infraCategory: string,
  infraType: string,
  description: string,
): NormalizedInfrastructureCategoryItem {
  return {
    infraCategory,
    infraType,
    description,
    availabilityFlag: false,
    totalCount: null,
    operationalStatus: "",
    remarks: "",
    verifiedFlag: false,
    verifiedBy: "",
    verifiedOn: "",
    fromApi: false,
  };
}

function mergeApiItemFields(
  base: InfrastructureApiItem,
  overlay: InfrastructureApiItem,
): InfrastructureApiItem {
  return {
    infraCategory: overlay.infraCategory || base.infraCategory,
    infraType: overlay.infraType || base.infraType,
    availabilityFlag:
      overlay.availabilityFlag !== null && overlay.availabilityFlag !== undefined
        ? overlay.availabilityFlag
        : base.availabilityFlag,
    totalCount:
      overlay.totalCount !== null && overlay.totalCount !== undefined
        ? overlay.totalCount
        : base.totalCount,
    operationalStatus:
      overlay.operationalStatus !== null &&
      overlay.operationalStatus !== undefined &&
      String(overlay.operationalStatus).trim() !== ""
        ? overlay.operationalStatus
        : base.operationalStatus,
    remarks:
      overlay.remarks !== null && overlay.remarks !== undefined
        ? overlay.remarks
        : base.remarks,
    verifiedFlag:
      overlay.verifiedFlag !== null && overlay.verifiedFlag !== undefined
        ? overlay.verifiedFlag
        : base.verifiedFlag,
    verifiedBy:
      overlay.verifiedBy !== null && overlay.verifiedBy !== undefined
        ? overlay.verifiedBy
        : base.verifiedBy,
    verifiedOn:
      overlay.verifiedOn !== null && overlay.verifiedOn !== undefined
        ? overlay.verifiedOn
        : base.verifiedOn,
  };
}

function mergeApiItemsByCategoryAndType(
  sources: InfrastructureApiItem[],
): InfrastructureApiItem[] {
  const merged = new Map<string, InfrastructureApiItem>();

  for (const item of sources) {
    const key = normalizeCategoryTypeKey(item.infraCategory, item.infraType);
    const existing = merged.get(key);
    merged.set(key, existing ? mergeApiItemFields(existing, item) : item);
  }

  return Array.from(merged.values());
}

/** Overlay API values on master row; missing API fields keep master defaults. */
function mergeApiItemWithMaster(
  apiItem: InfrastructureApiItem,
  masterItem: NormalizedInfrastructureCategoryItem,
): NormalizedInfrastructureCategoryItem {
  return {
    infraCategory: masterItem.infraCategory,
    infraType: masterItem.infraType,
    description: masterItem.description,
    availabilityFlag:
      apiItem.availabilityFlag === null || apiItem.availabilityFlag === undefined
        ? masterItem.availabilityFlag
        : apiItem.availabilityFlag === true,
    totalCount:
      apiItem.totalCount === null || apiItem.totalCount === undefined
        ? masterItem.totalCount
        : apiItem.totalCount,
    operationalStatus:
      apiItem.operationalStatus === null ||
      apiItem.operationalStatus === undefined ||
      String(apiItem.operationalStatus).trim() === ""
        ? masterItem.operationalStatus
        : normalizeOperationalStatus(apiItem.operationalStatus),
    remarks:
      apiItem.remarks === null || apiItem.remarks === undefined
        ? masterItem.remarks
        : String(apiItem.remarks).trim(),
    verifiedFlag:
      apiItem.verifiedFlag === null || apiItem.verifiedFlag === undefined
        ? masterItem.verifiedFlag
        : apiItem.verifiedFlag === true,
    verifiedBy:
      apiItem.verifiedBy === null || apiItem.verifiedBy === undefined
        ? masterItem.verifiedBy
        : String(apiItem.verifiedBy).trim(),
    verifiedOn:
      apiItem.verifiedOn === null || apiItem.verifiedOn === undefined
        ? masterItem.verifiedOn
        : String(apiItem.verifiedOn).trim(),
    fromApi: true,
  };
}

function findApiItem(
  apiItems: InfrastructureApiItem[],
  infraCategory: string,
  infraType: string,
): InfrastructureApiItem | undefined {
  const targetKey = normalizeCategoryTypeKey(infraCategory, infraType);
  return apiItems.find(
    (item) => normalizeCategoryTypeKey(item.infraCategory, item.infraType) === targetKey,
  );
}

/** Maps legacy bed API rows into category items for Bed Infrastructure. */
function mapLegacyInfrastructureToApiItems(
  infrastructure: ProviderInfrastructure | null,
): InfrastructureApiItem[] {
  if (!infrastructure) return [];

  return infrastructure.roomDetailList
    .filter((row) => String(row.providerBedTypeName ?? "").trim())
    .map((row) => ({
      infraCategory: "Bed Infrastructure",
      infraType: String(row.providerBedTypeName).trim(),
      availabilityFlag: (row.providerBedCount ?? 0) > 0,
      totalCount: row.providerBedCount ?? null,
      operationalStatus: "Active",
      remarks: "",
      verifiedFlag: null,
      verifiedBy: "",
      verifiedOn: "",
    }));
}

export function resolveInfrastructureApiItems(
  infrastructure: ProviderInfrastructure | null,
  useDummyData: boolean,
): InfrastructureApiItem[] {
  const dummyItems = useDummyData ? DUMMY_INFRASTRUCTURE_API_ITEMS : [];
  const legacyItems = mapLegacyInfrastructureToApiItems(infrastructure);
  // Dummy first, then legacy/API — real API values win; dummy fills gaps for all categories.
  return mergeApiItemsByCategoryAndType([...dummyItems, ...legacyItems]);
}

export function buildInfrastructureCategoryGroups(
  apiItems: InfrastructureApiItem[],
): InfrastructureCategoryGroup[] {
  return INFRASTRUCTURE_CATEGORY_MASTER.map((category) => {
    const items = category.types
      .map((type) => {
        const apiItem = findApiItem(apiItems, category.name, type.name);
        if (!apiItem) return null;
        const masterItem = defaultMasterItem(category.name, type.name, type.description);
        return mergeApiItemWithMaster(apiItem, masterItem);
      })
      .filter((item): item is NormalizedInfrastructureCategoryItem => item !== null);

    return {
      categoryId: category.id,
      categoryName: category.name,
      items,
    };
  });
}

export function findInfrastructureFormItemIndex(
  items: NormalizedInfrastructureCategoryItem[],
  infraCategory: string,
  infraType: string,
): number {
  const targetKey = normalizeCategoryTypeKey(infraCategory, infraType);
  return items.findIndex(
    (item) => normalizeCategoryTypeKey(item.infraCategory, item.infraType) === targetKey,
  );
}

export function flattenInfrastructureCategoryGroups(
  groups: InfrastructureCategoryGroup[],
): NormalizedInfrastructureCategoryItem[] {
  return groups.flatMap((group) => group.items);
}

export function applyFormItemsToCategoryGroups(
  groups: InfrastructureCategoryGroup[],
  items: NormalizedInfrastructureCategoryItem[],
): InfrastructureCategoryGroup[] {
  const formItemByKey = new Map(
    items.map((item) => [
      normalizeCategoryTypeKey(item.infraCategory, item.infraType),
      item,
    ]),
  );

  return groups.map((group) => ({
    ...group,
    items: group.items.map((fallbackItem) => {
      const key = normalizeCategoryTypeKey(
        fallbackItem.infraCategory,
        fallbackItem.infraType,
      );
      return formItemByKey.get(key) ?? fallbackItem;
    }),
  }));
}

export function formatInfrastructureYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

export function formatInfrastructureCount(value: number | null): string {
  if (value === null || value === undefined) return "-";
  return String(value);
}

export function formatInfrastructureDisplayValue(value: string): string {
  const trimmed = value.trim();
  return trimmed || "-";
}

export function countApiFilledItems(
  items: NormalizedInfrastructureCategoryItem[],
): number {
  return items.filter((item) => item.fromApi).length;
}

export const INFRASTRUCTURE_CATEGORY_FIELD_LABELS: Record<
  keyof typeof INFRASTRUCTURE_CATEGORY_ITEM_KEYS,
  string
> = {
  infraCategory: "Infra category",
  infraType: "Infra type",
  availabilityFlag: "Availability",
  totalCount: "Total count",
  operationalStatus: "Operational status",
  remarks: "Remarks",
  verifiedFlag: "Verified",
  verifiedBy: "Verified by",
  verifiedOn: "Verified on",
};
