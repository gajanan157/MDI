// src/utils/mockAuth.ts

/**
 * Checks whether Keycloak SSO is enabled via environment variables.
 * Defaults to true only if explicitly set to "true".
 * Can be toggled with a single variable: VITE_ENABLE_KEYCLOAK="false" | "true"
 */
export function isKeycloakEnabled(): boolean {
  const env: Record<string, any> =
    typeof globalThis.window !== "undefined" &&
    globalThis.window.__ENV__ &&
    Object.keys(globalThis.window.__ENV__).length > 0
      ? globalThis.window.__ENV__
      : import.meta.env;

  const enableKeycloak = env?.VITE_ENABLE_KEYCLOAK;
  if (enableKeycloak !== undefined && enableKeycloak !== null) {
    return String(enableKeycloak).trim().toLowerCase() === "true";
  }

  // Also honor VITE_USE_MOCK if defined
  const useMock = env?.VITE_USE_MOCK;
  if (useMock !== undefined && useMock !== null) {
    return String(useMock).trim().toLowerCase() !== "true";
  }

  return true;
}

/**
 * Standard base64 URL encoder compatible with browser and node
 */
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Build a valid JWT formatted string (header.payload.signature)
 * that jwt-decode can parse without any error, pre-populated with
 * all administrative roles and wildcard permissions.
 */
function createMockJwtToken(): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    sub: "usr-mock-admin-001",
    preferred_username: "mdindia_admin",
    name: "MD India Super Admin",
    given_name: "MD India",
    family_name: "Super Admin",
    email: "admin@mdindia.com",
    email_verified: true,
    department: "Administration",
    realm_access: {
      roles: [
        "admin",
        "super.admin",
        "provider.admin",
        "enrolment_super_admin",
        "corporate_enrolment_admin",
      ],
    },
    resource_access: {
      "react-client": {
        roles: [
          "*",
          "super.admin",
          "admin",
          "provider.admin",
          "enrolment_super_admin",
          "corporate_enrolment_admin",
          "corporate_enrolment_processor",
          "corporate_enrolment_qc",
          "corporate_endorsement_processor",
          "corporate_endorsement_qc",
          "enrolment_e_card_admin",
          "enrolment_e_card_processor",
          "tpa.read",
          "tpa.write",
          "branch.read",
          "branch.write",
          "insurer.read",
          "insurer.write",
          "insurer-office.read",
          "insurer-office.write",
          "insurer-office-hierarchy.write",
          "inward.read",
          "inward.write",
          "inward_team",
          "master-product",
          "master-product.read",
          "master-product.write",
          "provider",
          "provider-list",
          "provider-list.write",
          "provider-details.write",
          "provider-bank-details",
          "provider-bank-details.write",
          "provider-agreement.write",
          "provider-soc.write",
          "provider-discount.write",
          "provider-facility.write",
          "provider-infrastructure.write",
          "provider-manpower.write",
          "provider-owner.write",
          "provider-documents.write",
          "provider-restriction.write",
          "bank-details.processor",
          "bank-details.qc",
          "discount.processor",
          "discount.qc",
          "manager_administration.read",
          "manager_administration.write",
        ],
      },
    },
    // Expiration: year 2099
    exp: 4102444800,
    iat: 1700000000,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const mockSignature = base64UrlEncode("mock_mdindia_secret_signature");

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

export const MOCK_KEYCLOAK_TOKEN = createMockJwtToken();

export const MOCK_KEYCLOAK_USER_INFO = {
  sub: "usr-mock-admin-001",
  preferred_username: "mdindia_admin",
  name: "MD India Super Admin",
  given_name: "MD India",
  family_name: "Super Admin",
  email: "admin@mdindia.com",
  email_verified: true,
};
