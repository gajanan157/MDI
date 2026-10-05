import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { Checkbox } from "@/components/ui";
import type { SocVersionItem } from "../data/socListData";
import { SOC_LINK_CLASS, SOC_DETAIL_ROW_CARD_BODY_CLASS, SOC_VERSION_HISTORY_PREVIEW_COUNT } from "../utils/socDetailTheme";
import { SocIconCard } from "./SocIconCard";

type SocVersionHistoryCardProps = {
  versions: SocVersionItem[];
  isSocViewMode: boolean;
  activeVersionId?: string;
  onSetActiveVersion: (item: SocVersionItem) => void;
  onPreviewVersion: (item: SocVersionItem) => void;
  className?: string;
  canWrite: boolean;
  uploadPanel: React.ReactNode;
};

function SocVersionFileRow({
  version,
  isActive,
  isSocViewMode,
  onSetActive,
  onPreview,
  labels,
}: Readonly<{
  version: SocVersionItem;
  isActive: boolean;
  isSocViewMode: boolean;
  onSetActive: () => void;
  onPreview: () => void;
  labels: {
    active: string;
    openInNewTab: string;
    viewInNewTab: string;
    openDocument: string;
    openNamed: string;
    activeSoc: string;
  };
}>) {
  if (isSocViewMode) {
    return (
      <div
        className={`flex items-center gap-2 py-2 ${isActive ? "bg-primary-50/40" : ""}`}
      >
        <button
          type="button"
          onClick={onPreview}
          className={`min-w-0 flex-1 truncate text-left ${SOC_LINK_CLASS}`}
          title={version.name}
        >
          {version.name}
        </button>
        {isActive ? (
          <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            {labels.active}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => window.open(version.url, "_blank", "noopener,noreferrer")}
          className="shrink-0 rounded p-1 text-primary-600 hover:bg-slate-100"
          title={labels.openInNewTab}
          aria-label={labels.viewInNewTab}
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 py-1.5">
      <Checkbox
        checked={isActive}
        onChange={onSetActive}
        aria-label={labels.activeSoc}
        classNames={{ input: "h-4 w-4 shrink-0" }}
      />
      <p
        className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-900"
        title={version.name}
      >
        {version.name}
      </p>
      <button
        type="button"
        onClick={() => window.open(version.url, "_blank", "noopener,noreferrer")}
        className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        title={labels.openDocument}
        aria-label={labels.openNamed}
      >
        <PencilSquareIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SocVersionHistoryCard({
  versions,
  isSocViewMode,
  activeVersionId,
  onSetActiveVersion,
  onPreviewVersion,
  className,
  canWrite,
  uploadPanel,
}: Readonly<SocVersionHistoryCardProps>) {
  const { t } = useTranslation();
  const VH = "providerMaster.soc.versionHistory";
  const [listExpanded, setListExpanded] = useState(false);
  const hasMoreVersions = versions.length > SOC_VERSION_HISTORY_PREVIEW_COUNT;

  const rowLabels = useMemo(
    () => ({
      active: t(`${VH}.active`),
      openInNewTab: t(`${VH}.openInNewTab`),
      openDocument: t(`${VH}.openDocument`),
      viewInNewTab: (name: string) => t(`${VH}.viewInNewTab`, { name }),
      openNamed: (name: string) => t(`${VH}.openNamed`, { name }),
      activeSoc: (name: string) => t(`${VH}.activeSoc`, { name }),
    }),
    [t],
  );

  const visibleVersions = useMemo(() => {
    if (!isSocViewMode || listExpanded || !hasMoreVersions) {
      return versions;
    }
    return versions.slice(0, SOC_VERSION_HISTORY_PREVIEW_COUNT);
  }, [hasMoreVersions, isSocViewMode, listExpanded, versions]);

  return (
    <SocIconCard
      title={t(`${VH}.title`)}
      icon={<ClockIcon className="h-3.5 w-3.5" aria-hidden />}
      iconWrapClassName="bg-violet-100 text-violet-700"
      className={className}
      bodyClassName={SOC_DETAIL_ROW_CARD_BODY_CLASS}
    >
      {canWrite && !isSocViewMode ? (
        <div className="shrink-0">{uploadPanel}</div>
      ) : null}

      {versions.length === 0 ? (
        canWrite && !isSocViewMode ? null : (
          <p className="px-0.5 py-1 text-[10px] text-slate-500">
            {t(`${VH}.noDocument`)}
          </p>
        )
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className={isSocViewMode ? "divide-y divide-slate-200/80" : "space-y-0"}>
            {visibleVersions.map((v) => {
              const isActive = isSocViewMode ? v.active : activeVersionId === v.id;
              return (
                <SocVersionFileRow
                  key={v.id}
                  version={v}
                  isActive={isActive}
                  isSocViewMode={isSocViewMode}
                  onSetActive={() => onSetActiveVersion(v)}
                  onPreview={() => onPreviewVersion(v)}
                  labels={{
                    active: rowLabels.active,
                    openInNewTab: rowLabels.openInNewTab,
                    openDocument: rowLabels.openDocument,
                    viewInNewTab: rowLabels.viewInNewTab(v.name),
                    openNamed: rowLabels.openNamed(v.name),
                    activeSoc: rowLabels.activeSoc(v.name),
                  }}
                />
              );
            })}
          </div>

          {isSocViewMode && hasMoreVersions ? (
            <button
              type="button"
              className="mt-1 text-left text-[11px] font-medium text-primary-600 hover:underline"
              onClick={() => setListExpanded((open) => !open)}
            >
              {listExpanded ? t(`${VH}.showFewer`) : t(`${VH}.viewAll`)}
            </button>
          ) : null}
        </div>
      )}
    </SocIconCard>
  );
}
