import { memberData } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { EyeIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate, InfoRow } from "../components/InwardDetailsView";
import { formatAmountWithWords } from "../components/types";
import VerifyEmployeeModal from "./VerifyEmployeeModal/VerifyEmployeeModal";

type Props = {
    memberEnrollmentId: string;
};

export const EndorsementSingleMemeber: React.FC<Props> = ({
    memberEnrollmentId,
}) => {
    const url = `/v1/member/details/${memberEnrollmentId}`;
    const [member, setMember] = useState<any>(null);
    const { t } = useTranslation()

    const getPolicyData = async () => {
        const result = await fetchUser(memberData, url);

        if (result?.success && result?.data) {
            setMember(result?.data?.data);
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
                {member ? (
                    <div className="min-w-[900px] border border-gray-300 rounded-md overflow-hidden">
                        <div>
                            <InfoRow
                                label={t("memberDetails.labels.insurerName")}
                                value={member?.insurerName}
                            />
                            <InfoRow
                                label={t("memberDetails.labels.corporateName")}
                                value={member?.corporateName}
                            />
                            <InfoRow
                                label={t("memberDetails.labels.policyNumber")}
                                value={member?.policyNumber}
                            />
                            <InfoRow
                                label={t("memberDetails.labels.previousPolicyNumber")}
                                value={member?.previousPolicyNumber}
                            />
                            <InfoRow
                                label={t("memberDetails.labels.policyStatus")}
                                value={member?.policyStatus}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.riskFromDate")}
                                value={formatDate(member?.riskFromDate)}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.riskToDate")}
                                value={formatDate(member?.policyEndDate)}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.endorsementNumber")}
                                value={member?.endorsNo}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.endorsementRequestDate")}
                                value={formatDate(member?.endorsRequestDate)}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.endorsementEffectiveDate")}
                                value={formatDate(member?.endorsEffectiveDate)}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.endorsementReceivedDate")}
                                value={formatDate(member?.endorsReceivedDate)}
                            />

                            <InfoRow
                                label={"Date of Joining"}
                                value={formatDate(member?.dateOfJoining)}
                            />
                            <InfoRow
                                label={t("memberDetails.labels.employeeId")}
                                value={member?.employeeCode}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.insuredPersonName")}
                                value={member?.insuredMemberName}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.relation")}
                                value={member?.relationship}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.dateOfBirth")}
                                value={formatDate(member?.dateOfBirth)}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.age")}
                                value={member?.insuredMemberAge}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.gender")}
                                value={member?.gender}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.healthCardNumber")}
                                value={member?.healthCardNumber}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.memberId")}
                                value={member?.uhid}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.ipSumInsured")}
                                value={formatAmountWithWords(member?.insuredMemberSumInsured)}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.ipCoveredFromDate")}
                                value={formatDate(member?.insuredMemberCoverageStartDate)}
                            />
                            <InfoRow
                                label={t("memberDetails.labels.ipPhone")}
                                value={member?.mobileNumber}
                            />

                            <InfoRow
                                label={t("memberDetails.labels.ipEmail")}
                                value={member?.email}
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
                    setMemberData={setMember}
                    onVerified={() => setIsVerified(true)}
                    isEndorsementMember={true}
                />
            )}
        </>
    );
};