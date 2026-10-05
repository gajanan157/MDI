/** Default page size for provider-management list grids. */
export const PROVIDER_GRID_DEFAULT_PAGE_SIZE = 20;

/** Page-size dropdown options for provider-management list grids. */
export const PROVIDER_GRID_PAGE_SIZE_OPTIONS = [20, 30, 50, 100] as const;

/** Shared AG Grid fit-width strategy (optional min width for denser list pages). */
export const PROVIDER_GRID_AUTO_SIZE_FIT_WIDTH = {
  type: "fitGridWidth" as const,
  defaultMinWidth: 72,
};

/** Overlay / popover stacking for provider-management surfaces. */
export const PROVIDER_OVERLAY_Z_INDEX_CLASS = "z-[100]";

/** Dialog stacking above drawers (e.g. task assignment drawer dialogs). */
export const PROVIDER_DRAWER_DIALOG_Z_INDEX_CLASS = "z-[200]";
