export type AgreementListPageProps = {
  /** When set, list loads from provider agreement API. */
  providerId?: string;
  onViewAgreement?: (id: string) => void;
  onEditAgreement?: (id: string) => void;
  onNewAgreement?: () => void;
  /** Show top row with title + New Agreement */
  showHeader?: boolean;
  /** Grid height when search is collapsed; used only when `fillAvailableHeight` is false. */
  gridHeight?: number;
  /** Stretch grid to fill remaining tab height (provider Agreement tab). */
  fillAvailableHeight?: boolean;
  /** Hide the default Search + New Agreement row (e.g. show them in StatusEditVerifyBar). Requires `searchOpen` + `onSearchToggle`. */
  suppressToolbar?: boolean;
  searchOpen?: boolean;
  onSearchToggle?: () => void;
  /** Hide row-level Edit (pencil); View/Download remain. */
  hideRowEdit?: boolean;
  /** Optional card-style empty state (used by provider agreement tab). */
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  /** Notified when the list shows the empty state (no agreement rows). */
  onEmptyStateChange?: (isEmpty: boolean) => void;
};
