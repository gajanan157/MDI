export function extractCommentText(comment: Record<string, unknown>): string {
  const candidates = ["comment", "text", "COMMENT", "TEXT"] as const;
  for (const key of candidates) {
    const value = comment[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

export function sanitizeCommentText(
  commentText: string,
  comment: Record<string, unknown>,
): string {
  const tableRowFieldValues = [
    "PED",
    "Initial",
    "Specific Disease",
    comment.type,
    comment.code,
    comment.title,
  ].filter(Boolean);

  if (commentText && tableRowFieldValues.includes(commentText)) {
    return "(No comment text)";
  }

  if (!commentText && comment.created_at) {
    return "(No comment text)";
  }

  return commentText;
}
