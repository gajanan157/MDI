import { eCardService, getApi, postApi, putApi } from "@/app/api/apiService";
import { handleApiError } from "@/app/pages/AdminDepartment/tpabranches/function";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { buildQueryParams2 } from "@/store/features/Broker/BrokerApi";
import { fetchCorporateDatas, fetchPolicySearchDropdownData } from "@/store/features/Broker/BrokerSlice";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Input } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import CommonSearch, { SearchField } from "../../../CommonSearch";
import PreviewFrame from "./listing/PreviewFrame";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";

export const labelConfigurationSchema = yup.object({
    corporateId: yup.string().required("Corporate is required"),
    policyId: yup.string().nullable().notRequired(),
});

export interface ECardConfForm {
    template: string;
    insurer_id: string | undefined;
    corporateId: string | undefined;
}

const ECardConf = () => {
    const { corporateData, policySearchDropdown } = useAppSelector((state) => state.broker);
    const { t } = useTranslation()
          useBreadcrumb([
            { title: t("nav.dashboards.enrollmentsystem") },
            { title: t("nav.dashboards.ecardmanagement") },
            { title: t("nav.dashboards.e-card") },
        ]);        


    const corporateList = corporateData?.map((group: any) => ({
        label: group?.corporateName,
        value: group?.corporateId,
    }));
    const policyListNew = policySearchDropdown?.map((i: any) => ({
        value: i.policyId,
        label: i.policyNo,
    }));

    const fields: SearchField[] = [
        { name: "insurerId", label: t("corporateInward.searchFields.insurerName"), type: "dropdown", options: [], isRequired: true },
        { name: "corporateId", label: t("corporateInward.searchFields.corporateName"), type: "dropdown", options: corporateList, isRequired: false },
        { name: "policyId", label: t("corporateInward.searchFields.policyNumber"), type: "dropdown", options: policyListNew, isRequired: false },
    ];


    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchCorporateDatas({ onlyName: true }));
        dispatch(fetchInsurers({ size: "100" }));
        dispatch(fetchPolicySearchDropdownData({ size: "2000" }));
    }, [])
    interface TemplateDetailsResponse {
        success: boolean;
        error: string;
        data: {
            data: {
                templateConfigurationId: string;
                insurerId: string;
                corporateId: string;
                policyId: string;
                labels: {
                    uuid: string;
                    value: string;
                }[];
            };
        };
    }

    const [labelFields, setLabelFields] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [insurerId, setInsurerId] = useState(null);
    const [corporateId, setCorporateId] = useState<string | undefined>("");
    const [policyId, setPolicyId] = useState<string | undefined>("");
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm({
        resolver: yupResolver(labelConfigurationSchema),
        defaultValues: {
            corporateId: corporateId,
            policyId: policyId,
        },
    });
    const handleSearch = async (data: Record<string, any>) => {
        setPreviewUrl(null)
        setLabelFields([])
        setLoading(true);
        const payload = {
            insurerId: data?.insurerId,
            corporateId: data?.corporateId,
            policyId: data?.policyId,
        }
        const params = buildQueryParams2(payload);
        const res = (await getApi(
            eCardService,
            `v1/ecards/template-details?${params}`
        )) as TemplateDetailsResponse;

        if (res.success) {
            const data = res?.data?.data as any;
            setInsurerId(data?.insurerId);
            setCorporateId(data?.corporateId);
            setPolicyId(data?.policyId);
            setValue("corporateId", data?.corporateId);
            setValue("policyId", data?.policyId);

            const labels = (data.labels || [])?.map((item: any) => ({
                label: item.value,
                uuid: item.uuid,
                value: item.value,
                defaultValue: item.defaultValue,
            }));
            setLabelFields(labels);
            fetchPreview(labels, data.insurerId, data.corporateId, data.policyId);
        } else {
            setLabelFields([])
            if (data?.insurerId) { toast.error(res?.error, { duration: 3000 }) }
        }
        setLoading(false);
    };
    const fetchPreview = async (
        labels: any[],
        insurerId?: string | null,
        corporateId?: string | null,
        policyId?: string | null
    ) => {
        try {
            setPreviewLoading(true);

            const payload = {
                templateLabels: labels.map((item: any) => ({
                    uuid: item.uuid,
                    value: item.value,
                    defaultValue: item.defaultValue,
                })),
            };

            const queryParams = new URLSearchParams();

            if (insurerId) queryParams.append("insurerId", insurerId);
            if (corporateId) queryParams.append("corporateId", corporateId);
            if (policyId) queryParams.append("policyId", policyId);

            const res = await postApi(
                eCardService,
                `v1/ecards/preview?${queryParams.toString()}`,
                payload,
                {
                    responseType: "blob",
                }
            );
            const blob = new Blob([(res as any).data], {
                type: "application/pdf",
            });
            const previewBlob = URL.createObjectURL(blob)

            setPreviewUrl(previewBlob);

        } catch (error) {
            console.log(error)
            toast.error("Unable to load preview");
        } finally {
            setPreviewLoading(false);
        }
    };
const handleLabelChange = (uuid: string, value: string) => {
    const regex = /^[A-Za-z\s\-\/&()]*$/;

    if (!regex.test(value)) {
        return; // Ignore invalid input
    }

    setLabelFields((prev) =>
        prev.map((item) =>
            item.uuid === uuid
                ? { ...item, value }
                : item
        )
    );

    setError((prev) => ({
        ...prev,
        [uuid]: "",
    }));
};

    const [error, setError] = useState<Record<string, string>>({});

    const handleSave = async (data: any) => {
        const validationErrors: Record<string, string> = {};

        labelFields?.forEach((item: any) => {
            const value = item.value?.trim() || "";

            if (!value) {
                validationErrors[item.uuid] = `${item.label} is required.`;
            } else if (value.length > 15) {
                validationErrors[item.uuid] = `${item.label} cannot exceed 15 characters.`;
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setError(validationErrors);
            return;
        }
        try {
            setLoading(true);
            const payload = {
                templateLabels: labelFields?.map((item: any) => ({
                    uuid: item.uuid,
                    value: item.value,
                    defaultValue: item.defaultValue,
                })),
            };
            const queryParams = new URLSearchParams({
                insurerId: insurerId as any,
                corporateId: data?.corporateId,
            });

            if (data?.policyId) {
                queryParams.append("policyId", data.policyId);
            }

            const res = await putApi(eCardService, `v1/ecards/template-customization?${queryParams.toString()}`, payload);
            if (res?.success) {
                toast.success("Labels updated successfully", { duration: 2000 });
                setEditingId(null);
                fetchPreview(labelFields, insurerId, corporateId, policyId)
            } else {
                handleApiError(res);
            }
        } catch (error: any) {
            toast.error(error)
        } finally {
            setLoading(false);
        }
    };
    return (
        <Page title="E-Card Template Configuration">
            <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                <CompactPageHeader
                    title="E-Card Template Configuration"
                    recordLabel="Labels"
                    statusBadge="Template Designer"
                />

                <CommonSearch
                    fields={fields}
                    onSearch={handleSearch}
                    isSubmitting={loading}
                    isState
                    showToggleButton={false}
                    isOpen={true}
                />

                <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
                    {labelFields?.length > 0 && (
                        <form className="w-[42%] flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden dark:border-dark-600 dark:bg-dark-800" onSubmit={handleSubmit(handleSave)}>
                            <div className="p-2 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <h2 className="text-xs font-semibold text-slate-800">
                                    Label Configuration
                                </h2>
                                <span className="text-[11px] text-slate-500">
                                    {labelFields.length} fields configured
                                </span>
                            </div>

                            <div className="p-2.5 flex-1 min-h-0 overflow-y-auto space-y-2">
                                <div className="grid grid-cols-[130px_1fr_40px] gap-2 font-semibold text-slate-600 text-xs mb-1">
                                    <span>Original Label</span>
                                    <span>Changed Label</span>
                                    <span className="text-center">Action</span>
                                </div>

                                {labelFields.map((item: any) => (
                                    <div
                                        key={item.uuid}
                                        className="grid grid-cols-[130px_1fr_40px] gap-2 items-center text-xs">
                                        <span className="text-slate-700 font-medium truncate" title={item.defaultValue}>
                                            {item.defaultValue} <span className="text-red-500">*</span>
                                        </span>
                                        <div className="flex flex-col">
                                            <Input
                                                placeholder={item.label}
                                                value={item.value}
                                                disabled={editingId !== item.uuid}
                                                onChange={(e) => handleLabelChange(item.uuid, e.target.value)}
                                                className={`rounded-md text-xs text-slate-800 h-7 px-2 border focus:border-primary-600 ${editingId !== item.uuid ? "bg-slate-50 text-slate-500" : "bg-white border-primary-500"}`}
                                            />
                                            {error[item.uuid] && (
                                                <p className="text-[10px] text-red-500 mt-0.5">
                                                    {error[item.uuid]}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                className="cursor-pointer border border-slate-200 rounded-md h-7 w-7 flex items-center justify-center text-xs hover:bg-slate-100"
                                                onClick={() => setEditingId(editingId === item.uuid ? null : item.uuid)}>
                                                {editingId === item.uuid ? "✓" : "✎"}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                    <DropdownSelect
                                        label={t("corporateForm.labels.corporateName")}
                                        defaultValue={t("corporateForm.placeholders.corporateName")}
                                        name_key="corporateId"
                                        options={corporateList}
                                        control={control}
                                        name="corporateId"
                                        isRequired
                                        errors={errors.corporateId}
                                        className="h-8 rounded-lg text-xs"
                                        formClassName="w-full"
                                    />
                                    <DropdownSelect
                                        label={t("corporateInward.searchFields.policyNumber")}
                                        defaultValue={t("corporateInward.searchFields.policyNumber")}
                                        name_key="policyId"
                                        options={policyListNew}
                                        control={control}
                                        name="policyId"
                                        isRequired={false}
                                        errors={errors.policyId}
                                        className="h-8 rounded-lg text-xs"
                                        formClassName="w-full"
                                    />
                                </div>
                            </div>

                            <div className="p-2 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/50">
                                <button
                                    disabled={loading}
                                    className="cursor-pointer bg-primary-600 text-white rounded-lg px-3 h-7 text-xs font-medium hover:bg-primary-700 disabled:opacity-50">
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}

                    {(previewLoading || previewUrl) && (
                        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden dark:border-dark-600 dark:bg-dark-800">
                            <div className="p-2 border-b border-slate-100 shrink-0">
                                <h2 className="text-xs font-semibold text-slate-800">
                                    E-Card Preview
                                </h2>
                            </div>
                            <div className="p-2 flex-1 min-h-0 overflow-auto">
                                <PreviewFrame
                                    previewLoading={previewLoading}
                                    previewUrl={previewUrl}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Page>
    );
    );
};

export default ECardConf;