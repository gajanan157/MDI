/**
 * Reusable approval action handlers
 * Extracted from duplicated code in maker-checker and dashboard detail pages
 */

import { postApi, mainApi } from "@/app/api/apiService";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import type { UserRole } from "@/hooks/useUserRole";

export interface ApprovalActionParams {
  requestId: string;
  role: UserRole;
  id: string;
  onSuccess?: (status: string) => void;
}

/**
 * Handles approval action for maker-checker workflow
 */
export async function handleApproveAction({
  requestId,
  role,
  onSuccess,
}: ApprovalActionParams): Promise<boolean> {
  try {
    const newStatus =
      role === "maker" ? "Approved by Maker" : "Approved by Checker";

    const response = await postApi<
      { message: string; status: string },
      { requestId: string; action: string; role: string }
    >(mainApi, `/mbm/v1/maker-checker/approve`, {
      requestId,
      action: "approve",
      role: role || "checker",
    });

    if (handleApiResponse(response, `Document approved by ${role} successfully`)) {
      onSuccess?.(newStatus);
      return true;
    }
    return false;
  } catch (error) {
    showErrorMessage(error, "Failed to approve document");
    return false;
  }
}

/**
 * Handles approval with pendency action
 */
export async function handleApproveWithPendencyAction({
  requestId,
  role,
  onSuccess,
}: ApprovalActionParams): Promise<boolean> {
  try {
    const response = await postApi<
      { message: string; status: string },
      { requestId: string; action: string; role: string }
    >(mainApi, `/mbm/v1/maker-checker/approve-with-pendency`, {
      requestId,
      action: "approve_with_pendency",
      role: role || "checker",
    });

    if (
      handleApiResponse(
        response,
        `Document approved with pendency by ${role} successfully`
      )
    ) {
      onSuccess?.("Approved with Pendency");
      return true;
    }
    return false;
  } catch (error) {
    showErrorMessage(error, "Failed to approve document with pendency");
    return false;
  }
}

/**
 * Handles reverse to maker action
 */
export async function handleReverseToMakerAction({
  requestId,
  role,
  onSuccess,
}: ApprovalActionParams): Promise<boolean> {
  try {
    const response = await postApi<
      { message: string; status: string },
      { requestId: string; action: string; role: string }
    >(mainApi, `/mbm/v1/maker-checker/reverse-to-maker`, {
      requestId,
      action: "reverse_to_maker",
      role: role || "checker",
    });

    if (handleApiResponse(response, `Document reversed to maker successfully`)) {
      onSuccess?.("Reversed to Maker");
      return true;
    }
    return false;
  } catch (error) {
    showErrorMessage(error, "Failed to reverse document to maker");
    return false;
  }
}

/**
 * Handles reject action
 */
export async function handleRejectAction({
  requestId,
  role,
  onSuccess,
}: ApprovalActionParams): Promise<boolean> {
  try {
    const response = await postApi<
      { message: string; status: string },
      { requestId: string; action: string; role: string }
    >(mainApi, `/mbm/v1/maker-checker/reject`, {
      requestId,
      action: "reject",
      role: role || "checker",
    });

    if (handleApiResponse(response, `Document rejected successfully`)) {
      onSuccess?.("Rejected");
      return true;
    }
    return false;
  } catch (error) {
    showErrorMessage(error, "Failed to reject document");
    return false;
  }
}

