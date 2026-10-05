import { corporateApi } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { handleApiError } from "@/app/pages/AdminDepartment/tpabranches/function";
import { handleFormApiErrors } from "@/app/pages/AdminDepartment/tpabranches/handleFormApiErrors";
import FormLayout from "@/components/shared/form/FormLayout";
import { Input } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Path, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import FormActionButtons from "../agent/FormActionButtons";
import {
  CorporateGroupSchema,
  saveAndUpdateCorporateGroup,
} from "./CorporateGroupForm";

interface Props {
  onClose?: () => void;
}

const AddCorporateGroupForm: React.FC<Props> = ({ }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: yupResolver(CorporateGroupSchema),
  });

  const param = useParams();
  const navigate = useNavigate();


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<boolean>(!param?.id);


  useBreadcrumb([
    { title: t("corporateGroupMaster.masterManagement")},
    { title: t("corporateGroupMaster.buttons.add"), path: "/master-management/corporate-group"},
    { title: param?.id ? t("corporateGroupMaster.breadcrumb.view") : t("corporateGroupMaster.breadcrumb.add")},
  ]);
  useEffect(() => {
    const getCorporateGroup = async () => {
      const url = `/v1/corporate-group/${param?.id}`;
      const result = await fetchUser(corporateApi, url);

      if (result?.success && result?.data?.data) {
        const group = result.data.data;

        reset({
          groupName: group.groupName,
          cin: group.cin,
          pan: group.pan,
          gstin: group.gstin,
          websiteUrl: group.websiteUrl,
          effectiveFrom: group.effectiveFrom,
          effectiveTo: group.effectiveTo,
        });
      } else {
        showErrorMessage(result);
      }
    };

    if (param?.id) getCorporateGroup();
  }, [param?.id, reset]);
  const cgroupFieldMap = {
    groupName: "groupName",
  } satisfies Record<string, Path<any>>;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    const payload = {
      groupName: data.groupName,
      cin: data.cin,
      pan: data.pan,
      gstin: data.gstin,
      websiteUrl: data.websiteUrl,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
    };
    setLoading(true)
    const result = await saveAndUpdateCorporateGroup(payload, param?.id);

    if (result.success) {
      navigate("/master-management/corporate-group");
      handleApiResponse(
        {
          success: result.success,
          data: result.data || null,
          error: result.error,
        },
        result.data?.message,
      );
    } else if (result?.status === 409) {
      handleFormApiErrors(result as any, setError, cgroupFieldMap as any);
    } else {
      handleApiError(result);
    }
    setLoading(false)
    setIsSubmitting(false);
  };


  const readOnly = param?.id && !editing;
  const onEdit = () => setEditing(true);
  const onCancel = () => navigate("/master-management/corporate-group");

  type CorporateField = {
    name:
    | "groupName"
    | "cin"
    | "pan"
    | "gstin"
    | "websiteUrl"
    | "effectiveFrom"
    | "effectiveTo";
    label: string;
    placeholder?: string;
    type?: string;
    isRequired?: boolean;
  };

  const fields: CorporateField[] = [
    {
      name: "groupName",
      label: t("corporateGroupMaster.fields.groupName"),
      placeholder: t("corporateGroupMaster.placeholder.groupName"),
      isRequired: true,
    },
    {
      name: "websiteUrl",
      label: t("corporateGroupMaster.fields.websiteUrl"),
      placeholder: t("corporateGroupMaster.placeholder.websiteUrl"),
    },
    {
      name: "cin",
      label: t("corporateGroupMaster.fields.cin"),
      placeholder: t("corporateGroupMaster.placeholder.cin"),
    },
    {
      name: "pan",
      label: t("corporateGroupMaster.fields.pan"),
      placeholder: t("corporateGroupMaster.placeholder.pan"),
    },
    {
      name: "gstin",
      label: t("corporateGroupMaster.fields.gstin"),
      placeholder: t("corporateGroupMaster.placeholder.gstin"),
    },

    {
      name: "effectiveFrom",
      label: t("corporateGroupMaster.fields.effectiveFrom"),

      type: "date",
      isRequired: false,
    },
    {
      name: "effectiveTo",
      label: t("corporateGroupMaster.fields.effectiveTo"),
      type: "date",
    },

  ] as const;

  return (
    <FormLayout
      onSubmit={handleSubmit(onSubmit)}
      FormClassName="transition-content w-full px-2 pt-5 lg:pt-2"
    >
      <div className="bg-card border-border rounded-xl border p-2 py-4 shadow-sm">
        <h3 className="sub_section_title text-xl font-semibold text-gray-700">
          {t("corporateGroupMaster.section.information")}
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fields?.map(({ name, label, placeholder, type, isRequired }) => (
            <Input
              key={name}
              type={type ?? "text"}
              label={label}
              placeholder={placeholder}
              {...register(name)}
              error={errors?.[name]?.message}
              disabled={readOnly || isSubmitting}
              isRequired={isRequired}
            />
          ))}
        </div>
      </div>
        <FormActionButtons
          isSubmitting={isSubmitting}
          loading={loading}
          paramId={param?.id}
          editing={editing}
          onCancel={onCancel}
          onEdit={onEdit}
        />
    </FormLayout>
  );
};
export default AddCorporateGroupForm;