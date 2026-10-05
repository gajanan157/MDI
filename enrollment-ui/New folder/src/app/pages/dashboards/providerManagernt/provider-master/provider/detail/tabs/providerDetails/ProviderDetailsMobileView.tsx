import { type ComponentType, type ReactNode, useState } from "react";
import {
  BuildingOffice2Icon,
  ChevronDownIcon,
  DocumentTextIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

type ProviderDetailsMobileViewProps = {
  providerBarSection?: ReactNode;
  statusBar: ReactNode;
  providerInformation: ReactNode;
  identifierDetails: ReactNode;
  addressDetails: ReactNode;
  contactDetails: ReactNode;
  certificates: ReactNode;
  isEditMode: boolean;
  onAddCertificate: () => void;
};

type MobileSectionProps = {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconClassName: string;
  content: ReactNode;
  open: boolean;
  onToggle: (id: string) => void;
  onAdd?: () => void;
  addLabel?: string;
};

function MobileOverviewSection({
  id,
  title,
  icon: Icon,
  iconClassName,
  content,
  open,
  onToggle,
  onAdd,
  addLabel,
}: Readonly<MobileSectionProps>) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-11 items-center">
        <button
          type="button"
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left"
          aria-expanded={open}
          aria-controls={`${id}-content`}
          onClick={() => onToggle(id)}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white ${iconClassName}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-xs font-semibold text-slate-700">
            {title}
          </span>
        </button>
        {onAdd ? (
          <button
            type="button"
            className="mr-1.5 inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 text-[10px] font-semibold text-blue-700"
            onClick={onAdd}
          >
            <PlusIcon className="h-3.5 w-3.5" aria-hidden />
            {addLabel}
          </button>
        ) : null}
        <button
          type="button"
          className="flex h-10 w-8 shrink-0 items-center justify-center"
          aria-label={title}
          aria-expanded={open}
          aria-controls={`${id}-content`}
          onClick={() => onToggle(id)}
        >
          <ChevronDownIcon
            className={`h-4 w-4 text-slate-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
      </div>

      {open ? (
        <div
          id={`${id}-content`}
          className="border-t border-slate-100 [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none [&>div>div:first-child]:hidden [&>section]:rounded-none [&>section]:border-0 [&>section]:shadow-none [&>section>div:first-child]:hidden"
        >
          {content}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Dedicated Provider Overview layout for xs/sm screens.
 * The section order follows the natural mobile reading and editing flow.
 */
export function ProviderDetailsMobileView({
  providerBarSection,
  statusBar,
  providerInformation,
  identifierDetails,
  addressDetails,
  contactDetails,
  certificates,
  isEditMode,
  onAddCertificate,
}: Readonly<ProviderDetailsMobileViewProps>) {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (id: string) => {
    setOpenSection((current) => (current === id ? null : id));
  };

  const sections = [
    {
      id: "provider-information",
      title: t("providerMaster.detailTabs.providerDetails.providerInformation"),
      icon: BuildingOffice2Icon,
      iconClassName: "bg-blue-600",
      content: providerInformation,
    },
    {
      id: "identifier-details",
      title: t("providerMaster.detailTabs.providerDetails.identifierDetails"),
      icon: IdentificationIcon,
      iconClassName: "bg-emerald-500",
      content: identifierDetails,
    },
    {
      id: "address-details",
      title: t("providerMaster.detailTabs.providerDetails.addressDetails"),
      icon: MapPinIcon,
      iconClassName: "bg-blue-600",
      content: addressDetails,
    },
    {
      id: "contact-details",
      title: t("providerMaster.detailTabs.providerDetails.contactDetails"),
      icon: PhoneIcon,
      iconClassName: "bg-cyan-500",
      content: contactDetails,
    },
    {
      id: "certificates",
      title: t("providerMaster.detailTabs.providerDetails.certificates"),
      icon: DocumentTextIcon,
      iconClassName: "bg-violet-500",
      content: certificates,
      onAdd: isEditMode
        ? () => {
            setOpenSection("certificates");
            onAddCertificate();
          }
        : undefined,
      addLabel: t("providerMaster.button.add"),
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 touch-pan-y flex-col gap-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-gray-50 p-0.5 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
      {providerBarSection ? (
        <div className="shrink-0">{providerBarSection}</div>
      ) : null}

      <div className="shrink-0">{statusBar}</div>

      <div className="flex shrink-0 flex-col gap-1.5 pb-1">
        {sections.map((section) => (
          <MobileOverviewSection
            key={section.id}
            {...section}
            open={openSection === section.id}
            onToggle={toggleSection}
          />
        ))}
      </div>
    </div>
  );
}
