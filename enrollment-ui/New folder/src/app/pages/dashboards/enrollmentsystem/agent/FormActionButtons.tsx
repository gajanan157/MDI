import { Button } from "@/components/ui";
import React from "react";
import { useTranslation } from "react-i18next";

interface FormActionButtonsProps {
  isSubmitting: boolean;
  loading?: boolean;
  paramId?: string | number | null;
  editing?: boolean;
  onCancel: () => void;
  onEdit?: () => void;
  submitLabel?: string;
  updateLabel?: string;
  isBoarding?: boolean;
}

const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  isSubmitting,
  loading = false,
  paramId,
  editing = false,
  onCancel,
  onEdit,
  isBoarding
}) => {
  const { t } = useTranslation()
  return (
    <div className="mb-4 flex w-full items-center justify-end gap-2">
      <Button
        type="button"
        className="mt-5 w-24"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {t("branchForm.buttons.cancel")}
      </Button>

      {paramId ? (
        editing ? (
          <Button
            type="submit"
            className="mt-5 w-24"
            color="primary"
            disabled={isSubmitting || loading}>
            {isSubmitting ? t("branchForm.buttons.updating") : t("branchForm.buttons.update")}
          </Button>
        ) : (
          <div
            className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker mt-5  text-white"
            onClick={onEdit}
          >
            {t("branchForm.buttons.edit")}
          </div>
        )
      ) : (
        <Button
          type="submit"
          className="mt-5 w-24"
          color="primary"
          disabled={isSubmitting || loading}>
          {isSubmitting ? t("branchForm.buttons.submitting") : t("branchForm.buttons.submit")}
        </Button>
      )}
    </div>
  );
};

export default FormActionButtons;