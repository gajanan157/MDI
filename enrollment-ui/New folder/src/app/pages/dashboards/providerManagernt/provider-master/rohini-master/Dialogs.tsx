import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  ProviderBusyOverlay,
  ViewDialog,
} from "../../shared/providerShell";
import type { FieldItem } from "@/components/shared/dialog/ViewDialog/ViewDialog.types";
import CreateCorporateInwardModal from "../../../enrollmentsystem/dashboard/components/CreateCorporateInwardModal";
import FileActivityLogDialog from "../../shared/FileActivityLogDialog";
import { ROHINI_S3_SUB_BUCKET, toFiniteNumber } from "./config";

type RohiniLocationMapDialogProps = {
  open: boolean;
  onClose: () => void;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

function RohiniLocationMapDialog({
  open,
  onClose,
  latitude,
  longitude,
}: Readonly<RohiniLocationMapDialogProps>) {
  const { t } = useTranslation();
  const lat = toFiniteNumber(latitude);
  const lon = toFiniteNumber(longitude);

  const [mapContainerEl, setMapContainerEl] = useState<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const setMapContainerRef = useCallback((node: HTMLDivElement | null) => {
    setMapContainerEl(node);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let sizeTimer: ReturnType<typeof setTimeout> | null = null;

    if (!open) {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      return;
    }

    if (!mapContainerEl || lat === null || lon === null) return;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapContainerEl) return;

      const markerIconInstance = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      mapRef.current?.remove();
      const map = L.map(mapContainerEl, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([lat, lon], 18);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker([lat, lon], { icon: markerIconInstance }).addTo(map);

      mapRef.current = map;
      markerRef.current = marker;

      sizeTimer = setTimeout(() => {
        if (!cancelled) map.invalidateSize();
      }, 260);
    })();

    return () => {
      cancelled = true;
      if (sizeTimer) clearTimeout(sizeTimer);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [open, lat, lon, mapContainerEl]);

  useEffect(() => {
    if (!open || lat === null || lon === null || !mapRef.current) return;
    mapRef.current.setView([lat, lon], 18);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    }
  }, [open, lat, lon]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-slate-900/10">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <Dialog.Title className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    {t("providerMaster.rohiniMaster.locationDialogTitle")}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {t("providerMaster.rohiniMaster.close")}
                  </button>
                </div>
                <div className="relative">
                  {lat === null || lon === null ? (
                    <div className="min-h-[260px] px-4 py-8 text-center text-sm text-slate-500">
                      {t("providerMaster.rohiniMaster.noCoordinates")}
                    </div>
                  ) : (
                    <div
                      ref={setMapContainerRef}
                      className="h-[420px] w-full"
                      aria-label={t("providerMaster.rohiniMaster.mapAriaLabel")}
                    />
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

type RohiniMasterDialogsProps = {
  canWrite: boolean;
  activityLogOpen: boolean;
  onCloseActivityLog: () => void;
  isViewOpen: boolean;
  onCloseView: () => void;
  viewDialogFields: FieldItem[];
  isLocationMapOpen: boolean;
  onCloseLocationMap: () => void;
  locationLatitude?: number;
  locationLongitude?: number;
  busy: boolean;
  createInwardOpen: boolean;
  onCloseCreateInward: () => void;
  onRohiniUploadSuccess?: () => void;
};

export function RohiniMasterDialogs({
  canWrite,
  activityLogOpen,
  onCloseActivityLog,
  isViewOpen,
  onCloseView,
  viewDialogFields,
  isLocationMapOpen,
  onCloseLocationMap,
  locationLatitude,
  locationLongitude,
  busy,
  createInwardOpen,
  onCloseCreateInward,
  onRohiniUploadSuccess,
}: Readonly<RohiniMasterDialogsProps>) {
  const { t } = useTranslation();

  return (
    <>
      <ViewDialog
        isOpen={isViewOpen}
        onClose={onCloseView}
        title={t("providerMaster.rohiniMaster.viewDetails")}
        fields={viewDialogFields}
        gridColumns={3}
        panelClassName="max-w-5xl"
      />

      <RohiniLocationMapDialog
        open={isLocationMapOpen}
        onClose={onCloseLocationMap}
        latitude={locationLatitude}
        longitude={locationLongitude}
      />

      <FileActivityLogDialog
        open={activityLogOpen}
        onClose={onCloseActivityLog}
        title={t("providerMaster.rohiniMaster.versionLog")}
        s3SubBucketName={ROHINI_S3_SUB_BUCKET}
        canDownload={canWrite}
      />

      <ProviderBusyOverlay open={busy} />

      {createInwardOpen && (
        <CreateCorporateInwardModal
          open={createInwardOpen}
          onClose={onCloseCreateInward}
          isRohini
          onRohiniUploadSuccess={onRohiniUploadSuccess}
        />
      )}
    </>
  );
}
