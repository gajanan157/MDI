import { agentApi } from "@/app/api/apiService";
import { AddressSection } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import {
  handleApiError, normalizeEmailsToArray, normalizePhonesToArray,
} from "@/app/pages/AdminDepartment/tpabranches/function";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import FormLayout from "@/components/shared/form/FormLayout";
import { Input } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchOnBoardResolveData } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { showErrorMessage } from "@/utils/errorHandler";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import FormActionButtons from "./FormActionButtons";
import { AGENT_TYPE_OPTIONS, AgentSchema, saveAndUpdateAgent } from "./funcation";

interface Props {
  data?: any;
  isBoarding?: boolean;
  inwardNo?: string;
  onSuccess?: () => void;
  isMultiStep?: boolean;

}
const AddAgentForm: React.FC<Props> = ({ data, isBoarding, inwardNo, onSuccess, isMultiStep }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(AgentSchema),
  });
  useEffect(() => {
    setValue('legalName', data?.extraAttribute?.agent?.agent_name)
    setValue('irdaAgentCode', data?.extraAttribute?.agent?.agent_code)
    setValue('contactEmail', data?.extraAttribute?.agent?.agent_contact_email_id)
    setValue('contactPhone', data?.extraAttribute?.agent?.mobile || data?.extraAttribute?.agent?.agent_contact_mobile_number)
  }, [data?.extraAttribute])
  const { t } = useTranslation();

  const param = useParams();
  const dispatch = useAppDispatch()
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const policyNo = searchParams.get("policyNo");
  const breadcrumbs = isBoarding
    ?
    [
      { title: t("agentMaster.breadcrumb.enrolmentSystem") },
      { title: t("agentMaster.breadcrumb.dashboard"), path: "/enrolment-system/dashboard" },
      { title: t("agentMaster.breadcrumb.corporateInward"), path: "/enrolment-system/corporate-enrolment" },
      { title: t("agentMaster.breadcrumb.add") },
    ]
    : [
      { title: t("agentMaster.masterManagement") },
      { title: t("agentMaster.breadcrumb.agent"), path: "/master-management/agent" },
      {
        title: param?.id
          ? t("agentMaster.breadcrumb.view")
          : t("agentMaster.breadcrumb.add"),
      },
    ];

  useBreadcrumb(breadcrumbs);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<boolean>(isBoarding ? true : !param?.id);

  const navigate = useNavigate();

  useEffect(() => {
    const getAgent = async () => {
      const url = `/v1/agents/${param?.id}`;
      //
      const result = await fetchUser(agentApi, url);

      if (result?.success && result?.data) {
        const agent = result?.data?.data;
        const formData: any = {
          agentType: agent?.agentType,
          irdaAgentCode: agent?.irdaAgentCode,
          legalName: agent?.legalName,
          licenseValidFrom: agent?.licenseValidFrom,
          licenseValidTo: agent?.licenseValidTo,
          contactEmail: normalizeEmailsToArray(agent?.contactEmail).join(", "),
          contactPhone: normalizePhonesToArray(agent?.contactPhone).join(", "),
          address: {
            address: agent?.address?.address,
            city: agent?.address?.city,
            stateName: agent?.address?.stateName,
            postalCode: agent?.address?.postalCode,
          },
        };
        reset(formData);
      } else {
        showErrorMessage(result);
      }
    };

    if (param?.id && !isBoarding) {
      getAgent();
    }
  }, [param?.id]);

  const onSubmit = async (data: any) => {
    const payload = {
      agentType: data?.agentType,
      irdaAgentCode: data?.irdaAgentCode,
      legalName: data?.legalName,
      licenseValidFrom: data?.licenseValidFrom,
      licenseValidTo: data?.licenseValidTo,
      contactEmail: normalizeEmailsToArray(data.contactEmail),
      contactPhone: normalizePhonesToArray(data.contactPhone),
      address: {
        address: data.address.address,
        city: data?.address.city,
        stateName: data?.address.stateName,
        postalCode: data?.address.postalCode,
      },
    };

    setLoading(true);

    const result = await saveAndUpdateAgent(payload, isBoarding ? "" : param?.id);

    if (result.success) {
      setIsSubmitting(false);
      setLoading(false);
      toast.success(result?.data?.message, { position: "top-right", duration: 5000 });
      if (isBoarding) {
        dispatch(fetchOnBoardResolveData({ inwardNo: inwardNo, type: "AGENT", masterId: result?.data?.data?.agentId, policyNo: policyNo }))
      }
      if (isMultiStep) {
        onSuccess?.();
      } else {
        navigate(isBoarding ? "/enrolment-system/corporate-enrolment" : "/master-management/agent");
      }
    } else if (result?.status === 409) {
      toast.error(result?.message, { position: "top-right", duration: 5000 });
      setLoading(false);
    } else {
      handleApiError(result);
      setLoading(false);
    }
  };

  const readOnly = param?.id && !editing;
  const onCancel = () => navigate(isBoarding ? "/enrolment-system/corporate-enrolment" : "/master-management/agent");
  ;
  const onEdit = () => setEditing(true);
  return (
    <FormLayout
      onSubmit={handleSubmit(onSubmit)}
      FormClassName="transition-content w-full px-2 pt-5 lg:pt-2"
    >
      <div className="min-w-0">
        <div className="bg-card border-border rounded-xl border p-2 py-4 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700">
            {t("agentMaster.section.agentInformation")}
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              isRequired
              label={t("agentMaster.form.legalName")}
              placeholder={t("agentMaster.placeholder.legalName")}
              {...register("legalName")}
              error={errors?.legalName?.message}
              disabled={readOnly || isSubmitting}
            />
            <DropdownSelect
              label={t("agentMaster.form.agentType")}
              defaultValue={t("agentMaster.dropdown.agentType")}
              name_key="agentType"
              options={AGENT_TYPE_OPTIONS}
              control={control}
              name="agentType"
              errors={errors.agentType}
              isRequired
              className="h-[38px] rounded-[10px]"
              disabled={readOnly || isSubmitting}
            />
            <Input
              label={t("agentMaster.form.agentCode")}
              placeholder={t("agentMaster.placeholder.agentCode")}
              {...register("irdaAgentCode")}
              error={errors?.irdaAgentCode?.message}
              disabled={readOnly || isSubmitting}
              isRequired
            />
            <Input
              label={t("agentMaster.form.email")}
              placeholder={t("agentMaster.placeholder.email")}
              prefix={
                <EnvelopeIcon
                  className="size-5 transition-colors duration-200"
                  strokeWidth="1"
                />
              }
              {...register("contactEmail")}
              error={errors?.contactEmail?.message}
              disabled={readOnly || isSubmitting}
            />

            <Input
              label={t("agentMaster.form.phone")}
              placeholder={t("agentMaster.placeholder.phone")}
              {...register("contactPhone")}
              error={errors?.contactPhone?.message}
              disabled={readOnly || isSubmitting}
            />
            <Input
              label={t("agentMaster.form.licenseValidFrom")}
              type="date"
              {...register("licenseValidFrom")}
              error={errors?.licenseValidFrom?.message}
              disabled={readOnly || isSubmitting}
            />
            <Input
              label={t("agentMaster.form.licenseValidTo")}
              type="date"
              {...register("licenseValidTo")}
              error={errors?.licenseValidTo?.message}
              disabled={readOnly || isSubmitting}
            />
          </div>
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
      </div>
    </FormLayout>
  );
};

export default AddAgentForm;
