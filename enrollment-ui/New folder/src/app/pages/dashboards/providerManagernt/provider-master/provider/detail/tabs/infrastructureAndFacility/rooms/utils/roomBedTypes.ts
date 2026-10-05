import type { ProviderRoomBedDetail } from "@/store/features/providerInfrastructure/providerInfrastructureTypes";

export const ROOM_TYPE_OPTIONS = [
  "General Ward",
  "Semi Private",
  "Private Room",
  "Deluxe Room",
  "Suite",
  "ICU",
  "HDU",
  "NICU",
  "PICU",
  "Day Care",
  "Isolation Room",
] as const;

/** RHF row for the room & bed grid (numeric fields kept as strings for editing). */
export type RoomBedFormRow = {
  rowKey: string;
  providerRoomBedDetailId: string | null;
  roomType: string;
  roomCount: string;
  bedsPerRoom: string;
  totalBedCount: string;
  maleBedCount: string;
  femaleBedCount: string;
  otherBedCount: string;
  roomFloorArea: string;
  nursePatientRatio: string;
  doctorPatientRatio: string;
  oxygenPointFlag: boolean;
  suctionPointFlag: boolean;
  nurseCallFlag: boolean;
  remarks: string;
  isActive: boolean;
  /** True when the row came from the API. */
  fromApi: boolean;
};

export function roomBedRowKey(roomType: string): string {
  return roomType.trim().toLowerCase();
}

export type { ProviderRoomBedDetail };
