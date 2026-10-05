import { isExcludedProviderWatchlist } from "./config";

export type BlacklistUploadFormValues = {
  uploadIcId: string;
  blacklistedBy: string;
  listingType: string;
  investigationRequired: boolean;
  emergencyExceptionAllowed: boolean;
  /** Shown when Investigation required is checked (watchlisted). */
  investigationApplicableFor: string[];
  /** Lock For — multi-select when restriction type is watchlisted */
  status: string[];
};

function isNonEmptyStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function areWatchlistFieldsFilled(blacklistW: BlacklistUploadFormValues): boolean {
  if (!isExcludedProviderWatchlist(String(blacklistW.listingType ?? "").trim())) {
    return true;
  }
  if (!isNonEmptyStringArray(blacklistW.status)) return false;
  if (!blacklistW.investigationRequired) return true;
  return isNonEmptyStringArray(blacklistW.investigationApplicableFor);
}

function areBlacklistMetaFieldsFilled(
  blacklistW: BlacklistUploadFormValues,
  effectiveFrom: string,
  remark: string,
): boolean {
  if (!effectiveFrom.trim()) return false;
  if (!String(remark ?? "").trim()) return false;
  if (!String(blacklistW.blacklistedBy ?? "").trim()) return false;
  if (!String(blacklistW.listingType ?? "").trim()) return false;
  if (!areWatchlistFieldsFilled(blacklistW)) return false;

  if (
    (blacklistW.blacklistedBy === "INSURER" || blacklistW.blacklistedBy === "GLOBAL") &&
    !String(blacklistW.uploadIcId ?? "").trim()
  ) {
    return false;
  }

  return true;
}

export function canSubmitBlacklistForm(
  blacklistW: BlacklistUploadFormValues,
  effectiveFrom: string,
  hasPrimaryFile: boolean,
  hasSupportingFile: boolean,
  remark: string,
): boolean {
  return (
    areBlacklistMetaFieldsFilled(blacklistW, effectiveFrom, remark) &&
    hasPrimaryFile &&
    hasSupportingFile
  );
}

/** Inward process form — document already uploaded on the inward; no file pickers. */
export function canSubmitExclusionInwardForm(
  blacklistW: BlacklistUploadFormValues,
  effectiveFrom: string,
  remark: string,
): boolean {
  return areBlacklistMetaFieldsFilled(blacklistW, effectiveFrom, remark);
}

type BlacklistUploadResetParams = {
  blacklistForm: { reset: (values: BlacklistUploadFormValues) => void };
  setBlacklistUploadOpen: (open: boolean) => void;
  setPrimaryFile: (file: File | null) => void;
  setSupportingFile: (file: File | null) => void;
  setPrimaryFileName: (value: string | null) => void;
  setSupportingFileName: (value: string | null) => void;
  setPrimaryFileError: (value: string) => void;
  setSupportingFileError: (value: string) => void;
  setEffectiveFrom: (value: string) => void;
  setRemark: (value: string) => void;
};

export function resetBlacklistUploadForm(params: BlacklistUploadResetParams): void {
  params.setBlacklistUploadOpen(false);
  params.setPrimaryFile(null);
  params.setSupportingFile(null);
  params.setPrimaryFileName(null);
  params.setSupportingFileName(null);
  params.setPrimaryFileError("");
  params.setSupportingFileError("");
  params.blacklistForm.reset({
    uploadIcId: "",
    blacklistedBy: "",
    listingType: "",
    investigationRequired: false,
    emergencyExceptionAllowed: false,
    investigationApplicableFor: [],
    status: [],
  });
  params.setEffectiveFrom("");
  params.setRemark("");
}

export function extractBlacklistUploadError(
  err: unknown,
  fallbackMessage: string,
): string {
  if (typeof err === "string") return err;
  return (err as { message?: string })?.message ?? fallbackMessage;
}
