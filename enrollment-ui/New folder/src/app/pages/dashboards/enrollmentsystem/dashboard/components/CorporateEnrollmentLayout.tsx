


import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { STATUS } from "../corporate/CorporateInward";
import InwardLayout from "./InwardLayout";
import InwardDetailsView from "./InwardDetailsView";
import { InwardStep } from "./types";
import EndorsementView from "./EndorsementView";
import OnboardPendingView from "./OnboardPendingView";
import MemberExel from "./MemberExel";
import EndorsementSummary from "./forms/EndorsementSummary";

const steps: InwardStep[] = [
  "insurer",
  "corporate",
  "policy",
  "broker",
  "spoc",
];

interface Props {
  onClose?: () => void;
}

const CorporateEnrollmentLayout: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status") || "";
  const inwardType = searchParams.get("inwardType") || "";
  const inwardNo = searchParams.get("inwardNo") || "";
  const documentType = searchParams.get("documentType") || "";
  const policyRecordType = searchParams.get("policyRecordType") || "";

  const normalizedStatus = status.toUpperCase();
  const normalizedType = inwardType.toLowerCase();
  const normalizedFileType = documentType.toLowerCase();

  const isExcelFile = normalizedFileType === "member_data"

  const handleClose = onClose ?? (() => navigate(-1));

  const [currentStep, setCurrentStep] = useState<InwardStep>("insurer");

  const currentIndex = steps?.indexOf(currentStep);

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  if (normalizedStatus === STATUS?.COMPLETED && normalizedType === "endorsement") {
    return <EndorsementSummary />;
  }
  if (normalizedStatus === STATUS?.COMPLETED) {
    return <InwardDetailsView />;
  }
  if (normalizedStatus === STATUS?.ONBOARDING_PENDING) {
    return <OnboardPendingView inwardNo={inwardNo} />;
  }
  if (policyRecordType === "DUMMY" && normalizedType === "fresh_enrollment") {
    <InwardLayout
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      onNext={handleNext}
      onBack={handleBack}
      currentIndex={currentIndex}
      onClose={handleClose}
      totalSteps={steps.length}
      inwardNo={inwardNo}
    />
  }
  if (isExcelFile && policyRecordType !== "DUMMY" ) {
    return <MemberExel />;
  }
  if (normalizedType === "endorsement") {
    return <EndorsementView />;
  }
  if (normalizedStatus === STATUS?.PROCESSOR_PENDING && normalizedType === "fresh_enrollment") {
    return (
      <InwardLayout
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onNext={handleNext}
        onBack={handleBack}
        currentIndex={currentIndex}
        onClose={handleClose}
        totalSteps={steps.length}
        inwardNo={inwardNo}
      />
    );
  }

  return (
    <InwardLayout
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      onNext={handleNext}
      onBack={handleBack}
      currentIndex={currentIndex}
      onClose={handleClose}
      inwardNo={inwardNo}
      totalSteps={steps.length}
    />
  );
};

export default CorporateEnrollmentLayout;