import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  AgGridSuperWrapper,
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
  PROVIDER_OVERLAY_Z_INDEX_CLASS,
} from "../../../shared/providerShell";
import type { ProviderNameRow } from "./mappedCorporateTabHelpers";

const SEE_MORE_GRID_COLUMNS = [
  { field: "name", headerName: "Provider Name", flex: 1, minWidth: 200 },
];

type SeeMoreDialogData = {
  title: string;
  items: ProviderNameRow[];
} | null;

type SeeMoreProvidersDialogProps = {
  seeMoreDialog: SeeMoreDialogData;
  onClose: () => void;
};

export default function SeeMoreProvidersDialog({
  seeMoreDialog,
  onClose,
}: Readonly<SeeMoreProvidersDialogProps>) {
  return (
    <Transition
      appear
      show={!!seeMoreDialog}
      as={Dialog}
      className={`fixed inset-0 ${PROVIDER_OVERLAY_Z_INDEX_CLASS} flex items-center justify-center overflow-hidden px-4 py-6`}
      onClose={onClose}
    >
      <TransitionChild
        as="div"
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="absolute inset-0 bg-gray-900/50 transition-opacity"
      />
      <TransitionChild
        as={DialogPanel}
        enter="ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        {seeMoreDialog && (
          <>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900">
                  {seeMoreDialog.title}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  {seeMoreDialog.items.length} provider(s)
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
              <AgGridSuperWrapper
                rowData={seeMoreDialog.items}
                columnDefs={SEE_MORE_GRID_COLUMNS}
                pagination={true}
                pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
                pageSizeOptions={[5, 10, 20, 50]}
                domLayout="autoHeight"
              />
            </div>
          </>
        )}
      </TransitionChild>
    </Transition>
  );
}
