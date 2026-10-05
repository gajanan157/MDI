
import { useMemo, useState } from "react";
import { useLocation } from "react-router";


import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { navigation } from "@/app/navigation";
import { useDidUpdate } from "@/hooks";
import { isRouteActive } from "@/utils/isRouteActive";
import { MainPanel } from "./MainPanel";
import { PrimePanel } from "./PrimePanel";
import { NavigationTree } from "@/@types/navigation";

export type SegmentPath = string | undefined;

function stripTrailingSlashes(path: string): string {
  let end = path.length;
  while (end > 0 && path[end - 1] === "/") {
    end -= 1;
  }
  return path.slice(0, end);
}

function normalizeNavPath(path = ""): string {
  const withoutQuery = path.includes("?") ? path.slice(0, path.indexOf("?")) : path;
  const withoutHash = withoutQuery.includes("#")
    ? withoutQuery.slice(0, withoutQuery.indexOf("#"))
    : withoutQuery;
  return stripTrailingSlashes(withoutHash);
}

function findDeepestMatch(
  items: NavigationTree[] | undefined,
  pathnameArg: string,
  parentBase = "",
): NavigationTree | undefined {
  if (!items?.length) return undefined;

  const normalizedPath = normalizeNavPath(pathnameArg);

  const getFull = (raw: string) =>
    normalizeNavPath(raw.startsWith("/") ? raw : `${parentBase}/${raw}`);

  const isMatch = (full: string) =>
    !!full && (normalizedPath === full || normalizedPath.startsWith(`${full}/`));

  const chooseBetter = (a?: NavigationTree, b?: NavigationTree) => {
    if (!a) return b;
    if (!b) return a;
    return (a.path ?? "").length >= (b.path ?? "").length ? a : b;
  };

  let best: NavigationTree | undefined;

  for (const it of items) {
    if (!it?.path) continue;

    const full = getFull(it.path);

    const childBest = findDeepestMatch(it.childs, pathnameArg, full);
    if (childBest) {
      best = chooseBetter(best, childBest);
      continue;
    }

    if (isMatch(full)) {
      best = chooseBetter(best, it);
    }
  }

  return best;
}

export function Sidebar() {
  const { pathname } = useLocation();
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close } = useSidebarContext();
  const initialSegment = useMemo(
    () => navigation?.find((item) => isRouteActive(item.path, pathname)),
    [pathname],
  );

  const [activeSegmentPath, setActiveSegmentPath] = useState<SegmentPath>(
    initialSegment?.path,
  );

  const currentSegment = useMemo(() => {
    return navigation?.find((item) => item.path === activeSegmentPath);
  }, [activeSegmentPath]);

  // compute active child (deepest tab)
  const activeChild = useMemo<NavigationTree | undefined>(() => {
    return findDeepestMatch(currentSegment?.childs, pathname, currentSegment?.path ?? "");
  }, [currentSegment, pathname]);

  useDidUpdate(() => {
    const activePath = navigation.find((item) =>
      isRouteActive(item.path, pathname),
    )?.path;

    setActiveSegmentPath(activePath);
  }, [pathname]);

  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);

  return (
    <>
      <MainPanel
        nav={navigation}
        activeSegmentPath={activeSegmentPath}
        setActiveSegmentPath={setActiveSegmentPath}
      />
      <PrimePanel
        close={close}
        currentSegment={currentSegment}
        pathname={pathname}
        activeChild={activeChild}
      />
    </>
  );
}
