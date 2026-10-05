import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchProviderJobStatus } from "@/store/features/bulkIcMapping/bulkIcMappingSlice";
import { fetchBlacklistJobStatusApi } from "@/store/features/excludedProvider/excludedProviderAPI";
import { fetchProviderBankJobStatusApi } from "@/store/features/bulkBankDetails/bulkBankDetailsAPI";
import { isProviderJobTerminalStatus } from "./progressUtils";
import type { NormalizedProviderJobStatus } from "./statusTypes";

const POLL_INTERVAL_MS = 3000;

export type ProviderJobStatusSource = "provider-job" | "blacklist-job" | "provider-bank-job";

export type UseProviderJobStatusOptions = {
  enabled?: boolean;
  /** Which status API to call. Defaults to IC bulk-mapping `provider-job`. */
  source?: ProviderJobStatusSource;
  onTerminalStatus?: (job: NormalizedProviderJobStatus) => void;
};

export function useProviderJobStatus(
  inwardNo: string,
  options: UseProviderJobStatusOptions = {},
) {
  const dispatch = useAppDispatch();
  const trimmedInwardNo = inwardNo.trim();
  const { enabled = true, source = "provider-job" } = options;

  return useQuery({
    queryKey: ["provider-job-status", source, trimmedInwardNo],
    enabled: Boolean(trimmedInwardNo) && enabled,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (source === "blacklist-job") {
        const result = await fetchBlacklistJobStatusApi(trimmedInwardNo);
        if (!result.ok) {
          const message = (result.message ?? "").toLowerCase();
          // Never surface "no job" as a query/UI error.
          if (
            message.includes("no blacklist job found") ||
            message.includes("prov-batch-404-30")
          ) {
            return null;
          }
          throw Object.assign(
            new Error(result.message ?? "Failed to load blacklist job status."),
            { stopPolling: result.stopPolling },
          );
        }
        // No job yet (404 / PROV-BATCH-404-30) — silent; staging UI still loads.
        return result.job;
      }

      if (source === "provider-bank-job") {
        const result = await fetchProviderBankJobStatusApi(trimmedInwardNo);
        if (!result.ok) {
          const message = (result.message ?? "").toLowerCase();
          if (message.includes("no job found") || message.includes("prov-batch-404")) {
            return null;
          }
          throw Object.assign(
            new Error(result.message ?? "Failed to load bank job status."),
            { stopPolling: result.stopPolling },
          );
        }
        return result.job;
      }

      return dispatch(fetchProviderJobStatus(trimmedInwardNo)).unwrap();
    },
    refetchInterval: (query) => {
      if (query.state.status === "error") return false;

      const status = query.state.data?.jobStatus;
      if (!status) return false;
      return isProviderJobTerminalStatus(status) ? false : POLL_INTERVAL_MS;
    },
  });
}
