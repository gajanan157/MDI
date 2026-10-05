// src/hooks/useComments.ts
import { useState, useCallback } from "react";

export interface Comment {
  id?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userRole: string;
  parentId?: string;
  replies?: Comment[];
}

export interface CommentsMetadata {
  [fieldPath: string]: Comment[];
}

/**
 * Hook for managing field-level comments stored in metadata
 * Comments are stored separately from JSON data using path-based keys
 */
export function useComments(initialMetadata?: CommentsMetadata) {
  const [commentsMetadata, setCommentsMetadata] = useState<CommentsMetadata>(
    initialMetadata || {}
  );

  /**
   * Get comments for a specific field path
   * @param fieldPath - Path to the field (e.g., "section1.field3" or "otherBaseCovers.0.subLimit")
   */
  const getComments = useCallback(
    (fieldPath: string): Comment[] => {
      return commentsMetadata[fieldPath] || [];
    },
    [commentsMetadata]
  );

  /**
   * Add a comment to a field
   * userId and userRole are passed from Keycloak token (fetched in component)
   */
  const addComment = useCallback(
    (
      fieldPath: string,
      comment: string,
      userId: string,
      userRole: string,
    ) => {
      const newComment: Comment = {
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
        userRole,
      };

      setCommentsMetadata((prev) => {
        const fieldComments = prev[fieldPath] || [];
        // Add as top-level comment
        return {
          ...prev,
          [fieldPath]: [...fieldComments, newComment],
        };
      });

      return newComment;
    },
    []
  );

  // Delete comment functionality removed - comments cannot be deleted

  /**
   * Get comment count for a field
   */
  const getCommentCount = useCallback(
    (fieldPath: string): number => {
      const comments = getComments(fieldPath);
      return comments.length;
    },
    [getComments]
  );

  /**
   * Get all comments metadata (for saving)
   */
  const getAllComments = useCallback((): CommentsMetadata => {
    return commentsMetadata;
  }, [commentsMetadata]);

  /**
   * Set comments metadata (for loading)
   */
  const setComments = useCallback((metadata: CommentsMetadata) => {
    setCommentsMetadata(metadata);
  }, []);

  return {
    getComments,
    addComment,
    getCommentCount,
    getAllComments,
    setComments,
  };
}

