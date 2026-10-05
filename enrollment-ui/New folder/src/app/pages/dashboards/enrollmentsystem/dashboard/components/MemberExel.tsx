import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { getApi, policySearchApi, postApi } from "@/app/api/apiService";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Button, Input } from "@/components/ui";
import { buildQueryParams2 } from "@/store/features/Broker/BrokerApi";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface FormValues {
    insurer_id: string;
    policyNumber: string;
    endorsementId: string;
}

const MemberExcel = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation()

    const inwardType = searchParams.get("inwardType");
    const inwardNo = searchParams.get("inwardNo");
    const { insurerMainList } = useAppSelector((state) => state.insurer);
    const insurerListNew = insurerMainList?.map((i: any) => ({
        value: i?.id,
        label: i?.name,
    })) || [];

    useEffect(() => {
        dispatch(fetchInsurers({ size: "200" }));
    }, [dispatch]);
    const schema = yup.object({
        insurer_id: yup.string().required("Insurer is required"),
        policyNumber: yup.string().required("Policy Number is required"),
        endorsementId: inwardType === "ENDORSEMENT"  ? yup.string().required("Endorsement Number is required") : yup.string().notRequired(),
    });
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, },
    } = useForm<FormValues>({
        resolver: yupResolver(schema as any),
        defaultValues: {
            insurer_id: "",
            policyNumber: "",
            endorsementId: "",
        },
    });
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const EnrollmentMember = async (data: any) => {
        const params = buildQueryParams2(data);
        const newPayload = {
            ...data,
            inwardNo: inwardNo
        }
        const res:any = await getApi(policySearchApi, `v1/policies?${params.toString()}`);
        if (res?.success) {
            toast.success(res?.data?.message, { duration: 5000, position: "top-right" })
            KakfaEvent(newPayload)
        } else if (res?.status === 500) {
            toast.error(res?.error, { duration: 5000, position: "top-right" })
        } else if (res?.status === 404) {
            toast.error(res?.error, { duration: 5000, position: "top-right" })
        }
        else {
            toast.error(res?.message, { duration: 5000, position: "top-right" })
        }
        setIsSubmitting(false);

    }

    const KakfaEvent = async (payload: any) => {
        const endpoint = "v1/policy-endorsements/member-data/send-kafka"
        const res = await postApi<any, any>(policySearchApi, endpoint, payload);
        if (res?.success) {
            navigate("/enrolment-system/corporate-enrolment");
        } else if (res?.status === 500) {
            toast.error(res?.message, { duration: 5000, position: "top-right" })
        } else if (res?.status === 404) {
            toast.error(res?.message, { duration: 5000, position: "top-right" })
        }
        else {
            toast.error(res?.message, { duration: 5000, position: "top-right" })
        }
        setIsSubmitting(false);
    }

    const EndorsementMember = async (payload: any) => {
        const endpoint = "v1/policy-endorsements/search"
        const newPayload = {
            ...payload,
            inwardNo: inwardNo
        }

        const res = await postApi<any, any>(policySearchApi, endpoint, payload);
        if (res?.success) {
            toast.success(res?.data?.message, { duration: 5000, position: "top-right" })
            KakfaEvent(newPayload)
        } else if (res?.status === 500) {
            toast.error(res?.message, { duration: 5000, position: "top-right" })
        } else if (res?.status === 404) {
            if (res?.message) {
                toast.error(res?.message, { duration: 5000, position: "top-right" })
            } else {
                toast.error(res?.error, { duration: 5000, position: "top-right" })
            }
        } else {
            toast.error(res?.message, { duration: 5000, position: "top-right" })
        }
        setIsSubmitting(false);
    }

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        const payload = {
            insurerId: data?.insurer_id,
            policyNo: data?.policyNumber,
            endorsementNo: data?.endorsementId,
        };
        if (inwardType === "ENDORSEMENT") {
            EndorsementMember(payload)
        } else {
            EnrollmentMember(payload)
        }
    };

    const handleReset = () => {
        reset();
    };
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-1 lg:grid-cols-4 lg:gap-1">
                {(inwardType === "ENROLLMENT" ||
                    inwardType === "ENDORSEMENT") && (
                        <>
                            <DropdownSelect
                                label={t("memberExcel.fields.insurerName")}
                                name_key="insurer_id"
                                defaultValue="Insurer"
                                options={insurerListNew}
                                control={control}
                                name="insurer_id"
                                errors={errors.insurer_id}
                                isRequired
                                className="h-[38px] rounded-[10px]"
                            />
                            <Input
                                label={t("memberExcel.fields.policyNumber")}
                                placeholder={t("memberExcel.fields.policyNumber")}
                                {...register("policyNumber")}
                                error={errors.policyNumber?.message}
                                className="bg-white"
                                isRequired
                            />
                        </>
                    )}
                {inwardType === "ENDORSEMENT" && (
                    <Input
                        label={t("memberExcel.fields.endorsementNumber")}
                        placeholder={t("memberExcel.fields.endorsementNumber")}
                        {...register("endorsementId")}
                        error={errors.endorsementId?.message}
                        className="bg-white"
                        isRequired
                    />
                )}
                <div className="md:col-span-1 flex justify-end">
                    <div className="flex items-end gap-3">
                        <Button
                            type="button"
                            color="primary"
                            onClick={handleReset}
                            className="p-1.5 text-[11px]">
                            {t("memberExcel.buttons.reset")}
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            disabled={isSubmitting}
                            className="p-1.5 text-[11px]">
                            {isSubmitting ? t("memberExcel.buttons.searching") : t("memberExcel.buttons.search")}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default MemberExcel;