import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

// TypeScript interfaces matching the API response
interface Address {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface CreatedBy {
  _id: string;
  name: string;
  fatherName: string;
  mobile: string;
  address: Address;
  authMethod: string;
  role: string;
  isVerified: boolean;
  mobileVerified: boolean;
  bankVerified: boolean;
  otherDetailsVerified: boolean;
  profileStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Product {
  _id: string;
  category: string;
  subCategory: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  isActive: boolean;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Order {
  _id: string;
  createdBy: CreatedBy;
  createdByModel: string;
  product: Product;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Pagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface ApiResponse {
  status_code: number;
  pagination: Pagination;
  data: Order[];
}

// Status filter options
const statusOptions = [
  { value: "", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "delivered", label: "Delivered" },
];

// Mock illustration
const mockIllustration =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0IiBoZWlnaHQ9IjE0NCIgdmlld0JveD0iMCAwIDE0NCAxNDQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNDQiIGhlaWdodD0iMTQ0IiByeD0iNzIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSI0NCIgeT0iNDQiIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0xMiAzLTEuOTEyIDUuODEzYTIgMiAwIDAgMS0xLjI3NSAxLjI3NUwzIDEybDUuODEzIDEuOTEyYTIgMiAwIDAgMSAxLjI3NSAxLjI3NUwxMiAyMWwxLjkxMi01LjgxM2EyIDIgMCAwIDEgMS4yNzUtMS4yNzVMMjEgMTJsLTUuODEzLTEuOTEyYTIgMiAwIDAgMS0xLjI3NS0xLjI3NVoiLz4KPC9zdmc+Cjwvc3ZnPgo=";

interface DeleteModalState {
  isOpen: boolean;
  orderId: string;
  orderTitle: string;
}

// Simple Delete Modal Component
function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  orderTitle,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderTitle: string;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Delete Order
        </h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete "{orderTitle}"? This action cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  limit,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  limit: number;
}) {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const getVisiblePages = () => {
    const pages: Array<number | string> = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
      <div className="flex-1 hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof page === "number" ? onPageChange(page) : undefined
                }
                disabled={page === "..."}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  page === currentPage
                    ? "z-10 bg-green-600 text-white"
                    : page === "..."
                    ? "text-gray-700 ring-1 ring-inset ring-gray-300 cursor-default"
                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

// Status Filter Component
function StatusFilter({
  selectedStatus,
  onStatusChange,
}: {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Filter className="w-5 h-5 text-gray-500" />
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-green-500"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ========= OrderStatus component (fixed) =========
   This component ensures every status (including "delivered")
   triggers an API call with payload. On success it calls
   onUpdated() so parent can refetch.
*/
type OrderStatusValue = "pending" | "accepted" | "rejected" | "delivered";

function OrderStatus({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: string;
  onUpdated?: () => void;
}) {
  const [status, setStatus] = useState<OrderStatusValue>(
    (currentStatus as OrderStatusValue) || "pending"
  );

  // mutation - change URL/payload if your backend expects different shape
  const { mutate, isLoading } = useMutation({
    mutationFn: async (newStatus: OrderStatusValue) => {
      // NOTE: change endpoint/payload to match your backend if necessary
      return api.put("/api/order/update-status", { id: orderId, status: newStatus });
    },
    onSuccess: () => {
      toast.success("Order status updated");
      if (onUpdated) onUpdated();
    },
    onError: (err: any) => {
      console.error("status update error:", err);
      toast.error("Failed to update status");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatusValue;
    setStatus(newStatus);
    mutate(newStatus); // always send API, including 'delivered'
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={handleChange}
        disabled={isLoading}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="pending">Pending</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
        <option value="delivered">Delivered</option>
      </select>
    </div>
  );
}

/* ========= Main OrdersPage ========= */
export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    orderId: "",
    orderTitle: "",
  });
  const [deletePending, setDeletePending] = useState<string | null>(null);

  const limit = 6;

  // Using api.post like your style for list
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["orders", currentPage, selectedStatus, limit],
    queryFn: async () => {
      const requestBody: any = { page: currentPage, limit };
      if (selectedStatus) requestBody.status = selectedStatus;
      const res = await api.post("/api/order/list", requestBody);
      // assume res.data matches ApiResponse shape
      return res.data;
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const orders = data?.data || [];
  const pagination = data?.pagination;

  const openDeleteModal = (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);
    const orderTitle = order
      ? `${order.product.category} - ${order.product.subCategory}`
      : "Order";
    setDeleteModal({ isOpen: true, orderId, orderTitle });
  };

  const closeDeleteModal = () => {
    if (!deletePending) {
      setDeleteModal({ isOpen: false, orderId: "", orderTitle: "" });
    }
  };

  const confirmDeleteOrder = async () => {
    if (deleteModal.orderId) {
      setDeletePending(deleteModal.orderId);
      try {
        await api.post("/api/order/delete", { id: deleteModal.orderId });
        toast.success("Order deleted");
        refetch();
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error("Failed to delete order");
      } finally {
        setDeletePending(null);
        setDeleteModal({ isOpen: false, orderId: "", orderTitle: "" });
      }
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load orders
          </h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4 px-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">
              My Orders
            </h1>
          </div>

          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-green-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 mt-6">
              <img
                src={mockIllustration}
                alt="No Orders"
                className="w-28 lg:w-36 h-28 lg:h-36 mx-auto mb-6 object-contain opacity-70"
              />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-3">
                {selectedStatus ? `No ${selectedStatus} orders found` : "You haven't created any orders yet."}
              </h3>
              <p className="text-gray-500 text-sm lg:text-base mb-6 max-w-md mx-auto">
                {selectedStatus
                  ? `Try selecting a different status filter to view other orders.`
                  : `Click the "New Order" button to create your first order.`}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onDelete={openDeleteModal}
                    deletePending={deletePending === order._id}
                    onStatusUpdated={() => refetch()}
                  />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  limit={pagination.limit}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteOrder}
        orderTitle={deleteModal.orderTitle}
        isDeleting={!!deletePending}
      />
    </>
  );
}

// Order Card Component
interface OrderCardProps {
  order: Order;
  onDelete: (orderId: string) => void;
  deletePending: boolean;
  onStatusUpdated?: () => void;
}

function OrderCard({ order, onDelete, deletePending, onStatusUpdated }: OrderCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);

  const totalPrice = order.quantity * order.product.sellingPrice;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-4">
        {/* Header with category and status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
            {order.product.category}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Product details */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 capitalize">
            {order.product.subCategory}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Quantity: {order.quantity} units</p>
            <p>Price per unit: {formatPrice(order.product.sellingPrice)}</p>
            <p className="font-medium text-gray-900">Total: {formatPrice(totalPrice)}</p>
          </div>
        </div>

        {/* Customer info */}
        <div className="mb-3">
          <p className="text-sm text-gray-600">👤 {order.createdBy.name}</p>
          <p className="text-sm text-gray-600">📍 {order.createdBy.address.village}, {order.createdBy.address.district}</p>
          <p className="text-sm text-gray-600">📱 {order.createdBy.mobile}</p>
        </div>

        {/* Created date */}
        <div className="mb-4">
          <p className="text-xs text-gray-500">Created: {formatDate(order.createdAt)}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Status dropdown (fixed) */}
          <div className="flex-1">
            <OrderStatus
              orderId={order._id}
              currentStatus={order.status}
              onUpdated={onStatusUpdated}
            />
          </div>

          {/* Delete button */}
          <div className="w-36">
            <button
              onClick={() => onDelete(order._id)}
              disabled={deletePending}
              className="w-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200"
            >
              {deletePending ? (
                <div className="flex items-center justify-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
