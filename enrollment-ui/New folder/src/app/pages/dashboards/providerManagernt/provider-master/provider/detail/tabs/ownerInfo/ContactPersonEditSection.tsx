import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import {
  getContactPersonDesignationValidationError,
  getContactPersonNameValidationError,
} from "@/app/pages/dashboards/providerManagernt/shared/contactPersonNameInput";
import {
  getContactEmailCharValidationError,
  getContactPhoneCharValidationError,
} from "@/utils/contactFieldInput";
import type { ProviderContactPersonDetail } from "../../../hospitalData";
import {
  getEmailPartsValidationMessage,
  getMobileInputValidationError,
  getTelephonePartsValidationMessage,
  splitMultiValueContactParts,
} from "../../schemas";
import type { ContactRowFieldErrors } from "./hooks/useOwnerTabHandlers";

function getContactMobileValidationError(
  value: string,
  includeRequired = false,
): string | undefined {
  const charErr = getContactPhoneCharValidationError(value);
  if (charErr) return charErr;
  if (!value.trim()) return includeRequired ? "Please enter mobile no" : undefined;
  return getMobileInputValidationError(value);
}

function getContactTelephoneValidationError(value: string): string | undefined {
  const charErr = getContactPhoneCharValidationError(value);
  if (charErr) return charErr;
  if (!value.trim()) return undefined;
  return getTelephonePartsValidationMessage(splitMultiValueContactParts(value));
}

function getContactEmailValidationError(
  value: string,
  includeRequired = false,
): string | undefined {
  const charErr = getContactEmailCharValidationError(value);
  if (charErr) return charErr;
  if (!value.trim()) return includeRequired ? "Please enter email" : undefined;
  return getEmailPartsValidationMessage(splitMultiValueContactParts(value));
}

type ValidatedContactInputProps = {
  label: string;
  value: string;
  error?: string;
  isRequired?: boolean;
  type?: string;
  onValueChange: (value: string) => void;
  getValidationError?: (value: string, includeRequired?: boolean) => string | undefined;
};

function ValidatedContactInput({
  label,
  value,
  error,
  isRequired,
  type = "text",
  onValueChange,
  getValidationError,
}: Readonly<ValidatedContactInputProps>) {
  const [liveError, setLiveError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const inputClassNames = { root: "min-w-0 w-full", input: "min-w-0 overflow-x-auto" };

  const syncLiveError = (next: string, allowRequired: boolean) => {
    const validationErr = getValidationError?.(next, allowRequired);
    if (!validationErr) {
      setLiveError(undefined);
      return;
    }
    if (next.trim().length > 0 || allowRequired) {
      setLiveError(validationErr);
    } else {
      setLiveError(undefined);
    }
  };

  return (
    <Input
      label={label}
      isRequired={isRequired}
      type={type}
      autoComplete="off"
      title={value}
      value={value}
      onChange={(e) => {
        const next = e.target.value;
        onValueChange(next);
        syncLiveError(next, touched);
      }}
      onBlur={(e) => {
        setTouched(true);
        syncLiveError(e.target.value, true);
      }}
      error={liveError || error}
      className="h-8 text-xs"
      classNames={inputClassNames}
    />
  );
}

export type ContactPersonEditSectionProps = {
  person: Pick<
    ProviderContactPersonDetail,
    | "providerContactPersonFullName"
    | "providerContactPersonDesignation"
    | "providerContactPersonMobileNo"
    | "providerContactPersonTelephoneNo"
    | "providerContactPersonEmailId"
  >;
  index: number;
  rowErrors?: ContactRowFieldErrors;
  contactLabels: {
    name: string;
    designation: string;
    mobileNo: string;
    telephoneNo: string;
    email: string;
  };
  canDelete: boolean;
  isDeleting: boolean;
  deleteLabel: string;
  deletingLabel: string;
  onDelete: () => void;
  updateContactAt: (index: number, patch: Record<string, string | undefined>) => void;
  contactMultiValueInputValue: (value?: string | string[] | null) => string;
};

export function ContactPersonEditSection({
  person: p,
  index,
  rowErrors,
  contactLabels,
  canDelete,
  isDeleting,
  deleteLabel,
  deletingLabel,
  onDelete,
  updateContactAt,
  contactMultiValueInputValue,
}: Readonly<ContactPersonEditSectionProps>) {
  const setField = (field: string, filtered: string) => {
    updateContactAt(index, { [field]: filtered.trim() ? filtered : undefined });
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-1.5">
      {canDelete ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={isDeleting ? deletingLabel : deleteLabel}
            title={isDeleting ? deletingLabel : deleteLabel}
          >
            <TrashIcon className="h-3 w-3" />
          </button>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <ValidatedContactInput
          label={contactLabels.name}
          isRequired
          value={p.providerContactPersonFullName ?? ""}
          getValidationError={(v) => getContactPersonNameValidationError(v)}
          onValueChange={(next) =>
            updateContactAt(index, { providerContactPersonFullName: next || undefined })
          }
          error={rowErrors?.name}
        />
        <ValidatedContactInput
          label={contactLabels.designation}
          value={p.providerContactPersonDesignation ?? ""}
          getValidationError={(v) => getContactPersonDesignationValidationError(v)}
          onValueChange={(next) =>
            updateContactAt(index, { providerContactPersonDesignation: next || undefined })
          }
          error={rowErrors?.designation}
        />
        <ValidatedContactInput
          label={contactLabels.mobileNo}
          isRequired
          type="tel"
          value={contactMultiValueInputValue(p.providerContactPersonMobileNo)}
          getValidationError={getContactMobileValidationError}
          onValueChange={(next) => setField("providerContactPersonMobileNo", next)}
          error={rowErrors?.mobile}
        />
        <ValidatedContactInput
          label={contactLabels.telephoneNo}
          type="tel"
          value={contactMultiValueInputValue(p.providerContactPersonTelephoneNo)}
          getValidationError={(v) => getContactTelephoneValidationError(v)}
          onValueChange={(next) => setField("providerContactPersonTelephoneNo", next)}
          error={rowErrors?.telephone}
        />
        <ValidatedContactInput
          label={contactLabels.email}
          isRequired
          value={contactMultiValueInputValue(p.providerContactPersonEmailId)}
          getValidationError={getContactEmailValidationError}
          onValueChange={(next) => setField("providerContactPersonEmailId", next)}
          error={rowErrors?.email}
        />
      </div>
    </div>
  );
}
