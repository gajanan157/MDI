import { Button } from "@/components/ui/Button";
import { getApplyChangesTitle, getApproveButtonTitle } from "./displayHelpers";

export interface FileUploadSectionProps {
  showFileUpload: boolean;
  isMaker: boolean;
  isApproved: boolean;
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Apply Changes and Reset button props
  hasChanges: boolean;
  changesApplied?: boolean; // When false, disable Approve button (there are unsaved changes)
  hasMakerRole: boolean;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  checkerCanAct: boolean;
  isSubmitting: boolean;
  saveButtonLabel: string;
  savingButtonLabel: string;
  onApplyChanges: () => void;
  onReset: () => void;
  /** Optional Approve action (shown at bottom when provided, e.g. master product) */
  onApprove?: () => void;
  isApproving?: boolean;
  /** When true, hide all action buttons (Apply Changes, Reset, Approve) - e.g. when product is approved */
  hideActionButtons?: boolean;
}

export default function FileUploadSection({
  showFileUpload,
  isApproved,
  files,
  hasChanges,
  changesApplied = true,
  hasMakerRole,
  hasCheckerRole,
  hasBothRoles,
  checkerCanAct,
  onApplyChanges,
  onReset,
  isSubmitting = false,
  saveButtonLabel = "Apply Changes",
  savingButtonLabel = "Applying Changes...",
  onApprove,
  isApproving = false,
  hideActionButtons = false,
}: FileUploadSectionProps) {
  // If not approved, don't show anything
  if (!isApproved) {
    return null;
  }

  // Hide all action buttons when product is approved (read-only)
  if (hideActionButtons && !showFileUpload) {
    return null;
  }

  // Disable file upload if checker can't act (maker hasn't approved)
  const canUpload = checkerCanAct || !hasCheckerRole;

  // If showFileUpload is false, show only Apply Changes, Reset, and optional Approve (for master product)
  if (!showFileUpload) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        {/* Apply Changes button - only disabled when submitting (master product always allow submit) */}
        <Button
          onClick={() => {
            if (!isSubmitting) {
              onApplyChanges();
            }
          }}
          color="primary"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={isSubmitting ? "Applying..." : undefined}
        >
          {isSubmitting ? (savingButtonLabel || "Applying Changes...") : saveButtonLabel}
        </Button>

        {/* Reset button */}
        <Button
          onClick={onReset}
          variant="outlined"
          disabled={!hasChanges}
          className="rounded-md border-gray-400 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Reset
        </Button>

        {/* Approve button - same row, same style as existing buttons (when onApprove provided, e.g. master product) */}
        {/* Disable Approve button when there are unsaved changes (hasChanges is true or changesApplied is false) */}
        {checkerCanAct && onApprove && (
          <Button
            onClick={onApprove}
            disabled={isApproving || hasChanges || !changesApplied}
            className="rounded-md border border-green-600 bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={getApproveButtonTitle(isApproving, hasChanges, changesApplied ?? true)}
          >
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        )}
      </div>
    );
  }

  // File upload mode (for maker-checker)
  return (
    <div className="dark:border-dark-600 dark:bg-dark-800/50 mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* File Upload Input */}
        {/* <label className="flex cursor-pointer items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
            Upload documents
          </span>
          <input
            type="file"
            multiple
            onChange={onFileChange}
            className="file:bg-primary-600 hover:file:bg-primary-700 cursor-pointer text-xs file:mr-1.5 file:cursor-pointer file:rounded-md file:border-0 file:px-2 file:py-1 file:text-xs file:font-medium file:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isApproved || !canUpload}
            title={
              !canUpload
                ? "Maker must approve before uploading files"
                : undefined
            }
          />
        </label> */}

        {/* Show file count if files are selected */}
        {files.length > 0 && (
          <div className="dark:bg-dark-700 dark:border-dark-600 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </div>
        )}

        {/* Apply Changes and Reset buttons in the same row */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Apply Changes button - disabled when no changes */}
          <Button
            onClick={onApplyChanges}
            color="primary"
            // disabled={isSubmitting || !hasChanges}
            className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={getApplyChangesTitle(canUpload, hasChanges)}
          >
            {isSubmitting ? (savingButtonLabel || "Applying Changes...") : saveButtonLabel}
          </Button>
         
          {/* Reset button - for all roles (maker1, maker2, checker) */}
          {(hasMakerRole || hasCheckerRole || hasBothRoles) && (
            <Button
              onClick={onReset}
              variant="outlined"
              // disabled={!hasChanges && files.length === 0}
              className="rounded-md border-gray-400 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

FileUploadSection.displayName = "FileUploadSection";
