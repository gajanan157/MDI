import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { LoadingState } from "@/components/shared/LoadingState";

type CorporateHospitalUploadPanelProps = {
  mode: "hidden" | "upload" | "validate";
  uploadedFileCorporate: File | null;
  setUploadedFileCorporate: (file: File | null) => void;
  handleUpload: () => void;
  validating: boolean;
  handleValidate: () => void;
};

export function CorporateHospitalUploadPanel({
  mode,
  uploadedFileCorporate,
  setUploadedFileCorporate,
  handleUpload,
  validating,
  handleValidate,
}: Readonly<CorporateHospitalUploadPanelProps>) {
  if (mode === "hidden") return null;

  if (mode === "upload") {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <label className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/80 px-3 py-2 transition-all hover:border-primary-400 hover:bg-primary-50/30 hover:shadow-inner">
          <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Drag file here or click to upload</span>
          <span className="text-xs text-gray-500">.pdf, .xls, .xlsx (max 10MB)</span>
          <input
            type="file"
            accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(event) => setUploadedFileCorporate(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className="flex flex-col gap-3 sm:justify-center">
          {uploadedFileCorporate ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="truncate text-xs text-gray-800" title={uploadedFileCorporate.name}>
                {uploadedFileCorporate.name}
              </p>
              <p className="text-xs text-gray-500">{(uploadedFileCorporate.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : null}
          <Button type="button" color="primary" onClick={handleUpload} disabled={!uploadedFileCorporate} className="shrink-0">
            Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {validating ? (
        <LoadingState
          message="Validating..."
          subMessage="Please wait"
          className="min-h-[140px] rounded-lg border border-gray-200 bg-gray-50/50"
        />
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/80 px-2 py-1.5">
            <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">Upload successful</p>
              <p className="text-xs text-green-700/80">
                File processed. Validate to classify providers into lists.
              </p>
            </div>
          </div>
          <Button type="button" color="primary" onClick={handleValidate} className="w-full gap-2 sm:w-auto">
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
            Validate
          </Button>
        </>
      )}
    </div>
  );
}
