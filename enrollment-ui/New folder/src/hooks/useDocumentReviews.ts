import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface DocumentReview {
  id: string;
  document_id: string;
  reviewer_id: string;
  action: "approved" | "changes_requested";
  remarks: string | null;
  created_at: string;
}

/**
 * Expected REST Endpoints:
 * - GET    /api/documents/:documentId/reviews
 * - POST   /api/documents/:documentId/reviews   (body: { action, remarks })
 *
 * Authentication is assumed to be handled by cookies or an auth header.
 * Adjust endpoints to match your backend.
 */

// Fetch reviews for a document
export function useDocumentReviews(documentId: string | undefined) {
  return useQuery({
    queryKey: ["document_reviews", documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("Document ID required");

      const resp = await fetch(`/api/documents/${encodeURIComponent(documentId)}/reviews`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin", // use cookies/session if needed
      });

      if (!resp.ok) {
        const text = await resp.text();
        const msg = text || `Failed to fetch reviews (HTTP ${resp.status})`;
        throw new Error(msg);
      }

      return (await resp.json()) as DocumentReview[];
    },
    enabled: !!documentId,
  });
}

// Create a new review (approve or request changes)
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      action,
      remarks,
    }: {
      documentId: string;
      action: "approved" | "changes_requested";
      remarks?: string;
    }) => {
      if (!documentId) throw new Error("Document ID required");

      const resp = await fetch(`/api/documents/${encodeURIComponent(documentId)}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin", // include cookies if needed
        body: JSON.stringify({ action, remarks }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        const msg = text || `Failed to submit review (HTTP ${resp.status})`;
        throw new Error(msg);
      }

      return (await resp.json()) as DocumentReview;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["document_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["documents", variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success(
        variables.action === "approved"
          ? "Document approved"
          : "Changes requested"
      );
    },
    onError: (error: any) => {
      toast.error("Failed to submit review: " + (error?.message ?? "unknown"));
    },
  });
}
