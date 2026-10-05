// Import Dependencies
import { ReactNode, HTMLAttributes, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import { useLocaleContext } from "@/app/contexts/locale/context";

// ----------------------------------------------------------------------

export interface BreadcrumbItem {
  title: string;
  path?: string;
  onClick?: () => void;
  disabled?: boolean;
  state?: unknown;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLUListElement> {
  items?: BreadcrumbItem[];
  className?: string;
  /** When true, render a browser Back control before the trail (e.g. dashboard header). */
  showBackButton?: boolean;
  /** When false, hide the crumb trail and keep only the back button (if shown). Default true. */
  showTrail?: boolean;
}

/** Prefer breadcrumb hierarchy over history so Back works after refresh and stays module-scoped. */
function stripTrailingSlashes(path: string): string {
  if (path === "/" || !path.endsWith("/")) return path;
  let end = path.length;
  while (end > 1 && path.charAt(end - 1) === "/") {
    end -= 1;
  }
  return path.slice(0, end);
}

function normalizeBreadcrumbPath(path: string): string {
  const withoutQuery = path.split("?")[0]?.split("#")[0] ?? path;
  if (!withoutQuery || withoutQuery === "/") return "/";
  return stripTrailingSlashes(withoutQuery);
}

function findBackTargetFromBreadcrumbs(
  items: BreadcrumbItem[],
  currentPathname?: string,
): BreadcrumbItem | null {
  const currentPath = currentPathname
    ? normalizeBreadcrumbPath(currentPathname)
    : null;

  const isSameAsCurrent = (item: BreadcrumbItem) =>
    Boolean(
      currentPath &&
        item.path &&
        normalizeBreadcrumbPath(item.path) === currentPath,
    );

  if (items.length === 0) return null;
  if (items.length === 1) {
    const only = items[0];
    if (isSameAsCurrent(only)) return null;
    return only.path || only.onClick ? only : null;
  }
  for (let i = items.length - 2; i >= 0; i--) {
    const it = items[i];
    if (it.path || it.onClick) {
      if (isSameAsCurrent(it)) continue;
      return it;
    }
  }
  const last = items[items.length - 1];
  if (isSameAsCurrent(last)) return null;
  if (last.path || last.onClick) return last;
  return null;
}

function Breadcrumbs({
  items = [],
  className,
  showBackButton = false,
  showTrail = true,
  ...rest
}: Readonly<BreadcrumbsProps>): ReactNode {
  const { isRtl } = useLocaleContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const finalItems = items;

  const backTarget = useMemo(
    () => findBackTargetFromBreadcrumbs(finalItems, pathname),
    [finalItems, pathname],
  );
  const canNavigateBack = backTarget != null;

  const handleBackClick = () => {
    if (!backTarget) return;
    if (backTarget.path) {
      // navigate(backTarget.path);
      navigate(backTarget.path,{
        state: backTarget.state,
      });
      return;
    }
    if (backTarget.onClick) {
      backTarget.onClick();
    }
  };

  const SeparatorIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;

  const list = showTrail ? (
    <ul
      className={clsx(
        "flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto overflow-y-hidden",
        className
      )}
      {...rest}
    >
      {finalItems.map((item, i) => (
        // Explicit item-level guard to force plain text even if path/onClick is present.
        // Useful when a crumb is informational in some flows.
        (() => {
          const isClickable = !item.disabled && Boolean(item.path || item.onClick);
          return (
        <li
          key={i}
          className={clsx(
            "flex items-center gap-1.5",
            i === finalItems.length - 1 ? "min-w-0 max-w-full shrink truncate" : "shrink-0"
          )}
        >
          {isClickable ? (
            <>
              {item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="cursor-pointer text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 tracking-wide transition-colors"
                >
                  {item.title}
                </button>
              ) : (
                <button
                  type="button"
                  // onClick={() => navigate(item.path!)}
                  onClick={() =>
                    navigate(item.path!, {
                      state: item.state,
                    })
                  }
                  className="cursor-pointer text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 tracking-wide transition-colors"
                >
                  {item.title}
                </button>
              )}
              {i < finalItems.length - 1 && (
                <SeparatorIcon className="size-5 text-gray-400" />
              )}
            </>
          ) : (
            <>
              <span className="font-medium tracking-wide text-gray-600 dark:text-gray-300">
                {item.title}
              </span>
              {i < finalItems.length - 1 && (
                <SeparatorIcon className="size-5 text-gray-400" />
              )}
            </>
          )}
        </li>
          );
        })()
      ))}
    </ul>
  ) : null;

  if (!showBackButton) {
    return list;
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-1.5">
      <button
        type="button"
        disabled={!canNavigateBack}
        onClick={handleBackClick}
        className={clsx(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm",
          canNavigateBack
            ? "cursor-pointer border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-dark-500 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600"
            : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-60 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-500",
        )}
        aria-label={canNavigateBack ? "Back" : "Back unavailable"}
        title={
          canNavigateBack
            ? "Back to previous step"
            : "No parent route in this breadcrumb trail"
        }
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
      </button>
      {list}
    </div>
  );
}

export { Breadcrumbs };
