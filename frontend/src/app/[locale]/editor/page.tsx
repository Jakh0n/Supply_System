"use client";

import EditorShell from "@/components/editor/EditorShell";
import MarkAllCompletedDialog, {
  MarkAllScope,
} from "@/components/editor/MarkAllCompletedDialog";
import EditorSkeleton from "@/components/editor/EditorSkeleton";
import OrderDetailsDialog from "@/components/editor/OrderDetailsDialog";
import { OrderStatusFilter } from "@/components/editor/orderStatus";
import OrderStatusTabs from "@/components/editor/OrderStatusTabs";
import OrdersFilters from "@/components/editor/OrdersFilters";
import OrdersPagination from "@/components/editor/OrdersPagination";
import OrdersTable from "@/components/editor/OrdersTable";
import StatusUpdateDialog from "@/components/editor/StatusUpdateDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBulkUpdateAllOrdersStatus,
  useOrderStatusCounts,
  useOrdersList,
  useUpdateOrderStatus,
} from "@/hooks/queries";
import { ordersApi } from "@/lib/api";
import { generateOrdersChecklistPdf } from "@/services/orders/ordersChecklistPdf";
import { downloadOrdersCsv } from "@/services/orders/ordersCsv";
import { openOrderPrintWindow } from "@/services/orders/ordersPrint";
import { Order, OrderFilters, OrderStatus } from "@/types";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const EDITOR_ORDERS_PAGE_SIZE = 10;

const DEFAULT_FILTERS: OrderFilters = {
  date: "",
  branch: "",
  status: "all",
  page: 1,
  limit: EDITOR_ORDERS_PAGE_SIZE,
};

export default function EditorDashboard() {
  const { user, logout } = useAuth();
  const t = useTranslations("editor.orders");
  const tt = useTranslations("editor.toast");
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const statusFilter = (filters.status ?? "all") as OrderStatusFilter;

  const countBaseFilters = useMemo(
    () => ({
      date: filters.date || undefined,
      branch: filters.branch || undefined,
    }),
    [filters.date, filters.branch],
  );

  const orderListFilters = useMemo(
    () => ({
      ...countBaseFilters,
      status: statusFilter !== "all" ? statusFilter : undefined,
      page: filters.page,
      limit: filters.limit,
    }),
    [countBaseFilters, statusFilter, filters.page, filters.limit],
  );

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isFetching: ordersFetching,
  } = useOrdersList(orderListFilters);

  const { counts: statusCounts, isLoading: statusCountsLoading } =
    useOrderStatusCounts(countBaseFilters);

  const updateStatusMutation = useUpdateOrderStatus();
  const markAllCompletedMutation = useBulkUpdateAllOrdersStatus();

  const hasDateOrBranchFilter = Boolean(filters.date || filters.branch);

  const orders = ordersData?.orders ?? [];
  const totalPages = ordersData?.pagination.pages ?? 1;
  const totalCount = ordersData?.pagination.total ?? 0;
  const currentPage = filters.page ?? 1;
  const loading = ordersLoading || ordersFetching || isExporting;
  const initialLoading = ordersLoading && ordersData === undefined;

  const handleStatusTabChange = (status: OrderStatusFilter) => {
    setFilters({ ...filters, status, page: 1 });
  };

  const handleInlineStatusChange = (order: Order, status: OrderStatus) => {
    if (status === order.status) return;

    setUpdatingOrderId(order._id);
    updateStatusMutation.mutate(
      { id: order._id, status },
      { onSettled: () => setUpdatingOrderId(null) },
    );
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const handleAddNotes = (order: Order) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || "");
    setShowStatusDialog(true);
  };

  const handleNotesSave = () => {
    if (!selectedOrder) return;

    updateStatusMutation.mutate(
      {
        id: selectedOrder._id,
        status: selectedOrder.status,
        adminNotes: adminNotes || undefined,
      },
      {
        onSuccess: () => {
          setShowStatusDialog(false);
        },
      },
    );
  };

  const handlePrintOrder = (order: Order) => {
    const opened = openOrderPrintWindow(order);
    if (!opened) {
      toast.error("Please allow popups to print orders");
      return;
    }
    toast.success("Print window opened successfully");
  };

  const handleDownloadAllOrders = async () => {
    try {
      setIsExporting(true);
      const response = await ordersApi.getOrders({
        ...orderListFilters,
        limit: 1000,
      });

      if (response.orders.length === 0) {
        toast.error(tt("noOrdersDownload"));
        return;
      }

      downloadOrdersCsv(response.orders);
      toast.success(tt("downloadedOrders", { count: response.orders.length }));
    } catch {
      toast.error(tt("downloadFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleMarkAllCompleted = (
    scope: MarkAllScope,
    includeDrinkOrders: boolean,
  ) => {
    markAllCompletedMutation.mutate({
      status: "completed",
      scope,
      date: filters.date || undefined,
      branch: filters.branch || undefined,
      includeDrinkOrders,
    });
  };

  const handleDownloadPDF = async () => {
    if (!filters.date?.trim()) {
      toast.error(tt("selectDatePdf"));
      return;
    }

    try {
      setIsExporting(true);
      const response = await ordersApi.getOrders({
        date: filters.date,
        status: undefined,
        branch: undefined,
        page: 1,
        limit: 1000,
      });

      if (response.orders.length === 0) {
        toast.error(tt("noOrdersForDate", { date: filters.date }));
        return;
      }

      await generateOrdersChecklistPdf(response.orders, filters.date);
      toast.success(
        tt("pdfGenerated", {
          count: response.orders.length,
          date: filters.date,
        }),
      );
    } catch {
      toast.error(tt("pdfFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <EditorShell username={user.username} onLogout={logout}>
      {initialLoading ? (
        <EditorSkeleton />
      ) : (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="px-3 py-3 sm:px-6 sm:py-5 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <CardTitle className="text-base sm:text-xl truncate">
                  {t("title")}
                </CardTitle>
                {!statusCountsLoading && (
                  <span className="shrink-0 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 tabular-nums">
                    {totalCount}
                  </span>
                )}
              </div>
              <MarkAllCompletedDialog
                loading={markAllCompletedMutation.isPending}
                hasDateOrBranchFilter={hasDateOrBranchFilter}
                onConfirm={handleMarkAllCompleted}
              />
            </div>

            <OrderStatusTabs
              value={statusFilter}
              counts={statusCounts}
              loading={statusCountsLoading}
              onChange={handleStatusTabChange}
            />

            <div className="border-t border-gray-100 pt-3 sm:pt-4">
              <OrdersFilters
                filters={filters}
                loading={loading}
                hideStatusFilter
                onFiltersChange={setFilters}
                onDownloadCSV={handleDownloadAllOrders}
                onDownloadPDF={handleDownloadPDF}
              />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0 pb-3 sm:pb-6">
            <OrdersTable
              orders={orders}
              loading={loading}
              inlineStatus
              updatingOrderId={updatingOrderId}
              onViewOrder={handleViewOrder}
              onStatusChange={handleInlineStatusChange}
              onUpdateStatus={handleAddNotes}
              onPrintOrder={handlePrintOrder}
            />

            <OrdersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              loading={loading}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </CardContent>
        </Card>
      )}

      <OrderDetailsDialog
        order={selectedOrder}
        open={showOrderDialog}
        onOpenChange={setShowOrderDialog}
      />

      <StatusUpdateDialog
        order={selectedOrder}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onSubmit={handleNotesSave}
        isSubmitting={updateStatusMutation.isPending}
      />
    </EditorShell>
  );
}
