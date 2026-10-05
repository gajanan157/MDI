import {
  mainApi,
  patchApi,
  postApi,
} from "@/app/api/apiService";
import {
  MakerCheckerResponse,
  MakerChecker,
  ApplyChangesResponse,
  ApprovalResponse,
  ApprovalActionType,
  SendChatMessageParams,
  ChatMessageResponse,
} from "./makerCheckerTypes";
import type { ApiResponse } from "@/app/api/apiService";
import { showErrorMessage } from "@/utils/errorHandler";

function showMakerCheckerApiError(
  res: { status?: number; error?: string | null; message?: string | null },
  fallbackMessage: string,
): void {
  showErrorMessage({
    status: res.status,
    message: res.message,
    error: res.error || fallbackMessage,
  });
}

function showNoDataError(): void {
  showErrorMessage({ error: "No data returned from server" });
}

const dummyMakerCheckerData: MakerChecker[] = [
  {
    id: "1",
    requestId: "REQ-001",
    requestType: "Policy",
    corporateName: "CARYSIL LIMITED, SECOND GROUP",
    policyNumber: "POL-2024-001",
    policyNo: "POL-2024-001",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "National Insurance Co. Ltd",
    productName: "National Group Mediclaim",
    policyName: "Corporate Shield A",
    priority: "High",
    status: "Pending At Maker",
    createdDate: "2024-01-15",
    createdBy: "John Doe",
  },
  {
    id: "2",
    requestId: "REQ-002",
    requestType: "Claim",
    corporateName: "MERIL LIFE SCIENCES PVT LTD",
    policyNumber: "POL-2024-002",
    policyNo: "POL-2024-002",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "New India Assurance Co. Ltd",
    productName: "New India Flexi Group Mediclaim policy",
    policyName: "Employee Care B",
    priority: "Medium",
    status: "Approved By Maker 1",
    createdDate: "2024-01-16",
    createdBy: "Jane Smith",
  },
  {
    id: "3",
    requestId: "REQ-003",
    requestType: "Benefit",
    corporateName: "KC City Centre Private Limited",
    policyNumber: "POL-2024-003",
    policyNo: "POL-2024-003",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "Oriental Insurance Co. Ltd",
    productName: "Group mediclaim insurance policy",
    policyName: "Corporate Health C",
    priority: "Low",
    status: "Pending At Checker",
    createdDate: "2024-01-17",
    createdBy: "Bob Johnson",
  },
  {
    id: "4",
    requestId: "REQ-004",
    requestType: "Configuration",
    corporateName: "Jio Blackrock Investment Advisors Private Limited",
    policyNumber: "POL-2024-004",
    policyNo: "POL-2024-004",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "United India Insurance Co. Ltd",
    productName: "Group Health policy",
    policyName: "Plan D",
    priority: "High",
    status: "Rejected",
    createdDate: "2024-01-18",
    createdBy: "Alice Brown",
  },
  {
    id: "5",
    requestId: "REQ-005",
    requestType: "Policy",
    corporateName: "CARYSIL LIMITED, SECOND GROUP",
    policyNumber: "POL-2024-005",
    policyNo: "POL-2024-005",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "National Insurance Co. Ltd",
    productName: "National Group Mediclaim",
    policyName: "Corporate Prime E",
    priority: "Medium",
    status: "Approved By Checker",
    createdDate: "2024-01-19",
    createdBy: "Charlie Wilson",
  },
  {
    id: "6",
    requestId: "REQ-006",
    requestType: "Claim",
    corporateName: "MERIL LIFE SCIENCES PVT LTD",
    policyNumber: "POL-2024-006",
    policyNo: "POL-2024-006",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "New India Assurance Co. Ltd",
    productName: "New India Flexi Group Mediclaim policy",
    policyName: "Corporate Shield A",
    priority: "Low",
    status: "Approved By Maker 2",
    createdDate: "2024-01-20",
    createdBy: "Diana Prince",
  },
  {
    id: "7",
    requestId: "REQ-007",
    requestType: "Benefit",
    corporateName: "KC City Centre Private Limited",
    policyNumber: "POL-2024-007",
    policyNo: "POL-2024-007",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "Oriental Insurance Co. Ltd",
    productName: "Group mediclaim insurance policy",
    policyName: "Employee Care B",
    priority: "High",
    status: "Pending At Checker",
    createdDate: "2024-01-21",
    createdBy: "Edward Norton",
  },
  {
    id: "8",
    requestId: "REQ-008",
    requestType: "Configuration",
    corporateName: "Jio Blackrock Investment Advisors Private Limited",
    policyNumber: "POL-2024-008",
    policyNo: "POL-2024-008",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "United India Insurance Co. Ltd",
    productName: "Group Health policy",
    policyName: "Corporate Health C",
    priority: "Medium",
    status: "Approved By Checker",
    createdDate: "2024-01-22",
    createdBy: "Fiona Apple",
  },
  {
    id: "9",
    requestId: "REQ-009",
    requestType: "Policy",
    corporateName: "CARYSIL LIMITED, SECOND GROUP A",
    policyNumber: "POL-2024-009",
    policyNo: "POL-2024-009",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "National Insurance Co. Ltd",
    productName: "National Group Mediclaim",
    policyName: "Plan D",
    priority: "Low",
    status: "Rejected",
    createdDate: "2024-01-23",
    createdBy: "George Martin",
  },
  {
    id: "10",
    requestId: "REQ-010",
    requestType: "Claim",
    corporateName: "MERIL LIFE SCIENCES PVT LTD",
    policyNumber: "POL-2024-010",
    policyNo: "POL-2024-010",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "New India Assurance Co. Ltd",
    productName: "New India Flexi Group Mediclaim policy",
    policyName: "Corporate Prime E",
    priority: "High",
    status: "Pending At Maker",
    createdDate: "2024-01-24",
    createdBy: "Helen Keller",
  },
  {
    id: "11",
    requestId: "REQ-011",
    requestType: "Benefit",
    corporateName: "KC City Centre Private Limited",
    policyNumber: "POL-2024-011",
    policyNo: "POL-2024-011",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "HDFC Life",
    productName: "Group mediclaim insurance policy",
    policyName: "Oriental Insurance Co. Ltd",
    priority: "Medium",
    status: "Approved By Maker 1",
    createdDate: "2024-01-25",
    createdBy: "Ian Fleming",
  },
  {
    id: "12",
    requestId: "REQ-012",
    requestType: "Configuration",
    corporateName: "Jio Blackrock Investment Advisors Private Limited",
    policyNumber: "POL-2024-012",
    policyNo: "POL-2024-012",
    uinNo: "NIAHLGP21236V022021",
    insurerName: "United India Insurance Co. Ltd",
    productName: "Group Health policy",
    policyName: "Employee Care B",
    priority: "Low",
    status: "Approved By Checker",
    createdDate: "2024-01-26",
    createdBy: "Julia Roberts",
  },
];


export const fetchMakerCheckersAPI = async (
  page?: number,
  size?: number,
  queryObj?: Record<string, any>,
): Promise<MakerCheckerResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredData = [...dummyMakerCheckerData];

  // Apply search filters
  if (queryObj && Object.keys(queryObj).length > 0) {
    filteredData = filteredData.filter((item) => {
      if (queryObj.corporateName && !item.corporateName?.toLowerCase().includes(queryObj.corporateName.toLowerCase())) {
        return false;
      }
      if (queryObj.policyNumber && !item.policyNumber?.toLowerCase().includes(queryObj.policyNumber.toLowerCase())) {
        return false;
      }
      if (queryObj.status) {
        const statusValue = Array.isArray(queryObj.status) ? queryObj.status[0] : queryObj.status;
        if (item.status?.toLowerCase() !== statusValue?.toLowerCase()) {
          return false;
        }
      }
      if (queryObj.insurerId) {
        // Simple filter - in real API this would filter by insurer ID
        return true;
      }
      return true;
    });
  }

  const totalRecords = filteredData.length;
  const pageSize = size || 10;
  const currentPage = page || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    statusCode: 200,
    status: "success",
    message: "Data fetched successfully",
    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage,
      recordPerPage: pageSize,
    },
    data: paginatedData,
  };


};


export const fetchMakerCheckerByIdAPI = async (
  id: string,
): Promise<MakerChecker> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Find the item in dummy data
  const foundItem = dummyMakerCheckerData.find((item) => item.id === id);

  if (!foundItem) {
    throw new Error(`Maker checker request with id ${id} not found`);
  }

  // Import sampleData dynamically to avoid circular dependencies
  const { sampleData } = await import("@/app/pages/dashboards/mbmmanagement/dashboard/sampleData");

  // Return the item with sampleData included
  return {
    ...foundItem,
    data: sampleData,
  };

};

/**
 * Apply changes to Maker Checker (PATCH)
 * 
 * @param id - The maker checker request ID
 * @param requestId - The request ID
 * @param data - The updated form data
 * @param comments - Optional comments metadata (field-level comments)
 * @param files - Optional files to upload
 */
export const applyChangesMakerCheckerAPI = async (
  id: string,
  requestId: string,
  data: Record<string, any>,
  files?: File[],
): Promise<ApplyChangesResponse> => {
  const url = `mbm/v1/maker-checker/${id}/save`;

  // If files are present, use FormData for multipart/form-data
  if (files && files.length > 0) {
    const formData = new FormData();
    
    // Add JSON data as string (comments are already inside data object)
    formData.append("requestId", requestId);
    formData.append("data", JSON.stringify(data));
    
    // Add files
    files.forEach((file) => {
      formData.append(`files`, file);
    });

    const res = await patchApi<ApplyChangesResponse, FormData>(
      mainApi,
      url,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!res.success) {
      showMakerCheckerApiError(res, "Failed to apply changes");
      throw new Error(res.error || "Failed to apply changes");
    }

    if (!res.data) {
      showNoDataError();
      throw new Error("No data returned from server");
    }

    return res.data;
  }

  // No files - use regular JSON payload (comments are already inside data object)
  const payload: {
    requestId: string;
    data: Record<string, any>;
  } = {
    requestId,
    data,
  };

  const res = await patchApi<ApplyChangesResponse, typeof payload>(
    mainApi,
    url,
    payload,
  );

  if (!res.success) {
    showMakerCheckerApiError(res, "Failed to apply changes");
    throw new Error(res.error || "Failed to apply changes");
  }

  if (!res.data) {
    showNoDataError();
    throw new Error("No data returned from server");
  }

  return res.data;
};

const APPROVAL_ACTION_LABELS: Record<ApprovalActionType, string> = {
  reversetomaker1: "reverse to maker",
  approvebymaker1: "approve by maker 1",
  approvebymaker2: "approve by maker 2",
  approvebychecker: "approve by checker",
};

function assertApprovalApiData(
  res: ApiResponse<ApprovalResponse>,
  action: ApprovalActionType,
): ApprovalResponse {
  const failureTitle = `Failed to ${APPROVAL_ACTION_LABELS[action]} maker checker request`;

  if (!res.success) {
    showMakerCheckerApiError(res, failureTitle);
    throw new Error(res.error || failureTitle);
  }

  if (!res.data) {
    showNoDataError();
    throw new Error("No data returned from server");
  }

  return res.data;
}

export const approvalActionMakerCheckerAPI = async (
  requestId: string,
  action: ApprovalActionType,
  role?: string,
  userId?: string,
  userName?: string,
): Promise<ApprovalResponse> => {
  const url = `mbm/v1/maker-checker/approve`;

  const payload = {
    requestId,
    action,
    ...(role ? { role } : {}),
    ...(userId ? { userId } : {}),
    ...(userName ? { userName } : {}),
  };

  const res = await postApi<ApprovalResponse, typeof payload>(
    mainApi,
    url,
    payload,
  );

  return assertApprovalApiData(res, action);
};

/**
 * Send chat message for Maker Checker (POST)
 */
export const sendChatMessageAPI = async (
  params: SendChatMessageParams,
): Promise<ChatMessageResponse> => {
  const url = `mbm/v1/maker-checker/${params.requestId}/chat`;

  const payload: { message: string; userId?: string; userName?: string } = {
    message: params.message,
  };

  if (params.userId) {
    payload.userId = params.userId;
  }

  if (params.userName) {
    payload.userName = params.userName;
  }

  const res = await postApi<ChatMessageResponse, typeof payload>(
    mainApi,
    url,
    payload,
  );

  if (!res.success) {
    showMakerCheckerApiError(res, "Failed to send chat message");
    throw new Error(res.error || "Failed to send chat message");
  }

  if (!res.data) {
    showNoDataError();
    throw new Error("No data returned from server");
  }

  return res.data;
};


