// src/hooks/useDocumentComments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClientSideId } from "@/utils/createClientSideId";

export interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

function commentsQueryKey(documentId: string) {
  return ["document_comments", documentId] as const;
}

/**
 * useDocumentComments(documentId)
 * - returns comments array for documentId
 * - enabled only when documentId is provided
 */
export function useDocumentComments(documentId: string | undefined) {
  return useQuery({
    queryKey: commentsQueryKey(documentId ?? ""),
    queryFn: async () => [] as DocumentComment[],
    enabled: !!documentId,
  });
}

/**
 * useAddComment()
 * mutation takes { documentId, comment, userId? }
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      documentId: string;
      comment: string;
      userId?: string;
    }) => {
      const { documentId, comment, userId } = payload;
      if (!documentId) throw new Error("Document ID required");
      if (!comment.trim()) throw new Error("Comment required");

      const now = new Date().toISOString();
      const newComment: DocumentComment = {
        id: createClientSideId("c"),
        document_id: documentId,
        user_id: userId ?? "unknown",
        comment: comment.trim(),
        created_at: now,
        updated_at: now,
      };

      queryClient.setQueryData<DocumentComment[]>(
        commentsQueryKey(documentId),
        (old = []) => [...(Array.isArray(old) ? old : []), newComment],
      );

      return newComment;
    },
    onSuccess: () => {
      toast.success("Comment added");
    },
    onError: (err: unknown) => {
      toast.error(
        "Failed to add comment: " +
          (err instanceof Error ? err.message : "unknown"),
      );
    },
  });
}

/**
 * useDeleteComment()
 * mutation takes { id, documentId }
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; documentId: string }) => {
      const { id, documentId } = payload;
      if (!id) throw new Error("Comment id required");

      queryClient.setQueryData<DocumentComment[]>(
        commentsQueryKey(documentId),
        (old = []) =>
          (Array.isArray(old) ? old : []).filter((comment) => comment.id !== id),
      );

      return documentId;
    },
    onSuccess: () => {
      toast.success("Comment deleted");
    },
    onError: (err: unknown) => {
      toast.error(
        "Failed to delete comment: " +
          (err instanceof Error ? err.message : "unknown"),
      );
    },
  });
}
