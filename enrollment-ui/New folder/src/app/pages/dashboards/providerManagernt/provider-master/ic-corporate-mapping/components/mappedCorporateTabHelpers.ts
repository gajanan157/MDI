export type ProviderNameRow = { id: string | number; name: string };

export type SocGroupRow = {
  id: string | number;
  name: string;
  providerIds: Array<string | number>;
  file?: File | null;
  uploaded?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
};

export type CorporateGridLayout = {
  visibleCount: number;
  showSocPanel: boolean;
  useTwoParts: boolean;
  gridClassName: string;
  gridTemplateColumns: string;
};

export function getCorporateGridLayout(hiddenCards: Set<string>): CorporateGridLayout {
  const visibleCount = 4 - hiddenCards.size;
  const showSocPanel =
    hiddenCards.has("existingNetwork") &&
    hiddenCards.has("nonNetwork") &&
    hiddenCards.has("newProvider");
  const useTwoParts = showSocPanel && visibleCount === 1;

  return {
    visibleCount,
    showSocPanel,
    useTwoParts,
    gridClassName: useTwoParts
      ? "grid grid-cols-1 gap-2 lg:grid-cols-[1fr_4fr] lg:items-start"
      : "grid grid-cols-1 gap-2",
    gridTemplateColumns: visibleCount <= 0 ? "1fr" : `repeat(${visibleCount}, minmax(0, 1fr))`,
  };
}

export function resolveHospitalUploadPanelMode(
  hasSelection: boolean,
  validatedCorporate: boolean,
  fileAppliedCorporate: boolean,
): "hidden" | "upload" | "validate" {
  if (!hasSelection || validatedCorporate) return "hidden";
  if (!fileAppliedCorporate) return "upload";
  return "validate";
}

export function formatProviderCountLabel(count: number): string {
  return `${count} provider${count !== 1 ? "s" : ""} mapped`;
}

export type SeeMoreDialogPayload = {
  title: string;
  items: ProviderNameRow[];
  cardKey: string;
  tab: "corporate";
};
