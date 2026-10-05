import { EyeIcon, LinkIcon, Squares2X2Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";

type CorporateProviderListHeaderProps = {
  mapAllDoneCorporate: boolean;
  providerListCardVisibleCorporate: boolean;
  setProviderListCardVisibleCorporate: (value: boolean | ((prev: boolean) => boolean)) => void;
  openMapAllConfirmPopup: (tab: "corporate") => void;
};

export function CorporateProviderListHeader({
  mapAllDoneCorporate,
  providerListCardVisibleCorporate,
  setProviderListCardVisibleCorporate,
  openMapAllConfirmPopup,
}: Readonly<CorporateProviderListHeaderProps>) {
  const toggleLabel = providerListCardVisibleCorporate ? "Hide provider list" : "Show provider list";

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-gray-200 pb-1">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
          <Squares2X2Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Provider list</h2>
        </div>
        {mapAllDoneCorporate ? (
          <button
            type="button"
            className="ml-1 rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            onClick={() => setProviderListCardVisibleCorporate((visible) => !visible)}
            title={toggleLabel}
            aria-label={toggleLabel}
          >
            {providerListCardVisibleCorporate ? (
              <XMarkIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>
      {!mapAllDoneCorporate ? (
        <Button
          type="button"
          variant="filled"
          color="primary"
          disabled={false}
          className="shrink-0 gap-1 rounded-lg px-2 py-1 text-sm font-medium"
          onClick={() => openMapAllConfirmPopup("corporate")}
        >
          <LinkIcon className="h-4 w-4" />
          Map all
        </Button>
      ) : null}
    </div>
  );
}
