import { policySearchApi } from "@/app/api/apiService";
import { useRole } from "@/app/auth/usePermission";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { handleApiError } from "@/app/pages/AdminDepartment/tpabranches/function";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Button, Input } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import * as yup from "yup";
import DocumentDropdown from "../corporate/DocumentDropdown";
import CreateCorporateInwardModal from "./CreateCorporateInwardModal";
import { saveAndUpdateEndorsment } from "./funcation";
import { fetchEscalationMatrixdepartment } from "@/store/features/escalationMatrix/matrixSlice";
import { DateInput, formatDateForDatePicker } from "@/components/ui/Form/DateInput";
import { toNumber } from "./forms/FamilyRule";

interface EndorsementFormData {
  policy_id: string;
  insurer_id: string;

  policy_endorsement_number: string;
  policy_endorsement_type: string;

  policy_endorsement_members_added_count: number;
  policy_endorsement_members_deleted_count?: number;
  policy_endorsement_members_modified_count?: number;

  policy_endorsement_net_premium_amount?: number;
  policy_endorsement_premium_deducted_amount?: number;
  policy_endorsement_total_premium_amount?: number;

  policy_endorsement_effective_date: string;
  policy_endorsement_received_date: string;
  policy_endorsement_request_date: string;

  policy_endorsement_remark?: string;

  endorsementCopy?: FileList;
}

const schema = yup.object({
  policy_id: yup.string().required("Policy Number is required"),

  insurer_id: yup.string().required("Insurer Name is required"),

  policy_endorsement_number: yup
    .string()
    .required("Endorsement Number is required"),

  policy_endorsement_type: yup
    .string()
    .required("Endorsement Type is required"),

  // Added Count
  policy_endorsement_members_added_count: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .typeError("Added Members Count must be a number")
    .when("policy_endorsement_type", ([value], schema) =>
      [
        "Addition",
        "Addition_Deletion",
        "Addition_Correction",
        "Addition_Deletion_Correction",
      ].includes(value)
        ? schema.required("Added Members Count is required")
        : schema.optional(),
    ),

  // Deleted Count
  policy_endorsement_members_deleted_count: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .typeError("Deleted Members Count must be a number")
    .when("policy_endorsement_type", ([value], schema) =>
      [
        "Deletion",
        "Addition_Deletion",
        "Deletion_Correction",
        "Addition_Deletion_Correction",
      ].includes(value)
        ? schema.required("Deleted Members Count is required")
        : schema.optional(),
    ),

  // Modified Count
  policy_endorsement_members_modified_count: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .typeError("Modified Members Count must be a number")
    .when("policy_endorsement_type", ([value], schema) =>
      [
        "Correction",
        "Addition_Correction",
        "Deletion_Correction",
        "Addition_Deletion_Correction",
      ].includes(value)
        ? schema.required("Modified Members Count is required")
        : schema.optional(),
    ),

  policy_endorsement_net_premium_amount: yup
    .string()
    .nullable()
    .notRequired(),

  policy_endorsement_premium_deducted_amount: yup
    .string()
    .nullable()
    .notRequired(),

  policy_endorsement_total_premium_amount: yup
    .string()
    .nullable()
    .notRequired(),

  policy_endorsement_received_date: yup
    .string()
    .required("Endorsement Received Date is required"),

  policy_endorsement_effective_date: yup
    .string()
    .required("Endorsement Effective Date is required"),

  policy_endorsement_request_date: yup
    .string()
    .required("Endorsement Request Date is required"),

  policy_endorsement_remark: yup.string().optional(),
});

const ENDORSEMENT_TYPE_OPTIONS = [
  { label: "Addition", value: "Addition" },
  { label: "Deletion", value: "Deletion" },
  { label: "Correction", value: "Correction" },
  { label: "Addition + Deletion", value: "Addition_Deletion" },
  { label: "Addition + Correction", value: "Addition_Correction" },
  { label: "Addition + Deletion + Correction", value: "Addition_Deletion_Correction" },
  { label: "Deletion + Correction", value: "Deletion_Correction" },
  { label: "Nil", value: "Nil" },
  { label: "Policy cancellation", value: "Policy_cancellation" },
  { label: "Policy Period extension", value: "Policy_Period_extension" },
  { label: "Other", value: "Other" },
];
const EndorsementView: React.FC = () => {
  const { t } = useTranslation()

  const params = useParams();
  const mainurl = useLocation();

  const queryParams = new URLSearchParams(mainurl.search);
  const inwardNo = queryParams.get("inwardNo");
  const { isQC, isProcessor } = useRole();

  const [policyData, setPolicyData] = useState<any>(null);

  const url = `/v1/ocr/${params?.id}`;
  const getPolicyData = async () => {
    const result = await fetchUser(policySearchApi, url);
    if (result?.success && result?.data) {
      setPolicyData(result?.data?.data);
    }
  };
  useEffect(() => {
    if (params?.id) {
      getPolicyData();
    }
  }, [params?.id]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EndorsementFormData>({
    resolver: yupResolver(schema as any),
    mode: "onBlur",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"PROCESSOR_PENDING" | "REASSIGNED" | "COMPLETED" | null>(null);
  const navigate = useNavigate()
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const policyNo = searchParams.get("policyNo");
  const policyRecordType = searchParams?.get("policyRecordType");


  const onSubmit = async (data: EndorsementFormData) => {
    setIsSubmitting(true);

    const payload = {
      ...policyData?.policyScheduleJsonb,
      endorsement_identifiers: {
        ...policyData?.policyScheduleJsonb?.endorsement_identifiers,
        policy_endorsement_type: data.policy_endorsement_type,
        policy_endorsement_number: data.policy_endorsement_number,
        policy_endorsement_received_date: data.policy_endorsement_received_date,
        policy_endorsement_effective_date: data.policy_endorsement_effective_date,
        policy_endorsement_request_date: data.policy_endorsement_request_date,
      },
      linked_policy_reference: {
        ...policyData?.policyScheduleJsonb?.linked_policy_reference,
        policy_no: data.policy_id,
        insurerId: data?.insurer_id,
      },
      endorsement_change_details: {
        ...policyData?.policyScheduleJsonb?.endorsement_change_details,
        policy_endorsement_members_added_count: data?.policy_endorsement_members_added_count,
        policy_endorsement_members_deleted_count: data?.policy_endorsement_members_deleted_count,
        policy_endorsement_members_modified_count: data?.policy_endorsement_members_modified_count,
      },
      endorsement_financial_impact: {
        ...policyData?.policyScheduleJsonb?.endorsement_financial_impact,
        policy_premium_details: {
          ...policyData?.policyScheduleJsonb?.endorsement_financial_impact?.policy_premium_details,
          policy_endorsement_total_premium_amount: toNumber(data?.policy_endorsement_total_premium_amount),
          policy_endorsement_net_premium_amount: toNumber(data?.policy_endorsement_net_premium_amount),
          policy_endorsement_premium_deducted_amount: toNumber(data?.policy_endorsement_premium_deducted_amount),


        },
      },
      policy_endorsement_remark: data?.policy_endorsement_remark
    };
    let status = "COMPLETED";

    if (isProcessor) {
      status = "QC_PENDING";
    } else if (isQC) {
      status =
        actionType === "PROCESSOR_PENDING"
          ? "PROCESSOR_PENDING"
          : actionType === "REASSIGNED"
            ? "REASSIGNED"
            : "COMPLETED";
    }
    const mainPayload = {
      inwardNo: policyData?.inwardNo,
      status: status,
      policyScheduleJson: payload,
      policyNumber: policyNo,
      policyRecordType: policyData?.policyRecordType


    }
    const result = await saveAndUpdateEndorsment(mainPayload)
    if (result?.success) {
      toast?.success(result?.data?.message, { position: "top-right", duration: 5000 });
      if (isQC) {
        if (status === "REASSIGNED") {
          navigate("/enrolment-system/corporate-enrolment");
        } else {
          navigate(`/enrolment-system/endorsement-member-data?policyEndorsementId=${result?.data?.data?.policyEndorsementId}&inwardNo=${inwardNo}&policyId=${result?.data?.data?.policyId}`);
        }
      } else {
        navigate("/enrolment-system/corporate-enrolment");
      }
    } else if (result?.status === 409) {
      toast.error(result?.message, { position: "top-right", duration: 5000 });
    } else {
      handleApiError(result);
    }
    setIsSubmitting(false);
  };

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchInsurers({ size: "100" }));
    dispatch(fetchEscalationMatrixdepartment());
  }, [])

  const { insurerMainList } = useAppSelector((state) => state.insurer);
  const insurerListNew = insurerMainList?.map((i: any) => ({
    value: i?.id,
    label: i?.name,
  }));
  const [policyId, setPolicyId] = useState("");

  useEffect(() => {
    if (policyData) {
      const policyId = policyData?.policyNo || policyData?.policyScheduleJsonb?.linked_policy_reference?.policy_no || "";
      const insurerId = policyData?.insurerId || policyData?.policyScheduleJsonb?.linked_policy_reference?.insurerId || "";
      setPolicyId(policyId)

      setValue("policy_id", policyId || "");
      setValue("insurer_id", insurerId || "");
      setValue("policy_endorsement_number", policyData?.policyScheduleJsonb?.endorsement_identifiers?.policy_endorsement_number || "");
      setValue("policy_endorsement_type", policyData?.policyScheduleJsonb?.endorsement_identifiers?.policy_endorsement_type || "");

      setValue("policy_endorsement_members_added_count", policyData?.policyScheduleJsonb?.endorsement_change_details?.policy_endorsement_members_added_count || "");
      setValue("policy_endorsement_members_deleted_count", policyData?.policyScheduleJsonb?.endorsement_change_details?.policy_endorsement_members_deleted_count || "");
      setValue("policy_endorsement_members_modified_count", policyData?.policyScheduleJsonb?.endorsement_change_details?.policy_endorsement_members_modified_count || "");

      setValue("policy_endorsement_net_premium_amount", policyData?.policyScheduleJsonb?.endorsement_financial_impact?.policy_premium_details?.policy_endorsement_net_premium_amount || 0);
      setValue("policy_endorsement_total_premium_amount", policyData?.policyScheduleJsonb?.endorsement_financial_impact?.policy_premium_details?.policy_endorsement_total_premium_amount || 0);
      setValue("policy_endorsement_premium_deducted_amount", policyData?.policyScheduleJsonb?.endorsement_financial_impact?.policy_premium_details?.policy_endorsement_premium_deducted_amount || 0);

      setValue("policy_endorsement_effective_date", policyData?.policyScheduleJsonb?.endorsement_identifiers?.policy_endorsement_effective_date || "");
      setValue("policy_endorsement_received_date", policyData?.policyScheduleJsonb?.endorsement_identifiers?.policy_endorsement_received_date || "");
      setValue("policy_endorsement_request_date", policyData?.policyScheduleJsonb?.endorsement_identifiers?.policy_endorsement_request_date || "");
      setValue("policy_endorsement_remark", policyData?.policyScheduleJsonb?.policy_endorsement_remark || "");
    }
  }, [policyData, setValue]);


  const generatePolicyId = (id: string, number: number) => {
    const baseId = id?.replace("_FRESH_", "_END_");
    return `${baseId}_${String(number).padStart(2, "0")}`;
  };

  // const url2 = `/v1/policy-endorsements/by-policy-number?policyNumber=ADIT_FRESH_31082026570`;
  const url2 = `/v1/policy-endorsements/by-policy-number?policyNumber=${policyId}`;
  const [policyListData, setPolicyListData] = useState<any>(null);
  const getPolicyDataList = async () => {
    const result = await fetchUser(policySearchApi, url2);
    if (result?.success && result?.data) {
      setPolicyListData(result?.data?.data);
    }
  };

useEffect(() => {
  if (policyId) {
    getPolicyDataList();
  }
}, [policyId]);

useEffect(() => {
  if (policyId && policyListData) {
    const endorsementNumber = policyListData.length + 1;

    const finalId = generatePolicyId(
      String(policyId),
      endorsementNumber
    );

    setValue("policy_endorsement_number", finalId);
  }
}, [policyId, policyListData]);

  const endorsementType = watch("policy_endorsement_type");
  const hasDeletion = endorsementType?.includes("Deletion");


  useBreadcrumb([
    { title: t("nav.dashboards.enrollmentsystem") },
    { title: " Corporate Inward", path: "/enrolment-system/corporate-enrolment" },
    { title: "Endorsement", },
    ...(policyData?.policyNo
      ? [{ title: `${policyData.policyNo}` }]
      : []),
  ]);



  const [open, setOpen] = useState(false);

  const getRoleMessage = () => {
    if (isQC) return t("stepNavigation.messages.qcReviewPending");
    if (isProcessor) return t("stepNavigation.messages.processingInProgress");
    return "";
  };


  const isAddRequired = ["Addition", "Addition_Deletion", "Addition_Correction", "Addition_Deletion_Correction",]?.includes(endorsementType);
  const isDeleteRequired = ["Deletion", "Addition_Deletion", "Deletion_Correction", "Addition_Deletion_Correction",]?.includes(endorsementType);
  const isModifyRequired = ["Correction", "Addition_Correction", "Deletion_Correction", "Addition_Deletion_Correction",]?.includes(endorsementType);

  const { depertment } = useAppSelector((state) => state.matrix);
  const [enrollmentDepartmentId, setEnrollmentDepartmentId] = useState("");

  useEffect(() => {
    if (depertment?.length) {
      const enrollmentDept = depertment?.find((item: any) => item?.departmentName?.toLowerCase() === "enrollment");
      if (enrollmentDept) {
        setEnrollmentDepartmentId(enrollmentDept.departmentId);
      }
    }
  }, [depertment]);
  const selectedInward = { inwardNo: policyData?.inwardNo, s3BucketName: "enrollment", s3SubBucketName: "ENDORSEMENT", departmentId: enrollmentDepartmentId }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white">
        <div className="grid grid-cols-5 gap-4">
          <Input
            label="Policy Number"
            placeholder="Policy Number"
            {...register("policy_id")}
            error={errors.policy_id?.message}
            isRequired
            disabled={!!policyData?.policyNo}
          />
          <DropdownSelect
            label="Insurer Name"
            defaultValue="Insurer Name"
            name="insurer_id"
            options={insurerListNew}
            control={control}
            errors={errors.insurer_id}
            isRequired
            disabled={!!policyData?.insurerId}
          />
          <Input
            label="Endorsement Number"
            placeholder="Endorsement Number"
            {...register("policy_endorsement_number")}
            error={errors.policy_endorsement_number?.message}
            isRequired
            disabled={policyRecordType === "DUMMY"}
          />
          <DropdownSelect
            label="Endorsement Type"
            defaultValue="Endorsement Type"
            name="policy_endorsement_type"
            options={ENDORSEMENT_TYPE_OPTIONS}
            control={control}
            errors={errors.policy_endorsement_type}
            isRequired
          />
          <Input
            label="Added Members Count"
            placeholder="Members Count"
            type="number"
            {...register("policy_endorsement_members_added_count", {
              required: isAddRequired
                ? "Added Members Count is required"
                : false,
            })}
            error={errors.policy_endorsement_members_added_count?.message}
            isRequired={isAddRequired}
          />
          <Input
            label="Deleted Members Count"
            placeholder="Members Count"
            type="number"
            {...register("policy_endorsement_members_deleted_count", {
              required: isDeleteRequired
                ? "Deleted Members Count is required"
                : false,
            })}
            error={errors.policy_endorsement_members_deleted_count?.message}
            isRequired={isDeleteRequired}
          />
          <Input
            label="Modified Members Count"
            placeholder="Members Count"
            type="number"
            {...register("policy_endorsement_members_modified_count", {
              required: isModifyRequired
                ? "Modified Members Count is required"
                : false,
            })}
            error={errors.policy_endorsement_members_modified_count?.message}
            isRequired={isModifyRequired}
          />
          <Controller
            control={control}
            name="policy_endorsement_premium_deducted_amount"
            render={({ field }) => (
              <Input
                {...field}
                label="Endorsement Premium Deducted Amount"
                placeholder="Net Premium"
                onChange={(e) => field.onChange(toNumber(e.target.value))}
                formatNumber
                isPrice
                error={errors.policy_endorsement_premium_deducted_amount?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="policy_endorsement_net_premium_amount"
            render={({ field }) => (
              <Input
                {...field}
                label="Endorsement Net Premium"
                placeholder="Net Premium"
                onChange={(e) => field.onChange(toNumber(e.target.value))}
                formatNumber
                isPrice
                error={errors.policy_endorsement_net_premium_amount?.message}

              />
            )}
          />
          <Controller
            control={control}
            name="policy_endorsement_total_premium_amount"
            render={({ field }) => (
              <Input
                {...field}
                label={"Endorsement Total Premium"}
                placeholder="Total Premium"
                onChange={(e) => field.onChange(toNumber(e.target.value))}
                formatNumber
                isPrice
                isInfo={hasDeletion}
                isInfoMsg={
                  hasDeletion
                    ? "You can enter a negative amount, with (-) Negative sign"
                    : ""
                }
              />
            )}
          />
          <Controller
            name="policy_endorsement_received_date"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Endorsement Received Date"
                value={field.value}
                onChange={(date) => field.onChange(formatDateForDatePicker(date))}
                error={errors.policy_endorsement_received_date?.message}
                isRequired
              />
            )}
          />
          <Controller
            name="policy_endorsement_effective_date"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Endorsement Effective Date"
                value={field.value}
                onChange={(date) => field.onChange(formatDateForDatePicker(date))}
                error={errors.policy_endorsement_effective_date?.message}
                isRequired
              />
            )}
          />
          <Controller
            name="policy_endorsement_request_date"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Endorsement Request Date"
                value={field.value}
                onChange={(date) => field.onChange(formatDateForDatePicker(date))}
                error={errors.policy_endorsement_request_date?.message}
                isRequired
              />
            )}
          />
          <Input
            label="Remarks"
            {...register("policy_endorsement_remark")}
            error={errors.policy_endorsement_remark?.message}
            placeholder="Remarks"
          />
        </div>
        <DocumentDropdown
          inwardNo={inwardNo} />
        <div className={`flex justify-start mb-2  text-[11px]  w-[30%] flex-col mt-4`}>
          <p className="input-label"> Upload document against this endorsement</p>
          <div
            className="w-22 btn-base btn this:primary bg-this hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light dark:disabled:bg-this-darker mt-1  text-white"
            onClick={() => setOpen(true)}
          >
            {t("upload")}
          </div>
        </div>


        <div className="flex items-center justify-between gap-4 mt-4">
          {/* Status */}
          <div
            className={`flex-1 px-3 py-1 rounded-md text-xs font-medium ${isQC
              ? "bg-green-50 text-green-700"
              : "bg-yellow-50 text-yellow-700"
              }`}
          >
            <div>
              {isQC
                ? t("stepNavigation.stages.qcReviewStage")
                : t("stepNavigation.stages.processingStage")}
            </div>

            <div className="text-[10px]">
              {getRoleMessage()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isQC && (
              <Button
                type="submit"
                className="w-24"
                color="primary"
                disabled={isSubmitting}
                onClick={() => setActionType("REASSIGNED")}
              >
                {t("stepNavigation.buttons.reassign")}
              </Button>
            )}

            <Button
              type="submit"
              className="w-24"
              color="primary"
              disabled={isSubmitting}
              onClick={() => setActionType("COMPLETED")}
            >
              {t("stepNavigation.buttons.save")}
            </Button>
          </div>
        </div>

      </form>
      {open && (
        <CreateCorporateInwardModal
          open={open}
          onClose={() => setOpen(false)}
          isData={selectedInward}
          isNotInword
        />
      )}

    </>
  );
};

export default EndorsementView;