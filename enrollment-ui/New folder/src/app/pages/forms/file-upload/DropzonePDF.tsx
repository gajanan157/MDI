import { useDropzone } from "react-dropzone";
import { Controller } from "react-hook-form";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";

export const DropzonePDF = ({
  control,
  name,
  maxFiles = 1,
  label = "",
}: any) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: "PDF required" }}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          accept: { "application/pdf": [".pdf"] },
          maxFiles,
          onDrop: (acceptedFiles) => onChange(acceptedFiles),
        });

        return (
          <div>
            <p className="font-semibold">{label}</p>
            <div
              {...getRootProps()}
              className={`mt-2 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 ${
                isDragActive ? "border-primary-500" : "border-gray-300"
              }`}
            >
              <CloudArrowUpIcon className="size-10 text-gray-500" />
              <p className="mt-3 text-sm">Click or drag PDF here</p>
              <input {...getInputProps()} />
            </div>

            {value?.length > 0 && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {value[0]?.name}
              </p>
            )}

            {error && (
              <p className="input-text-error text-error dark:text-error-lighter  text-left text-[10px] text-xsm">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
};
