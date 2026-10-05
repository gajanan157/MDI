import { ProviderBusyOverlay } from "../../../shared/ProviderBusyOverlay";

/** Full-screen overlay while an export/download is in progress (reuses provider-management overlay). */
export default function ExportLoader() {
  return <ProviderBusyOverlay open message="Preparing export…" />;
}
