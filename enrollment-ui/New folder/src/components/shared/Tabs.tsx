import { useState, useEffect } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  /** Visual mute; click still allowed so the tab can show a blocked message. */
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  /** Controlled: external active tab id */
  activeTabId?: string;
  /** Called when user changes tab (id, label) */
  onTabChange?: (id: string, label: string) => void;
  /** When true, tabs share width in one row (no scroll/hide); long labels truncate with ellipsis */
  fitTabsInOneRow?: boolean;
}

export const Tabs = ({ tabs, activeTabId, onTabChange, fitTabsInOneRow }: TabsProps) => {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id);
  const isControlled = activeTabId !== undefined;
  const activeTab = isControlled ? activeTabId : internalActive;

  useEffect(() => {
    if (isControlled && activeTabId) {
      setInternalActive(activeTabId);
    }
  }, [isControlled, activeTabId]);

  const setActiveTab = (id: string) => {
    if (!isControlled) setInternalActive(id);
    const tab = tabs.find((t) => t.id === id);
    if (tab) onTabChange?.(id, tab.label);
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div
          className={
            fitTabsInOneRow
              ? "flex snap-x snap-mandatory flex-nowrap gap-1 overflow-x-auto px-2 pt-1 [scrollbar-width:thin]"
              : "flex flex-nowrap gap-0 overflow-x-auto overflow-y-hidden px-2"
          }
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              aria-disabled={tab.disabled || undefined}
              className={`
                -mb-[1px] shrink-0 cursor-pointer snap-start rounded-t border-b-2 transition-all
                ${fitTabsInOneRow ? "min-h-9 px-3 py-2 text-xs leading-tight whitespace-nowrap sm:min-h-0 sm:px-3 sm:py-2 sm:text-xs" : "px-2 py-1.5 text-xs whitespace-nowrap"}
                ${
                  activeTab === tab.id
                    ? "border-teal-600 font-semibold text-teal-800"
                    : "border-transparent font-medium text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }
                ${tab.disabled ? "opacity-50" : ""}
              `}
              title={fitTabsInOneRow || tab.disabled ? tab.label : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
