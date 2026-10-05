import { Button } from "@/components/ui";
import { PROVIDER_FORM_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { ProviderTabLoadingState } from "../shared/ProviderTabLoadingState";
import { StatusEditVerifyBar } from "../shared/StatusEditVerifyBar";

type ViewHospitalDetailPlaceholderProps = {
  providerBarSection: React.ReactNode;
  placeholderBarStatus: string;
  placeholderBarIcs: string[];
  canWrite: boolean;
  networkDetailVerifyDisabled: boolean;
  networkDetailVerifyDisabledTitle: string;
  detailLoading: boolean;
  isNetworkRoute: boolean;
  detailLoadError: string | null;
  onBackToList: () => void;
};

export function ViewHospitalDetailPlaceholder({
  providerBarSection,
  placeholderBarStatus,
  placeholderBarIcs,
  canWrite,
  networkDetailVerifyDisabled,
  networkDetailVerifyDisabledTitle,
  detailLoading,
  isNetworkRoute,
  detailLoadError,
  onBackToList,
}: Readonly<ViewHospitalDetailPlaceholderProps>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 bg-slate-200/40 p-1.5">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={placeholderBarStatus}
        blacklistedByIcs={placeholderBarIcs}
        canWrite={canWrite}
        isEditMode={false}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
        onVerify={() => {}}
        editDisabled
        editDisabledTitle="Load provider details before editing."
        verifyDisabled={networkDetailVerifyDisabled}
        verifyDisabledTitle={networkDetailVerifyDisabledTitle}
      />
      {detailLoading && isNetworkRoute ? (
        <ProviderTabLoadingState />
      ) : (
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-gray-700">{detailLoadError?.trim() || "Hospital not found."}</p>
          <Button
            type="button"
            variant="outlined"
            className={`mt-4 ${PROVIDER_FORM_BUTTON_CLASS}`}
            onClick={onBackToList}
          >
            Back to list
          </Button>
        </div>
      )}
    </div>
  );
}
