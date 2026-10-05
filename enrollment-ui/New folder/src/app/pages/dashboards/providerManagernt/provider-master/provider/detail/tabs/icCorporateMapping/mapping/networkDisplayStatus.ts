/**
 * Derives Network Mapping table display status from network + cashless + reimbursement.
 * Single source of truth — use everywhere the mapping status is shown.
 */

export const NETWORK_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const CASHLESS_STATUS = {
  ALLOWED: "ALLOWED",
  ON_HOLD: "ON_HOLD",
} as const;

export const REIMBURSEMENT_STATUS = {
  ALLOWED: "ALLOWED",
  NOT_ALLOWED: "NOT_ALLOWED",
} as const;

export const NETWORK_DISPLAY_STATUS = {
  DEPANELLED: "DEPANELLED",
  EMPANELLED: "EMPANELLED",
  WATCHLIST: "WATCHLIST",
  BLACKLIST: "BLACKLIST",
} as const;

export type NetworkStatusState =
  (typeof NETWORK_STATUS)[keyof typeof NETWORK_STATUS];
export type CashlessStatusState =
  (typeof CASHLESS_STATUS)[keyof typeof CASHLESS_STATUS];
export type ReimbursementStatusState =
  (typeof REIMBURSEMENT_STATUS)[keyof typeof REIMBURSEMENT_STATUS];
export type NetworkDisplayStatus =
  (typeof NETWORK_DISPLAY_STATUS)[keyof typeof NETWORK_DISPLAY_STATUS];

function normalizeToken(value: unknown): string {
  if (value == null) return "";
  return String(value).trim().toUpperCase().replaceAll(/[\s-]+/g, "_");
}

/** Map API / boolean network flag → ACTIVE | INACTIVE. */
export function resolveNetworkStatusState(
  networkStatus: unknown,
): NetworkStatusState {
  if (networkStatus === true || networkStatus === 1) return NETWORK_STATUS.ACTIVE;
  if (networkStatus === false || networkStatus === 0) return NETWORK_STATUS.INACTIVE;

  const token = normalizeToken(networkStatus);
  if (
    token === "ACTIVE" ||
    token === "TRUE" ||
    token === "YES" ||
    token === "Y" ||
    token === "1"
  ) {
    return NETWORK_STATUS.ACTIVE;
  }
  return NETWORK_STATUS.INACTIVE;
}

/**
 * Cashless: ALLOWED when unrestricted; ON_HOLD when restricted.
 * null / undefined / unknown → ALLOWED (safe default; matches empty restriction).
 */
export function resolveCashlessStatusState(
  cashlessStatus: unknown,
): CashlessStatusState {
  if (cashlessStatus === true || cashlessStatus === 1) return CASHLESS_STATUS.ALLOWED;
  if (cashlessStatus === false || cashlessStatus === 0) return CASHLESS_STATUS.ON_HOLD;

  const token = normalizeToken(cashlessStatus);
  if (!token) return CASHLESS_STATUS.ALLOWED;
  if (
    token === "ON_HOLD" ||
    token === "ONHOLD" ||
    token === "HOLD" ||
    token === "RESTRICTED" ||
    token === "NOT_ALLOWED" ||
    token === "FALSE" ||
    token === "NO" ||
    token === "0"
  ) {
    return CASHLESS_STATUS.ON_HOLD;
  }
  if (
    token === "ALLOWED" ||
    token === "TRUE" ||
    token === "YES" ||
    token === "Y" ||
    token === "1"
  ) {
    return CASHLESS_STATUS.ALLOWED;
  }
  return CASHLESS_STATUS.ALLOWED;
}

/**
 * Reimbursement: ALLOWED when unrestricted; NOT_ALLOWED when restricted.
 * null / undefined / unknown → ALLOWED (safe default).
 */
export function resolveReimbursementStatusState(
  reimbursementStatus: unknown,
): ReimbursementStatusState {
  if (reimbursementStatus === true || reimbursementStatus === 1) {
    return REIMBURSEMENT_STATUS.ALLOWED;
  }
  if (reimbursementStatus === false || reimbursementStatus === 0) {
    return REIMBURSEMENT_STATUS.NOT_ALLOWED;
  }

  const token = normalizeToken(reimbursementStatus);
  if (!token) return REIMBURSEMENT_STATUS.ALLOWED;
  if (
    token === "NOT_ALLOWED" ||
    token === "NOTALLOWED" ||
    token === "RESTRICTED" ||
    token === "FALSE" ||
    token === "NO" ||
    token === "0"
  ) {
    return REIMBURSEMENT_STATUS.NOT_ALLOWED;
  }
  if (
    token === "ALLOWED" ||
    token === "TRUE" ||
    token === "YES" ||
    token === "Y" ||
    token === "1"
  ) {
    return REIMBURSEMENT_STATUS.ALLOWED;
  }
  return REIMBURSEMENT_STATUS.ALLOWED;
}

/**
 * Priority:
 * 1. INACTIVE → DEPANELLED
 * 2. ACTIVE + ALLOWED + ALLOWED → EMPANELLED
 * 3. ACTIVE + ON_HOLD + NOT_ALLOWED → BLACKLIST
 * 4. ACTIVE + (ON_HOLD OR NOT_ALLOWED) → WATCHLIST
 */
export function getNetworkDisplayStatus(
  networkStatus: unknown,
  cashlessStatus: unknown,
  reimbursementStatus: unknown,
): NetworkDisplayStatus {
  const network = resolveNetworkStatusState(networkStatus);
  const cashless = resolveCashlessStatusState(cashlessStatus);
  const reimbursement = resolveReimbursementStatusState(reimbursementStatus);

  if (network === NETWORK_STATUS.INACTIVE) {
    return NETWORK_DISPLAY_STATUS.DEPANELLED;
  }

  if (
    cashless === CASHLESS_STATUS.ALLOWED &&
    reimbursement === REIMBURSEMENT_STATUS.ALLOWED
  ) {
    return NETWORK_DISPLAY_STATUS.EMPANELLED;
  }

  if (
    cashless === CASHLESS_STATUS.ON_HOLD &&
    reimbursement === REIMBURSEMENT_STATUS.NOT_ALLOWED
  ) {
    return NETWORK_DISPLAY_STATUS.BLACKLIST;
  }

  return NETWORK_DISPLAY_STATUS.WATCHLIST;
}

/** Convenience: grid booleans (`true` = allowed / unrestricted). */
export function getNetworkDisplayStatusFromFlags(
  providerNetworkIsActive: boolean | null | undefined,
  cashlessAllowed: boolean | null | undefined,
  reimbursementAllowed: boolean | null | undefined,
): NetworkDisplayStatus {
  return getNetworkDisplayStatus(
    providerNetworkIsActive,
    cashlessAllowed,
    reimbursementAllowed,
  );
}

export function getNetworkDisplayStatusBadgeClass(
  status: NetworkDisplayStatus,
): string {
  switch (status) {
    case NETWORK_DISPLAY_STATUS.EMPANELLED:
      return "bg-green-100 text-green-700";
    case NETWORK_DISPLAY_STATUS.WATCHLIST:
      return "bg-orange-100 text-orange-800";
    case NETWORK_DISPLAY_STATUS.BLACKLIST:
      return "bg-red-100 text-red-700";
    case NETWORK_DISPLAY_STATUS.DEPANELLED:
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
