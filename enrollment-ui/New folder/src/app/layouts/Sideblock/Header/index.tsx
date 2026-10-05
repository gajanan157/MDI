import type { NavigationTree } from "@/@types/navigation";
import { KeycloakJwtPayload } from "@/app/auth/permissions";
import { useAuthContext } from "@/app/contexts/auth/context";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { navigation as rawNavigation } from "@/app/navigation";
import { getRouteByRole } from "@/app/pages/AdminDepartment/tpa/funcation";
import ApacheLogo from "@/assets/mdi-appache.svg?react";
import MdIndiaLogo from "@/assets/mdilogo.svg?react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/Breadcrumbs";
import { LanguageSelector } from "@/components/template/LanguageSelector";
import { Notifications } from "@/components/template/Notifications";
import { setSelectedRoles } from "@/store/features/tpa/tpaSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { isKeycloakEnabled } from "@/utils/mockAuth";
import { getStoredToken, storeToken, switchRole } from "@/utils/localAuth";
import { filterNavigationByDepartment } from "@/utils/filterNavigationByDepartment";
import { generateBreadcrumbsFromNav } from "@/utils/generateBreadcrumbsFromNav";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { jwtDecode } from "jwt-decode";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";
export function Header() {
  const { pathname } = useLocation();
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const dept = user?.department?.toLowerCase?.() ?? undefined;
  const { isExpanded: isSidebarExpanded, toggle } = useSidebarContext();
  const { logout, userInfo } = useKeycloak();
  const { breadcrumbs: contextBreadcrumbs } = useBreadcrumbContext();
  // Hide breadcrumbs on small screens across Provider Management (header is crowded on mobile).
  const hideBreadcrumbOnProviderMobile = pathname.startsWith("/provider-masters");

  const navigation: NavigationTree[] = useMemo(() => {
    if (!Array.isArray(rawNavigation)) return [];

    return rawNavigation
      .map((node) => {
        try {
          const filtered = filterNavigationByDepartment(
            node as NavigationTree,
            dept,
          );
          if (
            Array.isArray((filtered as any).childs) &&
            (filtered as any).childs.length > 0
          ) {
            return filtered as NavigationTree;
          }
          if (!Array.isArray((filtered as any).childs)) {
            return filtered as NavigationTree;
          }
          return null;
        } catch {
          return node as NavigationTree;
        }
      })
      .filter(Boolean) as NavigationTree[];
  }, [dept]);

  // Map first URL segment to main module breadcrumb (generic for all modules)
  const SEGMENT_MAIN_MODULE: Record<string, { transKey: string; fallback: string }> = {
    "tpa-management": { transKey: "nav.dashboards.tpamanagement", fallback: "TPA Management" },
    "insurer-management": { transKey: "nav.dashboards.insurermanagement", fallback: "Insurer Management" },
    "mbm-management": { transKey: "nav.dashboards.mbmmanagement", fallback: "MBM Management" },
    "enrollment-system": { transKey: "nav.dashboards.enrollmentsystem", fallback: "Enrollment System" },
    "provider-masters": { transKey: "nav.dashboards.provider-masters", fallback: "Provider Management" },
  };

  // Generate breadcrumbs automatically from navigation if not set in context
  const autoBreadcrumbs = useMemo(() => {
    if (
      /\/providers\/(?:network|non-network)-providers\/[^/]+\/agreement\/[^/]+\/(view|edit)(?:\/?$)/.test(
        pathname,
      )
    ) {
      return generateBreadcrumbsFromNav(navigation, pathname, t);
    }
    if (contextBreadcrumbs && contextBreadcrumbs.length > 0) {
      const segment = pathname.split("/")[1];
      const config = segment ? SEGMENT_MAIN_MODULE[segment] : null;
      const mainModulePrepend: BreadcrumbItem | null = config
        ? { title: t(config.transKey) || config.fallback }
        : null;
      if (mainModulePrepend) {
        const firstTitle = contextBreadcrumbs[0]?.title ?? "";
        if (firstTitle !== mainModulePrepend.title) {
          return [mainModulePrepend, ...contextBreadcrumbs];
        }
      }
      return contextBreadcrumbs;
    }
    return generateBreadcrumbsFromNav(navigation, pathname, t);
  }, [contextBreadcrumbs, navigation, pathname, t]);
  const { token } = useKeycloak();

  const decoded = jwtDecode<KeycloakJwtPayload>(token as any);

  const groups = decoded?.groups || [];
  const roles = decoded?.resource_access?.["react-client"]?.roles || [];

  const { selectedRoles } = useAppSelector((state) => state.tpa);

const groupRoleList = roles?.map((role: string) => ({
  label: role
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()),
  value: role,
}));






  const selectedRoleValue =
    groupRoleList?.find(
      (role: any) => selectedRoles?.includes(role.value)
    )?.value || "";


  const [switchedRoleName, setSwitchedRoleName] = useState(selectedRoleValue);
  const [name, setName] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);



  const dispatch = useAppDispatch();
  const navigate = useNavigate()



  const handleSwitchRole = async () => {
    if (!switchedRoleName) return;

    if (!isKeycloakEnabled()) {
      // Local login: the server validates the role and returns a re-signed token carrying it.
      try {
        const current = getStoredToken();
        if (!current) return;
        storeToken(await switchRole(current, switchedRoleName));
      } catch (err) {
        console.error("Role switch rejected", err);
        return;
      }
    }

    const selectedRoleData = groupRoleList?.find((role: any) => role?.value === switchedRoleName);
    const groupName = selectedRoleData?.value || "";
    const groupNameForPopUp = selectedRoleData?.label || "";

    setName(groupNameForPopUp);

    setSwitchedRoleName(groupName);
    setShowSuccessPopup(true);


    dispatch(setSelectedRoles([switchedRoleName]));
    close();
    const route = getRouteByRole(groupName);
    navigate(route);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2000);
  };

  console.log("groupRoleList",groupRoleList,)
  console.log("groups",groups)
  return (
    <>
      <header className="dark:border-dark-600 dark:bg-dark-900 fixed top-0 right-0 left-0 z-40 flex min-h-10 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 sm:px-4 sm:py-0">
        {/* Left Section: MDIndia Logo + Breadcrumbs - allow shrink on mobile */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
          <div
            onClick={toggle}
            className={clsx(
              isSidebarExpanded && "active",
              "sidebar-toggle-btn text-primary-600 dark:text-primary-400 flex shrink-0 cursor-pointer flex-col justify-center space-y-1.5 outline-hidden focus:outline-hidden ltr:ml-0.5 rtl:mr-0.5",
            )}
          >
            <MdIndiaLogo
              className="text-primary-600 dark:text-primary-400 h-6 w-14 shrink-0 pl-1 sm:h-10 sm:w-20 sm:pl-4"
            />
          </div>
          {autoBreadcrumbs && autoBreadcrumbs.length > 0 && (
            <div className="min-w-0 flex-1 overflow-hidden">
              {hideBreadcrumbOnProviderMobile ? (
                <>
                  <div className="md:hidden">
                    <Breadcrumbs
                      showBackButton
                      showTrail={false}
                      items={autoBreadcrumbs}
                    />
                  </div>
                  <div className="hidden md:block">
                    <Breadcrumbs
                      showBackButton
                      items={autoBreadcrumbs}
                      className="text-[10px] sm:text-xs"
                    />
                  </div>
                </>
              ) : (
                <Breadcrumbs
                  showBackButton
                  items={autoBreadcrumbs}
                  className="text-[10px] sm:text-xs"
                />
              )}
            </div>
          )}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">

          {/* Live notifications from /ws/notifications */}
          <Notifications />
          <div aria-label="Language">
            <LanguageSelector />
          </div>
          {/* {!isSidebarExpanded && ( */}
          <Popover className="relative">
            <PopoverButton className="flex items-center justify-center outline-hidden focus:outline-hidden">
              <div className="bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800 flex h-8 w-8 items-center justify-center rounded-full transition-colors">
                {userInfo?.name ? (
                  (() => {
                    const nameParts = userInfo.name
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean);
                    const firstName = nameParts[0] || "";
                    const surname =
                      nameParts.length > 1
                        ? nameParts[nameParts.length - 1]
                        : "";
                    const initials =
                      (firstName[0] || "") + (surname[0] || firstName[0] || "");
                    return (
                      <span className="text-sm font-semibold">
                        {initials.toUpperCase()}
                      </span>
                    );
                  })()
                ) : (
                  <UserCircleIcon className="h-5 w-5" />
                )}
              </div>
            </PopoverButton>
            <Transition
              enter="duration-200 ease-out"
              enterFrom="translate-y-2 opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="duration-200 ease-out"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-2 opacity-0">
              <PopoverPanel
                anchor={{ to: "bottom end", gap: 12 }}
                className="border-gray-150 shadow-soft dark:border-dark-600 dark:bg-dark-700 z-70 flex w-56 flex-col rounded-lg border bg-white transition dark:shadow-none">
                {({ close }: { close: () => void }) => (
                  <div className="flex flex-col p-3">
                    {/* User Full Name */}
                    {userInfo?.name && (
                      <div className="dark:border-dark-600 mb-1 border-b border-gray-200">
                        <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                          {userInfo.name}
                        </span>
                      </div>
                    )}
                    <div className="rounded-lg bg-white overflow-hidden">
                      <h2 className="text-[12px]  text-black">
                        SWITCH ROLE GROUP
                      </h2>
                      <div className="max-h-[400px] overflow-y-auto shadow-xl">
                        {groupRoleList?.map((role: any, index: number) => {
                          const isSelected = switchedRoleName === role?.value;
                          return (
                            <div
                              key={`${role}-${index}`}
                              onClick={() => setSwitchedRoleName(role?.value)}
                              className={`flex items-center justify-between px-2 py-2 cursor-pointer border-b border-gray-200 transition-colors
                            ${isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"}`}>
                              <span className={`w-[90%] text-[11px] ${isSelected ? "font-medium text-blue-700" : "text-gray-700"}`} >
                                {role?.label}
                              </span>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-blue-500" : "border-gray-400"}`}>
                                {isSelected && (<div className="w-2 h-2 rounded-full bg-blue-500" />)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end gap-3   py-2 bg-white border-t border-b border-gray-200">
                        <button type="button"
                          onClick={handleSwitchRole}
                          disabled={!switchedRoleName}
                          className="cursor-pointer px-1 py-1 rounded-md bg-blue-500 text-white text-[12px] hover:bg-blue-600 transition shadow-sm">Switch Role</button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        close();
                      }}
                      className="cursor-pointer dark:hover:bg-dark-600 flex items-center gap-3 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200"
                    >
                      <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </PopoverPanel>
            </Transition>
          </Popover>
          {/*  )} */}

          <Link
            to="/"
            className="flex shrink-0 items-center"
            title="MDIndia Health Insurance TPA Private Limited — IRDAI Licence No. 005"
            aria-label="Home"
          >
            <ApacheLogo
              className="text-primary-600 dark:text-primary-400 h-8 w-auto sm:h-9"
            />
          </Link>
        </div>
      </header>
      {showSuccessPopup && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/20">
          <div className="w-[360px] rounded-lg bg-white shadow-2xl px-6 py-5 text-center">

            {/* Success Icon */}
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white">
                ✓
              </div>
            </div>

            {/* Title */}
            <h2 className="text-[18px] font-semibold text-gray-800">
              Success!
            </h2>

            {/* Message */}
            <p className="mt-1 text-[14px] text-gray-600">
              Role Switched to{" "}
              <span className="font-medium text-gray-800">
                {name}
              </span>
              .
            </p>
          </div>
        </div>
      )}

    </>
  );
}


