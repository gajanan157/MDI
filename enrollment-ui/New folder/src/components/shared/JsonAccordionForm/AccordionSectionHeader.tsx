// Search working
import clsx from "clsx";
import { AccordionButton } from "@/components/ui";
import {
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { formatKey, highlightText } from "./utils";
import {
  canEditAccordionSection,
  getEditButtonClassName,
  getEditButtonTitle,
} from "./displayHelpers";

export interface AccordionSectionHeaderProps {
  sectionId: string;
  sectionKey: string;
  isEditing: boolean;
  sectionHasChanges: boolean;
  isOpen: boolean;
  rowId?: string;
  isApproved: boolean;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
  searchText?: string;
  activeMatchPath?: string | null;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  checkerCanAct: boolean;
  isMaker: boolean;
  onToggleEdit?: () => void; // Optional - not used anymore but kept for compatibility
  onCancelEdit?: () => void; // Cancel editing and discard changes
  onSaveEdit?: () => void; // Save changes and exit edit mode
  readOnly?: boolean; // When true, hide edit icon and disable editing
}

export default function AccordionSectionHeader({
  sectionKey,
  isEditing,
  sectionHasChanges,
  userRole,
  hasCheckerRole: _hasCheckerRole,
  hasBothRoles: _hasBothRoles,
  checkerCanAct: _checkerCanAct,
  isMaker: _isMaker,
  searchText,
  activeMatchPath,
  onToggleEdit,
  onCancelEdit,
  onSaveEdit,
  readOnly = false,
}: AccordionSectionHeaderProps) {
  // When readOnly, hide edit and disable editing
  const shouldShowEditButton = canEditAccordionSection(readOnly, userRole);
  const canEdit = shouldShowEditButton;

  const label = formatKey(sectionKey);

  // Normalize both label and search text for comparison (same logic as searchJsonPaths)
  const normalizeForMatch = (v: string) => v.replace(/\s+/g, " ").trim().toLowerCase();
  const normalizedLabel = normalizeForMatch(label);
  const normalizedSearch = searchText ? normalizeForMatch(searchText) : "";

  const isMatch = searchText && normalizedLabel.includes(normalizedSearch);

  // Check if this is the active match
  const isActive = activeMatchPath && sectionKey === activeMatchPath;

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!canEdit) return;

    if (isEditing) {
      if (onCancelEdit) {
        onCancelEdit();
      } else if (onToggleEdit) {
        onToggleEdit();
      }
      return;
    }

    onToggleEdit?.();
  };

  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onSaveEdit) {
      onSaveEdit();
    } else if (onToggleEdit) {
      onToggleEdit();
    }
  };

  const showSaveButton =
    isEditing &&
    (userRole === "maker1" ||
      userRole === "maker2" ||
      userRole === "checker" ||
      userRole === "superadmin" ||
      userRole === null);

  return (
    <div className="ring-primary-500/50 dark:text-dark-100 dark:ring-offset-dark-700 flex w-full items-center gap-2 rounded-sm py-1 text-base font-medium text-gray-700 ring-offset-2 ring-offset-white outline-hidden focus-within:ring-3">
      <AccordionButton className="flex min-w-0 flex-1 cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left text-inherit shadow-none outline-hidden">
        {({ open }: { open: boolean }) => (
          <>
            <div className="flex items-center gap-3">
              <div
                data-accordion-section={sectionKey}
                className={clsx(
                  "text-[12px] font-semibold",
                  isMatch && !isActive && "rounded bg-yellow-300 px-1",
                  isActive && "rounded bg-orange-300 px-1",
                )}
              >
                {searchText
                  ? highlightText(label, searchText, sectionKey, activeMatchPath)
                  : label}
              </div>
              {isEditing && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Editing
                </span>
              )}
              {!isEditing && sectionHasChanges && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Edited
                </span>
              )}
            </div>

            <div
              className={clsx(
                "dark:text-dark-300 text-sm leading-none font-normal text-gray-400 transition-transform duration-300",
                (open as boolean) && "-rotate-180",
              )}
            >
              <ChevronDownIcon className="h-6 w-6" />
            </div>
          </>
        )}
      </AccordionButton>

      {shouldShowEditButton && (
        <button
          type="button"
          disabled={!canEdit}
          onClick={handleEditClick}
          className={clsx(
            "rounded p-1.5 transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none",
            canEdit
              ? "focus:ring-primary-500 cursor-pointer"
              : "cursor-not-allowed opacity-50",
            getEditButtonClassName(canEdit, isEditing),
          )}
          title={getEditButtonTitle(canEdit, isEditing, userRole)}
        >
          {isEditing ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <PencilSquareIcon className="h-5 w-5" />
          )}
        </button>
      )}

      {showSaveButton && (
        <button
          type="button"
          onClick={handleSaveClick}
          className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 cursor-pointer rounded p-1.5 text-white transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none"
          title="Save Changes (Keep Changes)"
        >
          <CheckIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

AccordionSectionHeader.displayName = "AccordionSectionHeader";
