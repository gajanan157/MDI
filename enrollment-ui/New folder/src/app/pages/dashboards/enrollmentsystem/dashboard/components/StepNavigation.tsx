import { useRole } from "@/app/auth/usePermission";
import { Button } from "@/components/ui";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onNext: (actionType?: "PROCESSOR_PENDING" | "QC_PENDING" | "COMPLETED" | "REASSIGNED") => void;
  onBack: () => void;
  currentIndex: number;
  totalSteps: number;
  isSubmitting?: boolean;
}

const StepNavigation: React.FC<Props> = ({
  onNext,
  onBack,
  currentIndex,
  totalSteps,
  isSubmitting,
}) => {
  const { isQC, isProcessor } = useRole();
  const isLastStep = currentIndex === totalSteps - 1;
  const { t } = useTranslation();

  const getRoleMessage = () => {
    if (isQC) return t("stepNavigation.messages.qcReviewPending");
    if (isProcessor) return t("stepNavigation.messages.processingInProgress");
    return "";
  };
  let buttonLabel: string;

  if (isLastStep) {
    if (isQC) {
      buttonLabel = t("stepNavigation.buttons.approve");
    } else {
      buttonLabel = t("stepNavigation.buttons.save");
    }
  } else {
    buttonLabel = t("stepNavigation.buttons.next");
  }
  return (
    <div className="flex justify-between items-center p-2 bg-white">

      {/* STATUS BOX */}
      <div
        className={`w-[60%] mb-2 px-3 py-2 rounded-md text-xs font-medium ${isQC ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
          }`}
      >
        {isQC
          ? t("stepNavigation.stages.qcReviewStage")
          : t("stepNavigation.stages.processingStage")}

        <div className="text-[10px] mt-1">{getRoleMessage()}</div>
      </div>

      <div className="flex gap-4">
        {currentIndex > 0 && (
          <Button
            type="button"
            className="w-24"
            disabled={isSubmitting}
            onClick={onBack}
          >
            {t("stepNavigation.buttons.back")}
          </Button>
        )}

        {/* REASSIGN (QC ONLY ON LAST STEP) */}
        {isLastStep && isQC && (
          <Button
            type="button"
            className="w-24"
            disabled={isSubmitting}
            color="primary"
            onClick={() => onNext("REASSIGNED")}
          >
            {t("stepNavigation.buttons.reassign")}
          </Button>
        )}
        <Button
          type="button"
          className="w-24"
          color="primary"
          disabled={isSubmitting}
          onClick={() => {
            if (isQC) {
              // QC FLOW
              if (isLastStep) {
                onNext("COMPLETED");
              } else {
                onNext("QC_PENDING");
              }
            } else if (isProcessor) {
              // PROCESSOR FLOW
              if (isLastStep) {
                onNext("QC_PENDING");
              } else {
                onNext("PROCESSOR_PENDING");
              }
            }
          }}
        >
          {buttonLabel}
        </Button>

      </div>
    </div>
  );
};

export default StepNavigation;