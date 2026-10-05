import type { TFunction } from "i18next";
import type { SearchField } from "../../../../shared/providerShell";

const SF = "providerMaster.icMapping.searchFields";

/**
 * The search dropdown stores lowercase values ("pending"), while the API
 * query param uses the response casing ("Pending"). "all" / empty means
 * no filter, so no param is sent.
 */
export function toApiBankMatchStatus(dropdownValue: string): string {
  const value = dropdownValue.trim().toLowerCase();
  if (value === "matched") return "Matched";
  if (value === "mismatch") return "Mismatch";
  if (value === "pending") return "Pending";
  return "";
}

function buildBankMatchOptions(t: TFunction) {
  return [
    { value: "all", label: t(`${SF}.all`) },
    { value: "matched", label: t(`${SF}.matched`) },
    { value: "mismatch", label: t(`${SF}.mismatch`) },
    { value: "pending", label: t(`${SF}.pending`) },
  ];
}

export function buildMappingSearchFields(
  mappingSubTab: "ic" | "corporate",
  insurerSearchOptions: Array<{ value: string; label: string }>,
  t: TFunction,
): SearchField[] {
  const bankMatchOptions = buildBankMatchOptions(t);

  if (mappingSubTab === "corporate") {
    return [
      { name: "name", label: t(`${SF}.corporateName`), type: "text" },
      {
        name: "insuranceCompanyName",
        label: t(`${SF}.insuranceCompanyName`),
        type: "text",
      },
      { name: "icProviderCode", label: t(`${SF}.icProviderCode`), type: "text" },
      {
        name: "bankMatch",
        label: t(`${SF}.bankMatchStatus`),
        type: "dropdown",
        options: bankMatchOptions,
      },
    ];
  }

  return [
    {
      // Not named "insurerId" on purpose: CommonSearch overrides the
      // options of any field with that exact name using the insurer
      // slice this screen does not load, leaving the dropdown empty.
      name: "mappedInsurerId",
      label: t(`${SF}.insurerName`),
      type: "dropdown",
      options: [{ value: "", label: t(`${SF}.all`) }, ...insurerSearchOptions],
    },
    { name: "icProviderCode", label: t(`${SF}.icProviderCode`), type: "text" },
    {
      name: "bankMatch",
      label: t(`${SF}.bankMatchStatus`),
      type: "dropdown",
      options: bankMatchOptions,
    },
  ];
}
