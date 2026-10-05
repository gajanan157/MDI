import { useMemo } from "react";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { getUserPermissions, getUserRoles } from "./permissions";
import {
  canWriteBankDetails,
  canVerifyBankDetails,
  canWriteDiscount,
  canVerifyDiscount,
} from "./providerTabAccess";
import { canRead, canWrite, canWriteStrict } from "./permission-check";
import { useAppSelector } from "@/store/hooks/useAppSelector";

export function usePermission(module: string) {
  const { token } = useKeycloak();

  const permissions = useMemo(() => getUserPermissions(token || ""),[token]);
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : permissions;

  const isAdmin = effectivePermissions.has("*");
  const readable = canRead(effectivePermissions, module);
  const writable = canWrite(effectivePermissions, module);

  return {
    canRead: readable,
    canWrite: writable,
    isAdmin,
  };
}

export function useStrictPermission(module: string) {
  const { token } = useKeycloak();

  const permissions = useMemo(() => getUserPermissions(token || ""), [token]);
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : permissions;
  const isAdmin = effectivePermissions.has("*");
  const readable = canRead(effectivePermissions, module);
  const writable = canWriteStrict(effectivePermissions, module);

  return {
    canRead: readable,
    canWrite: writable,
    isAdmin,
  };
}

export function useBankDetailsAccess() {
  const { token } = useKeycloak();
  const permissions = useMemo(() => getUserPermissions(token || ""), [token]);
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : permissions;

  return useMemo(
    () => ({
      canWrite: canWriteBankDetails(effectivePermissions),
      canVerify: canVerifyBankDetails(effectivePermissions),
    }),
    [effectivePermissions],
  );
}

export function useDiscountAccess() {
  const { token } = useKeycloak();
  const permissions = useMemo(() => getUserPermissions(token || ""), [token],);
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : permissions;


  return useMemo(
    () => ({
      canWrite: canWriteDiscount(effectivePermissions),
      canVerify: canVerifyDiscount(effectivePermissions),
    }),
    [effectivePermissions],
  );
}



export function useRole() {
  const { token } = useKeycloak();

  const roles = useMemo(() => {
    if (!token) return new Set<string>();
    return getUserRoles(token);
  }, [token]);

    const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : roles;


  const hasRole = (role: string) => effectivePermissions.has(role);

  const isSuperAdmin = hasRole("super.admin");

  const isQC =
    isSuperAdmin ||
    // hasRole("qc") ||
    hasRole("corporate_enrolment_qc") ||
    hasRole("corporate_endorsement_qc");

  const isProcessor =
    // hasRole("processor") ||
    hasRole("corporate_enrolment_admin") ||
    hasRole("enrolment_super_admin") ||
    hasRole("corporate_endorsement_processor") ||
    hasRole("corporate_enrolment_processor");

  const isEnrollmentQC = hasRole("corporate_enrolment_qc");
  const isEndorsementQC = hasRole("corporate_endorsement_qc");

  const isEnrollmentProcessor = hasRole("corporate_enrolment_processor");
  const isEndorsementProcessor = hasRole("corporate_endorsement_processor");

  const enrollmentType = isEnrollmentQC || isEnrollmentProcessor ? "ENROLLMENT" : isEndorsementQC || isEndorsementProcessor ? "ENDORSEMENT" : undefined;
  return {
    hasRole,
    isQC,
    isProcessor,
    isSuperAdmin,
    isEnrollmentQC,
    isEndorsementQC,
    isEnrollmentProcessor,
    isEndorsementProcessor,
    enrollmentType,
  };
}

