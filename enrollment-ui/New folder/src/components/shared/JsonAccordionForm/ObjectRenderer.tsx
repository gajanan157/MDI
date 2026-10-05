// Search working
// src/components/shared/JsonAccordionForm/ObjectRenderer.tsx
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import ObjectRendererFieldEntry from "./ObjectRendererFieldEntry";
import { ObjectRendererProps } from "./types";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";

export default function ObjectRenderer({
  data,
  path = [],
  editingMap,
  searchText,
  activeMatchPath,
  matchedPaths = [],
  openPaths,
  actualDataWithoutChangeValue,
  onValueChange,
  onAddField,
  onRemoveField,
  errors,
  rowId,
  isMaker = false,
  userRole,
  onAddPendingComment,
  isApproved = true,
  pendingComments = [],
  jsonComments,
  rootData,
  newlyAddedFields = new Set(),
  commentOnlyMode = false,
  shouldEnableComments = false,
  shouldEnableSectionComments = false,
  shouldEnableStatus = false,
  fieldStatus = {},
  onFieldStatusChange,
  newComments = {},
  onNewCommentsChange,
  onSourceClick,
  onRootDataChange,
  onAddFieldAtPath,
  getComments,
  onAddComment,
  userId: userIdProp,
}: ObjectRendererProps & {
  errors?: unknown;
  onAddFieldAtPath?: (
    fieldPath: string,
    fieldName: string,
    fieldValue: unknown,
    metadata?: unknown,
  ) => void;
}) {
  const keycloakUser = useKeycloakUser();
  const userId = userIdProp || keycloakUser.userId || "unknown";

  const isEditing = Object.keys(editingMap).length > 0;
  const [newlyAddedArrayItems, setNewlyAddedArrayItems] = useState<Set<string>>(
    new Set(),
  );
  const newFieldRef = useRef<HTMLDivElement | null>(null);
  const [lastAddedFieldPath, setLastAddedFieldPath] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (lastAddedFieldPath && newFieldRef.current) {
      setTimeout(() => {
        newFieldRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setLastAddedFieldPath(null);
      }, 150);
    }
  }, [lastAddedFieldPath]);

  const internalFields = useMemo(
    () =>
      new Set([
        "_newComment",
        "_newComments",
        "_comments",
        "_status",
        "_comment",
        "_value",
        "sources",
        "references",
        "limits",
        "notes",
        "field_metadata",
        "section_metadata",
        "_field_metadata",
        "_section_metadata",
      ]),
    [],
  );

  const entries = useMemo(() => {
    const filtered = Object.entries(data).filter(([key]) => {
      const normalizedKey = key.toLowerCase().trim();
      if (
        normalizedKey === "field_metadata" ||
        normalizedKey === "section_metadata" ||
        normalizedKey === "_field_metadata" ||
        normalizedKey === "_section_metadata"
      ) {
        return false;
      }
      return !internalFields.has(key);
    });
    const rank = (k: string) =>
      k === "conditions" || k === "tables" || k === "clauses" ? 1 : 0;
    return [...filtered].sort(([a], [b]) => rank(a) - rank(b));
  }, [data, internalFields]);

  const isPathEditable = useCallback(
    (fieldPath: Array<string | number>): boolean => {
      const stringPath = fieldPath.map((p) => String(p));
      const pathString = stringPath.join(".");

      if (editingMap[pathString]) return true;

      for (let i = 1; i <= stringPath.length; i++) {
        const parentPath = stringPath.slice(0, i).join(".");
        if (editingMap[parentPath]) return true;
      }

      return false;
    },
    [editingMap],
  );

  const sharedProps = {
    path,
    editingMap,
    searchText,
    activeMatchPath,
    matchedPaths,
    openPaths,
    actualDataWithoutChangeValue,
    onValueChange,
    onAddField,
    onRemoveField,
    errors,
    rowId,
    isMaker,
    userRole,
    onAddPendingComment,
    isApproved,
    pendingComments,
    jsonComments,
    rootData,
    newlyAddedFields,
    commentOnlyMode,
    shouldEnableComments,
    shouldEnableSectionComments,
    shouldEnableStatus,
    fieldStatus,
    onFieldStatusChange,
    newComments,
    onNewCommentsChange,
    onSourceClick,
    onRootDataChange,
    onAddFieldAtPath,
    getComments,
    onAddComment,
    userId,
    data,
    isPathEditable,
    newlyAddedArrayItems,
    setNewlyAddedArrayItems,
    newFieldRef,
    lastAddedFieldPath,
    setLastAddedFieldPath,
    isEditing,
  };

  return (
    <div
      className="relative w-full min-w-0 space-y-1"
      data-component-name="ObjectRenderer"
      data-path={path.join(".")}
    >
      {entries?.map(([key, val]) => (
        <ObjectRendererFieldEntry
          key={[...path, key].join(".")}
          entryKey={key}
          entryValue={val}
          {...sharedProps}
        />
      ))}
    </div>
  );
}

ObjectRenderer.displayName = "ObjectRenderer";
