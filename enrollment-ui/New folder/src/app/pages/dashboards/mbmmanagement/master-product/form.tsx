// import { DropzonePDF } from "@/app/pages/forms/file-upload/DropzonePDF";
// import DropdownSelect from "@/components/shared/form/DropdownSelect";
// import { Input } from "@/components/ui";
// import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
// import { createMasterProduct } from "@/store/features/masterProduct/masterProductSlice";
// import { useAppDispatch } from "@/store/hooks/useAppDispatch";
// import { useAppSelector } from "@/store/hooks/useAppSelector";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useEffect } from "react";
// import { Resolver, SubmitHandler, useForm } from "react-hook-form";
// import * as Yup from "yup";
// import { handleApiResponse } from "@/utils/errorHandler";
// import { applyCreateMasterProductFieldErrors, CreateMasterProductErrorPayload } from "./AddNewPolicyModal";
// import { fetchOnBoardResolveData } from "@/store/features/Broker/BrokerSlice";
import { useNavigate } from "react-router";


export interface FormValues {
    productName: string;
    insurerId: string;
    uin: string;
    documents: File[] | undefined;
}

// const addMasterProductSchema = Yup.object({
//     productName: Yup.string().required("Product Name is required"),
//     insurerId: Yup.string().required("Insurance company is required"),
//     uin: Yup.string().required("UIN is required"),
//     documents: Yup.array()
//         .transform((value) => value?.filter(Boolean) ?? [])
//         .of(
//             Yup.mixed<File>()
//                 .test("fileType", "Only PDF allowed", (file) =>
//                     file ? file.type === "application/pdf" : true,
//                 )
//                 .test("fileSize", "Max size 10MB", (file) =>
//                     file ? file.size <= 10 * 1024 * 1024 : true,
//                 ),
//         )
//         .default([]),
// });

export const AddNewPolicyModalOrPolicy = ({ data, inwardNo }: any) => {
    console.log("data, inwardNo", data, inwardNo)
    // const {
    //     register,
    //     handleSubmit,
    //     control,
    //     setError,
    //     formState: { errors },
    // } = useForm<FormValues>({
    //     resolver: yupResolver(addMasterProductSchema) as Resolver<FormValues>,
    //     defaultValues: {
    //         productName: data?.extraAttribute?.product_name ?? "",
    //         insurerId: "",
    //         uin: data?.extraAttribute?.product_uin ?? "",
    //     },
    // });
    // const dispatch = useAppDispatch();
    const navigate = useNavigate()
    // const creating = useAppSelector((s) => s.masterProduct.creating);

    // const { insurerMainList } = useAppSelector((state) => state.insurer);


    // useEffect(() => {
    //     dispatch(fetchInsurers({ size: "200" }));
    // }, [dispatch]);

    // const insurerListNew = insurerMainList?.map((i: any) => ({
    //     value: i?.id,
    //     label: i?.name,
    // }));

    // const onSubmit: SubmitHandler<FormValues> = async (data) => {

    //     const result = await dispatch(
    //         createMasterProduct({
    //             uin: data.uin,
    //             insurerId: data.insurerId,
    //             productName: data.productName,
    //         }),
    //     );

    //     if (!createMasterProduct.fulfilled.match(result)) {
    //         applyCreateMasterProductFieldErrors(
    //             result.payload as CreateMasterProductErrorPayload | undefined,
    //             setError,
    //         );
    //         return;
    //     }

    //     const normalized = {
    //         success: true,
    //         data: result.payload ?? null,
    //         error: null,
    //     };
    //     if (handleApiResponse(normalized, "Master product created successfully")) {
    //         dispatch(fetchOnBoardResolveData({ inwardNo: inwardNo, type: "PRODUCT", masterId: result?.payload?.data?.masterProductId }))
    //         navigate("/enrolment-system/corporate-enrolment");
    //     }
    // };

    return (
        <>
            {/* <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto w-full max-w-3xl">
            <div className="mb-8 w-full">
                <DropzonePDF
                    control={control}
                    name="documents"
                />
            </div>
            <div className="grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                <div className="w-full">
                    <DropdownSelect
                        label="Insurance Company"
                        name_key="insurerId"
                        defaultValue="Insurance Company"
                        options={insurerListNew ?? []}
                        control={control}
                        rules={{
                            required: "Insurance company is required",
                        }}
                        name="insurerId"
                        errors={errors.insurerId}
                        className="h-[52px] w-full rounded-lg"
                        isRequired
                    />
                </div>
                <div className="w-full">
                    <Input
                        label="Product Name"
                        isRequired
                        placeholder="Enter Product Name"
                        {...register("productName", {
                            required: "Product name is required",
                        })}
                        error={errors.productName?.message}
                    />
                </div>
                <div className="w-full md:col-span-2">
                    <Input
                        label="UIN"
                        isRequired
                        placeholder="Enter UIN"
                        {...register("uin", {
                            required: "UIN is required",
                        })}
                        error={errors.uin?.message}
                    />
                </div>
            </div>
            <div className="mt-10 flex justify-end">
                <button
                    type="submit"
                    disabled={creating}
                    className="min-w-[110px] rounded-lg bg-primary-600 px-2 py-2 text-base font-medium text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {creating ? "Submitting…" : "Submit"}
                </button>
            </div>
        </form> */}
            <div className="mx-auto w-full max-w-3xl">
                <div className="flex min-h-[400px] w-full items-center justify-center px-4">
                    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                            <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M10.29 3.86l-7.5 13A1.5 1.5 0 004.09 19h15.82a1.5 1.5 0 001.3-2.25l-7.5-13a1.5 1.5 0 00-2.6 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Product Configuration Pending
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Product configuration is pending. Please add the product details
                            in master first.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <button type="button" onClick={() => navigate("/enrolment-system/corporate-enrolment")} className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5M5.5 9v10.5h13V9M9 19.5v-6h6v6" />
                                </svg>
                                Home
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};
