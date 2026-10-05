import { corporateApi, insurerApi, masterBenefitApi, policySearchApi } from "@/app/api/apiService";
import { useRole } from "@/app/auth/usePermission";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { add365Days, DateInput, formatDateForDatePicker } from "@/components/ui/Form/DateInput";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { TrashIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { InwardFormData } from "../types";
import FamilyDefinition from "./FamilyDefinition";
import { toNumber } from "./FamilyRule";
// import ToggleCard from "./ToggleCard";
import YesNoRadio from "./YesNoRadioProps";
import CreateCorporateInwardModal from "../CreateCorporateInwardModal";

interface Props { policyData: any, currentStep: string }

const PolicyForm: React.FC<Props> = ({ policyData }) => {
  const {
    register,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useFormContext<InwardFormData>();
  const {
    fields: gradeFields,
    append: addGrade,
    remove: removeGrade,
  } = useFieldArray({
    control,
    name: "grades",
  });
  const {
    fields: designationFields,
    append: addDesignation,
    remove: removeDesignation,
  } = useFieldArray({
    control,
    name: "designations",
  });
  interface DummyNumberOption {
    label: string;
    value: string;
  }

  interface CorporateGroup {
    corporateGroupName: string;
  }

  interface Insurer {
    id: string;
    name: string;
  }

  interface DummyNumber {
    label: string;
    value: string;
  }

  interface DummyPolicy {
    dummyPolicyNumber: string;
    corporate: string;
    insurer: string;
  }

  const createDummyPolicies = (
    corporateGroup: CorporateGroup | null,
    insurer: Insurer | null,
    dummyNumbers: DummyNumber[]
  ): DummyPolicy[] => {
    if (!corporateGroup || !insurer || !dummyNumbers.length) {
      return [];
    }

    return dummyNumbers.map(({ label }) => ({
      dummyPolicyNumber: label,
      corporate: corporateGroup.corporateGroupName,
      insurer: insurer.name,
    }));
  };

  const [showInfo, setShowInfo] = useState(false);
  const [dummyNumber, setDummyNumber] = useState<DummyNumberOption[]>([]);
  const linkDummyNumber = watch("linkDummyNumber");
  const [corporateGroup, setCorporateGroup] = useState<any>(null);
  const [insurer, setInsurer] = useState<any>(null);

  const [dummyPolicyNumber, setDummyPolicyNumber] = useState<string>("");

  useEffect(() => {
    if (dummyPolicyNumber) {
      setValue("dummyPolicyNumber", dummyPolicyNumber);
    }
  }, [dummyPolicyNumber, setValue]);

  const insurerId = policyData?.policyScheduleJsonb?.icObject?.insurer_id;

  const corporateId = policyData?.policyScheduleJsonb?.corporateObject?.corporateId;

  useEffect(() => {
    const fetchDummyNumber = async () => {
      try {
        const url = `/v1/enroll/policy/dummy-search` + `?insurerId=${insurerId}` + `&corporateId=${corporateId}`;
        const result = await fetchUser(policySearchApi, url);

        if (result?.success && result?.data) {
          const dummyOptions = (result?.data?.data || [])?.map((item: string) => ({ label: item, value: item }));
          setDummyNumber(dummyOptions);
        } else {
          setDummyNumber([]);
        }
      } catch (error) {
        console.error("Error fetching dummy number:", error);
        setDummyNumber([]);
      }
    };

    if (corporateId && insurerId && linkDummyNumber) {
      fetchDummyNumber();
    }
    if (corporateId && linkDummyNumber) {
      getCorporateGroup(corporateId)
    }
    if (insurerId && linkDummyNumber) {
      getInsurer(insurerId)
    }
  }, [insurerId, corporateId, linkDummyNumber]);



  const getCorporateGroup = async (corporateId: string) => {
    const url = `/v1/corporates/${corporateId}`;
    const result = await fetchUser(corporateApi, url);

    if (result?.success && result?.data?.data) {
      const group = result.data.data;

      setCorporateGroup(group);
    } else {
      setCorporateGroup(null);
    }
  };
  const getInsurer = async (insurerId: string) => {
    const result = await fetchUser(
      insurerApi,
      `/v1/insurer/${insurerId}`
    );

    if (result?.success && result?.data?.data) {
      const insurerData = result.data.data;

      setInsurer(insurerData);
    } else {
      setInsurer(null);
    }
  };

  const dummyPolicies = useMemo(
    () =>
      createDummyPolicies(
        corporateGroup,
        insurer,
        dummyNumber
      ),
    [corporateGroup, insurer, dummyNumber]
  );


  const { isProcessor, isQC } = useRole();
  const queryParams = new URLSearchParams(location.search);
  const policyNo = queryParams.get("policyNo");
  const policyRecordType = queryParams.get("policyRecordType");
  const recordType = policyRecordType?.toUpperCase() === "LIVE" ? "LIVE" : "DUMMY";
  const policyRenewalType = watch("policyRenewalType");
  const policyCorporateBufferFlag = watch("policyCorporateBufferFlag");
  const policyCopaymentFlag = watch("policyCopaymentFlag");
  const policy_co_insurer_Flag = watch("policy_co_insurer_Flag")

  type PolicySubTypeOption = {
    label: string;
    value: string;
  };

  const [policySubTypeOptions, setPolicySubTypeOptions] = useState<PolicySubTypeOption[]>([]);

  const fetchPlanType = async () => {
    const result = await fetchUser(masterBenefitApi, `/v1/plan-types?onlyName=true`)
    if (result?.success && result?.data) {
      const options = result.data.data.map((item: any) => ({
        label: item.planTypeName,
        value: item.planTypeId,
      }));

      setPolicySubTypeOptions(options);
    }
  }
  useEffect(() => {
    fetchPlanType()
  }, [])

  type CoinsuranceOption = {
    label: string;
    value: "PRIMARY" | "SECONDARY" | "TERTIARY" | "QUATERNARY";
  };
  const allTypes: CoinsuranceOption[] = [
    { label: "Primary", value: "PRIMARY" },
    { label: "Secondary", value: "SECONDARY" },
    { label: "Tertiary", value: "TERTIARY" },
    { label: "Quaternary", value: "QUATERNARY" },
  ];
  const selectedPlanTypeId = watch("policySubType");
  const selectedPlanType = policySubTypeOptions.find((item: any) => item.value === selectedPlanTypeId)?.label;
  const gradeEnabled = watch("gradeEnabled");
  const designationEnabled = watch("designationEnabled");
  const sumInsured = watch("sumInsured");
  const netPremium = watch("netPremium");
  const grossPremium = watch("grossPremium");
  useEffect(() => {
    const policyObject = policyData?.policyScheduleJsonb?.policyObject
    const metadata = policyData?.policyScheduleJsonb?.policy_details
    const policy_premium_details = policyData?.policyScheduleJsonb?.policy_premium_details
    const intermediary_details = policyData?.policyScheduleJsonb?.intermediary_details
    const savedSumInsured = policyObject?.sumInsured
    const hasSavedSumInsured = savedSumInsured != null && savedSumInsured !== ""
    const resolvedSumInsured = toNumber(
      hasSavedSumInsured
        ? savedSumInsured
        : (policy_premium_details?.policy_total_sum_insured ??
          metadata?.policy_total_sum_insured),
    )


    if (isQC) {
      reset({
        ...policyObject,
        sumInsured: resolvedSumInsured,
        grossPremium: toNumber(policyObject?.grossPremium),
        netPremium: toNumber(policyObject?.netPremium),
      })
      return
    }
    if (isProcessor) {
      const hasPolicyNumber = policyObject?.policyNumber != null && policyObject?.policyNumber !== ""
      if (hasPolicyNumber) {
        reset({
          ...policyObject,
          sumInsured: resolvedSumInsured,
          grossPremium: toNumber(policyObject?.grossPremium),
          netPremium: toNumber(policyObject?.netPremium),
        })
      } else {
        const netPremium = toNumber(policy_premium_details?.premium_net_amount);
        setValue("policyRecordType",recordType)
        setValue("policyNumber", metadata?.policy_number || policyNo)
        setValue("policyStartDate", metadata?.policy_start_date)
        setValue("policyEndDate", metadata?.policy_end_date)
        setValue("previousPolicyNumber", metadata?.previous_policy_number)
        setValue("sumInsured", resolvedSumInsured)
        setValue("netPremium", toNumber(policy_premium_details?.premium_net_amount))
        // setValue("grossPremium", toNumber(policy_premium_details?.premium_gross_amount))
        const grossPremium = Number((netPremium * 1.18).toFixed(2));
        setValue("grossPremium", grossPremium, {
          shouldDirty: false,
          shouldValidate: false,
        });
        setValue("totalLivesInsured", metadata?.policy_identifiers?.total_lives_insured)

        setValue("policy_divisional_officer_name", intermediary_details?.divisional_officer?.policy_divisional_officer_name)
        setValue("policy_divisional_officer_code", intermediary_details?.divisional_officer?.policy_divisional_officer_code)
        setValue("policy_divisional_officer_contact_email_id", intermediary_details?.divisional_officer?.policy_divisional_officer_contact_email_id)
        setValue("policy_divisional_officer_contact_mobile_no", intermediary_details?.divisional_officer?.policy_divisional_officer_contact_mobile_number)
        setValue("policy_divisional_officer_contact_telephone_no", intermediary_details?.divisional_officer?.policy_divisional_officer_contact_telephone_number)

        setValue("policyCorporateBufferFlag", "NO")
        setValue("policyCopaymentFlag", "NO")
        setValue("policy_co_insurer_Flag", "NO")
        setValue("physical_cards_required", "NO")
        setValue("e_card_type", "NON_PHOTO")
        setValue("vip_tagging", "NO")
        setValue("client_welcome_mailer", "NO")
        setValue("corporate_payee", true)
      }
    }
  }, [isProcessor, isQC, policyData, reset, setValue])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "co_insurers",
  });

  const { insurerMainList } = useAppSelector((state) => state.insurer);
  const insurerListNew = insurerMainList?.map((i: any) => ({
    value: i?.id,
    label: i?.name,
  }));
  useEffect(() => {
    if (gradeEnabled && gradeFields.length === 0) {
      addGrade({ name: "", sumInsured: "" });
    }
  }, [gradeEnabled]);

  useEffect(() => {
    if (designationEnabled && designationFields.length === 0) {
      addDesignation({ name: "", sumInsured: "" });
    }
  }, [designationEnabled]);


  const corporatePayee = watch("corporate_payee");
  const insuredPayee = watch("insured_payee");
  const policyStartDate = watch("policyStartDate");
  const coInsurers = watch("co_insurers");

  const totalEmployee = watch("totalEmployee");
  const totalDependent = watch("totalDependent");
  const eCardType = watch("e_card_type");


  useEffect(() => {
    const total = (Number(totalEmployee)) + (Number(totalDependent) || 0);

    setValue("totalLivesInsured", String(total));
  }, [totalEmployee, totalDependent]);

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        <DropdownSelect
          label="Policy Record Type"
          name_key="policyRecordType"
          defaultValue="Policy Record Type"
          options={[
            { label: "Live", value: "LIVE" },
            { label: "Dummy", value: "DUMMY" },
          ]}
          control={control}
          name="policyRecordType"
          errors={errors.policyRecordType}
          isRequired
        />
        <DropdownSelect
          label="Plan Type"
          name_key="policySubType"
          defaultValue="Plan Type"
          options={policySubTypeOptions}
          control={control}
          name="policySubType"
          errors={errors.policySubType}
          isRequired
        />
        <div className="flex relative w-full">
          <Input
            label="Policy Number"
            {...register("policyNumber")}
            error={errors.policyNumber?.message}
            className="bg-white w-full"
            placeholder="Policy Number"
            isRequired
            disabled={isQC || !!policyNo}
            isFull={true}
          />
          <div className="absolute right-0">
            <label className="flex items-center gap-1 cursor-pointer input-label ">
              <input type="checkbox" {...register("linkDummyNumber")} />Link Dummy Policy
            </label>
          </div>
        </div>
         {linkDummyNumber && (
          <div className="flex justify-between w-full items-center gap-1">
            <DropdownSelect
              label="Dummy Policy Number"
              name_key="dummyPolicyNumber"
              defaultValue="Policy Number"
              options={dummyNumber}
              control={control}
              name="dummyPolicyNumber"
              errors={errors.dummyPolicyNumber}
              className="w-full"
              isFull={true}
            />
            <div
              onClick={() => setShowInfo(true)}
              className="mt-5 flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[5px] border border-[#cccccc]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#333333"
                  strokeWidth="2"
                />
                <path
                  d="M12 11V16"
                  stroke="#333333"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="8" r="1" fill="#333333" />
              </svg>
            </div>

          </div>
        )}
        {selectedPlanType === "Base Policy" && (
          <Input
            label="Top Up Policy Number"
            {...register("policySubTypePolicyNumber")}
            error={errors.policySubTypePolicyNumber?.message}
            className="bg-white"
            placeholder="Enter Top Up Policy Number"
          // isRequired
          />
        )}
        {(selectedPlanType === "Top Up Policy" || selectedPlanType === "Parental Policy") && (
          <Input
            label="Base Policy Number"
            {...register("policySubTypePolicyNumber")}
            error={errors.policySubTypePolicyNumber?.message}
            className="bg-white"
            placeholder="Enter Base Policy Number"
          // isRequired
          />
        )}
       
        <DropdownSelect
          label="Coverage Type"
          name_key="policyPlan"
          defaultValue="Coverage Type"
          options={[
            { label: "Individual", value: "INDIVIDUAL" },
            { label: "Family Floater ", value: "FAMILY_FLOATER" },
          ]}
          control={control}
          name="policyPlan"
          errors={errors.policyPlan}
          isRequired
        />
        <DropdownSelect
          label="Policy Type"
          name_key="policyRenewalType"
          defaultValue="Policy Type"
          options={[
            { label: "Fresh", value: "FRESH" },
            { label: "Renewal", value: "RENEWAL" },
          ]}
          control={control}
          name="policyRenewalType"
          errors={errors.policyRenewalType}
          isRequired
        />
        {(policyRenewalType === "RENEWAL") && (
          <Input
            label="Previous Policy Number"
            {...register("previousPolicyNumber")}
            error={errors.previousPolicyNumber?.message}
            className="bg-white"
            placeholder="Previous Policy Number"
          // isRequired
          />
        )}

        <Controller
          name="policyStartDate"
          control={control}
          render={({ field }) => (
            <DateInput
              label="Policy Start Date"
              value={field.value}
              onChange={(date: any) => {
                const formattedStartDate = formatDateForDatePicker(date);

                field.onChange(formattedStartDate);

                // Calculate end date
                const endDate = add365Days(date);

                setValue(
                  "policyEndDate",
                  formatDateForDatePicker(endDate),
                  { shouldValidate: true }
                );
              }}
              error={errors.policyStartDate?.message}
              isRequired
            />
          )}
        />
        <Controller
          name="policyEndDate"
          control={control}
          render={({ field }) => (
            <DateInput
              label="Policy End Date"
              value={field.value}
              onChange={(date) => field.onChange(formatDateForDatePicker(date))}
              error={errors.policyEndDate?.message}
              isRequired
              minDate={policyStartDate ? new Date(policyStartDate) : null}
            />
          )}
        />
        <Input
          label="Total Sum Insured"
          type="text"
          {...register("sumInsured")}
          value={sumInsured}
          onChange={(e) =>
            setValue("sumInsured", toNumber(e.target.value), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          error={errors.sumInsured?.message}
          className="bg-white"
          placeholder="Sum Insured"
          isRequired
          formatNumber
          isPrice
        />
        <Input
          label="Net Premium"
          type="text"
          {...register("netPremium")}
          value={netPremium}
          onChange={(e) => {
            const val = toNumber(e.target.value);
            setValue("netPremium", val, {
              shouldDirty: true,
              shouldValidate: true,
            });
            if (val) {
              const grossPremium = Number((val * 1.18).toFixed(2));
              setValue("grossPremium", grossPremium, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          }}
          error={errors.netPremium?.message}
          isRequired
          className="bg-white"
          placeholder="Net Premium"
          formatNumber
          isPrice
        />
        <Input
          label="Gross Premium"
          type="text"
          {...register("grossPremium")}
          value={grossPremium}
          onChange={(e) =>
            setValue("grossPremium", toNumber(e.target.value), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          error={errors.grossPremium?.message}
          isRequired
          className="bg-white"
          placeholder="Gross Premium"
          formatNumber
          isPrice
        />
        <div className="flex gap-2">
          <Input
            label="Total Employees"
            {...register("totalEmployee")}
            error={errors.totalEmployee?.message}
            className="bg-white w-full"
            placeholder="Employees"
            type="number"
          />
          <Input
            label="Total Dependant"
            {...register("totalDependent")}
            error={errors.totalDependent?.message}
            className="bg-white w-full"
            placeholder="Dependant"
            type="number"
          />
        </div>
        <Input
          label="Total No. of Lives"
          {...register("totalLivesInsured")}
          error={errors.totalLivesInsured?.message}
          className="bg-white"
          placeholder="Lives Insured"
          type="number"
        // isRequired
        />
        <DropdownSelect
          label="Corporate Buffer Flag"
          name_key="policyCorporateBufferFlag"
          defaultValue="Corporate Buffer Flag"
          options={[
            { label: "Yes", value: "YES" },
            { label: "No", value: "NO" },
          ]}
          control={control}
          name="policyCorporateBufferFlag"
          errors={errors.policyCorporateBufferFlag}
          isRequired
        />
        {policyCorporateBufferFlag === "YES" && (
          <Input
            label="Corporate Buffer Amount"
            type="number"
            {...register("policyCorporateBufferAmount")}
            error={errors.policyCorporateBufferAmount?.message}
            className="bg-white"
            placeholder="Corporate Buffer Amount"
          />
        )}
        <DropdownSelect
          label="Copayment Flag"
          name_key="policyCopaymentFlag"
          defaultValue="Copayment Flag"
          options={[
            { label: "Yes", value: "YES" },
            { label: "No", value: "NO" },
          ]}
          control={control}
          name="policyCopaymentFlag"
          errors={errors.policyCopaymentFlag}
        />
        {policyCopaymentFlag === "YES" && (
          <Input
            label="Copayment Percentage"
            type="number"
            {...register("policyCopaymentPercentage")}
            error={errors.policyCopaymentPercentage?.message}
            className="bg-white"
            placeholder="Copayment Percentage"
          />
        )}
        {policyCopaymentFlag === "YES" && (
          <Input
            label="Copayment Amount"
            type="number"
            {...register("policyCopaymentAmount")}
            error={errors.policyCopaymentAmount?.message}
            className="bg-white"
            placeholder="Copayment Amount"
          />
        )}
        <div className="relative">
          <DropdownSelect
            label="Policy Co-Insurer Flag"
            name_key="policy_co_insurer_Flag"
            defaultValue="Co-Policy Insurer Flag"
            options={[
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ]}
            control={control}
            name="policy_co_insurer_Flag"
            errors={errors.policy_co_insurer_Flag}
          />
          {(policy_co_insurer_Flag === "YES" && fields.length < 4) &&
            <button
              type="button"
              onClick={() =>
                append({
                  co_insurer_name: null,
                  policy_co_insurer_share_percentage: null,
                  policy_coinsurance_type: null,
                })
              }
              className="absolute text-blue-600 cursor-pointer text-[12px] ml-[-75px] top-0 right-0">
              + Add Co-Insurer
            </button>
          }
        </div>
      </div>
      {policy_co_insurer_Flag === "YES" && (
        <div className="">
          {fields?.map((field, index) => {
            const selectedTypes = coInsurers?.map((item, i) => i !== index ? item?.policy_coinsurance_type : null)
              .filter(Boolean) || [];

            const availableOptions = allTypes?.filter((option) => !selectedTypes.includes(option?.value) || option.value === coInsurers?.[index]?.policy_coinsurance_type);
            return (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 rounded-lg">
                <DropdownSelect
                  label="Co-Insurer Name"
                  name_key={`co_insurers.${index}.co_insurer_name`}
                  defaultValue="Co-insurer Name"
                  options={insurerListNew}
                  control={control}
                  name={`co_insurers.${index}.co_insurer_name`}
                  errors={errors?.co_insurers?.[index]?.co_insurer_name}
                  isRequired
                />
                <DropdownSelect
                  label="Co-insurer Type"
                  name_key={`co_insurers.${index}.policy_coinsurance_type`}
                  defaultValue="Co-insurer Type"
                  options={availableOptions}
                  control={control}
                  name={`co_insurers.${index}.policy_coinsurance_type`}
                  errors={errors?.co_insurers?.[index]?.policy_coinsurance_type}
                  isRequired
                />
                <Input
                  label="Share Percentage"
                  type="number"
                  {...register(
                    `co_insurers.${index}.policy_co_insurer_share_percentage`
                  )}
                  error={
                    errors?.co_insurers?.[index]
                      ?.policy_co_insurer_share_percentage?.message
                  }
                  isRequired
                  className="bg-white"
                  placeholder="Share Percentage"
                />
                {fields?.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 cursor-pointer mt-5 -ml-2 w-6 h-8"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block mb-2 text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
            E-card Type<span className="text-red-600"> *</span>
          </label>

          <div className="flex gap-4">
            <label className="flex items-center gap-2  cursor-pointer text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
              <input
                type="radio"
                value="PHOTO"
                checked={eCardType === "PHOTO"}
                onChange={() => setValue("e_card_type", "PHOTO")}
              />
              Photo
            </label>
            <label className="flex items-center gap-2  cursor-pointer text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
              <input
                type="radio"
                value="NON_PHOTO"
                checked={eCardType === "NON_PHOTO"}
                onChange={() => setValue("e_card_type", "NON_PHOTO")}

              />
              Non-Photo
            </label>
          </div>
          {errors.e_card_type?.message ? (
            <p className="mt-1 text-xs text-red-600">{errors.e_card_type.message}</p>
          ) : null}
        </div>
        <YesNoRadio
          label="Physical Cards Required"
          name="physical_cards_required"
          register={register}
        />
        <YesNoRadio
          label="VIP Tagging"
          name="vip_tagging"
          register={register}
        />
        <YesNoRadio
          label="Client Welcome Mailer"
          name="client_welcome_mailer"
          register={register}
        />
        <div>
          <label className="block mb-2 text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
            Payee<span className="text-red-600"> *</span>
          </label>

          <div className="flex gap-4">
            <label className="flex items-center gap-2  cursor-pointer text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
              <input
                type="radio"
                checked={corporatePayee === true}
                onChange={() => {
                  setValue("corporate_payee", true, { shouldValidate: true, shouldDirty: true });
                  setValue("insured_payee", false, { shouldValidate: true, shouldDirty: true });
                }}
              />
              Corporate
            </label>
            <label className="flex items-center gap-2  cursor-pointer text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
              <input
                type="radio"
                checked={insuredPayee === true}
                onChange={() => {
                  setValue("corporate_payee", false, { shouldValidate: true, shouldDirty: true });
                  setValue("insured_payee", true, { shouldValidate: true, shouldDirty: true });
                }}
              />
              Insured
            </label>
          </div>
          {errors.corporate_payee?.message ? (
            <p className="mt-1 text-xs text-red-600">{errors.corporate_payee.message}</p>
          ) : null}
        </div>


      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
        <Input
          label="Divisional officer name"
          {...register("policy_divisional_officer_name")}
          error={errors.policy_divisional_officer_name?.message}
          className="bg-white"
          placeholder="Divisional officer name"
        />
        <Input
          label="Divisional Officer code"
          {...register("policy_divisional_officer_code")}
          error={errors.policy_divisional_officer_code?.message}
          className="bg-white"
          placeholder="Divisional officer code"
          type="nummber"
        />
        <Input
          label="Divisional Officer Email"
          {...register("policy_divisional_officer_contact_email_id")}
          error={errors.policy_divisional_officer_contact_email_id?.message}
          className="bg-white"
          placeholder="Divisional officer email"
        />
        <Input
          label="Divisional officer mobile number"
          {...register("policy_divisional_officer_contact_mobile_no")}
          error={errors.policy_divisional_officer_contact_mobile_no?.message}
          className="bg-white"
          placeholder="Divisional officer mobile number"
          type="number"
        />
        <Input
          label="Divisional officer telephone number"
          {...register("policy_divisional_officer_contact_telephone_no")}
          error={errors.policy_divisional_officer_contact_telephone_no?.message}
          className="bg-white"
          placeholder="Divisional officer telephone number"
          type="number"
        />
      </div>

      <FamilyDefinition />
      {/* <div className="bg-gray-50">
        <div className="flex gap-2">
          <Controller
            name="gradeEnabled"
            control={control}
            render={({ field }) => (
              <ToggleCard
                title="Grade Based Coverage"
                description="Enable coverage based on employee grade"
                checked={!!field.value}
                onChange={() => field.onChange(!field.value)}
              />
            )}
          />
          <Controller
            name="designationEnabled"
            control={control}
            render={({ field }) => (
              <ToggleCard
                title="Designation Based Coverage"
                description="Enable coverage based on employee designation"
                checked={!!field.value}
                onChange={() => field.onChange(!field.value)}
              />
            )}
          />
        </div>
        <div className="flex gap-2 mt-2">
          {gradeEnabled ? (
            <div className="bg-white border rounded-xl p-4 w-1/2">
              <div className="flex justify-between mb-3">
                <h2 className="font-bold text-[11px]">Sum Insured - Grade Based</h2>
                <button
                  type="button"
                  onClick={() => addGrade({ name: "", sumInsured: "" })}
                  className="text-blue-600 cursor-pointer">
                  + Add Grade
                </button>
              </div>
              {gradeFields?.map((item, index) => (
                <div key={item.id} className="flex gap-2 mb-2 flex-row w-full items-start">
                  <div className="w-[46%]">
                    <Input
                      label=""
                      type="text"
                      {...register(`grades.${index}.name`)}
                      error={errors?.grades?.[index]?.name?.message}
                      isRequired
                      className="bg-white text-[11px]"
                      placeholder="Grade (e.g., L1, L2)"
                    />
                  </div>
                  <div className="w-[46%]">
                    <Input
                      label=""
                      type="number"
                      {...register(`grades.${index}.sumInsured`)}
                      error={errors?.grades?.[index]?.sumInsured?.message}
                      isRequired
                      className="bg-white text-[11px]"
                      placeholder="Sum Insured Amount"
                    />
                  </div>
                  {gradeFields?.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGrade(index)}
                      className="text-red-500 cursor-pointer mt-2">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : <div className="p-4 w-1/2"></div>
          }
          {designationEnabled && (
            <div className="bg-white border rounded-xl p-4 w-1/2">
              <div className="flex justify-between mb-3">
                <h2 className="font-bold text-[11px]">
                  Sum Insured - Designation Based
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    addDesignation({ name: "", sumInsured: "" })}
                  className="text-blue-600 cursor-pointer">
                  + Add Designation
                </button>
              </div>
              {designationFields?.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-2 mb-2 flex-row w-full items-start"
                >
                  <div className="w-[46%]">
                    <Input
                      label=""
                      type="text"
                      {...register(`designations.${index}.name`)}
                      error={errors?.designations?.[index]?.name?.message}
                      isRequired
                      className="bg-white text-[11px]"
                      placeholder="Designation"
                    />
                  </div>
                  <div className="w-[46%]">
                    <Input
                      label=""
                      type="number"
                      {...register(`designations.${index}.sumInsured`)}
                      error={errors?.designations?.[index]?.sumInsured?.message}
                      isRequired
                      className="bg-white text-[11px]"
                      placeholder="Sum Insured Amount"
                    />
                  </div>
                  {designationFields?.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDesignation(index)}
                      className="text-red-500 cursor-pointer mt-2">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div> */}

      {showInfo && (
        <CreateCorporateInwardModal
          open={showInfo}
          onClose={() => setShowInfo(false)}
          isDummyPopup
          isData={dummyPolicies}
          setDummyPolicyNumber={setDummyPolicyNumber}
        />
      )}
    </>
  );
};
export default PolicyForm;