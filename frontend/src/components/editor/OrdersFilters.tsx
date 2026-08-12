"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { branchesApi } from "@/lib/api";
import { OrderFilters, OrderStatus } from "@/types";
import { Download, FileText, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
  editorHorizontalScroll,
  editorSnapItem,
  editorTouchCompact,
} from "./editorUi";

interface OrdersFiltersProps {
  filters: OrderFilters;
  loading: boolean;
  onFiltersChange: (filters: OrderFilters) => void;
  onDownloadCSV?: () => void;
  onDownloadPDF?: () => void;
  hideStatusFilter?: boolean;
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  filters,
  loading,
  onFiltersChange,
  onDownloadCSV,
  onDownloadPDF,
  hideStatusFilter = false,
}) => {
  const t = useTranslations("editor.filters");
  const ts = useTranslations("editor.status");
  const to = useTranslations("editor.orders");
  const tc = useTranslations("common");
  const [branches, setBranches] = useState<Array<{ name: string }>>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const fetchBranches = useCallback(async () => {
    try {
      setBranchesLoading(true);
      const response = await branchesApi.getBranchNames();
      setBranches(response.branches || []);
    } catch {
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  const getThisWeekStart = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay()),
    );
    return firstDayOfWeek.toISOString().split("T")[0];
  };

  const quickFilters = [
    { labelKey: "today" as const, date: getTodayDate() },
    { labelKey: "yesterday" as const, date: getYesterdayDate() },
    { labelKey: "thisWeek" as const, date: getThisWeekStart() },
  ];

  const activeFiltersCount = [
    filters.date,
    filters.branch,
    !hideStatusFilter && filters.status !== "all" ? filters.status : null,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onFiltersChange({
      date: "",
      branch: "",
      status: "all" as OrderStatus | "all",
      page: 1,
      limit: filters.limit || 10,
    });
  };

  const showExports = Boolean(onDownloadCSV || onDownloadPDF);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 min-w-0">
        <div className={`${editorHorizontalScroll} flex-1`}>
          {quickFilters.map((preset) => (
            <Button
              key={preset.labelKey}
              variant={filters.date === preset.date ? "default" : "outline"}
              onClick={() =>
                onFiltersChange({ ...filters, date: preset.date, page: 1 })
              }
              className={`${editorSnapItem} ${editorTouchCompact} px-3 whitespace-nowrap ${
                filters.date === preset.date
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : ""
              }`}
              disabled={loading}
            >
              {t(preset.labelKey)}
            </Button>
          ))}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className={`${editorTouchCompact} shrink-0 px-2 text-muted-foreground`}
            disabled={loading}
            aria-label={tc("clear")}
          >
            <RotateCcw className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">{tc("clear")}</span>
            <Badge
              variant="secondary"
              className="ml-1 h-4 min-w-4 px-1 text-[10px] sm:hidden"
            >
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${
          hideStatusFilter ? "" : "lg:grid-cols-3"
        }`}
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            {t("date")}
          </label>
          <Input
            type="date"
            value={filters.date || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                date: e.target.value,
                page: 1,
              })
            }
            className="h-10 text-base"
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            {t("branch")}
          </label>
          <Select
            value={filters.branch || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                branch: value === "all" ? "" : value,
                page: 1,
              })
            }
            disabled={loading || branchesLoading}
          >
            <SelectTrigger className="h-10 text-base">
              <SelectValue placeholder={t("selectBranch")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allBranches")}</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.name} value={branch.name}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!hideStatusFilter && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              {to("status")}
            </label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value as OrderStatus | "all",
                  page: 1,
                })
              }
              disabled={loading}
            >
              <SelectTrigger className="h-10 text-base">
                <SelectValue placeholder={to("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="pending">{ts("pending")}</SelectItem>
                <SelectItem value="approved">{ts("approved")}</SelectItem>
                <SelectItem value="rejected">{ts("rejected")}</SelectItem>
                <SelectItem value="completed">{ts("completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {showExports && (
        <div className="flex gap-1.5 sm:gap-2">
          {onDownloadCSV && (
            <Button
              onClick={onDownloadCSV}
              disabled={loading}
              variant="outline"
              className={`${editorTouchCompact} flex-1 sm:flex-none`}
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 shrink-0" />
              <span className="sm:hidden">{t("csv")}</span>
              <span className="hidden sm:inline">{t("downloadCsv")}</span>
            </Button>
          )}
          {onDownloadPDF && (
            <Button
              onClick={onDownloadPDF}
              disabled={loading || !filters.date?.trim()}
              className={`${editorTouchCompact} flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50`}
              title={
                !filters.date?.trim() ? t("pdfNeedsDate") : t("pdfForDate")
              }
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 shrink-0" />
              <span className="sm:hidden">{t("pdf")}</span>
              <span className="hidden sm:inline">{t("downloadPdf")}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersFilters;
