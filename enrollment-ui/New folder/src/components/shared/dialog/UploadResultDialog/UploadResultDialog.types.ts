export type UploadResultStatTone = "gray" | "blue" | "total";

export type UploadResultStatCard = {
  label: string;
  value: number;
  /**
   * Controls card styling to match different upload outcomes.
   * - "gray": neutral counts
   * - "blue": "new added"/success counts (blue tone)
   * - "total": totals (slightly different neutral tone)
   */
  tone?: UploadResultStatTone;
};

export type UploadResultDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /**
   * Optional count cards (supports different shapes like
   * alreadyExist/newAdded/total for Rohini and exclude/newAdded/total for others).
   */
  statCards?: UploadResultStatCard[] | null;
  doneLabel?: string;
  /**
   * When set, shows the URL and a Download action. Closing without downloading
   * first triggers a confirmation (one-time download warning).
   */
  downloadUrl?: string | null;
  /** Friendly name (e.g. API `data.errorFileName`). */
  downloadFileName?: string | null;
  downloadButtonLabel?: string;
};

