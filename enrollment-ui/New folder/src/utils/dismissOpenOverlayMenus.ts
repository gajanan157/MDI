/** React-select menu portal class (DropdownSelect / VirtualizedDropdownSelect). */
const SELECT_MENU_PORTAL_SELECTOR = ".select-form__menu-portal";

/**
 * Close floating overlay menus (react-select, etc.) before showing a modal alert.
 * Prevents stale "No options" dropdown panels from appearing above error dialogs.
 */
export function dismissOpenOverlayMenus(): void {
  if (typeof document === "undefined") return;

  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    active.blur();
  }

  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );

  document.querySelectorAll<HTMLElement>(SELECT_MENU_PORTAL_SELECTOR).forEach((portal) => {
    portal.style.display = "none";
    portal.style.pointerEvents = "none";
  });
}
