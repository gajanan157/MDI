import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui";
import type { ColorType } from "@/constants/app";
import { useStep } from "@/hooks";

export type StepConfig = {
  id: string;
  label: string;
};

type AdvancedStepsProps = {
  steps: StepConfig[];
  stepContent: Record<number, ReactNode>;
  onPrev?: () => void;
  /** Return true to advance to next step. Receives current step number for step-specific validation. */
  onNext?: (currentStep: number) => boolean | Promise<boolean>;
  /** Show Previous button (hidden on first step by default when hidePrevOnFirstStep is true) */
  showPrev?: boolean;
  showNext?: boolean;
  /** Hide Previous button on the first step. Default true. */
  hidePrevOnFirstStep?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  className?: string;
  /** Continue/Next button variant. Default "filled". */
  nextButtonVariant?: "filled" | "outlined" | "soft" | "flat";
  /** Continue/Next button color. Default "primary". */
  nextButtonColor?: ColorType;
  /** When true, Continue button is disabled (e.g. initial step until form is valid). */
  nextDisabled?: boolean;
  /** Called when the current step changes. Use to sync step for nextDisabled logic. */
  onStepChange?: (step: number) => void;
};

export function Advanced({
  steps,
  stepContent,
  onPrev,
  onNext,
  showPrev = true,
  showNext = true,
  hidePrevOnFirstStep = true,
  nextLabel = "Continue",
  prevLabel = "Previous",
  className,
  nextButtonVariant = "filled",
  nextButtonColor = "primary",
  nextDisabled = false,
  onStepChange,
}: AdvancedStepsProps) {
  const [currentStep, helpers] = useStep(steps.length);
  const {
    canGoToPrevStep,
    canGoToNextStep,
    goToNextStep,
    goToPrevStep,
    setStep,
  } = helpers;

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const showPrevButton = showPrev && (!hidePrevOnFirstStep || currentStep > 1);
  const [isNextLoading, setIsNextLoading] = useState(false);

  const handleNext = async () => {
    if (onNext) {
      setIsNextLoading(true);
      try {
        const result = await Promise.resolve(onNext(currentStep));
        if (result) goToNextStep();
      } finally {
        setIsNextLoading(false);
      }
    } else {
      goToNextStep();
    }
  };

  const handlePrev = () => {
    onPrev?.();
    goToPrevStep();
  };

  return (
    <div className={clsx("w-full", className || "max-w-xl")}>
      <ol className="steps">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          return (
            <li
              key={step.id}
              className={clsx(
                "step",
                isCompleted
                  ? "before:bg-primary-500"
                  : "before:bg-gray-200 dark:before:bg-surface-2"
              )}
            >
              <button
                type="button"
                onClick={() => setStep(stepNum)}
                className={clsx(
                  "step-header rounded-full dark:text-white",
                  isActive
                    ? "border-2 border-primary-500 bg-gray-200 text-gray-800 dark:bg-surface-2"
                    : isCompleted
                      ? "bg-primary-600 text-white dark:bg-primary-500"
                      : "bg-gray-200 text-gray-800 dark:bg-surface-2"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {stepNum}
              </button>
              <h5 className="text-gray-600 dark:text-dark-100">
                {step.label || `Step ${stepNum}`}
              </h5>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 min-h-[200px] w-full">
        {stepContent[currentStep] ?? null}
      </div>

      <div className="mt-4 flex justify-between gap-4">
        <div>
          {showPrevButton && (
            <Button
              type="button"
              variant="outlined"
              onClick={handlePrev}
              disabled={!canGoToPrevStep}
            >
              {prevLabel}
            </Button>
          )}
        </div>
        <div>
          {showNext && (
            <Button
              type="button"
              color={nextButtonColor}
              variant={nextButtonVariant}
              onClick={handleNext}
              disabled={
                isNextLoading ||
                nextDisabled ||
                (currentStep < steps.length && !canGoToNextStep)
              }
            >
              {isNextLoading ? "..." : nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
 