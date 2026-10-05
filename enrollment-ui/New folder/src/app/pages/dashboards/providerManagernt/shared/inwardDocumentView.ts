export const INWARD_DOCUMENT_VIEW_PATH_PREFIX = "/inward-management/view-inward-document";

export function buildInwardDocumentViewPath(inwardNo: string): string {
  return `${INWARD_DOCUMENT_VIEW_PATH_PREFIX}/${encodeURIComponent(inwardNo.trim())}`;
}

export type InwardDocumentNavState = {
  returnPath: string;
};
