import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Textarea } from "@/components/ui";
import { PROVIDER_FORM_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import type { ItemWithIdName } from "../types";
import { UnmapSupportingDocumentField } from "../restriction/Fields";

type MappingViewDialogProps = {
  mappingSubTab: "ic" | "corporate";
  mappingViewItem: ItemWithIdName | null;
  onClose: () => void;
};

export function MappingViewDialog({
  mappingSubTab,
  mappingViewItem,
  onClose,
}: Readonly<MappingViewDialogProps>) {
  return (
    <Transition show={!!mappingViewItem}>
      <Dialog className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Details</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {mappingViewItem ? (
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500">
                      {mappingSubTab === "ic" ? "Insurance Company Name" : "Corporate Name"}
                    </dt>
                    <dd className="font-medium text-gray-900">{mappingViewItem.name}</dd>
                  </div>
                  {mappingViewItem.insuranceCompanyName != null &&
                  mappingViewItem.insuranceCompanyName !== "" ? (
                    <div>
                      <dt className="text-xs text-gray-500">Insurance Company Name</dt>
                      <dd className="font-medium text-gray-900">
                        {mappingViewItem.insuranceCompanyName}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-xs text-gray-500">ID</dt>
                    <dd className="font-mono text-gray-700">{mappingViewItem.id}</dd>
                  </div>
                </dl>
              ) : null}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

type MappingUnmapDialogProps = {
  open: boolean;
  providerId?: string;
  mappingSubTab: "ic" | "corporate";
  unmapDialogItem: ItemWithIdName | null;
  unmapEffectiveFrom: string;
  setUnmapEffectiveFrom: (value: string) => void;
  unmapEffectiveFromError?: string;
  unmapRemark: string;
  setUnmapRemark: (value: string) => void;
  unmapRemarkError?: string;
  unmapSupportingFileName: string;
  setUnmapSupportingFileMetadataId: (
    fileMetadataId: string,
    fileName: string,
    inwardNo?: string,
  ) => void;
  clearUnmapSupportingDocument: () => void;
  unmapSupportingDocumentError?: string;
  onClearUnmapSupportingDocumentError?: () => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
};

export function MappingUnmapDialog({
  open,
  providerId,
  mappingSubTab,
  unmapDialogItem,
  unmapEffectiveFrom,
  setUnmapEffectiveFrom,
  unmapEffectiveFromError,
  unmapRemark,
  setUnmapRemark,
  unmapRemarkError,
  unmapSupportingFileName,
  setUnmapSupportingFileMetadataId,
  clearUnmapSupportingDocument,
  unmapSupportingDocumentError,
  onClearUnmapSupportingDocumentError,
  saving,
  onClose,
  onSave,
}: Readonly<MappingUnmapDialogProps>) {
  const partyLabel = mappingSubTab === "ic" ? "Insurance Company" : "Corporate";
  const canSave =
    Boolean(unmapEffectiveFrom.trim()) &&
    Boolean(unmapRemark.trim()) &&
    Boolean(unmapSupportingFileName.trim());

  return (
    <Transition show={open}>
      <Dialog className="relative z-50" onClose={saving ? () => undefined : onClose}>
        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto w-full max-w-md overflow-visible rounded-xl bg-white shadow-xl ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h3 className="text-base font-semibold text-gray-900">De-Empanel</h3>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 px-4 py-3">
                {unmapDialogItem ? (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs text-gray-800">
                    <span className="font-medium text-gray-700">{partyLabel}:</span>{" "}
                    <span className="font-semibold text-blue-800">{unmapDialogItem.name}</span>
                  </div>
                ) : null}

                <ProviderDatePicker
                  label="Effective from"
                  value={unmapEffectiveFrom}
                  onChange={(e) => setUnmapEffectiveFrom(e.target.value)}
                  disabled={saving}
                  isRequired
                  error={unmapEffectiveFromError || undefined}
                  className="h-8 w-full text-xs"
                  disablePortal
                />

                <Textarea
                  label="Remark"
                  value={unmapRemark}
                  onChange={(e) => setUnmapRemark(e.target.value)}
                  placeholder="Enter remarks"
                  rows={2}
                  disabled={saving}
                  isRequired
                  error={unmapRemarkError || undefined}
                  className="w-full text-xs"
                />

                <UnmapSupportingDocumentField
                  providerId={providerId}
                  fileName={unmapSupportingFileName}
                  disabled={saving}
                  isRequired
                  error={unmapSupportingDocumentError}
                  onErrorClear={onClearUnmapSupportingDocumentError}
                  onFileMetadataIdChange={setUnmapSupportingFileMetadataId}
                  onClear={clearUnmapSupportingDocument}
                />
              </div>

              <div className="flex justify-end gap-1.5 border-t border-gray-100 px-4 py-3">
                <Button
                  type="button"
                  variant="outlined"
                  className={PROVIDER_FORM_BUTTON_CLASS}
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="filled"
                  className={`${PROVIDER_FORM_BUTTON_CLASS} bg-green-600 text-white hover:bg-green-700 disabled:opacity-60`}
                  onClick={onSave}
                  disabled={saving || !canSave}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
