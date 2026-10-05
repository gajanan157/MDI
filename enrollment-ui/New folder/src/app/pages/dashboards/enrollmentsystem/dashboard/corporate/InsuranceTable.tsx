import React, { useEffect, useState } from "react";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { memberService } from "@/app/api/apiService";
import { formatDate, InfoRow } from "../components/InwardDetailsView";
import { formatAmountWithWords } from "../components/types";
import { useTranslation } from "react-i18next";
import { EyeIcon } from "@heroicons/react/24/outline";
import VerifyEmployeeModal from "./VerifyEmployeeModal/VerifyEmployeeModal";

type Props = {
  memberEnrollmentId: string;
};

export const InsuranceTable: React.FC<Props> = ({
  memberEnrollmentId,
}) => {
  const url = `/v1/members/details/${memberEnrollmentId}`;
  const [memberData, setMemberData] = useState<any>(null);
  const { t } = useTranslation()

  const getPolicyData = async () => {
    const result = await fetchUser(memberService, url);

    if (result?.success && result?.data) {
      setMemberData(result?.data?.data);
    }
  };

  useEffect(() => {
    if (memberEnrollmentId) {
      getPolicyData();
    }
  }, [memberEnrollmentId]);

  const [open2, setOpen2] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  return (
    <>
      {!isVerified && (
        <div className="absolute right-12 top-5 flex gap-2">
          <p className="text-[12px] font-bold">View Mask Data</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen2(true)
            }}
            className="cursor-pointer rounded flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
            title={t("inwardList.actions.view")}>
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="w-full overflow-x-auto">
        {memberData ? (
          <div className="min-w-[900px] border border-gray-300 rounded-md overflow-hidden">
            <div>
              <InfoRow
                label={t("memberDetails.labels.insurerName")}
                value={memberData?.icName}
              />
              <InfoRow
                label={t("memberDetails.labels.policyNumber")}
                value={memberData?.policyNumber}
              />
              <InfoRow
                label={t("memberDetails.labels.previousPolicyNumber")}
                value={memberData?.prePolicyNumber}
              />
              <InfoRow
                label={t("memberDetails.labels.employeeId")}
                value={memberData?.employeeId}
              />
              <InfoRow
                label={t("memberDetails.labels.policyDescription")}
                value={memberData?.policyDescription}
              />
              <InfoRow
                label={t("memberDetails.labels.policyStatus")}
                value={memberData?.policyStatus}
              />
              <InfoRow
                label={t("memberDetails.labels.healthCardNumber")}
                value={memberData?.healthCardNumber}
              />
              <InfoRow
                label={t("memberDetails.labels.memberId")}
                value={memberData?.memberId}
              />
              <InfoRow
                label={t("memberDetails.labels.mdid")}
                value={memberData?.mdid}
              />
              <InfoRow
                label={t("memberDetails.labels.corporateName")}
                value={memberData?.nameOfInsuredCompany}
              />
              <InfoRow
                label={t("memberDetails.labels.riskFromDate")}
                value={formatDate(memberData?.riskFromDate)}
              />
              <InfoRow
                label={t("memberDetails.labels.riskToDate")}
                value={formatDate(memberData?.policyEndDate)}
              />
              <InfoRow
                label={t("memberDetails.labels.dateOfJoining")}
                value={formatDate(memberData?.dateOfJoining)}
              />
              <InfoRow
                label={t("memberDetails.labels.grade")}
                value={memberData?.grade}
              />
              <InfoRow
                label={t("memberDetails.labels.agentCode")}
                value={memberData?.agentCode}
              />
              <InfoRow
                label={t("memberDetails.labels.insuredPersonName")}
                value={memberData?.insuredPersonName}
              />
              <InfoRow
                label={t("memberDetails.labels.relation")}
                value={memberData?.relation}
              />
              <InfoRow
                label={t("memberDetails.labels.dateOfBirth")}
                value={formatDate(memberData?.dateOfBirth)}
              />
              <InfoRow
                label={t("memberDetails.labels.ipCoveredFromDate")}
                value={formatDate(memberData?.ipCoveredFromDate)}
              />
              <InfoRow
                label={t("memberDetails.labels.age")}
                value={memberData?.age}
              />
              <InfoRow
                label={t("memberDetails.labels.gender")}
                value={memberData?.gender}
              />
              <InfoRow
                label={t("memberDetails.labels.ipSumInsured")}
                value={formatAmountWithWords(memberData?.ipSumInsured)}
              />
              <InfoRow
                label={t("memberDetails.labels.ipPhone")}
                value={memberData?.ipPhone}
              />
              <InfoRow
                label={t("memberDetails.labels.ipEmail")}
                value={memberData?.ipEmail}
              />
              <InfoRow
                label={t("memberDetails.labels.location")}
                value={memberData?.location}
              />
              <InfoRow
                label={t("memberDetails.labels.endorsementNumber")}
                value={memberData?.endorsNo}
              />
              <InfoRow
                label={t("memberDetails.labels.endorsementRequestDate")}
                value={formatDate(memberData?.endorsRequestDate)}
              />
              <InfoRow
                label={t("memberDetails.labels.endorsementEffectiveDate")}
                value={formatDate(memberData?.endorsEffectiveDate)}
              />
              <InfoRow
                label={t("memberDetails.labels.endorsementReceivedDate")}
                value={formatDate(memberData?.endorsReceivedDate)}
              />
              <InfoRow
                label={t("memberDetails.labels.dateOfInception")}
                value={formatDate(memberData?.dateOfInception)}
              />
                <InfoRow
                label={t("memberDetails.labels.exceptionCategory")}
                 value={memberData?.exceptionCategory}
              />
               <InfoRow
                 label={t("memberDetails.labels.exceptionApprovalRemark")}
                 value={memberData?.exceptionApprovalRemark}
              
              />
            </div>
          </div>
        )
          : (
            <div className="text-gray-500">{t("memberDetails.messages.loadingMemberDetails")}</div>
          )}
      </div>
      {open2 && (
        <VerifyEmployeeModal
          open={open2}
          onClose={() => setOpen2(false)}
          insuredMemberId={memberEnrollmentId}
          setMemberData={setMemberData}
          onVerified={() => setIsVerified(true)}
        />
      )}
    </>
  );
};