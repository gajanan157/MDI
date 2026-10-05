import { useTranslation } from "react-i18next";

type SocInnerTabSwitcherProps = {
  socInnerTab: "soc" | "discount";
  setSocInnerTab: (v: "soc" | "discount") => void;
  /** `segmented` = pill toggle (toolbar). `underline` = mock panel tabs. */
  variant?: "segmented" | "underline";
};

function socSubTabToggleClass(isActive: boolean): string {
  const base =
    "cursor-pointer rounded px-2.5 py-1 text-[11px] font-semibold leading-tight transition-all sm:px-3 sm:text-xs";
  if (isActive) {
    return `${base} bg-white text-primary-700 shadow-sm ring-1 ring-gray-200/80`;
  }
  return `${base} text-gray-600 hover:text-gray-900`;
}

function socUnderlineTabClass(isActive: boolean): string {
  const base =
    "cursor-pointer border-b-2 px-2.5 py-1 text-[11px] font-semibold transition-colors";
  if (isActive) {
    return `${base} border-primary-600 text-primary-700`;
  }
  return `${base} border-transparent text-slate-500 hover:text-slate-800`;
}

/** Matches Network Management Insurance Company / Corporate right-side toggle. */
export function SocInnerTabSwitcher({
  socInnerTab,
  setSocInnerTab,
  variant = "segmented",
}: Readonly<SocInnerTabSwitcherProps>) {
  const { t } = useTranslation();

  const tabs = [
    { id: "soc" as const, label: t("providerMaster.soc.innerTab.soc") },
    { id: "discount" as const, label: t("providerMaster.soc.innerTab.discount") },
  ];

  if (variant === "underline") {
    return (
      <div
        className="flex items-center gap-1"
        role="tablist"
        aria-label={t("providerMaster.soc.innerTab.ariaLabel")}
      >
        {tabs.map((tab) => {
          const isActive = socInnerTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={socUnderlineTabClass(isActive)}
              onClick={() => setSocInnerTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="inline-flex rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/80 p-0.5 shadow-sm"
      role="tablist"
      aria-label={t("providerMaster.soc.innerTab.ariaLabel")}
    >
      {tabs.map((tab) => {
        const isActive = socInnerTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={socSubTabToggleClass(isActive)}
            onClick={() => setSocInnerTab(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
