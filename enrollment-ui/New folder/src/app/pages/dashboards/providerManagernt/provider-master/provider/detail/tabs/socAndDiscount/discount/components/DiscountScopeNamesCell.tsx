import { Fragment } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { ListBulletIcon } from "@heroicons/react/24/outline";

type DiscountScopeKind = "insurance" | "corporate";

export type DiscountScopeNameItem = {
  name: string;
  detail?: string;
};

type DiscountScopeNamesCellProps = {
  names: string[] | DiscountScopeNameItem[];
  scope: DiscountScopeKind;
  title: string;
  emptyLabel?: string;
};

function toScopeItems(
  names: string[] | DiscountScopeNameItem[],
): DiscountScopeNameItem[] {
  return names
    .map((item) =>
      typeof item === "string"
        ? { name: item.trim() }
        : { name: item.name.trim(), detail: item.detail?.trim() || undefined },
    )
    .filter((item) => item.name);
}

/**
 * Show 1 name + `+N` overflow control, same as Corporate.
 */
export function DiscountScopeNamesCell({
  names,
  scope,
  title,
  emptyLabel = "—",
}: Readonly<DiscountScopeNamesCellProps>) {
  const resolved = toScopeItems(names);
  if (resolved.length === 0) {
    return <span className="text-xs text-gray-400">{emptyLabel}</span>;
  }

  const visibleCount = 1;
  const visible = resolved.slice(0, visibleCount);
  const remaining = Math.max(0, resolved.length - visibleCount);
  const showOverflowControl = remaining > 0;
  const visibleLabel = visible.map((item) => item.name).join(", ");
  const fullLabel = resolved
    .map((item) => (item.detail ? `${item.name} (${item.detail})` : item.name))
    .join(", ");

  const isInsurance = scope === "insurance";
  const headerClass = isInsurance
    ? "bg-sky-100 text-sky-800"
    : "bg-violet-100 text-violet-800";
  const itemClass = isInsurance
    ? "border-sky-100 bg-sky-50 text-sky-900"
    : "border-violet-100 bg-violet-50 text-violet-900";
  const panelClass = isInsurance
    ? "border-sky-200 ring-sky-100"
    : "border-violet-200 ring-violet-100";
  const buttonClass = isInsurance
    ? "border-sky-400 bg-sky-100 text-sky-800 hover:bg-sky-200"
    : "border-violet-400 bg-violet-100 text-violet-800 hover:bg-violet-200";

  return (
    <div
      className="discount-scope-names-root flex items-center gap-1"
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <span
        title={fullLabel}
        style={{
          flex: "1 1 0%",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: 12,
          color: "#111827",
        }}
      >
        {visibleLabel}
      </span>

      {showOverflowControl ? (
        <Popover className="relative shrink-0 grow-0">
          <PopoverButton
            type="button"
            title={`View all ${title}`}
            aria-label={`View all ${title}`}
            onClick={(event) => event.stopPropagation()}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-0.5 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[10px] font-bold leading-none shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500 ${buttonClass}`}
          >
            <span>+{remaining}</span>
            <ListBulletIcon className="h-3 w-3" aria-hidden strokeWidth={2.5} />
          </PopoverButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel
              anchor="bottom end"
              className={`z-[9999] w-[min(100vw-2rem,19rem)] rounded-xl border bg-white p-2.5 shadow-xl ring-1 ${panelClass}`}
            >
              <div className="space-y-1.5">
                <p
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${headerClass}`}
                >
                  {title}
                </p>
                <ul className="max-h-48 space-y-1 overflow-y-auto">
                  {resolved.map((item, index) => (
                    <li
                      key={`${item.name}-${item.detail ?? ""}-${index}`}
                      className={`rounded-md border px-2 py-1.5 text-xs font-medium shadow-sm ${itemClass}`}
                      title={item.detail ? `${item.name} (${item.detail})` : item.name}
                    >
                      <span className="block whitespace-normal break-words">{item.name}</span>
                      {item.detail ? (
                        <span className="mt-0.5 block whitespace-normal break-words text-[10px] font-normal text-gray-500">
                          {item.detail}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </PopoverPanel>
          </Transition>
        </Popover>
      ) : null}
    </div>
  );
}
