import type { ProviderInfrastructure } from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import type { HospitalDetailRecord } from "../../../../hospitalData";
import { INFRASTRUCTURE_STANDARD_BED_ROWS } from "./infrastructureConfig";

export type InfrastructureViewRow = {
  label: string;
  value?: number | string;
};

function hasDisplayValue(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function buildInfrastructureViewRows(
  infrastructure: ProviderInfrastructure | null,
  hospital: HospitalDetailRecord | null,
): InfrastructureViewRow[] {
  const roomList = infrastructure?.roomDetailList ?? [];

  if (roomList.length > 0) {
    const rows: InfrastructureViewRow[] = [];
    if (infrastructure?.totalBedCount != null) {
      rows.push({ label: "Total Beds", value: infrastructure.totalBedCount });
    }
    for (const room of roomList) {
      rows.push({
        label: room.providerBedTypeName?.trim() || "Bed Count",
        value: room.providerBedCount ?? undefined,
      });
    }
    return rows;
  }

  const rows: InfrastructureViewRow[] = [
    { label: "Total Beds", value: hospital?.totalBeds },
    ...INFRASTRUCTURE_STANDARD_BED_ROWS.map((row) => ({
      label: row.viewLabel,
      value: hospital?.[row.formKey],
    })),
  ];

  return rows.filter((row) => hasDisplayValue(row.value));
}

export function hasInfrastructureViewData(
  infrastructure: ProviderInfrastructure | null,
  hospital: HospitalDetailRecord | null,
): boolean {
  return buildInfrastructureViewRows(infrastructure, hospital).length > 0;
}
