import type { UseFormSetError } from "react-hook-form";
import {
  hasCorporateIdsSelected,
  hasRohOfficeIdsSelected,
} from "./utils";
import type { RestrictionDetailsState, RestrictionFormValues } from "../types";
import {
  hasSupportingDocumentPresent,
  isRemarkFilled,
  REMARK_REQUIRED_MESSAGE,
  SUPPORTING_DOCUMENT_REQUIRED_MESSAGE,
} from "../shared";

type RestrictionValidationContext = {
  showRestrictionType: boolean;
  setRestrictionError: UseFormSetError<RestrictionFormValues>;
  setApplicableError: (message: string) => void;
  setEffectiveFromError: (message: string) => void;
  setRemarkError: (message: string) => void;
  setSupportingDocumentError: (message: string) => void;
  restrictionDetails: RestrictionDetailsState;
};

function validateRestrictionLevelFields(
  values: RestrictionFormValues,
  setRestrictionError: UseFormSetError<RestrictionFormValues>,
): boolean {
  let hasError = false;

  if (
    values.restrictionLevel === "INSURER_CORPORATE" &&
    !hasCorporateIdsSelected(values.corporateIds)
  ) {
    setRestrictionError("corporateIds", { type: "required", message: "Corporate is required" });
    hasError = true;
  }

  if (
    values.restrictionLevel === "INSURER_RO" &&
    !hasRohOfficeIdsSelected(values.rohOfficeIds)
  ) {
    setRestrictionError("rohOfficeIds", { type: "required", message: "RO Office is required" });
    hasError = true;
  }

  const policyNumbers = Array.isArray(values.policyNumbers) ? values.policyNumbers : [];
  if (values.restrictionLevel === "INSURER_POLICY" && policyNumbers.length === 0) {
    setRestrictionError("policyNumbers", {
      type: "required",
      message: "At least one Policy Number is required",
    });
    hasError = true;
  }

  const ccnNumbers = Array.isArray(values.ccnNumbers) ? values.ccnNumbers : [];
  if (values.restrictionLevel === "INSURER_CCN" && ccnNumbers.length === 0) {
    setRestrictionError("ccnNumbers", {
      type: "required",
      message: "At least one CCN Number is required",
    });
    hasError = true;
  }

  return hasError;
}

export function validateRestrictionFormBeforeSave(
  values: RestrictionFormValues,
  ctx: RestrictionValidationContext,
): boolean {
  let hasError = false;

  if (!values.icName?.trim()) {
    ctx.setRestrictionError("icName", { type: "required", message: "Insurance Company is required" });
    hasError = true;
  }

  if (ctx.showRestrictionType && !values.restrictionType?.trim()) {
    ctx.setRestrictionError("restrictionType", {
      type: "required",
      message: "Restriction type is required",
    });
    hasError = true;
  }

  const applicableList = Array.isArray(values.restrictionApplicable)
    ? values.restrictionApplicable
    : [];
  if (applicableList.length === 0) {
    ctx.setApplicableError("Select at least one of Cashless or Reimbursement");
    hasError = true;
  } else {
    ctx.setApplicableError("");
  }

  if (!values.restrictionLevel?.trim()) {
    ctx.setRestrictionError("restrictionLevel", {
      type: "required",
      message: "Restriction Level is required",
    });
    hasError = true;
  }

  if (validateRestrictionLevelFields(values, ctx.setRestrictionError)) {
    hasError = true;
  }

  if (!ctx.restrictionDetails.effectiveFrom) {
    ctx.setEffectiveFromError("Effective From is required");
    hasError = true;
  } else {
    ctx.setEffectiveFromError("");
  }

  if (!isRemarkFilled(ctx.restrictionDetails.remark)) {
    ctx.setRemarkError(REMARK_REQUIRED_MESSAGE);
    hasError = true;
  } else {
    ctx.setRemarkError("");
  }

  if (!hasSupportingDocumentPresent(ctx.restrictionDetails)) {
    ctx.setSupportingDocumentError(SUPPORTING_DOCUMENT_REQUIRED_MESSAGE);
    hasError = true;
  } else {
    ctx.setSupportingDocumentError("");
  }

  return !hasError;
}
