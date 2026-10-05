import ActionButton from "./ActionButton";
import { JsonAccordionFormProps } from "./types";

export interface ApprovalActionsSectionProps {
  isApproved: boolean;
  hasChanges: boolean;
  hasMakerRole: boolean;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  checkerCanAct: boolean;
  files?: File[];
  customActionButtons?: JsonAccordionFormProps["customActionButtons"];
  onApprove?: () => void;
  onApproveWithPendency?: () => void;
  onReverseToMaker?: () => void;
  isApproving?: boolean;
  handleActionWithComments: (action: () => void, actionName: string) => void;
}

export default function ApprovalActionsSection({
  isApproved,
  hasMakerRole,
  hasCheckerRole,
  hasBothRoles,
  checkerCanAct,
  customActionButtons,
  onApprove,
  onReverseToMaker,
  isApproving = false,
}: ApprovalActionsSectionProps) {
  if (!isApproved) {
    return null;
  }

  // Files are no longer used to disable buttons - buttons are always clickable

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mt-3">
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
                onClick={button.onClick}
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
              label={isApproving ? "Approving..." : "Approve"}
              onClick={onApprove}
              variant="approve"
              disabled={isApproving}
            />
          )}

          {/* Checker Actions - Always clickable */}
          {(hasCheckerRole || hasBothRoles) && checkerCanAct && onApprove && (
            <>
              <ActionButton
                label={isApproving ? "Approving..." : "Approve"}
                onClick={onApprove}
                variant="approve"
                disabled={isApproving}
              />
              {onReverseToMaker && (
                <ActionButton
                  label={isApproving ? "Processing..." : "Reverse to Maker"}
                  onClick={onReverseToMaker}
                  variant="reverse"
                  disabled={isApproving}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}


