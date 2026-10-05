// Search working
// Reusable collapsible section component with consistent UI
import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { highlightText } from "./utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultCollapsed?: boolean;
  isOpen?: boolean; // Controlled: if provided, overrides internal state
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  searchText?: string;
  activeMatchPath?: string | null;
  currentPath?: string;
}

export default function CollapsibleSection({
  title,
  subtitle: _subtitle,
  defaultCollapsed = false,
  isOpen,
  children,
  headerActions,
  className = "",
  headerClassName = "",
  contentClassName = "",
  searchText,
  activeMatchPath,
  currentPath,
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // If isOpen is provided (controlled), sync internal state with it
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsCollapsed(!isOpen);
    }
  }, [isOpen]);

  return (
    <div
      className={`dark:border-dark-600 dark:bg-dark-800 relative w-full min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      data-component-name="CollapsibleSection"
      data-title={title}
      data-current-path={currentPath}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between gap-1.5 p-1.5 border-b border-gray-200 dark:border-dark-600 relative ${headerClassName}`}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 flex-1 text-left hover:bg-gray-50 dark:hover:bg-dark-700 rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors"
          aria-label={isCollapsed ? "Expand section" : "Collapse section"}
        >
          {isCollapsed ? (
            <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronUpIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          )}
          <div className="flex flex-1 min-w-0 items-center gap-1.5">
            
            <div className="min-w-0 flex-1 truncate text-xs font-medium text-gray-900 dark:text-gray-100">
              {searchText ? highlightText(title, searchText, currentPath, activeMatchPath) : title}
            </div>
            {/* {subtitle && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                {searchText ? highlightText(subtitle, searchText, currentPath ? `${currentPath}.subtitle` : undefined, activeMatchPath) : subtitle}
              </span>
            )} */}
          </div>
        </button>
        {headerActions && (
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {headerActions}
          </div>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className={`min-w-0 w-full overflow-x-auto px-1.5 pb-1.5 pt-1 ${contentClassName}`}>{children}</div>
      )}
    </div>
  );
}

CollapsibleSection.displayName = "CollapsibleSection";

