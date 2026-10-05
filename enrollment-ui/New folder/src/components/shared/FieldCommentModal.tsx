// src/components/shared/FieldCommentModal.tsx
import { useState, Fragment, useMemo, useEffect, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ChatBubbleLeftIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button, Textarea, Avatar } from "@/components/ui";
import {
  useFieldComments,
  useAddFieldComment,
  useDeleteFieldComment,
  FieldComment,
} from "@/hooks/useFieldComments";
import { useAuthContext } from "@/app/contexts/auth/context";
import { useUserRole } from "@/hooks/useUserRole";

interface FieldCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowId: string;
  fieldName: string;
  fieldLabel?: string;
  userId?: string;
  userRole?: "maker" | "checker" | "admin" | null;
  onAddPendingComment?: (comment: { 
    rowId: string; 
    fieldName: string; 
    comment: string; 
    userRole?: "maker" | "checker" | "admin";
    parentId?: string;
  }) => void;
  saveImmediately?: boolean;
  pendingComments?: Array<{ 
    rowId: string; 
    fieldName: string; 
    comment: string; 
    userRole?: "maker" | "checker" | "admin";
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

// Comment Item Component - WhatsApp/Messenger Style
function CommentItem({
  comment,
  userId,
  userRole,
  onDelete,
  isPending = false,
}: {
  comment: FieldComment;
  userId: string;
  userRole?: string;
  onDelete: (commentId: string) => void;
  isPending?: boolean;
}) {
  const commentDate = new Date(comment.created_at);
  
  // Format time like WhatsApp (HH:MM AM/PM)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Format date if not today
  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return formatTime(date);
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Compare user IDs as strings to ensure proper matching
  // Also compare by role if IDs don't match (for cases where user_id format differs)
  // Normalize both IDs to strings and trim whitespace
  const normalizedUserId = String(userId || "").trim();
  const normalizedCommentUserId = String(comment.user_id || "").trim();
  
  // Primary check: Compare by user ID
  const isMyCommentById = normalizedUserId === normalizedCommentUserId && normalizedUserId !== "";
  
  // Secondary check: Compare by role if IDs don't match
  // If logged in as "checker" and comment is from "checker", show on right
  const commentRole = String(comment.user_role || "").trim().toLowerCase();
  const currentRole = String(userRole || "").trim().toLowerCase();
  const isMyCommentByRole = !isMyCommentById && currentRole !== "" && commentRole === currentRole && commentRole !== "";
  
  // Use either ID or role match - your messages always on right
  const isMyComment = isMyCommentById || isMyCommentByRole;
  const roleLabel = comment.user_role === "maker" ? "Maker" : comment.user_role === "checker" ? "Checker" : "User";
  
  // Get user initials for avatar
  const getInitials = (text: string) => {
    const words = text.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };
  const userInitials = getInitials(roleLabel);

  return (
    <div className={`flex mb-4 ${isMyComment ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[80%] ${isMyComment ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - only show for received messages */}
        {!isMyComment && (
          <div className="shrink-0">
            <Avatar
              size={8}
              name={roleLabel}
              initialColor={comment.user_role === "maker" ? "info" : comment.user_role === "checker" ? "success" : "neutral"}
              classNames={{
                root: "rounded-full",
                display: "rounded-full",
              }}
            >
              {userInitials}
            </Avatar>
          </div>
        )}
        
        {/* Message Bubble */}
        <div className={`flex flex-col ${isMyComment ? 'items-end' : 'items-start'}`}>
          {/* User name for received messages */}
          {!isMyComment && (
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-1">
              {roleLabel}
            </span>
          )}
          
          {/* Message bubble */}
          <div
            className={`rounded-lg px-3 py-2 ${
              isMyComment
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {comment.comment}
            </p>
          </div>
          
          {/* Timestamp and Pending status */}
          <div className={`flex items-center gap-1 mt-1 px-1 ${isMyComment ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(commentDate)}
            </span>
            {isPending && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                (Pending)
              </span>
            )}
            {isMyComment && !isPending && (
              <button
                onClick={() => onDelete(comment.id)}
                className="ml-2 p-1 text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                title="Delete comment"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FieldCommentModal({
  isOpen,
  onClose,
  rowId,
  fieldName,
  fieldLabel,
  userId: userIdProp,
  userRole: userRoleProp,
  onAddPendingComment,
  saveImmediately = true,
  pendingComments = [],
  jsonComments,
}: FieldCommentModalProps) {
  const { user } = useAuthContext();
  const userRoleFromHook = useUserRole();
  const userRole = userRoleProp ?? userRoleFromHook;
  
  // Use logged-in user ID - this is critical for showing messages on right side
  // Convert to string for consistent comparison and ensure we have a valid ID
  const currentUserId = String(user?.id || userIdProp || "anonymous");
  const currentUserRole = String(userRole || "").trim().toLowerCase();
  
  // Debug logging (can be removed later)
  if (process.env.NODE_ENV === 'development') {
    //   userId: currentUserId,
    //   userRole: currentUserRole,
    //   userFromContext: user,
    // });
  }
  const { data: comments, isLoading } = useFieldComments(rowId, fieldName, jsonComments);
  const addComment = useAddFieldComment();
  const deleteComment = useDeleteFieldComment();
  const [newComment, setNewComment] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Filter pending comments for this specific field
  const fieldPendingComments = (pendingComments || []).filter(
    (pc) => pc.rowId === rowId && pc.fieldName === fieldName
  );

  // Flatten all comments into a simple list (WhatsApp style - no hierarchy)
  const allComments = useMemo(() => {
    if (!comments || !Array.isArray(comments)) return [];
    
    // Flatten all comments including nested replies
    const flattenComments = (commentList: FieldComment[]): FieldComment[] => {
      const flat: FieldComment[] = [];
      commentList.forEach((comment) => {
        flat.push(comment);
        if (comment.replies && comment.replies.length > 0) {
          flat.push(...flattenComments(comment.replies));
        }
      });
      return flat;
    };
    
    // Sort all comments by date (oldest first)
    return flattenComments(comments).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [comments]);

  // Add pending comments to the flat list
  const allCommentsWithPending = useMemo(() => {
    const pendingCommentsList: FieldComment[] = fieldPendingComments.map((pending, index) => ({
      id: `pending-${Date.now()}-${index}`,
      row_id: rowId,
      field_name: fieldName,
      user_id: currentUserId,
      user_role: pending.userRole,
      comment: pending.comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_id: pending.parentId,
    }));
    
    // Combine all comments and sort by date
    return [...allComments, ...pendingCommentsList].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [allComments, fieldPendingComments, rowId, fieldName, currentUserId]);
  
  // Scroll to bottom when comments change or new comment is added
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allCommentsWithPending, newComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const commentText = newComment.trim();
    if (!commentText) return;

    if (onAddPendingComment) {
      onAddPendingComment({
        rowId,
        fieldName,
        comment: commentText,
        userRole: userRole || undefined,
      });
      setNewComment("");
      // Scroll to bottom after adding comment
      setTimeout(() => {
        if (commentsEndRef.current) {
          commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    } else if (saveImmediately) {
      try {
        await addComment.mutateAsync({
          rowId,
          fieldName,
          comment: commentText,
          userId: currentUserId,
          userRole: userRole || undefined,
        });
        setNewComment("");
        // Scroll to bottom after saving comment
        setTimeout(() => {
          if (commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }, 100);
      } catch (error) {
        console.error("Failed to save comment:", error);
      }
    }
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment.mutateAsync({
        id: commentId,
        rowId,
        fieldName,
      });
    }
  };

  const displayFieldName = fieldLabel || fieldName;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="scrollbar-sm relative flex w-full max-w-2xl flex-col overflow-y-auto rounded-lg bg-white p-6 shadow-xl transition-opacity duration-300 dark:bg-dark-700">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-dark-600">
              <DialogTitle
                as="h3"
                className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-dark-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <ChatBubbleLeftIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Comments for {displayFieldName}
              </DialogTitle>
              <Button
                onClick={onClose}
                variant="flat"
                isIcon
                className="size-7 rounded-full"
              >
                <XMarkIcon className="size-4" />
              </Button>
            </div>

            {/* Comments List - WhatsApp Style */}
            <div className="mb-4 max-h-96 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="text-sm text-gray-500">Loading comments...</div>
                </div>
              ) : allCommentsWithPending.length > 0 ? (
                <>
                  {allCommentsWithPending.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      userId={currentUserId}
                      userRole={currentUserRole}
                      onDelete={handleDelete}
                      isPending={comment.id?.startsWith('pending-') || false}
                    />
                  ))}
                  <div ref={commentsEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <ChatBubbleLeftIcon className="mb-2 h-10 w-10 text-gray-300" />
                  <p className="text-sm">No comments yet. Be the first to add one!</p>
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>

            {/* Add Comment Form - WhatsApp Style */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-3 dark:border-dark-600">
              <div className="mb-2">
                <Textarea
                  id="new-comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                  className="resize-none"
                  unstyled={false}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outlined"
                  className="px-2 py-1 text-xs"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="px-2 py-1 text-xs"
                  disabled={!newComment.trim() || addComment.isPending}
                >
                  {addComment.isPending ? "Adding..." : "Send"}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
