import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type MainTabType = "total" | "added" | "modified" | "deleted";
export type SubTabType = "success" | "failed";

interface Props {
    policyEndorsementId: string | null;
    page: number;
    pageSize: number;
    dispatch: any;
    processingStatus?: string;
    fetchMemberServiceEndorsement: any;
    memberDataForEnd: any;
    activeMainTab: MainTabType;
    setActiveMainTab: React.Dispatch<React.SetStateAction<MainTabType>>;
    activeSubTab: SubTabType;
    setActiveSubTab: React.Dispatch<React.SetStateAction<SubTabType>>;
}

export const getApiPayload = (mainTab: MainTabType, subTab: SubTabType, policyEndorsementId: string, page: number, pageSize: number) => {
    const payload: any = { policyEndorsementId, page, size: pageSize };
    if (mainTab === "total") {
        if (subTab === "success") { payload.enrollmentAction = "success" }
        if (subTab === "failed") { payload.enrollmentStatus = "failed" }
    }
    if (mainTab === "added") {
        payload.enrollmentAction = "New";
        payload.enrollmentStatus = subTab === "success" ? "enrolled" : "failed";
    }
    if (mainTab === "modified") {
        payload.enrollmentAction = "Modify";
        payload.enrollmentStatus = subTab === "success" ? "enrolled" : "failed";
    }
    if (mainTab === "deleted") {
        payload.enrollmentAction = "delete";
        payload.enrollmentStatus = subTab === "success" ? "deleted" : "failed";
    }
    return payload;
};
const EndorsementTabs = ({ processingStatus,policyEndorsementId, page, pageSize, dispatch, fetchMemberServiceEndorsement, memberDataForEnd, activeMainTab, setActiveMainTab, activeSubTab, setActiveSubTab }: Props) => {

    useEffect(() => {
        if (!policyEndorsementId) return;
        const payload = getApiPayload(activeMainTab, activeSubTab, policyEndorsementId, page, pageSize);
        if(processingStatus==="COMPLETED" || processingStatus==="FAILED"){
            dispatch(fetchMemberServiceEndorsement(payload));
        }
    }, [activeMainTab, activeSubTab, page, pageSize, policyEndorsementId, dispatch, fetchMemberServiceEndorsement,processingStatus]);
    const { t } = useTranslation()
    const mainTabs = [
        { key: "total", label: t("endorsementTabs.mainTabs.totalRequested"), color: "bg-blue-500", number: memberDataForEnd?.totalRequested, success: memberDataForEnd?.totalSuccess, failed: memberDataForEnd?.totalFailed },
        { key: "added", label: t("endorsementTabs.mainTabs.additionsRequested"), color: "bg-green-500", number: memberDataForEnd?.addition, success: memberDataForEnd?.addSuccess, failed: memberDataForEnd?.addFailed },
        { key: "modified", label: t("endorsementTabs.mainTabs.modificationsRequested"), color: "bg-yellow-500", number: memberDataForEnd?.modification, success: memberDataForEnd?.modifySuccess, failed: memberDataForEnd?.modifyFailed },
        { key: "deleted", label: t("endorsementTabs.mainTabs.deletionsRequested"), color: "bg-red-500", number: memberDataForEnd?.deletion, success: memberDataForEnd?.deleteSuccess, failed: memberDataForEnd?.deleteFailed },
    ];
    const subTabs = [
        { key: "success", label: t("endorsementTabs.subTabs.success")},
        { key: "failed", label: t("endorsementTabs.subTabs.failed")},
    ];
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
            {mainTabs?.map((mainTab) => {
                const isActiveMain = activeMainTab === mainTab?.key;
                return (
                    <div
                        key={mainTab.key}
                        className={`rounded-lg overflow-hidden border shadow-2xs transition-all ${isActiveMain
                            ? "border-primary-600 ring-1 ring-primary-600"
                            : "border-slate-200"
                            }`}>
                        <div className={`flex items-center justify-between px-2.5 py-1 text-white ${mainTab?.color}`}>
                            <p className="text-[11px] font-semibold truncate">
                                {mainTab?.label}
                            </p>
                            <p className="text-xs font-bold font-mono">
                                {mainTab?.number ?? 0}
                            </p>
                        </div>
                        <div className="grid grid-cols-2">
                            {subTabs?.map((subTab) => {
                                const isActive = activeMainTab === mainTab?.key && activeSubTab === subTab?.key;
                                const count = subTab?.key === "success" ? mainTab?.success : mainTab?.failed;
                                return (
                                    <button
                                        key={subTab?.key}
                                        type="button"
                                        onClick={() => {
                                            setActiveMainTab(mainTab?.key as MainTabType);
                                            setActiveSubTab(subTab?.key as SubTabType);
                                        }}
                                        className={`cursor-pointer py-1 text-[11px] font-medium border-t border-slate-200 transition-all flex items-center justify-center gap-1.5
                                         ${isActive ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}>
                                        <span>{subTab?.label}</span>
                                        <span className={`px-1.5 py-px rounded-full text-[10px] font-bold font-mono
                                             ${isActive ? "bg-white text-slate-900" : "bg-slate-100 text-slate-700"}`}>
                                            {count ?? 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
export default EndorsementTabs;