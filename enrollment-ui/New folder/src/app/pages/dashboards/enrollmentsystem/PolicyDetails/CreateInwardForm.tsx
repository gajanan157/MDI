import { masterApi } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { fetchAgentDatas, fetchBrokerDatas, fetchCorporateDatas, fetchPolicySearchDropdownData } from "@/store/features/Broker/BrokerSlice";
import { fetchEscalationMatrixdepartment } from "@/store/features/escalationMatrix/matrixSlice";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { fetchParentBranches } from "@/store/features/parentBranches/parentBranchesSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as yup from "yup";
import { FILE_SIZE, SUPPORTED_FORMATS } from "../dashboard/components/CreateCorporateInwardForm";
import { formatOptions, uploadInwardDocument } from "./UploadInwardDocuments";
import DocumentUploadSection from "./services/DocumentUploadSection";
import { uploadInwardWithDocuments } from "./services/inwardUploadService";

export interface InwardFormValues {
    inward_received_tpa_branch_id: string;
    inward_received_channel: string;
    inward_source_entity_type: string;
    inward_source_entity_id: string;
    inward_source_reference_no: string;
    inward_category: string;
    inward_sub_category: string;
    enrollment_type?: string;
    department_id: string;
    inward_priority: string;

    documents: {
        documentType: string;
        file: File | null;
    }[];
}
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

const CreateInwardForm: React.FC<Props> = ({ onClose }) => {
    const inwardFormSchema = yup.object().shape({

        inward_received_tpa_branch_id: yup
            .string()
            .required("TPA Branch is required"),
        department_id: yup
            .string()
            .required("Department is required"),
        inward_received_channel: yup
            .string()
            .required("Received Channel is required"),
        inward_source_entity_type: yup
            .string()
            .required("Source Entity Type is required"),
        inward_source_entity_id: yup
            .string()
            .required("Source Entity is required"),
        inward_source_reference_no: yup
            .string()
            .nullable(),
        inward_category: yup
            .string()
            .nullable(),
        inward_sub_category: yup
            .string()
            .required("Sub Category is required"),
        inward_priority: yup
            .string()
            .nullable(),
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
                                return SUPPORTED_FORMATS.includes(value.type);
                            }
                        ),
                })
            )
            .min(1, "At least one document is required"),
    });
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        register,
    } = useForm<InwardFormValues>({
        resolver: yupResolver(inwardFormSchema as any),
        defaultValues: {
            documents: [{ documentType: "", file: null }],
        },
    });
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "documents",
    });
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<OptionForInward[]>([]);
    const [subOptions, setSubOptions] = useState<Record<string, string[]>>({});

    const inward_sub_category = watch("inward_sub_category")
    useEffect(() => {
        replace([
            {
                documentType: "",
                file: null,
            },
        ]);
    }, [inward_sub_category, replace]);
    const department_id = watch("department_id")
    const isMsg = inward_sub_category && department_id ? "Enter the relevant number for the selected Department and Document Type." : "";

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const documents = data.documents;
            const firstDocument = documents[0];

            const payload = {
                inwardReceivedTpaBranchId: data.inward_received_tpa_branch_id,
                inwardReceivedChannel: data.inward_received_channel?.toUpperCase(),
                departmentId: data.department_id,

                entityType: data.inward_source_entity_type?.toUpperCase(),
                entityId: data.inward_source_entity_id,
                inwardSourceReferenceNo: data.inward_source_reference_no || "",

                s3BucketName: data.inward_category?.toLowerCase(),
                s3SubBucketName: data.inward_sub_category,
                inwardPriority: data.inward_priority?.toUpperCase(),

                documentType: firstDocument?.documentType
            };

            if (!documents.length) {
                toast.error("Please upload at least one document.");
                return;
            }
            const response = await uploadInwardWithDocuments({
                files: [firstDocument.file],
                payload,
            });

            if (!response?.data?.success) {
                toast.error(response?.data?.message || "Upload failed");
                return;
            }

            const inwardNo = response?.data?.data?.inwardNo;
            const remainingDocuments = documents.slice(1);

            if (remainingDocuments.length > 0) {
                const uploadPromises = remainingDocuments.map((doc: any) =>
                    uploadInwardDocument(
                        doc.file,
                        inwardNo,
                        watch("inward_category")?.toLowerCase(),
                        watch("inward_sub_category"),
                        doc.documentType
                    )
                );

                await Promise.all(uploadPromises);
            }

            toast.success(response.data.message || "Documents uploaded successfully", { duration: 5000, position: "top-right" });

            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.", { duration: 5000, position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const dispatch = useAppDispatch()
    const parentBranches = useAppSelector((state) => state.parentBranchs);
    const { agentData, brokerData, corporateData, policySearchDropdown } = useAppSelector((state) => state.broker);
    const { depertment } = useAppSelector((state) => state.matrix);
    const { insurerMainList } = useAppSelector((state) => state.insurer);

    useEffect(() => {
        dispatch(fetchParentBranches()).catch((error) => {
            console.error("Failed to fetch parent branches:", error);
        });
        dispatch(fetchEscalationMatrixdepartment());
    }, [dispatch]);


    const fecthCategory = async () => {
        const result = await fetchUser(masterApi, `/v1/document-master?onlyName=true&departmentId=${department_id}`);
        if (result?.success && result?.data) {
            const departmentSubtypes = result?.data?.data?.departmentSubtypes ?? [];
            setValue('inward_category', result?.data?.data?.s3BucketName)
            setCategory(departmentSubtypes?.map((item: string) => ({
                label: item,
                value: item,
            }))
            );
        }
    }
    useEffect(() => {
        if (department_id) {
            fecthCategory()
        }
    }, [department_id])
    const fecthDocType = async () => {
        const result = await fetchUser(masterApi, `/v1/document-master?onlyName=true&departmentId=${department_id}&departmentSubtype=${inward_sub_category}`);
        if (result?.success && result?.data) {
            const formatted = transformResponse(result?.data?.data, inward_sub_category);
            setSubOptions(formatted);
        }
    }

    useEffect(() => {
        if (inward_sub_category) {
            fecthDocType()
        }
    }, [inward_sub_category])

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
            case "POLICY":
                dispatch(fetchPolicySearchDropdownData({ size: "100" }));
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
    const insurerListNew = insurerMainList?.map((i: any) => ({
        value: i.id,
        label: i.name,
    }));
    const depertmentListNew = depertment?.map((i: any) => ({
        value: i.departmentId,
        label: i.departmentName,
    }));
    const policyListNew = policySearchDropdown?.map((i: any) => ({
        value: i.policyId,
        label: i.policyNo,
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
            case "POLICY":
                return policyListNew || [];
            default:
                return [];
        }
    }, [selectedEntityType, corporateNameList, brokerNameList, agentNameList, insurerListNew]);

    const fetchPolicyDropdown = (value: string) => {
        dispatch(fetchPolicySearchDropdownData({ policyNo: value }));
    };
    return (
        <div className="p-4 space-y-2">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-3 gap-2">
                    <DropdownSelect
                        label={t("createInwardForm.fields.tpaBranch.label")}
                        defaultValue={t("createInwardForm.fields.tpaBranch.placeholder")}
                        name_key="inward_received_tpa_branch_id"
                        options={parentBranches?.parentBranchs?.map((branch: any) => ({
                            label: branch.name,
                            value: branch.id,
                        })) || []}
                        control={control}
                        name="inward_received_tpa_branch_id"
                        errors={errors.inward_received_tpa_branch_id}
                        isRequired
                        className="h-[38px] rounded-[10px]"
                    />
                    <DropdownSelect
                        label={t("createInwardForm.fields.receivedChannel.label")}
                        defaultValue={t("createInwardForm.fields.receivedChannel.placeholder")}
                        name_key="inward_received_channel"
                        options={[
                            { label: "Email", value: "EMAIL" },
                            { label: "Portal", value: "PORTAL" },
                            { label: "Physical File", value: "PHYSICAL_FILE" },
                        ]}
                        control={control}
                        name="inward_received_channel"
                        errors={errors.inward_received_channel}
                        isRequired
                        className="h-[38px] rounded-[10px]"
                    />
                    <DropdownSelect
                        label={t("createInwardForm.fields.department.label")}
                        defaultValue={t("createInwardForm.fields.department.placeholder")}
                        name_key="department_id"
                        options={depertmentListNew}
                        control={control}
                        name="department_id"
                        errors={errors.department_id}
                        isRequired
                        className="h-[38px] rounded-[10px]"
                    />
                    <DropdownSelect
                        label={t("createInwardForm.fields.sourceEntityType.label")}
                        defaultValue={t("createInwardForm.fields.sourceEntityType.placeholder")}
                        name_key="inward_source_entity_type"
                        options={[
                            { label: "Corporate", value: "CORPORATE" },
                            { label: "Broker", value: "BROKER" },
                            { label: "Agent", value: "AGENT" },
                            { label: "Insurer", value: "INSURER" },
                            { label: "Policy", value: "POLICY" },
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
                        enableSearchFetch={selectedEntityType === "POLICY"}
                        fetchPayload={selectedEntityType === "POLICY" ? fetchPolicyDropdown : undefined}
                    />
                    <Input
                        label={t("createInwardForm.fields.sourceReferenceNo.label")}
                        placeholder={t("createInwardForm.fields.sourceReferenceNo.placeholder")}
                        {...register("inward_source_reference_no")}
                        error={errors.inward_source_reference_no?.message}
                        className="bg-white"
                        isMsg={isMsg}
                    />
                    <DropdownSelect
                        label={t("createInwardForm.fields.category.label")}
                        defaultValue={t("createInwardForm.fields.category.label")}
                        name_key="inward_sub_category"
                        options={category}
                        control={control}
                        name="inward_sub_category"
                        errors={errors.inward_sub_category}
                        isRequired
                        className="h-[38px] rounded-[10px]"
                        disabled={category.length === 0}
                    />
                    <DropdownSelect
                        label={t("createInwardForm.fields.priority.label")}
                        defaultValue={t("createInwardForm.fields.priority.placeholder")}
                        name_key="inward_priority"
                        options={[
                            { label: "High", value: "High" },
                            { label: "Medium", value: "Medium" },
                            { label: "Low", value: "Low" },
                        ]}
                        control={control}
                        name="inward_priority"
                        errors={errors.inward_priority}
                        className="h-[38px] rounded-[10px]"
                    />
                </div>
                <DocumentUploadSection
                    s3SubBucketName={inward_sub_category}
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
                <div className="col-span-2 flex justify-end mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer">
                        {t("inwardUploadDoc.buttons.uploadDocuments")}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default CreateInwardForm;