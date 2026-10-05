import type { CSSProperties } from "react";
import type { TooltipContentProps } from "recharts";
import { ProviderInwardChartTooltipCard } from "./ProviderInwardChartTooltip";

export const PROVIDER_INWARD_RECHARTS_TOOLTIP_PROPS = {
    wrapperStyle: {
        border: "none",
        background: "transparent",
        padding: 0,
        boxShadow: "none",
        outline: "none",
        zIndex: 50,
    } satisfies CSSProperties,
    offset: 14,
    allowEscapeViewBox: { x: true, y: true },
    animationDuration: 150,
    isAnimationActive: false,
    cursor: { fill: "rgba(148, 163, 184, 0.12)" },
};

export function createProviderInwardDonutTooltipContent(total: number) {
    return function ProviderInwardDonutTooltip({
        active,
        payload,
    }: Readonly<TooltipContentProps>) {
        if (!active || !payload?.length) return null;

        const entry = payload[0];
        const slice = entry.payload as { name?: string; color?: string; value?: number };
        const value = Number(entry.value ?? slice.value ?? 0);
        const share = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

        return (
            <ProviderInwardChartTooltipCard
                label={String(slice.name ?? entry.name ?? "")}
                value={value.toLocaleString()}
                color={slice.color}
                meta={`${share}%`}
            />
        );
    };
}
