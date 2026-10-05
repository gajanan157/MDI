import { resolveProviderNetworkMappingId } from "../tabs/icCorporateMapping/mapping/utils";
import type { ItemWithIdName } from "../tabs/icCorporateMapping/types";

type MappingDetailState = {
  item: ItemWithIdName;
  editing: boolean;
  detailLoading: boolean;
} | null;

type ParsedMappingDetail = {
  subTab: "ic" | "corporate";
  mappingId: string;
  mode: "view" | "edit";
};

export function mergeMappingDetailFromUrl(
  prev: MappingDetailState,
  parsed: ParsedMappingDetail,
): NonNullable<MappingDetailState> {
  const currentId = prev ? resolveProviderNetworkMappingId(prev.item) : "";
  if (currentId === parsed.mappingId && prev) {
    return {
      ...prev,
      editing: parsed.mode === "edit",
      detailLoading: prev.detailLoading,
    };
  }

  return {
    item: {
      id: parsed.mappingId,
      name: "",
      providerNetworkMappingId: parsed.mappingId,
    },
    editing: parsed.mode === "edit",
    detailLoading: true,
  };
}

export function updateMappingDetailEditingOnly(
  prev: NonNullable<MappingDetailState>,
  parsed: ParsedMappingDetail,
): NonNullable<MappingDetailState> {
  const currentId = resolveProviderNetworkMappingId(prev.item);
  if (currentId !== parsed.mappingId) return prev;
  if (prev.editing === (parsed.mode === "edit")) return prev;
  return { ...prev, editing: parsed.mode === "edit" };
}
