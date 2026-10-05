import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { getKeycloakToken } from "@/app/contexts/keycloak/KeycloakProvider";
import { Button } from "@/components/ui";
import { downloadBlobFile } from "@/utils/dom/downloadBlobFile";
import type { UploadResultDialogProps } from "./UploadResultDialog.types";

function toAbsoluteUrl(raw: string): string {
  const u = raw.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return new URL(u, window.location.origin).toString();
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8 = /filename\*=(?:UTF-8'')?([^;\n]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim().replace(/^["']|["']$/g, ""));
    } catch {
      return utf8[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  const ascii = /filename=(?:"([^"]+)"|([^;\s]+))/i.exec(header);
  const name = ascii?.[1] ?? ascii?.[2];
  return name?.trim() ?? null;
}

/**
 * Polished result dialog for upload flows.
 * Extracted from Rohini Master page so it can be reused elsewhere.
 */
export default function UploadResultDialog({
  open,
  onClose,
  title,
  message,
  statCards,
  doneLabel = "Ok",
  downloadUrl,
  downloadFileName,
  downloadButtonLabel = "Download",
}: UploadResultDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const hasDownloadedRef = useRef(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cards = statCards ?? [];

  const hasDownloadGate = Boolean(downloadUrl?.trim());

  useEffect(() => {
    if (!open) {
      hasDownloadedRef.current = false;
      setShowCloseWarning(false);
      setIsDownloading(false);
    }
  }, [open]);

  const finishClose = () => {
    setShowCloseWarning(false);
    onClose();
  };

  const handleCloseAttempt = () => {
    if (showCloseWarning) {
      setShowCloseWarning(false);
      return;
    }
    if (hasDownloadGate && !hasDownloadedRef.current) {
      setShowCloseWarning(true);
      return;
    }
    finishClose();
  };

  const handleDownload = async () => {
    const url = downloadUrl?.trim();
    if (!url || isDownloading) return;

    const token = getKeycloakToken();
    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    setIsDownloading(true);
    try {
      const res = await fetch(toAbsoluteUrl(url), {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Download failed (${res.status})`);
      }

      const blob = await res.blob();
      const filename =
        downloadFileName?.trim() ||
        filenameFromContentDisposition(res.headers.get("Content-Disposition")) ||
        "download";

      downloadBlobFile({ blob, filename });
      hasDownloadedRef.current = true;
    } catch (e) {
      console.error("Upload result download failed:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const cardToneClass = (tone: string | undefined) => {
    switch (tone) {
      case "blue":
        return {
          wrapper: "border border-blue-100 bg-blue-50/80 px-4 py-4",
          label: "text-[11px] font-medium uppercase tracking-wider text-blue-600",
          value: "mt-1 text-xl font-bold tabular-nums text-blue-700",
        };
      case "total":
        return {
          wrapper: "rounded-xl border border-gray-200 bg-gray-100/80 px-4 py-4",
          label:
            "text-[11px] font-medium uppercase tracking-wider text-gray-600",
          value: "mt-1 text-xl font-bold tabular-nums text-gray-900",
        };
      case "gray":
      default:
        return {
          wrapper: "rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-4",
          label:
            "text-[11px] font-medium uppercase tracking-wider text-gray-500",
          value: "mt-1 text-xl font-bold tabular-nums text-gray-900",
        };
    }
  };

  return (
    <Transition appear show={open}>
      <Dialog
        as="div"
        className="relative z-[60]"
        onClose={handleCloseAttempt}
        initialFocus={closeBtnRef}
      >
        <TransitionChild
          as="div"
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as="div"
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="relative w-full max-w-md rounded-2xl border border-gray-200/80 bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleCloseAttempt}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <div className="px-8 pt-8 pb-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-100/80">
                  <CheckCircleIcon className="h-9 w-9 text-emerald-600" />
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {message}
                </p>

                {hasDownloadGate && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-left">
                    <p className="text-xs font-medium text-amber-900">
                      Download link (use Download before closing — if you close without
                      downloading, you will not be able to download again from here.)
                    </p>
                    {/* {downloadFileName?.trim() ? (
                      <p className="mt-2 text-left text-xs font-medium text-gray-800">
                        File: <span className="font-mono">{downloadFileName.trim()}</span>
                      </p>
                    ) : null}
                    <p className="mt-2 break-all text-left font-mono text-[11px] leading-snug text-gray-700">
                      {downloadUrl}
                    </p> */}
                    <Button
                      type="button"
                      color="primary"
                      variant="filled"
                      disabled={isDownloading}
                      className="mt-3 w-full !bg-blue-600 !text-white hover:!bg-blue-700 focus:!bg-blue-700 shadow-md disabled:opacity-60"
                      onClick={() => {
                        handleDownload().catch(() => {});
                      }}
                    >
                      {isDownloading ? "Downloading…" : downloadButtonLabel}
                    </Button>
                  </div>
                )}

                {cards.length > 0 && (
                  <>
                    <div className="mt-6 h-px bg-gray-100" />
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {cards.map((card, idx) => {
                        const tone = card.tone ?? "gray";
                        const cls = cardToneClass(tone);
                        return (
                          <div key={`${card.label}-${idx}`} className={cls.wrapper}>
                            <p className={cls.label}>{card.label}</p>
                            <p className={cls.value}>{card.value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* When a download URL is shown, only Download + ✕ (warning if closing without download). */}
                {!hasDownloadGate && (
                  <Button
                    type="button"
                    variant="filled"
                    className="mt-6 w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600"
                    onClick={handleCloseAttempt}
                  >
                    {doneLabel}
                  </Button>
                )}

                {/* Inside DialogPanel so Headless UI does not treat clicks as "outside" the panel. */}
                {showCloseWarning && (
                  <div
                    className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-black/50 p-4"
                    role="presentation"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setShowCloseWarning(false);
                    }}
                  >
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="upload-close-warning-title"
                      className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-xl"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h4
                        id="upload-close-warning-title"
                        className="text-sm font-semibold text-gray-900"
                      >
                        Close without downloading?
                      </h4>
                      <p className="mt-2 text-sm text-gray-600">
                        If you close now without using Download, you will not be able to
                        download this file again from this dialog.
                      </p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outlined"
                          color="primary"
                          className="w-full sm:w-auto"
                          onClick={() => setShowCloseWarning(false)}
                        >
                          Go back
                        </Button>
                        <Button
                          type="button"
                          color="neutral"
                          variant="filled"
                          className="w-full !bg-slate-800 !text-white hover:!bg-slate-900 sm:w-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            finishClose();
                          }}
                        >
                          Close anyway
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
