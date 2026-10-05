import { useTranslation } from "react-i18next";
import {
  BuildingOffice2Icon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";
import type { HospitalDetailRecord } from "../../hospitalData";
import type { ProviderDetailsFromApi } from "../utils/providerDetailSectionMerges";
import { resolveProviderNetworkTypeLabel } from "../../../../shared/providerMasterI18n";
import { ProviderAgreementTypesPanel } from "../shared/ProviderAgreementTypesPanel";
import { ProviderSummaryBar } from "../shared/ProviderSummaryBar";
import { ProviderSummaryMetaChips } from "../shared/ProviderSummaryMetaChips";
import { resolveProviderAgreementTypes } from "./viewHospitalProviderBar.helpers";

type ViewHospitalAgreementProviderSectionProps = {
  providerProfile: HospitalDetailRecord | null;
  providerDetailsFields: ProviderDetailsFromApi | null;
  agreementForm: Record<string, string>;
  agreementTypeLabels: string[];
};

function ProviderMobileSummary({
  providerName,
  providerAddress,
  providerCode,
  rohiniId,
  networkType,
  tpaProviderNetwork,
  insurerProviderNetwork,
  status,
  agreementTypes,
}: Readonly<{
  providerName?: string | null;
  providerAddress?: string | null;
  providerCode?: string | null;
  rohiniId?: string | null;
  networkType: string;
  tpaProviderNetwork: string;
  insurerProviderNetwork: string;
  status: string;
  agreementTypes: string[];
}>) {
  const { t } = useTranslation();
  const isActive = status.toUpperCase() === "ACTIVE";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white">
            <BuildingOffice2Icon className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="min-w-0 text-sm font-semibold leading-5 text-slate-900">
                {providerName || "—"}
              </h2>
              {status ? (
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-green-500" : "bg-slate-400"
                    }`}
                  />
                  {status}
                </span>
              ) : null}
            </div>
            {providerAddress ? (
              <div className="mt-1 flex items-start gap-1 text-[10px] leading-4 text-slate-500">
                <MapPinIcon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                <span className="line-clamp-2">{providerAddress}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center">
          <dl className="min-w-0 border-r border-slate-200 pr-3">
            <dt className="text-[9px] font-medium text-slate-500">
              {t("providerMaster.summaryBar.providerCode")}
            </dt>
            <dd className="mt-1 truncate text-[11px] font-semibold text-slate-900">
              {providerCode || "—"}
            </dd>
          </dl>
          <dl className="min-w-0 border-r border-slate-200 px-3">
            <dt className="text-[9px] font-medium text-slate-500">
              {t("providerMaster.summaryBar.rohiniId")}
            </dt>
            <dd className="mt-1 truncate text-[11px] font-semibold text-slate-900">
              {rohiniId || "—"}
            </dd>
          </dl>
          <div className="ml-3">
            <ProviderSummaryMetaChips
              networkType={networkType}
              tpaProviderNetwork={tpaProviderNetwork}
              insurerProviderNetwork={insurerProviderNetwork}
            />
          </div>
        </div>
      </div>

      <ProviderAgreementTypesPanel agreementTypes={agreementTypes} />
    </div>
  );
}

export function ViewHospitalAgreementProviderSection({
  providerProfile,
  providerDetailsFields,
  agreementForm,
  agreementTypeLabels,
}: Readonly<ViewHospitalAgreementProviderSectionProps>) {
  const { t } = useTranslation();
  const { smAndDown } = useBreakpointsContext();
  const agreementTypes = resolveProviderAgreementTypes(agreementForm, agreementTypeLabels);
  const providerNetworkTypeLabel = resolveProviderNetworkTypeLabel(
    providerDetailsFields?.providerNetworkType,
    t,
  );
  const tpaProviderNetworkLabel = resolveProviderNetworkTypeLabel(
    providerDetailsFields?.tpaProviderNetwork,
    t,
  );
  const insurerProviderNetworkLabel = resolveProviderNetworkTypeLabel(
    providerDetailsFields?.insurerProviderNetwork,
    t,
  );

  const providerName =
    providerDetailsFields?.providerName ?? providerProfile?.hospitalName;
  const providerAddress =
    providerDetailsFields?.providerAddress ??
    providerProfile?.address ??
    providerProfile?.location;
  const providerCode =
    providerDetailsFields?.providerCode ?? providerProfile?.hospitalCode;
  const rohiniId =
    providerDetailsFields?.providerIibRohiniCode ?? providerProfile?.rohiniCode;

  if (smAndDown) {
    return (
      <ProviderMobileSummary
        providerName={providerName}
        providerAddress={providerAddress}
        providerCode={providerCode}
        rohiniId={rohiniId}
        networkType={providerNetworkTypeLabel}
        tpaProviderNetwork={tpaProviderNetworkLabel}
        insurerProviderNetwork={insurerProviderNetworkLabel}
        status={String(providerDetailsFields?.recordStatus ?? "").trim()}
        agreementTypes={agreementTypes}
      />
    );
  }

  return (
    <div
      data-testid="provider-detail-hero"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      <div className="border-l-[3px] border-teal-600">
        <ProviderSummaryBar
          embedded
          status={providerDetailsFields?.recordStatus}
          verified={providerDetailsFields?.providerIsVerified === true}
          descriptors={[
            providerDetailsFields?.providerTypeName ?? "",
            providerDetailsFields?.providerCareTier ?? "",
            [providerDetailsFields?.providerCity, providerDetailsFields?.providerStateName]
              .filter(Boolean)
              .join(", "),
          ]}
          providerNetworkType={providerNetworkTypeLabel}
          tpaProviderNetwork={tpaProviderNetworkLabel}
          insurerProviderNetwork={insurerProviderNetworkLabel}
          items={[
            { key: "providerName", value: providerName },
            { key: "address", value: providerAddress },
            { key: "providerCode", value: providerCode },
            { key: "rohiniId", value: rohiniId },
          ]}
        />
      </div>
      <ProviderAgreementTypesPanel agreementTypes={agreementTypes} />
    </div>
  );
}
