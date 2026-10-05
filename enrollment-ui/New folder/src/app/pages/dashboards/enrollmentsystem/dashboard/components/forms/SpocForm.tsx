// import { useRole } from "@/app/auth/usePermission";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { fetchTPABranchesForSpoc, fetchTPASpocs } from "@/store/features/tpa/tpaSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface Props {
  policyData: any;
}
const SpocForm: React.FC<Props> = ({ policyData }) => {
  const {
    register,
    formState: { errors },
    control,
    reset,
    watch,
    setValue
  } = useFormContext<any>();

  const { branchesForSpoc, spocs } = useAppSelector((state) => state.tpa);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const tpa_servicing_branch = watch("tpa_servicing_branch");
  const tpa_spoc_id = watch("tpa_spoc_id");

  useEffect(() => {
    reset({
      ...policyData?.policyScheduleJsonb?.tpaSpocObject,
    });
  }, [policyData]);
  useEffect(() => {
    dispatch(fetchTPABranchesForSpoc());
  }, [dispatch]);

  useEffect(() => {
    if (tpa_servicing_branch) {
      dispatch(fetchTPASpocs(tpa_servicing_branch));
    }
  }, [tpa_servicing_branch, dispatch]);

  const branchOptions = branchesForSpoc?.map((branch: any) => ({
    label: branch?.name,
    value: branch?.id,
  }));
  const spocOptions = spocs?.map((spoc: any) => ({
    label: spoc?.name,
    value: spoc?.id,
  }));
  useEffect(() => {
    const selected = spocs?.find((spoc: any) => spoc.id === tpa_spoc_id);

    setValue("tpa_spoc_contact_email_id", selected?.emailId?.[0] || "");
    setValue("tpa_spoc_contact_mobile_no", selected?.mobileNo?.[0] || "");
    setValue("tpa_spoc_contact_telephone_no", selected?.telephoneNo?.[0] || "");
  }, [tpa_spoc_id, spocs, setValue]);

  return (
    <div className="grid grid-cols-6 gap-2 md:grid-cols-6">
      <DropdownSelect
        label={t("spocForm.labels.tpaServicingBranch")}
        name="tpa_servicing_branch"
        name_key="tpa_servicing_branch"
        defaultValue={t("spocForm.placeholders.selectBranch")}
        options={branchOptions}
        control={control}
        errors={errors?.tpa_servicing_branch}
        className="h-[38px] rounded-[10px]"
        isRequired
      />
      <DropdownSelect
        label={t("spocForm.labels.tpaSpoc")}
        name="tpa_spoc_id"
        name_key="tpa_spoc_id"
        defaultValue={t("spocForm.placeholders.selectSpoc")}
        options={spocOptions}
        control={control}
        errors={errors?.tpa_spoc_id}
        className="h-[38px] rounded-[10px]"
      />
      {/* <Input
        label={t("spocForm.labels.tpaSpoc")}
        placeholder={t("spocForm.labels.tpaSpoc")}
        {...register("tpa_spoc_id")}
        error={errors?.tpa_spoc_id?.message as string}
        className="bg-white"
      /> */}
      <Input
        label={t("spocForm.labels.tpaFees")}
        placeholder={t("spocForm.placeholders.tpaFees")}
        {...register("tpa_fees")}
        error={errors?.tpa_fees?.message as string}
        className="bg-white"
      />
      <Input
        label={t("spocForm.labels.spocEmailId")}
        placeholder={t("spocForm.placeholders.emailId")}
        {...register("tpa_spoc_contact_email_id")}
        className="bg-white"
        error={errors?.tpa_spoc_contact_email_id?.message as string}
      />
      <Input
        label={t("spocForm.labels.spocMobileNumber")}
        placeholder={t("spocForm.placeholders.mobileNumber")}
        {...register("tpa_spoc_contact_mobile_no")}
        className="bg-white"
        error={errors?.tpa_spoc_contact_mobile_no?.message as string}
      />
      <Input
        label={t("spocForm.labels.telephoneNumber")}
        placeholder={t("spocForm.placeholders.telephoneNumber")}
        {...register("tpa_spoc_contact_telephone_no")}
        className="bg-white"
        error={errors?.tpa_spoc_contact_telephone_no?.message as string}
      />
    </div>
  );
};

export default SpocForm;
