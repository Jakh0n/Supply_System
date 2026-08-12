"use client";

import EditorShell from "@/components/editor/EditorShell";
import { editorTouchSm } from "@/components/editor/editorUi";
import MarkAllCompletedDialog, {
  MarkAllScope,
} from "@/components/editor/MarkAllCompletedDialog";
import { OrderStatusFilter } from "@/components/editor/orderStatus";
import OrderStatusTabs from "@/components/editor/OrderStatusTabs";
import OrdersFilters from "@/components/editor/OrdersFilters";
import OrdersPagination from "@/components/editor/OrdersPagination";
import OrdersTable from "@/components/editor/OrdersTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBulkUpdateAllOrdersStatus,
  useDrinkOrderStatusCounts,
  useDrinkOrdersList,
  useUpdateDrinkOrderStatus,
} from "@/hooks/queries";
import { formatDate } from "@/lib/formatDate";
import { DrinkOrder, Order, OrderFilters, OrderStatus } from "@/types";
import { CupSoda } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const EDITOR_DRINK_ORDERS_PAGE_SIZE = 10;

const DEFAULT_FILTERS: OrderFilters = {
  date: "",
  branch: "",
  status: "all",
  page: 1,
  limit: EDITOR_DRINK_ORDERS_PAGE_SIZE,
};

const EditorDrinkOrdersPage = () => {
  const { user, logout } = useAuth();
  const t = useTranslations("editor.drinkOrders");
  const [selectedOrder, setSelectedOrder] = useState<DrinkOrder | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);

  const statusFilter = (filters.status ?? "all") as OrderStatusFilter;

  const countBaseFilters = useMemo(
    () => ({
      date: filters.date || undefined,
      branch: filters.branch || undefined,
    }),
    [filters.date, filters.branch],
  );

  const drinkOrderFilters = useMemo(
    () => ({
      ...countBaseFilters,
      status: statusFilter !== "all" ? statusFilter : undefined,
      page: filters.page,
      limit: filters.limit,
      viewAll: "true",
    }),
    [countBaseFilters, statusFilter, filters.page, filters.limit],
  );

  const {
    data: drinkOrdersData,
    isLoading,
    isFetching,
  } = useDrinkOrdersList(drinkOrderFilters);

  const { counts: statusCounts, isLoading: statusCountsLoading } =
    useDrinkOrderStatusCounts(countBaseFilters);

  const updateStatusMutation = useUpdateDrinkOrderStatus();
  const markAllCompletedMutation = useBulkUpdateAllOrdersStatus();
  const hasDateOrBranchFilter = Boolean(filters.date || filters.branch);

  const drinkOrders = drinkOrdersData?.drinkOrders ?? [];
  const totalPages = drinkOrdersData?.pagination.pages ?? 1;
  const totalCount = drinkOrdersData?.pagination.total ?? 0;
  const currentPage = filters.page ?? 1;
  const loading = isLoading || isFetching;

  const handleStatusTabChange = (status: OrderStatusFilter) => {
    setFilters({ ...filters, status, page: 1 });
  };

  const handleInlineStatusChange = (order: Order, status: OrderStatus) => {
    const drinkOrder = order as DrinkOrder;
    if (status === drinkOrder.status) return;

    setUpdatingOrderId(drinkOrder._id);
    updateStatusMutation.mutate(
      { id: drinkOrder._id, status },
      { onSettled: () => setUpdatingOrderId(null) },
    );
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order as DrinkOrder);
    setShowOrderDialog(true);
  };

  const handleAddNotes = (order: Order) => {
    const drinkOrder = order as DrinkOrder;
    setSelectedOrder(drinkOrder);
    setAdminNotes(drinkOrder.adminNotes || "");
    setShowNotesDialog(true);
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
          setShowNotesDialog(false);
        },
      },
    );
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

  if (!user) {
    return null;
  }

  return (
    <EditorShell username={user.username} onLogout={logout}>
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="px-3 py-3 sm:px-6 sm:py-5 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <CupSoda className="h-5 w-5 text-cyan-600 shrink-0" />
              <CardTitle className="text-base sm:text-xl truncate">
                {t("title")}
              </CardTitle>
              {!statusCountsLoading && (
                <span className="shrink-0 inline-flex items-center rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-800 tabular-nums border border-cyan-100">
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
            />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0 pb-3 sm:pb-6">
          <OrdersTable
            orders={drinkOrders as unknown as Order[]}
            loading={loading}
            inlineStatus
            updatingOrderId={updatingOrderId}
            onViewOrder={handleViewOrder}
            onStatusChange={handleInlineStatusChange}
            onUpdateStatus={handleAddNotes}
          />

          <OrdersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            loading={loading}
            itemLabelKey="drinkOrders"
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </CardContent>
      </Card>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <CupSoda className="h-5 w-5 text-cyan-600" />
              {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Branch:</span>{" "}
                  <span className="font-medium">{selectedOrder.branch}</span>
                </div>
                <div>
                  <span className="text-gray-500">Requested:</span>{" "}
                  <span className="font-medium">
                    {formatDate(selectedOrder.requestedDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm">Drink Items</h3>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Product</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">
                          Unit
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, idx) => (
                        <TableRow key={item.product?._id || `item-${idx}`}>
                          <TableCell className="text-sm">
                            {item.product?.name || "Product Deleted"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">
                            {item.product?.unit || "unit"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Worker Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {selectedOrder.adminNotes && (
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Admin Notes</h3>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                    {selectedOrder.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Admin notes - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Admin Notes (Optional)
              </Label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this order..."
                className="w-full p-2 border rounded-md min-h-[80px] resize-none mt-1 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNotesDialog(false)}
                disabled={updateStatusMutation.isPending}
                className={`${editorTouchSm} w-full sm:w-auto`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNotesSave}
                disabled={updateStatusMutation.isPending}
                className={`${editorTouchSm} w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700`}
              >
                {updateStatusMutation.isPending ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </EditorShell>
  );
};

export default EditorDrinkOrdersPage;
