import { documentApi2, eCardService, memberData2, memberService } from "@/app/api/apiService";
import { useRole } from "@/app/auth/usePermission";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { PageContent } from "@/components/shared/PageContent";
import Pagination from "@/components/shared/Pagination";
import { AgGridSuperWrapper } from "@/components/shared/table/AgGridWrapper";
import { useDisclosure } from "@/hooks/useDisclosure";
import {
  fetchMemberData, fetchMemberDataStatistics, fetchMemberService, fetchMemberServiceErrorlogAndRecancation, fetchMemberServiceForDiscrepancy, fetchMemberServiceForExceptions,
} from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { DocumentChartBarIcon, EyeIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import CommonSearch, { SearchField } from "../../../CommonSearch";
import DropdownButton from "../../../DropdownButton";
import CheckListButton from "../../../insurerManagement/IcCheckList/CheckListButton";
import ExportLoader from "../../../providerManagernt/provider-master/rohini-master/components/ExportLoader";
import { fetchMemberDocApi } from "../../PolicyDetails/InwardView";
import { downloadFile, downloadFile2 } from "./Exportfuncation";
import MemberStats from "./MemberStats";
import CreateCorporateInwardModal from "../components/CreateCorporateInwardModal";
import { useTranslation } from "react-i18next";
import ProgressModal from "./ProgressModal";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { ExclamationTriangleIcon, UserGroupIcon } from "@heroicons/react/24/outline";

function stripBracketedPrefixes(value: string): string {
  let result = "";
  let index = 0;

  while (index < value.length) {
    const bracketStart = value.indexOf("[", index);
    if (bracketStart === -1) {
      return (result + value.slice(index)).trim();
    }

    result += value.slice(index, bracketStart);
    const bracketEnd = value.indexOf("]", bracketStart + 1);
    if (bracketEnd === -1) {
      return (result + value.slice(bracketStart)).trim();
    }

    index = bracketEnd + 1;
    while (index < value.length && " \t\n\r".includes(value[index]!)) {
      index += 1;
    }
  }

  return result.trim();
}
export const formatCategory = (category: string) => {
  return category?.toLowerCase()?.split("_")?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))?.join(" ");
};


const ExceptionSummary = ({
  data,
  policyId,
  inwardNo,
  dummyPolicyNumber
}: {
  data: any[];
  policyId: string | null;
  inwardNo?: string | null;
  dummyPolicyNumber?: string | null;
}) => {
  const navigate = useNavigate();



  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams();

    params.set("category", category);

    if (policyId) {
      params.set("policyId", policyId);
    }

    if (inwardNo) {
      params.set("inwardNo", inwardNo);
    }
    if (dummyPolicyNumber) {
      params.set("dummyPolicyNumber", dummyPolicyNumber);
    }

    navigate(`/enrolment-system/member-data/exception-details?${params.toString()}`);
  };

  return (
    <div className="mt-2 h-full overflow-auto bg-gray-50">
      <div className="mb-2 flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-3">
        <span className="text-sm font-semibold text-blue-700">
          Grouped Exception Boxes
        </span>

        <span className="mx-3 h-5 w-px bg-blue-300" />

        <span className="text-sm text-blue-700">
          {/* Each box groups all members under an exception category with{" "} */}
          The category and member count are displayed together, and Review Exception lets you view the details
          {/* <span className="font-bold">
      one category name
    </span>{" "}
    and{" "}
    <span className="font-bold">
      one Action button
    </span> */}
          .
        </span>
      </div>
      <div className="space-y-1">
        {data.map((item, index) => {
          const category = formatCategory(item.category);

          return (
            <div
              key={item.category}
              className="flex min-h-10 items-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
              <div className="mr-4 flex w-8 shrink-0 items-center justify-center">
                <span className="text-sm font-semibold text-gray-500">
                  #{index + 1}
                </span>
              </div>

              {/* Exception Category */}
              <div className="flex min-w-[230px] items-center">
                <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5">
                  <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />

                  <span className="text-[12px] font-semibold text-amber-700">
                    {category}
                  </span>
                </div>
              </div>

              {/* Members */}
              <div className="ml-3 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5">
                <UserGroupIcon className="h-4 w-4 text-gray-500" />

                <span className="text-[12px] font-medium text-gray-600">
                  {item.count}{" "}
                  {item.count === 1 ? "Member" : "Members"}
                </span>
              </div>

              {/* Pending */}
              <div className="ml-3">
                <span className="inline-flex items-center rounded-md bg-amber-100 px-3 py-1.5 text-[12px] font-medium text-amber-700">
                  {item.count} Pending
                </span>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Review Button */}
              <button
                type="button"
                onClick={() =>
                  handleCategoryClick(item.category)
                }
                className="h-8 flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <EyeIcon className="h-4 w-4" />

                <span>Review Exception</span>

                <span className="text-base">→</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default function MemberData() {
  const { t } = useTranslation()
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const { errorLogAndRecanlaiton, totalRecordsForErrorLogAndRecanlation, memberData, memberDataStatistics, totalRecordsOfMemberData, memberDataForDiscrepancy, memberDataForException, totalRecordsForDiscrepancy, totalRecordsForException } = useAppSelector((state) => state.broker);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSuperAdmin } = useRole();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<any>(null)
  const [open, setOpen] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const policyId = queryParams.get("policyId");
  const inwardNumber = queryParams.get("inwardNo");
  const dummyPolicyNumber = queryParams.get("dummyPolicyNumber");
  const tab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"ENROLLED" | "FAILED" | "DISCREPANCY" | "EXCEPTION" | "RECONCILIATION" | "ERROR_LOG">(tab === "EXCEPTION" ? "EXCEPTION" : "ENROLLED");

  const failFields: SearchField[] = [
    {
      name: "insuredMemberUniqueHealthIdentificationNumber",
      label: t("memberData.search.memberId"),
      type: "text",
    },
    {
      name: "corporateEmployeeCode",
      label: t("memberData.search.employeeId"),
      type: "text",
    },
    {
      name: "insuredMemberName",
      label: t("memberData.search.nameOfInsured"),
      type: "text",
    },
  ];
  const healthCardField: SearchField = {
    name: "healthCardNumber",
    label: t("memberData.search.healthCardNumber"),
    type: "text",
  };
  const enrollFields: SearchField[] = [
    {
      name: "insuredMemberName",
      label: t("memberData.search.nameOfInsured"),
      type: "text",
    },
    ...(activeTab !== "DISCREPANCY" ? [healthCardField] : []),
  ];
  const dynamicFields =
    activeTab === "FAILED" ? failFields : enrollFields;

  useEffect(() => {
    dispatch(
      fetchMemberDataStatistics({
        policyId,
      })
    );
    dispatch(
      fetchMemberServiceForDiscrepancy({
        policyId,
      })
    );

    dispatch(
      fetchMemberServiceForExceptions({
        policyId,
      })
    );

  }, []);

  const fetchData = (extraFilters: Record<string, any> = {}, tabParam?: "ENROLLED" | "FAILED" | "EXCEPTION" | "DISCREPANCY" | "RECONCILIATION" | "ERROR_LOG") => {
    const tab = tabParam || activeTab;

    const payload = {
      page,
      size: pageSize,
      ...filters,
      ...extraFilters,
    };
    const errorpayload = {
      page,
      size: pageSize,
      reconciliationStatus: "EXISTING_MEMBER_MATCHED,NEW_ENROLLED"
    }
    const repayload = {
      page,
      size: pageSize,
      reconciliationStatus: "MEMBER_DELETED,PARTIAL_MISMATCH"
    }

    switch (tab) {
      case "FAILED":
        dispatch(
          fetchMemberData({
            ...payload,
            policyId,
            enrollmentStatus: "VALIDATION_FAILED",
          })
        );
        break;

      case "DISCREPANCY":
        dispatch(
          fetchMemberServiceForDiscrepancy({
            payload,
            policyId,
          })
        );
        break;

      case "EXCEPTION":
        dispatch(
          fetchMemberServiceForExceptions({
            ...payload,
            policyId,
          })
        );
        break;
      case "RECONCILIATION":
        dispatch(
          fetchMemberServiceErrorlogAndRecancation({
            payload: errorpayload,
            policyId,
          })
        );
        break;
      case "ERROR_LOG":
        dispatch(
          fetchMemberServiceErrorlogAndRecancation({
            payload: repayload,
            policyId,
          })
        );
        break;

      case "ENROLLED":
      default:
        dispatch(
          fetchMemberService({
            ...payload,
            policyId,
          })
        );
        break;
    }
  };
  const [progress, setProgress] = useState(0);
  type ProgressStatus = "PROCESSING" | "COMPLETED" | "FAILED";

  const [status, setStatus] = useState<ProgressStatus>("PROCESSING");
  const [remainingTime, setRemainingTime] = useState(0);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (status === "COMPLETED" || status === "FAILED") {
      fetchData();
      dispatch(
        fetchMemberDataStatistics({
          policyId,
        })
      );
    }
  }, [page, pageSize, activeTab, status]);

  const inwardNo = memberData?.length
    ? memberData[0].inwardNo
    : undefined;

  const handleDownloadExcel = async () => {
    setLoading2(true);

    try {
      const downloadParams =
        activeTab === "ENROLLED"
          ? {
            url: "/v1/members/download-excel",
            params: { policyId },
            fileName: "Member_Enrolled_Report.xlsx",
          }
          : {
            url: "/v1/files/presigned-url",
            params: { inwardNo, s3BucketName: "enrollment", s3SubBucketName: "Error-files", documentType: "Member Error File" },
            fileName: "Member_Failed_Report.xlsx",
          };

      await downloadFile({
        client: activeTab === "ENROLLED" ? memberService : documentApi2,
        ...downloadParams,
      });
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setLoading2(false);
    }
  };

  const getDocuments = async () => {
    const URL = `/v1/files/presigned-url?inwardNo=${inwardNo}&s3BucketName=enrollment&s3SubBucketName=Error-files&documentType=Member Error File`;

    try {
      const response = await fetchMemberDocApi(URL);
      const documents = response?.data || [];

      if (documents.length === 0) {
        console.warn("No documents found.");
        return;
      }

      documents.forEach((doc: any) => {
        if (doc.downloadUrl) {
          window.open(doc.downloadUrl, "_blank");
        }
      });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const handleSearch = async (data: Record<string, any>) => {
    setLoading(true);
    const payloadFail = {
      insuredMemberUniqueHealthIdentificationNumber: data?.insuredMemberUniqueHealthIdentificationNumber,
      corporateEmployeeCode: data?.corporateEmployeeCode,
      insuredMemberName: data?.insuredMemberName,
    };
    const payloadEnroll = {
      insuredMemberName: data?.insuredMemberName,
      ...(data?.healthCardNumber ? {
        healthCardNumber: data.healthCardNumber.replace(/-/g, ""),
      }
        : {}),
    };

    const finalPayload = activeTab === "FAILED" ? payloadFail : payloadEnroll;

    setFilters(finalPayload);
    setPage(1);
    fetchData(finalPayload);
    setLoading(false);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleTabChange = (tab: "ENROLLED" | "FAILED" | "EXCEPTION" | "DISCREPANCY" | "RECONCILIATION" | "ERROR_LOG") => {
    setActiveTab(tab);
    searchParams.delete("isMemberLoading");
    setSearchParams(searchParams);
    setPage(1);
  };

  const columns = [
    {
      field: "insuredMemberUniqueHealthIdentificationNumber",
      headerName: t("memberData.columns.memberId"),
      width: 138,
    },
    {
      field: "corporateEmployeeCode",
      headerName: t("memberData.columns.employeeId"),
      width: 100,
    },
    {
      field: "insuredMemberName",
      headerName: t("memberData.columns.nameOfInsured"),
      width: 140,
      cellRenderer: (params: any) => (
        <span style={{ whiteSpace: "pre" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "insuredMemberDateOfBirth",
      headerName: t("memberData.columns.dateOfBirth"),
      width: 100,
      valueFormatter: (params: any) => {
        if (!params.value) return "";
        return format(new Date(params.value), "dd MMM yyyy");
      },
    },
    {
      field: "insuredMemberAge",
      headerName: t("memberData.columns.age"),
      width: 60,
    },
    {
      field: "insuredMemberGender",
      headerName: t("memberData.columns.gender"),
      width: 90,
    },
    {
      field: "insuredMemberRelationshipWithSubscriber",
      headerName: t("memberData.columns.relationship"),
      width: 100,
    },
    {
      field: "enrollmentStatus",
      headerName: t("memberData.columns.enrolmentStatus"),
      width: 140,
    },
    {
      field: "enrollmentStatusReason",
      headerName: t("memberData.columns.enrolmentStatusReason"),
      width: 420,
      renderCell: (params: any) => {
        const value =
          params?.row?.enrollmentStatusReason || "";

        const cleaned = stripBracketedPrefixes(value);

        return <span>{cleaned}</span>;
      },
    },
  ];


  const columns2 = [
    {
      field: "actions",
      headerName: t("memberData.columns.action"),
      width: 160,
      pinned: "left",
      sortable: false,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const payload = {
                healthCardNumber: params?.data?.healthCardNumber,
                corporateId: params?.data?.corporateId,
              };
              const mainPayload = {
                url: "/v1/ecards/pdf",
                params: payload,
                fileName: `${params?.data?.insuredMemberName}_${params?.data?.healthCardNumber}.pdf`,
                client: eCardService,
              };

              try {
                await downloadFile2({
                  ...mainPayload,
                });
              } catch (err) {
                console.error("Download failed", err);
              } finally {
                setLoading2(false);
              }
            }}
            className="cursor-pointer flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100">
            {t("memberData.buttons.viewECard")}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
              setData(params?.data);
            }}
            className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
            title="View">
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },

    {
      field: "uhid",
      headerName: t("memberData.columns.memberId"),
      width: 138,
    },

    {
      field: "corporateEmployeeCode",
      headerName: t("memberData.columns.employeeId"),
      width: 100,
    },

    {
      field: "healthCardNumber",
      headerName: t("memberData.columns.healthCardNumber"),
      width: 137,
      cellRenderer: (params: any) => {
        const formatCardNumber = (value: string) => {
          if (!value) return "";
          return value.match(/.{1,4}/g)?.join("-") || value;
        };

        return (
          <span title="Click to copy">
            {formatCardNumber(params.value)}
          </span>
        );
      },
    },

    {
      field: "insuredMemberName",
      headerName: t("memberData.columns.nameOfInsured"),
      width: 140,
      cellRenderer: (params: any) => (
        <span style={{ whiteSpace: "pre" }}>
          {params.value}
        </span>
      ),
    },

    {
      field: "insuredMemberDateOfBirth",
      headerName: t("memberData.columns.dateOfBirth"),
      width: 100,
      valueFormatter: (params: any) => {
        if (!params.value) return "";
        return format(
          new Date(params.value),
          "dd MMM yyyy"
        );
      },
    },

    {
      field: "insuredMemberAge",
      headerName: t("memberData.columns.age"),
      width: 60,
    },
    {
      field: "insuredMemberGender",
      headerName: t("memberData.columns.gender"),
      width: 70,
    },

    {
      field: "insuredMemberRelationshipWithSubscriber",
      headerName: t("memberData.columns.relationship"),
      width: 96,
    },
    {
      field: "policySumInsured",
      headerName: t("memberData.columns.sumInsured"),
      width: 96,
      valueFormatter: (params: any) => {
        return params.value ?? 0;
      },
    },
    {
      field: "recordStatus",
      headerName: t("memberData.columns.recordStatus"),
      width: 110,
    },
    {
      field: "exceptionCategory",
      headerName: "Exception Category",
      width: 138,
    },
  ];
  const columns3 = [
    {
      field: "actions",
      headerName: t("memberData.columns.action"),
      width: 100,
      pinned: "left",
      sortable: false,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
              setData(params?.data);
            }}
            className="flex items-center gap-1 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
            title="View"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },

    {
      field: "insuredMemberName",
      headerName: "Member Name",
      width: 220,
      cellRenderer: (params: any) => (
        <span style={{ whiteSpace: "pre" }} title={params.value}>
          {params.value || ""}
        </span>
      ),
    },

    {
      field: "insuredMemberDateOfBirth",
      headerName: "Date of Birth",
      width: 130,
      valueFormatter: (params: any) => {
        if (!params.value) return "";

        try {
          return format(new Date(params.value), "dd MMM yyyy");
        } catch {
          return params.value;
        }
      },
    },

    {
      field: "insuredMemberAge",
      headerName: "Age",
      width: 70,
    },

    {
      field: "insuredMemberGender",
      headerName: "Gender",
      width: 90,
      valueFormatter: (params: any) => params.value || "",
    },

    {
      field: "corporateEmployeeCode",
      headerName: "Employee ID",
      width: 110,
    },

    {
      field: "insuredMemberEmailId",
      headerName: "Email",
      width: 230,
      cellRenderer: (params: any) => (
        <span title={params.value}>
          {params.value || ""}
        </span>
      ),
    },

    {
      field: "corporateEmployeeDateOfJoining",
      headerName: "Date of Joining",
      width: 140,
      valueFormatter: (params: any) => {
        if (!params.value) return "";

        try {
          return format(new Date(params.value), "dd MMM yyyy");
        } catch {
          return params.value;
        }
      },
    },

    {
      field: "comment",
      headerName: "Comment",
      width: 500,
    },

    {
      field: "exceptionCategory",
      headerName: "Exception Category",
      width: 150,
    },
  ];
  const columns5 = [


    {
      field: "employeeCode",
      headerName: "Employee Code",
      width: 120,
    },
    {
      field: "healthCardNumber",
      headerName: "Health Card Number",
      width: 150,
      cellRenderer: (params: any) => {
        const formatCardNumber = (value: string) => {
          if (!value) return "";

          return value.match(/.{1,4}/g)?.join("-") || value;
        };

        return (
          <span title="Click to copy">
            {formatCardNumber(params.value)}
          </span>
        );
      },
    },

    {
      field: "name",
      headerName: "Name",
      width: 180,
      cellRenderer: (params: any) => (
        <span style={{ whiteSpace: "pre" }}>
          {params.value}
        </span>
      ),
    },

    {
      field: "relationship",
      headerName: "Relationship",
      width: 110,
    },

    {
      field: "gender",
      headerName: "Gender",
      width: 90,
    },

    {
      field: "dateOfBirth",
      headerName: "Date of Birth",
      width: 120,
      valueFormatter: (params: any) => {
        if (!params.value) return "";

        return format(
          new Date(params.value),
          "dd MMM yyyy"
        );
      },
    },
    {
      field: "age",
      headerName: "Age",
      width: 70,
    },
    {
      field: "policyRecordType",
      headerName: "Policy Record Type",
      width: 140,
    },

    {
      field: "reconciliationStatus",
      headerName: "Reconciliation Status",
      width: 170,
    },

    {
      field: "reconciliationRemark",
      headerName: "Reconciliation Remark",
      width: 400,
      cellRenderer: (params: any) => (
        <span
          title={params.value}
          className="block max-w-full truncate"
        >
          {params.value || "-"}
        </span>
      ),
    },






  ];

  const stats = [
    {
      label: t("memberData.stats.totalMembers"),
      value: memberDataStatistics?.totalMemberCount,
      color: "bg-blue-500",
    },
    {
      label: t("memberData.stats.self"),
      value: memberDataStatistics?.totalSelfCount,
      color: "bg-green-500",
    },
    {
      label: t("memberData.stats.dependents"),
      value: memberDataStatistics?.totalDependentCount,
      color: "bg-yellow-500",
    },
    {
      label: t("memberData.stats.enrolled"),
      value: memberDataStatistics?.totalEnrolledCount,
      color: "bg-purple-500",
    },
    {
      label: t("memberData.stats.failed"),
      value: memberDataStatistics?.totalFailedCount,
      color: "bg-red-500",
    },
  ];

  const fetchStatus = async () => {
    const result = await fetchUser(
      memberData2,
      `/v1/enrollment/progress?&inwardNo=${inwardNumber}&policyId=${policyId}`
    );

    if (result?.success && result?.data) {
      const data = result.data.data;

      setStatus(data.status);
      setProgress(data.percentage);
      setRemainingTime(data.remainingTimeInSeconds);

      if (data.status === "PROCESSING") {
        setShowModal(true);
      } else if (data.status === "COMPLETED" || data.status === "FAILED") {
        // Keep popup visible for 3 seconds
        setShowModal(true);

        setTimeout(() => {
          setShowModal(false);
        }, 2000);
      }

      return data.status;
    }

    return null;
  };

  useEffect(() => {
    let interval: any;


    const startPolling = async () => {
      const status = await fetchStatus();

      if (status === "PROCESSING") {
        interval = setInterval(async () => {
          const currentStatus = await fetchStatus();

          if (
            currentStatus === "COMPLETED" ||
            currentStatus === "FAILED"
          ) {
            clearInterval(interval);
          }
        }, 1000);
      }
    };
    startPolling();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const hideSearchTabs = [
    "EXCEPTION",
    "RECONCILIATION",
    "ERROR_LOG",
  ].includes(activeTab);

  return (
    <>
      <Page title={t("memberData.title")}>
        <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
          <CompactPageHeader
            title={t("memberData.title")}
            totalRecords={totalRecords}
            recordLabel="Members"
            statusBadge="Verification Mode"
            onRefresh={() => fetchData({}, activeTab)}
          >
            {!hideSearchTabs && (
              <CheckListButton
                onClick={toggleSearch}
                label={
                  isSearchOpen
                    ? t("branch.hideSearch")
                    : t("branch.search")
                }
                bgColor="bg-blue-600"
                textColor="text-white"
                size="text-xs"
                className="flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-0!"
                isSearch
              />
            )}
            {isSuperAdmin && (
              <DropdownButton
                buttonLabel={t("memberData.buttons.downloadReport")}
                items={[
                  {
                    label: t("memberData.buttons.downloadAsExcel"),
                    icon: (
                      <DocumentChartBarIcon className="w-4 h-4 text-green-600" />
                    ),
                    onClick:
                      activeTab === "FAILED"
                        ? getDocuments
                        : handleDownloadExcel,
                  },
                ]}
              />
            )}
          </CompactPageHeader>

          <MemberStats stats={stats} />

          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
            <div className="flex shrink-0 items-center justify-between pb-1">
              <div className="flex items-center">
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() =>
                      handleTabChange("ENROLLED")
                    }
                    className={`cursor-pointer px-2.5 py-1 text-xs rounded-md transition ${activeTab === "ENROLLED"
                      ? "bg-white shadow-2xs text-blue-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    {t("memberData.buttons.enrolledRecord")}
                  </button>

                  <button
                    onClick={() => handleTabChange("DISCREPANCY")}
                    className={`cursor-pointer px-2.5 py-1 text-xs rounded-md transition ${activeTab === "DISCREPANCY"
                      ? "bg-white shadow-2xs text-red-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    DISCREPANCY
                  </button>
                  <button
                    onClick={() => handleTabChange("EXCEPTION")}
                    className={`cursor-pointer px-2.5 py-1 text-xs rounded-md transition ${activeTab === "EXCEPTION"
                      ? "bg-white shadow-2xs text-red-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    EXCEPTION
                  </button>
                  {dummyPolicyNumber && (
                    <button
                      onClick={() => handleTabChange("RECONCILIATION")}
                      className={`cursor-pointer px-2.5 py-1 text-xs rounded-md transition ${activeTab === "RECONCILIATION"
                        ? "bg-white shadow-2xs text-red-600 font-bold"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      RECONCILIATION
                    </button>
                  )}
                  {dummyPolicyNumber && (
                    <button
                      onClick={() => handleTabChange("ERROR_LOG")}
                      className={`cursor-pointer px-2.5 py-1 text-xs rounded-md transition ${activeTab === "ERROR_LOG"
                        ? "bg-white shadow-2xs text-red-600 font-bold"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      CLARIFICATION 
                    </button>
                  )}
                </div>
                {!tab && (
                  <ProgressModal
                    open={showModal}
                    progress={progress}
                    status={status}
                    remainingTime={remainingTime}
                  />
                )}
              </div>
            </div>
            {!hideSearchTabs && (
              <CommonSearch
                fields={dynamicFields}
                onSearch={handleSearch}
                isSubmitting={loading}
                isState
                showToggleButton={false}
                isOpen={isSearchOpen}
                onToggle={toggleSearch}
              />
            )}


            <div className="flex min-h-0 flex-1 flex-col">
              {activeTab === "EXCEPTION" ? (
                <ExceptionSummary data={memberDataForException} policyId={policyId}
                  inwardNo={inwardNumber} dummyPolicyNumber={dummyPolicyNumber} />
              ) : (
                <AgGridSuperWrapper
                  rowData={
                    activeTab === "DISCREPANCY"
                      ? memberDataForDiscrepancy
                      : activeTab === "RECONCILIATION" || activeTab === "ERROR_LOG"
                        ? errorLogAndRecanlaiton
                        : memberData
                  }
                  columnDefs={
                    activeTab === "ENROLLED"
                      ? columns2
                      : activeTab === "DISCREPANCY"
                        ? columns3
                        : activeTab === "RECONCILIATION" || activeTab === "ERROR_LOG"
                          ? columns5
                          : columns
                  }
                  onRowClick={() => { }}
                  pageSize={pageSize}
                  height="100%"
                  pagination={false}
                />

              )}
            </div>
            {activeTab !== "EXCEPTION" && (
              <Pagination
                className="shrink-0"
                page={page}
                pageSize={pageSize}
                totalItems={
                  activeTab === "DISCREPANCY"
                    ? totalRecordsForDiscrepancy
                    : activeTab === "RECONCILIATION" || activeTab === "ERROR_LOG"
                      ? totalRecordsForErrorLogAndRecanlation
                      : totalRecordsOfMemberData
                }
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[20, 30, 50, 100]}
              />
            )}
          </div>

          {loading2 && <ExportLoader />}
        </div>
      </Page>

      {open && (
        <CreateCorporateInwardModal
          open={open}
          onClose={() => setOpen(false)}
          isMemberView
          isData={data?.memberEnrollmentId}
        />
      )}
    </>
  );
}


