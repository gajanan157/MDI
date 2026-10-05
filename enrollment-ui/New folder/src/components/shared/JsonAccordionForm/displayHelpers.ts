import type { JsonAccordionUserRole } from "./types";

const USER_ROLE_LABELS: Record<JsonAccordionUserRole, string> = {
  maker1: "Maker 1",
  maker2: "Maker 2",
  checker: "Checker",
  superadmin: "Super Admin",
};

export function formatUserRoleLabel(
  role: JsonAccordionUserRole | string,
): string {
  return USER_ROLE_LABELS[role as JsonAccordionUserRole] ?? role;
}

export function normalizeUserRoles(
  userRole:
    | JsonAccordionUserRole
    | JsonAccordionUserRole[]
    | null
    | undefined,
): JsonAccordionUserRole[] {
  if (Array.isArray(userRole)) return userRole;
  if (userRole) return [userRole];
  return [];
}

export function getLineClampClass(maxLines: number): string {
  if (maxLines === 1) return "line-clamp-1";
  if (maxLines === 2) return "line-clamp-2";
  return "line-clamp-3";
}

export function getApproveButtonTitle(
  isApproving: boolean,
  hasChanges: boolean,
  changesApplied: boolean,
): string {
  if (isApproving) return "Approving...";
  if (hasChanges || !changesApplied) {
    return "Please apply changes before approving";
  }
  return "Approve master product";
}

export function getApplyChangesTitle(
  canUpload: boolean,
  hasChanges: boolean,
): string | undefined {
  if (!canUpload) return "Maker must approve before saving changes";
  if (!hasChanges) return "No changes to apply";
  return undefined;
}

export function getListingItemClassName(
  useTwoColumns: boolean,
  shouldEnableStatus: boolean,
  shouldEnableComments: boolean,
): string {
  if (useTwoColumns) return "flex items-start gap-2 py-0.5";
  if (shouldEnableStatus || shouldEnableComments) {
    return "flex items-center gap-2 py-0.5 pl-6";
  }
  return "py-0.5 pl-6";
}

export function isMakerRole(
  userRole: JsonAccordionUserRole | null | undefined,
): boolean {
  return userRole === "maker1" || userRole === "maker2";
}

export function canEditAccordionSection(
  readOnly: boolean,
  userRole: JsonAccordionUserRole | null | undefined,
): boolean {
  if (readOnly) return false;
  return (
    userRole === "maker1" ||
    userRole === "maker2" ||
    userRole === "checker" ||
    userRole === "superadmin" ||
    userRole === null
  );
}

export function getEditButtonClassName(
  canEdit: boolean,
  isEditing: boolean,
): string {
  if (!canEdit) return "text-gray-400 dark:text-gray-500";
  if (isEditing) {
    return "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30";
  }
  return "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-400";
}

export function getEditButtonTitle(
  canEdit: boolean,
  isEditing: boolean,
  userRole: JsonAccordionUserRole | null | undefined,
): string {
  if (!canEdit) {
    return isMakerRole(userRole)
      ? "Edit not available for Maker role"
      : "Edit Section";
  }
  if (isEditing) return "Cancel Editing (Discard Changes)";
  return "Edit Section";
}
