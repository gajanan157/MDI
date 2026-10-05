// Import Dependencies
import { useEffect, useMemo, useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import invariant from "tiny-invariant";

// Local Imports
import {
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Collapse,
} from "@/components/ui";
import { useLocaleContext } from "@/app/contexts/locale/context";
import { MenuItem } from "./MenuItem";
import { type NavigationTree } from "@/@types/navigation";
import { navigationIcons } from "@/app/navigation/icons";
import { isRouteActive } from "@/utils/isRouteActive";
import { getUserPermissions } from "@/app/auth/permissions";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { isNavigationItemVisible } from "@/utils/isNavigationItemVisible";
import { useAppSelector } from "@/store/hooks/useAppSelector";

function NestedCollapseItem({
  data,
  depth = 0,
}: Readonly<{ data: NavigationTree; depth?: number }>) {
  const { transKey, title, icon } = data;
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const { pathname } = useLocation();
  const { token } = useKeycloak();
  const permissions = getUserPermissions(token ?? "");
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : permissions;


  const childs = useMemo(
    () =>
      data.childs?.filter((child) =>
        isNavigationItemVisible(child, effectivePermissions),
      ) ?? [],
    [data.childs, effectivePermissions],
  );

  const hasActiveChild = Boolean(
    childs.some((child) => child.path && isRouteActive(child.path, pathname)),
  );
  const [open, setOpen] = useState(true);
  const label = transKey ? t(transKey) : title;
  const ChevronIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
  const Icon = icon && navigationIcons[icon] ? navigationIcons[icon] : null;

  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  if (!childs.length) return null;

  return (
    <div className={clsx("flex flex-1 flex-col", depth === 0 && "pl-1")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "group flex flex-1 cursor-pointer items-center justify-between rounded-lg py-2 text-[12px] font-medium outline-hidden transition-colors duration-300 ease-in-out",
          depth === 0 ? "px-3" : "px-2",
          "dark:text-dark-200 dark:hover:bg-dark-300/10 dark:hover:text-dark-50 text-gray-800 hover:bg-gray-100 hover:text-gray-950 focus:bg-gray-100 focus:text-gray-950",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {Icon && (
            <Icon
              className={clsx(
                "shrink-0 stroke-[1.5] opacity-80 group-hover:opacity-100",
                depth === 0 ? "size-4" : "size-3.5",
              )}
            />
          )}
          <span
            title={label}
            className="min-w-0 wrap-break-word whitespace-normal leading-snug"
          >
            {label}
          </span>
        </div>
        <ChevronIcon
          className={clsx(
            "shrink-0 opacity-60 transition-transform",
            depth === 0 ? "size-4" : "size-3.5",
            open && "ltr:rotate-90 rtl:-rotate-90",
          )}
        />
      </button>
      <Collapse in={open}>
        <div
          className={clsx(
            "flex flex-col space-y-1 py-1.5",
            depth === 0 ? "pl-4" : "pl-3",
          )}
        >
          {childs
            .map((child) => {
              if (child.type === "collapse") {
                return (
                  <NestedCollapseItem
                    key={child.id ?? child.path}
                    data={child}
                    depth={depth + 1}
                  />
                );
              }

              if (child.type === "item") {
                return <MenuItem key={child.id ?? child.path} data={child} />;
              }

              return null;
            })}
        </div>
      </Collapse>
    </div>
  );
}

export function CollapsibleItem({ data }: Readonly<{ data: NavigationTree }>) {
  const { id, path, transKey, icon, title } = data;
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const { token } = useKeycloak();
  const permissions = getUserPermissions(token ?? "");
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : permissions;
// console.log("effectivePermissions",effectivePermissions)

  const childs = useMemo(
    () =>
      data.childs?.filter((child) =>
        isNavigationItemVisible(child, effectivePermissions),
      ) ?? [],
    [data.childs, effectivePermissions],
  );

  if (!childs.length) return null;

  invariant(path, `[CollapsibleItem] path is required for navigation item`);

  invariant(
    icon && navigationIcons[icon],
    `[CollapsibleItem] Icon "${icon}" not found in navigationIcons registry for item: ${path}`,
  );

  const label = transKey ? t(transKey) : title;
  const ChevronIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
  const Icon = navigationIcons[icon];
  return (
    <AccordionItem
      value={path ?? id}
      className="relative flex flex-1 flex-col px-3"
    >
      {({ open }) => (
        <>
          <AccordionButton
            className={clsx(
              "group flex flex-1 cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium outline-hidden transition-colors duration-300 ease-in-out",
              open
                ? "dark:text-dark-50 text-gray-800"
                : "dark:text-dark-200 dark:hover:bg-dark-300/10 dark:hover:text-dark-50 dark:focus:text-dark-300/10 text-gray-800 hover:bg-gray-100 hover:text-gray-950 focus:bg-gray-100 focus:text-gray-950",
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {Icon && (
                <Icon
                  className={clsx(
                    "size-[18px] shrink-0 stroke-[1.5]",
                    !open && "opacity-80 group-hover:opacity-100",
                  )}
                />
              )}
              <span className="truncate">{label}</span>
            </div>
            <ChevronIcon
              className={clsx(
                "size-4 shrink-0 transition-transform",
                open && "ltr:rotate-90 rtl:-rotate-90",
              )}
            />
          </AccordionButton>
          <AccordionPanel className="flex flex-col space-y-1 px-3 py-1.5">
            {childs
              .map((child) => {
                if (child.type === "collapse") {
                  return <NestedCollapseItem key={child.id ?? child.path} data={child} />;
                }

                if (child.type === "item") {
                  return <MenuItem key={child.id ?? child.path} data={child} />;
                }

                return null;
              })}
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  );
}
