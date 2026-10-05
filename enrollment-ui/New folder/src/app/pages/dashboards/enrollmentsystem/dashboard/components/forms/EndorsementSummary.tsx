// EndorsementSummary.tsx

import { policySearchApi } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import DocumentDropdown from "../../corporate/DocumentDropdown";
import { formatDate, InfoRow } from "../InwardDetailsView";
import { formatAmountWithWords } from "../types";
import { useTranslation } from "react-i18next";

const EndorsementSummary: React.FC = () => {
  const { t } = useTranslation();
  useBreadcrumb([
    { title: t("nav.dashboards.enrollmentsystem") },
    { title: t("corporateInward.breadcrumb.dashboard"), path: "/enrolment-system/dashboard" },
    {
      title: t("corporateInward.pageTitle"),
      path: "/enrolment-system/corporate-enrolment",
    },
    { title: t("endorsementSummary.title") },
  ]);
  const [searchParams] = useSearchParams();
  const [endorsement, setEndorsementData] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const navigate = useNavigate()



  const inwardNo = searchParams.get("inwardNo") || "-";
  const policyNo = searchParams.get("policyNo");
  const params = useParams();

  useEffect(() => {
    const url = `/v1/policy-endorsements/fetch-policy-endorsement?policyNo=${policyNo}&inwardNo=${inwardNo}`;

    const getPolicyData = async () => {
      const result = await fetchUser(policySearchApi, url);
      if (result?.success && result?.data) {
        setEndorsementData(result?.data?.data?.endorsement);
        setPolicy(result?.data?.data?.policy);
      } else {
        setEndorsementData(null)
      }
    };

    if (params?.id) {
      getPolicyData();
    }
  }, [params?.id]);

  let baseSumInsuredAmount = 0;
  let premiumNetAmount = 0;
  let premiumGrossAmount = 0;
  let premiumSgstAmount = 0;
  let premiumUtgstAmount = 0;
  let taxInvoiceDate = " ";

  if (policy) {
    baseSumInsuredAmount = policy?.premiums?.map((p: any) => p.baseSumInsuredAmount).filter(Boolean).join(", ") || "-";
    premiumNetAmount = policy?.premiums?.map((p: any) => p.premiumNetAmount).filter(Boolean).join(", ") || "-";
    premiumGrossAmount = policy?.premiums?.map((p: any) => p.premiumGrossAmount).filter(Boolean).join(", ") || "-";
    premiumSgstAmount = policy?.premiums?.map((p: any) => p.premiumSgstAmount).filter(Boolean).join(", ") || "-";
    premiumUtgstAmount = policy?.premiums?.map((p: any) => p.premiumUtgstAmount).filter(Boolean).join(", ") || "-";
    taxInvoiceDate = policy?.premiums?.map((p: any) => p.taxInvoiceDate).filter(Boolean).join(", ") || "-";
  }
  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="flex items-center gap-4">
        <h1 className=" text-[14px] font-semibold"> {t("endorsementSummary.title")}</h1>
        <button
          onClick={() => navigate(`/enrolment-system/endorsement-member-data?policyEndorsementId=${endorsement?.policyEndorsementId}&inwardNo=${inwardNo}&policyId=${policy?.policy?.policyId}`)}
          className="mb-0 cursor-pointer text-sm font-medium text-blue-600 underline hover:text-blue-800">
          {t("endorsementSummary.viewEndorsementMemberData")}
        </button>
        <DocumentDropdown inwardNo={inwardNo} />

      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <InfoRow label={t("endorsementSummary.policy.inwardNumber")} value={policy?.policy?.inwardNo} />
            <InfoRow label={t("endorsementSummary.policy.policyStatus")} value={policy?.policy?.policyStatus} />
            <InfoRow label={t("endorsementSummary.policy.icName")} value={policy?.policy?.insurerName || "-"} />
            <InfoRow label={t("endorsementSummary.policy.policyNumber")} value={policyNo} />
            <InfoRow label={t("endorsementSummary.policy.previousPolicyNumber")} value={policy?.policy?.previousPolicyNo || "-"} />
            <InfoRow label={t("endorsementSummary.policy.policyType")} value={policy?.policy?.policyRenewalType} />
            <InfoRow label={t("endorsementSummary.policy.coverageType")} value={policy?.policy?.policyCoverageStructureType} />
            <InfoRow label={t("endorsementSummary.policy.policyStartDate")} value={formatDate(policy?.policy?.policyStartDate)} />
            <InfoRow label={t("endorsementSummary.policy.policyEndDate")} value={formatDate(policy?.policy?.policyEndDate)} />
            <InfoRow label={t("endorsementSummary.policy.policyIssueDate")} value={formatDate(policy?.policy?.policyIssueDate)} />
            <InfoRow label={t("endorsementSummary.policy.corporateName")} value={policy?.policy?.policyProposerName} />
            <InfoRow label={t("endorsementSummary.policy.corporateGSTNo")} value={policy?.policy?.policyProposerGstNo} />
            <InfoRow label={t("endorsementSummary.policy.address")} value={policy?.policy?.policyProposerAddress} />
            <InfoRow label={t("endorsementSummary.policy.state")} value={policy?.policy?.policyProposerAddressState} />
            <InfoRow label={t("endorsementSummary.policy.district")} value={policy?.policy?.policyProposerAddressDistrict} />
            <InfoRow label={t("endorsementSummary.policy.pincode")} value={policy?.policy?.policyProposerAddressPostalCode} />
            <InfoRow label={t("endorsementSummary.policy.brokerCode")} value={policy?.policy?.brokerCode} />
            <InfoRow label={t("endorsementSummary.policy.brokerName")} value={policy?.policy?.brokerName || "-"} />
            <InfoRow label={t("endorsementSummary.policy.tpaSpocName")} value={policy?.tpaSpoc?.tpaSpocName} />
            <InfoRow label={t("endorsementSummary.policy.tpaEmail")} value={policy?.tpaSpoc?.tpaSpocEmailId?.join(", ")} />
            <InfoRow label={t("endorsementSummary.policy.tpaMobile")} value={policy?.tpaSpocMobileNo?.join(", ")} />
            <InfoRow label={t("endorsementSummary.policy.policySumInsured")} value={formatAmountWithWords(baseSumInsuredAmount)} />
            <InfoRow label={t("endorsementSummary.policy.netPremium")} value={formatAmountWithWords(premiumNetAmount)} />
            <InfoRow label={t("endorsementSummary.policy.grossPremium")} value={formatAmountWithWords(premiumGrossAmount)} />
            <InfoRow label={t("endorsementSummary.policy.stateGST")} value={formatAmountWithWords(premiumSgstAmount)} />
            <InfoRow label={t("endorsementSummary.policy.totalGST")} value={formatAmountWithWords(premiumUtgstAmount)} />
            <InfoRow label={t("endorsementSummary.policy.policyTaxInvoiceDate")} value={formatDate(taxInvoiceDate)} />
            <InfoRow label={t("endorsementSummary.policy.policyRenewalType")} value={policy?.policy?.policyRenewalType} />
            <InfoRow label={t("endorsementSummary.policy.recordType")} value={policy?.policy?.policyRecordType} />
            <InfoRow label={t("endorsementSummary.policy.vipFlag")} value={policy?.policy?.policyVipFlag ? t("endorsementSummary.common.yes") : t("endorsementSummary.common.no")} />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <InfoRow label={t("endorsementSummary.endorsement.endorsementNumber")} value={endorsement?.endorsementNumber} />
            <InfoRow label={t("endorsementSummary.endorsement.endorsementType")} value={endorsement?.endorsementType} />
            <InfoRow label={t("endorsementSummary.endorsement.status")} value={endorsement?.status} />
            <InfoRow label={t("endorsementSummary.endorsement.requestDate")} value={formatDate(endorsement?.requestDate)} />
            <InfoRow label={t("endorsementSummary.endorsement.effectiveDate")} value={formatDate(endorsement?.effectiveDate)} />
            <InfoRow label={t("endorsementSummary.endorsement.receivedDate")} value={formatDate(endorsement?.receivedDate)} />
            <InfoRow label={t("endorsementSummary.endorsement.invoiceDate")} value={formatDate(endorsement?.invoiceDate)} />
            <InfoRow label={t("endorsementSummary.endorsement.invoiceNumber")} value={endorsement?.invoiceNo || "-"} />
            <InfoRow label={t("endorsementSummary.endorsement.creditNoteNumber")} value={endorsement?.creditNoteNo || "-"} />
            <InfoRow label={t("endorsementSummary.endorsement.addedMembers")} value={endorsement?.addedMembersCount} />
            <InfoRow label={t("endorsementSummary.endorsement.deletedMembers")} value={endorsement?.deletedMembersCount} />
            <InfoRow label={t("endorsementSummary.endorsement.modifiedMembers")} value={endorsement?.modifiedMembersCount} />
            <InfoRow label={t("endorsementSummary.endorsement.premiumAdded")} value={formatAmountWithWords(endorsement?.premiumAdded)} />
            <InfoRow label={t("endorsementSummary.endorsement.premiumDeducted")} value={formatAmountWithWords(endorsement?.premiumDeducted)} />
            <InfoRow label={t("endorsementSummary.endorsement.netPremium")} value={formatAmountWithWords(endorsement?.netPremium)} />
            <InfoRow label={t("endorsementSummary.endorsement.totalPremium")} value={formatAmountWithWords(endorsement?.totalPremium)} />
            <InfoRow label={t("endorsementSummary.endorsement.stateGST")} value={formatAmountWithWords(endorsement?.stateGst)} />
            <InfoRow label={t("endorsementSummary.endorsement.centralGST")} value={formatAmountWithWords(endorsement?.centralGst)} />
            <InfoRow label={t("endorsementSummary.endorsement.igst")} value={formatAmountWithWords(endorsement?.igst)} />
            <InfoRow label={t("endorsementSummary.endorsement.remark")} value={endorsement?.remark || "-"} />
            <InfoRow label={t("endorsementSummary.endorsement.inwardNumber")} value={endorsement?.inwardNo} />
            <InfoRow label={t("endorsementSummary.endorsement.createdBy")} value={endorsement?.createdByUserId} />
            <InfoRow label={t("endorsementSummary.endorsement.createdAt")} value={formatDate(endorsement?.createdAt)} />
            <InfoRow label={t("endorsementSummary.endorsement.updatedAt")} value={formatDate(endorsement?.updatedAt)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndorsementSummary;