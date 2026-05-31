"use client";

import EditorShell from "@/components/editor/EditorShell";
import { editorTouchSm } from "@/components/editor/editorUi";
import MarkAllCompletedDialog, {
  MarkAllScope,
} from "@/components/editor/MarkAllCompletedDialog";
import { OrderStatusFilter } from "@/components/editor/orderStatus";
import OrderStatusTabs from "@/components/editor/OrderStatusTabs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useBranchNames,
  useBulkUpdateAllOrdersStatus,
  useDrinkOrderStatusCounts,
  useDrinkOrdersList,
  useUpdateDrinkOrderStatus,
} from "@/hooks/queries";
import { formatDate } from "@/lib/formatDate";
import { DrinkOrder, Order, OrderStatus } from "@/types";
import { CupSoda } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface DrinkOrderFilterState {
  date: string;
  branch: string;
  status: OrderStatus | "all";
  page: number;
  limit: number;
}

const EditorDrinkOrdersPage = () => {
  const { user, logout } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<DrinkOrder | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [filters, setFilters] = useState<DrinkOrderFilterState>({
    date: "",
    branch: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const statusFilter = filters.status as OrderStatusFilter;

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

  const { data: branches = [] } = useBranchNames();
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

  const stats = useMemo(() => {
    const pending = statusCounts.pending;
    const completed = drinkOrders.filter(
      (o) => o.status === "completed",
    ).length;
    const totalQuantity = drinkOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((s, item) => s + item.quantity, 0),
      0,
    );
    return { pending, completed, totalQuantity };
  }, [drinkOrders, statusCounts.pending]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order as DrinkOrder);
    setShowOrderDialog(true);
  };

  const handleUpdateStatus = (order: Order) => {
    const drinkOrder = order as DrinkOrder;
    setSelectedOrder(drinkOrder);
    setNewStatus(drinkOrder.status);
    setAdminNotes(drinkOrder.adminNotes || "");
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

  const handlePrintOrder = () => {
    toast.info("Print is not yet available for drink orders");
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

  const handleClearFilters = () => {
    setFilters({
      date: "",
      branch: "",
      status: "all",
      page: 1,
      limit: filters.limit,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <EditorShell username={user.username} onLogout={logout}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CupSoda className="h-6 w-6 text-cyan-600" />
              Drink Orders
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and update drink-only orders from all branches
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
              Total: {totalCount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-gray-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-gray-600">
                Completed (page)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-gray-600">
                Total Quantity (page)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-cyan-600">
                {stats.totalQuantity}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">Date</Label>
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({ ...filters, date: e.target.value, page: 1 })
                  }
                  className="h-12 sm:h-10 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">Branch</Label>
                <Select
                  value={filters.branch || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      branch: value === "all" ? "" : value,
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="h-12 sm:h-10 text-base">
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.name} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end sm:col-span-1">
                <Button
                  variant="outline"
                  className={`${editorTouchSm} w-full`}
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl">All Drink Orders</CardTitle>
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
          </CardHeader>
          <CardContent className="pt-0">
            <OrdersTable
              orders={drinkOrders as unknown as Order[]}
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
              itemLabelKey="drinkOrders"
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </CardContent>
        </Card>
      </div>

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

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Update Status - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value: OrderStatus) => setNewStatus(value)}
              >
                <SelectTrigger className="mt-1 h-12 sm:h-10 text-base">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Admin Notes (Optional)
              </Label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this status update..."
                className="w-full p-2 border rounded-md min-h-[80px] resize-none mt-1 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(false)}
                disabled={updateStatusMutation.isPending}
                className={`${editorTouchSm} w-full sm:w-auto`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updateStatusMutation.isPending}
                className={`${editorTouchSm} w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700`}
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </EditorShell>
  );
};

export default EditorDrinkOrdersPage;
