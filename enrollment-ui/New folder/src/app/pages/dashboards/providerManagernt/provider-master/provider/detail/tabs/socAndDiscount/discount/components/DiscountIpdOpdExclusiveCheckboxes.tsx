import clsx from "clsx";
import { CheckIcon } from "@heroicons/react/24/solid";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { DiscountFormValues } from "../types/discountTypes";

type ServiceTypeKind = "ipd" | "opd";

type DiscountServiceTypeOptionProps = {
  form: UseFormReturn<DiscountFormValues>;
  kind: ServiceTypeKind;
  ipdEnabled: boolean;
  opdEnabled: boolean;
  onClearIpd?: () => void;
  onClearOpd?: () => void;
  className?: string;
};

const SERVICE_TYPE_TONES = {
  ipd: {
    chip: "bg-blue-100 text-blue-700",
    selectedCard: "border-blue-300 bg-blue-50 ring-1 ring-blue-200",
  },
  opd: {
    chip: "bg-emerald-100 text-emerald-700",
    selectedCard: "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200",
  },
} as const;

function ServiceTypeOptionCard({
  label,
  selected,
  tone,
  onToggle,
  className = "",
}: Readonly<{
  label: string;
  selected: boolean;
  tone: (typeof SERVICE_TYPE_TONES)[keyof typeof SERVICE_TYPE_TONES];
  onToggle: () => void;
  className?: string;
}>) {
  return (
    <label
      className={clsx(
        "flex h-8 min-w-0 w-full cursor-pointer items-center gap-1.5 rounded-sm border px-1.5 transition-all",
        selected
          ? tone.selectedCard
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80",
        className,
      )}
    >
      <span
        className={clsx(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border",
          selected ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-white",
        )}
        aria-hidden
      >
        {selected ? <CheckIcon className="h-2.5 w-2.5" /> : null}
      </span>
      <input type="checkbox" className="sr-only" checked={selected} onChange={onToggle} />
      <span
        className={clsx(
          "inline-flex min-w-0 cursor-pointer truncate rounded-sm px-1.5 py-0.5 text-[9px] font-medium leading-tight sm:text-[10px]",
          tone.chip,
        )}
        title={label}
      >
        {label}
      </span>
    </label>
  );
}

export function DiscountServiceTypeOption({
  form,
  kind,
  ipdEnabled,
  opdEnabled,
  onClearIpd,
  onClearOpd,
  className = "",
}: Readonly<DiscountServiceTypeOptionProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const selected = kind === "ipd" ? ipdEnabled : opdEnabled;

  const toggle = () => {
    if (kind === "ipd") {
      if (ipdEnabled) {
        form.setValue("ipdEnabled", false, { shouldDirty: true });
        form.setValue("ipdList", [], { shouldDirty: true });
        onClearIpd?.();
        return;
      }
      form.setValue("ipdEnabled", true, { shouldDirty: true });
      form.setValue("ipdList", [], { shouldDirty: true });
      onClearIpd?.();
      return;
    }

    if (opdEnabled) {
      form.setValue("opdEnabled", false, { shouldDirty: true });
      form.setValue("opdList", [], { shouldDirty: true });
      onClearOpd?.();
      return;
    }
    form.setValue("opdEnabled", true, { shouldDirty: true });
    form.setValue("opdList", [], { shouldDirty: true });
    onClearOpd?.();
  };

  return (
    <ServiceTypeOptionCard
      label={t(`${D}.${kind}`)}
      selected={selected}
      tone={SERVICE_TYPE_TONES[kind]}
      onToggle={toggle}
      className={className}
    />
  );
}

/** @deprecated Use DiscountServiceTypeOption in a grid layout instead. */
export function DiscountIpdOpdExclusiveCheckboxes({
  form,
  ipdEnabled,
  opdEnabled,
  onClearIpd,
  onClearOpd,
}: Readonly<Omit<DiscountServiceTypeOptionProps, "kind" | "className">>) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <DiscountServiceTypeOption
        form={form}
        kind="ipd"
        ipdEnabled={ipdEnabled}
        opdEnabled={opdEnabled}
        onClearIpd={onClearIpd}
        onClearOpd={onClearOpd}
      />
      <DiscountServiceTypeOption
        form={form}
        kind="opd"
        ipdEnabled={ipdEnabled}
        opdEnabled={opdEnabled}
        onClearIpd={onClearIpd}
        onClearOpd={onClearOpd}
      />
    </div>
  );
}
