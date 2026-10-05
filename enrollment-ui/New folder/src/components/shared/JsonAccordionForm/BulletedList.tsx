// Search working
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useCallback } from "react";
import { StatusValue } from "@/hooks/useStatus";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";
import { BulletedListItem } from "./BulletedListItem";
import {
  getUserRoleValue,
  resolveItemSources,
  getItemSourceWithPage,
  hasItemClickableSource,
} from "./BulletedList.helpers";
import type { JsonAccordionUserRole } from "./types";

export interface BulletedListProps {
  /** Array of items to display */
  items: any[];
  searchText?: string;
  activeMatchPath?: string | null;
  /** Whether the list is in edit mode */
  isEditing: boolean;
  /** Field key/path for this list */
  fieldKey: string;
  /** Whether this item is newly added (can be deleted) */
  isNewlyAdded: (index: number) => boolean;
  /** Callback when an item value changes */
  onItemChange: (index: number, value: any) => void;
  /** Callback when an item is removed */
  onItemRemove: (index: number) => void;
  /** Callback when a new item is added */
  onItemAdd: () => void;
  /** Optional className for the container */
  className?: string;
  /** Enable comments */
  shouldEnableComments?: boolean;
  /** Enable status */
  shouldEnableStatus?: boolean;
  /** User role */
  userRole?: JsonAccordionUserRole | null;
  /** Get comments for a field path */
  getComments?: (fieldPath: string) => Array<any>;
  /** Add comment callback */
  onAddComment?: (
    fieldPath: string,
    comment: string,
    userId: string,
    userRole?: JsonAccordionUserRole,
  ) => void;
  /** Delete comment callback */
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  /** User ID */
  userId?: string;
  /** Field status map */
  fieldStatus?: Record<string, StatusValue>;
  /** Status change callback */
  onStatusChange?: (fieldPath: string, status: StatusValue) => void;
  /** Root data for source lookup */
  rootData?: any;
  /** Section slice of actual data (with sources) for nested lookup */
  sectionActualData?: any;
  /** Source click handler */
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
}

/**
 * BulletedList Component
 *
 * Displays an array of items as a bulleted list with edit capabilities.
 * Supports adding, editing, and removing items.
 */
export default function BulletedList({
  items,
  isEditing,
  fieldKey,
  isNewlyAdded,
  onItemChange,
  onItemRemove,
  onItemAdd,
  className = "",
  shouldEnableComments = false,
  shouldEnableStatus = false,
  userRole,
  searchText,
  activeMatchPath,
  getComments,
  onAddComment,
  onDeleteComment,
  userId: userIdProp,
  fieldStatus = {},
  onStatusChange,
  rootData,
  sectionActualData,
  onSourceClick,
}: BulletedListProps) {
  const keycloakUser = useKeycloakUser();
  const userId = userIdProp || keycloakUser.userId || "unknown";

  const handleAddCommentForField = useCallback(
    (fieldPath: string, comment: string) => {
      if (!onAddComment) return;
      const userRoleValue = getUserRoleValue(userRole);
      onAddComment(fieldPath, comment, userId, userRoleValue);
    },
    [onAddComment, userId, userRole],
  );

  const parentSectionData = sectionActualData ?? rootData;

  if (!items || items.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="relative py-2 text-sm text-gray-500 italic dark:text-gray-400">
          No items
        </div>
        {isEditing && (
          <Button
            type="button"
            onClick={onItemAdd}
            variant="outlined"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium"
            title="Add New Item"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add Item
          </Button>
        )}
      </div>
    );
  }

  const useTwoColumns = items.length > 9;

  return (
    <div className={`max-h-96 overflow-y-auto ${className}`}>
      <div className="mb-1 flex items-center gap-1">
        <span className="rounded bg-pink-100 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
          BulletedList
        </span>
      </div>
      <ul
        className={
          useTwoColumns
            ? "grid grid-cols-2 gap-x-8 gap-y-1.5"
            : "list-disc space-y-1.5 pl-6"
        }
      >
        {items.map((item: unknown, index: number) => {
          const itemSources = resolveItemSources(
            rootData,
            fieldKey,
            index,
            item,
            parentSectionData,
          );
          const hasClickableSource = hasItemClickableSource(itemSources);
          const sourceWithPage = getItemSourceWithPage(itemSources);

          return (
          <BulletedListItem
            key={`${fieldKey}-${index}`}
            itemValue={item}
            index={index}
            fieldKey={fieldKey}
            isEditing={isEditing}
            isNew={isNewlyAdded(index)}
            useTwoColumns={useTwoColumns}
            searchText={searchText}
            activeMatchPath={activeMatchPath}
            hasClickableSource={hasClickableSource}
            sourceWithPage={sourceWithPage}
            onItemChange={onItemChange}
            onItemRemove={onItemRemove}
            onSourceClick={onSourceClick}
            shouldEnableComments={shouldEnableComments}
            shouldEnableStatus={shouldEnableStatus}
            getComments={getComments}
            onAddComment={handleAddCommentForField}
            onDeleteComment={onDeleteComment}
            userId={userId}
            userRole={userRole}
            fieldStatus={fieldStatus}
            onStatusChange={onStatusChange}
          />
          );
        })}
      </ul>
      {isEditing && (
        <div className="mt-3">
          <Button
            type="button"
            onClick={onItemAdd}
            variant="outlined"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium"
            title="Add New Item"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>
      )}
    </div>
  );
}

BulletedList.displayName = "BulletedList";
