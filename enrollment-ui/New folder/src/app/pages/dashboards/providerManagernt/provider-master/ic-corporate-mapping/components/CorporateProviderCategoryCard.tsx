import type { ProviderNameRow } from "./mappedCorporateTabHelpers";

type ProviderCardTheme = {
  border: string;
  background: string;
  headerBorder: string;
  badge: string;
  rowDivide: string;
  footerBorder: string;
};

const PROVIDER_CARD_THEMES: Record<string, ProviderCardTheme> = {
  gray: {
    border: "border-gray-200",
    background: "bg-gray-50/80",
    headerBorder: "border-gray-200",
    badge: "bg-gray-200 text-gray-700",
    rowDivide: "divide-gray-200",
    footerBorder: "border-gray-200",
  },
  blue: {
    border: "border-blue-200",
    background: "bg-blue-50/50",
    headerBorder: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    rowDivide: "divide-blue-100",
    footerBorder: "border-blue-100",
  },
  amber: {
    border: "border-amber-200",
    background: "bg-amber-50/50",
    headerBorder: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    rowDivide: "divide-amber-100",
    footerBorder: "border-amber-100",
  },
  primary: {
    border: "border-primary-200",
    background: "bg-primary-50/50",
    headerBorder: "border-primary-200",
    badge: "bg-primary-100 text-primary-800",
    rowDivide: "divide-primary-100",
    footerBorder: "border-primary-100",
  },
};

type CorporateProviderCategoryCardProps = {
  title: string;
  items: ProviderNameRow[];
  limit: number;
  minHeight: number;
  themeKey: keyof typeof PROVIDER_CARD_THEMES;
  onSeeMore: () => void;
  seeMoreText: string;
  compactRows?: boolean;
};

export function CorporateProviderCategoryCard({
  title,
  items,
  limit,
  minHeight,
  themeKey,
  onSeeMore,
  seeMoreText,
  compactRows = false,
}: Readonly<CorporateProviderCategoryCardProps>) {
  const theme = PROVIDER_CARD_THEMES[themeKey];
  const cellPadding = compactRows ? "px-2 py-1.5" : "px-3 py-2";
  const emptyPadding = compactRows ? "px-2 py-3" : "px-3 py-4";
  const textSize = compactRows ? "text-xs" : "text-sm";

  return (
    <div
      className={`flex min-h-[280px] flex-col overflow-hidden rounded-xl border ${theme.border} ${theme.background} shadow-sm`}
    >
      <div className={`flex shrink-0 items-center justify-between border-b ${theme.headerBorder} px-3 py-2.5`}>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${theme.badge}`}>{items.length}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col" style={{ minHeight }}>
        <div className="flex-1 overflow-auto">
          <table className={`w-full text-left ${textSize}`}>
            <tbody className={`divide-y ${theme.rowDivide}`}>
              {items.slice(0, limit).map((row) => (
                <tr key={row.id} className={themeKey === "gray" ? "bg-white" : "bg-white/80"}>
                  <td className={`${cellPadding} font-medium text-gray-900`}>{row.name}</td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td className={`${emptyPadding} text-center text-gray-500`}>No providers</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className={`shrink-0 border-t ${theme.footerBorder} px-3 py-2.5`}>
          <button
            type="button"
            className={`${compactRows ? "text-[11px]" : "text-xs"} font-medium text-primary-600 hover:text-primary-700 hover:underline`}
            onClick={onSeeMore}
          >
            {seeMoreText}
          </button>
        </div>
      </div>
    </div>
  );
}
