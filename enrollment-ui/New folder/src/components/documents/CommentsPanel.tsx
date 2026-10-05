import { useState } from "react";
import { useDocumentComments, useAddComment, useDeleteComment } from "@/hooks/useDocumentComments";
import { ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { useAuthContext } from "@/app/contexts/auth/context";

interface CommentsPanelProps {
  documentId: string;
}

export function CommentsPanel({ documentId }: CommentsPanelProps) {
  const { user } = useAuthContext();
  const { data: comments, isLoading } = useDocumentComments(documentId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addComment.mutateAsync({
      documentId,
      comment: newComment.trim(),
    });
    setNewComment("");
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="p-2 bg-blue-50 rounded-lg">
          <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600" />
        </div>
        Comments & Remarks
      </h3>

      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                    {comment.comment}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() =>
                      deleteComment.mutate({ id: comment.id, documentId })
                    }
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete comment"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No comments yet. Be the first to add one!</p>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comment or remarks..."
          rows={3}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <Button
          type="submit"
          color="primary"
          variant="filled"
          disabled={!newComment.trim() || addComment.isPending}
          className="w-full"
        >
          {addComment.isPending ? "Adding..." : "Add Comment"}
        </Button>
      </form>
    </div>
  );
}
