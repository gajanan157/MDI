"use client";

import { insurerApi } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import FormLayout from "@/components/shared/form/FormLayout";
import { Button, Input, Spinner } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
    CalendarDaysIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { createAndUpdateContactPersonApi } from "./function";
import { ContactPersonFormValues, contactPersonSchema } from "./schema";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { Tenent_Id } from "@/utils/tenent";

const ContactPersonForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset
    } = useForm({
        resolver: yupResolver(contactPersonSchema),
    });
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchInsurers({ size: '50' }));
    }, [])



    const { insurerMainList } = useAppSelector((state) => state.insurer);
    const params = useParams()
    const getUser = async (personID: string) => {
        const result = await fetchUser(insurerApi, `/v1/insurer/contact-person/${personID}`);
        if (result?.success && result?.data) {
            const data = result.data.data; 
                const formattedDate = data?.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0]  : "";
                reset({
                insurerId: data.insurerId,
                prefix: data.prefix ?? "",
                firstName: data.firstName ?? "",
                middleName: data.middleName ?? "",
                lastName: data.lastName ?? "",
                dateOfBirth: formattedDate,
                gender: data.gender ?? "",
                notes: data.notes ?? ""
            });

        } else {
            //hi
        }
    };
    useEffect(() => {
        if (params.id) {
            getUser(params.id)
        }
    }, [params.id])

    const onSubmit = async (data: ContactPersonFormValues) => {
        const formattedDate = new Date(data.dateOfBirth).toISOString().split("T")[0];
        const insurerId = data?.insurerId
        const payload = [{
            tenantId: Tenent_Id,
            insurerId: data.insurerId,
            prefix: data.prefix,
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            fullName: `${data.firstName} ${data.middleName} ${data.lastName}`,
            dateOfBirth: formattedDate,
            gender: data.gender,
            notes: data.notes ?? "",
        }];
        setLoading(true)
        const result = await createAndUpdateContactPersonApi(payload, params.id ?? params.id,insurerId);
        if (result.success) {
            setLoading(false)
            toast.success(result.data.message, {position: "top-right", duration: 5000})
            navigate("/insurer-management/contact-person")
        } else {
            toast.error(result.error, { position: "top-right", duration: 5000 })
            setLoading(false)
        }

    };

    useBreadcrumb([
        { title: "Contact Person", path: "/insurer-management/contact-person" },
        { title: params.id ? "View Contact Person" : "Add Contact Person" },
    ]);

    return (
        <FormLayout onSubmit={handleSubmit(onSubmit)} FormClassName="w-full px-6 pt-5">
            <div className="min-w-0">
                <div className="bg-card rounded-xl border border-border shadow-sm p-4 py-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <UserCircleIcon className="w-5 h-5 text-blue-500" />
                        Contact Person Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                        <DropdownSelect
                            label="Insurance Company"
                            name_key="insurerId"
                            defaultValue="Select Prefix"
                            options={insurerMainList?.map((i: any) => ({
                                value: i?.id,
                                label: i?.name,
                            }))}
                            control={control}
                            rules={{ required: "Insurer is required" }}
                            name="insurerId"
                            errors={errors.insurerId}
                            isRequired
                            className="h-[38px] rounded-[10px]"
                        />
                        <DropdownSelect
                            label="Prefix"
                            name_key="prefix"
                            defaultValue="Select Prefix"
                            options={[
                                { label: "Mr", value: "Mr" },
                                { label: "Ms", value: "Ms" },
                                { label: "Mrs", value: "Mrs" },
                                { label: "Dr", value: "Dr" },
                            ]}
                            control={control}
                            rules={{ required: "Prefix is required" }}
                            name="prefix"
                            errors={errors.prefix}
                            isRequired
                            className="h-[38px] rounded-[10px]"
                        />
                        <Input
                            label="First Name"
                            placeholder="Enter First Name"
                            {...register("firstName")}
                            error={errors.firstName?.message}
                            isRequired
                        />
                        <Input
                            label="Middle Name"
                            placeholder="Enter Middle Name"
                            {...register("middleName")}
                            error={errors.middleName?.message}
                            isRequired
                        />
                        <Input
                            label="Last Name"
                            placeholder="Enter Last Name"
                            {...register("lastName")}
                            error={errors.lastName?.message}
                            isRequired
                        />
                        <Input
                            label="Date of Birth"
                            type="date"
                            prefix={<CalendarDaysIcon className="size-5" strokeWidth="1" />}
                            {...register("dateOfBirth")}
                            error={errors.dateOfBirth?.message}
                            isRequired
                            />
                        <DropdownSelect
                            label="Gender"
                            name_key="gender"
                            defaultValue="Select Gender"
                            options={[
                                { label: "Male", value: "male" },
                                { label: "Female", value: "female" },
                                { label: "Other", value: "other" },
                            ]}
                            control={control}
                            rules={{ required: "Gender is required" }}
                            name="gender"
                            errors={errors.gender}
                            isRequired
                            className="h-[38px] rounded-[10px]"

                        />
                        <Input
                            label="Notes"
                            placeholder="Add notes..."
                            prefix={<ChatBubbleOvalLeftEllipsisIcon className="size-5" strokeWidth="1" />}
                            {...register("notes")}
                            error={errors.notes?.message}
                        />
                    </div>
                </div>

                <div className="w-full flex justify-end items-center mb-4 mt-4">

                    <Button
                        color="primary"
                        type="submit"
                        className="px-4 py-2 text-sm"
                        disabled={loading}
                    >
                        Submit
                        {loading && (
                            <Spinner color="primary" className="size-5 border-2 ml-2 text-white border-white" />
                        )}
                    </Button>
                </div>
            </div>
        </FormLayout>
    );
};

export default ContactPersonForm;
