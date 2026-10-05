import { documentApi2, getApi, providerApi } from "@/app/api/apiService";

const PRESIGN_PATH = "/v1/files/presigned-url";

/**
 * Mirrors backend `PresignDownloadRequest` (Spring).
 * UUID fields omitted when not used.
 */
export type PresignDownloadRequest = {
  entityId?: string | null;
  fileMetadataId?: string | null;
  s3BucketName: string;
  s3SubBucketName?: string | null;
  inwardNo?: string;
  objectKey?: string | null;
  originalFileName?: string;
  /** ISO date yyyy-MM-dd */
  fromDate?: string;
  toDate?: string;
  page: number;
  size: number;
};

export type PresignListParsed = {
  items: Record<string, unknown>[];
  totalElements: number;
  page: number;
  size: number;
};

function unwrapPayload(data: unknown): unknown {
  if (data == null) return data;
  if (typeof data === "object" && data !== null && "data" in data) {
    const inner = (data as Record<string, unknown>).data;
    if (inner !== undefined) return inner;
  }
  return data;
}


export function parsePresignListResponse(data: unknown): PresignListParsed {
  const root = unwrapPayload(data);
  if (root == null) {
    return { items: [], totalElements: 0, page: 0, size: 20 };
  }
  if (Array.isArray(root)) {
    return {
      items: root as Record<string, unknown>[],
      totalElements: root.length,
      page: 0,
      size: root.length || 20,
    };
  }
  if (typeof root !== "object") {
    return { items: [], totalElements: 0, page: 0, size: 20 };
  }
  const o = root as Record<string, unknown>;
  const rawContent = o.content ?? o.items ?? o.records;
  const content = Array.isArray(rawContent) ? rawContent : [];
  const totalElements = Number(
    o.totalElements ?? o.total ?? o.totalCount ?? content.length,
  );
  const page = Number(o.number ?? o.page ?? 0) || 0;
  const size = Number(o.size ?? o.pageSize ?? 20) || 20;
  return {
    items: content as Record<string, unknown>[],
    totalElements: Number.isFinite(totalElements) ? totalElements : content.length,
    page,
    size,
  };
}

function buildPresignQueryString(req: PresignDownloadRequest): string {
  const p = new URLSearchParams();
  p.set("s3BucketName", req.s3BucketName);
  p.set("page", String(req.page));
  p.set("size", String(req.size));
  if (req.inwardNo?.trim()) p.set("inwardNo", req.inwardNo.trim());
  if (req.originalFileName?.trim()) {
    p.set("originalFileName", req.originalFileName.trim());
  }
  if (req.fromDate?.trim()) p.set("fromDate", req.fromDate.trim());
  if (req.toDate?.trim()) p.set("toDate", req.toDate.trim());
  if (req.entityId) p.set("entityId", String(req.entityId));
  if (req.fileMetadataId) {
    p.set("fileMetadataId", String(req.fileMetadataId));
  }
  if (req.s3SubBucketName) {
    p.set("s3SubBucketName", String(req.s3SubBucketName));
  }
  if (req.objectKey) p.set("objectKey", String(req.objectKey));
  return p.toString();
}

/** GET `/v1/files/presigned-url` with `PresignDownloadRequest` as query params. */
export async function getPresignDownloadList(params: PresignDownloadRequest) {
  const qs = buildPresignQueryString(params);
  return getApi<unknown>(documentApi2, `${PRESIGN_PATH}?${qs}`);
}
