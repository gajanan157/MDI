// src/components/shared/JsonAccordionForm/FieldCommentButton.tsx
import { useState } from "react";
import {
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Comment } from "@/hooks/useComments";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui";
import { formatUserRoleLabel } from "./displayHelpers";
interface FieldCommentButtonProps {
  fieldPath: string;
  comments: Comment[];
  onAddComment?: (fieldPath: string, comment: string, userId: string) => void;
  userId?: string;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
}

export default function FieldCommentButton({
  fieldPath,
  comments,
  onAddComment,
  userId = "current-user",
  userRole: userRoleProp,
}: FieldCommentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Show for both maker, checker, and super admin roles (all can see and add comments)
  const shouldShow =
    userRoleProp === "maker1" ||
    userRoleProp === "maker2" ||
    userRoleProp === "checker" ||
    userRoleProp === "superadmin";

  if (!shouldShow) {
    return null;
  }

  // Re-calculate comment count whenever comments prop changes
  const commentCount = comments.length;

  const handleAddComment = () => {
    if (newComment.trim()) {
      if (!onAddComment) {
        return;
      }

      try {
        onAddComment(fieldPath, newComment.trim(), userId);
        setNewComment("");
        // Keep accordion open after adding comment so user can see it
        setIsOpen(true);
      } catch (error) {
        console.log(error);
        // Silently handle error
      }
    }
  };

  // Delete comment functionality removed

  return (
    <div
      className="w-full"
      onClick={(e) => e.stopPropagation()}
      data-comment-area
      data-field-comment
    >
      {/* Comment Button - Toggle Accordion */}
      <button
        type="button"
        data-comment-button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
        title={`${commentCount} comment${commentCount !== 1 ? "s" : ""}`}
      >
        <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
        {commentCount > 0 && (
          <span className="font-semibold">{commentCount}</span>
        )}
        {isOpen ? (
          <ChevronUpIcon className="ml-1 h-3 w-3" />
        ) : (
          <ChevronDownIcon className="ml-1 h-3 w-3" />
        )}
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div
          className="dark:border-dark-600 dark:bg-dark-800 mt-2 rounded-lg border border-gray-200 bg-white shadow-sm"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Comments List */}
          <div className="max-h-64 space-y-3 overflow-y-auto p-3">
            {comments.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment, index) => {
                // Get role badge color
                const getRoleBadgeColor = (role: string) => {
                  switch (role?.toLowerCase()) {
                    case "maker1":
                      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800";
                    case "maker2":
                      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
                    case "checker":
                      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
                    case "superadmin":
                      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
                    default:
                      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
                  }
                };

                return (
                  <div
                    key={index}
                    className="rounded-md border-l-2 border-blue-200 bg-blue-50/50 px-3 py-2.5 dark:border-blue-800 dark:bg-blue-900/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {/* Comment Text */}
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                          {comment.comment}
                        </p>

                        {/* User Info and Timestamp */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {/* User ID/Name */}
                          {comment.userId && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {comment.userId}
                              </span>
                            </div>
                          )}

                          {/* Role Badge */}
                          {comment.userRole && (
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                                comment.userRole,
                              )}`}
                            >
                              {formatUserRoleLabel(comment.userRole)}
                            </span>
                          )}

                          {/* Timestamp */}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(comment.createdAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Comment Form */}
          <div className="dark:border-dark-600 dark:bg-dark-900/50 border-t border-gray-200 bg-gray-50 p-3">
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (newComment.trim()) {
                      handleAddComment();
                    }
                  }}
                  disabled={!newComment.trim()}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

FieldCommentButton.displayName = "FieldCommentButton";
