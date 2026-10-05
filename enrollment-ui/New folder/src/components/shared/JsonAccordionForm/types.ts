// src/components/shared/JsonAccordionForm/types.ts
import React from "react";
import type { CommentsMetadata } from "@/hooks/useComments";

export type AnyObject = Record<string, any>;

export type JsonAccordionUserRole =
  | "maker1"
  | "maker2"
  | "checker"
  | "superadmin";

export type FieldApprovalStatus =
  | "approved"
  | "approve_with_pendency"
  | "rejected"
  | "reverse_to_maker";

export interface CommentMetadataEntry {
  id: string;
  userId: string;
  userRole?: JsonAccordionUserRole;
  comment: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  replies?: Array<any>;
}

export interface JsonAccordionFormProps {
  isSubmitting?: boolean;
  saveButtonLabel?: string;
  savingButtonLabel?: string;
  /** The JSON data object to render as an accordion form */
  data: AnyObject;
  actualData: AnyObject;
  /** Callback function called when "Apply Changes" is clicked with the updated data (includes _comments field) and optional files */
  onSave?: (d: AnyObject, files?: File[]) => void;
  /** Optional callback function called when "Reset" is clicked */
  onReset?: (d: AnyObject) => void;
  /** Whether to show file upload section (default: false) */
  showFileUpload?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Optional title to display above the form */
  title?: string;
  /** Unique identifier for the document/row */
  rowId?: string;
  enableStatus?: boolean;
  enableComments?: boolean;
  /** Enable section-level comments (default: false - only field-level comments shown) */
  enableSectionComments?: boolean;
  /** User role: "maker1" | "maker2" (view + comment only) or "checker" | "superadmin" (full access) or array for multiple roles. If not provided, uses useUserRole hook */
  userRole?: JsonAccordionUserRole | JsonAccordionUserRole[] | null;
  /** Whether maker has approved - checker cannot act until maker approves */
  makerApproved?: boolean;
  /** Approval status - if not approved, actions are restricted */
  isApproved?: boolean;
  /** Callback when Approve button is clicked */
  onApprove?: () => void;
  /** When true, show approving state on Approve button (e.g. from parent slice) */
  isApproving?: boolean;
  /** Callback when Approve with Pendency button is clicked (checker only) */
  onApproveWithPendency?: () => void;
  /** Callback when Reverse to Maker button is clicked (checker only) */
  onReverseToMaker?: () => void;
  /** Callback when Reject button is clicked (checker only) */
  onReject?: () => void;
  /** Custom React nodes to add to Quick Actions section */
  customQuickActions?: React.ReactNode;
  openPaths?: Set<string>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  /** Hide title and Quick Actions section (for when they're rendered separately) */
  hideTitleAndQuickActions?: boolean;
  /** Show only title and Quick Actions (hide the accordion content) */
  showTitleAndQuickActionsOnly?: boolean;
  /** Custom action buttons configuration - allows overriding default buttons */
  customActionButtons?: Array<{
    id: string;
    label: string;
    onClick: () => void;
    variant?: "approve" | "pendency" | "reverse" | "reject" | "custom";
    bgColor?: string;
    hoverColor?: string;
    disabled?: boolean;
    confirmMessage?: string;
    icon?: React.ReactNode;
    /** Condition to show this button */
    showCondition?: () => boolean;
  }>;
  /** Hide the ApprovalActionsSection (for pages that handle approval differently, like master-product) */
  hideApprovalActions?: boolean;
  /** When true, hide Apply Changes / Reset / Approve buttons (e.g. when parent considers config "no data") */
  hideActionButtonsWhenNoData?: boolean;
  /** When true, form is read-only: hide action buttons, disable edit icons (e.g. when product status is "approved") */
  readOnly?: boolean;
  /** When true, Apply Changes calls onSave with formState payload directly (no validation). Use for master-product etc. so API is always called. */
  skipValidationOnApply?: boolean;
  /** Callback when a source with page_number is clicked */
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  // Comment and status props
  getComments?: (fieldPath: string) => Array<any>;
  onAddComment?: (
    fieldPath: string,
    comment: string,
  ) => void;
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  userId?: string;
  /** Initial comments metadata to load (from API response) */
  initialCommentsMetadata?: CommentsMetadata;
  /** Initial status metadata to load (from API response) */
  initialStatusMetadata?: Record<string, FieldApprovalStatus | null>;
}

export interface FieldProps {
  label: string;
  searchText?: string;
  activeMatchPath?: string | null;
  status: any;
  value: any;
  actualDataWithoutChangeValue: any;
  editable: boolean;
  onChange: (v: any) => void;
  error?: string | boolean;
  commentOnlyMode?: boolean; // When true, only comments are editable, not field values
  shouldEnableComments?: boolean; // Whether to enable/show comments
  shouldEnableStatus?: true | false;
  fieldPath?: string; // Path to field for metadata (e.g., "base_covers.icu_rent.limit_type")
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null; // User role to determine if status can be changed
  rootData?: AnyObject; // Root data object for condition checks
  onRootDataChange?: (newRootData: AnyObject) => void; // Callback to update root data (deprecated - use onNewCommentsChange)
  jsonComments?: Record<string, Array<any>>; // Comments from API/JSON
  pendingComments?: Array<any>; // Pending comments
  newComments?: Record<string, string>; // Separate state for new comments (doesn't trigger form re-renders)
  onNewCommentsChange?: (
    updater: (prev: Record<string, string>) => Record<string, string>,
  ) => void; // Callback to update new comments
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  // Comment and status props
  comments?: Array<CommentMetadataEntry>;
  onAddComment?: (
    fieldPath: string,
    comment: string,
  ) => void;
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  fieldStatus?:
    | "approved"
    | "approve_with_pendency"
    | "rejected"
    | "reverse_to_maker"
    | null;
  onStatusChange?: (
    fieldPath: string,
    status:
      | "approved"
      | "approve_with_pendency"
      | "rejected"
      | "reverse_to_maker"
      | null,
  ) => void;
  userId?: string;
}

export interface ObjectRendererProps {
  data: AnyObject;
  path?: Array<string | number>;
  editingMap: Record<string, boolean>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  openPaths?: Set<string>;
  actualDataWithoutChangeValue: any;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  onAddField?: (
    path: Array<string | number>,
    fieldName: string,
    fieldValue: any,
  ) => void;
  onRemoveField?: (path: Array<string | number>, fieldName: string) => void;
  rowId?: string; // Unique identifier for the document/row
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null; // User role for comments
  onAddPendingComment?: (comment: {
    rowId: string;
    fieldName: string;
    comment: string;
    userRole?: "maker1" | "maker2" | "checker" | "superadmin";
  }) => void;
  isApproved?: boolean; // Whether the document is approved
  pendingComments?: Array<{
    rowId: string;
    fieldName: string;
    comment: string;
    userRole?: "maker1" | "maker2" | "checker" | "superadmin";
  }>; // Pending comments to display
  jsonComments?: Record<
    string,
    Array<{
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
    }>
  >; // Comments from JSON data
  rootData?: AnyObject; // Root data object for condition checks
  onRootDataChange?: (newData: any) => void; // Callback when root data changes
  newlyAddedFields?: Set<string>; // Set of field paths that are newly added (can be deleted)
  isMaker?: boolean; // Whether the current user is a maker (view-only)
  commentOnlyMode?: boolean; // When true, only comments are editable, not field values (for maker edit mode)
  shouldEnableComments?: boolean; // Whether to enable/show comments
  shouldEnableSectionComments?: boolean; // Control section-level comments (default: false)
  shouldEnableStatus?: boolean;
  fieldStatus?: Record<string, string | null>; // Status for each field by path
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void; // Callback when field status changes
  newComments?: Record<string, string>; // Separate state for new comments (doesn't trigger form re-renders)
  onNewCommentsChange?: (
    updater: (prev: Record<string, string>) => Record<string, string>,
  ) => void; // Callback to update new comments
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  // Comment and status props
  getComments?: (fieldPath: string) => Array<any>;
  onAddComment?: (
    fieldPath: string,
    comment: string,
  ) => void;
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  userId?: string;
}
