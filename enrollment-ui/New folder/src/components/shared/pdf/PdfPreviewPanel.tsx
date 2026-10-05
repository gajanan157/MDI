import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  CheckBadgeIcon,
  PrinterIcon,
  PencilIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { Drawer } from "@/components/ui/Drawer";

/**
 * Simplified PdfPreviewPanel for Operations review:
 * - Supports upload / replace / download (controlled by user role)
 * - Approve (Operations) which sets status -> "ready_for_compliance"
 * - Request changes (triggers onNotifyCompliance callback)
 * - No comments UI, no audit trail
 *
 * Props:
 * - currentUser?: { id: string; name: string; role?: string }  // role e.g. "operations", "compliance", "admin"
 * - docType?: string                                         // e.g. "Addendum", ...
 * - mode?: "default" | "operations-review"                   // operations-review disables editing for non-ops
 * - demoMode?: boolean                                        // simulate upload locally
 *
 * Callbacks:
 * - onDocChange(doc)
 * - onApprove(approved)
 * - onNotifyCompliance(doc, remark)
 * - onStatusChange(status)
 *
 * NOTE: This is intentionally minimal; wire your backend endpoints to upload/replace/delete as needed.
 */

type RemoteDoc = {
  id?: string;
  name?: string;
  url?: string;
  approved?: boolean;
  uploadedAt?: string;
  sizeBytes?: number;
  status?: string;
};

type Props = {
  existingDoc?: RemoteDoc | null;
  onDocChange?: (doc: RemoteDoc | null) => void;
  onApprove?: (approved: boolean) => void;
  className?: string;
  currentUser?: { id: string; name: string; role?: string } | null;
  mode?: "default" | "operations-review";
  onStatusChange?: (status: string) => void;
};

function extOf(name?: string | null): string {
  if (!name) return "";
  const cleaned = name.split("?")[0].split("/").pop() ?? "";
  const parts = cleaned.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export default function PdfPreviewPanelSimple({
  existingDoc = null,
  onDocChange,
  onApprove,
  className,
  currentUser = null,
  mode = "default",
  onStatusChange,
}: Props) {
  const [remoteDoc, setRemoteDoc] = useState<RemoteDoc | null>(existingDoc ?? null);
  const [previewSource, setPreviewSource] = useState<string | null>(existingDoc?.url ?? null);
  const [previewName, setPreviewName] = useState<string | null>(existingDoc?.name ?? null);
  const [approved, setApproved] = useState<boolean>(existingDoc?.approved ?? false);
  const [page] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setRemoteDoc(existingDoc ?? null);
    setApproved(existingDoc?.approved ?? false);
    setPreviewName(existingDoc?.name ?? null);
    setPreviewSource(existingDoc?.url ?? null);
  }, [existingDoc]);

  const fileType = useMemo(() => {
    const ext = extOf(previewName ?? remoteDoc?.name ?? previewSource ?? undefined);
    if (!ext) return "unknown";
    if (["pdf"].includes(ext)) return "pdf";
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
    if (["txt"].includes(ext)) return "text";
    return "other";
  }, [previewSource, previewName, remoteDoc]);

  const pdfSrcWithPage = useMemo(() => {
    if (!previewSource) return null;
    if (fileType !== "pdf") return previewSource;
    if (previewSource.includes("#")) return `${previewSource}&page=${page}`;
    return `${previewSource}#toolbar=0&page=${page}`;
  }, [previewSource, page, fileType]);

  const canEdit = useMemo(() => {
    // role-based: only allow upload/replace/remove for admin or uploader roles (customize as needed)
    const role = currentUser?.role?.toLowerCase() ?? "";
    if (mode === "operations-review") {
      // operations-review mode: disable upload/replace for non-admin
      return role === "admin" || role === "uploader";
    }
    return role === "admin" || role === "uploader";
  }, [currentUser, mode]);

  const isOperations = currentUser?.role?.toLowerCase() === "operations";

  // Operations approve: only operations role can mark ready_for_compliance
  const handleApproveOps = () => {
    if (!isOperations) return alert("Only Operations role can approve for Ops.");
    const updated = { ...(remoteDoc ?? {}), status: "ready_for_compliance", approved: true };
    setRemoteDoc(updated);
    setApproved(true);
    onDocChange?.(updated);
    onApprove?.(true);
    onStatusChange?.("ready_for_compliance");
    alert("Marked Ready for Compliance Approval.");
  };


  // Annotation canvas is present but disabled in operations-review (read-only)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [previewSource]);

  // lightweight pointer handlers for simple sketch (but disabled in operations-review mode)
  const [penEnabled, setPenEnabled] = useState(false);
  const [eraserEnabled, setEraserEnabled] = useState(false);
  const [strokeSize, setStrokeSize] = useState(3);
  const [color, setColor] = useState("#ff0000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [, setStrokes] = useState<ImageData[]>([]);

  const getCanvasCtx = (): CanvasRenderingContext2D | null => {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  };

  const pointerToCanvas = (ev: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (("clientX" in ev ? ev.clientX : (ev as any).x) - rect.left) * (canvas.width / rect.width);
    const y = (("clientY" in ev ? ev.clientY : (ev as any).y) - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!penEnabled && !eraserEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const ctx = getCanvasCtx();
    if (ctx) {
      try {
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setStrokes((s) => [...s, snap]);
      } catch {}
      const { x, y } = pointerToCanvas(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = strokeSize;
      ctx.globalCompositeOperation = eraserEnabled ? "destination-out" : "source-over";
      ctx.strokeStyle = eraserEnabled ? "rgba(0,0,0,1)" : color;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const ctx = getCanvasCtx();
    if (!ctx) return;
    const { x, y } = pointerToCanvas(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(false);
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {}
    const ctx = getCanvasCtx();
    if (ctx) ctx.closePath();
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCanvasCtx();
    if (!ctx) return;
    setStrokes((s) => {
      const next = s.slice(0, -1);
      const last = next[next.length - 1];
      if (last) ctx.putImageData(last, 0, 0);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
      return next;
    });
  };

  const clearAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCanvasCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
  };


  return (
    <>
      <div className={`h-full flex flex-col bg-white ${className ?? ""}`}>
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {approved && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                Approved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {previewSource && (
              <>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                  title="Annotations"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(previewSource, "_blank")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const w = window.open(previewSource + "#toolbar=0", "_blank");
                    if (w) w.print();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <PrinterIcon className="w-4 h-4" />
                </button>

                {isOperations && (
                  <button
                    onClick={handleApproveOps}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    <CheckBadgeIcon className="w-4 h-4" />
                    Approve
                  </button>
                )}
              </>
            )}

            {canEdit && !previewSource && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
              >
                Choose File
              </button>
            )}
          </div>
        </div>

        {/* Body - PDF Viewer */}
        <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center relative overflow-hidden">
          <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 relative">
            {previewSource ? (
              <div
                ref={containerRef}
                className="relative w-full h-full"
              >
                <iframe
                  title={previewName ?? "pdf-preview"}
                  src={pdfSrcWithPage ?? previewSource}
                  className="w-full h-full border-0"
                />
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    pointerEvents: penEnabled || eraserEnabled ? "auto" : "none",
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <PencilIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  No document selected
                </h3>
                <p className="text-sm text-gray-600">
                  Select or upload a document to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Annotation Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Annotation Tools">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPenEnabled((p) => !p);
                if (!penEnabled) setEraserEnabled(false);
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                penEnabled
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <PencilIcon className="w-4 h-4" />
              Pen
            </button>
            <button
              onClick={() => {
                setEraserEnabled((e) => !e);
                if (!eraserEnabled) setPenEnabled(false);
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                eraserEnabled
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Eraser
            </button>
          </div>

          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <label className="text-xs font-semibold text-gray-700 block">
              Stroke Size: {strokeSize}px
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={strokeSize}
              onChange={(e) => setStrokeSize(Number(e.target.value || 1))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <label className="text-xs font-semibold text-gray-700 block">
              Pen Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border border-gray-300"
              />
              <div
                className="w-10 h-10 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          <div className="pt-2 space-y-2 border-t border-gray-200">
            <button
              onClick={undo}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              Undo Last
            </button>
            <button
              onClick={clearAnnotations}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
