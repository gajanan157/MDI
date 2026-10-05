import FormLayout from "@/components/shared/form/FormLayout";
import { Button } from "@/components/ui";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useRef, useState } from "react";
import { SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import DynamicForm, { DynamicSection } from "../../../contactPerson/DynamicForm";
import { newcontactPersonsSchema } from "./schema";
import { hasAnyValue } from "../funcation";
import { fetchDomains, fetchRolesByDomain } from "@/store/features/domain&Roll/domainRoleSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useTranslation } from "react-i18next";
export type FieldType = "input" | "dropdown" | "uploadDocument" | "checkbox" | "multiContact" | "textArea";
export type FieldType1 = "yes";
export interface OptionItem {
  label: string;
  value: string;
}
interface Props {
  setOpenContactModal?: any
  setContactPersonFields?: any
  openContactModal?: boolean
  editData?: any;
  editIndex?: number | null;
}


function ContactPopup({
  setOpenContactModal,
  setContactPersonFields,
  editData,
  editIndex
}: Props) {
  const { domains, roles } = useAppSelector((state) => state.domain)
  const domainsOptions = useMemo(() =>
    domains?.map((s: any) => ({
      label: s?.domainName,
      value: s?.domainId,
    })),
    [domains]);
  const rolesOptions = useMemo(() =>
    roles?.map((s: any) => ({
      label: s?.roleName,
      value: s?.roleId,
    })),
    [roles]);
  const { t } = useTranslation();
  const contactPersonSection: DynamicSection = {
    title: t("contactPersonform.title"),
    icon: <UserCircleIcon />,
    fields: [
      {
        name: "prefix",
        label: t("contactPersonform.fields.prefix"),
        subType: "yes",
        options: [
          {
            label: t("contactPersonform.options.prefix.mr"),
            value: "Mr",
          },
          {
            label: t("contactPersonform.options.prefix.ms"),
            value: "Ms",
          },
          {
            label: t("contactPersonform.options.prefix.mrs"),
            value: "Mrs",
          },
          {
            label: t("contactPersonform.options.prefix.dr"),
            value: "Dr",
          },
        ],
        className: "h-[38px] rounded-[10px]",
        isRequired: true,
      },
      {
        name: "firstName",
        label: t("contactPersonform.fields.firstName"),
        type: "input",
        placeholder: t("contactPersonform.placeholders.firstName"),
        inputType: "text",
        isRequired: true,
      },
      {
        name: "middleName",
        label: t("contactPersonform.fields.middleName"),
        type: "input",
        placeholder: t("contactPersonform.placeholders.middleName"),
        inputType: "text",
      },
      {
        name: "lastName",
        label: t("contactPersonform.fields.lastName"),
        type: "input",
        placeholder: t("contactPersonform.placeholders.lastName"),
        inputType: "text",
        isRequired: true,
      },
      {
        name: "domainId",
        label: t("contactPersonform.fields.domain"),
        type: "dropdown",
        options: domainsOptions,
        className: "h-[38px] rounded-[10px]",
        isRequired: true,
      },
      {
        name: "roleId",
        label: t("contactPersonform.fields.role"),
        type: "dropdown",
        options: rolesOptions,
        className: "h-[38px] rounded-[10px]",
        isRequired: true,
      },
      {
        name: "gender",
        label: t("contactPersonform.fields.gender"),
        type: "dropdown",
        options: [
          {
            label: t("contactPersonform.options.gender.male"),
            value: "male",
          },
          {
            label: t("contactPersonform.options.gender.female"),
            value: "female",
          },
        ],
        className: "h-[38px] rounded-[10px]",
        isRequired: true,
      },
      {
        name: "dateOfBirth",
        label: t("contactPersonform.fields.dateOfBirth"),
        type: "input",
        placeholder: t("contactPersonform.placeholders.dateOfBirth"),
        inputType: "date",
      },
      {
        name: "designation",
        label: t("contactPersonform.fields.designation"),
        type: "input",
        placeholder: t("contactPersonform.placeholders.designation"),
        inputType: "text",
        isRequired: true,
      },
      {
        name: "department",
        label: t("contactPersonform.fields.department"),
        type: "input",
        placeholder: t("contactPersonform.placeholders.department"),
        inputType: "text",
        isRequired: true,
      },
      {
        name: "priority",
        label: t("contactPersonform.fields.priority"),
        type: "dropdown",
        options: [
          {
            label: t("contactPersonform.options.priority.1"),
            value: "1",
          },
          {
            label: t("contactPersonform.options.priority.2"),
            value: "2",
          },
          {
            label: t("contactPersonform.options.priority.3"),
            value: "3",
          },
          {
            label: t("contactPersonform.options.priority.4"),
            value: "4",
          },
          {
            label: t("contactPersonform.options.priority.5"),
            value: "5",
          },
        ],
        isRequired: true,
      },
      {
        name: "notes",
        label: t("contactPersonform.fields.notes"),
        type: "textArea",
        placeholder: t("contactPersonform.placeholders.notes"),
        inputType: "text",
        isRequired: false,
      },
      {
        name: "contact_type_array",
        label: t("contactPersonform.fields.contactDetails"),
        type: "multiContact",
        isRequired: true,
      },
    ],
  };
  const dispatch = useAppDispatch()
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm<any>({
    resolver: yupResolver(newcontactPersonsSchema as any),
    mode: "onChange",
    defaultValues: {
      contactPersons: [],
    },
  });
  useEffect(() => {
    if (editData) {
      reset({
        contactPersons: [editData],
      });
    } else {
    }
  }, [editData, reset]);
  const contactPersons = useWatch({
    control,
    name: "contactPersons",
  });

  const setValue = useForm().setValue;
  const prevDomainsRef = useRef<Record<number, string>>({});

  useEffect(() => {
    if (!Array.isArray(contactPersons)) return;

    contactPersons.forEach((person, index) => {
      const domainId = person?.domainId;
      const prevDomainId = prevDomainsRef.current[index];

      if (domainId && domainId !== prevDomainId) {
        dispatch(fetchRolesByDomain(domainId));
        setValue(`contactPersons.${index}.roleId`, "");
        prevDomainsRef.current[index] = domainId;
      }
    });
  }, [contactPersons, dispatch, setValue]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { fields: contactPersonFields2, append: addContactPerson } = useFieldArray({
    control,
    name: "contactPersons",
  });
  useEffect(() => {
    dispatch(fetchDomains());
  }, [])
  const handleFormSubmit: SubmitHandler<any> = async (data) => {
    setIsSubmitting(true);
    const cleanedContactPersons = data?.contactPersons?.filter((person: any) => hasAnyValue(person)) || [];
    setContactPersonFields((prev: any[]) => {
      if (editIndex !== null && editIndex !== undefined) {
        if (cleanedContactPersons?.length === 0) return prev;
        const updated = [...prev];
        updated[editIndex] = cleanedContactPersons[0];
        return updated;
      }
      return [...prev, ...cleanedContactPersons];
    });
    setOpenContactModal(false);
    setIsSubmitting(false);
  };
  const isEditMode = !!editData;
  return (
    <FormLayout
      onSubmit={handleSubmit(handleFormSubmit)}
      FormClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-lg p-4 sm:p-6 relative max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-700">{t("contactPersonform.title")}</h4>
          <button
            onClick={() => setOpenContactModal(false)}
            className="text-gray-500 hover:text-black cursor-pointer">
            ✕
          </button>
        </div>
        <DynamicForm<any>
          watch={watch}
          section={contactPersonSection}
          basePath={`contactPersons.${isEditMode ? 0 : contactPersonFields2.length}`}
          control={control}
          register={register}
          errors={errors}
          isContactRequired={true}
          showHeader={false}
          onAddSection={() =>
            addContactPerson({
              prefix: "",
              firstName: "",
              middleName: "",
              lastName: "",
              gender: "",
              dateOfBirth: "",
              designation: "",
              department: "",
              priority: "",
              notes: "",
              contact_type_array: [{ type: "", value: "" }],
            })
          }
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => setOpenContactModal(false)}
            className="px-3 py-1 border rounded text-sm cursor-pointer">
            {t("branchForm.buttons.cancel")}
          </button>
          <Button
            type="submit"
            color="primary"
            className="bg-primary hover:bg-primary/90  px-8"
            disabled={isSubmitting}>
            {isSubmitting ? `${t("branchForm.buttons.save")}...` : t("branchForm.buttons.save")}
          </Button>
        </div>
      </div>
    </FormLayout>
  );
}
export default ContactPopup