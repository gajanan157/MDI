import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { InwardFormData } from "../types";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { insurerApi } from "@/app/api/apiService";
import { fetchMasterProducts } from "@/store/features/masterProduct/masterProductSlice";
import { useTranslation } from "react-i18next";


interface Props { policyData: any }

const InsurerForm: React.FC<Props> = ({ policyData }) => {
    const { control, watch, setValue, formState: { errors } } = useFormContext<InwardFormData>();
    const { t } = useTranslation();
    const insurerType = watch("insurerType");
    const insurer_id = watch("insurer_id");
    const insurer_issuing_office_id = watch("insurer_issuing_office_id")
    const productValue = policyData?.product

    const { productList } = useAppSelector((state: any) => state.masterProduct);

    const payload = { queryObj: { insurerId: insurer_id }, page: 1, size: 100 }

    const productOptions = productList?.map((product: any) => ({
        label: product?.productName,
        value: product?.masterProductId,
    })) || [];

    const icObject = policyData?.policyScheduleJsonb?.icObject;
    
    useEffect(() => {
        if (policyData?.policyScheduleJsonb?.icObject) {
            setValue("insurer_issuing_office_id", icObject?.insurer_issuing_office_id)
            setValue("insurer_regional_office_id", icObject?.insurer_regional_office_id)
            setValue("insurer_divisional_office_id", icObject?.insurer_divisional_office_id)
        }
        setValue("insurer_id", icObject?.insurer_id || policyData?.insurerId || "");
        setValue("insurerType", icObject?.insurerType || policyData?.policyScheduleJsonb?.insurer?.insurer_type || "");
        setValue("master_product_id", productValue?.id || icObject?.master_product_id)
    }, [policyData?.insurerId])

    const [uiOffice, setUiOffice] = useState<any>(null);

    const url = `/v1/insurer/${insurer_id}/uo-offices`;
    const getIssuingOfficeData = async () => {
        const result = await fetchUser(insurerApi, url);
        if (result?.success && result?.data) {
            const formattedOffices = result?.data?.data?.map((item: any) => ({
                label: policyData?.insurer?.insurerType === "PSU" ? `${item?.officeCode}-${item.officeType}` : item.officeName,
                value: item.officeId,
            }));

            setUiOffice(formattedOffices);

        }
    };
    const [hoOffice, setHoOffice] = useState<{ label: string; value: string }[]>([]);
    const [doOffice, setDoOffice] = useState<{ label: string; value: string }[]>([]);

    const newurl = `/v1/insurer/hierarchy?insurerId=${insurer_id}&insurerOfficeId=${insurer_issuing_office_id}`;

    const getHeadOfficeAndDivisionalOfficeData = async () => {
        const result = await fetchUser(insurerApi, newurl);
        if (result?.success && result?.data) {
            const office = result?.data?.hoOffice;
            const doOffice = result?.data?.doOffice;

            const formattedOffice = { label: String(office?.officeName), value: String(office?.officeId) };
            setHoOffice([formattedOffice]);

            setValue("insurer_regional_office_id", office?.officeId);

            const doOfficeOffice = { label: doOffice?.officeName, value: doOffice?.officeId };
            setDoOffice([doOfficeOffice]);
        }
    };

    useEffect(() => {
        if (insurer_id) {
            getIssuingOfficeData();
            dispatch(fetchMasterProducts(payload as any));
        }
    }, [insurer_id]);
    useEffect(() => {
        if (insurer_issuing_office_id) {
            setValue("insurer_regional_office_id", '')
            getHeadOfficeAndDivisionalOfficeData();
        }
    }, [insurer_issuing_office_id]);

    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchInsurers({ size: "200" }));
    }, [])

    const { insurerMainList } = useAppSelector((state) => state.insurer);
    const insurerListNew = insurerMainList?.map((i: any) => ({
        value: i?.id,
        label: i?.name,
    }));
    useEffect(() => {
        if (insurer_id && insurerMainList?.length) {
            const selectedInsurer = insurerMainList?.find((item: any) => item?.id === insurer_id);
            if (selectedInsurer?.insurerType) {
                setValue("insurerType", selectedInsurer.insurerType as "PSU" | "PRIVATE");
            }
        }
    }, [insurer_id, insurerMainList, setValue]);
    return (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            <DropdownSelect
                label={t("icForm.insurerName")}
                defaultValue={t("icForm.placeholders.insurer")}
                name_key="insurer_id"
                options={insurerListNew}
                control={control}
                name="insurer_id"
                errors={errors.insurer_id}
                isRequired
                className="h-[38px] rounded-[10px]"
                disabled={!!policyData?.insurerId}
            />
            <DropdownSelect
                label={t("icForm.insurerType")}
                defaultValue={t("icForm.placeholders.type")}
                name_key="insurerType"
                options={[{ label: "PSU", value: "PSU" }, { label: "Private", value: "PRIVATE" },]}
                control={control}
                name="insurerType"
                errors={errors.insurerType}
                className="h-[38px] rounded-[10px]"
                disabled={!!policyData?.insurer?.insurerType}
            />
            <DropdownSelect
                label={t("icForm.productName")}
                defaultValue={t("icForm.placeholders.product")}
                name_key="master_product_id"
                options={productValue ? [{ label: productValue?.name, value: productValue?.id }] : productOptions}
                control={control}
                name="master_product_id"
                errors={errors.master_product_id}
                isRequired
                className="h-[38px] rounded-[10px]"
            />
            <DropdownSelect
                label={policyData?.insurer?.insurerType === "PSU" ? "Issuing Office Code" : t("icForm.issuingOffice")}
                defaultValue={policyData?.insurer?.insurerType === "PSU" ? "Issuing Office Code" : t("icForm.placeholders.issuingOffice")}
                name_key="insurer_issuing_office_id"
                options={uiOffice}
                control={control}
                name="insurer_issuing_office_id"
                errors={errors.insurer_issuing_office_id}
                isRequired={insurerType === "PSU"}
                className="h-[38px] rounded-[10px]"
            />
            <DropdownSelect
                label={t("icForm.headOffice")}
                defaultValue={t("icForm.placeholders.headOffice")}
                name_key="insurer_regional_office_id"
                options={hoOffice}
                control={control}
                name="insurer_regional_office_id"
                errors={errors.insurer_regional_office_id}
                isRequired={insurerType === "PSU"}
                className="h-[38px] rounded-[10px]"
            />
            {insurerType === "PSU" && (
                <DropdownSelect
                    label={t("icForm.divisionalOffice")}
                    defaultValue={t("icForm.divisionalOffice")}
                    name_key="insurer_divisional_office_id"
                    options={doOffice}
                    control={control}
                    name="insurer_divisional_office_id"
                    errors={errors.insurer_divisional_office_id}
                    isRequired={false}
                    className="h-[38px] rounded-[10px]"
                />
            )}
        </div>
    );
};
export default InsurerForm;
