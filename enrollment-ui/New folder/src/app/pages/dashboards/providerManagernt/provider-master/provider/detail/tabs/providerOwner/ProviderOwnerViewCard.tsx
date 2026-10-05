import {
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { PROVIDER_ACTION_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { createProviderOwnerFieldLabels } from "../../../../../shared/providerMasterI18n";
import { DETAIL_ROW_EMPTY_PLACEHOLDER } from "../../shared/DetailRow";
import type { NormalizedProviderOwner } from "@/store/features/providerOwner/providerOwnerTypes";

const OWNER_CARD_CLASS =
  "overflow-hidden rounded-lg border border-l-[3px] border-l-blue-600 border-slate-300/85 bg-white px-2 py-1 shadow-sm ring-1 ring-slate-900/[0.05]";

const OWNER_SECTION_CLASS =
  "min-w-0 flex-1 overflow-hidden rounded border border-slate-300/85 bg-white";

function joinValues(values: string[]): string {
  if (values.length === 0) return "";
  return values.join(", ");
}

function readOwnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "O";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function readDisplayValue(value?: string | number): string {
  if (value == null) return DETAIL_ROW_EMPTY_PLACEHOLDER;
  const trimmed = String(value).trim();
  return trimmed || DETAIL_ROW_EMPTY_PLACEHOLDER;
}

type OwnerDetailRowProps = {
  label: string;
  value?: string | number;
  valueClassName?: string;
};

function OwnerDetailRow({ label, value, valueClassName }: Readonly<OwnerDetailRowProps>) {
  const display = readDisplayValue(value);

  return (
    <div className="flex flex-row border-b border-slate-200/80 text-[10px] last:border-0">
      <dt className="w-[42%] shrink-0 bg-gray-100 px-1 py-0.5 font-bold text-gray-700">{label}</dt>
      <dd
        className={`w-[58%] min-w-0 truncate bg-white px-1 py-0.5 ${valueClassName ?? "text-gray-900"}`}
        title={display}
      >
        {display}
      </dd>
    </div>
  );
}

type OwnerSectionProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

function OwnerSection({ title, icon, children }: Readonly<OwnerSectionProps>) {
  return (
    <section className={OWNER_SECTION_CLASS}>
      <div className="flex items-center gap-1 bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
        <span className="inline-flex h-3.5 w-3.5 items-center justify-center text-gray-600" aria-hidden>
          {icon}
        </span>
        {title}
      </div>
      <dl>{children}</dl>
    </section>
  );
}

type ProviderOwnerViewCardProps = {
  owner: NormalizedProviderOwner;
  canWrite: boolean;
  onEdit: () => void;
};

export function ProviderOwnerViewCard({
  owner,
  canWrite,
  onEdit,
}: Readonly<ProviderOwnerViewCardProps>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createProviderOwnerFieldLabels(t), [t]);
  const ownerName = owner.providerOwnerName.trim() || DETAIL_ROW_EMPTY_PLACEHOLDER;

  return (
    <article className={OWNER_CARD_CLASS}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
            {readOwnerInitials(ownerName)}
          </div>
          <h3 className="truncate text-xs font-semibold text-slate-900">{ownerName}</h3>
        </div>
        {canWrite ? (
          <Button
            type="button"
            variant="outlined"
            className={`${PROVIDER_ACTION_BUTTON_CLASS} shrink-0 cursor-pointer text-blue-700 hover:bg-blue-50`}
            onClick={onEdit}
          >
            <PencilSquareIcon className="h-3 w-3" />
            {t("providerMaster.common.edit")}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 lg:flex-row lg:items-start">
        <OwnerSection title={labels.details} icon={<UserIcon className="h-3.5 w-3.5" />}>
          <OwnerDetailRow label={labels.designation} value={owner.providerOwnerDesignation} />
          <OwnerDetailRow label={labels.qualification} value={owner.providerOwnerQualification} />
          <OwnerDetailRow label={labels.gender} value={owner.providerOwnerGender} />
        </OwnerSection>

        <OwnerSection title={labels.contact} icon={<PhoneIcon className="h-3.5 w-3.5" />}>
          <OwnerDetailRow label={labels.telePhoneNo} value={joinValues(owner.providerOwnerTelephone)} />
          <OwnerDetailRow label={labels.mobNo} value={joinValues(owner.providerOwnerMobile)} />
          <OwnerDetailRow label={labels.email} value={joinValues(owner.providerOwnerEmailId)} />
        </OwnerSection>

        <OwnerSection title={labels.addressSection} icon={<MapPinIcon className="h-3.5 w-3.5" />}>
          <OwnerDetailRow label={labels.address} value={owner.providerOwnerAddress} />
          <OwnerDetailRow label={labels.city} value={owner.providerOwnerCity} />
          <OwnerDetailRow label={labels.state} value={owner.providerOwnerState} />
          <OwnerDetailRow label={labels.pinCode} value={owner.providerOwnerPincode} />
        </OwnerSection>
      </div>
    </article>
  );
}
