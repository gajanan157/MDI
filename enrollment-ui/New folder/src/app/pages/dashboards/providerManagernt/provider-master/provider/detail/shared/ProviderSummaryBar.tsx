import {
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import {
  getProviderSummaryBarLabel,
  type ProviderSummaryFieldKey,
} from "../../../../shared/providerMasterI18n";
import { ProviderSummaryMetaChips } from "./ProviderSummaryMetaChips";

type ProviderSummaryItem = {
  key: ProviderSummaryFieldKey;
  value?: string | null;
};

type ProviderSummaryBarProps = {
  items: ProviderSummaryItem[];
  providerNetworkType?: string;
  tpaProviderNetwork?: string;
  insurerProviderNetwork?: string;
  /** Removes outer card chrome when nested inside a parent header shell. */
  embedded?: boolean;
};

const fieldLabelClass =
  "text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-[9px]";
const fieldValueClass = "mt-0 text-xs leading-4 text-gray-900 sm:text-[11px]";

function FieldValue({
  text,
  wrap = false,
  lines = 1,
  className = "",
}: Readonly<{
  text: string;
  wrap?: boolean;
  lines?: 1 | 2;
  className?: string;
}>) {
  if (wrap) {
    return (
      <span className={`block min-w-0 break-words ${className}`} title={text}>
        {text}
      </span>
    );
  }

  const clampClass = lines === 2 ? "line-clamp-2" : "truncate";

  return (
    <span className={`block min-w-0 ${clampClass} ${className}`} title={text}>
      {text}
    </span>
  );
}

function SummaryField({
  item,
  wide = false,
  wrap = false,
  clampLines = 1,
}: Readonly<{
  item: ProviderSummaryItem;
  wide?: boolean;
  wrap?: boolean;
  clampLines?: 1 | 2;
}>) {
  const { t } = useTranslation();
  const text = String(item.value ?? "").trim();
  if (!text || text === "—") return null;

  const widthClass = wide
    ? "min-w-0 flex-[1_1_0%] basis-0"
    : "min-w-0 lg:shrink-0 lg:max-w-[9rem]";

  return (
    <div className={`px-2 py-1 sm:py-0.5 ${widthClass}`}>
      <dt className={fieldLabelClass}>{getProviderSummaryBarLabel(item.key, t)}</dt>
      <dd className={fieldValueClass}>
        <FieldValue text={text} wrap={wrap} lines={clampLines} />
      </dd>
    </div>
  );
}

export function ProviderSummaryBar({
  items,
  providerNetworkType = "-",
  tpaProviderNetwork = "",
  insurerProviderNetwork = "",
  embedded = false,
}: Readonly<ProviderSummaryBarProps>) {
  const { t } = useTranslation();

  const visible = items.filter((item) => {
    const v = String(item.value ?? "").trim();
    return v !== "" && v !== "—";
  });

  const providerName = visible.find((item) => item.key === "providerName");
  const address = visible.find((item) => item.key === "address");
  const providerCode = visible.find((item) => item.key === "providerCode");
  const rohiniId = visible.find((item) => item.key === "rohiniId");

  if (
    visible.length === 0 &&
    (providerNetworkType === "—" || providerNetworkType === "-")
  ) {
    return null;
  }

  const networkType = providerNetworkType.trim() || "-";

  return (
    <div
      className={
        embedded
          ? "bg-transparent px-0.5 py-0.5"
          : "rounded-md border border-gray-200 bg-gray-50/90 px-0.5 py-0.5 shadow-sm"
      }
    >
      <div className="grid w-full grid-cols-2 gap-0.5 lg:flex lg:flex-row lg:items-center lg:gap-0 lg:divide-x lg:divide-gray-200/80">
        {providerName || address ? (
          <div className="col-span-2 flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-start sm:divide-x sm:divide-gray-200/80 lg:gap-0">
            {providerName ? (
              <div className="flex min-w-0 flex-[1_1_0%] basis-0 gap-1 px-2 py-1 sm:py-0.5">
                <BuildingOffice2Icon
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <dt className={fieldLabelClass}>
                    {getProviderSummaryBarLabel(providerName.key, t)}
                  </dt>
                  <dd className={`${fieldValueClass} font-medium`}>
                    <FieldValue
                      text={String(providerName.value ?? "").trim()}
                      wrap
                    />
                  </dd>
                </div>
              </div>
            ) : null}

            {address ? <SummaryField item={address} wide wrap /> : null}
          </div>
        ) : null}

        <div className="relative col-span-2 flex min-w-0 items-center lg:ml-auto lg:divide-x lg:divide-gray-200/80">
          {providerCode ? <SummaryField item={providerCode} clampLines={1} /> : null}
          {rohiniId ? <SummaryField item={rohiniId} clampLines={1} /> : null}

          <div className="flex shrink-0 items-center px-2 py-1 sm:py-0.5 lg:border-l-0">
            <ProviderSummaryMetaChips
              networkType={networkType}
              tpaProviderNetwork={tpaProviderNetwork}
              insurerProviderNetwork={insurerProviderNetwork}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
