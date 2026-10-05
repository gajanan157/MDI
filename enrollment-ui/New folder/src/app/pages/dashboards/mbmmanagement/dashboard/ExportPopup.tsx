import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { tableData } from "./sampleData1";


type ExportFormValues = {
  branchCode: string;
  startDate: string;
  endDate: string;
};

const ExportPopup = () => {
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExportFormValues>();
  useEffect(() => {
    reset(undefined);
  }, [open, reset]);
  const onSubmit = (_data: ExportFormValues) => {
    setOpen(false);
  };

  const branchList = tableData?.map((i: any) => ({
      value: i.branchName,
      label: i?.branchName,
    }));

  return (
    <>
      {/* Export Icon Button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 text-xs px-4 py-2 text-white hover:bg-blue-700 flex items-center cursor-pointer gap-2 mt-1"
        title="Export"
      >
        <ArrowUpTrayIcon className="h-4 w-4 text-white" />
        <span>Export</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Export Data</h2>
              <button onClick={() => setOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DropdownSelect
                label="Branch"
                name_key="branchCode"
                defaultValue="Select Branch"
                options={branchList}
                control={control}
                rules={{ required: "Branch is required" }}
                name="branchCode"
                errors={errors.branchCode}
                formClassName="mb-3"
                isRequired
                className="h-[38px] rounded-[10px]"
              />
              <div className="mt-4">
              <Input
                isRequired
                label="Start Date"
                type="date"
                {...register("startDate", {
                  required: "Start date is required",
                })}
                error={errors?.startDate?.message}
                disabled={isSubmitting}
                className="h-[38px] rounded-[10px]"
              />
              </div>
              <div className="mt-4">
              <Input
                isRequired
                label="End Date"
                type="date"
                {...register("endDate", {
                  required: "End date is required",
                })}
                error={errors?.endDate?.message}
                disabled={isSubmitting}
                className="h-[38px] rounded-[10px]"
              />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Export
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportPopup;
