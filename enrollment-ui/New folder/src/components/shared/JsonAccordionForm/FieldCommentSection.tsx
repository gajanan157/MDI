import { useEffect, useState } from "react";
import { extractCommentText, sanitizeCommentText } from "./fieldCommentHelpers";

interface FieldCommentSectionProps {
  commentsArray: Array<any>;
  isCommentEditable?: boolean;
  onCommentChange?: (comments: Array<any>) => void;
}

export function FieldCommentSection({
  commentsArray,
}: FieldCommentSectionProps) {
  const [localComments, setLocalComments] = useState<Array<any>>(commentsArray);

  // Sync local comments with prop changes
  useEffect(() => {
    setLocalComments(commentsArray);
  }, [commentsArray]);

  // Normalize comments - detect API comments (have proper id, created_at, user_id)
  const normalizedComments = localComments.map((comment: any, index: number) => {
    if (typeof comment === 'string') {
      return {
        id: `c-legacy-${index}`,
        comment: comment,
        text: comment,
        created_at: new Date().toISOString(),
        user_id: 'unknown',
        fromAPI: false,
      };
    }
    
    const commentText = sanitizeCommentText(
      extractCommentText(comment),
      comment,
    );
    
    // Detect API comments: have numeric/string id, proper timestamp, user_id
    const fromAPI = !!(comment.id && comment.created_at && comment.user_id && 
      (typeof comment.id === 'number' || (typeof comment.id === 'string' && !comment.id.startsWith('c-'))));
    
    return {
      id: comment.id || `c-${index}`,
      comment: commentText, // Always set comment text
      text: commentText, // Also set text for compatibility
      created_at: comment.created_at || comment.createdAt || new Date().toISOString(),
      user_id: comment.user_id || comment.userId || 'unknown',
      fromAPI,
    };
  });

  // Filter out empty comments
  const validComments = normalizedComments.filter(c => c.comment && c.comment !== '(No comment text)' && c.comment.trim().length > 0);

  // Don't show anything if there are no valid comments
  if (validComments.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1.5">
      {validComments.map((comment: any, index: number) => (
        <div
          key={comment.id || index}
          className="rounded-md border-l-2 border-blue-200 bg-blue-50/50 px-2 py-1.5 text-xs dark:border-blue-800 dark:bg-blue-900/10"
        >
          <p className="whitespace-pre-wrap break-words leading-relaxed text-gray-700 dark:text-gray-300">
            {comment.comment || comment.text || '(No comment text)'}
          </p>
          <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
            {new Date(comment.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {comment.user_id && comment.user_id !== 'unknown' && (
              <span className="ml-1.5">• {comment.user_id}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

