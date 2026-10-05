import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { PDFDocument, degrees } from "pdf-lib";
import type { BankDocumentPreview } from "../utils/bankDetailsHelpers";
import { isPdfUrl } from "../utils/bankDetailsHelpers";

type BankDocumentPreviewPanelProps = {
  preview: BankDocumentPreview;
  alt: string;
  fillSlot?: boolean;
  /**
   * When true (edit mode), preview media ignores pointer events so the parent
   * slot can open file replace — toolbar clicks still stopPropagation.
   */
  allowReplaceClick?: boolean;
};

function isPdfPreview(preview: BankDocumentPreview): boolean {
  return (
    preview.isPdf ||
    isPdfUrl(preview.url) ||
    isPdfUrl(preview.fileName ?? "")
  );
}

function withPdfViewerHash(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const withoutHash = trimmed.split("#")[0] ?? trimmed;
  return `${withoutHash}#toolbar=0&navpanes=0&view=FitH`;
}

/**
 * The stored document lives on the object store (mdiminio…:9000), an origin the
 * page's CSP `frame-src` / `img-src` does not allow to be embedded directly.
 * Fetch it and hand the viewer a same-document `blob:` URL, which the CSP does
 * allow. Requires the object store to permit a cross-origin GET (CORS).
 */
async function fetchDocumentBytes(sourceUrl: string): Promise<ArrayBuffer> {
  const response = await fetch(sourceUrl, { credentials: "omit" });
  if (!response.ok) throw new Error(`Failed to load document (${response.status})`);
  return response.arrayBuffer();
}

async function buildPdfObjectUrl(
  sourceUrl: string,
  rotation: number,
): Promise<string> {
  const bytes = await fetchDocumentBytes(sourceUrl);
  const angle = ((rotation % 360) + 360) % 360;
  if (angle === 0) {
    return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  }
  const pdfDoc = await PDFDocument.load(bytes);
  for (const page of pdfDoc.getPages()) {
    page.setRotation(degrees(angle));
  }
  const pdfBytes = await pdfDoc.save();
  return URL.createObjectURL(
    new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
  );
}

function useViewportSize(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return { ref, size };
}

/**
 * Zoom/rotate toolbar always available.
 * In edit mode, toolbar clicks do not open file explorer; clicking the
 * document area (or drop) still replaces the file.
 */
export function BankDocumentPreviewPanel({
  preview,
  alt,
  fillSlot = false,
  allowReplaceClick = false,
}: Readonly<BankDocumentPreviewPanelProps>) {
  const heightClass = fillSlot
    ? "h-full min-h-0 max-h-full w-full"
    : "h-full min-h-0 w-full";
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [pdfSrc, setPdfSrc] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const ownedPdfUrlRef = useRef<string | null>(null);
  const ownedImageUrlRef = useRef<string | null>(null);

  const previewUrl = preview.url.trim();
  const showAsPdf = isPdfPreview(preview);
  const prevUrlRef = useRef(previewUrl);
  const { ref: viewportRef, size: viewport } = useViewportSize(Boolean(previewUrl));

  useEffect(() => {
    if (prevUrlRef.current === previewUrl) return;
    prevUrlRef.current = previewUrl;
    setZoom(1);
    setRotation(0);
    setImageFailed(false);
    setPreviewFailed(false);
  }, [previewUrl]);

  useEffect(() => {
    if (!showAsPdf || !previewUrl) {
      setPdfSrc("");
      return;
    }

    let cancelled = false;
    if (ownedPdfUrlRef.current) {
      URL.revokeObjectURL(ownedPdfUrlRef.current);
      ownedPdfUrlRef.current = null;
    }
    setPdfSrc("");

    buildPdfObjectUrl(previewUrl, rotation)
      .then((objectUrl) => {
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        ownedPdfUrlRef.current = objectUrl;
        setPdfSrc(withPdfViewerHash(objectUrl));
      })
      .catch(() => {
        if (!cancelled) setPreviewFailed(true);
      });

    return () => {
      cancelled = true;
      if (ownedPdfUrlRef.current) {
        URL.revokeObjectURL(ownedPdfUrlRef.current);
        ownedPdfUrlRef.current = null;
      }
    };
  }, [previewUrl, rotation, showAsPdf]);

  useEffect(() => {
    if (showAsPdf || !previewUrl) {
      setImageSrc("");
      return;
    }

    let cancelled = false;
    if (ownedImageUrlRef.current) {
      URL.revokeObjectURL(ownedImageUrlRef.current);
      ownedImageUrlRef.current = null;
    }
    setImageSrc("");

    fetchDocumentBytes(previewUrl)
      .then((bytes) => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(new Blob([bytes]));
        ownedImageUrlRef.current = objectUrl;
        setImageSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setImageFailed(true);
      });

    return () => {
      cancelled = true;
      if (ownedImageUrlRef.current) {
        URL.revokeObjectURL(ownedImageUrlRef.current);
        ownedImageUrlRef.current = null;
      }
    };
  }, [previewUrl, showAsPdf]);

  const pdfStyle = useMemo(
    (): CSSProperties => ({
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      border: 0,
      background: "#fff",
      transform: `scale(${zoom})`,
      transformOrigin: "center center",
      // Edit: clicks pass through to the replace slot.
      pointerEvents: allowReplaceClick ? "none" : "auto",
    }),
    [allowReplaceClick, zoom],
  );

  const imageStyle = useMemo((): CSSProperties => {
    const sideways = rotation % 180 !== 0;
    const width = sideways ? viewport.height : viewport.width;
    const height = sideways ? viewport.width : viewport.height;
    return {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: width || "100%",
      height: height || "100%",
      maxWidth: "none",
      maxHeight: "none",
      objectFit: "contain",
      transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${zoom})`,
      transformOrigin: "center center",
      pointerEvents: allowReplaceClick ? "none" : "auto",
    };
  }, [allowReplaceClick, rotation, zoom, viewport.height, viewport.width]);

  if (!previewUrl) return null;

  return (
    <div className={`${heightClass} flex min-h-0 flex-col overflow-hidden rounded border border-slate-200 bg-white`}>
      <div
        className="flex h-7 shrink-0 items-center justify-center gap-2 bg-slate-800 px-2 text-[11px] text-slate-100"
        role="toolbar"
        aria-label="Document preview controls"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="rounded px-1.5 leading-none hover:bg-slate-700 disabled:opacity-40"
          aria-label="Zoom out"
          disabled={zoom <= 0.5}
          onClick={(event) => {
            event.stopPropagation();
            setZoom((v) => Math.max(0.5, Number((v - 0.1).toFixed(1))));
          }}
        >
          −
        </button>
        <span className="min-w-[2.5rem] text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          className="rounded px-1.5 leading-none hover:bg-slate-700 disabled:opacity-40"
          aria-label="Zoom in"
          disabled={zoom >= 2}
          onClick={(event) => {
            event.stopPropagation();
            setZoom((v) => Math.min(2, Number((v + 0.1).toFixed(1))));
          }}
        >
          +
        </button>
        <span className="mx-0.5 h-3 w-px bg-slate-600" aria-hidden />
        <button
          type="button"
          className="rounded p-0.5 hover:bg-slate-700"
          aria-label="Rotate 90 degrees"
          title="Rotate"
          onClick={(event) => {
            event.stopPropagation();
            setRotation((v) => (v + 90) % 360);
          }}
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-slate-100"
      >
        {showAsPdf ? (
          previewFailed ? (
            <p className="flex h-full items-center justify-center px-4 text-center text-[11px] text-slate-500">
              Preview unavailable. Open the document from the Documents tab.
            </p>
          ) : pdfSrc ? (
            <iframe key={pdfSrc} src={pdfSrc} title={alt} style={pdfStyle} />
          ) : (
            <p className="flex h-full items-center justify-center text-[11px] text-slate-500">
              Loading…
            </p>
          )
        ) : imageFailed ? (
          <p className="flex h-full items-center justify-center px-4 text-center text-[11px] text-slate-500">
            Preview unavailable. Open the document from the Documents tab.
          </p>
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            style={imageStyle}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <p className="flex h-full items-center justify-center text-[11px] text-slate-500">
            Loading…
          </p>
        )}
      </div>
    </div>
  );
}
