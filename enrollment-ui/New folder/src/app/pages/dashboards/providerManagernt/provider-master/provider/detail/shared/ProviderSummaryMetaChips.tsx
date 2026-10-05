import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Squares2X2Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { GlobeAltIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import {
  TOOLBAR_META_CHIP_TONES,
  type ToolbarMetaChipTone,
} from "./toolbarMetaChip.constants";
import { ToolbarMetaChip } from "./toolbarMetaChip";

const ROTATE_INTERVAL_MS = 2000;
const ROTATE_TRANSITION_MS = 300;

type ProviderSummaryMetaChipsProps = {
  networkType?: string;
  tpaProviderNetwork?: string;
  insurerProviderNetwork?: string;
};

type NetworkChipItem = {
  id: "network" | "tpa" | "insurer";
  label: string;
  value: string;
  tone: ToolbarMetaChipTone;
};

function hasNetworkValue(value: string | undefined): boolean {
  const trimmed = String(value ?? "").trim();
  return trimmed !== "" && trimmed !== "-" && trimmed !== "—";
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return prefersReducedMotion;
}

function useRotatingIndex(length: number, paused: boolean): number {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setIndex((current) => (length <= 0 ? 0 : current % length));
  }, [length]);

  useEffect(() => {
    if (paused || prefersReducedMotion || length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [length, paused, prefersReducedMotion]);

  return index;
}

function NetworkStatusCard({
  item,
  className = "",
}: Readonly<{
  item: NetworkChipItem;
  className?: string;
}>) {
  return (
    <ToolbarMetaChip
      icon={GlobeAltIcon}
      label={item.label}
      value={item.value}
      tone={item.tone}
      labelUppercase={false}
      size="prominent"
      className={className}
    />
  );
}

function RotatingNetworkCards({
  items,
  activeIndex,
}: Readonly<{
  items: NetworkChipItem[];
  activeIndex: number;
}>) {
  const previousIndexRef = useRef(activeIndex);
  const measureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const activeItem = items[activeIndex] ?? items[0];

  useLayoutEffect(() => {
    const previous = previousIndexRef.current;
    if (previous === activeIndex) return undefined;
    previousIndexRef.current = activeIndex;
    setOutgoingIndex(previous);
    const timer = window.setTimeout(() => setOutgoingIndex(null), ROTATE_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  useLayoutEffect(() => {
    const widths = measureRefs.current.map((node) => node?.offsetWidth ?? 0);
    const heights = measureRefs.current.map((node) => node?.offsetHeight ?? 0);
    const width = Math.max(...widths, 0);
    const height = Math.max(...heights, 0);
    if (!width || !height) return;
    setSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }, [items]);

  if (!activeItem) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none invisible absolute" aria-hidden>
        {items.map((item, index) => (
          <div
            key={`measure-${item.id}`}
            ref={(node) => {
              measureRefs.current[index] = node;
            }}
            className="w-max"
          >
            <NetworkStatusCard item={item} />
          </div>
        ))}
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          width: size.width || undefined,
          height: size.height || undefined,
        }}
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const isOutgoing = index === outgoingIndex && outgoingIndex !== activeIndex;
          let translateClass = "translate-y-full opacity-0";
          if (isActive) translateClass = "translate-y-0 opacity-100";
          else if (isOutgoing) translateClass = "-translate-y-full opacity-0";
          const transitionClass =
            isActive || isOutgoing
              ? "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
              : "transition-none";

          return (
            <div
              key={item.id}
              className={`absolute inset-0 ${transitionClass} ${translateClass} ${
                isActive ? "z-10" : "z-0 pointer-events-none"
              }`}
              style={{ transitionDuration: `${ROTATE_TRANSITION_MS}ms` }}
              aria-hidden={!isActive}
            >
              <NetworkStatusCard item={item} className="h-full w-full max-w-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProviderSummaryMetaChips({
  networkType = "-",
  tpaProviderNetwork = "",
  insurerProviderNetwork = "",
}: Readonly<ProviderSummaryMetaChipsProps>) {
  const { t } = useTranslation();
  const network = networkType.trim() || "-";

  const items = useMemo<NetworkChipItem[]>(() => {
    const next: NetworkChipItem[] = [
      {
        id: "network",
        label: t("providerMaster.toolbar.networkType"),
        value: network,
        tone: TOOLBAR_META_CHIP_TONES.network,
      },
    ];
    if (hasNetworkValue(tpaProviderNetwork)) {
      next.push({
        id: "tpa",
        label: t("providerMaster.toolbar.tpaNetwork"),
        value: tpaProviderNetwork,
        tone: TOOLBAR_META_CHIP_TONES.nonNetwork,
      });
    }
    if (hasNetworkValue(insurerProviderNetwork)) {
      next.push({
        id: "insurer",
        label: t("providerMaster.toolbar.insurerNetwork"),
        value: insurerProviderNetwork,
        tone: TOOLBAR_META_CHIP_TONES.insurer,
      });
    }
    return next;
  }, [insurerProviderNetwork, network, t, tpaProviderNetwork]);

  const screenReaderSummary = items
    .map((item) => `${item.label}: ${item.value}`)
    .join(". ");

  return (
    <Popover className="relative">
      {({ open }) => (
        <NetworkChipsContent
          items={items}
          open={open}
          screenReaderSummary={screenReaderSummary}
        />
      )}
    </Popover>
  );
}

function NetworkChipsContent({
  items,
  open,
  screenReaderSummary,
}: Readonly<{
  items: NetworkChipItem[];
  open: boolean;
  screenReaderSummary: string;
}>) {
  const { t } = useTranslation();
  const activeIndex = useRotatingIndex(items.length, open);
  const viewAllLabel = t("providerMaster.toolbar.viewAllNetworkTypes");
  const closeLabel = t("providerMaster.toolbar.close");
  const toggleLabel = open ? closeLabel : viewAllLabel;

  return (
    <div className="flex items-center justify-end gap-1">
      <p className="sr-only">{screenReaderSummary}</p>
      <div className={open ? "invisible pointer-events-none" : undefined}>
        <RotatingNetworkCards items={items} activeIndex={activeIndex} />
      </div>

      <PopoverButton
        type="button"
        title={toggleLabel}
        aria-label={
          open
            ? closeLabel
            : t("providerMaster.toolbar.viewAllNetworkTypesAria")
        }
        data-testid="provider-network-types-toggle"
        className="relative z-40 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-500"
      >
        {open ? (
          <XMarkIcon className="h-4 w-4" aria-hidden />
        ) : (
          <Squares2X2Icon className="h-4 w-4" aria-hidden />
        )}
        <span className="sr-only">{toggleLabel}</span>
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-x-4"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-4"
      >
        <PopoverPanel
          className="absolute right-9 top-0 z-30 w-max max-w-[min(34rem,calc(100vw-22rem))] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
          aria-label={t("providerMaster.toolbar.allNetworkTypes")}
        >
          <div className="flex flex-row flex-nowrap items-stretch justify-end gap-1">
            {items.map((item) => (
              <NetworkStatusCard key={item.id} item={item} />
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </div>
  );
}
