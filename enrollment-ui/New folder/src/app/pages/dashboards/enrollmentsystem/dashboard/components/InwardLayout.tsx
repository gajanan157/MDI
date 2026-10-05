import { policySearchApi } from "@/app/api/apiService";
import { useRole } from "@/app/auth/usePermission";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { handleApiError } from "@/app/pages/AdminDepartment/tpabranches/function";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import StepNavigation from "./StepNavigation";
import StepTabs from "./StepTabs";
import BrokerForm from "./forms/BrokerForm";
import CorporateForm from "./forms/CorporateForm";
import { buildPayloadByStep, mapPolicyFamilyRules, policyFamilyDefinitionRules } from "./forms/FamilyRule";
import InsurerForm from "./forms/InsurerForm";
import PolicyForm from "./forms/PolicyForm";
import SpocForm from "./forms/SpocForm";
import { saveAndUpdateEndorsment, saveEnrollment } from "./funcation";
import { InwardFormData, InwardStep, channelSchema, corporateSchema, insurerSchema, policySchema, spocSchema } from "./types";
import { useTranslation } from "react-i18next";

interface Props {
  currentStep: string;
  setCurrentStep: Dispatch<SetStateAction<InwardStep>>;
  onNext: any
  onBack: any
  onClose: any
  inwardNo: any
  currentIndex: number;
  totalSteps: number;
}
const stepSchemas: Record<string, any> = {
  insurer: insurerSchema,
  corporate: corporateSchema,
  broker: channelSchema,
  spoc: spocSchema,
  policy: policySchema,
};

const InwardLayout: React.FC<Props> = ({
  currentStep,
  setCurrentStep,
  currentIndex,
  totalSteps,
  inwardNo
}) => {
  const methods = useForm<InwardFormData>({
    resolver: yupResolver(stepSchemas[currentStep]),
    mode: "onBlur",
    defaultValues: {},
  });
  const { t } = useTranslation()
  useBreadcrumb([
    { title: t("nav.dashboards.enrollmentsystem") },
    { title: t("corporateInward.breadcrumb.dashboard"), path: "/enrolment-system/dashboard" },
    { title: t("corporateInward.pageTitle"), path: "/enrolment-system/corporate-enrolment" },
    ...(inwardNo ? [{ title: inwardNo }] : []),
  ]);

  const params = useParams();

  const url = `/v1/ocr/${params?.id}`;
  const [policyData, setPolicyData] = useState<any>(null);
  const getPolicyData = async () => {
    const result = await fetchUser(policySearchApi, url);
    if (result?.success && result?.data) {
      setPolicyData(result?.data?.data);
    }
  };
  useEffect(() => {
    if (params?.id) {
      getPolicyData();
    }
  }, [params?.id]);
  const renderForm = () => {
    switch (currentStep) {
      case "insurer":
        return <InsurerForm policyData={policyData} />;
      case "corporate":
        return <CorporateForm policyData={policyData} />;
      case "broker":
        return <BrokerForm policyData={policyData} />;
      case "spoc":
        return <SpocForm policyData={policyData} />;
      case "policy":
        return <PolicyForm policyData={policyData} currentStep={currentStep} />;
      default:
        return <div>Form Coming Soon</div>;
    }
  };

  const steps: InwardStep[] = ["insurer", "corporate", "policy", "broker", "spoc"];
  const { isQC, isProcessor } = useRole();
  const navigate = useNavigate()
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const policyNo = searchParams.get("policyNo");

  const [isSubmitting, setIsSubmitting] = useState(false);
  type Status =
    | "PROCESSOR_PENDING"
    | "QC_PENDING"
    | "COMPLETED"
    | "REASSIGNED";

  const resolveStatus = (
    actionType: Status,
    isProcessor: boolean,
    isQC: boolean,
    isLastStep: boolean
  ): Status => {
    if (actionType === "PROCESSOR_PENDING") return "PROCESSOR_PENDING";
    if (actionType === "QC_PENDING") return "QC_PENDING";
    if (actionType === "REASSIGNED") return "REASSIGNED";
    if (actionType === "COMPLETED") return "COMPLETED";

    if (isProcessor) {
      return isLastStep ? "QC_PENDING" : "PROCESSOR_PENDING";
    }

    if (isQC) {
      return isLastStep ? "COMPLETED" : "QC_PENDING";
    }

    return "PROCESSOR_PENDING";
  };
  const handleNext = async (actionType: "PROCESSOR_PENDING" | "COMPLETED" | "QC_PENDING" | "REASSIGNED" = "PROCESSOR_PENDING") => {

    const isValid = await methods.trigger();
    if (!isValid) return;
    setIsSubmitting(true);


    const isLastStep = currentIndex === steps.length - 1;


    const status = resolveStatus(
      actionType,
      isProcessor,
      isQC,
      isLastStep
    );
    try {

      const currentValues = methods.getValues();
      const previousJson = policyData?.policyScheduleJsonb || {};
      const policyObj = policyData?.policyScheduleJsonb?.policyObject || {};
      const dummyPolicyNumber = policyObj?.dummyPolicyNumber;
      const linkDummyNumber = policyObj?.linkDummyNumber;



      const FamilyDefination = mapPolicyFamilyRules(policyFamilyDefinitionRules, currentValues);
      const payload = buildPayloadByStep(currentStep, previousJson, currentValues, FamilyDefination);

      const finalPayload = {
        inwardNo: policyData?.inwardNo,
        status,
        policyProposerType: "CORPORATE",
        policyScheduleJson: payload,
        policyNo: policyNo,
        policyRecordType: policyData?.policyRecordType
      };
      const finalPayload2 = {
        inwardNo: policyData?.inwardNo,
        policyNumber: policyNo,
        status,
        policyScheduleJson: payload,
        policyRecordType: policyData?.policyRecordType

      };

      let response: any;

      if (isQC) {
        response = await saveEnrollment(finalPayload);
      } else if (isProcessor) {
        response = await saveAndUpdateEndorsment(finalPayload2);
      }

      if (response?.success) {
        if (isLastStep) {
          toast.success(response?.data?.message, { position: "top-right", duration: 5000 });
        }

        if (!isLastStep) {
          setCurrentStep(steps[currentIndex + 1]);
          getPolicyData();
          const nextIndex = currentIndex + 1;
          const params = new URLSearchParams(location.search);
          params.set("currentStep", String(nextIndex));
          navigate(`${location.pathname}?${params.toString()}`);

          return;
        }

        if (isQC) {
          const queryParams = new URLSearchParams({
            policyId: response?.data?.data,
            isMemberLoading: "true",
            inwardNo: policyData?.inwardNo,
          });
          if (dummyPolicyNumber && linkDummyNumber) {
            queryParams.set("dummyPolicyNumber", dummyPolicyNumber);
          }
          // navigate(`/enrolment-system/member-data?policyId=${response?.data?.data}&isMemberLoading=true&inwardNo=${policyData?.inwardNo}`);
          navigate(`/enrolment-system/member-data?${queryParams.toString()}`);


        } else {
          navigate("/enrolment-system/corporate-enrolment");
        }
      } else if (response?.status === 409) {
        toast.error(response?.message);
      } else {
        handleApiError(response);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };



  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-xl overflow-hidden flex flex-col h-[90vh]">
        <div className="bg-white border-b shrink-0">
          <StepTabs currentStep={currentStep} policyData={policyData} />
        </div>
        <div className="flex-1 overflow-y-auto px-4  py-2 bg-gray-50">
          {renderForm()}
        </div>
        <div className="bg-white border-t px-4 py-1 shrink-0">
          <StepNavigation
            onNext={handleNext}
            onBack={handleBack}
            currentIndex={currentIndex}
            totalSteps={totalSteps}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </FormProvider>
  );
};
export default InwardLayout;