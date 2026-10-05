import type { ProviderInfrastructure } from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import type { HospitalDetailRecord } from "../../../../hospitalData";
import type { InfrastructureFormValues } from "../../../schemas";
import type { DynamicInfrastructureFormValues } from "../../../schemas";
import { EMPTY_INFRASTRUCTURE_FORM, INFRASTRUCTURE_STANDARD_BED_ROWS } from "./infrastructureConfig";

function readRoomCountByName(
  infrastructure: ProviderInfrastructure | null,
  bedTypeName: string,
): string {
  const match = infrastructure?.roomDetailList.find(
    (row) => row.providerBedTypeName?.trim().toLowerCase() === bedTypeName.toLowerCase(),
  );
  if (match?.providerBedCount == null) return "";
  return String(match.providerBedCount);
}

export function mapInfrastructureToStaticFormValues(
  infrastructure: ProviderInfrastructure | null,
  hospital: HospitalDetailRecord | null,
): InfrastructureFormValues {
  if (infrastructure?.roomDetailList.length) {
    const fromApi: InfrastructureFormValues = {
      ...EMPTY_INFRASTRUCTURE_FORM,
      totalBeds: String(infrastructure.totalBedCount ?? ""),
    };
    for (const row of INFRASTRUCTURE_STANDARD_BED_ROWS) {
      fromApi[row.formKey] = readRoomCountByName(infrastructure, row.bedTypeName);
    }
    return fromApi;
  }

  return {
    totalBeds: String(hospital?.totalBeds ?? ""),
    icuBeds: String(hospital?.icuBeds ?? ""),
    ccuBeds: String(hospital?.ccuBeds ?? ""),
    nicuBeds: String(hospital?.nicuBeds ?? ""),
    generalBeds: String(hospital?.generalBeds ?? ""),
    singleBeds: String(hospital?.singleBeds ?? ""),
    twinSharing: String(hospital?.twinSharing ?? ""),
    suite: String(hospital?.suite ?? ""),
    labourRooms: String(hospital?.labourRooms ?? ""),
    majorOt: String(hospital?.majorOt ?? ""),
    minorOt: String(hospital?.minorOt ?? ""),
  };
}

export function mapInfrastructureToDynamicFormValues(
  infrastructure: ProviderInfrastructure,
): DynamicInfrastructureFormValues {
  return {
    totalBeds: String(infrastructure.totalBedCount ?? ""),
    roomRows: infrastructure.roomDetailList.map((row) => ({
      bedTypeName: row.providerBedTypeName ?? "",
      bedCount: String(row.providerBedCount ?? ""),
    })),
  };
}

export function shouldUseDynamicInfrastructureForm(
  infrastructure: ProviderInfrastructure | null,
): boolean {
  if (!infrastructure?.roomDetailList.length) return false;

  const standardNames = new Set(
    INFRASTRUCTURE_STANDARD_BED_ROWS.map((row) => row.bedTypeName.toLowerCase()),
  );
  const allStandard = infrastructure.roomDetailList.every((row) =>
    standardNames.has((row.providerBedTypeName ?? "").trim().toLowerCase()),
  );

  return !allStandard;
}
