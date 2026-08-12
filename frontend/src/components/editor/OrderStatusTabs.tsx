"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ORDER_STATUS_FILTER_TABS,
  OrderStatusFilter,
} from "@/components/editor/orderStatus";
import {
  editorHorizontalScroll,
  editorSnapItem,
  editorTouchCompact,
} from "./editorUi";
import { useTranslations } from "next-intl";

interface OrderStatusTabsProps {
  value: OrderStatusFilter;
  counts: Record<OrderStatusFilter, number>;
  loading?: boolean;
  onChange: (status: OrderStatusFilter) => void;
}

export default function OrderStatusTabs({
  value,
  counts,
  loading = false,
  onChange,
}: OrderStatusTabsProps) {
  const t = useTranslations("editor.status");

  return (
    <div
      className={editorHorizontalScroll}
      role="tablist"
      aria-label={t("all")}
    >
      {ORDER_STATUS_FILTER_TABS.map((tab) => {
        const count = counts[tab.value];
        const isActive = value === tab.value;
        const isPendingAttention =
          tab.value === "pending" && count > 0 && !isActive;

        return (
          <Button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            variant={isActive ? "default" : "outline"}
            className={`${editorSnapItem} ${editorTouchCompact} px-2.5 sm:px-4 ${
              isActive
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                : isPendingAttention
                  ? "text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100"
                  : "text-gray-700 bg-white"
            }`}
            onClick={() => onChange(tab.value)}
          >
            <span className="whitespace-nowrap">{t(tab.value)}</span>
            {loading ? (
              <Skeleton className="ml-1.5 h-4 w-6 rounded-full inline-block" />
            ) : (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-px text-[10px] sm:text-xs font-semibold min-w-[1.25rem] text-center tabular-nums ${
                  isActive
                    ? "bg-blue-500/90 text-white"
                    : isPendingAttention
                      ? "bg-amber-200/80 text-amber-900"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
