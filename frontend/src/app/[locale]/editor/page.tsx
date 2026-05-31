"use client";

import BulkStatusDialog from "@/components/editor/BulkStatusDialog";
import EditorShell from "@/components/editor/EditorShell";
import { editorTouchCompact } from "@/components/editor/editorUi";
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
import StatsCards from "@/components/editor/StatsCards";
import StatusUpdateDialog from "@/components/editor/StatusUpdateDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBulkUpdateAllOrdersStatus,
  useBulkUpdateOrderStatus,
  useDashboardStats,
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
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("completed");
  const [bulkAdminNotes, setBulkAdminNotes] = useState("");
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

  const { data: stats } = useDashboardStats();

  const updateStatusMutation = useUpdateOrderStatus();
  const bulkUpdateMutation = useBulkUpdateOrderStatus();
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

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.adminNotes || "");
    setShowStatusDialog(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedOrder) return;

    updateStatusMutation.mutate(
      {
        id: selectedOrder._id,
        status: newStatus,
        adminNotes: adminNotes || undefined,
      },
      {
        onSuccess: () => {
          setShowStatusDialog(false);
        },
      },
    );
  };

  const handleBulkStatusUpdate = () => {
    if (orders.length === 0) {
      toast.info("No orders to update");
      setShowBulkStatusDialog(false);
      return;
    }

    bulkUpdateMutation.mutate(
      {
        orderIds: orders.map((order) => order._id),
        status: bulkStatus,
        adminNotes: bulkAdminNotes || undefined,
      },
      {
        onSuccess: () => {
          setShowBulkStatusDialog(false);
          setBulkAdminNotes("");
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
          <>
            {stats && <StatsCards stats={stats} />}

            <Card>
              <CardHeader className="px-3 py-3 sm:px-6 sm:py-4 space-y-2 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <CardTitle className="text-base sm:text-xl">
                    {t("title")}
                  </CardTitle>
                  <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1.5 sm:gap-2 w-full sm:w-auto">
                    <MarkAllCompletedDialog
                      loading={markAllCompletedMutation.isPending}
                      hasDateOrBranchFilter={hasDateOrBranchFilter}
                      onConfirm={handleMarkAllCompleted}
                    />
                    <Button
                      onClick={() => setShowBulkStatusDialog(true)}
                      disabled={loading || orders.length === 0}
                      className={`${editorTouchCompact} bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto`}
                    >
                      {bulkUpdateMutation.isPending ? (
                        t("updating")
                      ) : (
                        <>
                          <span className="truncate sm:hidden">{t("bulkUpdate")}</span>
                          <span className="truncate hidden sm:inline">
                            {t("bulkUpdateStatus")}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <OrderStatusTabs
                  value={statusFilter}
                  counts={statusCounts}
                  loading={statusCountsLoading}
                  onChange={handleStatusTabChange}
                />

                <OrdersFilters
                  filters={filters}
                  loading={loading}
                  hideStatusFilter
                  onFiltersChange={setFilters}
                  onDownloadCSV={handleDownloadAllOrders}
                  onDownloadPDF={handleDownloadPDF}
                />
              </CardHeader>
              <CardContent className="pt-0">
                <OrdersTable
                  orders={orders}
                  loading={loading}
                  inlineStatus
                  updatingOrderId={updatingOrderId}
                  onViewOrder={handleViewOrder}
                  onStatusChange={handleInlineStatusChange}
                  onUpdateStatus={handleUpdateStatus}
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
          </>
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
        status={newStatus}
        onStatusChange={setNewStatus}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onSubmit={handleStatusUpdate}
        isSubmitting={updateStatusMutation.isPending}
      />

      <BulkStatusDialog
        open={showBulkStatusDialog}
        onOpenChange={setShowBulkStatusDialog}
        orderCount={orders.length}
        status={bulkStatus}
        onStatusChange={setBulkStatus}
        adminNotes={bulkAdminNotes}
        onAdminNotesChange={setBulkAdminNotes}
        onSubmit={handleBulkStatusUpdate}
        isSubmitting={bulkUpdateMutation.isPending}
      />
    </EditorShell>
  );
}
