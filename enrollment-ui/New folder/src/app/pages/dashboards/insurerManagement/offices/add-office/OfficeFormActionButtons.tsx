import { Button } from "@/components/ui";
import React from "react";

type OfficeFormActionButtonsProps = {
  isEditMode: boolean;
  editing: boolean;
  isSubmitting: boolean;
  isCreatePending: boolean;
  onCancel: () => void;
  onEdit: () => void;
  labels: {
    cancel: string;
    updating: string;
    updateOffice: string;
    edit: string;
    creating: string;
    createOffice: string;
  };
};

const OfficeFormActionButtons: React.FC<OfficeFormActionButtonsProps> = ({
  isEditMode,
  editing,
  isSubmitting,
  isCreatePending,
  onCancel,
  onEdit,
  labels,
}) => (
  <div className="flex flex-wrap gap-3">
    <Button
      type="button"
      onClick={onCancel}
      variant="outlined"
      className="h-9 px-6 md:px-8"
      disabled={isSubmitting}
    >
      {labels.cancel}
    </Button>
    {isEditMode ? (
      editing ? (
        <Button
          type="submit"
          color="primary"
          className="min-w-[140px] px-6 md:min-w-[150px] md:px-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? labels.updating : labels.updateOffice}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          color="primary"
          className="min-w-[100px] px-6 md:px-8"
        >
          {labels.edit}
        </Button>
      )
    ) : (
      <Button
        type="submit"
        color="primary"
        className="min-w-[140px] px-6 md:min-w-[150px] md:px-8"
        disabled={isSubmitting || isCreatePending}
      >
        {isCreatePending || isSubmitting ? labels.creating : labels.createOffice}
      </Button>
    )}
  </div>
);

export default OfficeFormActionButtons;
