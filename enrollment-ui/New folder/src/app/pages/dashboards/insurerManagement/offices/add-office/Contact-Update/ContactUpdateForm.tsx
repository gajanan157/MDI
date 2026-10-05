import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { contactUpdateSchema } from "./schema";
import { ScaleUpModal } from "@/components/modal/ScaleUpModal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { insurerApi, patchApi} from "@/app/api/apiService";
import { Tenent_Id } from "@/utils/tenent";

const contactTypeOptions = [
    { label: "Email", value: "email" },
    { label: "Mobile", value: "mobile" },
    { label: "Landline", value: "landline" },
];

interface FormData {
    designation: string;
    department: string;
    contact_type_array: { type: string; value: string }[];
    priority: string;
}

interface ContactProps {
    selectedObj: any
    isOpen: boolean
    setIsAssign: Dispatch<SetStateAction<boolean>>;
    onClose: () => void;
}
// const ContactUpdateForm = () =>

const ContactUpdateForm: React.FC<ContactProps> = ({
    isOpen,
    selectedObj,
    onClose,
    setIsAssign
}) => {
    const defaultValues: FormData = {
        designation: "",
        department: "",
        contact_type_array: [{ type: "", value: "" }], // always initialized
        priority: "",
    };
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: defaultValues,
        resolver: yupResolver(contactUpdateSchema) as any,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "contact_type_array",
    });

    useEffect(() => {
        if (selectedObj?.allocationId) {

            // Convert contactChannels to your form array
            const contactArray = selectedObj?.contactChannels?.map((c: any) => ({
                type: c?.type || "",
                value: c?.value || ""
            })) || [{ type: "", value: "" }];

            reset({
                designation: selectedObj?.designation || "",
                department: selectedObj?.department || "",
                priority: String(selectedObj?.priorityRank || ""),
                contact_type_array: contactArray
            });
        }
    }, [selectedObj]);


    const buildPayload = (formValues: any, selectedObj: any) => {
        return {
            tenantId: Tenent_Id,
            allocationId: selectedObj?.allocationId,
            personId: selectedObj?.contactPerson?.contactPersonId,
            designation: formValues?.designation,
            department: formValues?.department,
            priorityRank: Number(formValues?.priority),

            contactChannels: formValues?.contact_type_array?.map((item: any, idx: number) => ({
                channelId: selectedObj?.contactChannels?.[idx]?.channelId || null,
                type: item.type,
                value: item.value,
            })),
        };
    };

    const onSubmit = (values: FormData) => {
        const payload = buildPayload(values, selectedObj);
        handleSave(payload)
    };

    const [loading, setLoading] = useState(false)


    const handleSave = async (payload: any) => {
        setLoading(true)
        const URL=`/v1/insurer-office/insurer-office-contact-assignment/${selectedObj?.assignmentId}`
        const res = await patchApi<any, any>(insurerApi, URL, payload)
        if (res?.success) {
            onClose();
            toast.success(res.data.message, {
                position: "top-right",
                duration: 5000,
            })
            setLoading(false)
            setIsAssign(true)

        } else {
            toast.error(res?.data?.message, {
                position: "top-right",
                duration: 5000,
            })
            setLoading(false)

        }
        setLoading(false)
    };
    const CloseAssignModel = () => {
        onClose();
    }

    return (
        <ScaleUpModal
            title={`Update Information ${selectedObj?.contactPerson?.fullName}`}
            isOpen={isOpen}
            onClose={CloseAssignModel}
            onOk={onSubmit}
            handleSubmit={handleSubmit}
            loading={loading}
        >
            <div className="mt-2 space-y-5">
                {/* Designation */}
                <Input
                    label="Designation"
                    placeholder="Enter Designation"
                    {...register("designation")}
                    error={errors.designation?.message}
                    isRequired
                />

                {/* Department */}
                <Input
                    label="Department"
                    placeholder="Enter Department"
                    {...register("department")}
                    error={errors.department?.message}
                    isRequired
                />

                {/* Dynamic Contact Type Fields */}
                <div className="">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 mt-4 relative items-baseline">
                            {/* Contact Type Dropdown */}
                            <div className="w-1/2">
                                <Controller
                                    name={`contact_type_array.${index}.type`}
                                    control={control}
                                    render={({ field }) => (
                                        <DropdownSelect
                                            label="Contact Type"
                                            name_key={`contact_type_array.${index}.type`}
                                            name={`contact_type_array.${index}.type`}
                                            defaultValue="Type"
                                            options={contactTypeOptions}
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            isRequired
                                            className="w-full"
                                            control={control}


                                        />
                                    )}
                                />
                                {errors.contact_type_array?.[index]?.type && (
                                    <p className="input-text-error text-error dark:text-error-lighter text-left text-[10px] text-xsm">
                                        {errors.contact_type_array[index]?.type?.message}
                                    </p>
                                )}
                            </div>

                            {/* Value Input */}
                            <div className="w-1/2">
                                <Input
                                    label="Contact Value"
                                    placeholder="Enter Value"
                                    {...register(`contact_type_array.${index}.value`)}
                                    error={errors.contact_type_array?.[index]?.value?.message}
                                    isRequired
                                />
                            </div>

                            {/* Remove Button */}
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    className="cursor-pointer absolute text-red-500 text-sm rounded-full font-bold top-0 right-0"
                                    onClick={() => remove(index)}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add New Contact Type */}
                    <button
                        type="button"
                        className="text-blue-600 underline cursor-pointer"
                        onClick={() => append({ type: "", value: "" })}
                    >
                        + Add Contact
                    </button>
                </div>
                <DropdownSelect
                    label="Priority"
                    name_key="priority"
                    defaultValue="Select Priority"
                    options={[
                        { label: "Priority 1", value: "1" },
                        { label: "Priority 2", value: "2" },
                        { label: "Priority 3", value: "3" },
                        { label: "Priority 4", value: "4" },
                        { label: "Priority 5", value: "5" }
                    ]}
                    control={control}
                    rules={{ required: "Priority is required" }}
                    name="priority"
                    errors={errors.priority}
                    isRequired
                />
            </div>
        </ScaleUpModal>
    );
};

export default ContactUpdateForm;
