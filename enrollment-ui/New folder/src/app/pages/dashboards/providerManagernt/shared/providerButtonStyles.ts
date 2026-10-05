/** Standard action button height for provider-management screens (32px / Tailwind h-8). */
export const PROVIDER_BUTTON_HEIGHT_CLASS = "h-8";

/** Primary / outlined toolbar actions (Edit, Verify, Audit Log, Add, etc.). */
export const PROVIDER_ACTION_BUTTON_CLASS =
  "h-8 cursor-pointer gap-1.5 rounded-md px-3 text-xs font-medium";

/** Search toggle in provider toolbars (CheckListButton). */
export const PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS =
  "flex h-8 items-center justify-center gap-2 rounded-md px-4 py-0!";

/** Form footer and dialog actions — same height/size as toolbar buttons. */
export const PROVIDER_FORM_BUTTON_CLASS = PROVIDER_ACTION_BUTTON_CLASS;

/** Shared form footer row layout below field grids. */
export const PROVIDER_FORM_FOOTER_CLASS =
  "mt-2 flex justify-end gap-1.5 border-t border-slate-200 pt-2";

/** Fixed-width save/cancel pair in status bars. */
export const PROVIDER_COMPACT_ACTION_BUTTON_CLASS =
  "h-8 w-20 cursor-pointer rounded-md px-2 text-xs font-medium";
