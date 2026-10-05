import { useMemo, useState, useEffect } from "react";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import {Database,Sparkles} from 'lucide-react';
import LimitTypeMaster from "./LimitTypeMaster";
import LimitBasisMaster from "./LimitBasisMaster";
import LimitUnitMaster from "./LimitUnitMaster";
import SIMaster from "./SIMaster";
import TnCMaster from "./TnCMaster";
import EligibilityMaster from "./EligibilityMaster";
import DimensionMaster from "./DimensionMaster";
import HazardousActivityMaster from "./HazardousActivityMaster";
import BillChargeGroupMaster from "./BillChargeGroupMaster";
import BillHeadMaster from "./BillHeadMaster";
import DeductionReasonMaster from "./DeductionReasonMaster";
import ParameterMaster from "./ParameterMaster";
import ProcedureMaster from "./ProcedureMaster";
import DiseaseMaster from "./DiseaseMaster";
import AilmentProcedure from "./AilmentProcedure";
import BenefitRulesBuilder from "./BenefitRulesBuilder";
import { useLocation } from "react-router";
import TncLimitActionMaster from "./TncLimitActionMaster";
import TncLimitActionLevelMaster from "./TncLimitActionLevelMaster";
import TncLimitClaimSpecialActionMaster from "./TncLimitClaimSpecialActionMaster";

export default function Masters() {
    // const [activeTab, setActiveTab] = useState<TabType>('limitTypes');
    const location = useLocation();

    const TAB_CONFIG = [
        { value: "limitTypes", label: "Limit Type" },
        { value: "limitUnits", label: "Limit Unit" },
        { value: "limitBasis", label: "Limit Basis" },
        { value: "siMaster", label: "Sum Insured" },
        { value: "TnCMaster", label: "TnC" },
        { value: "TncLimitActionMaster", label: "Limit Action" },
        { value: "TncLimitActionLevelMaster", label: "Limit Action Level" },
        { value: "TncLimitClaimSpecialActionMaster", label: "Limit Claim Special Action" },
        { value: "EligibiltyMaster", label: "Eligibility" },
        { value: "DimensionMaster", label: "Dimension" },
        { value: "HazardousActivityMaster", label: "Hazardous Activity" },
        { value: "BillChargeGroupMaster", label: "Bill Charge Group" },
        { value: "BillHeadMaster", label: "Bill Head" },
        { value: "DeductionReasonMaster", label: "Deduction Reason" },
        { value: "ParameterMaster", label: "Parameter" },
        { value: "ProcedureMaster", label: "Procedure" },
        { value: "DiseaseMaster", label: "Disease" },
        { value: "AilmentProcedure", label: "Ailment Procedure" },
        { value: "BenefitRulesBuilder", label: "Benefit Rules Builder" },

     
      
    ];
      
    type TabType = typeof TAB_CONFIG[number]["value"];

    const initialTab =
        (location.state?.activeTab as TabType) || "limitTypes";

    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
      
    const [tabsToBeInclude, setTabsToBeInclude] = useState(TAB_CONFIG);

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    
    const tabComponents: Record<string, React.ComponentType> = {
        "limitTypes": LimitTypeMaster,
        "limitBasis": LimitBasisMaster,
        "limitUnits": LimitUnitMaster,
        "siMaster":SIMaster,
        "TnCMaster":TnCMaster,
        "TncLimitActionMaster":TncLimitActionMaster,
        "TncLimitActionLevelMaster" : TncLimitActionLevelMaster,
        "TncLimitClaimSpecialActionMaster" : TncLimitClaimSpecialActionMaster, 
        "EligibiltyMaster":EligibilityMaster,
        "DimensionMaster":DimensionMaster,
        "HazardousActivityMaster":HazardousActivityMaster,
        "BillChargeGroupMaster":BillChargeGroupMaster,
        "BillHeadMaster":BillHeadMaster,
        "DeductionReasonMaster":DeductionReasonMaster,
        "ParameterMaster":ParameterMaster,
        "ProcedureMaster":ProcedureMaster,
        "DiseaseMaster":DiseaseMaster,
        "AilmentProcedure":AilmentProcedure,
        "BenefitRulesBuilder":BenefitRulesBuilder,
        
    

        
        
        // limitTypeMaster: () => (
        //     <LimitTypeMaster userId={userId} />
        //   ),
    };
      
    const ActiveComponent = tabComponents[activeTab];

    return (
        <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5" id="masters-view-container">
            <CompactPageHeader
                title="Master Dataset Management"
                badge={{ text: "Benefits Masters", variant: "info" }}
            />

            <div className="shrink-0 overflow-x-auto scroll-smooth bg-slate-50/80 dark:bg-dark-800 rounded-lg p-1 border border-slate-200 dark:border-dark-700">
                <div className="flex gap-1">
                {tabsToBeInclude.map((tab) => {
                    const isActive = activeTab === tab.value;

                    return (
                    <button
                        key={tab.value}
                        onClick={() => {setActiveTab(tab.value);}}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 dark:bg-dark-700 dark:text-dark-200 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 dark:border-dark-600'
                        }`}
                    >
                        <span>{tab.label}</span>
                    </button>
                    );
                })}
                </div>
            </div>

            {/* Main Dataset Card Container */}
            <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800 overflow-hidden">
                {ActiveComponent ? <ActiveComponent /> : <div className="p-4 text-xs text-slate-500">No component found</div>}
            </div>
        </div>
    );
}