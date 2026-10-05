import React, { useEffect } from "react";
import CreateInwardForm from "../../PolicyDetails/CreateInwardForm";
import UploadInwardDocuments from "../../PolicyDetails/UploadInwardDocuments";
import CreateCorporateInwardForm from "./CreateCorporateInwardForm";
import AssignComponent from "../corporate/AssignComponent";
import { InsuranceTable } from "../corporate/InsuranceTable";
import EmployeeEndorsementForm from "./forms/EmployeeEndorsementForm";
import RohiniInward from "../../../providerManagernt/provider-master/rohini-master/RohiniInward/RohiniInward";
import { useTranslation } from "react-i18next";
import AssignGroup from "../../../usermanagement/Users/AssignGroup";
import { EndorsementSingleMemeber } from "../corporate/EndorsementSingleMemeber";
import PSUInward from "../../PolicyDetails/psuinward/psuInward";
import ViewCard from "../ecard/listing/ViewCard";
import AssignUser from "./admindashboard/AssignUser";
import DummyPolicyList from "./forms/DummyPolicyList";
interface Props {
    open: boolean;
    isCorporateInward?: boolean;
    isInward?: boolean;
    isMemberView?: boolean;
    isEndorsemenrtMemberView?: boolean;
    isInwardWithList?: boolean;
    isNotInword?: boolean;
    isMember?: boolean;
    isAssign?: boolean;
    isRohini?: boolean;
    isUser?: boolean;
    isPSUInward?: boolean;
    isTempleteView?: boolean;
    isAssignOpen?: boolean;
    isDummyPopup?: boolean;
    isData?: any;
    groupList?: any;
    setDummyPolicyNumber?: any;
    onClose: () => void;
    onSave?: ((data: any) => void) | undefined;
    onRohiniUploadSuccess?: () => void;
}

const CreateCorporateInwardModal: React.FC<Props> = ({ setDummyPolicyNumber, isDummyPopup, isAssignOpen, isTempleteView, isPSUInward, isEndorsemenrtMemberView, groupList, isUser, isRohini, onSave, isMember, isMemberView, open, onClose, isCorporateInward, isInward, isInwardWithList, isData, isAssign, isNotInword, onRohiniUploadSuccess }) => {
    const { t } = useTranslation();
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);
    if (!open) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3">
            <div className={`relative max-w-6xl max-h-[92vh] 
                ${(isAssign || isPSUInward || isAssignOpen || isDummyPopup) ? "w-[50%]" : "w-[75%]"} bg-white rounded-xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-dark-600 dark:bg-dark-800`}>
                <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-slate-100 dark:border-dark-700 shrink-0">
                    <div className="flex items-center gap-2">
                        {isDummyPopup && (
                            <h2 className="text-sm font-bold text-slate-800">
                                Dummy-to-Live policy Linkage
                            </h2>
                        )}
                        {isTempleteView && (
                            <h2 className="text-sm font-bold text-slate-800">
                                View Template
                            </h2>
                        )}
                        {isAssignOpen && (
                            <h2 className="text-sm font-bold text-slate-800">
                                Assign User
                            </h2>
                        )}
                        {isCorporateInward && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.createManualInward")}
                            </h2>
                        )}
                        {isPSUInward && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.createInward")}
                            </h2>
                        )}
                        {isRohini && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.uploadRohiniHospitalList")}
                            </h2>
                        )}
                        {isMemberView && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.memberDetails")}
                            </h2>
                        )}
                        {isEndorsemenrtMemberView && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.memberDetails")}
                            </h2>
                        )}
                        {isInward && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.createInward")}
                            </h2>
                        )}
                        {isUser && (
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">
                                    Assign Group
                                </h2>
                                <p className="font-medium text-[11px] text-slate-500">Select the groups to assign. Previously assigned groups that are unchecked will be removed automatically.</p>
                            </div>
                        )}
                        {isAssign && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.assignUser")}
                            </h2>
                        )}
                        {isInwardWithList && (
                            <h2 className="text-sm font-bold text-slate-800">
                                Upload Document
                            </h2>
                        )}
                        {isNotInword && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.uploadDocument")}
                            </h2>
                        )}
                        {isMember && (
                            <h2 className="text-sm font-bold text-slate-800">
                                {t("modalTitles.addMember")}
                            </h2>
                        )}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xs transition cursor-pointer"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 bg-gray-50">
                    {isMember && (
                        <div className="p-4 space-y-2">
                            <EmployeeEndorsementForm onClose={onClose} onSave={onSave} />
                        </div>
                    )}
                    {isTempleteView && (
                        <div className="p-4 space-y-2">
                            <ViewCard
                                labelFields={isData?.labels}
                                insurerId={isData?.insurerId}
                                corporateId={isData?.corporateId}
                                policyId={isData?.policyId}
                                onClose={onClose}
                            />
                        </div>
                    )}
                    {isRohini && (
                        <div className="p-4 space-y-2">
                            <RohiniInward
                                onClose={onClose}
                                onUploadSuccess={onRohiniUploadSuccess}
                            />
                        </div>
                    )}
                    {isCorporateInward && (
                        <CreateCorporateInwardForm onClose={onClose} />
                    )}
                    {isInward && (
                        <CreateInwardForm onClose={onClose} />
                    )}
                    {isPSUInward && (
                        <PSUInward onClose={onClose} />
                    )}
                    {isAssignOpen && (
                        <AssignUser onClose={onClose} isData={isData} />
                    )}
                    {isUser && (
                        <AssignGroup onClose={onClose} groupList={groupList} userId={isData?.id} />
                    )}
                    {isAssign && (
                        <AssignComponent onClose={onClose} />
                    )}
                    {isMemberView && (
                        <div className="p-4">
                            <InsuranceTable memberEnrollmentId={isData} />
                        </div>
                    )}
                    {isDummyPopup && (
                        <div className="p-4">
                            <DummyPolicyList policies={isData}
                                onSelect={(policyNumber) => {
                                    setDummyPolicyNumber(policyNumber);
                                }}
                                onClose={onClose}
                            />
                        </div>
                    )}
                    {isEndorsemenrtMemberView && (
                        <div className="p-4">
                            <EndorsementSingleMemeber memberEnrollmentId={isData} />
                        </div>
                    )}
                    {(isInwardWithList || isNotInword) && (
                        <div className="p-4 space-y-2">
                            <UploadInwardDocuments
                                inwardNo={isData?.inwardNo}
                                s3BucketName={isData?.s3BucketName}
                                s3SubBucketName={isData?.s3SubBucketName}
                                departmentId={isData?.departmentId}
                                onClose={onClose}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateCorporateInwardModal;