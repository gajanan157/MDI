import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProviderAgreementList } from "@/store/features/providerAgreement/providerAgreementSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useNavigate } from "react-router";
import {
  encodeAgreementRouteSegmentFromInternalId,
  resolveAgreementIdFromRouteParam,
} from "../tabs/agreement/utils/agreementHelpers";
import { AGREEMENT_SAMPLE_PDF_URL } from "../utils/viewHospitalConfig";

type UseViewHospitalAgreementArgs = {
  providerBasePath: string;
  agreementUrlKey: string | undefined;
  agreementUrlSuffix: "view" | "edit" | undefined;
};

export function useViewHospitalAgreement({
  providerBasePath,
  agreementUrlKey,
  agreementUrlSuffix,
}: UseViewHospitalAgreementArgs) {
  const navigate = useNavigate();

  const [agreementPdfUrl, setAgreementPdfUrl] = useState<string | undefined>(
    AGREEMENT_SAMPLE_PDF_URL,
  );
  const [isAgreementViewMode, setIsAgreementViewMode] = useState(true);
  const [agreementForm, setAgreementForm] = useState<Record<string, string>>({});
  const initialAgreementPdfUrlRef = useRef<string | undefined>(AGREEMENT_SAMPLE_PDF_URL);

  const handleAgreementEdit = useCallback(() => {
    if (agreementUrlSuffix === "view" && agreementUrlKey && providerBasePath) {
      const internalId = resolveAgreementIdFromRouteParam(agreementUrlKey);
      if (internalId) {
        const seg = encodeAgreementRouteSegmentFromInternalId(internalId);
        navigate(`${providerBasePath}/agreement/${seg}/edit`);
        return;
      }
    }
    initialAgreementPdfUrlRef.current = agreementPdfUrl;
    setIsAgreementViewMode(false);
  }, [agreementUrlSuffix, agreementUrlKey, providerBasePath, navigate, agreementPdfUrl]);

  const handleAgreementCancel = useCallback(() => {
    if (agreementUrlSuffix === "edit" && agreementUrlKey && providerBasePath) {
      const internalId = resolveAgreementIdFromRouteParam(agreementUrlKey);
      if (internalId) {
        const seg = encodeAgreementRouteSegmentFromInternalId(internalId);
        navigate(`${providerBasePath}/agreement/${seg}/view`);
        return;
      }
    }
    if (agreementUrlSuffix === "view" && providerBasePath) {
      navigate(`${providerBasePath}/agreement`);
      return;
    }
    if (agreementPdfUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(agreementPdfUrl);
    }
    setAgreementPdfUrl(initialAgreementPdfUrlRef.current ?? AGREEMENT_SAMPLE_PDF_URL);
    setAgreementForm({});
    setIsAgreementViewMode(true);
  }, [agreementUrlSuffix, agreementUrlKey, providerBasePath, navigate, agreementPdfUrl]);

  const handleAgreementSave = useCallback(() => {
    if (agreementUrlSuffix === "edit" && agreementUrlKey && providerBasePath) {
      const internalId = resolveAgreementIdFromRouteParam(agreementUrlKey);
      if (internalId) {
        const seg = encodeAgreementRouteSegmentFromInternalId(internalId);
        navigate(`${providerBasePath}/agreement/${seg}/view`);
      }
      if (agreementPdfUrl?.startsWith("blob:")) {
        // Keep blob URL in state until real upload is implemented
      }
      initialAgreementPdfUrlRef.current = agreementPdfUrl;
      return;
    }
    if (agreementPdfUrl?.startsWith("blob:")) {
      // Keep blob URL in state until real upload is implemented
    }
    initialAgreementPdfUrlRef.current = agreementPdfUrl;
    setIsAgreementViewMode(true);
  }, [agreementUrlSuffix, agreementUrlKey, providerBasePath, navigate, agreementPdfUrl]);

  const handleAgreementFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (agreementPdfUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(agreementPdfUrl);
    }
    setAgreementPdfUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleAgreementDetailOpen = useCallback(() => {
    setIsAgreementViewMode(true);
  }, []);

  return {
    agreementPdfUrl,
    setAgreementPdfUrl,
    isAgreementViewMode,
    agreementForm,
    handleAgreementEdit,
    handleAgreementCancel,
    handleAgreementSave,
    handleAgreementFileChange,
    handleAgreementDetailOpen,
  };
}

const PROVIDER_AGREEMENT_TYPE_SUMMARY_FILTERS = { page: 1, size: 100 } as const;

/** Reads agreement type labels cached in Redux (Agreements tab list), with details API fallback. */
export function useProviderAgreementTypeLabels(
  providerId?: string,
  fallbackTypeLabels: string[] = [],
) {
  const dispatch = useAppDispatch();
  const summary = useAppSelector((state) => state.providerAgreement.summary);

  const resolvedProviderId = providerId?.trim() ?? "";

  useEffect(() => {
    if (!resolvedProviderId) return;

    dispatch(
      fetchProviderAgreementList({
        providerId: resolvedProviderId,
        filters: PROVIDER_AGREEMENT_TYPE_SUMMARY_FILTERS,
      }),
    ).catch(() => undefined);
  }, [dispatch, resolvedProviderId]);

  if (resolvedProviderId && summary.providerId === resolvedProviderId && summary.typeLabels.length > 0) {
    return summary.typeLabels;
  }

  const seen = new Set<string>();
  return fallbackTypeLabels
    .map((label) => label.trim())
    .filter((label) => {
      if (!label || seen.has(label)) return false;
      seen.add(label);
      return true;
    });
}
