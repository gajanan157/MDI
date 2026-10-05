import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { lazy, Suspense } from "react";
import type { JsonAccordionFormRef } from "@/components/shared/JsonAccordionForm";
import TitleSection from "@/components/shared/JsonAccordionForm/TitleSection";
import QuickActionsSection from "@/components/shared/JsonAccordionForm/QuickActionsSection";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { Button, Card } from "@/components/ui";
import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { sampleData } from "../dashboard/sampleData";
import { UserRole, useUserRole } from "@/hooks/useUserRole";
import { getDummyCommentsMetadata, getDummyStatusMetadata } from "./dummyMetadata";

// Lazy load heavy components
const JsonAccordionForm = lazy(() =>
  import("@/components/shared/JsonAccordionForm").then((m) => ({
    default: m.default,
  })),
);
const PdfViewer = lazy(() =>
  import("@/components/shared/PdfViewer").then((m) => ({ default: m.default })),
);
import { putApi, mainApi } from "@/app/api/apiService";
import {
  handleApiResponse,
  showErrorMessage,
  showSuccessMessage,
} from "@/utils/errorHandler";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { handleReverseToMakerAction } from "@/utils/approvalActions";
import {
  approvalActionMakerChecker,
  sendChatMessage as sendChatMessageAction,
} from "@/store/features/makerChecker/makerCheckerSlice";
import type { ApprovalActionType } from "@/store/features/makerChecker/makerCheckerTypes";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";
import { PageContent } from "@/components/shared/PageContent";
import { statusColors } from "./sampleData";
import { reorderObjectByKeys } from "./schema";
import ChatPopup from "@/app/pages/dashboards/insurerManagement/chat/ChatPopup";
import { MessageRow } from "@/app/pages/dashboards/insurerManagement/chat/DataTable";
import {
  getAccordionPathsToOpen,
  searchJsonPaths,
} from "../master-product/searchJsonPaths";
// Import dummy data (same as in index.tsx)
const initialDummyData = [
  {
    id: "1",
    requestId: "REQ-001",
    requestType: "Policy",
    corporateName: "ABC Corporation",
    policyNumber: "POL-2024-001",
    status: "Approved by Maker",
    createdDate: "2024-01-15",
    createdBy: "John Doe",
    data: sampleData,
  },
  {
    id: "2",
    requestId: "REQ-002",
    requestType: "Claim",
    corporateName: "XYZ Industries",
    policyNumber: "POL-2024-002",
    status: "Approved by Maker",
    createdDate: "2024-01-16",
    createdBy: "Jane Smith",
    data: sampleData,
  },
  {
    id: "3",
    requestId: "REQ-003",
    requestType: "Benefit",
    corporateName: "DEF Limited",
    policyNumber: "POL-2024-003",
    status: "Approved by Maker",
    createdDate: "2024-01-17",
    createdBy: "Bob Johnson",
    data: sampleData,
  },
  {
    id: "4",
    requestId: "REQ-004",
    requestType: "Configuration",
    corporateName: "GHI Corp",
    policyNumber: "POL-2024-004",
    status: "Approved by Maker",
    createdDate: "2024-01-18",
    createdBy: "Alice Brown",
    data: sampleData,
  },
  {
    id: "5",
    requestId: "REQ-005",
    requestType: "Policy",
    corporateName: "JKL Enterprises",
    policyNumber: "POL-2024-005",
    status: "Approved by Maker",
    createdDate: "2024-01-19",
    createdBy: "Charlie Wilson",
    data: sampleData,
  },
  {
    id: "6",
    requestId: "REQ-006",
    requestType: "Claim",
    corporateName: "MNO Group",
    policyNumber: "POL-2024-006",
    status: "Approved by Maker",
    createdDate: "2024-01-20",
    createdBy: "Diana Prince",
    data: sampleData,
  },
  {
    id: "7",
    requestId: "REQ-007",
    requestType: "Benefit",
    corporateName: "PQR Solutions",
    policyNumber: "POL-2024-007",
    status: "Approved by Maker",
    createdDate: "2024-01-21",
    createdBy: "Edward Norton",
    data: sampleData,
  },
  {
    id: "8",
    requestId: "REQ-008",
    requestType: "Configuration",
    corporateName: "STU Technologies",
    policyNumber: "POL-2024-008",
    status: "Approved by Maker",
    createdDate: "2024-01-22",
    createdBy: "Fiona Apple",
    data: sampleData,
  },
  {
    id: "9",
    requestId: "REQ-009",
    requestType: "Policy",
    corporateName: "VWX Holdings",
    policyNumber: "POL-2024-009",
    status: "Rejected",
    createdDate: "2024-01-23",
    createdBy: "George Martin",
    data: sampleData,
  },
  {
    id: "10",
    requestId: "REQ-010",
    requestType: "Claim",
    corporateName: "ABC Corporation",
    policyNumber: "POL-2024-010",
    status: "Pending",
    createdDate: "2024-01-24",
    createdBy: "Helen Keller",
    data: sampleData,
  },
  {
    id: "11",
    requestId: "REQ-011",
    requestType: "Benefit",
    corporateName: "YZA Industries",
    policyNumber: "POL-2024-011",
    status: "Approved by Maker",
    createdDate: "2024-01-25",
    createdBy: "Ian Fleming",
    data: sampleData,
  },
  {
    id: "12",
    requestId: "REQ-012",
    requestType: "Configuration",
    corporateName: "BCD Limited",
    policyNumber: "POL-2024-012",
    status: "Approved by Checker",
    createdDate: "2024-01-26",
    createdBy: "Julia Roberts",
    data: sampleData,
  },
  {
    id: "13",
    requestId: "REQ-013",
    requestType: "Policy",
    corporateName: "EFG Corporation",
    policyNumber: "POL-2024-013",
    status: "Pending",
    createdDate: "2024-01-27",
    createdBy: "Kevin Spacey",
    data: sampleData,
  },
  {
    id: "14",
    requestId: "REQ-014",
    requestType: "Claim",
    corporateName: "HIJ Limited",
    policyNumber: "POL-2024-014",
    status: "Approved by Maker",
    createdDate: "2024-01-28",
    createdBy: "Laura Linney",
    data: sampleData,
  },
  {
    id: "15",
    requestId: "REQ-015",
    requestType: "Benefit",
    corporateName: "KLM Industries",
    policyNumber: "POL-2024-015",
    status: "Under Review",
    createdDate: "2024-01-29",
    createdBy: "Michael Caine",
    data: sampleData,
  },
];

// Helper function to encode PDF URLs (handle spaces in file names)
const encodePdfUrl = (path: string) => {
  return path
    .split("/")
    .map((segment) =>
      segment.includes(" ") ? encodeURIComponent(segment) : segment,
    )
    .join("/");
};

type Definition = {
  term: string;
  definition: string;
  is_standard?: boolean;
};

type Data = {
  definitions?: Definition[];
  [key: string]: any;
};

function removeIsStandard(data: Data) {
  const definitions = data?.definitions;
  return {
    ...data,

    definitions: Array.isArray(definitions)
      ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
        definitions.map(({ is_standard, ...rest }) => rest)
      : [],
  };
}

// Helper function to remove sources from data
function removeSources<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(removeSources) as T;
  }

  if (input !== null && typeof input === "object") {
    const result: any = {};

    for (const [key, value] of Object.entries(input)) {
      if (key === "sources") continue; // REMOVE sources
      result[key] = removeSources(value);
    }

    return result;
  }

  return input;
}

function normalizeDataPathFormat(path: string): string {
  return path.replace(/\[(\d+)\]/g, ".$1");
}

function queryAllDataPathElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-path]"));
}

function isDirectChildDataPath(elemPath: string, searchPath: string): boolean {
  return (
    elemPath.startsWith(searchPath + ".") ||
    elemPath.startsWith(searchPath + "[") ||
    elemPath === searchPath
  );
}

function isPrefixChildDataPath(elemPath: string, searchPath: string): boolean {
  return (
    elemPath.startsWith(searchPath + ".") || elemPath.startsWith(searchPath + "[")
  );
}

function findDirectChildDataPathElement(
  path: string,
  elements: HTMLElement[],
): HTMLElement | undefined {
  return elements.find((elem) => {
    const elemPath = elem.dataset.path;
    return elemPath && isDirectChildDataPath(elemPath, path);
  });
}

function findPrefixChildDataPathElement(
  path: string,
  elements: HTMLElement[],
): HTMLElement | undefined {
  return elements.find((elem) => {
    const elemPath = elem.dataset.path;
    return elemPath && isPrefixChildDataPath(elemPath, path);
  });
}

function findBestParentDataPathElement(
  path: string,
  elements: HTMLElement[],
): HTMLElement | undefined {
  const normalizedSearchPath = normalizeDataPathFormat(path);
  let bestMatch: { element: HTMLElement; length: number } | null = null;

  for (const elem of elements) {
    const elemPath = elem.dataset.path;
    if (!elemPath) continue;

    const normalizedElemPath = normalizeDataPathFormat(elemPath);
    const isParent =
      normalizedSearchPath.startsWith(normalizedElemPath + ".") ||
      normalizedSearchPath.startsWith(normalizedElemPath + "[");

    if (isParent && (!bestMatch || normalizedElemPath.length > bestMatch.length)) {
      bestMatch = { element: elem, length: normalizedElemPath.length };
    }
  }

  return bestMatch?.element;
}

function resolveDataPathElement(path: string): Element | null {
  const exact = document.querySelector(`[data-path="${path}"]`);
  if (exact) return exact;

  const allElements = queryAllDataPathElements();
  return (
    findDirectChildDataPathElement(path, allElements) ??
    findBestParentDataPathElement(path, allElements) ??
    null
  );
}

function waitForDataPathElement(selector: string, timeout = 2000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const start = performance.now();

    const check = () => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
      } else if (performance.now() - start > timeout) {
        reject(new Error("Timeout"));
      } else {
        requestAnimationFrame(check);
      }
    };

    check();
  });
}

function scrollElementIntoContainer(
  el: Element,
  scrollContainer: HTMLElement | null,
): void {
  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect();
    const elementRect = el.getBoundingClientRect();
    const elementTop =
      elementRect.top - containerRect.top + scrollContainer.scrollTop;
    const scrollPosition =
      elementTop - containerRect.height / 2 + elementRect.height / 2;
    scrollContainer.scrollTo({ top: scrollPosition, behavior: "smooth" });
    return;
  }

  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function highlightSearchMatch(el: Element): void {
  el.classList.add("search-active");
  setTimeout(() => el.classList.remove("search-active"), 1200);
}

const SCROLL_SETTLE_MS = 300;
const FALLBACK_SCROLL_DELAY_MS = 1000;

async function scrollToDataPathMatch(
  path: string,
  scrollContainer: HTMLElement | null,
): Promise<void> {
  let el = resolveDataPathElement(path);

  if (!el) {
    el = await waitForDataPathElement(`[data-path="${path}"]`, 5000);
  }

  await new Promise((resolve) => setTimeout(resolve, SCROLL_SETTLE_MS));

  if (!el) return;

  scrollElementIntoContainer(el, scrollContainer);
  highlightSearchMatch(el);
}

function fallbackScrollToDataPathMatch(
  path: string,
  scrollContainer: HTMLElement | null,
): void {
  let el = document.querySelector(`[data-path="${path}"]`);
  if (!el) {
    const allElements = queryAllDataPathElements();
    const matchingElement = findPrefixChildDataPathElement(path, allElements);
    if (matchingElement) el = matchingElement;
  }

  if (el) scrollElementIntoContainer(el, scrollContainer);
}

export default function MakerCheckerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const keycloakUser = useKeycloakUser(); // Get user info from Keycloak token
  const currentUserRole = useUserRole(); // Get current role from Keycloak (read-only)
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    currentUserRole || "maker1",
  );
  useEffect(() => {
    if (currentUserRole) {
      setSelectedRole(currentUserRole);
    }
  }, [currentUserRole]);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false); // Open PDF viewer by default for better UX
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [pdfPageNumber, setPdfPageNumber] = useState<number | undefined>(
    undefined,
  );
  const [dummyData, setDummyData] = useState(initialDummyData);
  const isLoading = false;
  const formRef = useRef<JsonAccordionFormRef>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [appliedSearchText, setAppliedSearchText] = useState<string>("");
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set());
  const [matchedPaths, setMatchedPaths] = useState<string[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [activeMatchPath, setActiveMatchPath] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat state
  const [openChatModal, setOpenChatModal] = useState<boolean>(false);
  const [chatMap, setChatMap] = useState<Record<string, MessageRow[]>>({});

  // PDF documents for Good Health Group Mediclaim Policy
  const availablePdfs = useMemo(
    () => [
      {
        id: "main-policy",
        name: "Good Health Group Mediclaim -NIAHLGP21236V022021",
        url: encodePdfUrl(
          "/pdf/Good Health Group Mediclaim -NIAHLGP21236V022021.pdf",
        ),
      },
      {
        id: "revision-doc",
        name: "GH REVISION-01-07-2024-FOR TPA",
        url: encodePdfUrl("/pdf/GH REVISION-01-07-2024-FOR TPA.pdf"),
      },
    ],
    [],
  );

  // Set default PDF to main policy document
  const defaultPdfUrl = encodePdfUrl(
    "/pdf/Good Health Group Mediclaim -NIAHLGP21236V022021.pdf",
  );

  // Set default PDF when viewer opens or when PDF is selected
  const pdfUrl = selectedPdfUrl || defaultPdfUrl;

  // Prepare document sections for PDF viewer (before early returns)
  const documentSections = useMemo(
    () => [
      {
        id: "main-policy",
        name: "Good Health Group Mediclaim -NIAHLGP21236V022021",
        category: "other" as const, // Using "other" as DocumentCategory type only supports: "addendum" | "amendment" | "agreement" | "other"
        url: encodePdfUrl(
          "/pdf/Good Health Group Mediclaim -NIAHLGP21236V022021.pdf",
        ),
        showCondition: (): boolean => true,
      },
      {
        id: "revision-doc",
        name: "GH REVISION-01-07-2024-FOR TPA",
        category: "other" as const, // Using "other" as DocumentCategory type only supports: "addendum" | "amendment" | "agreement" | "other"
        url: encodePdfUrl("/pdf/GH REVISION-01-07-2024-FOR TPA.pdf"),
        showCondition: (): boolean => true,
      },
    ],
    [],
  );

  // Initialize selected PDF on mount - set to main policy document by default
  useEffect(() => {
    if (!selectedPdfUrl) {
      setSelectedPdfUrl(defaultPdfUrl);
    }
  }, [defaultPdfUrl, selectedPdfUrl]); // Include dependencies

  // Find the item from dummyData by ID
  const itemData = useMemo(() => {
    if (!id) return null;
    const found = dummyData.find((item: any) => item.id === id);
    if (!found) return null;

    return {
      ...found,
      data: found.data,
    };
  }, [id, dummyData]);

  const updatedResponse = useMemo(() => {
    if (!itemData?.data) return null;
    return removeIsStandard(
      reorderObjectByKeys(itemData.data, {
        order: [
          "definitions",
          "base_covers",
          "exclusions",
          "modern_treatments",
          "maternity_benefits",
          "additional_benefits",
          "ancillary_benefits",
          "co_payment_conditions",
          "claims_process",
          "policy_management",
        ] as any,
        remove: [
          "Contact Details of Insurance Ombudsmen",
          "policy_metadata",
          "document_required",
          "$schema",
        ] as any,
      }),
    );
  }, [itemData?.data]);

  // Load dummy comments metadata (comments are not in policy sampleData shape)
  const commentsMetadata = useMemo(
    () => getDummyCommentsMetadata(itemData?.requestId),
    [itemData?.requestId],
  );

  // Load dummy status metadata (status is not in data object)
  const dummyStatusMetadata = useMemo(
    () => getDummyStatusMetadata(itemData?.requestId),
    [itemData?.requestId],
  );

  // Prepare form data with sources removed for display
  const formDataWithSourcesRemoved = useMemo(
    () => (updatedResponse ? removeSources(updatedResponse) : sampleData),
    [updatedResponse],
  );

  // Actual form data with all metadata
  const actualFormData = useMemo(
    () => updatedResponse || sampleData,
    [updatedResponse],
  );

  // Send chat message handler (defined after itemData) - calls API
  const sendChatMessage = useCallback(
    async (msg: string) => {
      if (msg === "__close__") {
        setOpenChatModal(false);
        return;
      }

      if (!itemData?.requestId) {
        showErrorMessage({
          error: "Request ID is required to send message",
        });
        return;
      }

      try {
        // Call API to send chat message
        const result = await dispatch(
          sendChatMessageAction({
            requestId: itemData.requestId,
            message: msg,
            userId: keycloakUser.userId || undefined,
            userName: keycloakUser.name || keycloakUser.username || undefined,
          }),
        ).unwrap();

        // Update local state with the response from API
        if (result?.data) {
          const chatKey = id || "default";
          setChatMap((prev) => {
            const currentMessages = prev[chatKey] || [];
            const newMsg: MessageRow = {
              id: Number(result.data?.id) || currentMessages.length + 1,
              remark: result?.data?.remark || msg,
              createdBy:
                result?.data?.createdBy ||
                keycloakUser.name ||
                keycloakUser.username ||
                "User",
              branch: result.data?.branch || itemData.requestId,
              createdAt: result.data?.createdAt || new Date().toLocaleString(),
            };
            return {
              ...prev,
              [chatKey]: [...currentMessages, newMsg],
            };
          });
          showSuccessMessage("Message sent successfully");
        }
      } catch (error) {
        // Error is already handled by Redux slice (shows toaster)
        console.error("Failed to send chat message:", error);
      }
    },
    [id, keycloakUser, itemData, dispatch],
  );

  // Handle approve action - calls Redux API
  const handleApprove = useCallback(async () => {
    if (!id || !itemData) return;

    // Determine action type based on role
    let actionType: ApprovalActionType;
    if (selectedRole === "maker1") {
      actionType = "approvebymaker1";
    } else if (selectedRole === "maker2") {
      actionType = "approvebymaker2";
    } else if (selectedRole === "checker") {
      actionType = "approvebychecker";
    } else {
      // Default to maker1 if role is null
      actionType = "approvebymaker1";
    }

    try {
      const result = await dispatch(
        approvalActionMakerChecker({
          requestId: itemData.requestId,
          action: actionType,
          role: selectedRole || undefined,
          userId: keycloakUser.userId || undefined,
          userName: keycloakUser.name || keycloakUser.username || undefined,
        }),
      ).unwrap();

      if (result?.data) {
        const statusByAction: Partial<Record<ApprovalActionType, string>> = {
          approvebymaker1: "Approved By Maker 1",
          approvebymaker2: "Approved By Maker 2",
        };
        const newStatus = statusByAction[actionType] ?? "Approved by Checker";

        showSuccessMessage(`${newStatus} successfully`);

        // Redirect to table page after successful approval
        setTimeout(() => {
          navigate("/mbm-management/policy-benefit");
        }, 500); // Small delay to show success message
      }
    } catch (error) {
      // Error is already handled by Redux slice (shows toaster)
      console.error("Failed to approve:", error);
    }
  }, [id, itemData, selectedRole, dispatch, keycloakUser, navigate]);

  // Handle approve with pendency action
  const handleApproveWithPendency = useCallback(async () => {
    if (!id || !itemData) return;
    // Approve with pendency not yet implemented
    console.warn("Approve with pendency not yet implemented");
  }, [id, itemData]);

  const updateDummyItemStatus = useCallback(
    (itemId: string, newStatus: string) => {
      setDummyData((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item,
        ),
      );
    },
    [],
  );

  // Handle reverse to maker action
  const handleReverseToMaker = useCallback(async () => {
    if (!id || !itemData) return;
    await handleReverseToMakerAction({
      requestId: itemData.requestId,
      role: selectedRole,
      id,
      onSuccess: (newStatus) => {
        updateDummyItemStatus(id, newStatus);
      },
    });
  }, [id, itemData, selectedRole, updateDummyItemStatus]);

  // Handle reject action
  const handleReject = useCallback(async () => {
    if (!id || !itemData) return;
    // Reject action not yet implemented
    console.warn("Reject action not yet implemented");
  }, [id, itemData]);

  // Handle source click (PDF navigation)
  const handleSourceClick = useCallback(
    (source: { page_number?: number; snippet?: string }) => {
      // Open PDF viewer if not already open
      if (!isPdfViewerOpen) {
        setIsPdfViewerOpen(true);
      }
      // Navigate to the specific page
      if (source.page_number) {
        setPdfPageNumber(source.page_number);
      }
    },
    [isPdfViewerOpen],
  );

  // Handle save action
  const handleSave = useCallback(
    async (updatedData: Record<string, unknown>) => {
      if (!id || !itemData) return;

      try {
        // Extract metadata (comments and status) from updatedData
        const metadata =
          (updatedData._metadata as {
            comments?: Record<string, any[]>;
            status?: Record<string, string | null>;
          }) || {};

        // Extract the actual JSON data (without metadata)
        const jsonData = { ...updatedData };
        delete jsonData._metadata;

        // Get comments and status metadata
        const commentsMetadata = metadata.comments || {};
        const statusMetadata = metadata.status || {};

        const response = await putApi<
          { message: string; data: Record<string, unknown> },
          {
            requestId: string;
            data: Record<string, unknown>;
            comments?: Record<string, any[]>;
            status?: Record<string, string | null>;
          }
        >(mainApi, `/mbm/v1/maker-checker/${id}/save`, {
          requestId: itemData.requestId,
          data: jsonData,
          comments: commentsMetadata,
          status: statusMetadata,
        });

        if (handleApiResponse(response, "Data saved successfully")) {
          Object.keys(jsonData).forEach((key) => {
            if (key in sampleData) {
              (sampleData as Record<string, unknown>)[key] = jsonData[key];
            }
          });

          const itemIndex = dummyData.findIndex((item) => item.id === id);
          if (itemIndex !== -1) {
            setDummyData([...dummyData]);
          }
        }
      } catch (error) {
        showErrorMessage({
          error:
            error instanceof Error ? error.message : "Failed to save data",
        });
      }
    },
    [id, itemData, dummyData],
  );

  // Set breadcrumbs
  useBreadcrumb([
    {
      title: "Policy Benefit",
      path: "/mbm-management/policy-benefit",
      onClick: () => navigate("/mbm-management/policy-benefit"),
    },
    { title: itemData?.requestId || id || "Detail View" },
  ]);

  if (isLoading) {
    return (
      <Page title="Maker Checker - Detail">
        <PageContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
            <p className="text-gray-500">Loading request...</p>
          </div>
        </PageContent>
      </Page>
    );
  }

  // Defensive check
  if (!itemData || !itemData.data) {
    return (
      <Page title="Maker Checker - Detail">
        <PageContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
            <p className="text-gray-500">Item not found</p>
          </div>
        </PageContent>
      </Page>
    );
  }

  // Extract policy metadata for display
  const transformed = itemData?.data;
  const uinNo = transformed?.policy_metadata?.uin ?? "";
  const productName = transformed?.policy_metadata?.product_name ?? "";
  const productType = transformed?.policy_metadata?.product_type ?? "";
  const insurer = transformed?.policy_metadata?.insurance_company_name ?? "";

  // Status flow steps
  const statusFlowSteps = [
    { label: "Pending At Maker 1", value: "Pending At Maker 1" },
    { label: "Approved By Maker 1", value: "Approved By Maker 1" },
    { label: "Pending At Maker 2", value: "Pending At Maker 2" },
    { label: "Approved By Maker 2", value: "Approved By Maker 2" },
    // { label: "Pending At Maker ", value: "Pending At Maker" },
    { label: "Pending At Checker", value: "Pending At Checker" },
    { label: "Approved by Checker", value: "Approved by Checker " },
  ];

  // Get current step index based on status
  const getStatusStepIndex = (status: string): number => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes("rejected")) return -1; // Special case for rejected
    const index = statusFlowSteps.findIndex(
      (step) => step.value.toLowerCase() === normalizedStatus,
    );
    return index >= 0 ? index : 0;
  };

  // Get current step index
  const currentStepIndex = itemData?.status
    ? getStatusStepIndex(itemData.status)
    : 0;
  const isRejected = itemData?.status?.toLowerCase().includes("rejected");

  const scrollToMatch = async (path: string) => {
    try {
      await scrollToDataPathMatch(path, formCardRef.current);
    } catch {
      setTimeout(() => {
        fallbackScrollToDataPathMatch(path, formCardRef.current);
      }, FALLBACK_SCROLL_DELAY_MS);
    }
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity -- search deduplication across nested table paths
  const handleApplySearch = () => {
    // Trim the search text to remove leading/trailing whitespace
    const trimmedSearchText = searchText?.trim() || "";

    if (!trimmedSearchText) {
      setAppliedSearchText("");
      setMatchedPaths([]);
      setActiveMatchIndex(0);
      setActiveMatchPath(null);
      setOpenPaths(new Set());
      return;
    }

    setIsSubmitting(true);

    const allMatches = searchJsonPaths(updatedResponse, trimmedSearchText);

    if (!allMatches.length) {
      // Still set appliedSearchText for highlighting, even if no matches found
      // This allows users to see that a search was performed
      setAppliedSearchText(trimmedSearchText);
      setMatchedPaths([]);
      setActiveMatchIndex(0);
      setActiveMatchPath(null);
      setOpenPaths(new Set());
      setIsSubmitting(false);
      return;
    }

    // Filter out internal metadata fields that aren't rendered in the UI
    // These include: sources, references, limits, conditions, notes, _metadata fields
    // NOTE: We filter .conditions[ (array items) but NOT .conditions (object field)
    const internalFieldPatterns = [
      /\.sources\[/, // Array items like .sources[0]
      /\.references\[/,
      /\.limits\[/, // Array items like .limits[0]
      /\.notes\[/,
      /\.field_metadata/,
      /\.section_metadata/,
      /\._field_metadata/,
      /\._section_metadata/,
      /\._newComment/,
      /\._newComments/,
      /\._comments/,
      /\._status/,
      /\._comment/,
      /\._value/,
    ];

    const filteredMatches = allMatches.filter((path) => {
      const shouldFilter = internalFieldPatterns.some((pattern) =>
        pattern.test(path),
      );
      return !shouldFilter;
    });

    if (!filteredMatches.length) {
      setAppliedSearchText("");
      setMatchedPaths([]);
      setActiveMatchIndex(0);
      setActiveMatchPath(null);
      setOpenPaths(new Set());
      setIsSubmitting(false);
      return;
    }

    const deduplicatedMatches: string[] = [];
    const seenValues = new Map<string, string>(); // Map: value -> first path where it was found (for non-table fields)
    const seenTableRows = new Map<string, string>(); // Map: tableRowKey -> first path where this row matched (for table arrays)

    // Internal fields that are NOT displayed in UI tables - these should be EXCLUDED from search results
    const internalFields = new Set([
      "_status",
      "_comment",
      "_newComment",
      "_newComments",
      "_comments",
      "_value",
      "sources",
      "references",
      "limits",
      "notes",
      "field_metadata",
      "section_metadata",
    ]);

    const visibleColumnsByTable = new Map<string, Set<string>>();

    // Helper function to detect visible columns for any table array
    const detectVisibleColumns = (tablePath: string, tableArray: any[]) => {
      if (!Array.isArray(tableArray) || tableArray.length === 0) return;

      const visibleCols = new Set<string>();
      const tableInternalFields = [
        "_comments",
        "_status",
        "_comment",
        "_newComment",
        "_newComments",
        "_value",
      ];

      tableArray.forEach((row: any) => {
        if (typeof row !== "object" || row === null) return;
        for (const key of Object.keys(row)) {
          // Only include fields that are NOT internal and will be displayed as columns
          if (!tableInternalFields.includes(key) && !internalFields.has(key)) {
            visibleCols.add(key);
          }
        }
      });

      if (visibleCols.size > 0) {
        visibleColumnsByTable.set(tablePath, visibleCols);
      }
    };

    // Detect visible columns for all table arrays in the data
    if (updatedResponse && typeof updatedResponse === "object") {
      // Check top-level arrays (like definitions)
      Object.keys(updatedResponse).forEach((key) => {
        const value = (updatedResponse as any)[key];
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === "object"
        ) {
          detectVisibleColumns(key, value);
        }
      });

      // Check nested arrays (like exclusions.permanent_exclusions)
      Object.keys(updatedResponse).forEach((parentKey) => {
        const parentValue = (updatedResponse as any)[parentKey];
        if (
          parentValue &&
          typeof parentValue === "object" &&
          !Array.isArray(parentValue)
        ) {
          Object.keys(parentValue).forEach((childKey) => {
            const childValue = (parentValue as any)[childKey];
            if (
              Array.isArray(childValue) &&
              childValue.length > 0 &&
              typeof childValue[0] === "object"
            ) {
              detectVisibleColumns(`${parentKey}.${childKey}`, childValue);
            }
          });
        }
      });
    }

    for (const path of filteredMatches) {
      try {
        const pathParts = path.split(/[.[\]]/).filter(Boolean);
        const fieldName = pathParts[pathParts.length - 1]; // Last part is the field name

        if (internalFields.has(fieldName)) {
          continue;
        }

        // CRITICAL FIX: Skip matches that are ONLY field name matches (not content matches)
        // If the path ends with a field name that matches the search term, it's likely a field name match, not content
        // For table columns, we only want to count content matches, not column name matches
        // Pattern: definitions[0].definition - if "definition" matches the search term, it's the column name, not content
        const tableColumnMatch1 = path.match(
          /^([^.[\]]+)\[(\d+)\]\.([^.[\]]+)$/,
        );
        const tableColumnMatch2 = path.match(
          /^([^.[\]]+)\.([^.[\]]+)\[(\d+)\]\.([^.[\]]+)$/,
        );

        if (
          (tableColumnMatch1 || tableColumnMatch2) &&
          fieldName.toLowerCase() === trimmedSearchText.toLowerCase()
        ) {
          // This is a field name match in a table column - skip it unless the actual value also contains the search term
          // We'll check the value later, but for now, we need to verify the value actually contains the search term
          // Let's get the value first to check
          let value: any = updatedResponse;
          for (const part of pathParts) {
            if (value && typeof value === "object") {
              const numPart = Number(part);
              if (!Number.isNaN(numPart) && Array.isArray(value)) {
                value = value[numPart];
              } else if (part in value) {
                value = value[part];
              } else {
                value = null;
                break;
              }
            } else {
              value = null;
              break;
            }
          }

          // If the value is a string and contains the search term, it's a content match (keep it)
          // If the value doesn't contain the search term, it's only a field name match (skip it)
          if (value && typeof value === "string") {
            const valueLower = value.toLowerCase();
            const searchLower = trimmedSearchText.toLowerCase();
            if (!valueLower.includes(searchLower)) {
              continue;
            }
          } else {
            continue;
          }
        }
        let tablePath: string | null = null;
        let tableName: string | null = null;
        let rowIndex: number | null = null;

        if (tableColumnMatch1) {
          // Top-level table: definitions[0].term
          tablePath = tableColumnMatch1[1];
          tableName = tableColumnMatch1[1];
          rowIndex = parseInt(tableColumnMatch1[2], 10);
        } else if (tableColumnMatch2) {
          // Nested table: exclusions.permanent_exclusions[0].title
          tablePath = `${tableColumnMatch2[1]}.${tableColumnMatch2[2]}`;
          tableName = `${tableColumnMatch2[1]}.${tableColumnMatch2[2]}`;
          rowIndex = parseInt(tableColumnMatch2[3], 10);
        }

        if (tablePath && visibleColumnsByTable.has(tablePath)) {
          const visibleColumns = visibleColumnsByTable.get(tablePath)!;
          if (!visibleColumns.has(fieldName)) {
            continue;
          }
        }

        // Get the actual value at this path
        let value: any = updatedResponse;
        for (const part of pathParts) {
          if (value && typeof value === "object") {
            const numPart = Number(part);
            if (!Number.isNaN(numPart) && Array.isArray(value)) {
              value = value[numPart];
            } else if (part in value) {
              value = value[part];
            } else {
              value = null;
              break;
            }
          } else {
            value = null;
            break;
          }
        }

        if (
          (tableColumnMatch1 || tableColumnMatch2) &&
          value !== null &&
          value !== undefined
        ) {
          // rowIndex was already extracted in the regex match above
          // Create a unique key for the TABLE ROW: tableName[rowIndex]
          // This ensures we count each ROW only once, regardless of how many columns match
          // CRITICAL: Count by row, not by column - if a row matches in multiple columns, it's still 1 match
          const tableRowKey =
            rowIndex !== null && tableName ? `${tableName}[${rowIndex}]` : null;

          if (tableRowKey && !seenTableRows.has(tableRowKey)) {
            seenTableRows.set(tableRowKey, path);
            deduplicatedMatches.push(path);
          }
          continue;
        }

        // For other visible fields, convert value to string for comparison
        const valueStr =
          value !== null && value !== undefined
            ? String(value).toLowerCase().trim()
            : "";

        if (valueStr && !seenValues.has(valueStr)) {
          seenValues.set(valueStr, path);
          deduplicatedMatches.push(path);
        } else if (!valueStr) {
          deduplicatedMatches.push(path);
        }
      } catch {
        // If we can't get the value, just add the path anyway
        deduplicatedMatches.push(path);
      }
    }

    setAppliedSearchText(trimmedSearchText);
    setMatchedPaths(deduplicatedMatches);

    const pathsToOpen = new Set<string>();
    deduplicatedMatches.forEach((path) => {
      getAccordionPathsToOpen(path).forEach((p) => pathsToOpen.add(p));
    });
    setOpenPaths(pathsToOpen);

    if (deduplicatedMatches.length > 0) {
      setActiveMatchIndex(0);
      setActiveMatchPath(deduplicatedMatches[0]);
      setTimeout(() => {
        scrollToMatch(deduplicatedMatches[0]);
      }, 800);
    } else {
      setActiveMatchIndex(0);
      setActiveMatchPath(null);
    }

    setIsSubmitting(false);
  };

  const goToNextMatch = () => {
    if (!matchedPaths.length || !appliedSearchText) {
      // Don't navigate if no matches or no search applied
      return;
    }

    const nextIndex = (activeMatchIndex + 1) % matchedPaths.length;
    setActiveMatchIndex(nextIndex);
    const nextPath = matchedPaths[nextIndex];
    setActiveMatchPath(nextPath); // Set active match to change highlight color

    // Close all accordions first, then open only the ones needed for this match
    const pathsToOpen = new Set<string>();
    getAccordionPathsToOpen(nextPath).forEach((p) => pathsToOpen.add(p));
    setOpenPaths(pathsToOpen);

    // Wait longer for accordions to expand and tables to show all rows
    // Increased timeout to allow accordions, tables, and See more sections to expand
    setTimeout(() => {
      scrollToMatch(nextPath);
    }, 1200);
  };

  const goToPrevMatch = () => {
    if (!matchedPaths.length || !appliedSearchText) {
      // Don't navigate if no matches or no search applied
      return;
    }

    const prevIndex =
      (activeMatchIndex - 1 + matchedPaths.length) % matchedPaths.length;
    setActiveMatchIndex(prevIndex);
    const prevPath = matchedPaths[prevIndex];
    setActiveMatchPath(prevPath); // Set active match to change highlight color

    // Close all accordions first, then open only the ones needed for this match
    const pathsToOpen = new Set<string>();
    getAccordionPathsToOpen(prevPath).forEach((p) => pathsToOpen.add(p));
    setOpenPaths(pathsToOpen);

    // Wait longer for accordions to expand and tables to show all rows
    // Increased timeout to allow accordions, tables, and See more sections to expand
    setTimeout(() => {
      scrollToMatch(prevPath);
    }, 1200);
  };
  return (
    <Page title="Maker Checker - Detail View">
      <PageContent className="flex flex-col">
        {/* Status Flow Steps */}
        {itemData?.status && (
          <div className="mb-2 rounded-md border border-gray-200 bg-white p-2 shadow-sm">
            <div className="steps line-space">
              {statusFlowSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex && !isRejected;

                let stepCircleClass = "bg-gray-200 text-gray-500";
                if (isCompleted) {
                  stepCircleClass = "bg-green-500 text-white";
                } else if (isCurrent) {
                  stepCircleClass =
                    "bg-blue-500 text-white ring-2 ring-blue-300";
                }

                let stepLabelClass = "text-gray-500";
                if (isCurrent) {
                  stepLabelClass = "text-blue-600";
                } else if (isCompleted) {
                  stepLabelClass = "text-green-600";
                }

                return (
                  <div key={step.value} className="step">
                    <div className="step-header">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${stepCircleClass}`}
                      >
                        {isCompleted ? (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${stepLabelClass}`}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Current Status Badge */}
            <div className="mt-3 flex items-center justify-center gap-2 border-t border-gray-200 pt-2">
              <span className="text-sm font-medium text-gray-700">
                Current Status:
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  statusColors[itemData.status] ||
                  (isRejected
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800")
                }`}
              >
                {itemData.status}
              </span>
            </div>
          </div>
        )}

        {/* Policy Details Section */}
        <div className="mb-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-800">
            Product Information
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                UIN No
              </label>
              <p className="text-xs text-gray-800">{uinNo}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Product Name
              </label>
              <p className="text-xs text-gray-800">{productName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Product Type
              </label>
              <p className="text-xs text-gray-800">{productType}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Insurer
              </label>
              <p className="text-xs text-gray-800">{insurer}</p>
            </div>
          </div>
        </div>

        {/* Title and Quick Actions - Always Full Width */}
        <div className="mb-2 w-full">
          {/* Title Section */}
          <div className="flex w-full justify-between py-2">
            <TitleSection title="Good Health Group Mediclaim Policy - NIAHLGP21236V022021" />
            <div className="flex w-1/2 items-center gap-2">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplySearch();
                }}
                placeholder="Search policy content…"
                className="flex-1 rounded border px-2 py-1.5 text-xs"
              />

              {appliedSearchText && (
                <div className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {matchedPaths.length > 0 ? (
                    <>
                      <span>Match:</span>
                      <span className="font-bold">
                        {activeMatchIndex + 1} / {matchedPaths.length}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      No matches
                    </span>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={goToPrevMatch}
                disabled={!matchedPaths.length}
                className="cursor-pointer rounded px-2 text-xs transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-gray-700"
                title="Previous match"
              >
                ↑
              </button>

              <button
                type="button"
                onClick={goToNextMatch}
                disabled={!matchedPaths.length}
                className="cursor-pointer rounded px-2 text-xs transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-gray-700"
                title="Next match"
              >
                ↓
              </button>

              <Button
                color="primary"
                type="button"
                className="p-1.5 text-[11px]"
                disabled={isSubmitting || !searchText?.trim()}
                onClick={handleApplySearch}
              >
                {isSubmitting ? "Applying..." : "Apply"}
              </Button>
            </div>
          </div>

          {/* Quick Actions Section */}
          {(() => {
            const formData = itemData?.data || sampleData;
            const topLevelEntries = Object.entries(formData || {});
            let userRoles: UserRole[] = [];
            if (Array.isArray(selectedRole)) {
              userRoles = selectedRole;
            } else if (selectedRole) {
              userRoles = [selectedRole];
            }
            const hasMakerRole =
              userRoles.includes("maker1") || userRoles.includes("maker2");
            const hasCheckerRole =
              userRoles.includes("checker") || userRoles.includes("superadmin");
            const isMaker = hasMakerRole && !hasCheckerRole;
            const isApproved = false;
            // Checker can edit - allow checker to edit regardless of maker approval
            const checkerCanAct = hasCheckerRole;

            return topLevelEntries.length > 0 ? (
              <QuickActionsSection
                topLevelEntries={topLevelEntries}
                isApproved={isApproved}
                isMaker={isMaker}
                checkerCanAct={checkerCanAct}
                showRoleSwitcher={true}
                currentRole={selectedRole}
                readOnlyRole={true}
                customQuickActions={
                  <>
                    <div className="dark:bg-dark-600 mx-0.5 h-6 w-px bg-gray-300" />
                    <button
                      type="button"
                      onClick={() => setIsPdfViewerOpen(!isPdfViewerOpen)}
                      className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md ${
                        isPdfViewerOpen
                          ? "border-blue-500 bg-blue-50 text-blue-700 hover:border-blue-600 hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                          : "dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:text-gray-300"
                      }`}
                      title={
                        isPdfViewerOpen ? "Hide PDF Viewer" : "Show PDF Viewer"
                      }
                    >
                      {isPdfViewerOpen ? (
                        <>
                          <XMarkIcon className="h-3.5 w-3.5" />
                          <span>Hide PDF Viewer</span>
                        </>
                      ) : (
                        <>
                          <DocumentTextIcon className="h-3.5 w-3.5" />
                          <span>Show PDF Viewer</span>
                        </>
                      )}
                    </button>
                  </>
                }
                onExpandAll={() => formRef.current?.expandAll()}
                onCollapseAll={() => formRef.current?.collapseAll()}
                onExpandAllWithEdit={() => formRef.current?.expandAllWithEdit()}
                onCollapseAllAndCloseEdit={() =>
                  formRef.current?.collapseAllAndCloseEdit()
                }
                onChatClick={() => setOpenChatModal(true)}
              />
            ) : null;
          })()}
        </div>

        {/* Layout: Form and PDF Viewer - Wrapped in Single Card */}
        <Card
          className="min-h-0 flex-1 p-2"
          style={{
            height: "calc(156vh - 468px)",
            maxHeight: "calc(156vh - 468px)",
            contain: "layout style",
          }}
          skin="shadow"
        >
          <div
            className="flex h-full gap-x-2"
            style={{
              height: "calc(156vh - 468px)",
              maxHeight: "calc(156vh - 468px)",
            }}
          >
            {/* Dashboard Form Component - Scrollable Side Section */}
            <Card
              ref={formCardRef}
              className={`shrink-0 overflow-x-hidden overflow-y-auto ${isPdfViewerOpen ? "w-[50%]" : "w-full"} transition-[width] duration-300 ease-in-out will-change-[width]`}
              style={{ maxHeight: "calc(156vh - 468px)" }}
              skin="shadow"
            >
              <div className="p-2">
                <Suspense
                  fallback={
                    <div className="flex h-64 w-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-600">
                          Loading form...
                        </p>
                      </div>
                    </div>
                  }
                >
                  <JsonAccordionForm
                    ref={formRef}
                    data={formDataWithSourcesRemoved}
                    actualData={actualFormData}
                    showFileUpload={true}
                    className="w-full"
                    hideTitleAndQuickActions={true}
                    rowId={itemData.id || id || undefined}
                    enableStatus={false}
                    enableComments={true}
                    userRole={selectedRole}
                    makerApproved={true}
                    isApproved={true}
                    saveButtonLabel="Apply Changes"
                    savingButtonLabel="Applying changes..."
                    onSave={handleSave}
                    initialCommentsMetadata={commentsMetadata}
                    initialStatusMetadata={dummyStatusMetadata}
                    onApprove={handleApprove}
                    onApproveWithPendency={handleApproveWithPendency}
                    onReverseToMaker={handleReverseToMaker}
                    onReject={handleReject}
                    onSourceClick={handleSourceClick}
                    searchText={appliedSearchText}
                    activeMatchPath={activeMatchPath}
                    matchedPaths={matchedPaths}
                    openPaths={openPaths}
                    // Debug: Log when activeMatchPath is set but appliedSearchText might be missing
                    // This will help identify the issue
                  />
                </Suspense>
              </div>
            </Card>

            {/* PDF Viewer Panel - Resizable */}
            <div
              ref={pdfViewerRef}
              data-pdf-viewer
              className={`shrink-0 ${isPdfViewerOpen ? "opacity-100" : "w-0 overflow-hidden opacity-0"} transition-[flex-basis,width,opacity] duration-300 ease-in-out`}
              style={{
                maxHeight: "calc(156vh - 468px)",
                width: isPdfViewerOpen ? "50%" : "0",
                minWidth: isPdfViewerOpen ? "300px" : "0",
                flex: isPdfViewerOpen ? "0 0 50%" : "0 0 0",
              }}
            >
              {isPdfViewerOpen && (
                <Suspense
                  fallback={
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-600">
                          Loading PDF viewer...
                        </p>
                      </div>
                    </div>
                  }
                >
                  <div className="group relative h-full w-full overflow-hidden pr-2">
                    {/* Resize Handle - Visible on hover */}
                    <button
                      type="button"
                      aria-label="Resize PDF panel"
                      title="Drag to resize PDF panel"
                      className="absolute top-0 bottom-0 left-0 z-20 w-1 cursor-col-resize touch-none border-0 bg-transparent p-0 transition-colors duration-150 ease-in-out hover:bg-blue-500 active:bg-blue-600"
                      style={{
                        touchAction: "none",
                        WebkitUserSelect: "none",
                        userSelect: "none",
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const startX = e.clientX;
                        const pdfViewerDiv = e.currentTarget.parentElement
                          ?.parentElement as HTMLElement;
                        const formDiv =
                          pdfViewerDiv?.previousElementSibling as HTMLElement;
                        const container =
                          pdfViewerDiv?.parentElement as HTMLElement;

                        if (!pdfViewerDiv || !formDiv || !container) return;

                        const startWidth = pdfViewerDiv.offsetWidth;
                        const containerWidth = container.offsetWidth;
                        const minWidth = 300;
                        const maxWidth = containerWidth * 0.8;

                        // Optimize for performance - use transform and will-change
                        pdfViewerDiv.style.willChange = "flex-basis";
                        formDiv.style.willChange = "flex-basis";
                        pdfViewerDiv.style.transition = "none";
                        formDiv.style.transition = "none";
                        container.style.userSelect = "none";
                        document.body.style.cursor = "col-resize";
                        document.body.style.userSelect = "none";

                        let rafId: number | null = null;
                        let pendingPercentage: number | null = null;

                        const updateLayout = () => {
                          if (pendingPercentage !== null) {
                            const percentage = pendingPercentage;
                            // Only update flex-basis for better performance (avoid width + flex combo)
                            pdfViewerDiv.style.flexBasis = `${percentage}%`;
                            formDiv.style.flexBasis = `${100 - percentage}%`;
                            pendingPercentage = null;
                          }
                          rafId = null;
                        };

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault();
                          const diff = startX - moveEvent.clientX;
                          const newWidth = startWidth + diff;
                          const clampedWidth = Math.max(
                            minWidth,
                            Math.min(maxWidth, newWidth),
                          );
                          pendingPercentage =
                            (clampedWidth / containerWidth) * 100;

                          // Batch updates with requestAnimationFrame
                          if (rafId === null) {
                            rafId = requestAnimationFrame(updateLayout);
                          }
                        };

                        const handleMouseUp = () => {
                          // Flush any pending updates
                          if (rafId !== null) {
                            cancelAnimationFrame(rafId);
                            if (pendingPercentage !== null) {
                              updateLayout();
                            }
                          }

                          // Re-enable transitions and restore defaults
                          pdfViewerDiv.style.willChange = "";
                          formDiv.style.willChange = "";
                          pdfViewerDiv.style.transition = "";
                          formDiv.style.transition = "";
                          container.style.userSelect = "";
                          document.body.style.cursor = "";
                          document.body.style.userSelect = "";

                          document.removeEventListener(
                            "mousemove",
                            handleMouseMove,
                          );
                          document.removeEventListener(
                            "mouseup",
                            handleMouseUp,
                          );
                        };

                        document.addEventListener(
                          "mousemove",
                          handleMouseMove,
                          {
                            passive: false,
                          },
                        );
                        document.addEventListener("mouseup", handleMouseUp, {
                          passive: true,
                        });
                      }}
                    />
                    <PdfViewer
                      pdfUrl={pdfUrl}
                      title="Document Viewer"
                      height="calc(156vh - 468px)"
                      className="h-full"
                      availablePdfs={availablePdfs}
                      searchText={appliedSearchText}
                      onPdfSelect={(urlOrId) => {
                        const docSection = documentSections.find(
                          (s: any) => s.id === urlOrId || s.url === urlOrId,
                        );
                        const actualUrl = docSection?.url || urlOrId;

                        // Only update if the URL actually changed
                        if (actualUrl && actualUrl !== selectedPdfUrl) {
                          setSelectedPdfUrl(actualUrl);
                          // Only reset page number if PDF actually changed (not just page navigation)
                          // Check if it's a different PDF file, not just a page change
                          const currentPdfFile = selectedPdfUrl
                            ?.split("#")[0]
                            ?.split("?")[0];
                          const newPdfFile = actualUrl
                            .split("#")[0]
                            ?.split("?")[0];
                          if (
                            currentPdfFile &&
                            newPdfFile &&
                            currentPdfFile !== newPdfFile
                          ) {
                            setPdfPageNumber(undefined); // Reset page only when PDF file changes
                          }
                        }
                      }}
                      selectedPdfUrl={selectedPdfUrl || undefined}
                      pageNumber={pdfPageNumber}
                    />
                  </div>
                </Suspense>
              )}
            </div>
          </div>
        </Card>
      </PageContent>

      {/* Chat Popup */}
      {openChatModal && (
        <ChatPopup
          open={openChatModal}
          onClose={() => setOpenChatModal(false)}
          messages={chatMap[id || "default"] || []}
          onSend={sendChatMessage}
          departmentName={itemData?.requestId || "Policy Discussion"}
        />
      )}
    </Page>
  );
}
