// Search working
// src/components/shared/JsonAccordionForm/index.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Accordion } from "@/components/ui/Accordion";

import {
  deepClone,
  getAt,
  setAt,
  isFlatArrayPattern,
  isListingArray,
  shouldHideField,
} from "./utils";
import { JsonAccordionFormProps, AnyObject } from "./types";
import { normalizeUserRoles } from "./displayHelpers";
import { addFieldToFormState } from "./addFieldHelpers";
import { deepMergeWithSources } from "./mergeHelpers";
import { useUserRole } from "@/hooks/useUserRole";
import { useComments } from "@/hooks/useComments";
import { useStatus, StatusValue } from "@/hooks/useStatus";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";

// Sub-components
import TitleSection from "./TitleSection";
import QuickActionsSection from "./QuickActionsSection";
import FileUploadSection from "./FileUploadSection";
import StatusMessages from "./StatusMessages";
import AccordionSectionItem from "./AccordionSectionItem";
import ApprovalActionsSection from "./ApprovalActionsSection";
import ChangesConfirmationModal from "./ChangesConfirmationModal";
import {
  findMatchingSections,
  scrollToFirstMatchingSection,
} from "./jsonAccordionFormSearchHelpers";
import { generateSchema } from "./schemaGenerator";

export interface JsonAccordionFormRef {
  expandAll: () => void;
  collapseAll: () => void;
  expandAllWithEdit: () => void;
  collapseAllAndCloseEdit: () => void;
}

const JsonAccordionForm = React.forwardRef<
  JsonAccordionFormRef,
  JsonAccordionFormProps
>(({
      data: initialData,
      actualData: actualDataWithoutChange,
      onSave = () => { },
      onReset,
      showFileUpload = false,
      className,
      title,
      rowId,
      enableStatus,
      enableComments,
      enableSectionComments = false, // Default to false - hide section-level comments, show only field-level
      userRole: userRoleProp,
      makerApproved = false, // Whether maker has approved - checker cannot act until this is true. Defaults to false (maker not approved initially)
      isApproved = true, // Default to approved, can be passed from parent
      onApprove,
      isApproving: isApprovingProp,
      onApproveWithPendency,
      onReverseToMaker,
      openPaths,
      searchText,
      activeMatchPath,
      matchedPaths,
      customQuickActions,
      hideTitleAndQuickActions = true, // Default to true - title/quick actions should be in wrapper
      showTitleAndQuickActionsOnly = false,
      customActionButtons,
      hideApprovalActions = false,
      readOnly = false,
      skipValidationOnApply = false,
      saveButtonLabel = "Apply Changes",
      savingButtonLabel = "Applying changes...",
      onSourceClick,
      initialCommentsMetadata,
      initialStatusMetadata,
      hideActionButtonsWhenNoData = false,
    },
    ref,
  ) => {
    // Get user role from prop or hook
    const userRoleFromHook = useUserRole();
    const userRole = userRoleProp ?? userRoleFromHook;
    const keycloakUser = useKeycloakUser(); // Get user info from Keycloak token

    const userRoles = normalizeUserRoles(userRole);
    const hasMakerRole =
      userRoles.includes("maker1") || userRoles.includes("maker2");
    const hasCheckerRole =
      userRoles.includes("checker") || userRoles.includes("superadmin");

    // Permission flags
    const isMaker = hasMakerRole && !hasCheckerRole; // Pure maker (not checker)
    const hasBothRoles = hasMakerRole && hasCheckerRole; // User with both roles

    const checkerCanAct = makerApproved || hasBothRoles || hasMakerRole; // Makers can now act directly

    // For passing to child components, use first role or single role
    const userRoleForProps = Array.isArray(userRole) ? userRole[0] : userRole;

    const shouldEnableComments =
      (hasMakerRole || hasCheckerRole) &&
      (enableComments === undefined || enableComments === true);

    const shouldEnableSectionComments =
      shouldEnableComments && enableSectionComments === true;

    const shouldEnableStatus =
      (hasMakerRole || hasCheckerRole) &&
      (enableStatus === undefined || enableStatus === true);

    useEffect(() => {
      const handleMouseDown = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (
          target?.closest("[data-source-button]") ||
          target?.closest("[data-page-number]")
        ) {
          (window as Window & { __lastClickedElement?: HTMLElement }).__lastClickedElement =
            target;
        }
      };

      document.addEventListener("mousedown", handleMouseDown, true);
      return () => document.removeEventListener("mousedown", handleMouseDown, true);
    }, []);

    const transformedInitialComments = useMemo(() => {
      if (!initialCommentsMetadata) return undefined;

      const transformed: Record<
        string,
        Array<{
          comment: string;
          createdAt: string;
          updatedAt: string;
          userId: string;
          userRole: string;
        }>
      > = {};

      Object.keys(initialCommentsMetadata).forEach((fieldPath) => {
        transformed[fieldPath] = initialCommentsMetadata[fieldPath].map(
          (comment) => ({
            comment: comment.comment,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            userId: comment.userId,
            userRole: comment.userRole || "unknown",
          }),
        );
      });

      return transformed;
    }, [initialCommentsMetadata]);

    const {
      getComments,
      addComment: addCommentToHook,
      getAllComments,
      setComments,
    } = useComments(transformedInitialComments);

    const {
      setStatus: setStatusInHook,
      getAllStatus,
      setAllStatus,
    } = useStatus(initialStatusMetadata);

    // Load initial metadata on mount or when it changes
    useEffect(() => {
      if (transformedInitialComments) {
        setComments(transformedInitialComments);
      }
    }, [transformedInitialComments, setComments]);

    useEffect(() => {
      if (initialStatusMetadata) {
        setAllStatus(initialStatusMetadata);
      }
    }, [initialStatusMetadata, setAllStatus]);

    // Force re-render when comments change by using a state counter
    const [commentUpdateCounter, setCommentUpdateCounter] = useState(0);

    // Handlers for comments
    // userId and userRole are fetched from Keycloak token
    const handleAddComment = useCallback(
      (fieldPath: string, comment: string) => {
        if (!addCommentToHook) {
          return;
        }

        try {
          // Get userId and userRole from Keycloak token
          const userId = keycloakUser.userId || "unknown";
          // Convert userRole to string: if array, take first element; if null/undefined, use "unknown"
          const userRoleValue = Array.isArray(userRole)
            ? userRole[0] || "unknown"
            : userRole || "unknown";

          addCommentToHook(fieldPath, comment, userId, userRoleValue);

          // Force re-render by incrementing counter
          setCommentUpdateCounter((prev) => prev + 1);
        } catch (error) {
          console.error(error);
          // Silently handle error
        }
      },
      [addCommentToHook, keycloakUser.userId, userRole],
    );

    const getCommentsWithTrigger = useCallback(
      (fieldPath: string) => getComments(fieldPath),
      [getComments, commentUpdateCounter],
    );

    // Delete comment functionality removed

    // Handler for status
    const handleStatusChange = useCallback(
      (fieldPath: string, status: string | null) => {
        setStatusInHook(fieldPath, status as any);
        setFieldStatus((prev) => ({
          ...prev,
          [fieldPath]: status as StatusValue,
        }));
      },
      [setStatusInHook],
    );

    // State for field status
    const [fieldStatus, setFieldStatus] = useState<Record<string, StatusValue>>(
      {},
    );

    const [formState, setFormState] = useState(() => {
      const cloned = deepClone(initialData || {});
      // Remove all comment/metadata fields from formState
      // JSON data must be completely separate from comments and status metadata
      if (cloned._comments) {
        delete cloned._comments;
      }
      if (cloned._commentsMetadata) {
        delete cloned._commentsMetadata;
      }
      if (cloned._statusMetadata) {
        delete cloned._statusMetadata;
      }
      if (cloned._metadata) {
        delete cloned._metadata;
      }

      // Keep flat arrays as-is for list display (don't transform to objects)

      return cloned;
    });

    // Track which fields were originally flat arrays (for list display)
    const [flatArrayFields] = useState<Set<string>>(() => {
      const fields = new Set<string>();
      Object.keys(initialData || {}).forEach((key) => {
        const value = initialData[key];
        if (Array.isArray(value) && isFlatArrayPattern(value)) {
          fields.add(key);
        }
      });
      return fields;
    });

    // Track which fields are listing arrays (simple arrays)
    const [listingArrayFields, setListingArrayFields] = useState<Set<string>>(
      () => {
        const fields = new Set<string>();
        Object.keys(initialData || {}).forEach((key) => {
          const value = initialData[key];
          if (
            Array.isArray(value) &&
            !isFlatArrayPattern(value) &&
            isListingArray(value)
          ) {
            fields.add(key);
          }
        });
        return fields;
      },
    );

    const [files, setFiles] = useState<File[]>([]);
    // Track newly added fields (only these can be deleted)
    const [newlyAddedFields, setNewlyAddedFields] = useState<Set<string>>(
      new Set(),
    );
    // Track newly added array items (only these can be deleted) - format: "fieldKey:index"
    const [newlyAddedArrayItems, setNewlyAddedArrayItems] = useState<
      Set<string>
    >(new Set());
    // Track newly added table rows - format: "fieldKey:rowIndex"
    const [newlyAddedTableRows, setNewlyAddedTableRows] = useState<Set<string>>(
      new Set(),
    );
    // Track newly added table columns - format: "fieldKey:columnName"
    const [newlyAddedTableColumns, setNewlyAddedTableColumns] = useState<
      Set<string>
    >(new Set());
    // Use a ref to track if openSections has been initialized
    // This prevents resetting when initialData changes (which happens on re-renders)
    const openSectionsInitializedRef = useRef(false);
    const openSectionsRef = useRef<string[]>([]);
    const [openSections, setOpenSections] = useState<string[]>(() => {
      // All accordions closed by default
      openSectionsInitializedRef.current = true;
      return [];
    });

    // Define topLevelEntries BEFORE any useEffect that uses it
    const topLevelEntries = useMemo(
      () => Object.entries(formState || {}),
      [formState],
    );


    // Keep ref in sync with state
    useEffect(() => {
      openSectionsRef.current = openSections;
    }, [openSections]);

    // All accordions closed by default - don't auto-open any sections
    // openSectionsInitializedRef is already set to true in the initial state

    // useEffect(() => {
    //   if (!openPaths || openPaths.size === 0) return;

    //   setOpenSections((prev) => {
    //     const merged = new Set([...prev, ...openPaths]);
    //     return Array.from(merged);
    //   });
    // }, [openPaths]);

    // Memoize top-level keys to prevent unnecessary re-renders when formState changes
    const topLevelKeysSet = useMemo(
      () => new Set(topLevelEntries.map(([key]) => key)),
      [topLevelEntries],
    );

    useEffect(() => {
      if (!openPaths || openPaths.size === 0) {
        // Don't reset openSections if user has manually opened sections
        // Only reset if openPaths is explicitly empty and we're not in a manual state
        return;
      }

      // Extract top-level section keys from openPaths
      // For a path like "tables[8].rows[0]", we want to open the "tables" accordion
      const sectionKeys = new Set<string>();

      openPaths.forEach((path) => {
        // Normalize path format: convert [8] to .8 for consistent parsing
        const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
        const parts = normalizedPath.split(".");

        // Get the first part (top-level key)
        const topLevelKey = parts[0];
        if (topLevelKey && topLevelKeysSet.has(topLevelKey)) {
          sectionKeys.add(topLevelKey);
        }
      });

      const finalSectionKeys = Array.from(sectionKeys).sort((a, b) => a.localeCompare(b));
      const currentSections = openSectionsRef.current.sort();

      const currentStr = JSON.stringify(currentSections);
      const newStr = JSON.stringify(finalSectionKeys);

      // Only update if the sections actually changed
      if (currentStr !== newStr) {
        const newArray = finalSectionKeys.slice();
        setOpenSections(newArray);
      }
    }, [openPaths, topLevelKeysSet]); // Use memoized keys set instead of topLevelEntries

    // Search functionality
    const handleSearch = (searchTerm: string) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return;

      const formatKeyForScroll = (key: string) =>
        key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

      const matchingSections = findMatchingSections(
        formState,
        initialData,
        term,
      );

      if (matchingSections.size === 0) return;

      const sectionsArray = Array.from(matchingSections);
      setOpenSections((prev) => Array.from(new Set([...prev, ...sectionsArray])));

      setTimeout(() => {
        scrollToFirstMatchingSection(sectionsArray[0], formatKeyForScroll);
      }, 500);
    };

    // Generate validation schema
    const validationSchema = useMemo(() => {
      try {
        return generateSchema(initialData || {});
      } catch {
        // Schema generation failed - using empty schema
        return null;
      }
    }, [initialData]);

    // Setup react-hook-form
    const {
      handleSubmit,
      formState: { errors },
      reset,
      setValue,
      getValues,
    } = useForm({
      resolver: validationSchema ? yupResolver(validationSchema) : undefined,
      defaultValues: initialData || {},
      mode: "onChange",
    });

    useEffect(() => {
      const cloned = deepClone(initialData || {});
      // Remove all comment/metadata fields from formState
      // JSON data must be completely separate from comments and status metadata
      if (cloned._comments) {
        delete cloned._comments;
      }
      if (cloned._commentsMetadata) {
        delete cloned._commentsMetadata;
      }
      if (cloned._statusMetadata) {
        delete cloned._statusMetadata;
      }
      if (cloned._metadata) {
        delete cloned._metadata;
      }
      setFormState(cloned);
      setEditingMap({}); // Reset editing map on data change
      setNewlyAddedFields(new Set()); // Reset newly added fields on data change
      setNewlyAddedArrayItems(new Set()); // Reset newly added array items on data change
      setNewlyAddedTableRows(new Set()); // Reset newly added table rows on data change
      setNewlyAddedTableColumns(new Set()); // Reset newly added table columns on data change
      reset(cloned);
      // All accordions closed by default
      setOpenSections([]);
    }, [initialData, reset]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showChangesModal, setShowChangesModal] = useState(false);
    const [changesApplied, setChangesApplied] = useState(true); // Start as true (no unsaved changes)
    const [pendingSaveData, setPendingSaveData] = useState<{ data: any; files?: File[] } | null>(null);
    const isApproving = isApprovingProp ?? false;

    // Function to actually execute the save after confirmation
    async function executeSave(savePayload: any, filesToSave?: File[]) {
      setIsSubmitting(true);
      try {
         onSave(savePayload, filesToSave);
        // After successful save, mark changes as applied (enable Approve button)
        setChangesApplied(true);
      } catch (e) {
        console.error("[JsonAccordionForm] onSave error:", e);
        // Keep changesApplied as false on error so Approve stays disabled
      } finally {
        setIsSubmitting(false);
        setShowChangesModal(false);
        setPendingSaveData(null);
      }
    }

    function applyChanges() {
      // Build final payload from formState (regardless of validation)
      // This ensures we always log the payload even if validation fails
      const finalData = deepClone(formState || {});
      if (finalData._comments) {
        delete finalData._comments;
      }

      // Merge formState with actualDataWithoutChange to include sources
      const finalDataWithSources = (actualDataWithoutChange
        ? deepMergeWithSources(finalData, actualDataWithoutChange)
        : finalData) as AnyObject ;

      // Get comments and status metadata separately (not mixed with JSON data)
      const commentsMetadata = getAllComments();
      const statusMetadata = enableStatus ? getAllStatus() : undefined;

      // Build the API payload structure (separate top-level fields) with sources included
      const apiPayload: any = {
        ...finalDataWithSources,
        comments: commentsMetadata,
      };

      // Only include status if enableStatus is true
      if (enableStatus && statusMetadata) {
        apiPayload.status = statusMetadata;
      }

      if (skipValidationOnApply) {
        const savePayload: any = { data: finalDataWithSources };
        if (shouldEnableComments) savePayload.comments = commentsMetadata;
        if (shouldEnableStatus && statusMetadata) savePayload.status = statusMetadata;

        // Store the payload and show confirmation modal
        setPendingSaveData({ data: savePayload, files: files.length > 0 ? files : undefined });
        setShowChangesModal(true);
        return;
      }



      // Reset the form with formState values to ensure they're in sync
      // This is safer than trying to sync individual fields
      reset(finalData, { keepDefaultValues: false });

      // Now proceed with validation and save
      const submitHandler = handleSubmit(
        async (data) => {
          const validatedData = deepClone(data);
          if (validatedData._comments) {
            delete validatedData._comments;
          }
          if (validatedData._commentsMetadata) {
            delete validatedData._commentsMetadata;
          }
          if (validatedData._statusMetadata) {
            delete validatedData._statusMetadata;
          }
          if (validatedData._metadata) {
            delete validatedData._metadata;
          }

          // Merge validatedData with actualDataWithoutChange to include sources
          const validatedDataWithSources = actualDataWithoutChange
            ? deepMergeWithSources(validatedData, actualDataWithoutChange)
            : validatedData;

          // Get comments and status metadata for saving
          const saveCommentsMetadata = getAllComments();
          const saveStatusMetadata = enableStatus ? getAllStatus() : undefined;

          // Build the final payload for saving (with sources)
          const savePayload: { data: any; comments?: any; status?: any } = {
            data: validatedDataWithSources,
          };

          if (shouldEnableComments) {
            savePayload.comments = saveCommentsMetadata;
          }

          if (shouldEnableStatus && saveStatusMetadata) {
            savePayload.status = saveStatusMetadata;
          }

          try {
             onSave(savePayload, files.length > 0 ? files : undefined);
            setChangesApplied(true);
          } catch (error) {
            console.error("[JsonAccordionForm] ❌ Error in onSave callback:", error);
            throw error;
          } finally {
            setIsSubmitting(false);
          }
        },
        (errors) => {
          // Handle validation errors
          console.error("[JsonAccordionForm] ❌ Validation failed:", errors);
          setIsSubmitting(false);
        },
      );

      try {
        submitHandler();
      } catch (error) {
        console.error("[JsonAccordionForm] ❌ Error calling submitHandler:", error);
        setIsSubmitting(false);
      }
    }

    function handleReset() {
      const resetData = deepClone(initialData || {});
      setFormState(resetData);
      setFiles([]);
      setEditingMap({}); // Clear editing map on reset
      setNewlyAddedFields(new Set()); // Clear newly added fields on reset
      setNewlyAddedArrayItems(new Set()); // Clear newly added array items on reset
      setNewlyAddedTableRows(new Set()); // Clear newly added table rows on reset
      setNewlyAddedTableColumns(new Set()); // Clear newly added table columns on reset
      setNewlyAddedArrayItems(new Set()); // Clear newly added array items on reset
      if (onReset) {
        onReset(resetData);
      }
    }

    function handleApprove() {
      if (onApprove) {
        onApprove();
      }
    }

    function handleApproveWithPendency() {
      if (onApproveWithPendency) {
        onApproveWithPendency();
      }
    }

    function handleReverseToMaker() {
      if (onReverseToMaker) {
        onReverseToMaker();
      }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const f = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...f]);
    }

    // Per-section editing for checker and master product (userRole === null)
    // All roles (maker1, maker2, checker) can now edit
    const [editingMap, setEditingMap] = useState<Record<string, boolean>>({});

    function toggleSectionEdit(sectionId: string) {
      if (readOnly) return;
      // Allow toggle for all roles (maker1, maker2, checker) and master product (userRole === null)
      if (
        userRoleForProps === "maker1" ||
        userRoleForProps === "maker2" ||
        userRoleForProps === "checker" ||
        userRoleForProps === "superadmin" ||
        userRoleForProps === null
      ) {
        setEditingMap((m) => {
          const isCurrentlyEditing = !!m[sectionId];
          const newMap = { ...m, [sectionId]: !isCurrentlyEditing };

          // If starting to edit, ensure the accordion is open
          if (!isCurrentlyEditing) {
            setOpenSections((prev) => {
              if (!prev.includes(sectionId)) {
                return [...prev, sectionId];
              }
              return prev;
            });
          }

          return newMap;
        });
      }
    }

    function handleAccordionChange(value: string | string[]) {
      // Check if this change was triggered by a page number click
      const activeElement = document.activeElement as HTMLElement;
      const clickedElement = (window as any)
        .__lastClickedElement as HTMLElement;

      if (
        activeElement?.closest("[data-source-button]") ||
        activeElement?.closest("[data-page-number]") ||
        activeElement?.dataset.sourceButton !== undefined ||
        activeElement?.dataset.pageNumber !== undefined ||
        clickedElement?.closest("[data-source-button]") ||
        clickedElement?.closest("[data-page-number]") ||
        clickedElement?.dataset.sourceButton !== undefined ||
        clickedElement?.dataset.pageNumber !== undefined
      ) {
        // This was triggered by a page number click - don't change accordion state
        return;
      }

      // Only update if the value actually changed to prevent unnecessary re-renders
      const sections = Array.isArray(value) ? value : [value];
      setOpenSections((prev) => {
        // Check if the sections are actually different
        const prevSet = new Set(prev);
        const newSet = new Set(sections);
        if (prevSet.size !== newSet.size) {
          return sections;
        }
        for (const section of sections) {
          if (!prevSet.has(section)) {
            return sections;
          }
        }
        // No change, return previous value to prevent re-render
        return prev;
      });
    }

    function handleRemoveField(fieldKey: string) {
      // Only allow deletion of newly added fields
      if (!newlyAddedFields.has(fieldKey)) {
        return;
      }

      setFormState((prev) => {
        const newState = { ...prev };
        delete newState[fieldKey];
        return newState;
      });
      setOpenSections((prev) => prev.filter((key) => key !== fieldKey));

      // Remove from newly added fields set
      setNewlyAddedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldKey);
        return newSet;
      });
    }

    function handleRemoveFieldInObject(
      path: Array<string | number>,
      fieldName: string,
    ) {
      // Only allow deletion of newly added fields
      const fieldPath = [...path, fieldName].join(".");
      if (!newlyAddedFields.has(fieldPath)) {
        return;
      }

      setFormState((prev) => {
        const newState = deepClone(prev);
        const target = getAt(newState, path);
        if (target && typeof target === "object" && !Array.isArray(target)) {
          delete target[fieldName];
          return setAt(newState, path, target);
        }
        return newState;
      });

      // Remove from newly added fields set
      setNewlyAddedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldPath);
        return newSet;
      });
    }

    // Handler for adding fields dynamically via popup modal
    function handleAddField(
      fieldPath: string,
      fieldName: string,
      fieldValue: any,
      metadata?: any,
    ) {
      setFormState((prev) => {
        const result = addFieldToFormState(
          prev,
          fieldPath,
          fieldName,
          fieldValue,
          metadata,
        );

        setNewlyAddedFields((current) =>
          new Set([...current, result.fullFieldPath]),
        );

        if (result.isListingArrayField) {
          setListingArrayFields((current) =>
            new Set([...current, result.fullFieldPath]),
          );
        }

        if (result.formFieldUpdate) {
          setValue(
            result.formFieldUpdate.path,
            result.formFieldUpdate.value,
            { shouldValidate: true },
          );
        }

        return result.newState;
      });
    }

    function handleAddFieldInObject(
      path: Array<string | number>,
      fieldName: string,
      fieldValue: any,
    ) {
      setFormState((prev) => {
        const newState = deepClone(prev);
        const target = getAt(newState, path);
        if (target && typeof target === "object" && !Array.isArray(target)) {
          const updated = { ...target, [fieldName]: fieldValue };
          const result = setAt(newState, path, updated);

          // Mark this field as newly added (can be deleted)
          const fieldPath = [...path, fieldName].join(".");
          setNewlyAddedFields((prev) => new Set([...prev, fieldPath]));

          // If this is a listing array, track it
          if (Array.isArray(fieldValue) && isListingArray(fieldValue)) {
            setListingArrayFields((prev) => new Set([...prev, fieldPath]));
          }

          return result;
        }
        return newState;
      });
    }

    function handleConvertToObjectAndAddField(
      fieldKey: string,
      newFieldName: string,
      newFieldValue: any,
    ) {
      setFormState((prev) => {
        const newState = deepClone(prev);
        const currentValue = newState[fieldKey];
        // Convert simple value to object with original value and new field
        newState[fieldKey] = {
          [fieldKey]: currentValue,
          [newFieldName]: newFieldValue,
        };

        // Mark the new field as newly added (can be deleted)
        const fieldPath = `${fieldKey}.${newFieldName}`;
        setNewlyAddedFields((prev) => new Set([...prev, fieldPath]));

        // If this is a listing array, track it
        if (Array.isArray(newFieldValue) && isListingArray(newFieldValue)) {
          setListingArrayFields((prev) => new Set([...prev, fieldPath]));
        }

        return newState;
      });
      const fieldName = fieldKey;
      setValue(
        fieldName,
        {
          [fieldKey]: getAt(formState, [fieldKey]),
          [newFieldName]: newFieldValue,
        },
        { shouldValidate: true },
      );
    }

    function expandAll() {
      const allSectionIds = topLevelEntries.map(([key]) => key);
      setOpenSections(allSectionIds);
    }

    function collapseAll() {
      setOpenSections([]);
    }

    function expandAllWithEdit() {
      const allSectionIds = topLevelEntries.map(([key]) => key);
      setOpenSections(allSectionIds);
      // Set editing map for all roles that can edit (maker1, maker2, checker, master product)
      if (
        userRoleForProps === "maker1" ||
        userRoleForProps === "maker2" ||
        userRoleForProps === "checker" ||
        userRoleForProps === "superadmin" ||
        userRoleForProps === null
      ) {
        const newEditingMap: Record<string, boolean> = {};
        allSectionIds.forEach((id) => {
          newEditingMap[id] = true;
        });
        setEditingMap(newEditingMap);
      }
    }

    function collapseAllAndCloseEdit() {
      setOpenSections([]);
      setEditingMap({});
    }

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      expandAll,
      collapseAll,
      expandAllWithEdit,
      collapseAllAndCloseEdit,
    }));

    // Calculate hasChanges excluding _comments from comparison
    const initialDataForComparison = useMemo(() => {
      const cloned = deepClone(initialData || {});
      if (cloned._comments) {
        delete cloned._comments;
      }
      return cloned;
    }, [initialData]);

    const formStateForComparison = useMemo(() => {
      return deepClone(formState || {});
    }, [formState]);

    const hasChanges = useMemo(() => {
      return (
        JSON.stringify(formStateForComparison) !==
        JSON.stringify(initialDataForComparison)
      );
    }, [formStateForComparison, initialDataForComparison]);

    // Track if changes are applied - disable Approve button when there are unsaved changes
    useEffect(() => {
      if (hasChanges) {
        setChangesApplied(false);
      }
    }, [hasChanges]);

    return (
      <div
        className={clsx("w-full p-2 pr-1", className)}
        style={{
          maxWidth: "100%",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}
      >
        <TitleSection title={title} hideTitle={hideTitleAndQuickActions} />

        <QuickActionsSection
          topLevelEntries={topLevelEntries}
          hideQuickActions={hideTitleAndQuickActions}
          isApproved={isApproved}
          isMaker={isMaker}
          checkerCanAct={checkerCanAct}
          customQuickActions={customQuickActions}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onExpandAllWithEdit={expandAllWithEdit}
          onCollapseAllAndCloseEdit={collapseAllAndCloseEdit}
          hasAnySectionOpen={openSections.length > 0}
          onSearch={handleSearch}
        />

        {!showTitleAndQuickActionsOnly && (
          <div
            className="space-y-1"
            style={{ maxWidth: "100%", overflowX: "hidden" }}
          >
            {topLevelEntries.length === 0 ? (
              <div className="dark:border-dark-600 dark:bg-dark-800 rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No data available.
                </p>
              </div>
            ) : (
              <>
                <Accordion
                  value={openSections}
                  onChange={handleAccordionChange}
                  multiple
                  className="divide-gray-150 dark:divide-dark-500 flex flex-col divide-y"
                >
                  {topLevelEntries.map(([key, val]) => {
                    const sectionId = key;
                    // When readOnly, never allow editing
                    const isEditing = !readOnly && !!editingMap[sectionId];

                    // Dynamic conditional hiding based on data structure
                    // Check if there's a conditional rule in the data (e.g., _conditionalRules)
                    const conditionalRules = initialData?._conditionalRules || [];
                    const shouldHideSection = () => {
                      return shouldHideField(key, formState, conditionalRules);
                    };

                    return (
                      <AccordionSectionItem
                        key={sectionId}
                        sectionId={sectionId}
                        sectionKey={key}
                        value={val}
                        formState={formState}
                        initialData={initialData}
                        actualDataWithoutChange={actualDataWithoutChange}
                        isEditing={isEditing}
                        editingMap={editingMap}
                        isApproved={isApproved}
                        rowId={rowId}
                        userRole={userRoleForProps}
                        hasMakerRole={hasMakerRole}
                        hasCheckerRole={hasCheckerRole}
                        hasBothRoles={hasBothRoles}
                        checkerCanAct={checkerCanAct}
                        readOnly={readOnly}
                        isMaker={isMaker}
                        shouldEnableComments={shouldEnableComments}
                        shouldEnableSectionComments={shouldEnableSectionComments}
                        shouldEnableStatus={shouldEnableStatus}
                        errors={errors}
                        flatArrayFields={flatArrayFields}
                        listingArrayFields={listingArrayFields}
                        newlyAddedFields={newlyAddedFields}
                        newlyAddedArrayItems={newlyAddedArrayItems}
                        newlyAddedTableRows={newlyAddedTableRows}
                        newlyAddedTableColumns={newlyAddedTableColumns}
                        searchText={searchText}
                        activeMatchPath={activeMatchPath}
                        matchedPaths={matchedPaths}
                        openPaths={openPaths}
                        // Debug: Log when activeMatchPath is set but searchText is missing
                        // This will help identify why highlighting isn't working
                        onToggleEdit={toggleSectionEdit}
                        onFormStateChange={setFormState}
                        onSetValue={setValue}
                        onRemoveField={handleRemoveField}
                        onAddFieldInObject={handleAddFieldInObject}
                        onRemoveFieldInObject={handleRemoveFieldInObject}
                        onConvertToObjectAndAddField={
                          handleConvertToObjectAndAddField
                        }
                        onNewlyAddedArrayItemsChange={setNewlyAddedArrayItems}
                        onNewlyAddedTableRowsChange={setNewlyAddedTableRows}
                        onNewlyAddedTableColumnsChange={setNewlyAddedTableColumns}
                        shouldHideSection={shouldHideSection}
                        onSourceClick={onSourceClick}
                        onAddField={handleAddField}
                        // Comment and status props
                        getComments={getCommentsWithTrigger}
                        onAddComment={handleAddComment}
                        userId={keycloakUser.userId || "unknown"}
                        fieldStatus={fieldStatus}
                        onFieldStatusChange={handleStatusChange}
                      />
                    );
                  })}
                </Accordion>

                {!hideActionButtonsWhenNoData && (
                  <div className="mt-2 border-t pt-2">
                    <FileUploadSection
                      showFileUpload={showFileUpload}
                      isMaker={isMaker}
                      isApproved={isApproved}
                      files={files}
                      onFileChange={handleFileChange}
                      hasChanges={hasChanges}
                      changesApplied={changesApplied}
                      hasMakerRole={hasMakerRole}
                      hasCheckerRole={hasCheckerRole}
                      hasBothRoles={hasBothRoles}
                      checkerCanAct={checkerCanAct}
                      isSubmitting={isSubmitting}
                      saveButtonLabel={saveButtonLabel}
                      savingButtonLabel={savingButtonLabel || "Applying Changes..."}
                      onApplyChanges={applyChanges}
                      onReset={handleReset}
                      onApprove={hideApprovalActions && !readOnly ? onApprove : undefined}
                      isApproving={isApproving}
                      hideActionButtons={readOnly}
                    />

                    {!hideApprovalActions && (
                      <ApprovalActionsSection
                        isApproved={isApproved}
                        hasChanges={hasChanges}
                        hasMakerRole={hasMakerRole}
                        hasCheckerRole={hasCheckerRole}
                        hasBothRoles={hasBothRoles}
                        checkerCanAct={checkerCanAct}
                        files={files}
                        customActionButtons={customActionButtons}
                        onApprove={handleApprove}
                        onApproveWithPendency={handleApproveWithPendency}
                        onReverseToMaker={handleReverseToMaker}
                        isApproving={isApproving}
                        handleActionWithComments={(action) => action()}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <StatusMessages
              isApproved={isApproved}
              makerApproved={makerApproved}
              hasCheckerRole={hasCheckerRole}
              hasBothRoles={hasBothRoles}
              hasMakerRole={hasMakerRole}
              hasChanges={hasChanges}
            />
          </div>
        )}

        {/* Changes Confirmation Modal */}
        {pendingSaveData && (
          <ChangesConfirmationModal
            isOpen={showChangesModal}
            onClose={() => {
              setShowChangesModal(false);
              setPendingSaveData(null);
            }}
            onConfirm={() => {
              if (pendingSaveData) {
                executeSave(pendingSaveData.data, pendingSaveData.files);
              }
            }}
            oldData={initialDataForComparison}
            newData={formStateForComparison}
            isLoading={isSubmitting}
          />
        )}
      </div>
    );
  },
);

JsonAccordionForm.displayName = "JsonAccordionForm";

export default JsonAccordionForm;
