import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { DropzonePDF } from "@/app/pages/forms/file-upload/DropzonePDF";
import { yupResolver } from "@hookform/resolvers/yup";
import { policySchema } from "./schema";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useEffect } from "react";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";

export interface FormValues {
  policyNumber: string;
    icName: string;
  clientName: string;
  insurer: string;
  numberOfLives: number;
  sumInsured: string;
  premiumAmount: string;
  policyStart: string;
  policyEnd: string;
  priority: string;
  receivedDate: string | null | undefined;
  policyType: string;
  documents: File[] | undefined;
}

interface AddPolicyModalProps {
  initialValues?: Partial<FormValues>;
  insurers: { label: string; value: string }[];
  priorities: { label: string; value: string }[];
  policyTypes: { label: string; value: string }[];
  onClose: () => void;
}

export const AddPolicyModal = ({
  initialValues = {},
  priorities,
  policyTypes,
  onClose,
}: AddPolicyModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(policySchema) as Resolver<any>,
    defaultValues: {
      policyNumber: initialValues.policyNumber ?? "",
      icName: initialValues.policyNumber ?? "",
      clientName: initialValues.clientName ?? "",
      insurer: initialValues.insurer ?? "",
      numberOfLives: initialValues.numberOfLives ?? undefined,
      sumInsured: initialValues.sumInsured ?? "",
      premiumAmount: initialValues.premiumAmount ?? "",
      policyStart: initialValues.policyStart ?? "",
      policyEnd: initialValues.policyEnd ?? "",
      priority: initialValues.priority ?? "",
      receivedDate: initialValues.receivedDate ?? "",
      policyType: initialValues.policyType ?? "",
      documents: initialValues.documents ?? [],
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (_data) => {
  };

    const dispatch = useAppDispatch();
  
      const { insurerMainList } = useAppSelector((state) => state.insurer);
  
      useEffect(() => {
        dispatch(fetchInsurers({ size: "200" }));
      }, [dispatch]);
      // Log when insurerOfficeList changes (dummy data loaded)
      const insurerListNew = insurerMainList?.map((i: any) => ({
        value: i?.id,
        label: i?.name,
      }));

      const policyStart = watch("policyStart");


useEffect(() => {
  if (policyStart) {
    const startDate = new Date(policyStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 365);
    const formattedEndDate = endDate.toISOString().split("T")[0];
    setValue("policyEnd", formattedEndDate, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }
}, [policyStart, setValue]);



  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40">
      <div className="relative max-h-[95vh] w-[700px] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-semibold">Add New Policy</h2>
          <XMarkIcon className="h-6 w-6 cursor-pointer" onClick={onClose} />
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-5"
        >
          {/* PDF Upload */}
          <div className="col-span-2 mt-2">
            <DropzonePDF control={control} name="documents" />
          </div>
           <DropdownSelect
                    label="Insurance Company"
                    name_key="icName"
                    defaultValue="Insurance Company"
                    options={insurerListNew}
                    control={control}
                    rules={{ required: "Insurance company is required" }}
                    name="icName"
                    errors={errors.icName}
                    className="h-[42px] rounded-lg"
                    isRequired                
                  />
          <Input
            label="Policy Number"
            isRequired
            placeholder="POL-2024-XXX"
            {...register("policyNumber", { required: "Required" })}
            error={errors.policyNumber?.message}
          />

          <Input
            label="Client Name"
            isRequired
            placeholder="Enter client name"
            {...register("clientName", { required: "Required" })}
            error={errors.clientName?.message}
          />

          <Input
            label="Number of Lives"
            type="number"
            isRequired
            placeholder="Enter number of lives"
            {...register("numberOfLives", { required: "Required" })}
            error={errors.numberOfLives?.message}
          />

          <Input
            label="Sum Insured"
            isRequired
            placeholder="₹5,00,000"
            {...register("sumInsured", { required: "Required" })}
            error={errors.sumInsured?.message}
          />

          <Input
            label="Premium Amount"
            isRequired
            placeholder="₹12,00,000"
            {...register("premiumAmount", { required: "Required" })}
            error={errors.premiumAmount?.message}
          />

          <Input
            label="Policy Start Date"
            type="date"
            isRequired
            {...register("policyStart", { required: "Required" })}
            error={errors.policyStart?.message}
          />

          <Input
            label="Policy End Date"
            type="date"
            isRequired
            {...register("policyEnd", { required: "Required" })}
            error={errors.policyEnd?.message}
          />

          <DropdownSelect
            label="Priority"
            name="priority"
            name_key="priority"
            defaultValue="Priority"
            isRequired
            control={control}
            options={priorities}
            errors={errors.priority}
          />

          <Input
            label="Received Date"
            type="date"
            {...register("receivedDate")}
          />

          <DropdownSelect
            label="Policy Type"
            name="policyType"
            name_key="policyType"
            defaultValue="Policy Type"
            isRequired
            control={control}
            options={policyTypes}
            errors={errors.policyType}
          />

          <div className="col-span-2 mt-4 flex justify-end">
            <button className="bg-primary-600 rounded-md px-6 py-2 text-white">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
