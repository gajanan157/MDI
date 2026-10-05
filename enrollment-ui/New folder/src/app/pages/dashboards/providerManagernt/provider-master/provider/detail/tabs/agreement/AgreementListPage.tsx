import {
  AgreementListMainSection,
  AgreementListSearchSection,
} from "./components/AgreementListMainSection";
import { useAgreementListPage } from "./hooks/useAgreementListPage";
import type { AgreementListPageProps } from "./agreementListPageTypes";

export type { AgreementListPageProps } from "./agreementListPageTypes";

function resolveAgreementListRootClassName(
  fillAvailableHeight: boolean,
  isSearchOpen: boolean,
) {
  const heightClass = fillAvailableHeight ? "flex-1" : "";
  const gapClass = isSearchOpen ? "gap-2" : "gap-0";
  return `flex min-h-0 flex-col ${heightClass} ${gapClass}`;
}

export function AgreementListPage(props: AgreementListPageProps) {
  const state = useAgreementListPage(props);

  return (
    <div
      className={resolveAgreementListRootClassName(state.fillAvailableHeight, state.isSearchOpen)}
    >
      <AgreementListSearchSection
        suppressToolbar={state.suppressToolbar}
        isSearchOpen={state.isSearchOpen}
        toggleSearch={state.toggleSearch}
        newAgreement={state.newAgreement}
        showSearchButton={state.showSearchButton}
        searchFields={state.searchFields}
        setFilters={state.setFilters}
        useApiList={state.useApiList}
        apiListLoading={state.apiList.loading}
      />

      <AgreementListMainSection {...state} />
    </div>
  );
}

/** @deprecated Use `AgreementListPage` */
export const AgreementEmbeddedList = AgreementListPage;

export { AgreementListToolbar } from "./components/AgreementListToolbar";
/** @deprecated Use `AgreementListToolbar` */
export { AgreementListToolbar as AgreementListSearchAndNewButtons } from "./components/AgreementListToolbar";
