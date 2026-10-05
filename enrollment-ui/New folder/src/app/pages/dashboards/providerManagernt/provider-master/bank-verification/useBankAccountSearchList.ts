import { useCallback, useEffect, useMemo, useState } from "react";
import { showErrorMessage } from "@/utils/errorHandler";
import {
  searchProviderBankAccounts,
  type BankAccountSearchFilters,
  type BankAccountSearchRow,
} from "@/store/features/providerBankAccountSearch/providerBankAccountSearchApi";
import { useProviderGridPagination } from "../../shared/useProviderGridPagination";

type BankAccountSearchListFilters = {
  providerName: string;
  rohiniCode: string;
  insurerId: string;
  panNumber: string;
  matchStatus: string;
  insurerRecord: boolean | null;
};

const EMPTY_FILTERS: BankAccountSearchListFilters = {
  providerName: "",
  rohiniCode: "",
  insurerId: "",
  panNumber: "",
  matchStatus: "",
  insurerRecord: null,
};

function parseInsurerRecord(value: unknown): boolean | null {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "true" || raw === "insurer" || raw === "yes") return true;
  if (raw === "false" || raw === "provider" || raw === "no") return false;
  return null;
}

export function useBankAccountSearchList() {
  const { page, pageSize, resetPage, handlePageChange, handlePageSizeChange } =
    useProviderGridPagination();
  const [filters, setFilters] = useState<BankAccountSearchListFilters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<BankAccountSearchRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const requestFilters = useMemo<BankAccountSearchFilters>(
    () => ({
      page,
      size: pageSize,
      providerName: filters.providerName,
      rohiniCode: filters.rohiniCode,
      insurerId: filters.insurerId,
      panNumber: filters.panNumber,
      matchStatus: filters.matchStatus,
      insurerRecord: filters.insurerRecord,
    }),
    [page, pageSize, filters],
  );

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchProviderBankAccounts(requestFilters);
      if (result.ok) {
        setRows(result.rows);
        setTotalRecords(result.totalRecords);
      } else {
        if (result.message) {
          showErrorMessage({ status: result.status, error: result.message });
        }
        setRows([]);
        setTotalRecords(0);
      }
    } catch (err) {
      showErrorMessage({ error: err instanceof Error ? err.message : undefined });
      setRows([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [requestFilters]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const handleSearch = useCallback(
    (data: Record<string, unknown>) => {
      setFilters({
        providerName: String(data.providerName ?? ""),
        rohiniCode: String(data.rohiniCode ?? ""),
        insurerId: String(data.insurerId ?? ""),
        panNumber: String(data.panNumber ?? ""),
        matchStatus: String(data.matchStatus ?? ""),
        insurerRecord: parseInsurerRecord(data.insurerRecord),
      });
      resetPage();
    },
    [resetPage],
  );

  return {
    page,
    pageSize,
    totalItems: totalRecords,
    rows,
    loading,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
  };
}
