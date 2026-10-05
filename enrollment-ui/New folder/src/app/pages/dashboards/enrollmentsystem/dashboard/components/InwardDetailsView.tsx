import { policySearchApi } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import DocumentDropdown, { formatDocType } from "../corporate/DocumentDropdown";
import { formatAmountWithWords } from "./types";
import { useTranslation } from "react-i18next";
import { format, isValid } from "date-fns";


export const formatDate = (date?: string | null) => {
  if (!date || date.trim() === "" || date === "-") {
    return "-";
  }

  const parsedDate = new Date(date);

  if (!isValid(parsedDate)) {
    return "-";
  }

  return format(parsedDate, "dd MMM yyyy");
};
export const SectionCard = ({
  title,
  fields,
  isShow = false,
}: {
  title?: string;
  isShow?: boolean;
  fields: { label: string; value: any }[];
}) => {
  const [showAll, setShowAll] = useState(false);
  const visibleFields = showAll || isShow ? fields : fields.slice(0, 4);

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-md">
      {title && (
        <div className="bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
          {title}
        </div>
      )}
      <div>
        {visibleFields?.map(({ label, value }) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
        {fields?.length > 4 && !isShow && (
          <div className="px-4 py-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="cursor-pointer text-[12px] text-blue-600 underline"
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-row border-b text-[10px]">
    {label && (
      <div className="w-[33%] bg-gray-100 px-4 py-1 text-[10px] font-bold">
        {label}
      </div>
    )}
    <div className="w-[67%] bg-white px-4 py-1 text-[10px]">
      {value || "-"}
    </div>
  </div>
);

const InwardDetailsView = () => {
  const { t } = useTranslation()
  useBreadcrumb([
    { title: t("nav.dashboards.enrollmentsystem") },
    { title: t("corporateInward.breadcrumb.dashboard"), path: "/enrolment-system/dashboard" },
    {
      title: t("corporateInward.pageTitle"),
      path: "/enrolment-system/corporate-enrolment",
    },
    { title: "Enrollment Summary" },
  ]);



  const params = useParams();
  const [policyData, setPolicyData] = useState<any>(null);

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const policyNo = queryParams.get("policyNo");
  const inwardNo = queryParams.get("inwardNo");
  const navigate = useNavigate();

  useEffect(() => {
    const url = `/v1/policies?policyNo=${policyNo}`;
    const getPolicyData = async () => {
      const result = await fetchUser(policySearchApi, url);
      if (result?.success && result?.data) {
        setPolicyData(result?.data?.data);
      }
    };

    if (params?.id) {
      getPolicyData();
    }
  }, [params?.id]);




  if (!policyData) return <div className="p-6">Loading...</div>;

  const data = policyData?.[0];


  const getDisplayValue = (
    value: string | string[] | null | undefined
  ): string => {
    let result = Array.isArray(value) ? value[0] : value;

    if (!result) return "";

    // Remove [ ] if they are part of the string
    result = result?.replace(/^\[|\]$/g, "");

    // Remove markdown mailto format
    result = result?.replace(/^\[([^\]]+)\]\(mailto:[^)]+\)$/, "$1");

    return result;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="flex items-center gap-4">
        <h1 className="text-[14px] font-semibold">
          {t("summary.title")}
        </h1>

        <button
          onClick={() => {
            const policyId = data?.policy?.policyId;
            const dummyPolicyNumber = data?.policy?.dummyPolicyNumber;
            navigate(`/enrolment-system/member-data?policyId=${policyId}${dummyPolicyNumber ? `&dummyPolicyNumber=${dummyPolicyNumber}` : ''}`);
          }}
          className="mb-0 cursor-pointer text-sm font-medium text-blue-600 underline hover:text-blue-800">
          {t("summary.viewMemberData")}
        </button>
        <DocumentDropdown inwardNo={inwardNo} />
      </div>

      <div className="grid grid-cols-1 items-start gap-1.5 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <SectionCard
            title={t("summary.sections.insurerDetails")}
            fields={[
              {
                label: t("summary.fields.insurerName"),
                value: data?.policy?.insurerName,
              },
              {
                label: t("summary.fields.productName"),
                value: data?.policy?.masterProductName,
              },
              {
                label: t("summary.fields.insurerType"),
                value: data?.policy?.policyInsurerType,
              },
              {
                label: t("summary.fields.issuingOffice"),
                value: formatDocType(
                  data?.policy?.insurerIssuingOfficeName
                ),
              },
            ]}
          />

          <SectionCard
            title={t("summary.sections.corporateDetails")}
            fields={[
              {
                label: t("summary.fields.corporateName"),
                value: data?.policy?.corporateName,
              },
              {
                label: t("summary.fields.groupName"),
                value: data?.policy?.corporateGroupName,
              },
              {
                label: t("summary.fields.address"),
                value: data?.policy?.policyProposerAddress,
              },
              {
                label: t("summary.fields.state"),
                value: data?.policy?.policyProposerAddressState,
              },
              {
                label: t("summary.fields.district"),
                value: data?.policy?.policyProposerAddressDistrict,
              },
              {
                label: t("summary.fields.email"),
                value: getDisplayValue(data?.policy?.policyProposerContactEmailId),
              },
              {
                label: t("summary.fields.mobile"),
                value: getDisplayValue(data?.policy?.policyProposerContactMobileNumber),
              },
            ]}
          />

          <SectionCard
            title={t("summary.sections.tpaDetails")}
            fields={[
              {
                label: t("summary.fields.tpaName"),
                value: data?.policy?.tpaServicingBranchName,
              },
              {
                label: t("summary.fields.spocName"),
                value: data?.tpaSpoc?.tpaSpocName,
              },
              // {
              //   label: t("summary.fields.email"),
              //   value: data?.tpaSpoc?.tpaSpocEmailId?.[0],
              // },
              // {
              //   label: t("summary.fields.mobile"),
              //   value: data?.tpaSpoc?.tpaSpocMobileNo,
              // },
            ]}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <SectionCard
            title={t("summary.sections.policyDetails")}
            fields={[
              {
                label: t("summary.fields.policyNumber"),
                value: data?.policy?.policyNumber,
              },
              {
                label: t("summary.fields.policyType"),
                value: data?.policy?.policyRenewalType,
              },
              {
                label: t("summary.fields.policyPlan"),
                value: data?.policy?.policyCoverageStructureType,
              },
              {
                label: t("summary.fields.policyStatus"),
                value: data?.policy?.policyStatus,
              },
              {
                label: t("summary.fields.issueDate"),
                value: formatDate(data?.policy?.policyIssueDate),
              },
              {
                label: t("summary.fields.startDate"),
                value: formatDate(data?.policy?.policyStartDate),
              },
              {
                label: t("summary.fields.endDate"),
                value: formatDate(data?.policy?.policyEndDate),
              },
              {
                label: t("summary.fields.totalSumInsured"),
                value: formatAmountWithWords(
                  data?.policy?.policyTotalSumInsured
                ),
              },
              {
                label: t("summary.fields.totalLivesInsured"),
                value: data?.policy?.policyTotalInsuredPersonAtInception,
              },
              {
                label: t("summary.fields.premium"),
                value: formatAmountWithWords(
                  data?.premiums?.[0]?.premiumGrossAmount
                ),
              },
            ]}
            isShow={false}
          />

          <SectionCard
            title={t("summary.sections.intermediaryDetails")}
            fields={[
              {
                label: t("summary.fields.brokerName"),
                value: data?.policy?.brokerName,
              },
              {
                label: t("summary.fields.brokerCode"),
                value: data?.policy?.brokerCode,
              },
              {
                label: t("summary.fields.email"),
                value: data?.policy?.brokerContactEmailId?.[0],
              },
              {
                label: t("summary.fields.contactNumber"),
                value: data?.policy?.brokerContactMobileNumber,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
export default InwardDetailsView;
