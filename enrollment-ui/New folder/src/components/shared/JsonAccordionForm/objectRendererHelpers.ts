import type { Comment } from "@/hooks/useComments";
import { createClientSideId } from "./utils";

const METADATA_FIELD_KEYS = new Set([
  "field_metadata",
  "section_metadata",
  "_field_metadata",
  "_section_metadata",
]);

export function isMetadataFieldKey(key: string): boolean {
  return METADATA_FIELD_KEYS.has(key.toLowerCase().trim());
}

export function canUserEditFields(
  userRole: "maker1" | "maker2" | "checker" | "superadmin" | null | undefined,
): boolean {
  return (
    userRole === "checker" ||
    userRole === "superadmin" ||
    userRole === "maker1" ||
    userRole === "maker2" ||
    userRole === null
  );
}

export function listingItemToDisplayString(item: unknown): string {
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null) {
    try {
      return JSON.stringify(item);
    } catch {
      return String(item);
    }
  }
  return String(item != null ? item : "");
}

export function coerceListingItemUpdate(
  item: unknown,
  newValue: string,
): unknown {
  if (typeof item === "number") {
    const num = Number(newValue);
    return Number.isNaN(num) ? newValue : num;
  }
  if (typeof item === "boolean") {
    return newValue === "true" || newValue === "True";
  }
  if (typeof item === "object" && item !== null) {
    try {
      return JSON.parse(newValue);
    } catch {
      return newValue;
    }
  }
  return newValue;
}

export function normalizePathForMatch(path: string): string {
  return path.replace(/\[(\d+)\]/g, ".$1");
}

export function isNestedCollapsibleOpen(
  nestedObjectPath: string,
  dotNotationPath: string,
  openPaths: Set<string> | undefined,
  matchedPaths: string[] | undefined,
): boolean | undefined {
  if (!openPaths) return undefined;

  const normalizedNestedPath = normalizePathForMatch(nestedObjectPath);
  if (
    openPaths.has(nestedObjectPath) ||
    openPaths.has(dotNotationPath) ||
    openPaths.has(normalizedNestedPath)
  ) {
    return true;
  }

  const openPathMatches = Array.from(openPaths).some((openPath) => {
    const normalizedOpenPath = normalizePathForMatch(openPath);
    return (
      normalizedNestedPath.startsWith(normalizedOpenPath + ".") ||
      normalizedOpenPath.startsWith(normalizedNestedPath + ".") ||
      normalizedNestedPath === normalizedOpenPath ||
      dotNotationPath.startsWith(normalizePathForMatch(openPath) + ".") ||
      normalizePathForMatch(openPath).startsWith(dotNotationPath + ".")
    );
  });
  if (openPathMatches) return true;

  if (!matchedPaths?.length) return false;

  return matchedPaths.some((matchPath) => {
    const normalizedMatchPath = normalizePathForMatch(matchPath);
    return (
      normalizedMatchPath.startsWith(normalizedNestedPath + ".") ||
      normalizedMatchPath === normalizedNestedPath ||
      normalizedNestedPath.startsWith(normalizedMatchPath + ".") ||
      normalizedMatchPath.startsWith(dotNotationPath + ".") ||
      dotNotationPath.startsWith(normalizedMatchPath + ".")
    );
  });
}

export function getParentSourcesFromRootData(
  rootData: Record<string, unknown> | undefined,
  keyPath: Array<string | number>,
): any[] | null {
  if (!rootData || typeof rootData !== "object" || keyPath.length === 0) {
    return null;
  }

  try {
    const parentKey = keyPath[0];
    if (typeof parentKey !== "string" || !(parentKey in rootData)) {
      return null;
    }
    const parentObj = rootData[parentKey];
    if (
      parentObj &&
      typeof parentObj === "object" &&
      "sources" in parentObj &&
      Array.isArray((parentObj as { sources?: unknown }).sources)
    ) {
      const sources = (parentObj as { sources: unknown[] }).sources;
      return sources.length > 0 ? sources : null;
    }
  } catch {
    return null;
  }

  return null;
}

type RawComment = Record<string, unknown> | string;

function mapRawComment(c: RawComment): Comment {
  if (typeof c === "string") {
    return {
      id: createClientSideId("comment"),
      userId: "unknown",
      userRole: "unknown",
      comment: c,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };
  }

  return {
    id: (c.id as string) || createClientSideId("comment"),
    userId: (c.user_id as string) || (c.userId as string) || "unknown",
    userRole: (c.user_role as string) || (c.userRole as string) || "unknown",
    comment: (c.comment as string) || (c.text as string) || "",
    createdAt:
      (c.created_at as string) ||
      (c.createdAt as string) ||
      new Date().toISOString(),
    updatedAt:
      (c.updated_at as string) ||
      (c.updatedAt as string) ||
      new Date().toISOString(),
    replies: (c.replies as Comment["replies"]) || [],
  };
}

export function resolveFieldComments(
  fieldPath: string,
  getComments: ((path: string) => Comment[]) | undefined,
  fallbackComments: RawComment[],
): Comment[] {
  const fromGetComments = getComments ? getComments(fieldPath) : [];
  if (fromGetComments.length > 0) {
    return fromGetComments;
  }
  const list = Array.isArray(fallbackComments) ? fallbackComments : [];
  return list.map(mapRawComment);
}

export function collectListingItemComments(
  itemFieldPath: string,
  jsonComments: Record<string, RawComment[]> | undefined,
  rootData: Record<string, unknown> | undefined,
  pendingComments: Array<{ fieldName?: string; comment: string; userRole?: string }>,
  userId: string,
): RawComment[] {
  const commentsFromJson = jsonComments?.[itemFieldPath] || [];
  const commentsFromRoot =
    (rootData?._comments as Record<string, RawComment[]> | undefined)?.[
      itemFieldPath
    ] || [];
  const commentsFromPending = pendingComments
    .filter((pc) => pc?.fieldName === itemFieldPath)
    .map((pc) => ({
      id: `pending-${Date.now()}`,
      comment: pc.comment,
      created_at: new Date().toISOString(),
      user_id: userId,
      user_role: pc.userRole,
    }));

  return [...commentsFromJson, ...commentsFromRoot, ...commentsFromPending];
}

export function getFieldStatusLabel(
  status: string | null | undefined,
): string {
  if (status === "approved") return "Approve";
  if (status === "approve_with_pendency") return "Approve with Pendency";
  if (status === "rejected") return "Reject";
  return status || "";
}

export function getFieldStatusClassName(status: string | null | undefined): string {
  if (status === "approved") return "bg-green-100 text-green-800";
  if (status === "approve_with_pendency") return "bg-yellow-100 text-yellow-800";
  if (status === "rejected") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}
