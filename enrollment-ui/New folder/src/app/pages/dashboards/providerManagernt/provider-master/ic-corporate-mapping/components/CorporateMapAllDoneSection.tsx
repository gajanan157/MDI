import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CorporateSocDiscountDocumentPanel } from "./CorporateSocDiscountDocumentPanel";
import { formatProviderCountLabel, type ProviderNameRow } from "./mappedCorporateTabHelpers";

type CorporateMapAllDoneSectionProps = {
  providerListCardVisibleCorporate: boolean;
  providerListExpandedCorporate: boolean;
  setProviderListExpandedCorporate: (value: boolean) => void;
  alreadyMapped: ProviderNameRow[];
  providerListLimit: number;
  setSeeMoreDialog: (payload: {
    title: string;
    items: ProviderNameRow[];
    cardKey: string;
    tab: "corporate";
  }) => void;
  seeMoreLabel: (count: number) => string;
  control: unknown;
  socUploadedCorporate: boolean;
  socFileCorporate: File | null;
  setSocFileCorporate: (file: File | null) => void;
  handleSocUploadCorporate: () => void;
  socAppliedCorporate: boolean;
  socEffectiveFromCorporate: string;
  setSocEffectiveFromCorporate: (value: string) => void;
  socEffectiveToCorporate: string;
  setSocEffectiveToCorporate: (value: string) => void;
  setSocAppliedCorporate: (value: boolean) => void;
  discountUploadedCorporate: boolean;
  discountFileCorporate: File | null;
  setDiscountFileCorporate: (file: File | null) => void;
  handleDiscountUploadCorporate: () => void;
  discountTypeCorporate: string;
  selectedIcId: string;
  selectedCorporateId: string;
};

export function CorporateMapAllDoneSection({
  providerListCardVisibleCorporate,
  providerListExpandedCorporate,
  setProviderListExpandedCorporate,
  alreadyMapped,
  providerListLimit,
  setSeeMoreDialog,
  seeMoreLabel,
  control,
  socUploadedCorporate,
  socFileCorporate,
  setSocFileCorporate,
  handleSocUploadCorporate,
  socAppliedCorporate,
  socEffectiveFromCorporate,
  setSocEffectiveFromCorporate,
  socEffectiveToCorporate,
  setSocEffectiveToCorporate,
  setSocAppliedCorporate,
  discountUploadedCorporate,
  discountFileCorporate,
  setDiscountFileCorporate,
  handleDiscountUploadCorporate,
  discountTypeCorporate,
  selectedIcId,
  selectedCorporateId,
}: Readonly<CorporateMapAllDoneSectionProps>) {
  return (
    <div className="space-y-2">
      {providerListCardVisibleCorporate ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50/50">
          <div className="flex w-full items-center justify-between gap-2 px-3 py-2.5">
            <span className="text-sm font-semibold text-gray-800">
              Provider list — {formatProviderCountLabel(alreadyMapped.length)}
            </span>
            {providerListExpandedCorporate ? (
              <button
                type="button"
                className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                onClick={() => setProviderListExpandedCorporate(false)}
                title="Close list"
                aria-label="Close provider list"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                onClick={() => setProviderListExpandedCorporate(true)}
                title="View provider list"
                aria-label="View provider list"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {providerListExpandedCorporate ? (
            <div className="border-t border-gray-200 p-3">
              <div className="min-h-[160px]">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-gray-200">
                    {alreadyMapped.slice(0, providerListLimit).map((row) => (
                      <tr key={row.id} className="bg-white">
                        <td className="px-2 py-1.5 font-medium text-gray-900">{row.name}</td>
                      </tr>
                    ))}
                    {alreadyMapped.length === 0 ? (
                      <tr>
                        <td className="px-2 py-3 text-center text-gray-500">No providers</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                {alreadyMapped.length > providerListLimit ? (
                  <button
                    type="button"
                    className="mt-1.5 text-[11px] font-medium text-primary-600 hover:text-primary-700 hover:underline"
                    onClick={() =>
                      setSeeMoreDialog({
                        title: "Already Mapped",
                        items: alreadyMapped,
                        cardKey: "alreadyMapped",
                        tab: "corporate",
                      })
                    }
                  >
                    {seeMoreLabel(alreadyMapped.length)}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        <CorporateSocDiscountDocumentPanel
          variant="compact"
          control={control}
          socUploadedCorporate={socUploadedCorporate}
          socFileCorporate={socFileCorporate}
          setSocFileCorporate={setSocFileCorporate}
          handleSocUploadCorporate={handleSocUploadCorporate}
          socAppliedCorporate={socAppliedCorporate}
          socEffectiveFromCorporate={socEffectiveFromCorporate}
          setSocEffectiveFromCorporate={setSocEffectiveFromCorporate}
          socEffectiveToCorporate={socEffectiveToCorporate}
          setSocEffectiveToCorporate={setSocEffectiveToCorporate}
          setSocAppliedCorporate={setSocAppliedCorporate}
          discountUploadedCorporate={discountUploadedCorporate}
          discountFileCorporate={discountFileCorporate}
          setDiscountFileCorporate={setDiscountFileCorporate}
          handleDiscountUploadCorporate={handleDiscountUploadCorporate}
          discountTypeCorporate={discountTypeCorporate}
          selectedIcId={selectedIcId}
          selectedCorporateId={selectedCorporateId}
        />
      </div>
    </div>
  );
}
