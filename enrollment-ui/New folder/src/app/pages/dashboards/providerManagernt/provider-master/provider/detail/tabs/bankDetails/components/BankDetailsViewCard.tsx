import { CheckBadgeIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { DetailRow } from "../../../shared/DetailRow";
import type { BankTabFieldsFromApi } from "../../../utils/providerDetailSectionMerges";
import type { IfscVerificationStatus } from "../utils/bankDetailsHelpers";

type BankDetailsViewCardProps = {
  bankFieldsFromApi: BankTabFieldsFromApi | null;
  ifscVerificationStatus: IfscVerificationStatus;
  isSidebarOpen: boolean;
};

function renderIfscVerificationStatusIcon(
  status: IfscVerificationStatus,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (status === "verified") {
    return (
      <CheckCircleIcon
        className="h-4 w-4 text-emerald-800"
        title={t("providerMaster.detailTabs.bank.ifscVerified")}
      />
    );
  }
  if (status === "not_verified") {
    return (
      <XCircleIcon
        className="h-4 w-4 text-red-800"
        title={t("providerMaster.detailTabs.bank.ifscNotVerified")}
      />
    );
  }
  return (
    <CheckBadgeIcon
      className="h-4 w-4 text-slate-500"
      title={t("providerMaster.detailTabs.bank.ifscVerify")}
    />
  );
}

export function BankDetailsViewCard({
  bankFieldsFromApi,
  ifscVerificationStatus,
  isSidebarOpen,
}: Readonly<BankDetailsViewCardProps>) {
  const { t } = useTranslation();
  const empty = t("providerMaster.expiry.emptyValue");

  return (
    <dl
      className={`grid grid-cols-1 gap-x-2 gap-y-0 sm:grid-cols-2 ${
        isSidebarOpen ? "xl:grid-cols-3" : "xl:grid-cols-4"
      }`}
    >
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.accountHolderName")}
        value={bankFieldsFromApi?.providerBankHolderName}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.accountNumber")}
        value={bankFieldsFromApi?.providerBankAccountNo}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.accountType")}
        value={bankFieldsFromApi?.providerAccountType}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.accountHolderType")}
        value={bankFieldsFromApi?.providerBankAccountBeneficiaryType}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.bankName")}
        value={bankFieldsFromApi?.providerBankName}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.bankBranch")}
        value={bankFieldsFromApi?.providerBankBranch}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.ifscCode")}
        value={bankFieldsFromApi?.providerBankIfscCode}
        render={(value) => (
          <span className="inline-flex items-center justify-end gap-1">
            <span>{value?.trim() ? value : empty}</span>
            {renderIfscVerificationStatusIcon(ifscVerificationStatus, t)}
          </span>
        )}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.micrCode")}
        value={bankFieldsFromApi?.providerBankMicrCode}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.panNo")}
        value={bankFieldsFromApi?.providerPanNo}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.panHolderName")}
        value={bankFieldsFromApi?.providerPanHolderName}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.tanNo")}
        value={bankFieldsFromApi?.providerTanNo}
      />
      <DetailRow
        compact
        tone="slate"
        layout="inline"
        label={t("providerMaster.detailTabs.bank.fields.bankAddress")}
        value={bankFieldsFromApi?.providerBankAddress}
      />
    </dl>
  );
}
