import { ChatBubbleLeftIcon } from "@heroicons/react/20/solid";
import { useFieldCommentCount } from "@/hooks/useFieldComments";

export interface SectionCommentButtonProps {
  sectionId: string;
  sectionName: string;
  rowId: string;
  userRole?: "maker1" | "maker2" | "checker" | null;
  onAddPendingComment?: (comment: { 
    rowId: string; 
    fieldName: string; 
    comment: string; 
    userRole?: "maker1" | "maker2" | "checker";
    parentId?: string;
  }) => void;
  pendingComments?: Array<{ 
    rowId: string; 
    fieldName: string; 
    comment: string; 
    userRole?: "maker1" | "maker2" | "checker";
    parentId?: string;
  }>;
  jsonComments?: Record<string, Array<{
    id?: string;
    user_id: string;
    user_role?: "maker" | "checker" | "admin";
    comment: string;
    created_at: string;
    updated_at: string;
    parent_id?: string;
    replies?: Array<{
      id?: string;
      user_id: string;
      user_role?: "maker" | "checker" | "admin";
      comment: string;
      created_at: string;
      updated_at: string;
      parent_id?: string;
    }>;
  }>>;
}

export default function SectionCommentButton({
  sectionId,
  rowId,
  pendingComments,
  jsonComments,
}: SectionCommentButtonProps) {
  const savedCommentCount = useFieldCommentCount(rowId, sectionId, jsonComments);
  
  const pendingCommentCount = (pendingComments || []).filter(
    (pc) => pc.rowId === rowId && pc.fieldName === sectionId
  ).length;
  
  const commentCount = savedCommentCount + pendingCommentCount;

  // Just show comment count badge - comments are displayed inline below fields
  if (commentCount === 0) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      title={`${commentCount} comment${commentCount !== 1 ? "s" : ""}`}
    >
      <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
      <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">
        {commentCount}
      </span>
    </div>
  );
}

