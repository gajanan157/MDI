export interface StatusMessagesProps {
  isApproved: boolean;
  makerApproved: boolean;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  hasMakerRole: boolean;
  hasChanges: boolean;
}

export default function StatusMessages({
  isApproved,
  makerApproved,
  hasCheckerRole,
  hasBothRoles,
  hasMakerRole,
  hasChanges,
}: StatusMessagesProps) {
  return (
    <>
      {!isApproved && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This document is not approved. Actions are restricted until approval is granted.
        </div>
      )}
      
      {/* Warning for checker if maker hasn't approved */}
      {!makerApproved && (hasCheckerRole || hasBothRoles) && !hasMakerRole && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong className="font-semibold">Maker Approval Required:</strong> Maker has not approved this document yet. 
              All editing, saving, and approval actions are disabled until maker approves. You can only view and comment.
            </div>
          </div>
        </div>
      )}

      {hasChanges && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <strong>Note:</strong> You have unsaved changes. Click "Apply Changes" to save them.
        </div>
      )}
    </>
  );
}

