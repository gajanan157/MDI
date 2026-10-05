/** One bed-type row from GET/PATCH `/v1/provider/{id}/infrastructure`. */
export interface ProviderInfrastructureRoomDetail {
  providerInfrastructureDetailId?: string | null;
  providerBedTypeId?: string | null;
  providerBedTypeName?: string | null;
  providerBedCount?: number | null;
}

/** One `provider_room_bed_details` row. */
export interface ProviderRoomBedDetail {
  providerRoomBedDetailId?: string | null;
  roomType: string;
  roomCount: number | null;
  bedsPerRoom: number | null;
  totalBedCount: number | null;
  maleBedCount: number | null;
  femaleBedCount: number | null;
  otherBedCount: number | null;
  roomFloorArea: number | null;
  nursePatientRatio: string;
  doctorPatientRatio: string;
  oxygenPointFlag: boolean;
  suctionPointFlag: boolean;
  nurseCallFlag: boolean;
  remarks: string;
  isActive: boolean;
}

/** One `provider_equipment_asset_details` row. */
export interface ProviderEquipmentAssetDetail {
  providerEquipmentAssetDetailId?: string | null;
  equipmentType: string;
  serialNumber: string;
  modelNumber: string;
  quantity: number | null;
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
}

/** Normalized provider infrastructure record for Redux state. */
export interface ProviderInfrastructure {
  providerInfrastructureId?: string | null;
  providerId?: string | null;
  totalBedCount?: number | null;
  roomDetailList: ProviderInfrastructureRoomDetail[];
  roomBedDetailList?: ProviderRoomBedDetail[];
  equipmentAssetList?: ProviderEquipmentAssetDetail[];
}

/** PATCH body for `/v1/provider/{id}/infrastructure`. */
export interface ProviderInfrastructurePatchPayload {
  totalBedCount?: number | null;
  roomDetailList?: ProviderInfrastructureRoomDetail[];
  roomBedDetailList?: ProviderRoomBedDetail[];
  equipmentAssetList?: ProviderEquipmentAssetDetail[];
}

export interface ProviderInfrastructureApiResponse {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: unknown;
}

export interface ProviderInfrastructureState {
  data: ProviderInfrastructure | null;
  providerId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveError: string | null;
}
