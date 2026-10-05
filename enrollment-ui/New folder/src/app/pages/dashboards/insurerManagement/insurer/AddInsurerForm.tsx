import { insurerApi } from "@/app/api/apiService";
import { AddressSection } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import FormLayout from "@/components/shared/form/FormLayout";
import { Button, Checkbox, Input } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import {
  DocumentTextIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  PhoneIcon,
  TrashIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  createAndUpdateInsurerApi,
  getDocumentType,
  transformDocuments,
} from "./funcation";
import { usePermission } from "@/app/auth/usePermission";
import {
  handleApiError,
  mergeRefs,
} from "@/app/pages/AdminDepartment/tpabranches/function";
import { handleFormApiErrors } from "@/app/pages/AdminDepartment/tpabranches/handleFormApiErrors";
import { Preview } from "@/app/pages/forms/file-upload/Preview";
import PdfViewer from "@/components/shared/PdfViewer";
import GlobalLoader from "@/components/ui/GlobalLoader";
import SectionTitle from "@/components/ui/SectionTitle";
import { fetchOnBoardResolveData } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Tenent_Id } from "@/utils/tenent";
import { Path, SubmitHandler, useForm } from "react-hook-form";
import {
  buildContactPersonRequestList,
  hasAnyValue,
} from "../offices/add-office/funcation";
import ContactPopup from "../offices/add-office/NewContactPop/ContactPopup";
import { InsurerFormValues, insurerSchema } from "./schema";
import {
  deleteInsurerFile,
  getInsurerFiles,
  uploadInsurerPdf,
} from "./UploadAPIFunction";
import { useTranslation } from "react-i18next";

export interface InsurerFile {
  fileMetadataId: string;
  fileName: string;
  s3SubBucketName: string;
  downloadUrl: string;
  contentType: string;
  size: number;
}
const insurerFieldMap = {
  insurerCode: "insurerCode",
  irdaiInsurerCode: "irdaiInsurerCode",
} satisfies Record<string, Path<any>>;

const defaultValues: InsurerFormValues = {
  officeCode: "",
  panCard: "",
  insOfficeName: "",
  insurerType: "",
  irdaiInsurerCode: "",
  insurerCode: "",
  gstin: "",
  email: "",
  phone: "",
  uploadDocument: undefined,
  documentDates: {
    PRINCIPAL_AGGREMENT: {
      startDate: "",
      endDate: "",
      signedByTPA: false,
      signedByInsurer: false,
      effectivePeriod: 0,
    },
    ADDENDUM: {
      startDate: "",
      endDate: "",
      signedByTPA: false,
      signedByInsurer: false,
      effectivePeriod: 0,
    },
    RENEWAL: {
      startDate: "",
      endDate: "",
      signedByTPA: false,
      signedByInsurer: false,
      effectivePeriod: 0,
    },
    OTHERS: {
      startDate: "",
      endDate: "",
      signedByTPA: false,
      signedByInsurer: false,
      effectivePeriod: 0,
    },
  },
  documentStartDate: "",
  documentEndDate: "",
  signedByTPA: false,
  signedByInsurer: false,
  effectivePeriod: 0,
  address: {
    address: "",
    city: "",
    stateName: "",
    postalCode: "",
  },
};

interface Props {
  data?: any;
  isBoarding?: boolean;
  inwardNo?: string;
  onSuccess?: () => void;
  isMultiStep?: boolean;
}

function formatDocumentLabel(key: string): string {
  switch (key) {
    case "PRINCIPAL_AGGREMENT":
      return "Principle Agreement";

    case "ADDENDUM":
      return "Addendum";

    case "RENEWAL":
      return "Renewal";

    case "OTHERS":
      return "Others";

    default:
      return key;
  }
}

const AddInsurerForm: React.FC<Props> = ({ data, isBoarding, inwardNo, onSuccess, isMultiStep }) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogo, setIsLogo] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const { canWrite } = usePermission("insurer");
  const [showContactPersons] = useState(!params?.id);
  const [contactPersonFields, setContactPersonFields] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [document, setDocument] = useState<any[]>([]);
  const [document2, setDocument2] = useState<any[]>([]);
  const [ids, setIds] = useState({ logoId: "", documentId: "" });
  const [errormsg, setErrormsg] = useState("");
  const [officeId, setOfficeId] = useState();
  const [isViewMode, setIsViewMode] = useState(isBoarding ? false : !!params?.id);
  const [documentSections, setDocumentSections] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [previewResetKey, setPreviewResetKey] = useState(0);
  const [mobileerror, setMobileError] = useState("");




  const typedResolver = yupResolver(insurerSchema(!!params?.id)) as unknown as Resolver<InsurerFormValues, any, InsurerFormValues>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
    setError,
  } = useForm<InsurerFormValues>({
    resolver: typedResolver,
    defaultValues,
  });
  const { t } = useTranslation();

  useEffect(() => {
    setValue("address.address", data?.extraAttribute?.insurer_address);
    setValue("phone", data?.extraAttribute?.insurer_contact_number);
    setValue("email", data?.extraAttribute?.insurer_email_id);
    setValue("gstin", data?.extraAttribute?.insurer_gst_number);
    setValue("insOfficeName", data?.extraAttribute?.insurer_name);
    setValue("insurerType", data?.extraAttribute?.insurer_type);
  }, [data?.extraAttribute]);
  const insurerNameRef = useRef<HTMLInputElement | null>(null);

  const uploadDocument = watch("uploadDocument",) as keyof InsurerFormValues["documentDates"];
  const documentType = uploadDocument;
  const newValue = watch("uploadDocument");

  type DocKey = keyof InsurerFormValues["documentDates"];
  type DocField = keyof InsurerFormValues["documentDates"][DocKey];
  const docPath = (doc: DocKey, field: DocField) => `documentDates.${doc}.${String(field)}` as Path<InsurerFormValues>;

  const startDate = watch(docPath(documentType, "startDate"));
  const endDate = watch(docPath(documentType, "endDate"));



  useEffect(() => {
    if (!documentType) {
      setPreviewResetKey((k) => k + 1);
      return;
    }
    setPreviewResetKey((k) => k + 1);
    setValue(docPath(documentType, "startDate"), "");
    setValue(docPath(documentType, "endDate"), "");
    setValue(docPath(documentType, "signedByTPA"), false);
    setValue(docPath(documentType, "signedByInsurer"), false);
  }, [documentType, setValue]);

  const getUser = async () => {
    const result = await fetchUser(insurerApi, `/v1/insurer/${params?.id}`);
    if (result?.success && result?.data) {
      const insurer = result?.data?.data;
      setOfficeId(insurer?.officeId);
      setErrormsg(insurer?.addressMessage);
      reset({
        insOfficeName: insurer?.name,
        insurerType: insurer?.insurerType,
        irdaiInsurerCode: insurer?.irdaiInsurerCode,
        insurerCode: insurer?.code,
        email: insurer?.contactEmail,
        phone: insurer?.contactPhone,
        panCard: insurer?.pan,
        officeCode: insurer?.officeCode,
        gstin: insurer?.gstin,
        address: {
          address: insurer?.address?.address,
          city: insurer?.address?.city,
          stateName: insurer?.address?.stateName?.toUpperCase(),
          postalCode: insurer?.address?.postalCode,
        },
      });
    }
  };

  useEffect(() => {
    if (params?.id && !isBoarding) {
      getUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const buildInsurerPayload = (data: InsurerFormValues) => {
    const contactPersonRequestList = buildContactPersonRequestList({
      formData: contactPersonFields,
      tenantId: Tenent_Id,
      includeContactPersonId: !!params.id,
      includeChannelId: !!params.id,
      assignmentId: !!params.id,
    });

    const cleanedAssignments = contactPersonRequestList?.length > 0 && hasAnyValue(contactPersonRequestList[0]) ? contactPersonRequestList : [];

    const selectedDoc = data?.documentDates?.[documentType];

    const {
      startDate,
      endDate,
      effectivePeriod,
      signedByInsurer,
      signedByTPA,
    } = selectedDoc || {};
    return {
      legalName: data.insOfficeName,
      insurerType: data.insurerType,
      irdaiInsurerCode: data.irdaiInsurerCode,
      insurerCode: data.insurerCode,
      contactEmail: data.email,
      contactPhone: data.phone,
      pan: data?.panCard,
      abdmEmpanelledFlag: true,
      gstin: data?.gstin ? data?.gstin : null,
      insurerOffice: {
        officeCode: String(data?.officeCode),
        ...(params?.id ? { insurerOfficeId: officeId } : {}),
      },
      address: {
        tenantId: Tenent_Id,
        address: data.address?.address || "",
        stateName: data.address?.stateName || "",
        city: data.address?.city || "",
        postalCode: data.address?.postalCode || "",
      },
      assignments: cleanedAssignments,
      ...(params?.id &&
        ids?.documentId && {
        masterAgreements: [
          {
            startDate: startDate || null,
            endDate: endDate || null,
            signedByTpa: signedByTPA ?? false,
            signedByInsurer: signedByInsurer ?? false,
            fileMetadataId: ids?.documentId,
            effectivePeriod: effectivePeriod || null,
          },
        ],
        brandLogoAttachmentId: ids?.logoId,
      }),
    };
  };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const policyNo = searchParams.get("policyNo");
  const handleSuccess = (result: any) => {
    toast.success(result.data.message, { position: "top-right", duration: 5000 });
    if (isBoarding) {
      dispatch(fetchOnBoardResolveData({ inwardNo: inwardNo, type: "IC", masterId: result?.data?.data?.id, policyNo: policyNo }));
    }
    if (isMultiStep) {
      onSuccess?.();
      return;
    }
    navigate(isBoarding ? "/enrolment-system/corporate-enrolment" : "/insurer-management/insurer");
  };
  const handleErrorResponse = (result: any) => {
    if (result?.status === 409) {
      if (result?.error?.mobileNumber || result?.error?.email) {
        setMobileError(
          result?.error?.mobileNumber
            ? result?.error?.mobileNumber
            : result?.error?.email,
        );
        return;
      }
      insurerNameRef.current?.focus();
      insurerNameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      handleFormApiErrors(result, setError, insurerFieldMap as any);
      setMobileError("");
      return;
    }

    handleApiError(result);
    setMobileError("");
  };
  const onSubmit: SubmitHandler<InsurerFormValues> = async (data) => {
    setLoading(true);
    try {
      const payload = buildInsurerPayload(data);
      const result = await createAndUpdateInsurerApi(payload, isBoarding ? "" : params?.id);
      if (result.success) {
        handleSuccess(result);
      } else {
        handleErrorResponse(result);
      }
    } finally {
      setLoading(false);
    }
  };


  const breadcrumbs = isBoarding
    ? [
      { title: t("breadcrumbs.enrolmentSystem") },
      {
        title: t("breadcrumbs.dashboard"),
        path: "/enrolment-system/dashboard",
      },
      {
        title: t("breadcrumbs.corporateInward"),
        path: "/enrolment-system/corporate-enrolment",
      },
      { title: t("breadcrumbs.addInsurer") },
    ]
    : [
      {
        title: t("breadcrumbs.insurer"),
        path: "/insurer-management/insurer",
      },
      {
        title: params.id
          ? t("breadcrumbs.viewInsurer")
          : t("breadcrumbs.addInsurer"),
      },
    ];

  useBreadcrumb(breadcrumbs);



  useEffect(() => {
    const fetchData = async (insurerId: string) => {
      try {
        const response = await getInsurerFiles(insurerId);
        const files: InsurerFile[] = response?.data;
        const formattedDocs = transformDocuments(response?.data);
        setDocumentSections(formattedDocs);
        const brandLogo = files?.find(
          (file) => file.s3SubBucketName === "BRAND_LOGO",
        );
        setDocument2(brandLogo ? [brandLogo] : []);
      } catch (error) {
        console.log(error);
      }
    };

    if (params?.id && !isBoarding) {
      fetchData(params.id);
    }
  }, [params?.id, document, isLogo]);
  const OpenPdfView = (url: string) => {
    setPdfUrl(url);
    setIsDrawerOpen(true);
  };
  const safeDocumentSections = Array.isArray(documentSections)
    ? documentSections
    : [];
  const visibleDocuments = showAllDocs
    ? [...safeDocumentSections]?.reverse()
    : [...safeDocumentSections]?.reverse()?.slice(0, 2);


  useEffect(() => {
    if (
      typeof startDate === "string" &&
      typeof endDate === "string" &&
      startDate &&
      endDate
    ) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (
        !Number.isNaN(start?.getTime()) &&
        !Number.isNaN(end?.getTime()) &&
        end >= start
      ) {
        const diffTime = end?.getTime() - start?.getTime();
        const diffDays = Math?.ceil(diffTime / (1000 * 60 * 60 * 24));

        setValue(docPath(documentType, "effectivePeriod"), diffDays);
      }
    }
  }, [startDate, endDate, documentType, setValue]);

  const onEdit = () => setIsViewMode(false);
  const onCancel = () => {
    setIsViewMode(true);
    navigate(
      isBoarding
        ? "/enrolment-system/corporate-enrolment"
        : "/insurer-management/insurer",
    );
  };
  const handleDeleteFile = async (fileId: string, type: "logo" | "document") => {
    try {
      const res = await deleteInsurerFile(fileId);
      if (res?.success || res) {
        toast.success(res?.message, { position: "top-right", duration: 5000 });
        if (type === "logo") {
          setDocument2([]);
        }

        if (type === "document") {
          setDocumentSections((prev) =>
            prev.filter((doc) => doc.id !== fileId),
          );
        }
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const removeContactPerson = (index: number) => { setContactPersonFields((prev: any[]) => prev.filter((_, i) => i !== index)) };
  return (
    <>
      <FormLayout
        onSubmit={handleSubmit(onSubmit)}
        FormClassName="transition-content w-full px-2 pt-5 lg:pt-2">
        <div className="min-w-0">
          <div className="bg-card border-border rounded-xl border p-2 py-4 shadow-sm">
            <SectionTitle title={t("insurerForm.generalInfoTitle")} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <Input
                label={t("insurerForm.fields.irdaiInsurerCode.label")}
                placeholder={t(
                  "insurerForm.fields.irdaiInsurerCode.placeholder",
                )}
                {...register("irdaiInsurerCode")}
                error={errors?.irdaiInsurerCode?.message}
                isRequired
                disabled={isViewMode}
                ref={mergeRefs(
                  insurerNameRef,
                  register("irdaiInsurerCode").ref,
                )}
              />
              <Input
                label={t("insurerForm.fields.insurerCode.label")}
                placeholder={t("insurerForm.fields.insurerCode.placeholder")}
                {...register("insurerCode")}
                error={errors?.insurerCode?.message}
                disabled={isViewMode}
                ref={mergeRefs(insurerNameRef, register("insurerCode").ref)}
              />
              <Input
                label={t("insurerForm.fields.insuranceCompany.label")}
                placeholder={t(
                  "insurerForm.fields.insuranceCompany.placeholder",
                )}
                {...register("insOfficeName")}
                error={errors?.insOfficeName?.message}
                isRequired
                disabled={isViewMode}
              />

              <DropdownSelect
                label={t("insurerForm.fields.insurerType.label")}
                defaultValue={t("insurerForm.fields.insurerType.label")}
                name_key="insurerType"
                options={[
                  { label: "Private", value: "PRIVATE" },
                  { label: "PSU", value: "PSU" },
                ]}
                control={control}
                rules={{ required: "Insurer type is required" }}
                name="insurerType"
                errors={errors.insurerType}
                formClassName="mb-2"
                isRequired
                className="h-[38px] rounded-[10px]"
                disabled={isViewMode}
              />
              {!params?.id && (
                <Input
                  label={t("insurerForm.fields.officeCode.label")}
                  placeholder={t("insurerForm.fields.officeCode.placeholder")}
                  {...register("officeCode")}
                  error={errors?.officeCode?.message}
                  disabled={isViewMode}
                  isRequired
                />
              )}
              <Input
                label={t("insurerForm.fields.pan.label")}
                placeholder={t("insurerForm.fields.pan.placeholder")}
                {...register("panCard")}
                error={errors?.panCard?.message}
                disabled={isViewMode}
              />
              <Input
                label={t("insurerForm.fields.gstin.label")}
                placeholder={t("insurerForm.fields.gstin.placeholder")}
                {...register("gstin")}
                error={errors?.gstin?.message}
                disabled={isViewMode}
              />
              <Input
                label={t("insurerForm.fields.email.label")}
                placeholder={t("insurerForm.fields.email.placeholder")}
                prefix={
                  <EnvelopeIcon
                    className="size-5 transition-colors duration-200"
                    strokeWidth="1"
                  />
                }
                {...register("email")}
                error={errors?.email?.message}
                disabled={isViewMode}
              />
              <Input
                label={t("insurerForm.fields.phone.label")}
                placeholder={t("insurerForm.fields.phone.placeholder")}
                prefix={
                  <PhoneIcon
                    className="size-5 transition-colors duration-200"
                    strokeWidth="1"
                  />
                }
                {...register("phone")}
                error={errors?.phone?.message}
                disabled={isViewMode}
              />
              {params?.id && (
                <>
                  {document2.length === 0 && (
                    <Preview
                      label={t("insurerForm.brandLogo.label")}
                      value={document2}
                      onChange={async (files: File[]) => {
                        if (!files.length) return;
                        try {
                          setUploading(true);
                          const data = await uploadInsurerPdf({
                            file: files[0],
                            documentType: "BRAND_LOGO",
                            insurerId: params?.id!,
                          });
                          setIsLogo(true);
                          if (data?.data?.fileMetadataId) {
                            setIds((prev) => ({
                              ...prev,
                              logoId: data?.data?.fileMetadataId,
                            }));
                            toast.success("Document uploaded successfully", {
                              position: "top-right",
                              duration: 5000,
                            });
                          }
                        } catch (error) {
                          console.log("error", error);
                          toast?.error("Document upload failed");
                          setDocument2([]);
                        } finally {
                          setUploading(false);
                        }
                      }}
                      accept="image/png,image/jpeg"
                      isCancel={false}
                      isDisable={isViewMode}
                    />
                  )}
                  {document2?.length !== 0 && (
                    <div className="relative inline-block">
                      <p className="input-label">
                        {t("insurerForm.brandLogo.label")}
                      </p>
                      <div className="relative">
                        <div className="flex h-[100px] w-[100px] items-center justify-center rounded border border-[#cad5e2]">
                          <img
                            src={document2[0].downloadUrl}
                            alt="brand logo"
                            className="h-full w-full rounded object-contain"
                          />
                        </div>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteFile(
                                document2[0].fileMetadataId,
                                "logo",
                              )
                            }
                            className="absolute -top-[7px] left-[85px] flex h-5 w-5 min-w-5 cursor-pointer items-center justify-center rounded-full bg-black text-xs text-white hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <DropdownSelect
                    label={t("insurerForm.documents.uploadDocument")}
                    defaultValue={t("insurerForm.documents.document")}
                    name_key="uploadDocument"
                    options={[
                      {
                        label: "Principal agreement",
                        value: "PRINCIPAL_AGGREMENT",
                      },
                      { label: "Addendum", value: "ADDENDUM" },
                      { label: "Renewal", value: "RENEWAL" },
                      { label: "Others", value: "OTHERS" },
                    ]}
                    control={control}
                    name="uploadDocument"
                    errors={errors.uploadDocument}
                    className="h-[38px] rounded-[10px]"
                    disabled={isViewMode}
                  />
                  {documentSections?.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <h3 className="flex items-center gap-2 font-semibold text-[16x]">
                        All Uplodaded Document
                      </h3>
                      {visibleDocuments?.map((doc) => (
                        <button
                          type="button"
                          key={doc.id}
                          onClick={() => OpenPdfView(doc.url)}
                          className="group relative flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-1 transition hover:border-blue-400 hover:bg-blue-50"
                        >
                          <div className="flex h-[30px] items-center gap-2">
                            <div className="flex h-4 w-4 items-center justify-center rounded bg-red-100 text-red-600">
                              <DocumentTextIcon className="h-3 w-3" />
                            </div>

                            <div className="flex flex-col">
                              <span className="line-clamp-1 text-[10px] font-medium text-gray-800 capitalize group-hover:text-blue-600">
                                {doc.name}
                              </span>
                            </div>
                          </div>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(
                                  doc?.fileMetadataId,
                                  "document",
                                );
                              }}
                              className="flex h-5 w-5 min-w-5 cursor-pointer items-center justify-center rounded-full bg-black text-xs text-white hover:bg-red-600"
                            >
                              ✕
                            </button>
                          )}
                        </button>
                      ))}

                      {documentSections?.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setShowAllDocs((prev) => !prev)}
                          className="mt-1 cursor-pointer self-start text-[10px] font-medium text-blue-600 hover:underline"
                        >
                          {showAllDocs ? "View less" : "View more"}
                        </button>
                      )}
                    </div>
                  )}

                  {[
                    "PRINCIPAL_AGGREMENT",
                    "ADDENDUM",
                    "RENEWAL",
                    "OTHERS",
                  ].includes(String(documentType)) && (
                      <Preview
                        key={`${String(documentType)}-${previewResetKey}`}
                        label={formatDocumentLabel(String(documentType))}
                        value={[]}
                        onChange={async (files: any) => {
                          if (!files.length) return;
                          try {
                            setUploading(true);
                            const data = await uploadInsurerPdf({
                              file: files[0],
                              documentType: getDocumentType(newValue),
                              insurerId: params?.id,
                            });
                            if (data?.data?.fileMetadataId) {
                              setIds((prev) => ({
                                ...prev,
                                documentId: data?.data?.fileMetadataId,
                              }));
                              toast.success("Document uploaded successfully", {
                                position: "top-right",
                                duration: 5000,
                              });
                              setDocument(files);
                            }
                          } catch (error) {
                            toast.error("Document upload failed", {
                              duration: 5000,
                            });
                            setDocument([]);
                            console.log("error", error);
                          } finally {
                            setUploading(false);
                          }
                        }}
                        isRequred
                        accept="application/pdf"
                        isCancel={false}
                        isDisable={isViewMode}
                      />
                    )}
                </>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {document?.length > 0 && documentType && (
                <>
                  <Input
                    label="Start Date"
                    type="date"
                    {...register(
                      docPath(documentType as DocKey, "startDate" as DocField),
                    )}
                    error={
                      errors.documentDates?.[documentType as DocKey]?.startDate
                        ?.message
                    }
                  />

                  <Input
                    label="End Date"
                    type="date"
                    {...register(
                      docPath(documentType as DocKey, "endDate" as DocField),
                    )}
                    error={
                      errors.documentDates?.[documentType as DocKey]?.endDate
                        ?.message
                    }
                  />
                  <div className="mt-2 flex flex-col gap-2">
                    <Checkbox
                      label="Signed by TPA"
                      {...register(
                        docPath(
                          documentType as DocKey,
                          "signedByTPA" as DocField,
                        ),
                      )}
                    />
                    <Checkbox
                      label="Signed by Insurer"
                      {...register(
                        docPath(
                          documentType as DocKey,
                          "signedByInsurer" as DocField,
                        ),
                      )}
                    />
                  </div>
                  <Input
                    label="Effective Period (in days)"
                    placeholder="Enter Effective Period"
                    type="number"
                    {...register(
                      docPath(
                        documentType as DocKey,
                        "effectivePeriod" as DocField,
                      ),
                    )}
                    disabled={!!startDate && !!endDate}
                    error={errors?.effectivePeriod?.message}
                  />
                </>
              )}
            </div>
          </div>
          {showContactPersons && (
            <div className="mt-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between p-4">
                <div className="flex gap-2.5">
                  <h3 className="sub_section_title flex items-center gap-2 font-semibold text-gray-700">
                    <div className="h-5 w-5 text-blue-500">
                      <UserCircleIcon />
                    </div>

                    {t("contactPerson.title")}
                  </h3>

                  {mobileerror && (
                    <span className="input-text-error text-error dark:text-error-lighter text-[11px]">
                      {mobileerror}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpenContactModal(true);
                    setEditIndex(null);
                  }}
                  className="flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600"
                >
                  ➕ {t("contactPerson.addButton")}
                </button>
              </div>

              <div className="px-4 pb-4">
                <table className="w-full rounded-md border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left text-xs">
                        {t("contactPerson.table.action")}
                      </th>
                      <th className="p-2 text-left text-xs">
                        {t("contactPerson.table.fullName")}
                      </th>
                      <th className="p-2 text-left text-xs">
                        {t("contactPerson.table.designation")}
                      </th>
                      <th className="p-2 text-left text-xs">
                        {t("contactPerson.table.department")}
                      </th>
                      <th className="p-2 text-left text-xs">
                        {t("contactPerson.table.priority")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {contactPersonFields?.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-3 text-center text-gray-400"
                        >
                          {t("contactPerson.table.noData")}
                        </td>
                      </tr>
                    )}

                    {contactPersonFields?.map((person: any, index: number) => (
                      <tr
                        key={person?.id ?? index}
                        className="border-t p-2 text-xs"
                      >
                        <td className="ml-4 flex items-center gap-2 p-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditIndex(index);
                              setOpenContactModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title={t("contactPerson.actions.edit")}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeContactPerson(index)}
                            className="text-red-500 hover:text-red-700"
                            title={t("contactPerson.actions.remove")}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>

                        <td className="p-2">
                          {person?.prefix}. {person?.firstName}{" "}
                          {person?.middleName} {person?.lastName}
                        </td>
                        <td className="p-2">{person?.designation}</td>
                        <td className="p-2">{person?.department}</td>
                        <td className="p-2">{person?.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <AddressSection
            watch={watch}
            setValue={setValue}
            register={register}
            control={control}
            errors={errors}
            isAddressType={false}
            isDisable={isViewMode}
            ErrorMsg={errormsg}
          />
          {canWrite && (
            <div className="mt-2 mb-4 flex w-full items-center justify-end gap-4">
              <Button
                type="button"
                className="mt-5 w-24"
                onClick={onCancel}
                disabled={loading}
              >
                {t("branchForm.buttons.cancel")}
              </Button>

              {params?.id ? (
                isViewMode ? (
                  <div
                    className="btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker mt-5 w-24 text-white"
                    color="primary"
                    onClick={onEdit}
                  >
                    {t("branchForm.buttons.edit")}
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="mt-5 w-24"
                    color="primary"
                    disabled={loading}
                  >
                    {loading
                      ? t("branchForm.buttons.updating")
                      : t("branchForm.buttons.update")}
                  </Button>
                )
              ) : (
                <Button
                  type="submit"
                  className="mt-5 w-24"
                  color="primary"
                  disabled={loading}
                >
                  {loading
                    ? t("branchForm.buttons.submitting")
                    : t("branchForm.buttons.submit")}
                </Button>
              )}
            </div>
          )}
        </div>
      </FormLayout>
      <GlobalLoader show={uploading} text="Scanning Document..." />
      {isDrawerOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close drawer overlay"
          />
          <div
            className={`fixed top-0 right-0 z-50 h-full w-full transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:w-1/2 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">PDF Preview</h3>
              <button onClick={() => setIsDrawerOpen(false)}>
                <XMarkIcon className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800" />
              </button>
            </div>
            <div className="h-[calc(100%-52px)]">
              {pdfUrl && (
                <PdfViewer
                  pdfUrl={pdfUrl}
                  title="Document Viewer"
                  height="100%"
                  className="h-full"
                  selectedPdfUrl={pdfUrl || undefined}
                  onPdfSelect={(url) => setPdfUrl(url)}
                  availablePdfs={documentSections}
                />
              )}
            </div>
          </div>
        </>
      )}
      {openContactModal && (
        <ContactPopup
          editData={editIndex === null ? null : contactPersonFields[editIndex]}
          editIndex={editIndex}
          setContactPersonFields={setContactPersonFields}
          openContactModal={openContactModal}
          setOpenContactModal={setOpenContactModal}
        />
      )}
    </>
  );
};

export default AddInsurerForm;

//  const onSubmit: SubmitHandler<InsurerFormValues> = async (data) => {
//     const contactPersonRequestList = buildContactPersonRequestList({
//       formData: contactPersonFields,
//       tenantId: Tenent_Id,
//       includeContactPersonId: !!params.id,
//       includeChannelId: !!params.id,
//       assignmentId: !!params.id,
//     });
//     const cleanedAssignments = contactPersonRequestList?.length > 0 && hasAnyValue(contactPersonRequestList[0]) ? contactPersonRequestList : [];
//     const selectedDoc = data?.documentDates?.[documentType];
//     const startDate = selectedDoc?.startDate;
//     const endDate = selectedDoc?.endDate;
//     const effectivePeriod = selectedDoc?.effectivePeriod;
//     const signedByInsurer = selectedDoc?.signedByInsurer;
//     const signedByTPA = selectedDoc?.signedByTPA;

//     const payload = {
//       legalName: data.insOfficeName,
//       insurerType: data.insurerType,
//       irdaiInsurerCode: data.irdaiInsurerCode,
//       insurerCode: data.insurerCode,
//       contactEmail: data.email,
//       contactPhone: data.phone,
//       pan: data?.panCard,
//       abdmEmpanelledFlag: true,
//       gstin: data?.gstin ? data?.gstin : null,
//       insurerOffice: {
//         officeCode: String(data?.officeCode),
//         ...(params?.id ? { insurerOfficeId: officeId } : {}),
//       },
//       address: {
//         tenantId: Tenent_Id,
//         address: data.address?.address || "",
//         stateName: data.address?.stateName || "",
//         city: data.address?.city || "",
//         postalCode: data.address?.postalCode || "",
//       },
//       assignments: cleanedAssignments,
//       ...(params?.id &&
//         ids?.documentId && {
//         masterAgreements: [
//           {
//             startDate: startDate || null,
//             endDate: endDate || null,
//             signedByTpa: signedByTPA ?? false,
//             signedByInsurer: signedByInsurer ?? false,
//             fileMetadataId: ids?.documentId,
//             effectivePeriod: effectivePeriod || null,
//           },
//         ],
//         brandLogoAttachmentId: ids?.logoId,
//       }),

//     };
//     setLoading(true);
//     const result = await createAndUpdateInsurerApi(payload, isBoarding ? "" : params?.id);
//     if (result.success) {
//       setLoading(false);
//       toast.success(result.data.message, { position: "top-right", duration: 5000 });
//       if (isBoarding) {
//         dispatch(fetchOnBoardResolveData({ inwardNo: inwardNo, type: "IC", masterId: result?.data?.data?.id }))
//       }
//       if (isMultiStep) {
//         onSuccess?.();
//       } else {
//         navigate(isBoarding ? "/enrolment-system/corporate-enrolment" : "/insurer-management/insurer");
//       }
//     } else if (result?.status === 409) {
//       if (result?.error?.mobileNumber || result?.error?.email) {
//         setMobileError(result?.error?.mobileNumber ? result?.error?.mobileNumber : result?.error?.email)
//         setLoading(false);
//       } else {
//         insurerNameRef.current?.focus();
//         insurerNameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
//         handleFormApiErrors(result as any, setError, insurerFieldMap as any);
//         setLoading(false);
//         setMobileError("")
//       }
//     }
//     else {
//       handleApiError(result);
//       setMobileError("")
//       setLoading(false);
//     }
//   };
