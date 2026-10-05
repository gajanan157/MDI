// src/hooks/useFieldComments.ts
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClientSideId } from "@/utils/createClientSideId";

export interface FieldComment {
  id: string;
  row_id: string;
  field_name: string;
  user_id: string;
  user_role?: "maker" | "checker" | "admin"; // Role of the user who made the comment
  comment: string;
  created_at: string;
  updated_at: string;
  parent_id?: string; // ID of parent comment if this is a reply
  replies?: FieldComment[]; // Nested replies
}

/**
 * Field-level comment hooks for managing comments on specific fields in table rows.
 * 
 * - No network calls (mock implementation)
 * - In-memory store (module-level) persists for the session
 * - Simulated latency for realism
 * - React Query cache updated so UI reacts immediately
 */

/* -------------------- In-memory mock store -------------------- */

/**
 * DUMMY DATA DEMONSTRATING COMMENT HIERARCHY:
 * 
 * Structure:
 * - Top-level comments (no parent_id)
 * - Reply comments (with parent_id pointing to parent)
 * - Nested replies (replies can have their own replies array)
 * 
 * Visual Hierarchy:
 * Comment 1 (Top-level)
 *   ├─ Reply 1.1 (parent_id = Comment 1)
 *   │  └─ Nested Reply 1.1.1 (parent_id = Reply 1.1)
 *   └─ Reply 1.2 (parent_id = Comment 1)
 * 
 * Comment 2 (Top-level)
 *   └─ Reply 2.1 (parent_id = Comment 2)
 * 
 * Comment 3 (Top-level, no replies)
 */
const MOCK_FIELD_COMMENTS: FieldComment[] = [
  // ========== TOP-LEVEL COMMENT 1 ==========
  {
    id: "fc-comment-001",
    row_id: "row-123",
    field_name: "customer_name",
    user_id: "user-maker-001",
    user_role: "maker",
    comment: "This customer name needs verification. Please check the spelling.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    // No parent_id = this is a top-level comment
    replies: [
      // ========== REPLY 1.1 (to Comment 1) ==========
      {
        id: "fc-reply-001",
        row_id: "row-123",
        field_name: "customer_name",
        user_id: "user-checker-001",
        user_role: "checker",
        comment: "I've verified the spelling. It's correct as per the ID proof.",
        created_at: "2024-01-15T11:00:00Z",
        updated_at: "2024-01-15T11:00:00Z",
        parent_id: "fc-comment-001", // This is a reply to Comment 1
        replies: [
          // ========== NESTED REPLY 1.1.1 (to Reply 1.1) ==========
          {
            id: "fc-nested-001",
            row_id: "row-123",
            field_name: "customer_name",
            user_id: "user-maker-001",
            user_role: "maker",
            comment: "Thanks for confirming! I'll proceed with the approval.",
            created_at: "2024-01-15T11:15:00Z",
            updated_at: "2024-01-15T11:15:00Z",
            parent_id: "fc-reply-001", // This is a reply to Reply 1.1
            replies: [], // No further nested replies
          },
        ],
      },
      // ========== REPLY 1.2 (to Comment 1) ==========
      {
        id: "fc-reply-002",
        row_id: "row-123",
        field_name: "customer_name",
        user_id: "user-admin-001",
        user_role: "admin",
        comment: "Please also verify the middle name if available.",
        created_at: "2024-01-15T11:30:00Z",
        updated_at: "2024-01-15T11:30:00Z",
        parent_id: "fc-comment-001", // This is also a reply to Comment 1
        replies: [], // No nested replies
      },
    ],
  },

  // ========== TOP-LEVEL COMMENT 2 ==========
  {
    id: "fc-comment-002",
    row_id: "row-123",
    field_name: "customer_name",
    user_id: "user-checker-002",
    user_role: "checker",
    comment: "The customer name matches the PAN card. Approved.",
    created_at: "2024-01-15T12:00:00Z",
    updated_at: "2024-01-15T12:00:00Z",
    // No parent_id = this is a top-level comment
    replies: [
      // ========== REPLY 2.1 (to Comment 2) ==========
      {
        id: "fc-reply-003",
        row_id: "row-123",
        field_name: "customer_name",
        user_id: "user-maker-002",
        user_role: "maker",
        comment: "Great! Moving to next step.",
        created_at: "2024-01-15T12:15:00Z",
        updated_at: "2024-01-15T12:15:00Z",
        parent_id: "fc-comment-002", // This is a reply to Comment 2
        replies: [], // No nested replies
      },
    ],
  },

  // ========== TOP-LEVEL COMMENT 3 (No replies) ==========
  {
    id: "fc-comment-003",
    row_id: "row-123",
    field_name: "customer_name",
    user_id: "user-maker-003",
    user_role: "maker",
    comment: "This field looks good to me.",
    created_at: "2024-01-15T13:00:00Z",
    updated_at: "2024-01-15T13:00:00Z",
    // No parent_id = top-level comment
    replies: [], // No replies yet
  },

  // ========== TOP-LEVEL COMMENT 4 (Deep nesting example) ==========
  {
    id: "fc-comment-004",
    row_id: "row-456",
    field_name: "email_address",
    user_id: "user-checker-003",
    user_role: "checker",
    comment: "Email format validation failed. Please check.",
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T09:00:00Z",
    replies: [
      {
        id: "fc-reply-004",
        row_id: "row-456",
        field_name: "email_address",
        user_id: "user-maker-004",
        user_role: "maker",
        comment: "I've corrected the email. Can you verify again?",
        created_at: "2024-01-16T09:30:00Z",
        updated_at: "2024-01-16T09:30:00Z",
        parent_id: "fc-comment-004",
        replies: [
          {
            id: "fc-nested-002",
            row_id: "row-456",
            field_name: "email_address",
            user_id: "user-checker-003",
            user_role: "checker",
            comment: "Still showing error. Can you share the exact email?",
            created_at: "2024-01-16T10:00:00Z",
            updated_at: "2024-01-16T10:00:00Z",
            parent_id: "fc-reply-004",
            replies: [
              {
                id: "fc-deep-001",
                row_id: "row-456",
                field_name: "email_address",
                user_id: "user-maker-004",
                user_role: "maker",
                comment: "The email is: customer@example.com",
                created_at: "2024-01-16T10:15:00Z",
                updated_at: "2024-01-16T10:15:00Z",
                parent_id: "fc-nested-002",
                replies: [], // Deepest level
              },
            ],
          },
        ],
      },
    ],
  },

  // ========== Additional example for different field ==========
  {
    id: "fc-comment-005",
    row_id: "row-789",
    field_name: "phone_number",
    user_id: "user-maker-005",
    user_role: "maker",
    comment: "Phone number format needs to be standardized.",
    created_at: "2024-01-17T08:00:00Z",
    updated_at: "2024-01-17T08:00:00Z",
    replies: [
      {
        id: "fc-reply-005",
        row_id: "row-789",
        field_name: "phone_number",
        user_id: "user-checker-005",
        user_role: "checker",
        comment: "What format should we use?",
        created_at: "2024-01-17T08:30:00Z",
        updated_at: "2024-01-17T08:30:00Z",
        parent_id: "fc-comment-005",
        replies: [
          {
            id: "fc-nested-003",
            row_id: "row-789",
            field_name: "phone_number",
            user_id: "user-maker-005",
            user_role: "maker",
            comment: "Use international format: +91-XXXXXXXXXX",
            created_at: "2024-01-17T09:00:00Z",
            updated_at: "2024-01-17T09:00:00Z",
            parent_id: "fc-reply-005",
            replies: [],
          },
        ],
      },
    ],
  },

  // ========== OFFICE HIERARCHY COMMENTS - Office 1 ==========
  {
    id: "fc-office-001",
    row_id: "office-ho-001",
    field_name: "office_name",
    user_id: "user-maker-office",
    user_role: "maker",
    comment: "This Head Office needs verification of its registration documents.",
    created_at: "2024-01-18T09:00:00Z",
    updated_at: "2024-01-18T09:00:00Z",
    replies: [
      {
        id: "fc-office-reply-001",
        row_id: "office-ho-001",
        field_name: "office_name",
        user_id: "user-checker-office",
        user_role: "checker",
        comment: "I've reviewed the documents. All registration papers are in order.",
        created_at: "2024-01-18T10:00:00Z",
        updated_at: "2024-01-18T10:00:00Z",
        parent_id: "fc-office-001",
        replies: [
          {
            id: "fc-office-nested-001",
            row_id: "office-ho-001",
            field_name: "office_name",
            user_id: "user-maker-office",
            user_role: "maker",
            comment: "Perfect! I'll proceed with the approval process.",
            created_at: "2024-01-18T10:30:00Z",
            updated_at: "2024-01-18T10:30:00Z",
            parent_id: "fc-office-reply-001",
            replies: [],
          },
        ],
      },
      {
        id: "fc-office-reply-002",
        row_id: "office-ho-001",
        field_name: "office_name",
        user_id: "user-admin-office",
        user_role: "admin",
        comment: "Please also verify the parent company details.",
        created_at: "2024-01-18T11:00:00Z",
        updated_at: "2024-01-18T11:00:00Z",
        parent_id: "fc-office-001",
        replies: [],
      },
    ],
  },

  // ========== OFFICE HIERARCHY COMMENTS - Office 2 ==========
  {
    id: "fc-office-002",
    row_id: "office-ro-001",
    field_name: "office_name",
    user_id: "user-checker-office",
    user_role: "checker",
    comment: "Regional Office location needs to be updated in the system.",
    created_at: "2024-01-19T08:00:00Z",
    updated_at: "2024-01-19T08:00:00Z",
    replies: [
      {
        id: "fc-office-reply-003",
        row_id: "office-ro-001",
        field_name: "office_name",
        user_id: "user-maker-office",
        user_role: "maker",
        comment: "What is the new location address?",
        created_at: "2024-01-19T08:30:00Z",
        updated_at: "2024-01-19T08:30:00Z",
        parent_id: "fc-office-002",
        replies: [
          {
            id: "fc-office-nested-002",
            row_id: "office-ro-001",
            field_name: "office_name",
            user_id: "user-checker-office",
            user_role: "checker",
            comment: "New address: 123 Business Park, Sector 5, Mumbai - 400001",
            created_at: "2024-01-19T09:00:00Z",
            updated_at: "2024-01-19T09:00:00Z",
            parent_id: "fc-office-reply-003",
            replies: [
              {
                id: "fc-office-deep-001",
                row_id: "office-ro-001",
                field_name: "office_name",
                user_id: "user-maker-office",
                user_role: "maker",
                comment: "Got it! I'll update the address in the system now.",
                created_at: "2024-01-19T09:15:00Z",
                updated_at: "2024-01-19T09:15:00Z",
                parent_id: "fc-office-nested-002",
                replies: [],
              },
            ],
          },
        ],
      },
    ],
  },

  // ========== OFFICE HIERARCHY COMMENTS - Office 3 ==========
  {
    id: "fc-office-003",
    row_id: "office-do-001",
    field_name: "office_name",
    user_id: "user-maker-office",
    user_role: "maker",
    comment: "Divisional Office contact information is incomplete.",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
    replies: [],
  },
];

/* fake latency */
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

/* -------------------- Hooks -------------------- */

/**
 * useFieldComments(rowId, fieldName, jsonComments?)
 * - returns comments array for a specific row + field combination
 * - enabled only when both rowId and fieldName are provided
 * - If jsonComments is provided, uses that instead of the mock store
 */
export function useFieldComments(
  rowId: string | undefined,
  fieldName: string | undefined,
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
  }>>
) {
  const queryClient = useQueryClient();

  // Optional: simple polling to simulate realtime updates (every 8s)
  useEffect(() => {
    if (!rowId || !fieldName) return;
    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      queryClient.invalidateQueries({
        queryKey: ["field_comments", rowId, fieldName],
      });
    }, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [rowId, fieldName, queryClient]);

  return useQuery({
    queryKey: ["field_comments", rowId, fieldName, jsonComments],
    queryFn: async () => {
      if (!rowId || !fieldName) throw new Error("Row ID and field name required");
      await delay(200);
      
      // If jsonComments provided, use those (from JSON data)
      if (jsonComments) {
        
        if (jsonComments[fieldName]) {
          // Flatten comments and replies into a single array for processing
          const allComments: FieldComment[] = [];
          
          jsonComments[fieldName].forEach((c, idx) => {
            const commentId = c.id || `json-${idx}`;
            // Add main comment
            const mainComment: FieldComment = {
              id: commentId,
              row_id: rowId,
              field_name: fieldName,
              user_id: c.user_id,
              user_role: c.user_role,
              comment: c.comment,
              created_at: c.created_at,
              updated_at: c.updated_at,
              parent_id: c.parent_id,
              replies: [],
            };
            
            // Add replies if they exist and property is present
            if ((c as any).replies && Array.isArray((c as any).replies)) {
              mainComment.replies = (c as any).replies.map((reply: any, replyIdx: number) => ({
                id: reply.id || `${commentId}-reply-${replyIdx}`,
                row_id: rowId,
                field_name: fieldName,
                user_id: reply.user_id,
                user_role: reply.user_role,
                comment: reply.comment,
                created_at: reply.created_at,
                updated_at: reply.updated_at,
                parent_id: reply.parent_id || commentId,
                replies: [],
              }));
            }
            
            allComments.push(mainComment);
          });
          
          return allComments;
        } else {
        }
      }
      
      // Otherwise use mock store
      return MOCK_FIELD_COMMENTS.filter(
        (c) => c.row_id === rowId && c.field_name === fieldName
      ).map((c) => ({ ...c }));
    },
    enabled: !!rowId && !!fieldName,
  });
}

/**
 * useAllFieldCommentsForRow(rowId)
 * - returns all field comments for a specific row (all fields)
 */
export function useAllFieldCommentsForRow(rowId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!rowId) return;
    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      queryClient.invalidateQueries({
        queryKey: ["field_comments_row", rowId],
      });
    }, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [rowId, queryClient]);

  return useQuery({
    queryKey: ["field_comments_row", rowId],
    queryFn: async () => {
      if (!rowId) throw new Error("Row ID required");
      await delay(200);
      return MOCK_FIELD_COMMENTS.filter((c) => c.row_id === rowId).map((c) => ({
        ...c,
      }));
    },
    enabled: !!rowId,
  });
}

/**
 * useFieldCommentCount(rowId, fieldName, jsonComments?)
 * - returns the count of comments for a specific field
 * - If jsonComments is provided, uses that instead of the mock store
 */
export function useFieldCommentCount(
  rowId: string | undefined,
  fieldName: string | undefined,
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
  }>>
) {
  const { data: comments } = useFieldComments(rowId, fieldName, jsonComments);
  return comments?.length ?? 0;
}

/**
 * useAddFieldComment()
 * mutation takes { rowId, fieldName, comment, userId?, userRole? }
 */
export function useAddFieldComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      rowId: string;
      fieldName: string;
      comment: string;
      userId?: string;
      userRole?: "maker" | "checker" | "admin";
      parentId?: string;
    }) => {
      const { rowId, fieldName, comment, userId, userRole, parentId } = payload;
      if (!rowId) throw new Error("Row ID required");
      if (!fieldName) throw new Error("Field name required");
      if (!comment || !comment.trim()) throw new Error("Comment required");
      await delay(350);

      const now = new Date().toISOString();
      const newComment: FieldComment = {
        id: createClientSideId("fc"),
        row_id: rowId,
        field_name: fieldName,
        user_id: userId ?? "mock-user",
        user_role: userRole,
        comment: comment.trim(),
        created_at: now,
        updated_at: now,
        parent_id: parentId,
        replies: [],
      };

      // push into in-memory store
      MOCK_FIELD_COMMENTS.push(newComment);

      // Update React Query cache for this field's comments
      queryClient.setQueryData<FieldComment[]>(
        ["field_comments", rowId, fieldName],
        (old = []) => {
          const arr = Array.isArray(old) ? old : [];
          return [...arr, newComment];
        }
      );

      // Also update the row-level cache
      queryClient.setQueryData<FieldComment[]>(
        ["field_comments_row", rowId],
        (old = []) => {
          const arr = Array.isArray(old) ? old : [];
          return [...arr, newComment];
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["field_comments", rowId, fieldName],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["field_comments_row", rowId],
        exact: true,
      });

      return newComment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["field_comments", variables.rowId, variables.fieldName],
      });
      queryClient.invalidateQueries({
        queryKey: ["field_comments_row", variables.rowId],
      });
      toast.success("Comment added");
    },
    onError: (err: any) => {
      toast.error("Failed to add comment: " + (err?.message ?? "unknown"));
    },
  });
}

/**
 * useDeleteFieldComment()
 * mutation takes { id, rowId, fieldName }
 */
export function useDeleteFieldComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      rowId: string;
      fieldName: string;
    }) => {
      const { id, rowId, fieldName } = payload;
      if (!id) throw new Error("Comment id required");
      await delay(200);

      const idx = MOCK_FIELD_COMMENTS.findIndex((c) => c.id === id);
      if (idx !== -1) {
        MOCK_FIELD_COMMENTS.splice(idx, 1);
      } else {
        throw new Error("Comment not found");
      }

      // Update cache for that field
      queryClient.setQueryData<FieldComment[]>(
        ["field_comments", rowId, fieldName],
        (old) => (Array.isArray(old) ? old : []).filter((c) => c.id !== id)
      );

      // Update row-level cache
      queryClient.setQueryData<FieldComment[]>(
        ["field_comments_row", rowId],
        (old) => (Array.isArray(old) ? old : []).filter((c) => c.id !== id)
      );

      queryClient.invalidateQueries({
        queryKey: ["field_comments", rowId, fieldName],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["field_comments_row", rowId],
        exact: true,
      });

      return { rowId, fieldName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["field_comments", data.rowId, data.fieldName],
      });
      queryClient.invalidateQueries({
        queryKey: ["field_comments_row", data.rowId],
      });
      toast.success("Comment deleted");
    },
    onError: (err: any) => {
      toast.error("Failed to delete comment: " + (err?.message ?? "unknown"));
    },
  });
}

