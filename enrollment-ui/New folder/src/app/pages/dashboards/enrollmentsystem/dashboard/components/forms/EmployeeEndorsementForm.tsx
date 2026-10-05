import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";

type FormValues = { empId: string; insuredName: string; dob: string; age: number; gender: string; relationship: string; sumInsured: number; doj?: string; doc?: string; };

const schema = yup.object({
    empId: yup.string().required("Employee ID is required"),
    insuredName: yup.string().required("Insured Name is required"),
    dob: yup.string().required("DOB is required"),
    age: yup.number().typeError("Age must be a number").required("Age is required").min(0),
    gender: yup.string().required("Gender is required"),
    relationship: yup.string().required("Relationship is required"),
    sumInsured: yup.number().transform((value, originalValue) => originalValue === "" ? undefined : value)
        .typeError("Sum Insured must be a number")
        .when("relationship", ([relationship], schema) =>
            relationship === "SELF"
                ? schema.required("Sum Insured is required").min(0)
                : schema.notRequired(),
        ),
    doj: yup.string().notRequired(),
    doc: yup.string().notRequired(),
});
const GENDER_OPTIONS = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
];
const RELATIONSHIP_OPTIONS = [
    { label: "Self", value: "SELF" },
    { label: "Spouse", value: "SPOUSE" },
    { label: "Child", value: "CHILD" },
    { label: "Father", value: "FATHER" },
    { label: "Mother", value: "MOTHER" },
    { label: "Brother", value: "BROTHER" },
    { label: "Sister", value: "SISTER" },
    { label: "Other", value: "OTHER" },
];

interface Props {
    onClose: () => void;
    onSave?: ((data: any) => void) | undefined;
}

const EmployeeEndorsementForm: React.FC<Props> = ({ onClose, onSave }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
        setValue
    } = useForm<FormValues>({
        resolver: yupResolver(schema as any),
    });
    const dob = watch("dob");
    const relationship = watch("relationship")

    const onSubmit = (data: FormValues) => {
        if (onSave) {
            onSave(data);
            onClose()
        }
    };

    useEffect(() => {
        if (!dob) return;

        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) { age--; }

        setValue("age", age);
    }, [dob]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="grid grid-cols-3 gap-2">
                <Input
                    label="Employee ID"
                    placeholder="Enter Employee ID"
                    isRequired
                    {...register("empId")}
                    error={errors.empId?.message}
                />
                <Input
                    label="Insured Name"
                    placeholder="Enter Insured Name"
                    isRequired
                    {...register("insuredName")}
                    error={errors.insuredName?.message}
                />
                <Input
                    type="date"
                    label="DOB"
                    placeholder="Select Date of Birth"
                    isRequired
                    {...register("dob")}
                    error={errors.dob?.message}
                />
                <Input
                    type="number"
                    label="Age"
                    placeholder="Enter Age"
                    isRequired
                    {...register("age")}
                    error={errors.age?.message}
                />
                <DropdownSelect
                    label="Gender"
                    name="gender"
                    defaultValue="Select Gender"
                    options={GENDER_OPTIONS}
                    control={control}
                    errors={errors.gender}
                    isRequired
                />
                <DropdownSelect
                    label="Relationship"
                    name="relationship"
                    defaultValue="Select Relationship"
                    options={RELATIONSHIP_OPTIONS}
                    control={control}
                    errors={errors.relationship}
                    isRequired
                />
                <Input
                    type="number"
                    label="Sum Insured"
                    placeholder="Enter Sum Insured"
                    isRequired={relationship === "SELF"}
                    {...register("sumInsured")}
                    error={errors.sumInsured?.message}
                />
                <Input
                    type="date"
                    label="Date of Joining (DOJ)"
                    placeholder="Select DOJ"
                    {...register("doj")}
                    error={errors.doj?.message}
                />
                <Input
                    type="date"
                    label="Date of Confirmation (DOC)"
                    placeholder="Select DOC"
                    {...register("doc")}
                    error={errors.doc?.message}
                />
            </div>
            <div className="flex justify-end mt-3">
                <Button type="submit" className="w-24" color="primary">
                    Save
                </Button>
            </div>
        </form>
    );
};

export default EmployeeEndorsementForm;