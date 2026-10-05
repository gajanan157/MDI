// src/hooks/useRolePermission.ts
import { useMemo } from "react";
import { useUserRole, UserRole } from "./useUserRole";

export interface RolePermissions {
  canEditFields: boolean;
  canAddFields: boolean;
  canAddSections: boolean;
  canAddComments: boolean;
  canUpdateStatus: boolean;
  canDeleteNewlyAdded: boolean;
  canApprove: boolean;
  canReject: boolean;
  canReverseToMaker: boolean;
  canApproveWithPendency: boolean;
  isMaker1: boolean;
  isMaker2: boolean;
  isChecker: boolean;
  isMaker: boolean; // True if maker1 or maker2
}

/**
 * Hook for role-based permissions
 * Determines what actions a user can perform based on their role
 */
export function useRolePermission(
  userRole?: UserRole,
  makerApproved: boolean = false,
  isApproved: boolean = true
): RolePermissions {
  const roleFromHook = useUserRole();
  const effectiveRole = userRole ?? roleFromHook;

  return useMemo(() => {
    const isMaker1 = effectiveRole === "maker1";
    const isMaker2 = effectiveRole === "maker2";
    const isChecker =
      effectiveRole === "checker" || effectiveRole === "superadmin";
    const isMaker = isMaker1 || isMaker2; // True if either maker1 or maker2
    const hasCheckerRole = isChecker;

    // Maker1 and Maker2 permissions (same for both)
    if (isMaker) {
      return {
        canEditFields: false, // Maker cannot edit existing fields
        canAddFields: false, // Maker cannot add new fields
        canAddSections: false, // Maker cannot add new sections
        canAddComments: true, // Maker can add comments
        canUpdateStatus: false, // Maker cannot update status
        canDeleteNewlyAdded: false, // Maker cannot delete (they can't add in first place)
        canApprove: makerApproved && isApproved, // Only when flow allows
        canReject: false,
        canReverseToMaker: false,
        canApproveWithPendency: false,
        isMaker1: isMaker1,
        isMaker2: isMaker2,
        isChecker: false,
        isMaker: true, // True if maker1 or maker2
      };
    }

    // Checker permissions
    if (hasCheckerRole) {
      return {
        canEditFields: true, // Checker can edit fields
        canAddFields: true, // Checker can add new fields
        canAddSections: true, // Checker can add new sections
        canAddComments: true, // Checker can add comments
        canUpdateStatus: true, // Checker can update status
        canDeleteNewlyAdded: true, // Checker can delete newly added items
        canApprove: true,
        canReject: true,
        canReverseToMaker: true,
        canApproveWithPendency: true,
        isMaker1: false,
        isMaker2: false,
        isChecker: true,
        isMaker: false,
      };
    }

    // Default (no role) - read-only
    return {
      canEditFields: false,
      canAddFields: false,
      canAddSections: false,
      canAddComments: false,
      canUpdateStatus: false,
      canDeleteNewlyAdded: false,
      canApprove: false,
      canReject: false,
      canReverseToMaker: false,
      canApproveWithPendency: false,
      isMaker1: false,
      isMaker2: false,
      isChecker: false,
      isMaker: false,
    };
  }, [effectiveRole, makerApproved, isApproved]);
}

