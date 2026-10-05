import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm } from "react-hook-form";

type AssignFormValues = {
    userAssign: string;
    assignType: string;
};

import DropdownSelect from "@/components/shared/form/DropdownSelect";
import * as yup from "yup";

export const assignSchema = yup.object({
    userAssign: yup.string().required("User is required"),
    assignType: yup.string().required("Assign type is required"),
});
interface Props {
    onClose: () => void;
}

const AssignComponent: React.FC<Props> = ({ onClose }) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<AssignFormValues>({
        resolver: yupResolver(assignSchema),
        defaultValues: {
            userAssign: "",
            assignType: "",
        },
    });

    const assignType = watch("assignType");

    const onSubmit = (data: AssignFormValues) => {
        onClose()
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
            <div className="grid grid-cols-2 gap-4">

                <div className="flex  flex-col gap-4 col-span-2 mt-1">
                    <div className="border rounded-lg shadow-sm p-4 bg-white w-fit">
                        <div className="flex flex-col">
                            <p className="font-semibold text-gray-800">Current Assign To</p>
                            <p className="text-sm text-gray-500">Priya Sharma</p>
                        </div>
                    </div>
                    <p className="input-label">
                        Assignment Type <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-row">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignType === "auto"}
                                onChange={() => setValue("assignType", "auto")}
                            />
                            Auto Assign
                        </label>

                        <label className="flex items-center gap-2 ml-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignType === "manual"}
                                onChange={() => setValue("assignType", "manual")}
                            />
                            Manual Assign
                        </label>
                    {(errors?.assignType && assignType==="")&& (
                        <p className="input-text-error text-error dark:text-error-lighter text-left text-[10px] text-xsm ml-4">
                            {errors?.assignType?.message}
                        </p>
                    )}
                    </div>

                </div>

                <DropdownSelect
                    label="Reassign To (Sorted by least peding cases)"
                    name_key="userAssign"
                    defaultValue="Select User"
                    options={[
                        { label: "User1 - Peding : 22 cases", value: "User1" },
                        { label: "User2 - Peding : 98 cases", value: "User2" },
                        { label: "User3 - Peding    : 67 cases", value: "User3" },
                    ]}
                    control={control}
                    name="userAssign"
                    errors={errors.userAssign}
                    isRequired
                    className="h-[38px] rounded-[10px]"
                />


            </div>

            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer"
                >
                    Submit
                </button>
            </div>
        </form>
    );
};

export default AssignComponent;