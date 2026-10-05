import { Button } from "@/components/ui/Button";
import ActionButton from "./ActionButton";
import { JsonAccordionFormProps } from "./types";

export interface ActionButtonsSectionProps {
  isApproved: boolean;
  hasChanges: boolean;
  pendingComments: Array<any>;
  files: File[];
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  hasMakerRole: boolean;
  checkerCanAct: boolean;
  customActionButtons?: JsonAccordionFormProps["customActionButtons"];
  onApplyChanges: () => void;
  onReset: () => void;
  onApprove?: () => void;
  onApproveWithPendency?: () => void;
  onReverseToMaker?: () => void;
  onReject?: () => void;
  handleActionWithComments: (action: () => void, actionName: string) => void;
}

export default function ActionButtonsSection({
  isApproved,
  hasChanges,
  pendingComments,
  files,
  hasCheckerRole,
  hasBothRoles,
  hasMakerRole,
  checkerCanAct,
  customActionButtons,
  onApplyChanges,
  onReset,
  onApprove,
  onApproveWithPendency,
  onReverseToMaker,
  onReject,
  handleActionWithComments,
}: ActionButtonsSectionProps) {
  if (!isApproved) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Left side - Apply Changes and Reset */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Apply Changes button - visible for maker and checker */}
        <Button
          onClick={onApplyChanges}
          color="primary"
          disabled={
            (hasChanges === false && pendingComments.length === 0) || 
            files.length > 0 ||
            ((hasCheckerRole || hasBothRoles) && !hasMakerRole && !checkerCanAct) // Disable for checker if maker not approved
          }
          className="px-2 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          title={
            (hasCheckerRole || hasBothRoles) && !hasMakerRole && !checkerCanAct
              ? "Maker must approve before checker can save changes"
              : undefined
          }
        >
          Apply Changes {pendingComments.length > 0 && `(${pendingComments.length})`}
        </Button>

        {/* Reset button - for all roles (maker1, maker2, checker) */}
        {(hasMakerRole || hasCheckerRole || hasBothRoles) && (
          <Button
            onClick={onReset}
            variant="outlined"
            disabled={!hasChanges && files.length === 0 && pendingComments.length === 0}
            className="px-2 py-1 text-xs font-medium border-gray-400 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-800 rounded-md"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Right side - Approval Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Custom Action Buttons - If provided, use these instead of default */}
        {customActionButtons && customActionButtons.length > 0 ? (
          <>
            {customActionButtons.map((button) => {
              // Check if button should be shown
              if (button.showCondition && !button.showCondition()) {
                return null;
              }
              
              return (
                <ActionButton
                  key={button.id}
                  label={button.label}
                  onClick={() => handleActionWithComments(button.onClick, button.label)}
                  variant={button.variant}
                  bgColor={button.bgColor}
                  hoverColor={button.hoverColor}
                  disabled={button.disabled !== undefined ? button.disabled : false}
                  confirmMessage={button.confirmMessage}
                  icon={button.icon}
                />
              );
            })}
          </>
        ) : (
          <>
            {/* Maker Approval Button - Always clickable */}
            {hasMakerRole && onApprove && (
              <ActionButton
                label="Approve"
                onClick={onApprove}
                variant="approve"
                disabled={false}
              />
            )}

            {/* Checker Actions - Always clickable */}
            {(hasCheckerRole || hasBothRoles) && checkerCanAct && onApprove && (
              <>
                <ActionButton
                  label="Approve"
                  onClick={onApprove}
                  variant="approve"
                  disabled={false}
                />
                {onApproveWithPendency && (
                  <ActionButton
                    label="Approve with Pendency"
                    onClick={onApproveWithPendency}
                    variant="pendency"
                    disabled={false}
                  />
                )}
                {onReverseToMaker && (
                  <ActionButton
                    label="Reverse to Maker"
                    onClick={onReverseToMaker}
                    variant="reverse"
                    disabled={false}
                  />
                )}
                {onReject && (
                  <ActionButton
                    label="Reject"
                    onClick={onReject}
                    variant="reject"
                    confirmMessage="Are you sure you want to reject this request?"
                    disabled={false}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

