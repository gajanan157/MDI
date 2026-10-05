import type {
  ProviderInfrastructure,
  ProviderRoomBedDetail,
} from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import { roomBedRowKey, type RoomBedFormRow } from "./roomBedTypes";

function numToStr(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

function strToNum(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function rowFromApi(row: ProviderRoomBedDetail): RoomBedFormRow {
  return {
    rowKey: roomBedRowKey(row.roomType),
    providerRoomBedDetailId: row.providerRoomBedDetailId ?? null,
    roomType: row.roomType,
    roomCount: numToStr(row.roomCount),
    bedsPerRoom: numToStr(row.bedsPerRoom),
    totalBedCount: numToStr(row.totalBedCount),
    maleBedCount: numToStr(row.maleBedCount),
    femaleBedCount: numToStr(row.femaleBedCount),
    otherBedCount: numToStr(row.otherBedCount),
    roomFloorArea: numToStr(row.roomFloorArea),
    nursePatientRatio: row.nursePatientRatio,
    doctorPatientRatio: row.doctorPatientRatio,
    oxygenPointFlag: row.oxygenPointFlag,
    suctionPointFlag: row.suctionPointFlag,
    nurseCallFlag: row.nurseCallFlag,
    remarks: row.remarks,
    isActive: row.isActive,
    fromApi: true,
  };
}

export function createEmptyRoomBedFormRow(roomType: string): RoomBedFormRow {
  return {
    rowKey: roomBedRowKey(roomType) || `new-${Date.now()}`,
    providerRoomBedDetailId: null,
    roomType,
    roomCount: "",
    bedsPerRoom: "",
    totalBedCount: "",
    maleBedCount: "",
    femaleBedCount: "",
    otherBedCount: "",
    roomFloorArea: "",
    nursePatientRatio: "",
    doctorPatientRatio: "",
    oxygenPointFlag: false,
    suctionPointFlag: false,
    nurseCallFlag: false,
    remarks: "",
    isActive: true,
    fromApi: false,
  };
}

/** Demo rows shown until the room/bed API is live. */
const DUMMY_ROOM_BED: Partial<ProviderRoomBedDetail>[] = [
  {
    roomType: "General Ward",
    roomCount: 6,
    bedsPerRoom: 8,
    totalBedCount: 48,
    maleBedCount: 26,
    femaleBedCount: 20,
    otherBedCount: 2,
    roomFloorArea: 3840,
    nursePatientRatio: "1:6",
    doctorPatientRatio: "1:15",
    oxygenPointFlag: true,
    suctionPointFlag: true,
    nurseCallFlag: true,
  },
  {
    roomType: "Semi Private",
    roomCount: 10,
    bedsPerRoom: 2,
    totalBedCount: 20,
    maleBedCount: 11,
    femaleBedCount: 9,
    otherBedCount: 0,
    roomFloorArea: 2000,
    nursePatientRatio: "1:4",
    doctorPatientRatio: "1:10",
    oxygenPointFlag: true,
    suctionPointFlag: true,
    nurseCallFlag: true,
  },
  {
    roomType: "Private Room",
    roomCount: 12,
    bedsPerRoom: 1,
    totalBedCount: 12,
    maleBedCount: 7,
    femaleBedCount: 5,
    otherBedCount: 0,
    roomFloorArea: 1800,
    nursePatientRatio: "1:3",
    doctorPatientRatio: "1:8",
    oxygenPointFlag: true,
    suctionPointFlag: true,
    nurseCallFlag: true,
    remarks: "AC single-occupancy rooms",
  },
  {
    roomType: "ICU",
    roomCount: 1,
    bedsPerRoom: 10,
    totalBedCount: 10,
    maleBedCount: 6,
    femaleBedCount: 4,
    otherBedCount: 0,
    roomFloorArea: 1500,
    nursePatientRatio: "1:1",
    doctorPatientRatio: "1:4",
    oxygenPointFlag: true,
    suctionPointFlag: true,
    nurseCallFlag: true,
  },
  {
    roomType: "NICU",
    roomCount: 1,
    bedsPerRoom: 6,
    totalBedCount: 6,
    maleBedCount: 3,
    femaleBedCount: 3,
    otherBedCount: 0,
    roomFloorArea: 720,
    nursePatientRatio: "1:2",
    doctorPatientRatio: "1:6",
    oxygenPointFlag: true,
    suctionPointFlag: true,
    nurseCallFlag: true,
  },
  {
    roomType: "Day Care",
    roomCount: 2,
    bedsPerRoom: 4,
    totalBedCount: 8,
    maleBedCount: 4,
    femaleBedCount: 4,
    otherBedCount: 0,
    roomFloorArea: 640,
    nursePatientRatio: "1:8",
    doctorPatientRatio: "1:16",
    oxygenPointFlag: true,
    suctionPointFlag: false,
    nurseCallFlag: true,
    remarks: "Under expansion",
  },
];

function dummyRoomBedRows(): RoomBedFormRow[] {
  return DUMMY_ROOM_BED.map((partial) =>
    rowFromApi({
      providerRoomBedDetailId: null,
      roomType: "",
      roomCount: null,
      bedsPerRoom: null,
      totalBedCount: null,
      maleBedCount: null,
      femaleBedCount: null,
      otherBedCount: null,
      roomFloorArea: null,
      nursePatientRatio: "",
      doctorPatientRatio: "",
      oxygenPointFlag: false,
      suctionPointFlag: false,
      nurseCallFlag: false,
      remarks: "",
      isActive: true,
      ...partial,
    }),
  ).map((row) => ({ ...row, fromApi: false }));
}

/** API rows → RHF form rows. Falls back to demo rows when the API has none. */
export function roomBedFormRowsFromApi(
  infrastructure: ProviderInfrastructure | null | undefined,
): RoomBedFormRow[] {
  const apiRows = (infrastructure?.roomBedDetailList ?? []).map(rowFromApi);
  return apiRows.length > 0 ? apiRows : dummyRoomBedRows();
}

export function roomBedPatchPayloadFromForm(
  rows: RoomBedFormRow[],
): ProviderRoomBedDetail[] {
  return rows
    .filter((row) => row.roomType.trim())
    .map((row) => ({
      providerRoomBedDetailId: row.providerRoomBedDetailId ?? null,
      roomType: row.roomType.trim(),
      roomCount: strToNum(row.roomCount),
      bedsPerRoom: strToNum(row.bedsPerRoom),
      totalBedCount: strToNum(row.totalBedCount),
      maleBedCount: strToNum(row.maleBedCount),
      femaleBedCount: strToNum(row.femaleBedCount),
      otherBedCount: strToNum(row.otherBedCount),
      roomFloorArea: strToNum(row.roomFloorArea),
      nursePatientRatio: row.nursePatientRatio.trim(),
      doctorPatientRatio: row.doctorPatientRatio.trim(),
      oxygenPointFlag: row.oxygenPointFlag,
      suctionPointFlag: row.suctionPointFlag,
      nurseCallFlag: row.nurseCallFlag,
      remarks: row.remarks.trim(),
      isActive: row.isActive,
    }));
}

/** Derived: room_floor_area ÷ total_bed_count, to 1 decimal, or "" when not computable. */
export function floorAreaPerBed(row: RoomBedFormRow): string {
  const area = strToNum(row.roomFloorArea);
  const beds = strToNum(row.totalBedCount);
  if (area == null || beds == null || beds <= 0) return "";
  return String(Math.round((area / beds) * 10) / 10);
}

/** Soft consistency warnings for a row. */
export function roomBedRowWarning(row: RoomBedFormRow): string | null {
  const total = strToNum(row.totalBedCount);
  if (total == null) return null;

  const rooms = strToNum(row.roomCount);
  const perRoom = strToNum(row.bedsPerRoom);
  if (rooms != null && perRoom != null && rooms * perRoom !== total) {
    return "Rooms × beds-per-room does not equal total beds";
  }

  const male = strToNum(row.maleBedCount);
  const female = strToNum(row.femaleBedCount);
  const other = strToNum(row.otherBedCount);
  if (male != null || female != null || other != null) {
    const sum = (male ?? 0) + (female ?? 0) + (other ?? 0);
    if (sum !== total) return "Male + female + other beds does not equal total beds";
  }
  return null;
}

const RATIO_PATTERN = /^\d{1,3}\s*:\s*\d{1,4}$/;
export function isValidRatio(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === "" || RATIO_PATTERN.test(trimmed);
}
