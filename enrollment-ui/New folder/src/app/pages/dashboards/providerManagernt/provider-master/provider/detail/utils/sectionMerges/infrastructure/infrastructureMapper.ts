import type { HospitalDetailRecord } from "../../../../hospitalData";
import { isApiRecord } from "../apiPayloadHelpers";

function readNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
}

type BedAccumulator = {
  icuBeds: number;
  ccuBeds: number;
  nicuBeds: number;
  generalBeds: number;
  singleBeds: number;
  twinSharing: number;
  suite: number;
  labourRooms: number;
  majorOt: number;
  minorOt: number;
};

function emptyBedAccumulator(): BedAccumulator {
  return {
    icuBeds: 0,
    ccuBeds: 0,
    nicuBeds: 0,
    generalBeds: 0,
    singleBeds: 0,
    twinSharing: 0,
    suite: 0,
    labourRooms: 0,
    majorOt: 0,
    minorOt: 0,
  };
}

function addBedCountByRoomName(acc: BedAccumulator, roomName: string, count: number) {
  if (roomName.includes("nicu")) acc.nicuBeds += count;
  else if (roomName.includes("iccu") || roomName === "ccu beds") acc.ccuBeds += count;
  else if (roomName.includes("icu")) acc.icuBeds += count;
  else if (roomName.includes("major ot")) acc.majorOt += count;
  else if (roomName.includes("minor ot")) acc.minorOt += count;
  else if (roomName.includes("general")) acc.generalBeds += count;
  else if (roomName.includes("single")) acc.singleBeds += count;
  else if (roomName.includes("twin")) acc.twinSharing += count;
  else if (roomName.includes("suite")) acc.suite += count;
  else if (roomName.includes("labour") || roomName.includes("labor")) acc.labourRooms += count;
  else if (roomName.includes("other")) acc.generalBeds += count;
}

/** Parses `infrastructure.totalBedCount` and `infrastructure.roomDetailList` from provider details API. */
export function parseInfrastructureBedFieldsFromPayload(
  raw: unknown,
): Partial<HospitalDetailRecord> {
  if (!isApiRecord(raw)) return {};

  const out: Partial<HospitalDetailRecord> = {};
  const total = readNumber(raw.totalBedCount);
  if (total !== undefined) out.totalBeds = total;

  const roomList = raw.roomDetailList;
  if (!Array.isArray(roomList) || roomList.length === 0) return out;

  const acc = emptyBedAccumulator();
  let sawRoomRows = false;

  for (const row of roomList) {
    if (!isApiRecord(row)) continue;
    const roomName = String(row.providerBedTypeName ?? "").trim().toLowerCase();
    const count = readNumber(row.providerBedCount) ?? 0;
    if (!roomName) continue;
    sawRoomRows = true;
    addBedCountByRoomName(acc, roomName, count);
  }

  if (!sawRoomRows) return out;

  return {
    ...out,
    icuBeds: acc.icuBeds,
    ccuBeds: acc.ccuBeds,
    nicuBeds: acc.nicuBeds,
    generalBeds: acc.generalBeds,
    singleBeds: acc.singleBeds,
    twinSharing: acc.twinSharing,
    suite: acc.suite,
    labourRooms: acc.labourRooms,
    majorOt: acc.majorOt,
    minorOt: acc.minorOt,
  };
}
