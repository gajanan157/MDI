export type RestrictionScopeKind = "corporate" | "ro" | "policy" | "ccn" | "insurer";

export type RestrictionScopeDisplay = {
  kind: RestrictionScopeKind;
  typeLabel: string;
  values: string[];
};
