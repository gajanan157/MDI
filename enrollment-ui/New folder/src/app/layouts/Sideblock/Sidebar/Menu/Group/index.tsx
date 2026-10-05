// Import Dependencies
import invariant from "tiny-invariant";

// Local Imports
import { type NavigationTree } from "@/@types/navigation";
import { getUserPermissions } from "@/app/auth/permissions";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { hasNavigationPermission, isNavigationItemVisible } from "@/utils/isNavigationItemVisible";
import { CollapsibleItem } from "./CollapsibleItem";
import { MenuItem } from "./MenuItem";
import { useAppSelector } from "@/store/hooks/useAppSelector";

// ----------------------------------------------------------------------

export function Group({ data }: Readonly<{ data: NavigationTree }>) {
  invariant(
    data.childs && data.childs.length > 0,
    "[Group] Group menu must have at least one child",
  );
  const { token } = useKeycloak();
  const permissions = getUserPermissions(token || "");
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles): permissions;


  return (
    <div className="">
      {data.childs && data.childs.length > 0 && (
        <div className="flex flex-col">
          {data.childs
            .filter((item) => isNavigationItemVisible(item, effectivePermissions))
            .filter((item) => hasNavigationPermission(item.permission, effectivePermissions))
            .map((item) => {
              switch (item.type) {
                case "collapse":
                  return <CollapsibleItem key={item.path ?? item.id} data={item} />;
                case "item":
                  return <MenuItem key={item.path ?? item.id} data={item} />;
                default:
                  return null;
              }
            })}
        </div>
      )}
    </div>
  );
}
