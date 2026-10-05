import {
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
// Local Imports
import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { useThemeContext } from "@/app/contexts/theme/context";
import { useDidUpdate } from "@/hooks";
import { use920Breakpoint } from "@/hooks/use920Breakpoint";
import { Menu } from "./Menu";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";

export function Sidebar() {
  const { cardSkin } = useThemeContext();
  const { logout, userInfo } = useKeycloak();
  const { name } = useBreakpointsContext();
  const {
    isExpanded: isSidebarExpanded,
    close: closeSidebar,
  } = useSidebarContext();
  const is920AndDown = use920Breakpoint();
  const user = {
    fullName: userInfo?.name ?? "",
  };

  // Generate 2-letter initials from name
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n: any) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleLogout = () => {
    logout();
  };

  useDidUpdate(() => {
    if (isSidebarExpanded) closeSidebar();
  }, [name]);

  return (
    <div
      className={clsx(
        "sidebar-panel flex flex-col",
        cardSkin === "shadow"
          ? "shadow-soft dark:shadow-dark-900/60"
          : "dark:border-dark-600/80 border-gray-200 ltr:border-r rtl:border-l pt-2",
      )}
    >
      <div
        className={clsx(
          "relative flex h-full grow flex-col bg-white",
          cardSkin === "shadow" ? "dark:bg-dark-750" : "dark:bg-dark-900",
        )}
      >
         <div
          className={clsx(
            "transition-all duration-300",
            !isSidebarExpanded &&
              !is920AndDown &&
              "pointer-events-none opacity-0",
          )}
        >
        </div>
        <div
          className={clsx(
            "grow overflow-auto transition-all duration-300",
            !isSidebarExpanded &&
              !is920AndDown &&
              "pointer-events-none opacity-0",
          )}
        >
          <Menu />
        </div>
        <div
          className={clsx(
            "dark:border-dark-600 dark:bg-dark-800 flex items-center border-t border-gray-200 bg-gray-50 py-3 transition-all duration-300",
            isSidebarExpanded || is920AndDown
              ? "justify-between px-4"
              : "justify-center px-2",
          )}
        >
          <div
            className={clsx(
              "flex items-center transition-all duration-300",
              isSidebarExpanded || is920AndDown ? "gap-3" : "gap-0",
            )}
          >
            <div className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
              {initials}
            </div>
            {(isSidebarExpanded || is920AndDown) && (
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-medium text-gray-800 dark:text-gray-100">
                  {user.fullName}
                </span>
              </div>
            )}
          </div>
          {(isSidebarExpanded || is920AndDown) && (
            <button
              type="button"
              onClick={handleLogout}
              className="dark:hover:bg-dark-700 rounded-md p-2 transition hover:bg-gray-200"
              title="Logout"
            >
              <ArrowLeftStartOnRectangleIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
