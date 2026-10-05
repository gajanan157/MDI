export const BANK_DETAILS_WRITE_PERMISSION = "provider-bank-details.write";
export const BANK_DETAILS_QC_ROLE = "bank-details.qc";
export const BANK_DETAILS_PROCESSOR_ROLE = "bank-details.processor";

export const DISCOUNT_QC_ROLE = "discount.qc";
export const DISCOUNT_PROCESSOR_ROLE = "discount.processor";

function hasWildcard(permissions: ReadonlySet<string>): boolean {
  return permissions.has("*");
}

/** Bank edit: explicit write permission, QC, or processor. */
export function canWriteBankDetails(permissions: ReadonlySet<string>): boolean {
  if (hasWildcard(permissions)) return true;
  return (
    permissions.has(BANK_DETAILS_WRITE_PERMISSION) ||
    permissions.has(BANK_DETAILS_QC_ROLE) ||
    permissions.has(BANK_DETAILS_PROCESSOR_ROLE)
  );
}

/** Bank verify: QC only (processor and plain write cannot verify). */
export function canVerifyBankDetails(permissions: ReadonlySet<string>): boolean {
  if (hasWildcard(permissions)) return true;
  return permissions.has(BANK_DETAILS_QC_ROLE);
}

/** Discount edit: QC or processor. */
export function canWriteDiscount(permissions: ReadonlySet<string>): boolean {
  if (hasWildcard(permissions)) return true;
  return (
    permissions.has(DISCOUNT_QC_ROLE) ||
    permissions.has(DISCOUNT_PROCESSOR_ROLE)
  );
}

/** Discount verify: QC only (processor cannot verify). */
export function canVerifyDiscount(permissions: ReadonlySet<string>): boolean {
  if (hasWildcard(permissions)) return true;
  return permissions.has(DISCOUNT_QC_ROLE);
}
