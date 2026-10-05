// Import Dependencies
import clsx from "clsx";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "react-i18next";

// Local Imports
import { useThemeContext } from "@/app/contexts/theme/context";
import { Button } from "@/components/ui";
import { Menu } from "./Menu";
import { NavigationTree } from "@/@types/navigation";

// ----------------------------------------------------------------------

export interface PrimePanelProps {
  currentSegment?: NavigationTree;
  pathname: string;
  close: () => void;
  activeChild?: NavigationTree;
}

export function PrimePanel({
  currentSegment,
  pathname,
  close,
  activeChild,
}: PrimePanelProps) {
  const { cardSkin } = useThemeContext();
  const { t } = useTranslation();

  // const title = t(currentSegment?.transKey ?? "") || currentSegment?.title;
  //  const activeTab = currentSegment?.childs?.find((child) => pathname.includes(child.path));
  //    const activeTab = currentSegment?.childs?.find(
  //   (child) => child.path && pathname.includes(child.path)
  // );

  // Use translation key if available, fallback to title
  // const activeTabName = t(activeTab?.transKey ?? "") || activeTab?.title || "";

  const activeTabName =
    t(activeChild?.transKey ?? "") ||
    activeChild?.title ||
    t(currentSegment?.transKey ?? "") ||
    currentSegment?.title ||
    "";
  // debug: see which child (if any) was matched
  // remove or comment out in production

  // Use translation key if available, fallback to title, fallback to parent title
  // const activeTabName =
  //   t(activeTab?.transKey ?? "") ||
  //   activeTab?.title ||
  //   t(currentSegment?.transKey ?? "") ||
  //   currentSegment?.title ||
  //   "";

  return (
    <div
      className={clsx(
        "prime-panel flex h-full flex-col",
        cardSkin === "shadow"
          ? "shadow-soft dark:shadow-dark-900/60"
          : "dark:border-dark-600/80 ltr:border-r rtl:border-l",
      )}
    >
      <div
        className={clsx(
          "flex h-full grow flex-col bg-white ltr:pl-(--main-panel-width) rtl:pr-(--main-panel-width)",
          cardSkin === "shadow" ? "dark:bg-dark-750" : "dark:bg-dark-900",
        )}
      >
        <div className="relative flex h-16 w-full shrink-0 items-center justify-between pr-1 pl-4 rtl:pr-4 rtl:pl-1">
          <p className="dark:text-dark-100 truncate text-base tracking-wider text-gray-800">
            {/* {title} */}
            {activeTabName}
          </p>
          <Button
            onClick={close}
            isIcon
            variant="flat"
            className="size-7 rounded-full xl:hidden"
          >
            <ChevronLeftIcon className="size-6 rtl:rotate-180" />
          </Button>
        </div>
        {currentSegment?.childs && (
          <Menu nav={currentSegment.childs} pathname={pathname} />
        )}
      </div>
    </div>
  );
}
