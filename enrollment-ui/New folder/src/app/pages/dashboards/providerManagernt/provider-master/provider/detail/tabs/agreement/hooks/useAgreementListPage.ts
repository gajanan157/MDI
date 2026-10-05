import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { SearchField } from "../../../../../../shared/providerShell";
import { useDisclosure } from "../../../../../../shared/providerShell";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { fetchProviderAgreementById } from "@/store/features/providerAgreement/providerAgreementAPI";
import { getAgreementMasterColumns } from "../utils/agreementListGrid";
import { useProviderAgreementList } from "./useProviderAgreementList";
import {
  createAgreementScopeFilter,
  createAgreementStatusFilter,
  createAgreementTypeFilter,
  resolveAgreementEmptyTitle,
} from "../../../../../../shared/providerMasterI18n";
import type { AgreementListPageProps } from "../agreementListPageTypes";
import type { AgreementListRow } from "../utils/agreementHelpers";

const LIST_BASE = "/provider-masters/agreement-management";

type AgreementNavContext = {
  providerId: string;
  agreementId: string;
  agreementName: string;
  insurerMappings: AgreementListRow["insurerMappings"];
};

function toSocNavInsurerMappings(
  mappings: AgreementListRow["insurerMappings"] | undefined,
): AgreementListRow["insurerMappings"] {
  return (mappings ?? [])
    .filter((mapping) => String(mapping.insurerId ?? "").trim())
    .map((mapping) => ({
      insurerId: String(mapping.insurerId).trim(),
      insurerName: mapping.insurerName?.trim() || undefined,
      mappingEffectiveFrom: mapping.mappingEffectiveFrom?.trim() || undefined,
    }));
}
export function useAgreementListPage({
  providerId,
  onViewAgreement,
  onNewAgreement,
  gridHeight = 260,
  suppressToolbar = false,
  searchOpen: searchOpenControlled,
  onSearchToggle,
  emptyStateTitle,
  emptyStateDescription,
  fillAvailableHeight = false,
  onEmptyStateChange,
}: AgreementListPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [internalSearchOpen, { toggle: internalToggleSearch, close: closeInternalSearch }] =
    useDisclosure(false);
  const isSearchOpen = suppressToolbar ? Boolean(searchOpenControlled) : internalSearchOpen;
  const toggleSearch = suppressToolbar ? onSearchToggle ?? (() => {}) : internalToggleSearch;
  const [filters, setFilters] = useState({
    agreementType: "",
    scope: "",
    status: "",
  });
  const apiList = useProviderAgreementList({
    providerId,
    filters,
  });
  const useApiList = Boolean(providerId?.trim());

  const searchFields = useMemo<SearchField[]>(
    () => [
      {
        name: "agreementType",
        label: t("providerMaster.agreement.agreementType"),
        type: "dropdown",
        options: createAgreementTypeFilter(t),
      },
      {
        name: "scope",
        label: t("providerMaster.agreement.applicableScope"),
        type: "dropdown",
        options: createAgreementScopeFilter(t),
      },
      {
        name: "status",
        label: t("providerMaster.common.status"),
        type: "dropdown",
        options: createAgreementStatusFilter(t),
      },
    ],
    [t],
  );

  const filteredRows = useApiList ? apiList.rows : [];

  const view = useCallback(
    (id: string) => {
      if (onViewAgreement) {
        onViewAgreement(id);
        return;
      }
      navigate(`${LIST_BASE}/${id}`);
    },
    [navigate, onViewAgreement],
  );

  const resolveAgreementNavContext = useCallback(
    (
      row: AgreementListRow,
      unavailableMessage: string,
      onResolved: (context: AgreementNavContext) => void,
    ) => {
      const resolvedProviderId =
        row.providerId?.trim() || providerId?.trim() || "";
      if (!resolvedProviderId) {
        showProviderError(unavailableMessage);
        return;
      }

      const agreementId = String(row.id ?? "").trim();
      const agreementName = String(row.agreementName ?? "").trim();
      const insurerMappings = toSocNavInsurerMappings(row.insurerMappings);

      const finish = (
        nextAgreementName: string,
        nextMappings: AgreementListRow["insurerMappings"],
      ) => {
        onResolved({
          providerId: resolvedProviderId,
          agreementId,
          agreementName: nextAgreementName,
          insurerMappings: nextMappings,
        });
      };

      if (insurerMappings.length > 0 || !agreementId) {
        finish(agreementName, insurerMappings);
        return;
      }

      fetchProviderAgreementById(resolvedProviderId, agreementId)
        .then((result) => {
          if (!result.ok || !result.row) {
            finish(agreementName, insurerMappings);
            return;
          }

          const detailMappings = toSocNavInsurerMappings(
            result.row.insurerMappings.map((mapping) => ({
              insurerId: mapping.insurerId,
              insurerName: mapping.insurerName,
              mappingEffectiveFrom:
                mapping.mappingEffectiveFrom ||
                result.row.providerAgreementEffectiveFrom,
            })),
          );

          finish(
            agreementName || result.row.providerAgreementName.trim(),
            detailMappings,
          );
        })
        .catch(() => {
          finish(agreementName, insurerMappings);
        });
    },
    [providerId],
  );

  const openSocDiscount = useCallback(
    (row: AgreementListRow) => {
      resolveAgreementNavContext(
        row,
        t("providerMaster.agreement.socDiscountNavigationUnavailable", {
          defaultValue: "Unable to open Soc for this agreement.",
        }),
        ({ providerId: resolvedProviderId, agreementName, insurerMappings }) => {
          const encodedProviderId = encodeURIComponent(resolvedProviderId);
          const status = String(row.socDiscountStatus ?? "").trim().toLowerCase();
          const openAddSoc = status === "pending" || status === "";
          const targetPath = openAddSoc
            ? `/provider-masters/providers/${encodedProviderId}/soc/new/edit`
            : `/provider-masters/providers/${encodedProviderId}/soc`;

          navigate(targetPath, {
            state:
              agreementName || insurerMappings.length > 0
                ? {
                    agreementName,
                    insurerMappings,
                    fromAgreement: true as const,
                  }
                : undefined,
          });
        },
      );
    },
    [navigate, resolveAgreementNavContext, t],
  );

  const openAddDiscount = useCallback(
    (row: AgreementListRow) => {
      resolveAgreementNavContext(
        row,
        t("providerMaster.agreement.discountNavigationUnavailable", {
          defaultValue: "Unable to open Discount for this agreement.",
        }),
        ({
          providerId: resolvedProviderId,
          agreementId,
          agreementName,
          insurerMappings,
        }) => {
          const encodedProviderId = encodeURIComponent(resolvedProviderId);
          navigate(
            `/provider-masters/providers/${encodedProviderId}/discount/new/edit`,
            {
              state: {
                agreementId,
                agreementName,
                insurerMappings,
                fromAgreement: true as const,
              },
            },
          );
        },
      );
    },
    [navigate, resolveAgreementNavContext, t],
  );

  const newAgreement = useCallback(() => {
    if (onNewAgreement) {
      onNewAgreement();
      return;
    }
    navigate(`${LIST_BASE}/new`);
  }, [navigate, onNewAgreement]);

  const columns = useMemo(
    () =>
      getAgreementMasterColumns({
        view,
        onOpenSocDiscount: openSocDiscount,
        onAddDiscount: openAddDiscount,
        t,
      }),
    [view, openSocDiscount, openAddDiscount, t],
  );

  const showAgreementLoading = useApiList && apiList.loading;
  const showAgreementEmpty =
    !showAgreementLoading &&
    filteredRows.length === 0 &&
    Boolean(
      emptyStateTitle ||
        emptyStateDescription ||
        apiList.error ||
        apiList.listMessage,
    );
  const showAgreementGrid = !showAgreementLoading && filteredRows.length > 0;
  const showSearchButton = showAgreementGrid;

  useEffect(() => {
    onEmptyStateChange?.(showAgreementEmpty);
  }, [onEmptyStateChange, showAgreementEmpty]);

  useEffect(() => {
    if (apiList.error?.trim()) {
      showProviderError(apiList.error);
    }
  }, [apiList.error]);

  useEffect(() => {
    if (!showSearchButton && !suppressToolbar && internalSearchOpen) {
      closeInternalSearch();
    }
  }, [closeInternalSearch, internalSearchOpen, showSearchButton, suppressToolbar]);

  const agreementEmptyTitle = resolveAgreementEmptyTitle(t, {
    error: apiList.error,
    listMessage: apiList.listMessage,
    emptyStateTitle,
  });
  const agreementEmptyDescription = apiList.error ? "" : (emptyStateDescription ?? "");

  return {
    t,
    isSearchOpen,
    toggleSearch,
    suppressToolbar,
    newAgreement,
    view,
    openSocDiscount,
    openAddDiscount,
    showSearchButton,
    searchFields,
    setFilters,
    useApiList,
    apiList,
    fillAvailableHeight,
    showAgreementGrid,
    showAgreementLoading,
    showAgreementEmpty,
    agreementEmptyTitle,
    agreementEmptyDescription,
    filteredRows,
    columns,
    gridHeight,
  };
}
