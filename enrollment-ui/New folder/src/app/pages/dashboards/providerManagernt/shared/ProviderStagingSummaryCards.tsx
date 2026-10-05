import clsx from "clsx";
import type { ReactNode } from "react";

export type ProviderStagingSummarySection<TSub extends string = string> = {
  key: TSub;
  label: string;
  count: number;
  className?: string;
};

export type ProviderStagingSummaryCardConfig<
  TMain extends string = string,
  TSub extends string = string,
> = {
  key: TMain;
  label: string;
  headerClass: string;
  activeRingClass: string;
  total: number;
  sections: ProviderStagingSummarySection<TSub>[];
};

type ProviderStagingSummaryCardsProps<
  TMain extends string,
  TSub extends string,
> = {
  cards: ProviderStagingSummaryCardConfig<TMain, TSub>[];
  activeMainTab: TMain;
  activeSubTab: TSub;
  onTabSelect: (mainTab: TMain, subTab: TSub) => void;
  /** Section keys that use the fail (red) active tone. */
  failSectionKeys?: readonly string[];
  /** Optional footer rendered under a card’s section tabs (e.g. Partial Match bands). */
  cardFooters?: Partial<Record<TMain, ReactNode>>;
  className?: string;
};

function getSubSectionActiveClass(
  cardKey: string,
  sectionKey: string,
  isActive: boolean,
  failSectionKeys: readonly string[],
): string {
  if (!isActive) {
    return "bg-white text-slate-600 hover:bg-slate-50";
  }

  if (failSectionKeys.includes(sectionKey)) {
    return "bg-red-50 text-red-800";
  }

  if (cardKey === "total") {
    return "bg-blue-50 text-blue-800";
  }
  if (cardKey === "process") {
    return "bg-amber-50 text-amber-900";
  }
  return "bg-slate-50 text-slate-700";
}

function getCompactTabFlexGrow(label: string, count: number): number {
  const contentLength = label.length + String(count).length;
  return Math.max(contentLength + 5, 12);
}

function SummarySubSection({
  label,
  count,
  isActive,
  onClick,
  cardKey,
  sectionKey,
  failSectionKeys,
  compact,
  className,
}: Readonly<{
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  cardKey: string;
  sectionKey: string;
  failSectionKeys: readonly string[];
  /** Processed card: equal-width tabs, label + count side by side. */
  compact: boolean;
  className?: string;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      title={`${label}: ${count}`}
      style={compact ? { flexGrow: getCompactTabFlexGrow(label, count) } : undefined}
      className={clsx(
        "flex cursor-pointer items-center border-t border-r border-slate-200/90 last:border-r-0 transition-colors",
        compact
          ? "min-w-0 flex-1 justify-center gap-1 px-1.5 py-1.5"
          : "shrink-0 gap-1 px-1.5 py-1.5",
        isActive && "font-semibold",
        getSubSectionActiveClass(cardKey, sectionKey, isActive, failSectionKeys),
        className,
      )}
    >
      <span
        className={clsx(
          "min-w-0 leading-none whitespace-nowrap",
          "text-[10px]",
        )}
      >
        {label}
      </span>
      <span
        className={clsx(
          "shrink-0 rounded-sm font-semibold tabular-nums leading-none",
          compact ? "px-1 py-px text-[10px]" : "px-1 py-0.5 text-[10px]",
          isActive ? "bg-white text-slate-900" : "bg-slate-100 text-slate-700",
        )}
      >
        {count}
      </span>
    </button>
  );
}

const DEFAULT_FAIL_SECTION_KEYS = [
  "fail",
  "processingFail",
  "processFail",
  "notFound",
] as const;

/**
 * Shared staging summary-card chrome (Total / Processed tiles).
 * Domain modules pass card configs; markup and tones stay identical.
 */
export function ProviderStagingSummaryCards<
  TMain extends string,
  TSub extends string,
>({
  cards,
  activeMainTab,
  activeSubTab,
  onTabSelect,
  failSectionKeys = DEFAULT_FAIL_SECTION_KEYS,
  cardFooters,
  className,
}: Readonly<ProviderStagingSummaryCardsProps<TMain, TSub>>) {
  return (
    <div className={clsx("flex min-w-0 w-full shrink-0 gap-1.5", className)}>
      {cards.map((card) => {
        const isActiveMain = activeMainTab === card.key;
        const isTotalCard = card.key === "total";
        // Only the Processed (yellow) card uses compact equal-width tabs.
        const compact = card.key === "process";
        const footer = cardFooters?.[card.key];

        return (
          <div
            key={card.key}
            className={clsx(
              isTotalCard ? "min-w-0 shrink-0" : "min-w-0 flex-1",
              "overflow-hidden rounded-md border bg-white shadow-sm transition-all",
              isActiveMain
                ? card.activeRingClass.replace(/^ring-/, "border-")
                : "border-slate-200",
            )}
          >
            <div
              className={clsx(
                "flex items-center px-2 py-1.5 text-white",
                card.headerClass,
              )}
            >
              <p className="text-sm font-bold whitespace-nowrap tabular-nums leading-none">
                {card.label} : {card.total}
              </p>
            </div>

            <div className="flex w-full min-w-0 flex-nowrap">
              {card.sections.map((section) => {
                const isActive = isActiveMain && activeSubTab === section.key;
                return (
                  <SummarySubSection
                    key={`${card.key}-${section.key}`}
                    label={section.label}
                    count={section.count}
                    isActive={isActive}
                    cardKey={card.key}
                    sectionKey={section.key}
                    failSectionKeys={failSectionKeys}
                    compact={compact}
                    className={section.className}
                    onClick={() => onTabSelect(card.key, section.key)}
                  />
                );
              })}
            </div>

            {footer ? (
              <div className="border-t border-slate-200/90">{footer}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
