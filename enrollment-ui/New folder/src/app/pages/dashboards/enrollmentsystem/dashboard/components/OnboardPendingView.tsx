

import { useAppSelector } from "@/store/hooks/useAppSelector";
import { BuildingOfficeIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useState } from "react";
import AddInsurerForm from "../../../insurerManagement/insurer/AddInsurerForm";
import AddAgentForm from "../../agent/form";
import AddBrokerForm from "../../broker/form";
import AddCorporateForm from "../../corporate/form";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchOnBoardPendingData } from "@/store/features/Broker/BrokerSlice";
import { AddNewPolicyModalOrPolicy } from "../../../mbmmanagement/master-product/form";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

type StepKey = "insurer" | "corporate" | "broker" | "agent" | "product";
interface Props {
  inwardNo: string
}
const OnboardPendingView: React.FC<Props> = ({ inwardNo }) => {
  const { onBoardingData } = useAppSelector((state) => state.broker);
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const policyNo = searchParams.get("policyNo");

  useEffect(() => {
    dispatch(fetchOnBoardPendingData({ inwardNo: inwardNo, policyNo: policyNo }))
  }, [])

  const mapTypeToStep = (text: string): StepKey | null => {
    const value = text?.toUpperCase();
    if (value.includes("CORPORATE")) return "corporate";
    if (value.includes("BROKER")) return "broker";
    if (value.includes("AGENT")) return "agent";
    if (value.includes("IC")) return "insurer";
    if (value.includes("PRODUCT")) return "product";
    return null;
  };

  useBreadcrumb([
    { title: t("nav.dashboards.enrollmentsystem") },
    { title: t("corporateInward.breadcrumb.dashboard"), path: "/enrolment-system/dashboard" },
    { title: t("corporateInward.breadcrumb.corporateInward"), path: "/enrolment-system/corporate-enrolment" },
    { title: t("corporateInward.cards.masterUpdatePending") },
  ]);

  const dynamicSteps = useMemo(() => {
    return onBoardingData
      .map((item: any) => {
        const stepKey = mapTypeToStep(item?.onboardingPendingFor);

        if (!stepKey) return null;

        return {
          key: stepKey,
          label: stepKey === "insurer" ? "Insurer" : stepKey.charAt(0).toUpperCase() + stepKey.slice(1),
          icon: stepKey === "insurer" ? BuildingOfficeIcon : stepKey === "corporate" ? UserGroupIcon : UserIcon,
          data: item,
        };
      })
      .filter(Boolean) as {
        key: StepKey;
        label: string;
        icon: any;
        data: any;
      }[];
  }, [onBoardingData]);

  useEffect(() => {
    if (dynamicSteps?.length > 0) {
      setCurrentStep(dynamicSteps[0].key);
    }
  }, [dynamicSteps]);

  const [currentStep, setCurrentStep] = useState<StepKey>(dynamicSteps[0]?.key || "insurer");

  // ✅ Get current data
  const currentData = dynamicSteps?.find((step) => step.key === currentStep)?.data;

  const handleStepSubmit = () => {
    const currentIndex = dynamicSteps.findIndex(
      (step) => step.key === currentStep
    );

    const isLastStep = currentIndex === dynamicSteps.length - 1;

    if (!isLastStep) {
      const nextStep = dynamicSteps[currentIndex + 1];
      setCurrentStep(nextStep.key);
    }
  };

  const renderForm = () => {
    if (!currentData) return null;
    const currentIndex = dynamicSteps.findIndex(
      (step) => step.key === currentStep
    );

    const isMultiStep = dynamicSteps.length > 1 && currentIndex !== dynamicSteps.length - 1;

    const commonProps = {
      data: currentData,
      isBoarding: true,
      inwardNo,
      onSuccess: handleStepSubmit,
      isMultiStep,
    };


    switch (currentStep) {
      case "insurer":
        return <AddInsurerForm {...commonProps} />;
      case "corporate":
        return <AddCorporateForm {...commonProps} />;
      case "broker":
        return <AddBrokerForm {...commonProps} />;
      case "agent":
        return <AddAgentForm {...commonProps} />;
      case "product":
        return <AddNewPolicyModalOrPolicy {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap  p-2 border-b bg-gray-100 gap-2">
        {dynamicSteps?.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCurrentStep(key)}
            className={`cursor-pointer flex items-center gap-1 px-4 py-2 text-xs rounded-lg font-medium transition ${currentStep === key ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-gray-200"}`}>
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
      <div className="p-1">{renderForm()}</div>
    </div>
  );
};
export default OnboardPendingView;