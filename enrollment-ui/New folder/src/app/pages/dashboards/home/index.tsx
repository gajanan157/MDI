import { canRead } from "@/app/auth/permission-check";
import { getUserPermissions } from "@/app/auth/permissions";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { useMemo } from "react";
import { Navigate } from "react-router";

export default function Home() {
  const { token } = useKeycloak();

  // Single source of truth
  const permissions = useMemo(() => getUserPermissions(token ?? ""), [token]);


  // Decide landing page (priority-based)
  const landingPath = useMemo(() => {
    if (canRead(permissions, "insurer")) {
      return "/insurer-management/insurer";
    }
    if (canRead(permissions, "tpa")) {
      return "/tpa-management/tpa";
    }
    if (canRead(permissions, "enrollment")) {
      return "/enrolment-system/dashboard";
    }
    if (canRead(permissions, "enrollment")) {
      return "/master-management/corporate-group";
    }
    if (canRead(permissions, "inward")) {
      return "/inward-management/inward";
    }

    if (canRead(permissions, "policy")) {
      return "/policy-management/policy";
    }

    if (canRead(permissions, "provider")) {
      return "/provider-masters/dashboard";
    }

    return null;
  }, [permissions]);

  // Redirect if allowed
  if (landingPath) {
    return <Navigate to={landingPath} replace />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Access restricted
        </h1>
        <p className="mb-4 text-gray-600">
          You don’t have the necessary permissions to view this content.
        </p>
        <p className="text-sm text-gray-500">
          Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
