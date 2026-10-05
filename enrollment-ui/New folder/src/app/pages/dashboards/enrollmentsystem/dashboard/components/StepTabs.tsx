import {
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  DocumentTextIcon,
  FolderIcon,
  IdentificationIcon,
  UserGroupIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import React from "react";
import DocumentDropdown from "../corporate/DocumentDropdown";
import { useTranslation } from "react-i18next";

interface Props {
  currentStep: string;
  policyData: any;
}
const StepTabs: React.FC<Props> = ({ currentStep, policyData }) => {
  const inwardNo = policyData?.inwardNo
  const { t } = useTranslation()

  const steps = [
    { key: "insurer", label: t("enrollmentSteps.insurer"), icons: [BuildingOfficeIcon, DocumentTextIcon] },
    { key: "corporate", label: t("enrollmentSteps.corporate"), icons: [UserGroupIcon, FolderIcon] },
    { key: "policy", label: t("enrollmentSteps.policy"), icons: [DocumentIcon, ClipboardDocumentIcon] },
    { key: "broker", label: t("enrollmentSteps.intermediatory"), icons: [UserIcon, DocumentDuplicateIcon] },
    { key: "spoc", label: t("enrollmentSteps.tpaSpoc"), icons: [UserIcon, IdentificationIcon] },
  ];
  return (
    <div className="flex flex-wrap gap-3 px-4 py-2 border-b bg-gray-100">
      {steps?.map(({ key, label, icons }) => {
        const Icon1 = icons[0];
        return (
          <button
            key={key}
            className={`flex items-center gap-1 px-4 py-2 text-xs rounded-lg  font-medium transition
               ${currentStep === key
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600"
              }`}
          >
            <Icon1 className="w-5 h-5" />
            {label}
          </button>
        );
      })}
      <DocumentDropdown
        inwardNo={inwardNo}
      />
    </div>
  );
};
export default StepTabs;