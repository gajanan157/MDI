import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { fetchAgentDatas, fetchBrokerDatas, fetchCorporateDatas } from "@/store/features/Broker/BrokerSlice";
import { fetchEscalationMatrixdepartment } from "@/store/features/escalationMatrix/matrixSlice";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as yup from "yup";
import { completeLargeFileUpload, uploadInwardWithDocuments, uploadInwardWithDocumentsForLargeFile } from "../services/inwardUploadService";
import FileUpload from "./FileUpload";


export interface InwardFormValues {
    inward_source_entity_type: string;
    inward_source_entity_id: string;


    inward_sub_category: string;
    file: File | null;



}

const SUPPORTED_EXTENSIONS = ["xml"];
export interface OptionForInward {
    label: string;
    value: string;
};
interface Props {
    onClose: () => void;
}
export const transformResponse = (data: { documentTypes: string[] }, inward_sub_category: string) => {
    return {
        [inward_sub_category?.toUpperCase()]: data.documentTypes,
    };
};


const PSUInward: React.FC<Props> = ({ onClose }) => {
    const inwardFormSchema = yup.object().shape({


        inward_source_entity_type: yup
            .string()
            .required("Source Entity Type is required"),
        inward_source_entity_id: yup
            .string()
            .required("Source Entity is required"),
        file: yup
            .mixed<File>()
            .required("File is required")
            .test(
                "fileType",
                "Only XML files are allowed",
                (value: any) => {
                    if (!value) return false;

                    const extension = value.name
                        ?.split(".")
                        .pop()
                        ?.toLowerCase();

                    return SUPPORTED_EXTENSIONS.includes(extension);
                }
            ),
    });
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<InwardFormValues>({
        resolver: yupResolver(inwardFormSchema as any)
    });

    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);




    const onSubmit = async (data: any) => {
        setLoading(true);

        try {
            const file = data?.file;

            if (!file) {
                toast.error("Please select a file", {
                    position: "top-right",
                    duration: 5000,
                });
                return;
            }

            const MAX_SMALL_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
            const payload = {
                departmentId: enrollmentDepartmentId,
                s3SubBucketName: "ENROLLMENT",
                entityType: data?.inward_source_entity_type?.toUpperCase(),
                entityId: data?.inward_source_entity_id,
                documentType: "MEMBER_DATA",
                s3BucketName: "enrollment",
                fileName: file.name,
                policyRecordType: "LIVE",
                contentType: file.type || "application/octet-stream",
            };

            // =========================================================
            // SMALL FILE: Less than 100 MB
            // =========================================================
            if (file.size < MAX_SMALL_FILE_SIZE) {
                const response = await uploadInwardWithDocuments({
                    files: [file],
                    payload,
                });

                // Duplicate entry
                if (response?.status === 409) {
                    toast.error(response?.message || "Duplicate entry", {
                        position: "top-right",
                        duration: 5000,
                    });
                    return;
                }

                // API failed
                if (
                    !response?.data?.success &&
                    response?.data?.status !== "UPLOADED"
                ) {
                    toast.error(
                        response?.data?.message ||
                        response?.message ||
                        "File upload failed",
                        {
                            position: "top-right",
                            duration: 5000,
                        }
                    );
                    return;
                }

                // Small file uploaded successfully
                toast.success(
                    response?.data?.message ||
                    response?.message ||
                    "File uploaded successfully",
                    {
                        position: "top-right",
                        duration: 3000,
                    }
                );

                // Close popup after successful upload
                onClose();

                return;
            }


            const response =
                await uploadInwardWithDocumentsForLargeFile({
                    payload,
                });

            // Duplicate entry
            if (response?.status === 409) {
                toast.error(response?.message || "Duplicate entry", {
                    position: "top-right",
                    duration: 5000,
                });
                return;
            }

            // Init API failed
            if (!response?.data?.success) {
                toast.error(
                    response?.data?.message ||
                    "Failed to initialize upload",
                    {
                        position: "top-right",
                        duration: 5000,
                    }
                );
                return;
            }

            const uploadData = response?.data?.data;

            const {
                fileMetadataId,
                inwardNo,
                objectKey,
                s3BucketName,
                presignedUrl,
            } = uploadData || {};

            if (
                !fileMetadataId ||
                !objectKey ||
                !s3BucketName ||
                !presignedUrl
            ) {
                throw new Error(
                    "Invalid response from upload initialization API"
                );
            }

            // Step 2: Direct upload to MinIO using presigned URL
            const uploadResponse = await fetch(presignedUrl, {
                method: "PUT",
                headers: {
                    "Content-Type":
                        file.type || "application/octet-stream",
                },
                body: file,
            });

            if (!uploadResponse.ok) {
                throw new Error(
                    `File upload to MinIO failed. Status: ${uploadResponse.status}`
                );
            }

            // ETag comes from response HEADER
            const eTag = uploadResponse.headers.get("eTag");


            if (!eTag) {
                throw new Error(
                    "ETag was not returned by MinIO. Unable to complete upload."
                );
            }

            // =========================================================
            // Step 3: Complete upload
            // =========================================================

            const cleanETag = eTag.replace(/^"|"$/g, "");

            const completePayload = {
                objectKey,
                s3BucketName,
                etag: cleanETag,

                entityType:
                    data?.inward_source_entity_type?.toUpperCase(),
                entityId: data?.inward_source_entity_id,
                departmentId: enrollmentDepartmentId,
                s3SubBucketName: "ENROLLMENT",
                documentType: "MEMBER_DATA",
                fileName: file.name,
                inwardNo: inwardNo,
                contentType: file.type || "application/xml",
            };


            const completeResponse =
                await completeLargeFileUpload(
                    fileMetadataId,
                    completePayload
                );


            if (
                !completeResponse?.data?.success &&
                completeResponse?.data?.status !== "UPLOADED"
            ) {
                toast.error(
                    completeResponse?.data?.message ||
                    "File upload completion failed",
                    {
                        position: "top-right",
                        duration: 5000,
                    }
                );
                return;
            }

            toast.success(
                completeResponse?.data?.message ||
                "File uploaded successfully",
                {
                    position: "top-right",
                    duration: 3000,
                }
            );

            // Close popup after successful large upload
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
        }
    };

    const dispatch = useAppDispatch()
    const { agentData, brokerData, corporateData } = useAppSelector((state) => state.broker);
    const { depertment } = useAppSelector((state) => state.matrix);
    const { insurerMainList } = useAppSelector((state) => state.insurer);

    useEffect(() => {
        dispatch(fetchEscalationMatrixdepartment());
    }, [dispatch]);


    const selectedEntityType = watch("inward_source_entity_type");
    useEffect(() => {
        if (!selectedEntityType) return;

        switch (selectedEntityType) {
            case "AGENT":
                dispatch(fetchAgentDatas({ onlyName: true }));
                break;
            case "BROKER":
                dispatch(fetchBrokerDatas({ onlyName: true }));
                break;
            case "CORPORATE":
                dispatch(fetchCorporateDatas({ onlyName: true }));
                break;
            case "INSURER":
                dispatch(fetchInsurers({ size: "500" }));
                break;

            default:
                break;
        }
    }, [selectedEntityType, dispatch]);


    const agentNameList = agentData?.map((i: any) => ({
        value: i.agentId,
        label: i.agentName,
    }));
    const brokerNameList = brokerData?.map((i: any) => ({
        value: i.brokerId,
        label: i.brokerName,
    }));
    const corporateNameList = corporateData?.map((i: any) => ({
        value: i.corporateId,
        label: i.corporateName,
    }));
    const insurerListNew = insurerMainList
        ?.filter((i: any) => i.insurerType === "PSU")
        .map((i: any) => ({
            value: i.id,
            label: i.name,
        }));


    const sourceEntityOptions = useMemo(() => {
        switch (selectedEntityType) {
            case "CORPORATE":
                return corporateNameList || [];
            case "BROKER":
                return brokerNameList || [];
            case "AGENT":
                return agentNameList || [];
            case "INSURER":
                return insurerListNew || [];
            default:
                return [];
        }
    }, [selectedEntityType, corporateNameList, brokerNameList, agentNameList, insurerListNew]);


    useEffect(() => {
        dispatch(fetchInsurers({ size: "100" }));
        dispatch(fetchEscalationMatrixdepartment());

    }, [])
    const [enrollmentDepartmentId, setEnrollmentDepartmentId] = useState("");

    useEffect(() => {
        if (depertment?.length) {
            const enrollmentDept = depertment?.find((item) => item.departmentName?.toLowerCase() === "enrollment");

            if (enrollmentDept) {
                setEnrollmentDepartmentId(enrollmentDept.departmentId);
            }
        }
    }, [depertment]);


    return (
        <div className="p-4 space-y-2">
            <form onSubmit={handleSubmit(onSubmit)}>
                <FileUpload
                    control={control}
                    name="file"
                    label="Upload Document"
                    accept=".xml"
                    required
                    error={errors.file}
                />

                <div className="grid grid-cols-2 gap-2">
                    <DropdownSelect
                        label={t("createInwardForm.fields.sourceEntityType.label")}
                        defaultValue={t("createInwardForm.fields.sourceEntityType.placeholder")}
                        name_key="inward_source_entity_type"
                        options={[
                            { label: "Insurer", value: "INSURER" },
                            { label: "Corporate", value: "CORPORATE" },
                            { label: "Broker", value: "BROKER" },
                            { label: "Agent", value: "AGENT" },
                        ]}
                        control={control}
                        name="inward_source_entity_type"
                        errors={errors.inward_source_entity_type}
                        isRequired
                        className="h-[38px] rounded-[10px]"
                    />
                    <DropdownSelect
                        label={t("createInwardForm.fields.sourceEntity.label")}
                        defaultValue={t("createInwardForm.fields.sourceEntity.placeholder")}
                        name_key="inward_source_entity_id"
                        options={sourceEntityOptions}
                        control={control}
                        name="inward_source_entity_id"
                        errors={errors.inward_source_entity_id}
                        isRequired
                        className="h-[38px] rounded-[10px]"
                    />
                </div>

                <div className="col-span-2 flex justify-end mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg text-white ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 cursor-pointer"
                            }`}>
                        {loading ? "Uploading..." : t("inwardUploadDoc.buttons.uploadDocuments")}
                    </button>
                </div>
            </form>
        </div>

    );
};
export default PSUInward;