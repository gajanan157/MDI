import { useForm } from "react-hook-form";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Button, Input } from "@/components/ui";

interface FormValues {
  status: string;
  officeName: string;
  officeType: string;
  insurerName: string;
}

const statusOptions = [
  { value: "", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Mark for archival", label: "Mark for archival" },
];

const officeTypes = [
  { value: "", label: "All Types" },
  { value: "HO", label: "Head Office" },
  { value: "RO", label: "Regional Office" },
  { value: "DO", label: "Divisional Office" },
  { value: "UO", label: "Underwriting Office" },
  { value: "OTHER", label: "Other" },
];

export function OfficeSearch({ onSearch, onReset }: any) {
  const { register, handleSubmit, reset, control } = useForm<FormValues>({
    defaultValues: {
      status: "",
      officeName: "",
      officeType: "",
      insurerName: "",
    },
  });

  const submit = (data: FormValues) => {
    onSearch(data);
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <div className="rounded-2xl h-[170px] bg-linear-to-b from-white to-slate-50 shadow-sm ring-1 ring-gray-100 p-5">
      <form onSubmit={handleSubmit(submit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          
            <Input
              label="Insurance Company"
              {...register("insurerName")}
              type="text"
              placeholder="Enter company name"
            />

           <Input
              label="Office Name"
              {...register("officeName")}
              type="text"
              placeholder="Enter office name"
            />

          
            <DropdownSelect
              name="officeType"
              label="Office Type"
              name_key="officeType"
              options={officeTypes}
              control={control}
              defaultValue="Select type"
            />

            <DropdownSelect
              name="status"
              label="Status"
              name_key="status"
              options={statusOptions}
              control={control}
              defaultValue="Select status"
            />
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Reset
          </Button>
          <Button
            type="submit"
            color="primary"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
}
