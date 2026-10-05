import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { fetchIcCorpDropdownApi } from "@/store/features/providerRestriction/providerRestrictionAPI";
import { fetchProviderSocList } from "@/store/features/providerSoc/providerSocAPI";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import {
  getSocDetail,
  NEW_SOC_INTERNAL_ID,
  resolveSocIdFromRouteParam,
  type SocDetailRecord,
  type SocVersionItem,
} from "../data/socListData";
import { mapProviderSocToDetail } from "../utils/mapProviderSocToListRow";
import { uploadSocDocument } from "../utils/socDocumentApi";
import {
  buildProviderSocPath,
  isSocDocumentPdf,
  SOC_DOCUMENT_MAX_BYTES,
  type SocCorporateOption,
  type SocInsurerOption,
} from "../utils/socConfig";

export function useSocDocumentUpload(args: {
  providerId?: string;
  socId?: string;
  setSocVersionHistory: React.Dispatch<React.SetStateAction<SocVersionItem[]>>;
  setSelectedSocPdfUrl: (url: string | undefined) => void;
  setSocVersionId: (id: string) => void;
}) {
  const {
    providerId,
    socId,
    setSocVersionHistory,
    setSelectedSocPdfUrl,
    setSocVersionId,
  } = args;
  const socFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingSocDocumentFile, setPendingSocDocumentFile] = useState<File | null>(null);
  const [isSavingSocDocument, setIsSavingSocDocument] = useState(false);

  const clearPendingSocDocument = useCallback(() => {
    setPendingSocDocumentFile(null);
    if (socFileInputRef.current) socFileInputRef.current.value = "";
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const resolvedProviderId = providerId?.trim();
      const resolvedSocId = socId?.trim();
      if (!resolvedProviderId || !resolvedSocId) return;

      setIsSavingSocDocument(true);
      try {
        const result = await uploadSocDocument({
          file,
          providerId: resolvedProviderId,
          socId: resolvedSocId,
        });
        if (!result.ok) {
          showErrorMessage({ error: result.message });
          return;
        }
        const newId = result.fileMetadataId ?? String(Date.now());
        setSocVersionHistory((prev) => [
          {
            id: newId,
            name: file.name,
            url: result.downloadUrl,
            active: true,
            fileSizeBytes: file.size,
          },
          ...prev.map((v) => ({ ...v, active: false })),
        ]);
        setSelectedSocPdfUrl(result.downloadUrl);
        setSocVersionId(newId);
        setPendingSocDocumentFile(null);
        if (socFileInputRef.current) socFileInputRef.current.value = "";
        if (result.message) showSuccessMessage(result.message);
      } finally {
        setIsSavingSocDocument(false);
      }
    },
    [providerId, setSelectedSocPdfUrl, setSocVersionHistory, setSocVersionId, socId],
  );

  const handleSocFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      event.target.value = "";
      if (!file) return;
      if (!isSocDocumentPdf(file)) {
        showErrorMessage({ error: "Only PDF files are allowed." });
        return;
      }
      if (file.size > SOC_DOCUMENT_MAX_BYTES) {
        showErrorMessage({ error: "File size must be 10MB or less." });
        return;
      }
      setPendingSocDocumentFile(file);
      uploadFile(file).catch(() => {});
    },
    [uploadFile],
  );

  return {
    socFileInputRef,
    pendingSocDocumentFile,
    isSavingSocDocument,
    handleSocFileSelect,
    clearPendingSocDocument,
  };
}

export function useSocInsurerOptions(enabled = false) {
  const dispatch = useAppDispatch();
  const insurerListState = useAppSelector((s) => s.insurerList);

  useEffect(() => {
    if (!enabled) return;
    if ((insurerListState.insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, enabled, insurerListState.insurerList]);

  const insurerOptions: SocInsurerOption[] = useMemo(
    () =>
      (insurerListState.insurerList ?? []).map((row) => ({
        value: row.insurerId,
        label: row.insurerName,
        insurerType: row.insurerType,
      })),
    [insurerListState.insurerList],
  );

  const multiSelectOptions = useMemo(
    () => insurerOptions.map(({ value, label }) => ({ value, label })),
    [insurerOptions],
  );

  return {
    insurerOptions,
    multiSelectOptions,
    loading: insurerListState.loading,
  };
}

export function useSocDetailFromUrl(args: {
  providerId?: string;
  socUrlKey?: string;
  socUrlSuffix?: "view" | "edit";
  onSocDetailOpen: (detail: SocDetailRecord, urlSuffix: "view" | "edit") => void;
}) {
  const { providerId, socUrlKey, socUrlSuffix, onSocDetailOpen } = args;
  const showDetailFromUrl = !!(socUrlKey && socUrlSuffix);
  const location = useLocation();
  const onSocDetailOpenRef = useRef(onSocDetailOpen);
  onSocDetailOpenRef.current = onSocDetailOpen;
  const lastOpenedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!socUrlKey || !socUrlSuffix) {
      lastOpenedKeyRef.current = null;
      return;
    }
    const preferredInnerTab =
      (location.state as { socInnerTab?: "soc" | "discount" } | null)?.socInnerTab ?? "";
    const openKey = `${socUrlKey}|${socUrlSuffix}|${preferredInnerTab}`;
    if (lastOpenedKeyRef.current === openKey) return;
    const internalId = resolveSocIdFromRouteParam(socUrlKey);
    if (!internalId) return;

    if (internalId === NEW_SOC_INTERNAL_ID) {
      const detail = getSocDetail(internalId);
      if (!detail) return;
      lastOpenedKeyRef.current = openKey;
      onSocDetailOpenRef.current(detail, socUrlSuffix);
      return;
    }

    const mockDetail = getSocDetail(internalId);
    if (mockDetail) {
      lastOpenedKeyRef.current = openKey;
      onSocDetailOpenRef.current(mockDetail, socUrlSuffix);
      return;
    }

    const resolvedProviderId = providerId?.trim() ?? "";
    if (!resolvedProviderId) return;

    lastOpenedKeyRef.current = openKey;
    let cancelled = false;
    fetchProviderSocList({
      providerId: resolvedProviderId,
      download: true,
    })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          lastOpenedKeyRef.current = null;
          showProviderError(result.message ?? "Failed to load SOC.");
          return;
        }
        const match = result.rows.find((row) => row.providerSocId === internalId);
        if (!match) {
          lastOpenedKeyRef.current = null;
          showProviderError("SOC record was not found.");
          return;
        }
        onSocDetailOpenRef.current(mapProviderSocToDetail(match), socUrlSuffix);
      })
      .catch(() => {
        if (!cancelled) lastOpenedKeyRef.current = null;
      });

    return () => {
      cancelled = true;
    };
  }, [location.state, providerId, socUrlKey, socUrlSuffix]);

  return { showDetailFromUrl };
}

export function useSocNavigation(providerBasePath?: string) {
  const navigate = useNavigate();
  const location = useLocation();

  const toProviderSocPath = useCallback(
    (suffix: "view" | "edit", internalId: string) =>
      buildProviderSocPath(suffix, internalId, {
        providerBasePath,
        pathname: location.pathname,
      }),
    [providerBasePath, location.pathname],
  );

  const navigateToViewSoc = useCallback(
    (socId: string) => {
      const path = toProviderSocPath("view", socId);
      if (path) navigate(path, { replace: false });
    },
    [navigate, toProviderSocPath],
  );

  const navigateToViewDiscount = useCallback(
    (socId: string) => {
      const path = toProviderSocPath("view", socId);
      if (path) {
        navigate(path, {
          replace: false,
          state: { socInnerTab: "discount" as const },
        });
      }
    },
    [navigate, toProviderSocPath],
  );

  const navigateToAddSoc = useCallback(() => {
    if (providerBasePath) {
      navigate(`${providerBasePath}/soc/new/edit`, { replace: false, state: {} });
      return;
    }
    const providerId = location.pathname.match(
      /\/provider-masters\/providers\/([^/]+)/,
    )?.[1];
    if (!providerId) return;
    navigate(`/provider-masters/providers/${providerId}/soc/new/edit`, {
      replace: false,
      state: {},
    });
  }, [navigate, providerBasePath, location.pathname]);

  return { navigateToViewSoc, navigateToViewDiscount, navigateToAddSoc };
}

export function useSocCorporateOptions(args: {
  enabled: boolean;
  insurerId: string;
}) {
  const { enabled, insurerId } = args;
  const [options, setOptions] = useState<SocCorporateOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmedInsurerId = insurerId.trim();
    if (!enabled || !trimmedInsurerId) {
      setOptions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchIcCorpDropdownApi({ insurerId: trimmedInsurerId })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setOptions([]);
          return;
        }
        setOptions(result.corporates.map((item) => ({ value: item.id, label: item.name })));
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, insurerId]);

  return { options, loading };
}
