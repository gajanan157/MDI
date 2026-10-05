import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Checkbox, Input } from "@/components/ui";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as yup from "yup";
import { formatOptions, uploadInwardDocument } from "../../PolicyDetails/UploadInwardDocuments";
import { uploadInwardWithDocuments } from "../../PolicyDetails/services/inwardUploadService";
import { OptionForInward, transformResponse } from "../../PolicyDetails/CreateInwardForm";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { masterApi } from "@/app/api/apiService";
import { fetchEscalationMatrixdepartment } from "@/store/features/escalationMatrix/matrixSlice";
import DocumentUploadSection2 from "../../PolicyDetails/services/DocumentUploadSection2";
import { fetchCorporateInwardData } from "@/store/features/Broker/BrokerSlice";

export const FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const SUPPORTED_FORMATS = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",


    // EML support
    "message/rfc822",
    "application/rfc822",
    "multipart/related",
    "multipart/mixed",
    "text/x-eml",
    "application/x-eml",

    // MSG support
    "application/vnd.ms-outlook",
    "application/octet-stream",
];


interface FormValues {
    source: string;
    insurerName: string;
    policyNumber: string;
    policyRecordType?: boolean;
    policyType: string;
    ocrRequired: string;
    documents: {
        documentType: string;
        file: File | null;
    }[];
}
interface Props {
    onClose: () => void;
}
const CreateCorporateInwardForm: React.FC<Props> = ({ onClose }) => {
    const schema = yup.object().shape({
        source: yup.string().required("Source is required"),
        insurerName: yup.string().required("Insurer Name is required"),
        policyNumber: yup.string().required("Reference Number is required"),
        policyType: yup.string().required("Enrolment Type is required"),
        // ocrRequired: yup.string().required("OCR Option is required"),
        documents: yup
            .array()
            .of(
                yup.object({
                    documentType: yup
                        .string()
                        .required("Document Type is required"),

                    file: yup
                        .mixed()
                        .required("File is required")
                        .test(
                            "fileSize",
                            "Each file must be less than 50MB",
                            (value: any) => {
                                if (!value) return false;
                                return value.size <= FILE_SIZE;
                            }
                        )
                        .test(
                            "fileType",
                            "Unsupported format",
                            (value: any) => {
                                if (!value) return false;

                                const mimeType = value.type;
                                const extension = value.name?.split(".").pop()?.toLowerCase();

                                return (
                                    SUPPORTED_FORMATS.includes(mimeType) ||
                                    ["msg", "eml"].includes(extension)
                                );
                            }
                        )
                })
            )
            .min(1, "At least one document is required"),
    });

    const {
        register,
        handleSubmit,
        control,
        watch,
        getValues,
        formState: { errors },
        setValue
    } = useForm<FormValues>({
        resolver: yupResolver(schema as any),
        defaultValues: {
            documents: [
                {
                    documentType: "",
                    file: null,
                },
            ],
        },
    });

    const [loading, setLoading] = useState(false)
    const s3SubBucketName = watch("policyType")
    const insurerId = watch("insurerName");
    const policyType = watch("policyType");
    const policyRecordType = watch("policyRecordType");

    const policyNumber = watch("policyNumber");
    const generatedReferenceRef = React.useRef<string | null>(null);

    const { depertment } = useAppSelector((state) => state.matrix);
    const [enrollmentDepartmentId, setEnrollmentDepartmentId] = useState("");

    const onSubmit = async (data: any) => {
        setLoading(true);

        try {
            const documents = data?.documents;

            // Validate documents first
            if (!documents || documents?.length === 0) {
                toast.error("Please upload at least one document.", {
                    position: "top-right",
                    duration: 5000,
                });
                return;
            }

            // MEMBER_DATA cannot be uploaded alone
            if (!policyRecordType && documents.length === 1 && documents[0]?.documentType === "MEMBER_DATA") {
                toast.error("Policy Schedule is mandatory for Member Data processing", { position: "top-right", duration: 5000, }
                );
                return;
            }

            // Find POLICY_SCHEDULE / ENDORSEMENT_SCHEDULE document
            const policyScheduleDoc = documents?.find((doc: any) => doc?.documentType === "POLICY_SCHEDULE" || doc?.documentType === "ENDORSEMENT_SCHEDULE");

            // If policy schedule exists, upload it using uploadInwardWithDocuments
            // Otherwise fallback to first document
            const firstDoc = policyScheduleDoc || documents[0];

            // OCR is required only when the selected policy document is PDF
            const isOcrRequired = (firstDoc?.documentType === "POLICY_SCHEDULE" || firstDoc?.documentType === "ENDORSEMENT_SCHEDULE") && firstDoc?.file?.type === "application/pdf";

            const payload = {
                inwardReceivedChannel: data?.source?.toUpperCase(),
                s3SubBucketName: data.policyType,

                entityId: data.insurerName,
                inwardSourceReferenceNo: data.policyNumber || "",

                s3BucketName: "enrollment",
                entityType: "INSURER",
                documentType: firstDoc?.documentType,
                departmentId: enrollmentDepartmentId,
                ocrRequired: isOcrRequired ? "OCR_REQUIRED" : "OCR_NOT_REQUIRED",
                policyRecordType: policyRecordType ? "DUMMY" : "LIVE",
            };
            const response = await uploadInwardWithDocuments({
                files: [firstDoc.file],
                payload,
            });

            if (response?.status === 409) {
                toast.error(response?.message || "Duplicate entry", {
                    position: "top-right",
                    duration: 5000,
                });
                return;
            }

            if (!response?.data?.success) {
                toast.error(response?.data?.message || "Upload failed", {
                    position: "top-right",
                    duration: 5000,
                });
                return;
            }

            const inwardNo = response.data.data.inwardNo;

            toast.success(response?.data?.message || "Document uploaded", { position: "top-right", duration: 3000, });

            // Upload all OTHER documents using uploadInwardDocument
            const remainingDocs = documents?.filter((doc: any) => doc !== firstDoc);

            for (const doc of remainingDocs) {
                const res = await uploadInwardDocument(
                    doc.file,
                    inwardNo,
                    "enrollment",
                    data.policyType,
                    doc.documentType
                );
                if (res?.status === 409) {
                    toast.error(`${doc.documentType} already exists`, {
                        position: "top-right",
                        duration: 3000,
                    });
                    continue;
                }

                if (!res?.data?.success) {
                    toast.error(`${doc.documentType} upload failed`, {
                        position: "top-right",
                        duration: 3000,
                    });
                }
            }

            onClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong",
                {
                    position: "top-right",
                    duration: 5000,
                }
            );
        } finally {
            setLoading(false);
            dispatch(fetchCorporateInwardData({page: 1,size: 20}));
        }
    };
    useEffect(() => {
        if (depertment?.length) {
            const enrollmentDept = depertment?.find((item: any) => item.departmentName?.toLowerCase() === "enrollment");

            if (enrollmentDept) {
                setEnrollmentDepartmentId(enrollmentDept.departmentId);
            }
        }
    }, [depertment]);


    const [category, setCategory] = useState<OptionForInward[]>([]);
    const [subOptions, setSubOptions] = useState<Record<string, string[]>>({});

    const fecthCategory = async () => {
        const result = await fetchUser(masterApi, `/v1/document-master?onlyName=true&departmentId=${enrollmentDepartmentId}`);
        if (result?.success && result?.data) {
            const departmentSubtypes = result?.data?.data?.departmentSubtypes ?? [];
            setCategory(
                departmentSubtypes
                    .map((item: string) => ({
                        label: item === "ENROLLMENT" ? "Fresh Policy" : item,
                        value: item,
                    }))
                    .sort((a: any, b: any) => {
                        if (a.value === "ENROLLMENT") return -1;
                        if (b.value === "ENROLLMENT") return 1;
                        return 0;
                    })
            );
        }
    }
    useEffect(() => {
        if (enrollmentDepartmentId) {
            fecthCategory()
        }
    }, [enrollmentDepartmentId])
    const fecthDocType = async () => {
        const result = await fetchUser(masterApi, `/v1/document-master?onlyName=true&departmentId=${enrollmentDepartmentId}&departmentSubtype=${s3SubBucketName}`);
        if (result?.success && result?.data) {
            const formatted = transformResponse(result?.data?.data, s3SubBucketName);
            setSubOptions(formatted);
        }
    }

    useEffect(() => {
        if (s3SubBucketName) {
            fecthDocType()
        }
    }, [s3SubBucketName])

    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchInsurers({ size: "100" }));
        dispatch(fetchEscalationMatrixdepartment());

    }, [])

    const { insurerMainList } = useAppSelector((state) => state.insurer);
    const insurerListNew = insurerMainList?.map((i: any) => ({
        value: i?.id,
        label: i?.name,
    }));
    const { t } = useTranslation()
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "documents",
    });
    useEffect(() => {
        replace([
            {
                documentType: "",
                file: null,
            },
        ]);
    }, [s3SubBucketName, replace]);





useEffect(() => {
    // -----------------------------------------
    // NO POLICY RECORD TYPE
    // -----------------------------------------
    if (!policyRecordType) {
        generatedReferenceRef.current = null;

        if (getValues("policyNumber")) {
            setValue("policyNumber", "", {
                shouldValidate: true,
                shouldDirty: false,
            });
        }

        return;
    }

    // -----------------------------------------
    // ENROLLMENT
    // Auto generate policy number
    // -----------------------------------------
    if (policyType === "ENROLLMENT") {
        // Need insurer before generating
        if (!insurerId) {
            generatedReferenceRef.current = null;

            if (getValues("policyNumber")) {
                setValue("policyNumber", "", {
                    shouldValidate: true,
                    shouldDirty: false,
                });
            }

            return;
        }

        const selectedInsurer = insurerMainList?.find(
            (insurer: any) => insurer?.id === insurerId
        );

        if (!selectedInsurer?.name) {
            return;
        }

        const generationKey = `${insurerId}_${policyType}`;

        // Already generated
        if (
            generatedReferenceRef.current === generationKey
        ) {
            return;
        }

        const insurerCode = selectedInsurer.name
            .replace(/\s+/g, "")
            .substring(0, 4)
            .toUpperCase();

        const typeCode = "FRESH";

        const now = new Date();

        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear());

        const dateCode = `${day}${month}${year}`;

        const randomNumber = String(
            Math.floor(100 + Math.random() * 900)
        );

        const referenceNumber =
            `${insurerCode}_${typeCode}_${dateCode}${randomNumber}`;

        generatedReferenceRef.current = generationKey;

        setValue("policyNumber", referenceNumber, {
            shouldValidate: true,
            shouldDirty: true,
        });

        return;
    }

    // -----------------------------------------
    // ENDORSEMENT
    // User enters manually
    // -----------------------------------------
    if (policyType === "ENDORSEMENT") {
        generatedReferenceRef.current = null;

        // Don't clear user input here
        return;
    }
}, [
    policyRecordType,
    policyType,
    insurerId,
    insurerMainList,
    setValue,
    getValues,
]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <DropdownSelect
                    label={t("source")}
                    defaultValue={t("source")}
                    name_key="source"
                    options={[
                        { label: "Email", value: "EMAIL" },
                        { label: "SFTP", value: "SFTP" },
                        { label: "IC Portal", value: "PORTAL" },
                    ]}
                    control={control}
                    name="source"
                    errors={errors.source}
                    isRequired
                    className="h-[38px] rounded-[10px]"
                />
                <div className="flex flex-col">
                    <p className="input-label">
                        {t("enrolmentType")}
                        <span className="ms-0.5 text-red-600!" aria-hidden="true">
                            *
                        </span>
                    </p>
                    <div className="flex flex-row gap-4  mt-1.5">
                        {category?.map((option: any) => (
                            <label
                                key={option?.value}
                                className="flex w-full h-[34px] items-center gap-2 border px-4 py-1 rounded-sm cursor-pointer hover:border-blue-500">
                                <input type="radio" value={option.value}  {...register("policyType")} className="accent-blue-600" />
                                <span>{option?.label}</span>
                            </label>
                        ))}
                    </div>
                    <p className="input-text-error  text-[10px] text-error dark:text-error-lighter mt-0.5 block max-w-full wrap-break-word whitespace-normal leading-3"> {errors?.policyType?.message}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <DropdownSelect
                    label={t("icForm.insurerName")}
                    defaultValue={t("icForm.placeholders.insurer")}
                    name_key="insurerName"
                    options={insurerListNew}
                    control={control}
                    name="insurerName"
                    errors={errors.insurerName}
                    isRequired
                    className="h-[38px] rounded-[10px]"
                />
                <Input
                    label={t("corporateInward.columns.policyNumber")}
                    placeholder={t("corporateInward.columns.policyNumber")}
                    {...register("policyNumber")}
                    error={errors?.policyNumber?.message as string}
                    isRequired
                    disabled={policyRecordType && policyType === "ENROLLMENT"}
                    className="bg-white"
                />
                <div>
                    <p className="input-label mb-2">Policy Record Type</p>
                    <Checkbox
                        label={"Dummy"}
                        {...register("policyRecordType")}
                    />
                </div>
            </div>
            <DocumentUploadSection2
                s3SubBucketName={s3SubBucketName}
                InwardSubOptions={subOptions}
                formatOptions={formatOptions}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                fields={fields}
                append={append}
                remove={remove}
                isDummy={policyRecordType}
            />
            <div className="col-span-2 flex justify-end mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer">
                    {t("inwardUploadDoc.buttons.uploadDocuments")}
                </button>
            </div>
        </form>
    );
};

export default CreateCorporateInwardForm;


