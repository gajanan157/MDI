import { useEffect } from "react";
import { Navigate } from "react-router";
import { useKeycloak } from "../contexts/keycloak/KeycloakProvider";
import { jwtDecode } from "jwt-decode";
import { KeycloakJwtPayload } from "../auth/permissions";
import { getRouteByRole } from "../pages/AdminDepartment/tpa/funcation";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSelectedRoles } from "@/store/features/tpa/tpaSlice";

const FALLBACK_ROUTE = "/home";

const DynamicRedirect = () => {
  const { token } = useKeycloak();
  const decoded = jwtDecode<KeycloakJwtPayload>(token ?? "");
  const clientRoles = decoded?.resource_access?.["react-client"]?.roles ?? [];

  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const dispatch = useAppDispatch();

  // Keep whatever role was previously selected (e.g. via "Switch Role") if the
  // user still has it; otherwise fall back to the first role on their token.
  const activeRole =
    selectedRoles?.find((role) => clientRoles.includes(role)) ?? clientRoles[0];

  useEffect(() => {
    if (activeRole && selectedRoles?.[0] !== activeRole) {
      dispatch(setSelectedRoles([activeRole]));
    }
  }, [activeRole]);

  if (!activeRole) {
    console.warn("No role found on token, redirecting to fallback");
    return <Navigate to={FALLBACK_ROUTE} replace />;
  }

  return <Navigate to={getRouteByRole(activeRole)} replace />;
};

export default DynamicRedirect;
