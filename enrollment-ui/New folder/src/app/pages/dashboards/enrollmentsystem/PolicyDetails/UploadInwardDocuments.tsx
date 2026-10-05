import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";

import { documentApi, masterApi, postApi } from "@/app/api/apiService";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FILE_SIZE, SUPPORTED_FORMATS } from "../dashboard/components/CreateCorporateInwardForm";
import DocumentUploadSection from "./services/DocumentUploadSection";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { transformResponse } from "./CreateInwardForm";


interface Props {
    inwardNo: string;
    s3BucketName: string;
    departmentId?: string;
    s3SubBucketName: string;
    onClose: () => void;
}

type FormValues = {
    documents: {
        documentType: string;
        file: File | null;
    }[];

};
export const formatOptions = (options: string[]) => {
    return options.map((item) => ({
        value: item,
        label: item.replace(/_/g, " "), // remove underscores
    }));
};

export const uploadInwardDocument = async (
    file: File,
    inwardNo: string,
    s3BucketName: string,
    s3SubBucketName: string,
    documentType: string | undefined,
    departmentId?: string,
) => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
        params: {
            s3BucketName: "enrollment",
            s3SubBucketName: s3SubBucketName,
            inwardNo: inwardNo,
            documentType: documentType
        },
        headers: {
            "Content-Type": "multipart/form-data",
        },
    };

    const response = await postApi<any, FormData>(
        documentApi,
        "v1/scan/files/upload",
        formData,
        config
    );

    return response;
};
const UploadInwardDocuments: React.FC<Props> = ({ inwardNo, onClose, s3BucketName, s3SubBucketName,departmentId }) => {
    const isEnrollment = s3BucketName?.toUpperCase() === "ENROLLMENT" && !!s3SubBucketName;

    const schema = yup.object().shape({
        documents: yup
            .array()
            .of(
                yup.object({
                    documentType: yup.string().when("$isEnrollment", ([isEnrollment], schema) =>
                        isEnrollment
                            ? schema.required("Document Type is required")
                            : schema.notRequired().nullable(),
                    ),

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
                                return SUPPORTED_FORMATS.includes(value.type);
                            }
                        ),
                })
            )
            .min(1, "At least one document is required"),

    });
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        control
    } = useForm<FormValues>({
        resolver: yupResolver(schema as any),
        context: { isEnrollment },
        defaultValues: {
            documents: [
                {
                    documentType: "",
                    file: null,
                },
            ],
        },
    });
    const { t } = useTranslation();


    const onSubmit = async (data: any) => {
        try {
            for (const doc of data.documents) {
                const res = await uploadInwardDocument(
                    doc.file,
                    inwardNo,
                    s3BucketName,
                    s3SubBucketName,
                    doc.documentType
                );

                if (res?.data?.success) {
                    toast.success(
                        `${doc.documentType} uploaded successfully`,
                        {
                            duration: 3000,
                            position: "top-right",
                        }
                    );
                } else {
                    toast.error(
                        `${doc.documentType} upload failed`,
                        {
                            duration: 3000,
                            position: "top-right",
                        }
                    );
                }
            }

            onClose();
        } catch (error: any) {
            toast.error(error?.message || "Upload failed");
        }
    };

    const [subOptions, setSubOptions] = useState<Record<string, string[]>>({});
        const fecthDocType = async () => {
            const result = await fetchUser(masterApi, `/v1/document-master?onlyName=true&departmentId=${departmentId}&departmentSubtype=${s3SubBucketName}`);
            if (result?.success && result?.data) {
                const formatted = transformResponse(result?.data?.data,s3SubBucketName);
                setSubOptions(formatted);
            }
        }
    
        useEffect(() => {
            if (s3SubBucketName) {
                fecthDocType()
            }
        }, [s3SubBucketName])

    const { fields, append, remove } = useFieldArray({
        control,
        name: "documents",
    });
    console.log("subOptions")
    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">
                {t("inwardUploadDoc.title")}: <span className="text-blue-600">{inwardNo}</span>
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DocumentUploadSection
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
                />
                <div className="flex justify-end mt-6 gap-3">
                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg cursor-pointer">
                        {t("inwardUploadDoc.buttons.uploadDocuments")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadInwardDocuments;