import { Link } from "react-router";
import clsx from "clsx";
import { SetStateAction, Dispatch, useMemo } from "react";
import { filterNavigationByDepartment } from "@/utils/filterNavigationByDepartment";
// Local Imports
// import Logo from "@/assets/appLogo.svg?react";
import Logo from "@/assets/mdilogo.svg?react";
import { Menu } from "./Menu";
import { Item } from "./Menu/item";
import { Profile } from "../../Profile";
import { useThemeContext } from "@/app/contexts/theme/context";
import { settings } from "@/app/navigation/segments/settings";
import { NavigationTree } from "@/@types/navigation";
import { SegmentPath } from "..";
import { useAuthContext } from "@/app/contexts/auth/context";
import { dashboards } from "@/app/navigation/segments/dashboards";
// ----------------------------------------------------------------------

// Define Prop Types
interface MainPanelProps {
  nav: NavigationTree[]; // original nav prop (fallback)
  setActiveSegmentPath?: Dispatch<SetStateAction<SegmentPath>>;
  activeSegmentPath: SegmentPath;
}

export function MainPanel({
  nav,
  setActiveSegmentPath,
  activeSegmentPath,
}: MainPanelProps) {
  const { cardSkin } = useThemeContext();
  const { user } = useAuthContext();
  const dept = user?.department?.toLowerCase();

  const filteredNav = useMemo(
    () => filterNavigationByDepartment(dashboards, dept),
    [dept],
  );

  // Determine what to pass to Menu:
  // - if filteredNav.root has childs, use them
  // - otherwise fallback to the `nav` prop passed into MainPanel
  const menuItemsForMenu = useMemo(() => {
    // filteredNav may be a root NavigationTree with `childs` property
    if (
      filteredNav &&
      Array.isArray((filteredNav as any).childs) &&
      (filteredNav as any).childs.length > 0
    ) {
      return (filteredNav as any).childs as NavigationTree[];
    }
    // fallback: use nav prop if provided (keeps current behavior)
    return nav ?? [];
  }, [filteredNav, nav]);

  // optional debug: remove in production

  return (
    <div className="main-panel">
      <div
        className={clsx(
          "border-gray-150 dark:border-dark-600/80 flex h-full w-full flex-col items-center bg-white ltr:border-r rtl:border-l",
          cardSkin === "shadow" ? "dark:bg-dark-750" : "dark:bg-dark-900",
        )}
      >
        {/* Application Logo */}
        <div className="flex pt-3.5">
          <Link to="/">
            <Logo className="text-primary-600 dark:text-primary-400 size-10" />
            {/* <p className="text-primary-600 text-2xl font-bold dark:text-primary-400 size-10">
              {title}
            </p> */}
          </Link>
        </div>

        <Menu
          nav={menuItemsForMenu}
          activeSegmentPath={activeSegmentPath}
          setActiveSegmentPath={setActiveSegmentPath}
        />

        {/* Bottom Links */}
        <div className="flex flex-col items-center space-y-3 py-2.5">
          <Item
            id={settings.id}
            component={Link}
            to="/settings/appearance"
            title="Settings"
            isActive={activeSegmentPath === settings.path}
            icon={settings.icon}
          />
          <Profile />
        </div>
      </div>
    </div>
  );
}
