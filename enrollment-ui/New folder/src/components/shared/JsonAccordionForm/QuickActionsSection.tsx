import {
  ChevronDownIcon,
  ChevronUpIcon,
  // MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import {
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  WindowIcon,
} from "@heroicons/react/24/outline";
import { UserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";

export interface QuickActionsSectionProps {
  topLevelEntries: Array<[string, any]>;
  hideQuickActions?: boolean;
  isApproved: boolean;
  isMaker: boolean;
  checkerCanAct?: boolean;
  customQuickActions?: React.ReactNode;
  // Role Switcher Props
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  showRoleSwitcher?: boolean;
  readOnlyRole?: boolean; // If true, role switcher is read-only (shows current role only)
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExpandAllWithEdit: () => void;
  onCollapseAllAndCloseEdit: () => void;
  /** When false, local expand state is synced to collapsed (e.g. when parent collapses all). */
  hasAnySectionOpen?: boolean;
  // Search Props
  onSearch?: (searchTerm: string) => void;
  // Chat Props
  onChatClick?: () => void;
  // Reset Props
  onReset?: () => void;
  // PDF display mode: side-by-side panel or popup
  pdfDisplayMode?: "sideBySide" | "popup";
  onPdfDisplayModeChange?: (mode: "sideBySide" | "popup") => void;
}

export default function QuickActionsSection({
  topLevelEntries,
  hideQuickActions = false,
  isApproved,
  customQuickActions,
  onExpandAll,
  onCollapseAll,
  hasAnySectionOpen = false,
  // onSearch,
  onChatClick,
  pdfDisplayMode,
  onPdfDisplayModeChange,
}: QuickActionsSectionProps) {
  const [expandedLocal, setExpandedLocal] = useState(false);
  const expanded = expandedLocal;
  useEffect(() => {
    if (!hasAnySectionOpen) setExpandedLocal(false);
  }, [hasAnySectionOpen]);

  if (hideQuickActions || topLevelEntries.length === 0) {
    return null;
  }

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const term = e.target.value;
  //   setSearchTerm(term);
  //   if (onSearch) {
  //     onSearch(term);
  //   }
  // };

  return (
    <div className="dark:border-dark-600 dark:from-dark-800 dark:to-dark-700 mb-2 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-2 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left side - Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (expanded) {
                onCollapseAll();
                setExpandedLocal(false);
              } else {
                onExpandAll();
                setExpandedLocal(true);
              }
            }}
            className="dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700 flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:text-gray-300"
            title={expanded ? "Collapse All" : "Expand All"}
          >
            {expanded ? (
              <ChevronUpIcon className="h-3.5 w-3.5" />
            ) : (
              <ChevronDownIcon className="h-3.5 w-3.5" />
            )}
            <span>{expanded ? "Collapse All" : "Expand All"}</span>
          </button>
          
          {/* PDF display mode: Side by side vs Popup */}
          {pdfDisplayMode != null && onPdfDisplayModeChange && (
            <>
              <div className="dark:bg-dark-600 mx-0.5 h-6 w-px bg-gray-300" />
              <div className="flex rounded-md border border-gray-300 bg-white shadow-sm dark:border-dark-600 dark:bg-dark-800">
                <button
                  type="button"
                  onClick={() => onPdfDisplayModeChange("sideBySide")}
                  title="Show PDF side by side with form"
                  className={`flex items-center gap-1 rounded-l-md border-r border-gray-300 px-2 py-1 text-xs font-medium transition-all dark:border-dark-600 ${
                    pdfDisplayMode === "sideBySide"
                      ? "bg-purple-100 text-purple-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700"
                  }`}
                >
                  <Squares2X2Icon className="h-3.5 w-3.5" />
                  <span>Side by side</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPdfDisplayModeChange("popup")}
                  title="Show PDF in popup"
                  className={`flex items-center gap-1 rounded-r-md px-2 py-1 text-xs font-medium transition-all ${
                    pdfDisplayMode === "popup"
                      ? "bg-purple-100 text-purple-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700"
                  }`}
                >
                  <WindowIcon className="h-3.5 w-3.5" />
                  <span>Popup</span>
                </button>
              </div>
            </>
          )}
          {/* Custom Quick Action Buttons */}
          {customQuickActions}
        </div>

        {/* Right side - Chat button */}
        {onChatClick && !isApproved && (
          <button
            type="button"
            onClick={onChatClick}
            className="flex items-center justify-center gap-1 rounded-md border border-green-500 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 shadow-sm transition-all duration-200 hover:bg-green-100 hover:shadow-md dark:border-green-400 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
            title="Open Chat"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

QuickActionsSection.displayName = "QuickActionsSection";
