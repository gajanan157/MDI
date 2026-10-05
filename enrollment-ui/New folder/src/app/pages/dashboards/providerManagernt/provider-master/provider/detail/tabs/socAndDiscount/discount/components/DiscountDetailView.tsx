import { StatusEditVerifyBar } from "../../../../shared/StatusEditVerifyBar";
import type { SocStatusBarConfig } from "../../soc/utils/socHelpers";
import type { UseFormReturn } from "react-hook-form";
import type { AgreementListRow } from "../../../agreement/utils/agreementHelpers";
import type { DiscountFormValues, DiscountComponentRow, DiscountDetailRecord } from "../types/discountTypes";
import type { DiscountAgreementOption } from "../hooks/useDiscountFormOptions";
import { DiscountTabContent } from "./DiscountTabContent";

type DiscountDetailViewProps = {
  providerBarSection: React.ReactNode;
  statusBarConfig: SocStatusBarConfig;
  isViewMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveDisabledTitle?: string;
  saving?: boolean;
  form: UseFormReturn<DiscountFormValues>;
  setOpdPercentByKey: (
    v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  setIpdPercentByKey: (
    v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  componentDiscounts: DiscountComponentRow[];
  setComponentDiscounts: (
    v: DiscountComponentRow[] | ((prev: DiscountComponentRow[]) => DiscountComponentRow[]),
  ) => void;
  supportingDocumentFile: File | null;
  setSupportingDocumentFile: (file: File | null) => void;
  onSupportingDocumentUploaded?: (payload: {
    file: File;
    supportingFileMetadataId: string;
    supportingDocumentName: string;
  }) => void | Promise<void>;
  agreementOptions: DiscountAgreementOption[];
  socOptions?: { value: string; label: string }[];
  agreementRowsById: Map<string, AgreementListRow>;
  fallbackInsurerOptions?: { value: string; label: string }[];
  corporateOptions: { value: string; label: string }[];
  optionsByInsurerId: Record<string, { value: string; label: string }[]>;
  selectedDetail?: DiscountDetailRecord | null;
  providerId?: string;
};

export function DiscountDetailView({
  providerBarSection,
  statusBarConfig,
  isViewMode,
  onEdit,
  onCancel,
  onSave,
  saveDisabled = false,
  saveDisabledTitle,
  saving = false,
  form,
  setOpdPercentByKey,
  setIpdPercentByKey,
  componentDiscounts,
  setComponentDiscounts,
  supportingDocumentFile,
  setSupportingDocumentFile,
  onSupportingDocumentUploaded,
  agreementOptions,
  socOptions = [],
  agreementRowsById,
  fallbackInsurerOptions = [],
  corporateOptions,
  optionsByInsurerId,
  selectedDetail = null,
  providerId,
}: Readonly<DiscountDetailViewProps>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden p-0.5">
      <div className="shrink-0">
        {providerBarSection}
      </div>
      <div className="shrink-0">
        <StatusEditVerifyBar
          providerStatus={statusBarConfig.providerStatus}
          blacklistedByIcs={statusBarConfig.blacklistedByIcs}
          canWrite={statusBarConfig.canWrite}
          canVerify={statusBarConfig.canVerify}
          isEditMode={!isViewMode}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          saveDisabled={saveDisabled}
          saveDisabledTitle={saveDisabledTitle}
          saving={saving}
          showCancelInViewMode
          verifyDisabled={statusBarConfig.verifyDisabled}
          verifyDisabledTitle={statusBarConfig.verifyDisabledTitle}
          auditLog={statusBarConfig.auditLog}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-1">
        <DiscountTabContent
          isViewMode={isViewMode}
          providerId={providerId}
          form={form}
          setOpdPercentByKey={setOpdPercentByKey}
          setIpdPercentByKey={setIpdPercentByKey}
          componentDiscounts={componentDiscounts}
          setComponentDiscounts={setComponentDiscounts}
          supportingDocumentFile={supportingDocumentFile}
          setSupportingDocumentFile={setSupportingDocumentFile}
          onSupportingDocumentUploaded={onSupportingDocumentUploaded}
          agreementOptions={agreementOptions}
          socOptions={socOptions}
          agreementRowsById={agreementRowsById}
          fallbackInsurerOptions={fallbackInsurerOptions}
          corporateOptions={corporateOptions}
          optionsByInsurerId={optionsByInsurerId}
          selectedDetail={selectedDetail}
        />
      </div>
    </div>
  );
}
