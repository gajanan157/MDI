import FieldCommentButton from "./FieldCommentButton";
import FieldStatusDropdown from "./FieldStatusDropdown";
import type { Comment } from "@/hooks/useComments";

type FieldStatus =
  | "approved"
  | "approve_with_pendency"
  | "rejected"
  | "reverse_to_maker"
  | null;

interface ObjectRendererFieldSectionMetaProps {
  fieldPath: string;
  shouldEnableStatus: boolean;
  shouldEnableSectionComments: boolean;
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
  editable: boolean;
  getComments?: (path: string) => Comment[];
  onAddComment?: (fieldPath: string, comment: string) => void;
  userId: string;
  className?: string;
}

export default function ObjectRendererFieldSectionMeta({
  fieldPath,
  shouldEnableStatus,
  shouldEnableSectionComments,
  fieldStatus,
  onFieldStatusChange,
  userRole,
  editable,
  getComments,
  onAddComment,
  userId,
  className = "mb-1 flex items-center gap-3",
}: ObjectRendererFieldSectionMetaProps) {
  if (!shouldEnableStatus && !shouldEnableSectionComments) {
    return null;
  }

  return (
    <div className={className}>
      {shouldEnableStatus && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <FieldStatusDropdown
            fieldPath={fieldPath}
            status={(fieldStatus[fieldPath] as FieldStatus) || null}
            onStatusChange={onFieldStatusChange || (() => {})}
            userRole={userRole}
            isEditing={editable}
          />
        </div>
      )}
      {shouldEnableSectionComments && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
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
  );
}
