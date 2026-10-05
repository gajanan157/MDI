import { masterApi } from "@/app/api/apiService";
import FormLayout from "@/components/shared/form/FormLayout";
import { Button, Input, Spinner } from "@/components/ui";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AddressSection } from "./AddressSection";
import { fetchUser, saveTpa } from "./funcation";
import { TPAFormValues, tpaSchema } from "./schema";
import { showErrorMessage } from "@/utils/errorHandler";
import { usePermission } from "@/app/auth/usePermission";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { PageContent } from "@/components/shared/PageContent";
import { Page } from "@/components/shared/Page";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks/useAppSelector";


const AddTpaForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(tpaSchema),
  });
  const { t } = useTranslation();
  useBreadcrumb([{ title: t("nav.tpa.title") }]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errormsg, setErrormsg] = useState("");
  const [ids, setIds] = useState<{ tpaId: string; tenantId: string }>({ tpaId: "", tenantId: ""});
  const { canWrite } = usePermission("tpa");
    const { selectedRoles } = useAppSelector((state) => state.tpa);
  

  const [isCoreFieldsDisabled, setIsCoreFieldsDisabled] = useState(false);
  useEffect(() => {
    const getUser = async () => {
      const result = await fetchUser(masterApi, "/v1/tpa");
      if (result?.success && result?.data) {
        const user = result?.data?.data?.find(
          (item: any) => String(item?.tpaCode) === "005",
        );
        setIds({ tpaId: user?.tpaId, tenantId: user?.tenantId });
        setErrormsg(user?.addressMessage);
        const formData: TPAFormValues = {
          tpaCode: user.tpaCode,
          legalName: user.legalName,
          cinNumber: user.cin,
          contactEmail: user.contactEmail,
          contactPhone: user.contactPhone,
          address: {
            address: user.address?.address,
            city: user.address?.city,
            stateName: user.address?.stateName?.toUpperCase(),
            postalCode: user.address?.postalCode,
          },
        };
        reset(formData);
        const hasAllCoreFields =
          Boolean(user?.tpaCode) &&
          Boolean(user?.legalName) &&
          Boolean(user?.cin);

        setIsCoreFieldsDisabled(hasAllCoreFields);
      } else {
        showErrorMessage(result);
      }
    };
    getUser();
  }, []);

  const onSubmit = async (data: TPAFormValues) => {
    const payload = {
      tpaCode: data?.tpaCode,
      legalName: data?.legalName,
      cin: data?.cinNumber,
      contactEmail: data.contactEmail,
      contactPhone: data?.contactPhone,
      updateTpaAddressRequestDto: {
        tenantId: ids?.tenantId,
        address: data.address.address,
        city: data?.address.city,
        stateName: data?.address.stateName,
        postalCode: data?.address.postalCode,
      },
    };
    setLoading(true);
    const result = await saveTpa(payload, ids?.tpaId);
    if (result.success) {
      setIsEditing(false);
      setLoading(false);
      toast.success(result?.data?.message, { position: "top-right", duration: 5000 });
    } else {
      toast.error(result.error, { position: "top-right", duration: 5000 });
      setLoading(false);
    }
  };
  const fieldsOfRender = [
    {
      name: "tpaCode",
      label: t("nav.tpa.fields.tpaCode.label"),
      placeholder: t("nav.tpa.fields.tpaCode.placeholder"),
      Icon: null,
      isDisable: isCoreFieldsDisabled,
    },
    {
      name: "legalName",
      label: t("nav.tpa.fields.legalName.label"),
      placeholder: t("nav.tpa.fields.legalName.placeholder"),
      Icon: null,
      isDisable: isCoreFieldsDisabled,
    },
    {
      name: "cinNumber",
      label: t("nav.tpa.fields.cinNumber.label"),
      placeholder: t("nav.tpa.fields.cinNumber.placeholder"),
      Icon: null,
      isDisable: isCoreFieldsDisabled,
    },
    {
      name: "contactEmail",
      label: t("nav.tpa.fields.contactEmail.label"),
      placeholder: t("nav.tpa.fields.contactEmail.placeholder"),
      Icon: EnvelopeIcon,
      isDisable: false,
    },
    {
      name: "contactPhone",
      label: t("nav.tpa.fields.contactPhone.label"),
      placeholder: t("nav.tpa.fields.contactPhone.placeholder"),
      Icon: PhoneIcon,
      isDisable: false,
    },
  ] as const;
  return (
    <Page title={t("nav.tpa.title")}>
      <PageContent>
        <FormLayout
          onSubmit={handleSubmit(onSubmit)}
          FormClassName="transition-content w-full">
          <div className="min-w-0">
            <div className="bg-card border-border rounded-xl border p-2 py-4 shadow-sm">
              <div className="flex items-center justify-start gap-4">
                <h3
                  className={`sub_section_title flex items-center gap-2 text-xl font-semibold text-gray-700`}>
                  {t("nav.tpa.information")}
                </h3>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {fieldsOfRender?.map(
                  ({ name, label, placeholder, Icon, isDisable }) => (
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
                      disabled={!isEditing || isDisable}
                      isRequired
                    />
                  ),
                )}
              </div>
            </div>
            <AddressSection
              isDisable={!isEditing}
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              isAddressType={false}
              ErrorMsg={errormsg}
            />
            {canWrite && (
              <div className="flex w-full items-center justify-end">
                {isEditing ? (
                  <Button
                    color="primary"
                    type="submit"
                    className="px-4 py-2 text-sm mt-4 "
                    disabled={loading}
                  >
                    {t("nav.tpa.buttons.update")}

                    {loading && (
                      <Spinner
                        color="primary"
                        className="ml-2 size-5 border-2 border-white text-white"
                      />
                    )}
                  </Button>
                ) : (

                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker mt-5 w-24 text-white"
                  >
                    {t("nav.tpa.buttons.edit")}

                  </button>
                )}
              </div>
            )}
          </div>
        </FormLayout>
      </PageContent>
    </Page>
  );
};
export default AddTpaForm;
