import CollapsibleSection from "./CollapsibleSection";
import FieldCommentButton from "./FieldCommentButton";
import FieldStatusDropdown from "./FieldStatusDropdown";
import { StructuredTableRenderer } from "./StructuredTableRenderer";
import { formatKey } from "./utils";
import type { ObjectRendererProps } from "./types";

interface StructuredTableValue {
  table_id?: string;
  title?: string;
  headers: string[];
  rows: Array<{
    row_number?: number;
    cells: string[];
    sources?: Array<{ page_number?: number; snippet?: string }>;
  }>;
  footnotes?: unknown[];
  sources?: Array<{ page_number?: number; snippet?: string }>;
}

type StructuredTableFieldProps = Pick<
  ObjectRendererProps,
  | "searchText"
  | "matchedPaths"
  | "openPaths"
  | "shouldEnableComments"
  | "shouldEnableSectionComments"
  | "shouldEnableStatus"
  | "fieldStatus"
  | "onFieldStatusChange"
  | "userRole"
  | "getComments"
  | "onAddComment"
  | "rootData"
> & {
  id: string;
  keyName: string;
  keyPath: Array<string | number>;
  val: StructuredTableValue;
  editable: boolean;
  activeMatchPath?: string | null;
  fieldPath: string;
  userId: string;
  onValueChange: ObjectRendererProps["onValueChange"];
  onSourceClick?: ObjectRendererProps["onSourceClick"];
};

export default function ObjectRendererStructuredTableField({
  id,
  keyName,
  keyPath,
  val,
  editable,
  searchText,
  activeMatchPath,
  matchedPaths,
  openPaths,
  shouldEnableStatus,
  shouldEnableComments,
  shouldEnableSectionComments,
  fieldPath,
  fieldStatus,
  onFieldStatusChange,
  userRole,
  getComments,
  onAddComment,
  userId,
  onValueChange,
  onSourceClick,
  rootData,
}: StructuredTableFieldProps) {
  return (
    <div key={id}>
      <CollapsibleSection
        title={val.title || formatKey(keyName)}
        defaultCollapsed={true}
        isOpen={openPaths ? openPaths.has(fieldPath) : undefined}
        className="relative"
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        currentPath={fieldPath}
        headerActions={
          shouldEnableStatus || shouldEnableComments ? (
            <div
              className="flex flex-wrap items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {shouldEnableStatus && (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <FieldStatusDropdown
                    fieldPath={fieldPath}
                    status={
                      (fieldStatus?.[fieldPath] as
                        | "approved"
                        | "approve_with_pendency"
                        | "rejected"
                        | "reverse_to_maker"
                        | null) || null
                    }
                    onStatusChange={onFieldStatusChange || (() => {})}
                    userRole={userRole}
                    isEditing={editable}
                  />
                </div>
              )}
              {shouldEnableComments && (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Comments:
                  </span>
                  <FieldCommentButton
                    fieldPath={fieldPath}
                    comments={getComments ? getComments(fieldPath) : []}
                    onAddComment={onAddComment || (() => {})}
                    userId={userId}
                    userRole={userRole}
                  />
                </div>
              )}
            </div>
          ) : undefined
        }
      >
        <StructuredTableRenderer
          table={val}
          onSourceClick={onSourceClick}
          path={keyPath}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          matchedPaths={matchedPaths}
          isEditing={editable}
          hideTitle
          onValueChange={onValueChange}
          shouldEnableStatus={shouldEnableStatus}
          shouldEnableComments={shouldEnableComments}
          shouldEnableSectionComments={shouldEnableSectionComments}
          fieldPath={fieldPath}
          fieldStatus={fieldStatus}
          onFieldStatusChange={onFieldStatusChange}
          getComments={getComments}
          onAddComment={onAddComment}
          userId={userId}
          userRole={userRole}
          rootData={rootData}
        />
      </CollapsibleSection>
    </div>
  );
}
