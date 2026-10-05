import type { StylesConfig } from "react-select";

type DiscountCategoryOption = { label: string; value: string };

function chipOptionBackgroundColor(isSelected?: boolean, isFocused?: boolean): string {
  if (isSelected) return "#eff6ff";
  if (isFocused) return "#f3f4f6";
  return "#fff";
}

const chipOptionStyle = (
  base: Record<string, unknown>,
  state: { isSelected?: boolean; isFocused?: boolean },
) => ({
  ...base,
  padding: 0,
  borderRadius: 6,
  backgroundColor: chipOptionBackgroundColor(state.isSelected, state.isFocused),
  color: "#111827",
});

const createChipMultiSelectStyles = (minHeight: number, fontSize: number) =>
  ({
    control: (base: Record<string, unknown>) => ({
      ...base,
      minHeight,
      fontSize,
      minWidth: 0,
      alignItems: "flex-start",
      paddingTop: 4,
      paddingBottom: 4,
      borderColor: "#e5e7eb",
      borderRadius: 8,
      "&:hover": { borderColor: "#d1d5db" },
    }),
    valueContainer: (base: Record<string, unknown>) => ({
      ...base,
      flexWrap: "nowrap",
      maxHeight: 120,
      maxWidth: "100%",
      overflowY: "auto",
      overflowX: "auto",
      minWidth: 0,
      flex: "1 1 0",
      paddingLeft: 10,
      paddingRight: 6,
      gap: 6,
      WebkitOverflowScrolling: "touch",
    }),
    multiValue: (base: Record<string, unknown>) => ({ ...base, flexShrink: 0, minWidth: 0 }),
    multiValueRemove: (base: Record<string, unknown>) => ({
      ...base,
      cursor: "pointer",
      paddingLeft: 4,
      paddingRight: 4,
      color: "#6b7280",
      ":hover": { backgroundColor: "#fef2f2", color: "#dc2626" },
    }),
    indicatorsContainer: (base: Record<string, unknown>) => ({
      ...base,
      flexShrink: 0,
      alignSelf: "stretch",
      paddingTop: 6,
      paddingBottom: 6,
    }),
    dropdownIndicator: (base: Record<string, unknown>) => ({ ...base, padding: 6, color: "#6b7280" }),
    menu: (base: Record<string, unknown>) => ({
      ...base,
      zIndex: 9999,
      borderRadius: 8,
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
      minWidth: "100%",
      width: "max(100%, min(56rem, calc(100vw - 2rem)))",
    }),
    menuList: (base: Record<string, unknown>) => ({ ...base, maxHeight: 320, padding: 0 }),
    menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }),
    option: chipOptionStyle,
  }) as StylesConfig<DiscountCategoryOption, true>;

export const CHIP_MULTI_SELECT_STYLES_COMPACT = createChipMultiSelectStyles(32, 12);
export const CHIP_MULTI_SELECT_STYLES = createChipMultiSelectStyles(40, 13);
