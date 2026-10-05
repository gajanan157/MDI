import { useEffect, useState } from "react";
import type { Office } from "../utils/hierarchyUtils";
import {
  transformApiResponse,
  isApiResponseFormat,
} from "../utils/apiResponseTransformer";

export const useHierarchyData = (apiData?: unknown) => {
  const [data, setData] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiData) return;

    try {
      setLoading(true);
      setError(null);
      if (isApiResponseFormat(apiData)) {
        setData(transformApiResponse(apiData));
      } else {
        setError("Invalid API response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process data");
    } finally {
      setLoading(false);
    }
  }, [apiData]);

  return { data, loading, error };
};
