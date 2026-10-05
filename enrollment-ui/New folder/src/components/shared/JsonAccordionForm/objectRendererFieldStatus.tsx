import React from "react";
import {
  getFieldStatusClassName,
  getFieldStatusLabel,
} from "./objectRendererHelpers";

export function renderFieldStatusControl(
  fieldPath: string,
  status: string | null | undefined,
  canEdit: boolean,
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void,
): React.ReactNode {
  if (canEdit && onFieldStatusChange) {
    return (
      <select
        value={status || ""}
        onChange={(e) => onFieldStatusChange(fieldPath, e.target.value || null)}
        className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:ring-1 focus:outline-none dark:text-gray-100"
      >
        <option value="">Select Status</option>
        <option value="approved">Approve</option>
        <option value="approve_with_pendency">Approve with Pendency</option>
        <option value="rejected">Reject</option>
      </select>
    );
  }

  if (status) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getFieldStatusClassName(status)} dark:bg-opacity-20`}
      >
        {getFieldStatusLabel(status)}
      </span>
    );
  }

  return (
    <span className="text-xs text-gray-400 italic dark:text-gray-500">
      No status
    </span>
  );
}
