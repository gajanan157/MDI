import ChatPopup from "@/app/pages/dashboards/insurerManagement/chat/ChatPopup";
import { MessageRow } from "@/app/pages/dashboards/insurerManagement/chat/DataTable";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import type { JsonAccordionFormRef } from "@/components/shared/JsonAccordionForm";
import QuickActionsSection from "@/components/shared/JsonAccordionForm/QuickActionsSection";
import TitleSection from "@/components/shared/JsonAccordionForm/TitleSection";
import { Page } from "@/components/shared/Page";
import { PageContent } from "@/components/shared/PageContent";
import { Card } from "@/components/ui";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";
import { UserRole, useUserRole } from "@/hooks/useUserRole";
import {
  applyChangesMasterProduct,
  approveMasterProduct,
  clearError as clearMasterProductError,
  fetchMasterProductById,
  fetchMasterProductDocuments,
  fetchMasterProductRemarks,
  sendMasterProductRemark,
} from "@/store/features/masterProduct/masterProductSlice";
import type { MasterProductRemark } from "@/store/features/masterProduct/masterProductTypes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  handleApiResponse,
  showErrorMessage,
  showSuccessMessage,
} from "@/utils/errorHandler";
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { format, isValid } from "date-fns";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { sampleData } from "../dashboard/sampleData";
import { reorderObjectByKeys } from "../maker-checker/schema";
import { getAccordionPathsToOpen, searchJsonPaths } from "./searchJsonPaths";
import { usePermission } from "@/app/auth/usePermission";

// Lazy load heavy components
const JsonAccordionForm = lazy(() =>
  import("@/components/shared/JsonAccordionForm").then((m) => ({
    default: m.default,
  })),
);
const PdfViewer = lazy(() =>
  import("@/components/shared/PdfViewer").then((m) => ({ default: m.default })),
);

function waitForDoubleAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function getHiddenFieldValue(
  key: string,
  rawData: Record<string, unknown> | null,
  rawProduct: Record<string, unknown>,
): unknown {
  if (rawData && Object.prototype.hasOwnProperty.call(rawData, key)) {
    return rawData[key];
  }
  if (Object.prototype.hasOwnProperty.call(rawProduct, key)) {
    return rawProduct[key];
  }
  return undefined;
}

type PdfDisplayMode = "sideBySide" | "popup";

function getPdfOpenState(
  pdfDisplayMode: PdfDisplayMode,
  isPdfViewerOpen: boolean,
  isPdfPopupOpen: boolean,
): boolean {
  return pdfDisplayMode === "sideBySide" ? isPdfViewerOpen : isPdfPopupOpen;
}

function getPdfButtonTitle(
  pdfDisplayMode: PdfDisplayMode,
  isPdfViewerOpen: boolean,
  isPdfPopupOpen: boolean,
): string {
  if (pdfDisplayMode === "sideBySide") {
    return isPdfViewerOpen ? "Hide PDF Viewer" : "Show PDF Viewer";
  }
  return isPdfPopupOpen ? "Close PDF" : "Show PDF";
}

function getPdfButtonLabel(
  pdfDisplayMode: PdfDisplayMode,
  isPdfOpen: boolean,
): string {
  if (isPdfOpen) {
    return pdfDisplayMode === "sideBySide" ? "Hide PDF Viewer" : "Close PDF";
  }
  return pdfDisplayMode === "sideBySide" ? "Show PDF Viewer" : "Show PDF";
}

const pdfToggleButtonClass = (isPdfOpen: boolean) =>
  `flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md ${
    isPdfOpen
      ? "border-blue-500 bg-blue-50 text-blue-700 hover:border-blue-600 hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
      : "dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:text-gray-300"
  }`;

export default function MasterProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    selectedProduct,
    documents,
    loadingDocuments,
    approving,
    remarks,
    remarksPagination,
    sendingRemark,
  } = useAppSelector((state: any) => state.masterProduct);
  const [pdfPageNumber, setPdfPageNumber] = useState<number | undefined>(
    undefined,
  );
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [isPdfPopupOpen, setIsPdfPopupOpen] = useState(false);
  const [pdfDisplayMode, setPdfDisplayMode] = useState<"sideBySide" | "popup">(
    "sideBySide",
  );
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const formRef = useRef<JsonAccordionFormRef>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [appliedSearchText, setAppliedSearchText] = useState<string>("");
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set());
  const [matchedPaths, setMatchedPaths] = useState<string[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [activeMatchPath, setActiveMatchPath] = useState<string | null>(null);

  // Role support
  const keycloakUser = useKeycloakUser();
  const currentUserRole = useUserRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    currentUserRole || "maker1",
  );

  useEffect(() => {
    if (currentUserRole) {
      setSelectedRole(currentUserRole);
    }
  }, [currentUserRole]);

  const [openChatModal, setOpenChatModal] = useState<boolean>(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    // const { canWrite } = usePermission("master-product");

  const waitForElement = (selector: string, timeout = 2000) =>
    new Promise<Element>((resolve, reject) => {
      const start = performance.now();

      const check = () => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        if (performance.now() - start > timeout) return reject();
        requestAnimationFrame(check);
      };

      check();
    });

  const normalizePathFormat = (p: string) => p.replace(/\[(\d+)\]/g, ".$1");

  const findElementByPath = (path: string): Element | null => {
    const el: Element | null =
      document.querySelector(`[data-path="${path}"]`) ||
      document.querySelector(`[data-path="${normalizePathFormat(path)}"]`);
    if (el) return el;
    const allElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-path]"),
    );
    const exact = allElements.find(
      (e) =>
        e.dataset.path === path ||
        e.dataset.path === normalizePathFormat(path),
    );
    if (exact) return exact;
    const normPath = normalizePathFormat(path);
    let best: { el: Element; len: number } | null = null;
    for (const elem of allElements) {
      const ep = elem.dataset.path;
      if (!ep) continue;
      const normEp = normalizePathFormat(ep);
      const matches =
        ep === path ||
        normEp === normPath ||
        path.startsWith(ep + ".") ||
        path.startsWith(ep + "[") ||
        normPath.startsWith(normEp + ".") ||
        normPath.startsWith(normEp + "[");
      if (matches && (!best || normEp.length > best.len)) {
        best = { el: elem, len: normEp.length };
      }
    }
    return best ? best.el : null;
  };

  const scrollToMatch = async (path: string) => {
    try {
      const RETRY_DELAY_MS = 250;
      const MAX_RETRIES = 5;
      let el: Element | null = findElementByPath(path);
      for (let r = 0; !el && r < MAX_RETRIES; r++) {
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
        el = findElementByPath(path);
      }
      if (!el) {
        el = await waitForElement(`[data-path="${path}"]`, 5000);
      }

      // Wait for accordions/expand to finish, then for layout to settle
      await new Promise((r) => setTimeout(r, 400));
      await waitForDoubleAnimationFrame();

      // Re-query after layout so we get the correct element (nested components may have mounted)
      const elAfterLayout = findElementByPath(path);
      const targetEl = (elAfterLayout || el) as HTMLElement | null;

      // Always use form card as scroll container so the whole content moves
      const scrollContainer = formCardRef.current;

      if (scrollContainer && targetEl) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = targetEl.getBoundingClientRect();
        const elementTop =
          elementRect.top - containerRect.top + scrollContainer.scrollTop;
        const offset = 8;
        const scrollPosition = Math.max(0, elementTop - offset);
        scrollContainer.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      } else if (targetEl) {
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      if (targetEl) {
        targetEl.classList.add("search-active");
        setTimeout(() => targetEl?.classList.remove("search-active"), 1200);
      }
    } catch {
      setTimeout(() => {
        // Try exact match first
        let el = document.querySelector(`[data-path="${path}"]`);

        // If not found, find first child element
        if (!el) {
          const allElements = Array.from(
            document.querySelectorAll<HTMLElement>("[data-path]"),
          );
          const matchingElement = allElements.find((elem) => {
            const elemPath = elem.dataset.path;
            return (
              elemPath &&
              (elemPath.startsWith(path + ".") ||
                elemPath.startsWith(path + "["))
            );
          });

          if (matchingElement) {
            el = matchingElement;
          }
        }

        if (el) {
          const scrollContainer = formCardRef.current;
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = el.getBoundingClientRect();
            const elementTop =
              elementRect.top - containerRect.top + scrollContainer.scrollTop;
            const offset = 8;
            const scrollPosition = Math.max(0, elementTop - offset);
            scrollContainer.scrollTo({
              top: scrollPosition,
              behavior: "smooth",
            });
          } else {
            el.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }, 1000);
    }
  };

  const availablePdfs = useMemo(() => {
    const payload = documents?.data ?? documents ?? {};

    const files =
      payload.files || payload.attachments || payload.documents || [];

    return files.map((file: any) => ({
      fileMetadataId: file.fileMetadataId ?? file.attachmentId ?? file.id,
      fileName: file.fileName ?? file.name,
      url: file.downloadUrl ?? file.url,
      // keep id/name for consumers that use that shape
      id: file.fileMetadataId ?? file.attachmentId ?? file.id,
      name: file.fileName ?? file.name,
    }));
  }, [documents]);

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

  // Set default PDF when viewer opens or when PDF is selected
  const pdfUrl = selectedPdfUrl ?? availablePdfs[0]?.url ?? null;



  // Fetch product and store locally so useMemo won't run on stale/undefined selectedProduct
  useEffect(() => {
    if (!id) return;

    (async () => {
      setIsLoading(true);
      try {
        // If your thunk supports .unwrap(), prefer: await dispatch(fetchMasterProductById({ id })).unwrap()
        const action = await dispatch(fetchMasterProductById({ id }));

        const payload = (action as any).payload ?? action;
        const normalized = payload?.payload ?? payload;
        setProduct(normalized ?? null);
      } catch (err: any) {
        setProduct(null);
        showErrorMessage(err?.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, dispatch]);

  // Fetch documents when PDF viewer opens
  useEffect(() => {
    if (!id || (!isPdfViewerOpen && !isPdfPopupOpen)) return;

    (async () => {
      try {
        const res: any = await dispatch(fetchMasterProductDocuments({ id }));
      } catch (err) {
        console.warn("Failed to fetch documents:", err);
      }
    })();
  }, [id, isPdfViewerOpen, isPdfPopupOpen, dispatch]);



  useEffect(() => {
    if (!availablePdfs || availablePdfs.length === 0) {
      if (import.meta.env.DEV) {
        console.debug(
          "[PDF Page Debug] effect: no docs → setSelectedPdfUrl(null), keep pdfPageNumber",
        );
      }
      setSelectedPdfUrl(null);
      return;
    }
    const stillValid = availablePdfs.some((p: any) => p.url === selectedPdfUrl);

    if (!stillValid) {
      if (import.meta.env.DEV) {
        console.debug(
          "[PDF Page Debug] effect: invalid selectedPdfUrl → setSelectedPdfUrl(first), keep pdfPageNumber",
        );
      }
      setSelectedPdfUrl(availablePdfs[0].url);
    }
  }, [availablePdfs, selectedPdfUrl]);

  useEffect(() => {
    if (import.meta.env.DEV && isPdfViewerOpen) {
      console.debug("[PDF Page Debug] pdfPageNumber passed to PdfViewer", {
        pdfPageNumber,
        isPdfViewerOpen,
      });
    }
  }, [isPdfViewerOpen, pdfPageNumber]);

  useEffect(() => {
    if (!formCardRef.current || !pdfViewerRef.current) return;

    if (isPdfViewerOpen) {
      // Reset to default 50/50 split when opening
      formCardRef.current.style.width = "";
      formCardRef.current.style.flex = "";
      pdfViewerRef.current.style.width = "50%";
      pdfViewerRef.current.style.flex = "0 0 50%";
      pdfViewerRef.current.style.minWidth = "300px";
    } else {
      // Form takes full width when PDF viewer is closed
      formCardRef.current.style.width = "100%";
      formCardRef.current.style.flex = "1 1 100%";
      pdfViewerRef.current.style.width = "0";
      pdfViewerRef.current.style.flex = "0 0 0";
      pdfViewerRef.current.style.minWidth = "0";
    }
  }, [isPdfViewerOpen]);

  // Close PDF popup on Escape
  useEffect(() => {
    if (!isPdfPopupOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPdfPopupOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPdfPopupOpen]);

  const removeCommentsFromDisplay = (data: any) => {
    const cloned = JSON.parse(JSON.stringify(data || {}));

    const removeCommentsRecursive = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) return;

      Object.keys(obj).forEach((key) => {
        if (key === "comments") {
          delete obj[key];
        } else if (
          obj[key] &&
          typeof obj[key] === "object" &&
          !Array.isArray(obj[key])
        ) {
          removeCommentsRecursive(obj[key]);
        }
      });
    };

    removeCommentsRecursive(cloned);
    return cloned;
  };

  const itemData = useMemo(() => {
    // short-circuit while loading
    if (isLoading) return null;
    const sp = selectedProduct ?? product;
    if (!sp) return null;

    const rawJson =
      sp.masterProductJson ?? sp.data?.masterProductJson ?? sp.data ?? null;
    if (!rawJson) {
      return {
        ...sp,
        data: null,
      };
    }
    const dataWithoutComments = removeCommentsFromDisplay(rawJson);

    return {
      ...sp,
      data: dataWithoutComments, // No _comments added for master-product
    };
  }, [product, selectedProduct, isLoading]);

  // Handle source click (PDF navigation) — open in side-by-side or popup based on pdfDisplayMode
  const handleSourceClick = useCallback(
    (source: { page_number?: number; snippet?: string }) => {
      if (import.meta.env.DEV) {
        console.debug("[PDF Page Debug] handleSourceClick", {
          page_number: source?.page_number,
          pdfDisplayMode,
        });
      }
      if (pdfDisplayMode === "popup") {
        if (!isPdfPopupOpen) setIsPdfPopupOpen(true);
      } else {
        if (!isPdfViewerOpen) setIsPdfViewerOpen(true);
      }
      if (source.page_number) {
        setPdfPageNumber(source.page_number);
      }
    },
    [pdfDisplayMode, isPdfPopupOpen, isPdfViewerOpen],
  );

  const REMARKS_PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;
  const [remarksPageSize, setRemarksPageSize] = useState(5);
  const [currentRemarksPage, setCurrentRemarksPage] = useState(1);
  const remarksPageSizeRef = useRef(5);

  // Update ref when state changes
  useEffect(() => {
    remarksPageSizeRef.current = remarksPageSize;
  }, [remarksPageSize]);

  // Fetch remarks when chat modal opens (pageSize changes handled by handleRemarksPageSizeChange)
  useEffect(() => {
    if (openChatModal && id) {
      setCurrentRemarksPage(1);
      dispatch(
        fetchMasterProductRemarks({
          id,
          page: 1,
          size: remarksPageSizeRef.current,
        }),
      );
    }
  }, [openChatModal, id, dispatch]);

  const handleRemarksPageChange = useCallback(
    (page: number) => {
      if (id) {
        setCurrentRemarksPage(page);
        dispatch(
          fetchMasterProductRemarks({ id, page, size: remarksPageSize }),
        );
      }
    },
    [id, remarksPageSize, dispatch],
  );

  const handleRemarksPageSizeChange = useCallback(
    (size: number) => {
      setRemarksPageSize(size); // Update state immediately
      setCurrentRemarksPage(1);
      if (id) {
        dispatch(fetchMasterProductRemarks({ id, page: 1, size }));
      }
    },
    [id, dispatch],
  );

  // Send chat message handler - calls API
  const sendChatMessage = useCallback(
    async (msg: string) => {
      if (msg === "__close__") {
        setOpenChatModal(false);
        return;
      }

      if (!id) {
        showErrorMessage({ error: "Product ID is required to send message" });
        return;
      }

      try {
        await dispatch(
          sendMasterProductRemark({
            id,
            message: msg,
            userId: keycloakUser.userId || undefined,
            userName: keycloakUser.name || keycloakUser.username || undefined,
          }),
        ).unwrap();
        showSuccessMessage("Message sent successfully");
        setCurrentRemarksPage(1);
        await dispatch(
          fetchMasterProductRemarks({ id, page: 1, size: remarksPageSize }),
        );
      } catch (error) {
        console.error("Failed to send chat message:", error);
        showErrorMessage({
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [id, keycloakUser, dispatch, remarksPageSize],
  );

  // Format date for display (e.g. "2026-02-06T11:26:49.773Z" -> "06 Feb 2026, 11:26 AM")
  const formatRemarkDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return isValid(d) ? format(d, "dd MMM yyyy, hh:mm a") : dateStr;
    } catch {
      return dateStr;
    }
  };

  // Map remarks from Redux to MessageRow for ChatPopup
  const chatMessages = useMemo((): MessageRow[] => {
    const list = (remarks || []).filter(
      (r: MasterProductRemark | null | undefined): r is MasterProductRemark =>
        r != null,
    );
    return list.map((r: MasterProductRemark, idx: number) => ({
      id: typeof r.id === "number" ? r.id : idx + 1,
      remark: r.message ?? r.remark ?? "",
      createdBy: r.userName || r.createdBy || "User",
      branch: "",
      createdAt: formatRemarkDate(r.date ?? r.createdAt),
    }));
  }, [remarks]);
  // Breadcrumb
  useBreadcrumb([
    {
      title: "Master Product",
      path: "/master-management/master-product",
      onClick: () => navigate("/master-management/master-product"),
    },
    {
      title:
        product?.data?.productUin ??
        itemData?.data?.productId ??
        itemData?.productId ??
        id ??
        "Detail View",
    },
  ]);

  // Handle save action - apply changes to master product
  const handleSave = useCallback(
    // eslint-disable-next-line sonarjs/cognitive-complexity -- save payload merges hidden metadata fields
    async (updatedData: Record<string, unknown>, files?: File[]) => {
      if (!id || !itemData) {
        console.error("[MasterProduct handleSave] Missing id or itemData:", {
          id,
          hasItemData: !!itemData,
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const { comments, status, ...jsonData } = updatedData;
        let masterProductJson = jsonData?.data || jsonData;
        const hiddenKeys = [
          "Contact Details of Insurance Ombudsmen",
          "policy_metadata",
          "document_required",
        ] as const;
        const rawData = itemData.data as Record<string, unknown> | null;
        const rawProduct = itemData as Record<string, unknown>;
        if (
          typeof masterProductJson === "object" &&
          masterProductJson !== null
        ) {
          const merged = { ...(masterProductJson as Record<string, unknown>) };
          for (const k of hiddenKeys) {
            const val = getHiddenFieldValue(k, rawData, rawProduct);
            if (val !== undefined) merged[k] = val;
          }
          masterProductJson = merged;
        }


        const payload = {
          id,
          masterProductJson, // Direct value, no nested data wrapper
          documents: files || [],
        };
        const result: any = await dispatch(applyChangesMasterProduct(payload));
        const normalized = {
          success:
            result?.payload?.success ?? result?.success ?? !result?.error,
          data: result?.payload?.data ?? result?.data ?? null,
          error: result?.error ?? null,
        };

        const successMessage =
          result?.payload?.message ?? "Changes applied successfully";

        if (handleApiResponse(normalized, successMessage)) {
          try {
            await dispatch(fetchMasterProductById({ id }));
          } catch {
          }
        } 
      } catch (err: any) {
        console.error("[MasterProduct handleSave] Error:", err);
        showErrorMessage(err?.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, itemData, dispatch],
  );

  // Handle approve action — uses slice thunk, handles success/error and refetch
  const handleApprove = useCallback(async () => {
    if (!id || !itemData) return;
    const transformed = itemData?.data;
    const productId = itemData.productId ?? transformed?.productId ?? undefined;
    try {
      const result = await dispatch(
        approveMasterProduct({ id, productId }),
      ).unwrap();
      const message = result?.message ?? "Master product approved successfully";
      showSuccessMessage(message);
      dispatch(clearMasterProductError());
      try {
        await dispatch(fetchMasterProductById({ id }));
      } catch {
        // Ignore refetch errors
      }
    } catch (err: any) {
      showErrorMessage({
        error: err?.message ?? "Failed to approve master product",
      });
    }
  }, [id, itemData, dispatch]);

  // Master Product: Role-based permissions
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
  const checkerCanAct = hasCheckerRole || true; // Checker / Super Admin can always act, or default to true

  type Definition = {
    term: string;
    definition: string;
    is_standard?: boolean;
  };

  type Data = {
    definitions: Definition[];
    [key: string]: any;
  };

  function removeIsStandard(data: Data) {
    const definitions = data?.definitions;
    const result: Data = { ...data };

    if (Array.isArray(definitions)) {
      result.definitions = definitions.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ is_standard, ...rest }) => rest,
      );
    } else if (
      definitions &&
      typeof definitions === "object" &&
      !Array.isArray(definitions) &&
      Array.isArray((definitions as any).definitions)
    ) {
      const inner = (definitions as any).definitions;
      const mappedInner = inner.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ is_standard, ...rest }: any) => rest,
      );
      const restKeys = Object.fromEntries(
        Object.entries(definitions as any).filter(([k]) => k !== "definitions"),
      );
      (result as any).definitions = { definitions: mappedInner, ...restKeys };
    } else {
      result.definitions = definitions ?? [];
    }

    return result;
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- removeIsStandard is stable for itemData.data
  }, [itemData?.data]);

  // True when config has no meaningful data (empty or all empty values) – used to hide Apply/Reset/Approve
  const isConfigEmpty = useCallback((obj: any): boolean => {
    if (obj == null) return true;
    if (typeof obj !== "object") return false;
    if (Array.isArray(obj)) return obj.length === 0;
    const keys = Object.keys(obj);
    if (keys.length === 0) return true;
    return keys.every((k) => isConfigEmpty(obj[k]));
  }, []);
  const noConfigurationData =
    !updatedResponse || isConfigEmpty(updatedResponse);

  // Prepare form data: when no config data, pass {} so form shows "No data available" and buttons stay hidden
  const formDataWithSourcesRemoved = useMemo(() => {
    if (!updatedResponse) return sampleData;
    if (isConfigEmpty(updatedResponse)) return {};
    return removeSources(updatedResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- removeSources is stable for updatedResponse
  }, [updatedResponse, isConfigEmpty]);

  // Actual form data with all metadata
  const actualFormData = useMemo(
    () => updatedResponse || sampleData,
    [updatedResponse],
  );

  const handleResetSearch = useCallback(() => {
    setAppliedSearchText("");
    setMatchedPaths([]);
    setActiveMatchIndex(0);
    setActiveMatchPath(null);
    setOpenPaths(new Set());
  }, []);

  // Handle apply search; optional term overrides searchText (e.g. from debounced input) — must be before any early return (Rules of Hooks)
  const handleApplySearch = useCallback(
    // eslint-disable-next-line sonarjs/cognitive-complexity -- search deduplication across nested table paths
    (term?: string) => {
      const trimmedSearchText =
        (term !== undefined ? term : searchText)?.trim() || "";

      if (!trimmedSearchText) {
        setAppliedSearchText("");
        setMatchedPaths([]);
        setActiveMatchIndex(0);
        setActiveMatchPath(null);
        setOpenPaths(new Set());
        return;
      }

      setIsSubmitting(true);

      if (!updatedResponse) {
        setAppliedSearchText(trimmedSearchText);
        setMatchedPaths([]);
        setActiveMatchIndex(0);
        setActiveMatchPath(null);
        setOpenPaths(new Set());
        setIsSubmitting(false);
        return;
      }

      const allMatches = searchJsonPaths(updatedResponse, trimmedSearchText);

      if (!allMatches.length) {
        setAppliedSearchText(trimmedSearchText);
        setMatchedPaths([]);
        setActiveMatchIndex(0);
        setActiveMatchPath(null);
        setOpenPaths(new Set());
        setIsSubmitting(false);
        return;
      }

      const internalFieldPatterns = [
        /\.sources\[/,
        /\.references\[/,
        /\.limits\[/,
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

      // Deduplicate matches: count by ROW for table arrays, not by column
      const deduplicatedMatches: string[] = [];
      const seenTableRows = new Map<string, string>();
      const seenStructuredTableRows = new Map<
        string,
        { path: string; contentMatch: boolean; dedupIndex: number }
      >();

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

      const detectVisibleColumns = (tablePath: string, tableArray: any[]) => {
        if (tableArray.length === 0) return;
        const first = tableArray[0];
        if (typeof first !== "object" || first === null) return;
        const keys = Object.keys(first).filter(
          (k) => !internalFields.has(k),
        );
        visibleColumnsByTable.set(tablePath, new Set(keys));
      };

      for (const path of filteredMatches) {
        try {
          const pathParts = path.split(/[.[\]]/).filter(Boolean);
          const fieldName = pathParts[pathParts?.length - 1];

          if (internalFields.has(fieldName)) continue;

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
            let value: any = updatedResponse;
            for (const part of pathParts) {
              if (value && typeof value === "object") {
                const numPart = Number(part);
                if (!isNaN(numPart) && Array.isArray(value)) {
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
            const strVal =
              value != null && typeof value !== "object"
                ? String(value)
                : "";
            if (
              !strVal
                .toLowerCase()
                .includes(trimmedSearchText.toLowerCase())
            ) {
              continue;
            }
          }

          if (
            path.match(/\.definitions\[\d+\]/) &&
            visibleColumnsByTable.has("definitions")
          ) {
            const tableArray =
              (updatedResponse as any).definitions ?? [];
            if (!visibleColumnsByTable.has("definitions"))
              detectVisibleColumns("definitions", tableArray);
            const pathPartsForRow = path.split(/\.definitions\[|\]\./);
            const rowIndex =
              pathPartsForRow.length >= 2
                ? parseInt(pathPartsForRow[1], 10)
                : -1;
            const rowKey = `definitions-${rowIndex}`;
            if (!seenTableRows.has(rowKey)) {
              seenTableRows.set(rowKey, path);
              deduplicatedMatches.push(path);
            }
            continue;
          }

          const structuredTableMatch = path.match(
            /^([^.[\]]+)\.([^.[\]]+)\[(\d+)\]\.([^.[\]]+)$/,
          );
          if (structuredTableMatch) {
            const [, parentKey, childKey, rowIndexStr, fieldNamePart] =
              structuredTableMatch;
            const rowIndex = parseInt(rowIndexStr, 10);
            const parentValue = (updatedResponse as any)[parentKey];
            const childValue = parentValue?.[childKey];
            if (
              Array.isArray(childValue) &&
              childValue.length > 0 &&
              typeof childValue[0] === "object"
            ) {
              const tablePathKey = `${parentKey}.${childKey}`;
              if (!visibleColumnsByTable.has(tablePathKey))
                detectVisibleColumns(
                  tablePathKey,
                  childValue,
                );
              const rowKey = `${tablePathKey}-${rowIndex}`;
              const colSet = visibleColumnsByTable.get(tablePathKey);
              const isVisibleCol = colSet?.has(fieldNamePart);
              const contentMatch =
                (childValue[rowIndex] as any)?.[fieldNamePart] != null &&
                String((childValue[rowIndex] as any)[fieldNamePart])
                  .toLowerCase()
                  .includes(trimmedSearchText.toLowerCase());
              if (isVisibleCol && !seenStructuredTableRows.has(rowKey)) {
                seenStructuredTableRows.set(rowKey, {
                  path,
                  contentMatch,
                  dedupIndex: deduplicatedMatches.length,
                });
                deduplicatedMatches.push(path);
              } else if (
                isVisibleCol &&
                seenStructuredTableRows.get(rowKey)?.dedupIndex !== undefined
              ) {
                const existing = seenStructuredTableRows.get(rowKey)!;
                if (
                  contentMatch &&
                  !existing.contentMatch
                ) {
                  deduplicatedMatches[existing.dedupIndex] = path;
                  seenStructuredTableRows.set(rowKey, {
                    ...existing,
                    path,
                    contentMatch: true,
                  });
                }
              }
            }
            continue;
          }

          deduplicatedMatches.push(path);
        } catch {
          // skip invalid paths
        }
      }

      setMatchedPaths(deduplicatedMatches);
      setAppliedSearchText(trimmedSearchText);
      setActiveMatchIndex(0);
      setActiveMatchPath(
        deduplicatedMatches.length > 0 ? deduplicatedMatches[0] : null,
      );

      const pathsToOpen = new Set<string>();
      deduplicatedMatches.slice(0, 20).forEach((p) =>
        getAccordionPathsToOpen(p).forEach((path) => pathsToOpen.add(path)),
      );
      setOpenPaths(pathsToOpen);

      setTimeout(() => {
        if (deduplicatedMatches.length > 0) {
          scrollToMatch(deduplicatedMatches[0]);
        }
      }, 800);

      setIsSubmitting(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scrollToMatch is intentionally excluded to avoid callback churn
    [searchText, updatedResponse],
  );

  const quickActionsTopLevelEntries = useMemo(
    () => Object.entries(itemData?.data ?? {}).filter(([key]) => key !== "_comments"),
    [itemData?.data],
  );

  const isPdfOpen = useMemo(
    () => getPdfOpenState(pdfDisplayMode, isPdfViewerOpen, isPdfPopupOpen),
    [pdfDisplayMode, isPdfViewerOpen, isPdfPopupOpen],
  );

  const pdfButtonTitle = useMemo(
    () => getPdfButtonTitle(pdfDisplayMode, isPdfViewerOpen, isPdfPopupOpen),
    [pdfDisplayMode, isPdfViewerOpen, isPdfPopupOpen],
  );

  const handlePdfToggle = useCallback(() => {
    if (pdfDisplayMode === "sideBySide") {
      const next = !isPdfViewerOpen;
      setIsPdfViewerOpen(next);
      if (next) {
        if (import.meta.env.DEV) {
          console.debug("[PDF Page Debug] Show PDF button → setPdfPageNumber(1)");
        }
        setPdfPageNumber(1);
      }
      return;
    }

    const next = !isPdfPopupOpen;
    setIsPdfPopupOpen(next);
    if (next) setPdfPageNumber(1);
  }, [pdfDisplayMode, isPdfViewerOpen, isPdfPopupOpen]);

  // Early returns AFTER all hooks
  if (isLoading) {
    return (
      <Page title="Master Product - Detail">
        <PageContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
            <p className="text-gray-500">Loading product...</p>
          </div>
        </PageContent>
      </Page>
    );
  }

  // Defensive check
  if (!itemData || !itemData.data) {
    return (
      <Page title="Master Product - Detail">
        <PageContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
            <p className="text-gray-500">Product not found</p>
          </div>
        </PageContent>
      </Page>
    );
  }

  // When selectedProduct.data.status is "approved": hide Apply Changes, Reset, Approve and edit options; else show
  const statusValue =
    selectedProduct?.data?.status ??
    selectedProduct?.status ??
    itemData?.status ??
    itemData?.data?.status ??
    product?.data?.status ??
    product?.status ??
    "";
  const isApprovedProduct =
    typeof statusValue === "string" && statusValue.toLowerCase() === "approved";

  // derive fields from transformed data (falls back to top-level itemData fields if needed)
  // const transformed = itemData?.data;


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
    }, 600);
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
    }, 600);
  };

  return (
    <Page title="Master Product - Detail View">
      <PageContent className="flex flex-col">
        <div className="mb-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-800">
            Product Information
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                UIN No
              </label>
              <p className="text-xs text-gray-800">{product?.data?.productUin}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Product Name
              </label>
              <p className="text-xs text-gray-800">
                {product?.data?.productName}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Product Type
              </label>
              <p className="text-xs text-gray-800">
                {product?.data?.productType}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Insurer
              </label>
              <p className="text-xs text-gray-800">
                {product?.data?.legalName}
              </p>
            </div>
          </div>
        </div>

        {/* Title and Quick Actions - Always Full Width */}
        <div className="mb-2 w-full">
          {/* Title Section */}
          <div className="flex w-full items-center justify-between gap-2 py-2">
            <TitleSection title="MBM Dashboard - Product Configuration" />
            {noConfigurationData ? (
              /* When no config data: show chat button only (no role badge on master product) */
              <div className="flex max-w-xl flex-1 flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenChatModal(true)}
                  className="cursor-pointer flex items-center gap-1 rounded-md border border-green-500 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 shadow-sm transition-all duration-200 hover:bg-green-100 hover:shadow-md dark:border-green-400 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                  title="Open Chat"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  Chat
                </button>
              </div>
            ) : (
              /* Search: key/value in JSON – input, apply, prev/next */

              <div className="flex max-w-xl flex-1 items-center gap-2">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchText(value); // update state

                    // Clear previous debounce
                    if (searchDebounceRef.current)
                      clearTimeout(searchDebounceRef.current);

                    const trimmed = value.trim();

                    // Debounce search
                    if (trimmed) {
                      searchDebounceRef.current = setTimeout(() => {
                        handleApplySearch(trimmed); // use the value from the input, not state
                      }, 400);
                    } else {
                      searchDebounceRef.current = setTimeout(() => {
                        handleResetSearch();
                      }, 400);
                    }
                  }}
                  placeholder="Search policy content…"
                  className="dark:border-dark-600 dark:bg-dark-800 dark:text-dark-100 min-w-0 flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />

                {appliedSearchText && (
                  <div className="flex shrink-0 items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
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
                  className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-gray-700"
                  title="Previous match"
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={goToNextMatch}
                  disabled={!matchedPaths.length}
                  className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-gray-700"
                  title="Next match"
                >
                  ↓
                </button>

              </div>
            )}
          </div>

          {quickActionsTopLevelEntries.length > 0 && (
              <QuickActionsSection
                topLevelEntries={quickActionsTopLevelEntries}
                isApproved={isApprovedProduct}
                isMaker={isMaker}
                checkerCanAct={checkerCanAct}
                showRoleSwitcher={false}
                currentRole={selectedRole}
                readOnlyRole={true}
                onChatClick={() => setOpenChatModal(true)}
                customQuickActions={
                  <>
                    <div className="dark:bg-dark-600 mx-0.5 h-6 w-px bg-gray-300" />
                    <button
                      type="button"
                      onClick={handlePdfToggle}
                      className={pdfToggleButtonClass(isPdfOpen)}
                      title={pdfButtonTitle}
                    >
                      {isPdfOpen ? (
                        <>
                          <XMarkIcon className="h-3.5 w-3.5" />
                          <span>{getPdfButtonLabel(pdfDisplayMode, true)}</span>
                        </>
                      ) : (
                        <>
                          <DocumentTextIcon className="h-3.5 w-3.5" />
                          <span>{getPdfButtonLabel(pdfDisplayMode, false)}</span>
                        </>
                      )}
                    </button>
                  </>
                }
                onExpandAll={() => formRef.current?.expandAll()}
                onCollapseAll={() => formRef.current?.collapseAll()}
                pdfDisplayMode={pdfDisplayMode}
                onPdfDisplayModeChange={(mode) => {
                  setPdfDisplayMode(mode);
                  // When changing type, hide the PDF viewer (user can open again with Show button)
                  setIsPdfViewerOpen(false);
                  setIsPdfPopupOpen(false);
                }}
                onExpandAllWithEdit={() => formRef.current?.expandAllWithEdit()}
                onCollapseAllAndCloseEdit={() =>
                  formRef.current?.collapseAllAndCloseEdit()
                }
              />
          )}
        </div>
        <Card
          className="min-h-0 flex-1 p-2"
          style={{
            height: "calc(156vh - 468px)",
            maxHeight: "calc(156vh - 468px)",
          }}
          skin="shadow"
          data-layout-container
        >
          <div
            className="flex h-full gap-x-2"
            style={{
              height: "calc(156vh - 468px)",
              maxHeight: "calc(156vh - 468px)",
            }}
          >
            <Card
              ref={formCardRef}
              className={`shrink-0 overflow-y-auto transition-all duration-300 ease-in-out ${isPdfViewerOpen ? "w-[50%] overflow-x-auto" : "w-full flex-1 overflow-x-hidden"}`}
              style={{ maxHeight: "calc(156vh - 468px)", minWidth: 0 }}
              skin="shadow"
            >
              <div className="p-2">
                <Suspense
                  fallback={
                    <div className="flex h-64 w-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-2 text-xs text-gray-600">
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
                    showFileUpload={false}
                    skipValidationOnApply={true}
                    className="w-full"
                    hideTitleAndQuickActions={true}
                    rowId={itemData.id || id || undefined}
                    enableStatus={false}
                    enableComments={false}
                    userRole={selectedRole}
                    makerApproved={true}
                    isSubmitting={isSubmitting}
                    isApproving={approving}
                    readOnly={isApprovedProduct || !hasCheckerRole}
                    saveButtonLabel="Apply Changes"
                    savingButtonLabel="Applying changes..."
                    isApproved={true}
                    hideActionButtonsWhenNoData={noConfigurationData}
                    onSave={(data, files) => {
                      return handleSave(data, files);
                    }}
                    onApprove={() => setShowApproveConfirm(true)}
                    hideApprovalActions={true}
                    onSourceClick={handleSourceClick}
                    searchText={appliedSearchText}
                    activeMatchPath={activeMatchPath}
                    matchedPaths={matchedPaths}
                    openPaths={openPaths}
                  />
                </Suspense>
              </div>
            </Card>

            {/* PDF Viewer Panel */}
            <div
              ref={pdfViewerRef}
              data-pdf-viewer
              className={`shrink-0 transition-all duration-300 ease-in-out ${isPdfViewerOpen ? "opacity-100" : "w-0 overflow-hidden opacity-0"}`}
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
                        <p className="mt-2 text-xs text-gray-600">
                          Loading PDF viewer...
                        </p>
                      </div>
                    </div>
                  }
                >
                  <div className="group relative h-full w-full overflow-hidden pr-2">
                    <div
                      className="absolute top-0 bottom-0 left-0 z-20 w-1 cursor-col-resize touch-none bg-transparent transition-colors duration-150 ease-in-out hover:bg-blue-500 active:bg-blue-600"
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
                            const pct = pendingPercentage;
                            pdfViewerDiv.style.flexBasis = `${pct}%`;
                            formDiv.style.flexBasis = `${100 - pct}%`;
                            pendingPercentage = null;
                          }
                          rafId = null;
                        };

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault();
                          const diff = startX - moveEvent.clientX;
                          const newWidth = startWidth + diff;
                          const clamped = Math.max(
                            minWidth,
                            Math.min(maxWidth, newWidth),
                          );
                          pendingPercentage = (clamped / containerWidth) * 100;
                          if (rafId === null)
                            rafId = requestAnimationFrame(updateLayout);
                        };

                        const handleMouseUp = () => {
                          if (rafId !== null) {
                            cancelAnimationFrame(rafId);
                            if (pendingPercentage !== null) updateLayout();
                          }
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

                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    />
                    {isPdfViewerOpen && (
                      <PdfViewer
                        pdfUrl={pdfUrl ?? undefined}
                        title="Document Viewer"
                        height="calc(156vh - 468px)"
                        className="h-full"
                        availablePdfs={availablePdfs}
                        selectedPdfUrl={selectedPdfUrl ?? undefined}
                        pageNumber={pdfPageNumber}
                        isLoading={loadingDocuments}
                        onPdfSelect={(urlOrId) => {
                          const selected = availablePdfs.find(
                            (p: any) => p.id === urlOrId || p.url === urlOrId,
                          );
                          if (!selected) return;
                          const isChangingPdf =
                            selectedPdfUrl != null &&
                            selected.url !== selectedPdfUrl;
                          setSelectedPdfUrl(selected.url);
                          if (isChangingPdf) setPdfPageNumber(1);
                        }}
                      />
                    )}
                  </div>
                </Suspense>
              )}
            </div>
          </div>
        </Card>
      </PageContent>

      {/* PDF Popup */}
      {isPdfPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/50"
          onClick={() => setIsPdfPopupOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="PDF document viewer"
        >
          <div
            className="dark:border-dark-600 dark:bg-dark-800 flex h-[98vh] max-h-[98vh] w-[98vw] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dark:border-dark-600 flex shrink-0 items-center justify-between border-b border-gray-200 px-3 py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Document Viewer
              </span>
              <button
                type="button"
                onClick={() => setIsPdfPopupOpen(false)}
                className="dark:hover:bg-dark-600 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:text-gray-200"
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <Suspense
                fallback={
                  <div className="dark:bg-dark-700 flex h-full w-full items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Loading PDF viewer...
                      </p>
                    </div>
                  </div>
                }
              >
                <PdfViewer
                  pdfUrl={pdfUrl ?? undefined}
                  title="Document Viewer"
                  height="100%"
                  className="h-full min-h-0"
                  availablePdfs={availablePdfs}
                  selectedPdfUrl={selectedPdfUrl ?? undefined}
                  pageNumber={pdfPageNumber}
                  isLoading={loadingDocuments}
                  onPdfSelect={(urlOrId) => {
                    const selected = availablePdfs.find(
                      (p: any) => p.id === urlOrId || p.url === urlOrId,
                    );
                    if (!selected) return;
                    const isChangingPdf =
                      selectedPdfUrl != null && selected.url !== selectedPdfUrl;
                    setSelectedPdfUrl(selected.url);
                    if (isChangingPdf) setPdfPageNumber(1);
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Approve confirmation dialog */}
      <ConfirmationDialog
        open={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="Approve master product"
        description="Are you sure you want to approve this master product?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        variant="success"
      />

      {/* Chat Popup */}

      {openChatModal && (
        <ChatPopup
          open={openChatModal}
          onClose={() => setOpenChatModal(false)}
          messages={chatMessages}
          onSend={sendChatMessage}
          sending={sendingRemark}
          departmentName={
            product?.data?.productName ||
            itemData?.data?.policy_metadata?.product_name ||
            "Master Product Discussion"
          }
          hideBranchColumn
          pagination={{
            currentPage: remarksPagination?.currentPage ?? currentRemarksPage,
            totalPages:
              remarksPagination?.totalPages ??
              Math.max(
                1,
                Math.ceil(
                  (remarksPagination?.totalRecords ?? remarks.length) /
                    remarksPageSize,
                ),
              ),
            onPageChange: handleRemarksPageChange,
            totalRecords: remarksPagination?.totalRecords ?? remarks.length,
            recordPerPage: remarksPageSize, // Always use local state as source of truth
            pageSizeOptions: [...REMARKS_PAGE_SIZE_OPTIONS],
            onPageSizeChange: handleRemarksPageSizeChange,
          }}
        />
      )}
    </Page>
  );
}
