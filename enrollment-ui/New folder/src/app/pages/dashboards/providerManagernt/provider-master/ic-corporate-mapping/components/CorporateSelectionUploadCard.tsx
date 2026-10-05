import { useEffect, useMemo } from "react";
import {
  BuildingOffice2Icon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { fetchCorporateDatas } from "@/store/features/Broker/BrokerSlice";
import { resolveHospitalUploadPanelMode } from "./mappedCorporateTabHelpers";
import { CorporateHospitalUploadPanel } from "./CorporateHospitalUploadPanel";

type CorporateSelectionUploadCardProps = {
  control: unknown;
  selectedIcId: string;
  hasSelection: boolean;
  validatedCorporate: boolean;
  fileAppliedCorporate: boolean;
  uploadedFileCorporate: File | null;
  setUploadedFileCorporate: (file: File | null) => void;
  handleUpload: () => void;
  validating: boolean;
  handleValidate: () => void;
};

export function CorporateSelectionUploadCard({
  control,
  selectedIcId,
  hasSelection,
  validatedCorporate,
  fileAppliedCorporate,
  uploadedFileCorporate,
  setUploadedFileCorporate,
  handleUpload,
  validating,
  handleValidate,
}: Readonly<CorporateSelectionUploadCardProps>) {
  const dispatch = useAppDispatch();
  const insurerList = useAppSelector((state) => state.insurerList.insurerList);
  const { corporateData } = useAppSelector((state) => state.broker);

  useEffect(() => {
    if ((insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, insurerList]);

  useEffect(() => {
    if ((corporateData?.length ?? 0) > 0) return;
    dispatch(fetchCorporateDatas({ onlyName: true, page: 0, size: 20 }));
  }, [dispatch, corporateData]);

  const icOptions = useMemo(
    () =>
      (insurerList ?? []).map((insurer) => ({
        value: insurer.insurerId,
        label: insurer.insurerName,
      })),
    [insurerList],
  );

  const corporateOptions = useMemo(
    () =>
      (corporateData ?? []).map((corporate) => ({
        value: corporate.corporateId,
        label: corporate.corporateName,
      })),
    [corporateData],
  );

  const uploadPanelMode = resolveHospitalUploadPanelMode(
    hasSelection,
    validatedCorporate,
    fileAppliedCorporate,
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm ring-1 ring-gray-200/50">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-start">
        <div className="md:max-w-sm">
          <div className="mb-1 flex items-center gap-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
              <BuildingOffice2Icon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Select Corporate</h4>
            </div>
          </div>
          <div className="space-y-3">
            <DropdownSelect
              name="selectedIc"
              control={control}
              options={icOptions}
              label="Insurance Company"
              defaultValue="IC"
            />
            <DropdownSelect
              name="selectedCorporate"
              control={control}
              options={corporateOptions}
              label="Corporate"
              defaultValue="Corporate"
              disabled={!selectedIcId}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {uploadPanelMode !== "hidden" ? (
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <DocumentArrowUpIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-900">Upload Hospital List</h2>
                  <p className="text-[11px] text-gray-500">PDF or Excel with hospital names or codes</p>
                </div>
              </div>
            </div>
          ) : null}

          <CorporateHospitalUploadPanel
            mode={uploadPanelMode}
            uploadedFileCorporate={uploadedFileCorporate}
            setUploadedFileCorporate={setUploadedFileCorporate}
            handleUpload={handleUpload}
            validating={validating}
            handleValidate={handleValidate}
          />
        </div>
      </div>
    </div>
  );
}
