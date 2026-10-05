import React, { useMemo, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { InwardFormData } from "../types";
import { Input } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Source } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import {
    fetchCitiesByState,
    fetchStates,
} from "@/store/features/stateCity/stateCitySlice";
import { fetchCorporateDatas, fetchCorporateGroupDatas, fetchCorporateSectorDropdown } from "@/store/features/Broker/BrokerSlice";
import { useRole } from "@/app/auth/usePermission";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { corporateApi } from "@/app/api/apiService";
import { showErrorMessage } from "@/utils/errorHandler";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

interface Props { policyData: any }

const CorporateForm: React.FC<Props> = ({ policyData }) => {
    const { register, control, watch, setValue, reset, formState: { errors } } = useFormContext<InwardFormData>();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate()
    const { isProcessor } = useRole();
    const { cityList, stateList } = useAppSelector((s) => s.stateCity);
    const pinCode = watch("postalCode");
    const corporateId = watch("corporateId");
    const city = watch("city");
    const stateName = watch("stateName");


    useEffect(() => {
        if (!policyData) return;

        const corporateObject = policyData?.policyScheduleJsonb?.corporateObject || {};
        const corporate = policyData?.policyScheduleJsonb?.proposal_details || {};
        const email = corporate?.policy_proposer_contact_email_id?.trim() || corporateObject?.corpEmail || "";
        if (!isProcessor) {
            reset({
                ...corporateObject
            });
            return;
        }
        reset({
            ...corporateObject,

            corporateId: corporateObject.corporateId || policyData?.corporate?.corporateId || "",
            groupName: corporateObject.groupName || policyData?.corporate?.corporateGroupId || "",
            address: corporateObject.address || corporate.policy_proposer_address || "",
            postalCode: corporateObject.postalCode || corporate.policy_proposer_address_postal_code || "",
            policy_proposer_gst_number: corporateObject.policy_proposer_gst_number || corporate.policy_proposer_gstin || "",
            policy_proposer_pan_number: corporateObject.policy_proposer_pan_number || corporate.policy_proposer_pan_number || "",

            corpEmail: email,

            corpMobile: corporateObject.corpMobile || corporate.policy_proposer_contact_mobile_number || "",
            policy_proposer_contact_telephone_no: corporateObject.policy_proposer_contact_telephone_no || corporate.policy_proposer_contact_telephone_number || ""
        });

    }, [policyData, isProcessor, reset]);

    const sourceRef = useRef<Source>(null);
    const programmaticRef = useRef(false);

    useEffect(() => {
        dispatch(fetchStates());
    }, [dispatch]);


    useEffect(() => {
        if (!programmaticRef.current && pinCode) sourceRef.current = "pin";
    }, [pinCode]);

    useEffect(() => {
        if (!programmaticRef.current && city) sourceRef.current = "city";
    }, [city]);

    useEffect(() => {
        if (programmaticRef.current) return;
        if (stateName) sourceRef.current = "state";
    }, [stateName]);

    useEffect(() => {
        if (sourceRef.current !== "pin" || pinCode?.length !== 6) return;

        dispatch(fetchCitiesByState({ pinCode, stateName: "", size: 300 }));
    }, [pinCode, dispatch]);

    /* ---------- PIN → AUTO CITY + STATE ---------- */
    useEffect(() => {
        if (sourceRef.current !== "pin" || !pinCode || cityList.length === 0)
            return;

        const match = cityList.find((c: any) => c.postalCode === pinCode);
        if (!match) return;

        programmaticRef.current = true;
        setValue("city", match.city, { shouldDirty: false, shouldValidate: true });
        setValue("stateName", match.stateName, { shouldDirty: false, shouldValidate: true });
        programmaticRef.current = false;

        sourceRef.current = null;
    }, [pinCode, cityList, setValue]);

    /* ---------- CITY → AUTO PIN + STATE ---------- */
    useEffect(() => {
        if (sourceRef.current !== "city" || !city || cityList.length === 0) return;

        const match = cityList.find((c: any) => c.city === city);
        if (!match) return;

        programmaticRef.current = true;
        setValue("postalCode", match.postalCode, {
            shouldDirty: false,
        });
        setValue("stateName", match.stateName, {
            shouldDirty: false,
        });
        programmaticRef.current = false;

        sourceRef.current = null;
    }, [city, cityList, setValue]);

    /* ---------- OPTIONS ---------- */
    const cityOptions = useMemo(() => {
        const options = cityList?.map((c: any) => ({
            label: c?.city,
            value: c?.city,
        }));

        // If city value exists but isn't in options, add it to ensure it displays correctly
        if (city && !options.some((opt: any) => opt.value === city)) {
            options.unshift({ label: city, value: city });
        }

        return options;
    }, [cityList, city]);

    const stateOptions = useMemo(
        () =>
            stateList?.map((s: any) => ({
                label: s?.stateName,
                value: s?.stateName,
            })),
        [stateList],
    );
    const { corporateGroupData, corporateData } = useAppSelector((state) => state.broker);
    const corporateGroups = corporateGroupData?.map((group: any) => ({
        label: group?.groupName,
        value: group?.corporateGroupId,
    }));
    const corporateList = corporateData?.map((group: any) => ({
        label: group?.corporateName,
        value: group?.corporateId,
    }));
    useEffect(() => {
        dispatch(fetchCorporateGroupDatas({ onlyName: true }));
        dispatch(fetchCorporateDatas({ onlyName: true }));
        dispatch(fetchCorporateSectorDropdown());

    }, []);

    const { corporateSectorDropdown } = useAppSelector((state) => state.broker);

    const corporateSectorDropdownList = corporateSectorDropdown?.map((group: any) => ({
        label: group?.sectorName,
        value: group?.sectorId,
    }));



    const getCorporateGroup = async () => {
        const url = `/v1/corporates/${corporateId}`;
        const result = await fetchUser(corporateApi, url);

        if (result?.success && result?.data?.data) {
            const group = result?.data?.data;
            setValue("groupName", group?.corporateGroupId || "");
            setValue("corporateIndustrySectorId", group?.corporateIndustrySectorId || "");
            setValue("corpEmail", group?.contactEmail || "");
            setValue("corpMobile", group?.contactPhone || "");
            setValue("policy_proposer_contact_telephone_no", group?.address?.contactPhone || "");
            setValue("address", group.address?.address || "");
            setValue("city", group.address?.city || "");
            setValue("stateName", group.address?.stateName || "");
            setValue("postalCode", group.address?.postalCode || "");

            setValue("policy_proposer_gst_number", group?.gstin || "");
            setValue("policy_proposer_pan_number", group?.pan || "");
        } else {
            showErrorMessage(result);
        }
    };
    useEffect(() => {
        if (corporateId && !policyData?.policyScheduleJsonb?.corporateObject) {
            getCorporateGroup();
        }
    }, [corporateId]);
    return (
        <div className="grid grid-cols-8 gap-2">
            <div className="col-span-2 flex relative">
                <DropdownSelect
                    label={t("corporateForm.labels.corporateName")}
                    defaultValue={t("corporateForm.placeholders.corporateName")}
                    name_key="corporateId"
                    options={corporateList}
                    control={control}
                    name="corporateId"
                    isRequired={true}
                    errors={errors.corporateId}
                    className="h-[38px] rounded-[10px]"
                    formClassName="w-full"
                />
                <h1
                    className="absolute right-0 cursor-pointer text-blue-600 hover:underline text-[12px]"
                    onClick={() => navigate("/master-management/add-corporate")}
                >
                    {t("corporateForm.actions.addCorporate")}
                </h1>
            </div>
            <div className="col-span-2">
                <DropdownSelect
                    label={t("corporateForm.labels.groupName")}
                    defaultValue={t("corporateForm.placeholders.groupName")}
                    name_key="groupName"
                    options={corporateGroups}
                    control={control}
                    name="groupName"
                    errors={errors.groupName}
                    className="h-[38px] rounded-[10px]"
                />
            </div>
            <div className="col-span-2">
                <Input
                    label={t("corporateForm.labels.email")}
                    placeholder={t("corporateForm.placeholders.email")}
                    {...register("corpEmail")}
                    error={errors?.corpEmail?.message as string}
                    className="bg-white"
                />
            </div>
            <div className="col-span-2">
                <Input
                    label={t("corporateForm.labels.telephone")}
                    placeholder={t("corporateForm.placeholders.telephone")}
                    {...register("policy_proposer_contact_telephone_no")}
                    error={
                        errors?.policy_proposer_contact_telephone_no?.message as string
                    }
                    className="bg-white"
                />
            </div>
            <div className="col-span-2">
                <Input
                    label={t("corporateForm.labels.contactNumber")}
                    placeholder={t("corporateForm.placeholders.contactNumber")}
                    {...register("corpMobile")}
                    error={errors?.corpMobile?.message as string}
                    className="bg-white"
                />
            </div>
            <div className="col-span-3">
                <Input
                    label={t("corporateForm.labels.address")}
                    placeholder={t("corporateForm.placeholders.address")}
                    {...register("address")}
                    error={errors?.address?.message as string}
                    isRequired
                    className="bg-white"
                />
            </div>
            <div className="col-span-1">
                <Input
                    label={t("corporateForm.labels.pinCode")}
                    placeholder={t("corporateForm.placeholders.pinCode")}
                    {...register("postalCode")}
                    error={errors?.postalCode?.message as string}
                    type="text"
                    isRequired
                    className="bg-white"
                />
            </div>
            <div className="col-span-1">
                <DropdownSelect
                    label={t("corporateForm.labels.state")}
                    defaultValue={t("corporateForm.placeholders.state")}
                    name="stateName"
                    options={stateOptions}
                    control={control}
                    errors={errors?.stateName}
                    disabled={true}
                    isRequired
                    formClassName="w-full"
                />
            </div>
            <div className="col-span-1">
                <DropdownSelect
                    label={t("corporateForm.labels.city")}
                    defaultValue={t("corporateForm.placeholders.city")}
                    name="city"
                    options={cityOptions}
                    control={control}
                    errors={errors?.city}
                    disabled={true}
                    isRequired
                    formClassName="w-full"
                />
            </div>
            <div className="col-span-2">
                <DropdownSelect
                    label={t("corporateForm.labels.industrySector")}
                    defaultValue={t("corporateForm.placeholders.industrySector")}
                    name_key="corporateIndustrySectorId"
                    options={corporateSectorDropdownList}
                    control={control}
                    name="corporateIndustrySectorId"
                    isRequired={true}
                    errors={errors.corporateIndustrySectorId}
                    className="h-[38px] rounded-[10px]"
                    disabled={false}
                />
            </div>
            <div className="col-span-2">
                <Input
                    label={t("corporateForm.labels.panNumber")}
                    placeholder={t("corporateForm.placeholders.panNumber")}
                    {...register("policy_proposer_pan_number")}
                    error={errors?.policy_proposer_pan_number?.message as string}
                    className="bg-white"
                />
            </div>
            <div className="col-span-2">
                <Input
                    label={t("corporateForm.labels.gstNumber")}
                    placeholder={t("corporateForm.placeholders.gstNumber")}
                    {...register("policy_proposer_gst_number")}
                    error={errors?.policy_proposer_gst_number?.message as string}
                    className="bg-white"
                />
            </div>
        </div>
    );
};

export default CorporateForm;