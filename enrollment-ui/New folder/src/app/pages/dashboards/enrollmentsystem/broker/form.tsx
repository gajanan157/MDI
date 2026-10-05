import { brokerApi } from "@/app/api/apiService";
import { AddressSection } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import {
  handleApiError,
  normalizeEmailsToArray,
  normalizePhonesToArray,
} from "@/app/pages/AdminDepartment/tpabranches/function";
import { handleFormApiErrors } from "@/app/pages/AdminDepartment/tpabranches/handleFormApiErrors";
import FormLayout from "@/components/shared/form/FormLayout";
import { Input } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchOnBoardResolveData } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { showErrorMessage } from "@/utils/errorHandler";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Path, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import FormActionButtons from "../agent/FormActionButtons";
import { BrokerSchema, saveAndUpdateBroker } from "./funcation";

interface Props {
  data?: any;
  isBoarding?: boolean;
  inwardNo?: string;
  onSuccess?: () => void;
  isMultiStep?: boolean; // ⭐ NEW

}
const AddBrokerForm: React.FC<Props> = ({ data, isBoarding, inwardNo, isMultiStep, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    reset,
    setError
  } = useForm({
    resolver: yupResolver(BrokerSchema),
    defaultValues: {
      address: {
        address: "",
        city: "",
        stateName: "",
        postalCode: "",
      },
    },
  });
  const { t } = useTranslation();
  useEffect(() => {
    setValue('legalName', data?.extraAttribute?.broker?.broker_name)
    setValue('irdaBrokerCode', data?.extraAttribute?.broker?.broker_code)
    setValue('contactEmail', data?.extraAttribute?.broker?.broker_contact_email_id)
    setValue('contactPhone', data?.extraAttribute?.broker?.mobile||data?.extraAttribute?.broker?.broker_contact_mobile_number)
  }, [data?.extraAttribute])


  const cgroupFieldMap = {
    legalName: "legalName",
    irdaBrokerCode: "irdaBrokerCode",
  } satisfies Record<string, Path<any>>;

  const param = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const policyNo = searchParams.get("policyNo");

  const breadcrumbs = isBoarding
    ? [
      { title: t("brokerMaster.breadcrumb.enrolmentSystem") },
      { title: t("brokerMaster.breadcrumb.dashboard"), path: "/enrolment-system/dashboard" },
      { title: t("brokerMaster.breadcrumb.corporateInward"), path: "/enrolment-system/corporate-enrolment" },
      { title: t("brokerMaster.breadcrumb.add") },
    ]
    : [
      { title: t("brokerMaster.masterManagement") },
      { title: t("brokerMaster.breadcrumb.broker"), path: "/master-management/broker" },
      { title: param?.id ? t("brokerMaster.breadcrumb.view") : t("brokerMaster.breadcrumb.add") },
    ];
  useBreadcrumb(breadcrumbs);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<boolean>(isBoarding ? true : !param?.id);

  const navigate = useNavigate();
  const dispatch = useAppDispatch()

  useEffect(() => {
    const getUser = async () => {
      const url = `/v1/brokers/${param?.id}`;
      const result = await fetchUser(brokerApi, url);
      if (result?.success && result?.data) {
        const broker = result?.data?.data;
        const formData: any = {
          legalName: broker?.legalName,
          irdaBrokerCode: broker?.irdaBrokerCode,
          contactEmail: normalizeEmailsToArray(broker?.contactEmail).join(", "),
          contactPhone: normalizePhonesToArray(broker.contactPhone).join(", "),
          address: {
            address: broker.address?.address,
            city: broker.address?.city,
            stateName: broker.address?.stateName?.toUpperCase(),
            postalCode: broker.address?.postalCode,
          },
        };
        reset(formData);
      } else {
        showErrorMessage(result);
      }
    };
    if (param?.id && !isBoarding) {
      getUser();
    }
  }, [param?.id]);

  const onSubmit = async (data: any) => {
    const payload = {
      legalName: data?.legalName,
      irdaBrokerCode: data?.irdaBrokerCode,
      contactEmail: normalizeEmailsToArray(data.contactEmail),
      contactPhone: normalizePhonesToArray(data.contactPhone),
      address: {
        address: data?.address.address,
        city: data?.address.city,
        stateName: data?.address.stateName,
        postalCode: data?.address.postalCode,
      },
    };
    setLoading(true);
    const result = await saveAndUpdateBroker(payload, isBoarding ? "" : param?.id);
    if (result.success) {
      setIsSubmitting(false);
      setLoading(false);
      toast.success(result?.data?.message, { position: "top-right", duration: 5000 });
      if (isBoarding) {
        dispatch(fetchOnBoardResolveData({ inwardNo: inwardNo, type: "BROKER",masterId: result?.data?.data?.brokerId,policyNo:policyNo }))
      }
      if (isMultiStep) {
        onSuccess?.();
      } else {
        navigate(isBoarding ? "/enrolment-system/corporate-enrolment" : "/master-management/broker");
      }
    } else if (result?.status === 409) {
      handleFormApiErrors(result as any, setError, cgroupFieldMap as any);
      setLoading(false);
    } else {
      handleApiError(result);
      setLoading(false);
    }
  };
  const readOnly = param?.id && !editing;

  const fieldsOfRender = [
    {
      name: "legalName",
      label: t("brokerMaster.form.legalName"),
      placeholder: t("brokerMaster.placeholder.legalName"),
      isRequired: true,
      Icon: null,
    },
    {
      name: "irdaBrokerCode",
      label: t("brokerMaster.form.irdaBrokerCode"),
      placeholder: t("brokerMaster.placeholder.irdaBrokerCode"),
      isRequired: false,
      isDisable: false,
      Icon: null,
    },
    {
      name: "contactPhone",
      label: t("brokerMaster.form.contactPhone"),
      placeholder: t("brokerMaster.placeholder.contactPhone"),
      Icon: PhoneIcon,
      isRequired: false,
      type: "text",
    },
    {
      name: "contactEmail",
      label: t("brokerMaster.form.contactEmail"),
      placeholder: t("brokerMaster.placeholder.contactEmail"),
      Icon: EnvelopeIcon,
      isRequired: false,
    },
  ] as const;
  const onCancel = () => {
    navigate(isBoarding ? "/enrolment-system/corporate-enrolment" : "/master-management/broker");
  };
  const onEdit = () => setEditing(true);

  return (
    <FormLayout
      onSubmit={handleSubmit(onSubmit)}
      FormClassName="transition-content w-full px-2 pt-5 lg:pt-2"
    >
      <div className="min-w-0">
        <div className="bg-card border-border rounded-xl border p-2 py-4 shadow-sm">
          <div className="flex items-center justify-start gap-4">
            <h3
              className={`sub_section_title flex items-center gap-2 text-xl font-semibold text-gray-700`}
            >
              {t("brokerMaster.section.brokerInformation")}
            </h3>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-4 mb-2">
            {fieldsOfRender?.map(
              ({ name, label, placeholder, Icon, isRequired }) => (
                <Input
                  key={name}
                  label={label}
                  placeholder={placeholder}
                  prefix={
                    Icon ? (
                      <Icon
                        className="size-5 transition-colors duration-200"
                        strokeWidth={1}
                      />
                    ) : null
                  }
                  {...register(name)}
                  error={errors?.[name]?.message}
                  disabled={readOnly || isSubmitting}
                  isRequired={isRequired}
                />
              ),
            )}
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
            isBoarding={isBoarding}
            onCancel={onCancel}
            onEdit={onEdit}
          />
      </div>
    </FormLayout>
  );
};
export default AddBrokerForm;
