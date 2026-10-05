// src/hooks/useDocuments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClientSideId } from "@/utils/createClientSideId";

export type DocumentType = "addendum" | "amendment" | "renewal" | "extension";
export type DocumentStatus =
  | "pending_operations_review"
  | "changes_requested"
  | "ready_for_compliance"
  | "compliance_approved"
  | "rejected";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  file_url: string;
  file_size: number | null;
  uploaded_by: string | null;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
  ic_name?: string | null;
  policy_type?: string | null;
  ro_name?: string | null;
  uo_name?: string | null;
  office_code?: string | null;
}

/* -------------------- MOCK DATA -------------------- */

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    name: "Policy Addendum - Renewal 2025",
    type: "addendum",
    file_url: "/mock-pdfs/sample1.pdf",
    file_size: 1024000,
    uploaded_by: "user-123",
    status: "pending_operations_review",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc-2",
    name: "Service Amendment - Region South",
    type: "amendment",
    file_url: "/mock-pdfs/sample2.pdf",
    file_size: 2048000,
    uploaded_by: "user-234",
    status: "changes_requested",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc-3",
    name: "Extension Agreement 2025",
    type: "extension",
    file_url: "/mock-pdfs/sample3.pdf",
    file_size: 512000,
    uploaded_by: "user-789",
    status: "ready_for_compliance",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/* -------------------- useDocuments -------------------- */

export function useDocuments(type?: DocumentType) {
  return useQuery({
    queryKey: ["documents", type ?? "all"],
    queryFn: async () => {
      // Always return local mock data
      await new Promise((res) => setTimeout(res, 300)); // fake delay
      if (type) return MOCK_DOCUMENTS.filter((d) => d.type === type);
      return MOCK_DOCUMENTS;
    },
  });
}

/* -------------------- useDocument -------------------- */

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      if (!id) throw new Error("Document ID required");
      await new Promise((res) => setTimeout(res, 200));
      return MOCK_DOCUMENTS.find((d) => d.id === id) ?? null;
    },
    enabled: !!id,
  });
}

/* -------------------- useUploadDocument -------------------- */

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      type,
      name,
    }: {
      file: File;
      type: DocumentType;
      name?: string;
    }) => {
      await new Promise((res) => setTimeout(res, 500));

      const newDoc: Document = {
        id: createClientSideId("mock"),
        name: name || file.name,
        type,
        file_url: URL.createObjectURL(file),
        file_size: file.size,
        uploaded_by: "mock-user",
        status: "pending_operations_review",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      MOCK_DOCUMENTS.unshift(newDoc); // show at top
      return newDoc;
    },
    onSuccess: (newDoc, variables) => {
      const typedKey = ["documents", variables.type ?? "all"];
      const allKey = ["documents", "all"];

      queryClient.setQueryData<Document[]>(typedKey, (prev = []) => [newDoc, ...(prev || [])]);
      queryClient.setQueryData<Document[]>(allKey, (prev = []) => [newDoc, ...(prev || [])]);
      queryClient.setQueryData(["documents", newDoc.id], newDoc);
      queryClient.invalidateQueries({ queryKey: ["documents"], exact: false });

      toast.success("Document uploaded successfully (mock)");
    },
    onError: (err: any) => {
      toast.error("Failed to upload document: " + (err?.message ?? "unknown"));
    },
  });
}

/* -------------------- Mock Empty Hooks for Review/Comments -------------------- */

export function useDocumentReviews(documentId: string) {
  return useQuery({
    queryKey: ["document-reviews", documentId],
    queryFn: async () => [],
    enabled: !!documentId,
  });
}

export function useDocumentComments(documentId: string) {
  return useQuery({
    queryKey: ["document-comments", documentId],
    queryFn: async () => [],
    enabled: !!documentId,
  });
}
