import { masterApi } from "@/app/api/apiService";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import FormLayout from "@/components/shared/form/FormLayout";
import { Button, Input } from "@/components/ui";
import SectionTitle from "@/components/ui/SectionTitle";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchParentBranches } from "@/store/features/parentBranches/parentBranchesSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { handleApiResponse, showErrorMessage } from "@/utils/errorHandler";
import { Tenent_Id } from "@/utils/tenent";
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState, useRef } from "react";
import { Path, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { AddressSection } from "../tpa/AddressSection";
import { fetchUser } from "../tpa/funcation";
import { serviceAreaJson } from "./dummyData";
import {
  handleApiError,
  mergeRefs,
  normalizeEmailsToArray,
  normalizePhonesToArray,
  saveTpaBranch,
} from "./function";
import { AuthFormValues, schema } from "./schema";
import { usePermission } from "@/app/auth/usePermission";
import { handleFormApiErrors } from "./handleFormApiErrors";
import { PageContent } from "@/components/shared/PageContent";
import { Page } from "@/components/shared/Page";
import { useTranslation } from "react-i18next";

const Form: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const param = useParams();
  const { canWrite } = usePermission("branch");
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchParentBranches()).catch((error) => {
      console.error("Failed to fetch parent branches:", error);
    });
  }, [dispatch]);

  const parentBranches = useAppSelector((state) => state.parentBranchs);
  const [parentBranch, setParentBranch] = useState<
    { label: string; value: string }[]
  >([]);
  const [editing, setEditing] = useState<boolean>(!param?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [row, setRow] = useState<any>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    setError,
  } = useForm<AuthFormValues>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      parentBranchName: "",
      branchName: "",
      contactEmail: "",
      contactPhone: "",
      remark: undefined,
      serviceType: [],
      address: {
        address: "",
        city: "",
        stateName: "",
        addressType: "",
        postalCode: "",
        attentionTo: "",
      },
    },
  });
  const [errormsg, setErrormsg] = useState("");
  const branchNameRef = useRef<HTMLInputElement | null>(null);

  const getBranchByID = async () => {
    try {
      const result = await fetchUser(masterApi, `/v1/tpa-branch/${param?.id}`);
      if (result?.success && result?.data) {
        const branchObj = result?.data?.data;
        setErrormsg(branchObj?.addressMessage);
        setRow(branchObj);
      } else {
        showErrorMessage(result);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    if (param?.id) {
      getBranchByID();
    }
  }, [param?.id]);
  const serviceAreaArrayToObject = (
    svcArray?: string[] | Record<string, any>,
  ) => {
    if (!svcArray) return [];
    if (Array.isArray(svcArray)) {
      return svcArray.filter(
        (item) => typeof item === "string" && item.trim().length,
      );
    }
    if (typeof svcArray === "object") {
      return Object.keys(svcArray);
    }

    return [];
  };

  const buildBranchPayload = (data: AuthFormValues) => {
    const TPA_ID =
      row?.tpaId ?? data?.tpaId ?? "c603dd8f-3e9c-4281-923c-04e092f1366b";
    const TENANT_ID = row?.tenantId ?? data?.tenantId ?? Tenent_Id;
    const PARENT_BRANCH_ID =
      row?.parentBranchId ??
      (data as any)?.parentBranchId ??
      (data as any)?.parentBranchName ??
      null;
    return {
      tpaId: TPA_ID,
      branchName: data?.branchName ?? "",
      parentBranchId: PARENT_BRANCH_ID,
      tenantId: TENANT_ID,
      contactEmail: normalizeEmailsToArray(data.contactEmail),
      contactPhone: normalizePhonesToArray(data.contactPhone),
      serviceType: serviceAreaArrayToObject(data?.serviceType as any),
      tags: data?.remark ? [data.remark] : [],
      extendedAttributes: (data as any)?.extendedAttributes ?? {},
      address: {
        tenantId: TENANT_ID,
        address: data?.address?.address ?? "",
        city: data?.address?.city ?? "",
        stateName: data?.address?.stateName?.toUpperCase() ?? "",
        postalCode: data?.address?.postalCode ?? "",
        addressType: data?.address?.addressType ?? "both",
      },
    };
  };

  const buildPatchPayload = (original: any, updated: AuthFormValues) => {
    const payload: any = {};

    if (updated.branchName !== original.branchName) {
      payload.branchName = updated.branchName;
    }

    const updatedEmails = normalizeEmailsToArray(updated.contactEmail);
    const originalEmails = normalizeEmailsToArray(original.contactEmail);

    if (JSON.stringify(updatedEmails) !== JSON.stringify(originalEmails)) {
      payload.contactEmail = updatedEmails;
    }

    const updatedPhones = normalizePhonesToArray(updated.contactPhone);
    const originalPhones = normalizePhonesToArray(original.contactPhone);

    if (JSON.stringify(updatedPhones) !== JSON.stringify(originalPhones)) {
      payload.contactPhone = updatedPhones;
    }

    const updatedServiceTypes = serviceAreaArrayToObject(
      updated.serviceType as any,
    );

    if (
      JSON.stringify(updatedServiceTypes) !==
      JSON.stringify(original.serviceTypes ?? [])
    ) {
      payload.serviceType = updatedServiceTypes;
    }

    const updatedParentBranch =
      (updated as any)?.parentBranchId ??
      (updated as any)?.parentBranchName ??
      null;

    if (updatedParentBranch !== original.parentBranchId) {
      payload.parentBranchId = updatedParentBranch;
    }

    // Address (nested diff)
    const addr = updated.address || {};
    const origAddr = original.address || {};

    const addressPayload: any = {};

    if (addr.address !== origAddr.address)
      addressPayload.address = addr.address;

    if (addr.city !== origAddr.city) addressPayload.city = addr.city;

    if (addr.stateName !== origAddr.stateName)
      addressPayload.stateName = addr.stateName;

    if (addr.postalCode !== origAddr.postalCode)
      addressPayload.postalCode = addr.postalCode;

    if (addr.addressType !== origAddr.addressType)
      addressPayload.addressType = addr.addressType;

    if (Object.keys(addressPayload).length > 0) {
      payload.address = addressPayload;
    }
    return payload;
  };

  // Build parent branch options: in edit mode show all branches (excluding self) so user can change parent
  const currentBranchId = row?.tpaBranchId ?? row?.id;
  const parentBranchOptions =
    param?.id && row
      ? parentBranch?.length
        ? parentBranch
        : (parentBranches?.parentBranchs
          ?.filter((b: any) => b?.id !== currentBranchId)
          ?.map((i: any) => ({ label: i?.name, value: i?.id })) ?? [])
      : (parentBranches?.parentBranchs?.map((i: any) => ({
        value: i?.id,
        label: i?.name,
      })) ?? []);

  useEffect(() => {
    if (row) {
      const list = parentBranches?.parentBranchs ?? [];
      const options = list
        .filter((b: any) => b?.id !== (row?.tpaBranchId ?? row?.id))
        .map((b: any) => ({ label: b?.name, value: b?.id }));
      const currentParentValue = row.parentBranchId ?? row.parentBranchName;
      const hasCurrentInList = options.some(
        (o: any) => o.value === currentParentValue,
      );
      if (currentParentValue && !hasCurrentInList && row.parentBranchName) {
        options.unshift({
          label: row.parentBranchName,
          value: currentParentValue,
        });
      }
      if (options.length > 0) setParentBranch(options);

      if (row.parentBranchName)
        setValue(
          "parentBranchName",
          row.parentBranchId ?? row.parentBranchName,
          { shouldValidate: false },
        );
      if (row.branchName)
        setValue("branchName", row.branchName, { shouldValidate: false });
      if (row.contactEmail)
        setValue(
          "contactEmail",
          normalizeEmailsToArray(row?.contactEmail).join(", "),
          { shouldValidate: false },
        );
      if (row.contactPhone) {
        setValue(
          "contactPhone",
          normalizePhonesToArray(row.contactPhone).join(", "),
          { shouldValidate: false },
        );
      }
      if ("remarks" in row)
        setValue("remark", row.remarks ?? "", { shouldValidate: false });
      setValue("serviceType", row.serviceTypes ?? [], {
        shouldValidate: false,
      });

      const addr = row.address ?? {};
      if (typeof addr === "string") {
        setValue("address.address", addr, { shouldValidate: false });
      } else {
        setValue("address.address", addr.address ?? "", {
          shouldValidate: false,
        });
        setValue("address.city", addr.city ?? row.city ?? "", {
          shouldValidate: false,
        });
        setValue("address.stateName", addr.stateName ?? row.stateName ?? "", {
          shouldValidate: false,
        });
        setValue("address.addressType", addr.addressType ?? "", {
          shouldValidate: false,
        });
        setValue("address.postalCode", addr.postalCode ?? "", {
          shouldValidate: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row, parentBranches?.parentBranchs]);

  const toggleCheckbox = (value: string, checked: boolean) => {
    const current = watch("serviceType") || [];
    if (checked) {
      if (!current.includes(value))
        setValue("serviceType", [...current, value], { shouldValidate: true });
    } else {
      setValue(
        "serviceType",
        current.filter((v) => v !== value),
        { shouldValidate: true },
      );
    }
  };

  const onCancel = () => {
    setEditing(false);
    navigate("/tpa-management/branches");
  };

  const onEdit = () => setEditing(true);

  const [ids, setIds] = useState<{ tpaId: string; tenantId: string }>({
    tpaId: "",
    tenantId: "",
  });
  useEffect(() => {
    const getUser = async () => {
      const result = await fetchUser(masterApi, "/v1/tpa");
      if (result?.success && result?.data) {
        const user = result?.data?.data?.find(
          (item: any) => String(item?.tpaCode) === "005",
        );
        setIds({ tpaId: user?.tpaId, tenantId: user?.tenantId });
      }
    };
    getUser();
  }, []);
  const branchFieldMap = {
    branchName: "branchName",
    branchCode: "branchCode",
  } satisfies Record<string, Path<any>>;

  const onCreate = async (data: AuthFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = buildBranchPayload(data);
      const result = await saveTpaBranch(payload, "", ids?.tpaId);
      if (result.success) {
        navigate("/tpa-management/branches");

        handleApiResponse(
          {
            success: result.success,
            data: result.data || null,
            error: result.error,
          },
          result.data?.message,
        );
      } else if (result?.status === 409) {
        handleFormApiErrors(result as any, setError, branchFieldMap as any);
        const hasFieldErrors = Boolean(
          (result as any)?.error?.fields &&
          Object.keys((result as any).error.fields).length > 0,
        );
        if (hasFieldErrors) {
          branchNameRef.current?.focus();
          branchNameRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        handleApiError(result);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE handler
  const onUpdate = async (data: AuthFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = buildPatchPayload(row, data);
      const id = row?.tpaBranchId ?? row?.id;

      const result = await saveTpaBranch(payload, String(id));
      if (result.success) {
        navigate("/tpa-management/branches");
        handleApiResponse({success: result.success,data: result.data || null,error: result.error},result.data?.message);
      } else if (result?.status === 409) {
        handleFormApiErrors(result as any, setError, branchFieldMap as any);
        const hasFieldErrors = Boolean((result as any)?.error?.fields && Object.keys((result as any).error.fields).length > 0);
        if (hasFieldErrors) {
          branchNameRef.current?.focus();
          branchNameRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        handleApiError(result);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const readOnly = param?.id && !editing;

  // Set breadcrumbs in header
  useBreadcrumb([
    { title: t("branchForm.breadcrumb.branches"), path: "/tpa-management/branches" },
    { title: param?.id ? t("branchForm.breadcrumb.viewBranch") : t("branchForm.breadcrumb.addBranch") },
  ]);
  const hasId = Boolean(param?.id);
  return (
    <Page title={t("branchForm.pageTitle")}>
      <PageContent>
        <FormLayout
          onSubmit={handleSubmit(param?.id ? onUpdate : onCreate)}
          FormClassName="transition-content w-full min-w-0 max-w-full">
          <div className="min-w-0">
            <div className="bg-card border-border rounded-xl border p-4 shadow-sm">
              <SectionTitle
                title={t("branchForm.sectionTitle")}
                icon={<BuildingOfficeIcon className="h-5 w-5 text-blue-500" />}
              />

              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  isRequired
                  label={t("branchForm.fields.branchName.label")}
                  placeholder={t("branchForm.fields.branchName.placeholder")}
                  {...register("branchName")}
                  ref={mergeRefs(branchNameRef, register("branchName").ref)}
                  error={errors?.branchName?.message}
                  disabled={readOnly || isSubmitting}
                />
                <DropdownSelect
                  label={t("branchForm.fields.parentBranch.label")}
                  defaultValue={t("branchForm.fields.parentBranch.placeholder")}
                  name_key="parentBranchName"
                  options={parentBranchOptions}
                  control={control}
                  name="parentBranchName"
                  errors={errors.parentBranchName}
                  formClassName="mb-2"
                  isRequired
                  className="h-[38px] rounded-[10px]"
                  disabled={readOnly || isSubmitting}
                />
                <Input
                  isRequired
                  label={t("branchForm.fields.phoneNumber.label")}
                  placeholder={t("branchForm.fields.phoneNumber.placeholder")}
                  prefix={
                    <PhoneIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("contactPhone", {
                    setValueAs: (value) =>
                      typeof value === "string"
                        ? value.replace(/[^\d-]/g, "")
                        : value,
                    onChange: (event) => {
                      const sanitized = String(event.target.value ?? "").replace(
                        /[^\d-]/g,
                        "",
                      );
                      if (event.target.value !== sanitized) {
                        event.target.value = sanitized;
                      }
                    },
                  })}
                  error={errors?.contactPhone?.message}
                  type="tel"
                  inputMode="tel"
                  disabled={readOnly || isSubmitting}
                />
                <Input
                  isRequired
                  label={t("branchForm.fields.email.label")}
                  placeholder={t("branchForm.fields.email.placeholder")}
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
              </div>

              <div className={`w-full md:w-1/2`}>
                <label
                  htmlFor="businessUnit"
                  className="font-large mb-1 block text-[12px] text-gray-700"
                >
                  {t("branchForm.fields.businessUnit.label")} <span className="text-red-600">*</span>
                </label>
                <div className={`rounded-sm border border-gray-300 p-2`}>
                  <div className="flex flex-col gap-y-1 text-[12px] text-gray-700">
                    <div className="flex flex-wrap items-center gap-x-4">
                      {serviceAreaJson.slice(0, 4).map((opt) => {
                        const id = `svc_${opt.value}`;
                        const checked = (watch("serviceType") || []).includes(
                          opt.value,
                        );
                        return (
                          <label
                            key={opt.value}
                            htmlFor={id}
                            className="inline-flex cursor-pointer items-center"
                          >
                            <input
                              id={id}
                              type="checkbox"
                              value={opt.value}
                              onChange={(e) =>
                                toggleCheckbox(opt.value, e.target.checked)
                              }
                              checked={checked}
                              className={`accent-primary mr-1 h-3 w-3 rounded-sm border-gray-400 ${hasId ? "pointer-events-none bg-gray-100" : ""}`}
                              disabled={readOnly || isSubmitting}
                            />
                            <span className="text-xs select-none">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4">
                      {serviceAreaJson.slice(4).map((opt) => {
                        const id = `svc_${opt.value}`;
                        const checked = (watch("serviceType") || []).includes(
                          opt.value,
                        );
                        return (
                          <label
                            key={opt.value}
                            htmlFor={id}
                            className="inline-flex cursor-pointer items-center"
                          >
                            <input
                              id={id}
                              type="checkbox"
                              value={opt.value}
                              onChange={(e) =>
                                toggleCheckbox(opt.value, e.target.checked)
                              }
                              checked={checked}
                              className="accent-primary mr-1 h-3.5 w-3.5 rounded-sm border-gray-400"
                              disabled={readOnly || isSubmitting}
                            />
                            <span className="text-sm select-none">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {errors?.serviceType?.message && (
                  <span className="input-text-error text-error dark:text-error-lighter mt-1 text-[11px]">
                    {errors?.serviceType?.message}
                  </span>
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
              ErrorMsg={errormsg}
            />
            {canWrite && (
              <div className="mb-4 flex w-full items-center justify-end gap-2">
                <Button
                  type="button"
                  className="mt-5 "
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  {t("branchForm.buttons.cancel")}
                </Button>

                {param?.id ? (
                  editing ? (
                    <Button
                      type="submit"
                      className="mt-5 "
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t("branchForm.buttons.updating") : t("branchForm.buttons.update")}
                    </Button>
                  ) : (
                    <div
                      className=" btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker mt-5  text-white"
                      color="primary"
                      onClick={onEdit}
                    >
                      {t("branchForm.buttons.edit")}
                    </div>
                  )
                ) : (
                  <Button
                    type="submit"
                    className="mt-5"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("branchForm.buttons.submitting") : t("branchForm.buttons.submit")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </FormLayout>
      </PageContent>
    </Page>
  );
};

export default Form;
