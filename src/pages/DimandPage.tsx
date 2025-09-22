import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight, Filter, Calendar, Package, Hash, IndianRupee, Trash2 } from "lucide-react";
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
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Delete Order
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{orderTitle}"? This action cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-800 disabled:opacity-50 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
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
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
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
    <div className="flex items-center gap-3 mb-8">
      <div className="flex items-center gap-2 text-gray-700">
        <Filter className="w-5 h-5" />
        <span className="font-medium">Filter by status:</span>
      </div>
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
        toast.success("Order deleted successfully");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 bg-gray-50">
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
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              My Orders
            </h1>
            <p className="text-gray-600">Manage and track all your orders</p>
          </div>

          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <Loader2 className="animate-spin w-10 h-10 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <img
                src={mockIllustration}
                alt="No Orders"
                className="w-32 lg:w-40 h-32 lg:h-40 mx-auto mb-6 object-contain opacity-70"
              />
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-3">
                {selectedStatus ? `No ${selectedStatus} orders found` : "You haven't created any orders yet"}
              </h3>
              <p className="text-gray-500 text-base lg:text-lg mb-8 max-w-md mx-auto">
                {selectedStatus
                  ? `Try selecting a different status filter to view other orders.`
                  : `Start creating orders to see them here.`}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onDelete={openDeleteModal}
                    deletePending={deletePending === order._id}
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
}

function OrderCard({ order, onDelete, deletePending }: OrderCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-400"
        };
      case "accepted":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          dot: "bg-green-400"
        };
      case "delivered":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          dot: "bg-blue-400"
        };
      case "rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-400"
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          dot: "bg-gray-400"
        };
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);

  const totalPrice = order.quantity * order.product.sellingPrice;
  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {order.product.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize leading-tight">
              {order.product.subCategory}
            </h3>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
            <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
            <span className="text-xs font-medium capitalize">{order.status}</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Hash className="w-4 h-4" />
              <span>Quantity</span>
            </div>
            <span className="font-semibold text-gray-900">{order.quantity} units</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <IndianRupee className="w-4 h-4" />
              <span>Price per unit</span>
            </div>
            <span className="font-semibold text-gray-900">{formatPrice(order.product.sellingPrice)}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <IndianRupee className="w-4 h-4" />
              <span>Total Amount</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
          <Calendar className="w-4 h-4" />
          <span>Created: {formatDate(order.createdAt)}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onDelete(order._id)}
          disabled={deletePending}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-sm"
        >
          {deletePending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Delete Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
