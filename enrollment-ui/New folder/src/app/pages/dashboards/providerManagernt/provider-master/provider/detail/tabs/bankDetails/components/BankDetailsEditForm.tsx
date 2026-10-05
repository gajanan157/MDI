import {
  CheckBadgeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { Input, Textarea } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import type { BankFormValues } from "../../../schemas";
import {
  ACCOUNT_HOLDER_TYPE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from "../utils/bankDetailsConfig";
import type { IfscVerificationStatus } from "../utils/bankDetailsHelpers";
import type { BankDetailsFormHandle } from "../hooks/bankTabHooks";

type BankDetailsEditFormProps = {
  form: BankDetailsFormHandle;
  isSidebarOpen: boolean;
  ifscVerificationStatus: IfscVerificationStatus;
  isIfscVerifying: boolean;
  verifyIfscDisabled: boolean;
  onVerifyIfsc: () => void;
  onClearIfscVerification: () => void;
  onSubmit: (values: BankFormValues) => void | Promise<void>;
};

function getIfscVerifyButtonClass(status: IfscVerificationStatus): string {
  if (status === "verified") {
    return "bg-emerald-600 text-white hover:bg-emerald-700";
  }
  if (status === "not_verified") {
    return "bg-red-600 text-white hover:bg-red-700";
  }
  return "bg-blue-600 text-white hover:bg-blue-700";
}

function renderIfscVerificationIcon(status: IfscVerificationStatus) {
  if (status === "verified") return <CheckCircleIcon className="h-4 w-4" />;
  if (status === "not_verified") return <XCircleIcon className="h-4 w-4" />;
  return <CheckBadgeIcon className="h-4 w-4" />;
}

export function BankDetailsEditForm({
  form,
  isSidebarOpen,
  ifscVerificationStatus,
  isIfscVerifying,
  verifyIfscDisabled,
  onVerifyIfsc,
  onClearIfscVerification,
  onSubmit,
}: Readonly<BankDetailsEditFormProps>) {
  const { t } = useTranslation();
  const V = "providerMaster.detailTabs.bank.validation";
  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = form;
  const accountHolderType = String(
    watch("providerBankAccountBeneficiaryType") ?? "",
  )
    .trim()
    .toUpperCase();
  const isSelfAccountHolder = accountHolderType === "SELF";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`grid items-start gap-x-2 gap-y-1 pb-1 ${
        isSidebarOpen
          ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      }`}
    >
      <Input
        label={t("providerMaster.detailTabs.bank.fields.accountHolderName")}
        {...register("providerBankHolderName", {
          onChange: (event) => {
            if (!isSelfAccountHolder) return;
            event.target.value = String(event.target.value ?? "").replace(
              /[^A-Za-z\s]/g,
              "",
            );
          },
        })}
        error={errors.providerBankHolderName?.message}
        className="h-8 text-xs"
        classNames={{ root: "min-w-0" }}
        isRequired
      />
      <Input
        label={t("providerMaster.detailTabs.bank.fields.accountNumber")}
        {...register("providerBankAccountNo", {
          onChange: (event) => {
            event.target.value = String(event.target.value ?? "").replace(
              /\s+/g,
              "",
            );
          },
          setValueAs: (value) =>
            typeof value === "string" ? value.replace(/\s+/g, "") : value,
        })}
        error={errors.providerBankAccountNo?.message}
        className="h-8 text-xs"
        classNames={{ root: "min-w-0" }}
        isRequired
      />
      <DropdownSelect
        label={t("providerMaster.detailTabs.bank.fields.accountType")}
        name_key="providerAccountType"
        defaultValue="Account Type"
        options={ACCOUNT_TYPE_OPTIONS}
        control={control}
        rules={{ required: t(`${V}.accountTypeRequired`) }}
        name="providerAccountType"
        errors={errors.providerAccountType}
        className="h-8 rounded-md"
        isRequired
      />
      <DropdownSelect
        label={t("providerMaster.detailTabs.bank.fields.accountHolderType")}
        name_key="providerBankAccountBeneficiaryType"
        defaultValue="Account Holder Type"
        options={ACCOUNT_HOLDER_TYPE_OPTIONS}
        control={control}
        name="providerBankAccountBeneficiaryType"
        errors={errors.providerBankAccountBeneficiaryType}
        className="h-8 rounded-md"
        onChange={(value) => {
          const nextType = String(value ?? "").trim().toUpperCase();
          if (nextType === "SELF") {
            const currentHolderName = String(
              getValues("providerBankHolderName") ?? "",
            );
            const alphabetsOnlyHolderName = currentHolderName.replace(
              /[^A-Za-z\s]/g,
              "",
            );
            if (alphabetsOnlyHolderName !== currentHolderName) {
              setValue("providerBankHolderName", alphabetsOnlyHolderName, {
                shouldDirty: true,
                shouldValidate: true,
              });
            } else {
              void trigger("providerBankHolderName");
            }

            const currentPanHolderName = String(
              getValues("providerPanHolderName") ?? "",
            );
            const alphabetsOnlyPanHolderName = currentPanHolderName.replace(
              /[^A-Za-z\s]/g,
              "",
            );
            if (alphabetsOnlyPanHolderName !== currentPanHolderName) {
              setValue("providerPanHolderName", alphabetsOnlyPanHolderName, {
                shouldDirty: true,
                shouldValidate: true,
              });
            } else {
              void trigger("providerPanHolderName");
            }
          } else {
            void trigger("providerBankHolderName");
            void trigger("providerPanHolderName");
          }
        }}
      />
      <Input
        label={t("providerMaster.detailTabs.bank.fields.bankName")}
        {...register("providerBankName")}
        error={errors.providerBankName?.message}
        className="h-8 text-xs"
        classNames={{ root: "min-w-0" }}
        isRequired
      />
      <Input
        label={t("providerMaster.detailTabs.bank.fields.bankBranch")}
        {...register("providerBankBranch")}
        error={errors.providerBankBranch?.message}
        className="h-8 text-xs"
        classNames={{ root: "min-w-0" }}
        isRequired
      />
      <Input
        label={t("providerMaster.detailTabs.bank.fields.ifscCode")}
        {...register("providerBankIfscCode", {
          onChange: (event) => {
            event.target.value = String(event.target.value ?? "").toUpperCase();
            onClearIfscVerification();
          },
          setValueAs: (value) =>
            typeof value === "string" ? value.toUpperCase() : value,
        })}
        error={errors.providerBankIfscCode?.message}
        className="h-8 text-xs ltr:pr-10"
        classNames={{ root: "min-w-0", suffix: "!w-10" }}
        isRequired
        suffix={
          <button
            type="button"
            onClick={onVerifyIfsc}
            disabled={verifyIfscDisabled}
            className={`flex h-full w-full items-center justify-center rounded-r-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${getIfscVerifyButtonClass(ifscVerificationStatus)}`}
            title={
              isIfscVerifying
                ? t("providerMaster.detailTabs.bank.verifyingIfsc")
                : t("providerMaster.detailTabs.bank.verifyIfsc")
            }
            aria-label={
              isIfscVerifying
                ? t("providerMaster.detailTabs.bank.verifyingIfsc")
                : t("providerMaster.detailTabs.bank.verifyIfsc")
            }
          >
            {renderIfscVerificationIcon(ifscVerificationStatus)}
          </button>
        }
      />
      <Input
        label={t("providerMaster.detailTabs.bank.fields.micrCode")}
        {...register("providerBankMicrCode")}
        error={errors.providerBankMicrCode?.message}
        className="h-8 text-xs"
        classNames={{ root: "min-w-0" }}
        isRequired
      />
      <Input
        label={t("providerMaster.detailTabs.bank.fields.panNo")}
        {...register("providerPanNo", {
          onChange: (event) => {
            event.target.value = String(event.target.value ?? "").toUpperCase();
          },
          setValueAs: (value) =>
            typeof value === "string" ? value.toUpperCase() : value,
        })}
        error={errors.providerPanNo?.message}
        className="h-8 text-xs"
        classNames={{ root: "min-w-0" }}
        isRequired
      />
      <Input
        label={t("providerMaster.detailTabs.bank.fields.panHolderName")}
        {...register("providerPanHolderName", {
          onChange: (event) => {
            let next = String(event.target.value ?? "").toUpperCase();
            if (isSelfAccountHolder) {
              next = next.replace(/[^A-Za-z\s]/g, "");
            }
            event.target.value = next;
          },
          setValueAs: (value) => {
            if (typeof value !== "string") return value;
            let next = value.toUpperCase();
            if (isSelfAccountHolder) {
              next = next.replace(/[^A-Za-z\s]/g, "");
            }
            return next;
          },
        })}
        error={errors.providerPanHolderName?.message}
        className="h-8 text-xs"
        classNames={{ root: "min-w-0" }}
        isRequired
      />
      <Input
        label={t("providerMaster.detailTabs.bank.fields.tanNo")}
        {...register("providerTanNo", {
          onChange: (event) => {
            event.target.value = String(event.target.value ?? "").toUpperCase();
          },
          setValueAs: (value) =>
            typeof value === "string" ? value.toUpperCase() : value,
        })}
        error={errors.providerTanNo?.message}
        className="h-8 text-xs"
        classNames={{ root: "min-w-0" }}
      />
      <Textarea
        label={t("providerMaster.detailTabs.bank.fields.bankAddress")}
        {...register("providerBankAddress")}
        error={errors.providerBankAddress?.message}
        placeholder={t("providerMaster.detailTabs.bank.bankAddressPlaceholder")}
        rows={2}
        className="min-h-8 resize-y text-xs"
        classNames={{
          root: `min-w-0 ${
            isSidebarOpen ? "xl:col-span-3" : "xl:col-span-4"
          } sm:col-span-2`,
        }}
        isRequired
      />
    </form>
  );
}
