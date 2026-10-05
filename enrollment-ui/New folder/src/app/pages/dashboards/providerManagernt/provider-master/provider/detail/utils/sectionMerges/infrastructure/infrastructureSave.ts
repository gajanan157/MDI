import type {
  ProviderInfrastructure,
  ProviderInfrastructurePatchPayload,
  ProviderInfrastructureRoomDetail,
} from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import type { InfrastructureFormValues } from "../../../schemas";
import type { DynamicInfrastructureFormValues } from "../../../schemas";
import { INFRASTRUCTURE_STANDARD_BED_ROWS } from "./infrastructureConfig";

function toNumberOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function buildStandardInfrastructurePatchPayload(
  values: InfrastructureFormValues,
): ProviderInfrastructurePatchPayload {
  const roomDetailList: ProviderInfrastructureRoomDetail[] = INFRASTRUCTURE_STANDARD_BED_ROWS.map(
    (row) => ({
      providerBedTypeName: row.bedTypeName,
      providerBedCount: toNumberOrNull(values[row.formKey]),
    }),
  ).filter((row) => row.providerBedCount !== null);

  return {
    totalBedCount: toNumberOrNull(values.totalBeds),
    roomDetailList,
  };
}

export function buildDynamicInfrastructurePatchPayload(
  values: DynamicInfrastructureFormValues,
  base: ProviderInfrastructure | null,
): ProviderInfrastructurePatchPayload {
  const baseRows = base?.roomDetailList ?? [];

  return {
    totalBedCount: toNumberOrNull(values.totalBeds),
    roomDetailList: values.roomRows
      .filter((row) => row.bedTypeName.trim() || row.bedCount.trim())
      .map((row, index) => ({
        providerInfrastructureDetailId:
          baseRows[index]?.providerInfrastructureDetailId ?? null,
        providerBedTypeId: baseRows[index]?.providerBedTypeId ?? null,
        providerBedTypeName: row.bedTypeName.trim() || null,
        providerBedCount: toNumberOrNull(row.bedCount),
      })),
  };
}
