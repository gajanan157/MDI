// Import Dependencies
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { NavLink, useRouteLoaderData } from "react-router";
import invariant from "tiny-invariant";

// Local Imports
import { NavigationTree } from "@/@types/navigation";
import { getUserPermissions } from "@/app/auth/permissions";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { Badge } from "@/components/ui";
import { hasNavigationPermission } from "@/utils/isNavigationItemVisible";
import { useAppSelector } from "@/store/hooks/useAppSelector";

// ----------------------------------------------------------------------

export function MenuItem({ data }: Readonly<{ data: NavigationTree }>) {
  const { token } = useKeycloak();
  const { t } = useTranslation();
  const { close } = useSidebarContext();
  const rootLoaderData = useRouteLoaderData("root");

  if (data?.hidden) {
    return null;
  }

  if (data?.permission === undefined) {
    return null;
  }

  const permissions = getUserPermissions(token ?? "");
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : permissions;


  if (!hasNavigationPermission(data.permission, effectivePermissions)) {
    return null;
  }

  const { id, transKey, path, title } = data;

  invariant(path, `[MenuItem] Path is required for navigation item`);

  const label = transKey ? t(transKey) : title;
  const info = rootLoaderData?.[id]?.info;

  const handleMenuItemClick = () => close();

  return (
    <div className="relative flex">
      <NavLink
        to={path}
        onClick={handleMenuItemClick}
        className={({ isActive }) =>
          clsx(
            "group min-w-0 flex-1 rounded-md px-3 py-2 text-[12px] font-medium outline-hidden transition-colors ease-in-out",
            isActive
              ? "text-primary-600 dark:text-primary-400"
              : "text-gray-800 hover:bg-gray-100 hover:text-gray-950 focus:bg-gray-100 focus:text-gray-950 dark:text-dark-200 dark:hover:bg-dark-300/10 dark:hover:text-dark-50 dark:focus:bg-dark-300/10",
          )
        }
      >
        {({ isActive }) => (
          <div
            data-menu-active={isActive}
            className="flex min-w-0 items-center justify-between gap-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={clsx(
                  isActive
                    ? "bg-primary-600 opacity-80 dark:bg-primary-400"
                    : "opacity-50 transition-all",
                  "size-1.5 shrink-0 rounded-full border border-current",
                )}
              />
              <span
                title={label}
                className="min-w-0 break-words whitespace-normal text-[12px] leading-snug"
              >
                {label}
              </span>
            </div>
            {info && info.val && (
              <Badge
                color={info.color}
                className="h-5 min-w-5 shrink-0 rounded-full p-[5px]"
              >
                {info.val}
              </Badge>
            )}
          </div>
        )}
      </NavLink>
    </div>
  );
}
