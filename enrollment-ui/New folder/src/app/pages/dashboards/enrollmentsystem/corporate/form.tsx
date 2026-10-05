import { corporateApi } from "@/app/api/apiService";
import { usePermission } from "@/app/auth/usePermission";
import { AddressSection } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { handleApiError, normalizeEmailsToArray, normalizePhonesToArray } from "@/app/pages/AdminDepartment/tpabranches/function";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import FormLayout from "@/components/shared/form/FormLayout";
import { Input } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchCorporateGroupDatas, fetchCorporateSectorDropdown, fetchOnBoardResolveData } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { showErrorMessage } from "@/utils/errorHandler";
import { PhoneIcon, TrashIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Path, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import FormActionButtons from "../agent/FormActionButtons";
import { CorporateFormValues, CorporateSchema, corporateType, saveAndUpdateCorporate, sizeBandOptions } from "./funcation";
import { handleFormApiErrors } from "@/app/pages/AdminDepartment/tpabranches/handleFormApiErrors";

interface Props {
  data?: any;
  isBoarding?: boolean;
  inwardNo?: string;
  onSuccess?: () => void;
  isMultiStep?: boolean;
}
const AddCorporateForm: React.FC<Props> = ({ data, isBoarding, inwardNo, isMultiStep, onSuccess }) => {
  const { t } = useTranslation()
  const defaultValues: CorporateFormValues = {
    legalName: "",
    corporateType: "",
    corporateGroupId: null,

    pan: null,
    gstin: null,
    cin: null,

    corporateIndustrySectorId: null,
    sizeBand: null,
    employeeCount: null,

    riskTier: null,
    websiteUrl: null,

    corporateHrs: [
      {
        corporateHrId: null,
        corporateHrName: "",
        corporateHrContactMobile: "",
        corporateHrContactEmail: "",
      },
    ],

    effectiveFrom: null,
    effectiveTo: null,

    contactEmail: "",
    contactPhone: "",

    address: {
      address: "",
      city: "",
      stateName: "",
      postalCode: null,
    },
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
    setError,
  } = useForm({
    resolver: yupResolver(CorporateSchema as any),
    defaultValues
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "corporateHrs",
  });
  useEffect(() => {
    setValue('legalName', data?.extraAttribute?.policy_proposer_name)
    setValue('address.address', data?.extraAttribute?.policy_proposer_address)
    setValue('address.postalCode', data?.extraAttribute?.policy_proposer_address_postal_code)
    setValue('pan', data?.extraAttribute?.policy_proposer_pan_number)
    setValue('gstin', data?.extraAttribute?.policy_proposer_gstin)
    setValue('contactPhone', data?.extraAttribute?.policy_proposer_contact_mobile_number)
    setValue('contactEmail', data?.extraAttribute?.policy_proposer_contact_email_id)
  }, [data?.extraAttribute])

  const param = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const policyNo = searchParams.get("policyNo");


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<boolean>(isBoarding ? true : !param?.id);
  const { corporateGroupData, corporateSectorDropdown } = useAppSelector((state) => state.broker);
  const dispatch = useAppDispatch();
  const corporateGroups = corporateGroupData?.map((group: any) => ({
    label: group?.groupName,
    value: group?.corporateGroupId,
  }));
  const corporateSectorDropdownList = corporateSectorDropdown?.map((group: any) => ({
    label: group?.sectorName,
    value: group?.sectorId,
  }));


  const breadcrumbs = isBoarding
    ? [
      { title: t("corporateMaster.breadcrumb.enrolmentSystem") },
      { title: t("corporateMaster.breadcrumb.dashboard"), path: "/enrolment-system/dashboard" },
      { title: t("corporateMaster.breadcrumb.corporateInward"), path: "/enrolment-system/corporate-enrolment" },
      { title: t("corporateMaster.breadcrumb.add") }
    ]
    : [
      { title: t("corporateMaster.masterManagement") },
      { title: t("corporateMaster.breadcrumb.corporate"), path: "/master-management/corporate" },
      { title: param?.id ? t("corporateMaster.breadcrumb.view") : t("corporateMaster.breadcrumb.add") }
    ];
  useBreadcrumb(breadcrumbs);



  useEffect(() => {
    const getCorporateGroup = async () => {
      const url = `/v1/corporates/${param?.id}`;
      const result = await fetchUser(corporateApi, url);

      if (result?.success && result?.data?.data) {
        const group = result.data.data;
        reset({
          legalName: group?.legalName,
          corporateType: group?.corporateType,
          corporateGroupId: group?.corporateGroupId,

          pan: group?.pan,
          gstin: group?.gstin,
          cin: group?.cin,

          corporateIndustrySectorId: group?.corporateIndustrySectorId,
          sizeBand: group?.sizeBand,
          employeeCount: group?.employeeCount,

          corporateHrs: group?.corporateHrs?.map((hr: any) => ({
            corporateHrId: hr.corporateHrId ?? null,
            corporateHrName: hr.corporateHrName ?? "",
            corporateHrContactMobile: Array.isArray(hr.corporateHrContactMobile) ? hr.corporateHrContactMobile.join(",") : (hr.corporateHrContactMobile ?? ""),
            corporateHrContactEmail: Array.isArray(hr.corporateHrContactEmail) ? hr.corporateHrContactEmail.join(",") : (hr.corporateHrContactEmail ?? ""),
          })),

          websiteUrl: group?.websiteUrl,

          effectiveFrom: group?.effectiveFrom,
          effectiveTo: group?.effectiveTo,

          contactEmail: normalizeEmailsToArray(group?.contactEmail).join(", "),
          contactPhone: normalizePhonesToArray(group.contactPhone).join(", "),
          address: {
            address: group.address?.address,
            city: group.address?.city,
            stateName: group.address?.stateName?.toUpperCase(),
            postalCode: group.address?.postalCode,
          },
        });
      } else {
        showErrorMessage(result);
      }
    };

    if (param?.id && !isBoarding) getCorporateGroup();
  }, [param?.id, reset]);
  const corporateFieldMap = {
    pan: "pan",
    gstin: "gstin",
    cin: "cin"
  } satisfies Record<string, Path<any>>;
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    const payload = {
      legalName: data?.legalName,
      corporateType: data?.corporateType,
      corporateGroupId: data?.corporateGroupId,

      pan: data?.pan,
      gstin: data?.gstin,
      cin: data?.cin,

      corporateIndustrySectorId: data.corporateIndustrySectorId,
      sizeBand: data?.sizeBand ? data.sizeBand : null,
      employeeCount: data?.employeeCount,
      websiteUrl: data.websiteUrl,

      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,

      corporateHrs: data?.corporateHrs?.map((hr: any) => ({
        corporateHrName: hr?.corporateHrName || null,
        corporateHrId: hr.corporateHrId ?? null,   // ✅ ADD THIS
        corporateHrContactMobile: hr.corporateHrContactMobile
          ? hr.corporateHrContactMobile?.split(",")
            ?.map((p: any) => p.trim())
            ?.filter(Boolean)
          : null,
        corporateHrContactEmail: hr?.corporateHrContactEmail
          ? hr.corporateHrContactEmail
            ?.split(",")
            ?.map((e: any) => e.trim())
            ?.filter(Boolean)
          : null,
      })),


      contactEmail: normalizeEmailsToArray(data?.contactEmail),
      contactPhone: normalizePhonesToArray(data?.contactPhone),

      address: {
        address: data?.address.address,
        city: data?.address.city,
        stateName: data?.address.stateName,
        postalCode: data?.address.postalCode,
      },
    };
    setLoading(true)
    const result = await saveAndUpdateCorporate(payload, isBoarding ? "" : param?.id);

    if (result?.success) {
      setLoading(false)
      toast.success(result?.data?.message, { position: "top-right", duration: 5000 });
      if (isBoarding) {
        dispatch(fetchOnBoardResolveData({ inwardNo: inwardNo, type: "CORPORATE", masterId: result?.data?.data?.corporateId,policyNo:policyNo }))
      }
      if (isMultiStep) {
        onSuccess?.();
      } else {
        navigate(isBoarding ? "/enrolment-system/corporate-enrolment" : "/master-management/corporate");
      }
    } else if (result?.status === 409) {
      handleFormApiErrors(result as any, setError, corporateFieldMap as any);
      setLoading(false);
    } else {
      handleApiError(result);
    }

    setIsSubmitting(false);
    setLoading(false)

  };

  const readOnly = param?.id && !editing;
  const onEdit = () => setEditing(true);
  const onCancel = () => navigate(isBoarding ? "/enrolment-system/corporate-enrolment" : "/master-management/corporate");

  useEffect(() => {
    dispatch(fetchCorporateGroupDatas({ onlyName: true }));
    dispatch(fetchCorporateSectorDropdown());
  }, []);

  return (
    <FormLayout
      onSubmit={handleSubmit(onSubmit)}
      FormClassName="transition-content w-full px-2 pt-5 lg:pt-2"
    >
      <div className="bg-card border-border rounded-xl border p-2 py-3 shadow-sm">
        <h3 className="sub_section_title text-xl font-semibold text-gray-700">
          {t("corporateMaster.section.corporateInformation")}
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            isRequired
            label={t("corporateMaster.form.legalName")}
            placeholder={t("corporateMaster.placeholder.legalName")}
            {...register("legalName")}
            error={errors?.legalName?.message}
            disabled={readOnly || isSubmitting}
          />
          <DropdownSelect
            name_key="corporateType"
            label={t("corporateMaster.form.corporateType")}
            defaultValue={t("corporateMaster.form.corporateType")}
            options={corporateType}
            control={control}
            name="corporateType"
            errors={errors.corporateType}
            isRequired
            className="h-[38px] rounded-[10px]"
            disabled={readOnly || isSubmitting}
          />
          <DropdownSelect
            label={t("corporateMaster.form.corporateGroup")}
            defaultValue={t("corporateMaster.form.corporateGroup")}
            name_key="corporateGroupId"
            options={corporateGroups}
            control={control}
            name="corporateGroupId"
            isRequired={false}
            errors={errors.corporateGroupId}
            className="h-[38px] rounded-[10px]"
            disabled={readOnly || isSubmitting}
          />
          <Input
            label={t("corporateMaster.form.pan")}
            placeholder={t("corporateMaster.placeholder.pan")}
            {...register("pan")}
            error={errors?.pan?.message}
            disabled={readOnly || isSubmitting}
          />
          <Input
            label={t("corporateMaster.form.gstin")}
            placeholder={t("corporateMaster.placeholder.gstin")}
            {...register("gstin")}
            error={errors?.gstin?.message}
            disabled={readOnly || isSubmitting}
          />
          <Input
            label={t("corporateMaster.form.cin")}
            placeholder={t("corporateMaster.placeholder.cin")}
            {...register("cin")}
            error={errors?.cin?.message}
            disabled={readOnly || isSubmitting}
          />
          <DropdownSelect
            label={t("corporateMaster.form.industrySector")}
            defaultValue={t("corporateMaster.form.industrySector")}
            name_key="corporateIndustrySectorId"
            options={corporateSectorDropdownList}
            control={control}
            name="corporateIndustrySectorId"
            isRequired={false}
            errors={errors.corporateIndustrySectorId}
            className="h-[38px] rounded-[10px]"
            disabled={readOnly || isSubmitting}
          />
          <DropdownSelect
            label={t("corporateMaster.form.sizeBand")}
            defaultValue={t("corporateMaster.form.sizeBand")}
            name_key="sizeBand"
            options={sizeBandOptions}
            control={control}
            name="sizeBand"
            isRequired={false}
            errors={errors.sizeBand}
            className="h-[38px] rounded-[10px]"
            disabled={readOnly || isSubmitting}
          />


          <Input
            label={t("corporateMaster.form.effectiveFrom")}
            placeholder={t("corporateMaster.placeholder.effectiveFrom")}
            type="date"
            {...register("effectiveFrom")}
            error={errors?.effectiveFrom?.message}
            disabled={readOnly || isSubmitting}
          />
          <Input
            label={t("corporateMaster.form.effectiveTo")}
            placeholder={t("corporateMaster.placeholder.effectiveTo")}
            type="date"
            {...register("effectiveTo")}
            error={errors?.effectiveTo?.message}
            disabled={readOnly || isSubmitting}
          />
          <Input
            label={t("corporateMaster.form.employeeCount")}
            placeholder={t("corporateMaster.placeholder.employeeCount")}
            type="number"
            {...register("employeeCount")}
            error={errors?.employeeCount?.message}
            disabled={readOnly || isSubmitting}
          />

          <Input
            label={t("corporateMaster.form.websiteUrl")}
            placeholder={t("corporateMaster.placeholder.websiteUrl")}
            {...register("websiteUrl")}
            error={errors?.websiteUrl?.message}
            disabled={readOnly || isSubmitting}
          />
          <Input
            label={t("corporateMaster.form.contactEmail")}
            placeholder={t("corporateMaster.placeholder.contactEmail")}
            {...register("contactEmail")}
            error={errors?.contactEmail?.message}
            type="text"
            disabled={readOnly || isSubmitting}
          />
          <Input
            isRequired={false}
            label={t("corporateMaster.form.phoneNumber")}
            placeholder={t("corporateMaster.placeholder.phoneNumber")}
            prefix={
              <PhoneIcon
                className="size-5 transition-colors duration-200"
                strokeWidth="1"
              />
            }
            {...register("contactPhone")}
            error={errors?.contactPhone?.message}
            type="text"
            disabled={readOnly || isSubmitting}
          />
        </div>
      </div>
      <div className="bg-card border-border rounded-xl border p-2 py-3 shadow-sm mt-2.5">
        <div className="flex items-center justify-between">
          <h3 className="sub_section_title text-xl font-semibold text-gray-700">
            {t("corporateMaster.section.corporateHrInformation")}
          </h3>

        </div>

        {fields?.map((field, index) => (
          <div
            key={field?.id}
            className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              label={t("corporateMaster.form.corporateHrName")}
              placeholder={t("corporateMaster.placeholder.corporateHrName")}
              {...register(`corporateHrs.${index}.corporateHrName`)}
              error={errors?.corporateHrs?.[index]?.corporateHrName?.message}
              disabled={readOnly || isSubmitting}
            />
            <Input
              label={t("corporateMaster.form.corporateHrPhone")}
              placeholder={t("corporateMaster.placeholder.corporateHrPhone")}
              {...register(`corporateHrs.${index}.corporateHrContactMobile`)}
              error={errors?.corporateHrs?.[index]?.corporateHrContactMobile?.message}
              disabled={readOnly || isSubmitting}
            />
            <div className="relative">
              <Input
                label={t("corporateMaster.form.corporateHrEmail")}
                placeholder={t("corporateMaster.placeholder.corporateHrEmail")}
                {...register(`corporateHrs.${index}.corporateHrContactEmail`)}
                error={errors?.corporateHrs?.[index]?.corporateHrContactEmail?.message}
                disabled={readOnly || isSubmitting}
              />
              {index === 0 && (
                <button
                  type="button"
                  onClick={() => append({ corporateHrId: null, corporateHrName: "", corporateHrContactMobile: "", corporateHrContactEmail: "" })}
                  className="text-xs absolute flex items-center gap-1 text-blue-600  font-medium cursor-pointer right-0 top-0">
                  Add Corporate HR
                </button>
              )}
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 cursor-pointer w-6">
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <AddressSection
        isDisable={!editing}
        register={register}
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isAddressType={false}
        isFieldRequired={false}

      />

        <FormActionButtons
          isSubmitting={isSubmitting}
          loading={loading}
          paramId={param?.id}
          editing={editing}
          onCancel={onCancel}
          onEdit={onEdit}
          isBoarding={isBoarding}

        />
    </FormLayout>
  );
};

export default AddCorporateForm;
