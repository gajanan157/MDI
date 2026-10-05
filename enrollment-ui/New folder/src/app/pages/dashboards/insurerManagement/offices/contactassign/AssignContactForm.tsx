import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { fetchContactPersons } from "@/store/features/insurer/contactPersonSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const contactTypeOptions = [
  { value: "email", label: "Email" },
  { value: "mobile", label: "Phone" },
  { value: "landline", label: "Landline" },
];
interface AssignContactFormProps {
  data: any;
  control: any;
  register: any;
  errors: any;
  isIc?: string;
  watch: any;
  setValue: any;
  setAssignmentId: any;
}

const AssignContactForm: React.FC<AssignContactFormProps> = ({
  // data,
  register,
  control,
  errors,
  isIc,
  watch,
  setValue,
  setAssignmentId
}) => {
  const { contactList } = useAppSelector((state) => state.contactPerson);
  const dispatch = useAppDispatch();
  const { t } = useTranslation()

  const selectedContactPersonId = watch("contact_person")
  useEffect(() => {
    dispatch(
      fetchContactPersons({
        query: { insurerId: isIc, searchText: "", page: 0, size: "20" },
      }),
    );
  }, [dispatch, isIc]);

  const updatedContactList = contactList?.map((insurer) => ({
    label: `${insurer.fullName} ( ${insurer.designation} )`,
    value: insurer.contactPersonId,
  }));


  useEffect(() => {
    if (!selectedContactPersonId || !contactList?.length) return;

    const selectedPerson = contactList?.find((cp) => cp?.contactPersonId === selectedContactPersonId);
    if (!selectedPerson) return;
    setValue("designation", selectedPerson?.designation || "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("officeCode", selectedPerson?.officeCode || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("officeName", selectedPerson?.officeName || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setAssignmentId(selectedPerson?.assignmentId)

  }, [selectedContactPersonId, contactList, setValue]);


  return (
    <div className="mt-2 space-y-5">
      <DropdownSelect
        label={t("assignContactForm.fields.contactPerson.label")}
        defaultValue={t("assignContactForm.fields.contactPerson.defaultValue")}
        name_key="contact_person"
        options={updatedContactList}
        control={control}
        rules={{ required: "Contact Person is required" }}
        name="contact_person"
        errors={errors.contact_person}
        isRequired
      />
      <Input
        label={t("assignContactForm.fields.designation.label")}
        placeholder={t("assignContactForm.fields.designation.placeholder")}
        {...register("designation")}
        error={errors.designation?.message}
        disabled={true}
      />
      <Input
        label={t("assignContactForm.fields.officeName.label")}
        placeholder={t("assignContactForm.fields.officeName.placeholder")}
        {...register("officeName")}
        error={errors.officeName?.message}
        disabled={true}
      />
      <Input
        label={t("assignContactForm.fields.officeCode.label")}
        placeholder={t("assignContactForm.fields.officeCode.placeholder")}
        {...register("officeCode")}
        error={errors.officeCode?.message}
        disabled={true}
      />
    </div>
  );
};

export default AssignContactForm;
