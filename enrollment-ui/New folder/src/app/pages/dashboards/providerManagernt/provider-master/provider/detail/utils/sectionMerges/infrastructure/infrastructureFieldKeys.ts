/** Field keys for GET/PATCH `/v1/provider/{id}/infrastructure`. */
export const INFRASTRUCTURE_KEYS = {
  providerInfrastructureId: ["providerInfrastructureId", "provider_infrastructure_id", "id"],
  providerId: ["providerId", "provider_id"],
  totalBedCount: ["totalBedCount", "total_bed_count", "totalBeds", "total_beds"],
  roomDetailList: ["roomDetailList", "room_detail_list"],
} as const;

export const INFRASTRUCTURE_ROOM_KEYS = {
  providerInfrastructureDetailId: [
    "providerInfrastructureDetailId",
    "provider_infrastructure_detail_id",
    "id",
  ],
  providerBedTypeId: ["providerBedTypeId", "provider_bed_type_id", "bedTypeId"],
  providerBedTypeName: ["providerBedTypeName", "provider_bed_type_name", "bedTypeName"],
  providerBedCount: ["providerBedCount", "provider_bed_count", "bedCount"],
} as const;
