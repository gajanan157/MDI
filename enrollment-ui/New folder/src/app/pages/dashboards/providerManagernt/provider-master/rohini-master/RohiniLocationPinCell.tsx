import { MapPinIcon } from "@heroicons/react/24/outline";
import type { TFunction } from "i18next";
import { toFiniteNumber } from "./config";

export function RohiniLocationPinCell({
  latitude,
  longitude,
  className,
  onOpenMap,
  t,
}: Readonly<{
  latitude?: number | string | null;
  longitude?: number | string | null;
  className?: string;
  onOpenMap?: (latitude: number, longitude: number) => void;
  t: TFunction;
}>) {
  const lat = toFiniteNumber(latitude);
  const lon = toFiniteNumber(longitude);

  if (lat === null || lon === null) {
    return <span className="text-slate-400">—</span>;
  }

  const href = `https://www.openstreetmap.org/#map=18/${lat}/${lon}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={t("providerMaster.rohiniMaster.openMapFor", {
        coords: `${lat}, ${lon}`,
      })}
      title={t("providerMaster.rohiniMaster.viewOnMap", {
        coords: `${lat}, ${lon}`,
      })}
      onClick={(event) => {
        event.stopPropagation();
        if (onOpenMap) {
          event.preventDefault();
          onOpenMap(lat, lon);
        }
      }}
      className={[
        "inline-flex cursor-pointer items-center justify-center text-primary-700",
        "hover:text-primary-800",
        className ?? "",
      ].join(" ")}
    >
      <MapPinIcon className="h-4 w-4" />
    </a>
  );
}
