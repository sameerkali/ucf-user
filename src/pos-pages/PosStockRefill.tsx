// src/pages/StockRefill.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

// Types
type ApiEnvelope<T> = {
  status_code: number;
  data: T;
  message?: string;
};

type Pagination = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
};

type CreatedBy = {
  _id: string;
  name: string;
  mobile?: string;
};

type ProductInOrder = {
  quantity: number;
  buyingValue?: number;
  sellingValue?: number;
  product: {
    _id: string;
    category: string;
    subCategory: string;
    sellingPrice?: number;
  };
};

type BulkOrder = {
  _id: string;
  createdBy: CreatedBy;
  type: string;
  products: ProductInOrder[];
  totalBuyingValue?: number;
  totalSellingValue?: number;
  status: "draft" | "pending" | "approved" | "rejected" | "received" | "delivered";
  createdAt: string;
  updatedAt: string;
};

type BulkOrderList = {
  pagination: Pagination;
  bulkOrders: BulkOrder[];
};

type DropdownCategory = {
  category: string;
  subCategories: { name: string; productId: string; price: number }[];
};

type EditOrderProduct = {
  product: string; // productId
  quantity: number;
};

// API
async function fetchBulkOrders(page: number, limit: number): Promise<BulkOrderList> {
  const res = await api.post<ApiEnvelope<BulkOrderList>>("api/bulkOrder", { page, limit });
  if (res.data.status_code === 200) return res.data.data;
  throw new Error(`API error! status_code: ${res.data.status_code}`);
}

async function fetchProductsDropdown(): Promise<DropdownCategory[]> {
  const res = await api.get<ApiEnvelope<DropdownCategory[]>>("api/products/dropdown");
  if (res.data.status_code === 200) return res.data.data;
  throw new Error(`API error! status_code: ${res.data.status_code}`);
}

async function editBulkOrder(orderId: string, products: EditOrderProduct[]) {
  const res = await api.patch<ApiEnvelope<unknown>>("api/bulkOrder/edit", { orderId, products });
  if (res.data.status_code === 200) return res.data.data;
  throw new Error(`API error! status_code: ${res.data.status_code}`);
}

async function updateBulkOrderStatus(orderId: string, status: "pending" | "received" | "delivered") {
  const res = await api.patch<ApiEnvelope<unknown>>("api/bulkOrder/update-status", { orderId, status });
  if (res.data.status_code === 200) return res.data.data;
  throw new Error(`API error! status_code: ${res.data.status_code}`);
}

async function deleteBulkOrder(orderId: string) {
  const res = await api.patch<ApiEnvelope<unknown>>("api/bulkOrder/delete", { orderId });
  if (res.data.status_code === 200) return res.data.data;
  throw new Error(`API error! status_code: ${res.data.status_code}`);
}

// Helpers
function formatCurrency(n?: number) {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id;
}

const qk = {
  bulkOrders: (page: number, limit: number) => ["bulkOrders", page, limit] as const,
  productsDropdown: ["productsDropdown"] as const,
};

// UI atoms
const Badge: React.FC<{ color?: "green" | "gray" | "blue"; children: React.ReactNode }> = ({ color = "gray", children }) => {
  const c =
    color === "green"
      ? "bg-green-50 text-green-700 ring-green-200"
      : color === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : "bg-gray-50 text-gray-700 ring-gray-200";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${c}`}>{children}</span>;
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline"; tone?: "green" | "gray" | "danger"; size?: "sm" | "md" }> = ({
  className = "",
  variant = "solid",
  tone = "green",
  size = "md",
  disabled,
  ...props
}) => {
  const base = "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
  }[size];
  const tones = {
    green: variant === "solid"
      ? "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600"
      : "border border-green-600 text-green-700 hover:bg-green-50 focus-visible:ring-green-600",
    gray: variant === "solid"
      ? "bg-gray-800 hover:bg-gray-900 text-white focus-visible:ring-gray-800"
      : "border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400",
    danger: variant === "solid"
      ? "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600"
      : "border border-red-600 text-red-700 hover:bg-red-50 focus-visible:ring-red-600",
  }[tone];
  return <button className={`${base} ${sizes} ${tones} ${className}`} disabled={disabled} {...props} />;
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...props }) => (
  <input
    className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-600 focus:ring-2 focus:ring-green-600/30 ${className}`}
    {...props}
  />
);

const SelectEl: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = "", children, ...props }) => (
  <select
    className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:ring-2 focus:ring-green-600/30 ${className}`}
    {...props}
  >
    {children}
  </select>
);

// Edit modal types
type EditableRow = {
  productId: string;
  category: string;
  subCategory: string;
  quantity: number;
  price?: number;
};

// Add product popup
const AddProductPopup: React.FC<{
  open: boolean;
  onClose: () => void;
  catalog: DropdownCategory[];
  onAdd: (row: EditableRow) => void;
}> = ({ open, onClose, catalog, onAdd }) => {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [quantity, setQuantity] = useState<number>(1);

  const subs = useMemo(() => {
    const cat = catalog.find((c) => c.category === category);
    return cat?.subCategories ?? [];
  }, [catalog, category]);

  const selected = subs.find((s) => s.name === subCategory);

  function reset() {
    setCategory("");
    setSubCategory("");
    setQuantity(1);
  }

  function handleConfirm() {
    if (!category || !selected || quantity <= 0) return;
    onAdd({
      productId: selected.productId,
      category,
      subCategory: selected.name,
      quantity,
      price: selected.price,
    });
    reset();
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b p-4">
          <h3 className="text-base font-semibold text-gray-900">Add product</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <SelectEl value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(""); }}>
              <option value="">Select</option>
              {catalog.map((c) => (
                <option key={c.category} value={c.category}>{c.category}</option>
              ))}
            </SelectEl>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Subcategory</label>
            <SelectEl value={subCategory} onChange={(e) => setSubCategory(e.target.value)} disabled={!category}>
              <option value="">Select</option>
              {subs.map((s) => (
                <option key={s.productId} value={s.name}>{s.name}</option>
              ))}
            </SelectEl>
            {selected && (
              <p className="mt-1 text-xs text-gray-500">Price: {formatCurrency(selected.price)}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t p-4">
          <Button variant="outline" tone="gray" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button onClick={handleConfirm}>Add</Button>
        </div>
      </div>
    </div>
  );
};

// Edit modal
const EditOrderModal: React.FC<{
  open: boolean;
  onClose: () => void;
  order: BulkOrder | null;
  catalog: DropdownCategory[] | undefined;
  onSave: (rows: EditableRow[]) => void;
  saving: boolean;
}> = ({ open, onClose, order, catalog, onSave, saving }) => {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (open && order) {
      const initial: EditableRow[] = order.products.map((p) => ({
        productId: p.product._id,
        category: p.product.category,
        subCategory: p.product.subCategory,
        quantity: p.quantity,
        price: p.product.sellingPrice,
      }));
      setRows(initial);
    }
  }, [open, order]);

  const priceIndex = useMemo(() => {
    const index: Record<string, { price: number; category: string; subCategory: string }> = {};
    (catalog ?? []).forEach((c) => {
      c.subCategories.forEach((s) => {
        index[s.productId] = { price: s.price, category: c.category, subCategory: s.name };
      });
    });
    return index;
  }, [catalog]);

  const total = useMemo(() => {
    return rows.reduce((sum, r) => sum + (r.price ?? priceIndex[r.productId]?.price ?? 0) * r.quantity, 0);
  }, [rows, priceIndex]);

  function updateRow(idx: number, patch: Partial<EditableRow>) {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAdd(row: EditableRow) {
    setRows((prev) => {
      const existingIdx = prev.findIndex((r) => r.productId === row.productId);
      if (existingIdx >= 0) {
        const merged = [...prev];
        merged[existingIdx] = { ...merged[existingIdx], quantity: merged[existingIdx].quantity + row.quantity, category: row.category, subCategory: row.subCategory, price: row.price ?? merged[existingIdx].price };
        return merged;
      }
      return [...prev, row];
    });
  }

  function handleSave() {
    if (!order) return;
    const payload = rows
      .filter((r) => r.quantity > 0 && r.productId)
      .map((r) => ({ product: r.productId, quantity: r.quantity }));
    if (payload.length === 0) return;
    onSave(rows);
  }

  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-base font-semibold text-gray-900">Edit order {shortId(order._id)}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
            <span className="sr-only">Close</span>✕
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge color={order.status === "draft" || order.status === "pending" ? "green" : "gray"}>{order.status}</Badge>
              <span className="text-sm text-gray-500">Created by {order.createdBy?.name || "—"}</span>
            </div>
            <Button variant="outline" onClick={() => setShowAdd(true)}>Add another product</Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-green-800">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-green-800">Subcategory</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-green-800">Price</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-green-800">Quantity</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-green-800">Line Total</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, idx) => {
                  const resolved = priceIndex[r.productId];
                  const price = r.price ?? resolved?.price ?? 0;
                  return (
                    <tr key={`${r.productId}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{r.category || resolved?.category || "—"}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{r.subCategory || resolved?.subCategory || "—"}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{formatCurrency(price)}</td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={1}
                          value={r.quantity}
                          onChange={(e) => updateRow(idx, { quantity: Math.max(1, Number(e.target.value)) })}
                          className="w-24"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-sm text-gray-900">{formatCurrency(price * r.quantity)}</td>
                      <td className="px-3 py-2 text-right">
                        <Button variant="outline" tone="danger" size="sm" onClick={() => removeRow(idx)}>Remove</Button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">No products. Add one to begin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-end gap-6">
            <div className="text-sm text-gray-700">Total preview</div>
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(total)}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t p-4">
          <Button variant="outline" tone="gray" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </div>
      </div>

      <AddProductPopup
        open={showAdd}
        onClose={() => setShowAdd(false)}
        catalog={catalog ?? []}
        onAdd={handleAdd}
      />
    </div>
  );
};

// Main Page
const StockRefill: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<BulkOrder | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const qc = useQueryClient();

  const ordersQ = useQuery({
    queryKey: qk.bulkOrders(page, limit),
    queryFn: () => fetchBulkOrders(page, limit),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const catalogQ = useQuery({
    queryKey: qk.productsDropdown,
    queryFn: () => fetchProductsDropdown(),
    staleTime: 1000 * 60 * 30,
  });

  const editMut = useMutation({
    mutationFn: async (rows: EditableRow[]) => {
      if (!selected) throw new Error("No order selected");
      const payload = rows.map((r) => ({ product: r.productId, quantity: r.quantity }));
      return editBulkOrder(selected._id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.bulkOrders(page, limit) });
      setEditOpen(false);
    },
  });

  const sendMut = useMutation({
    mutationFn: async (orderId: string) => updateBulkOrderStatus(orderId, "pending"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.bulkOrders(page, limit) });
    },
  });

  const transitionMut = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: "received" | "delivered" }) =>
      updateBulkOrderStatus(orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.bulkOrders(page, limit) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (orderId: string) => deleteBulkOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.bulkOrders(page, limit) });
    },
  });

  const data = ordersQ.data;
  const orders = data?.bulkOrders ?? [];
  const pagination = data?.pagination;

  function openEdit(order: BulkOrder) {
    setSelected(order);
    setEditOpen(true);
  }

  function sendOrder(order: BulkOrder) {
    if (!["draft", "pending"].includes(order.status)) return;
    sendMut.mutate(order._id);
  }

  function canEditOrSend(status: BulkOrder["status"]) {
    // Enabled only for draft and pending
    return ["draft", "pending"].includes(status);
  }

  function onStatusTransition(order: BulkOrder, next: "received" | "delivered") {
    transitionMut.mutate({ orderId: order._id, status: next });
  }

  function onDelete(order: BulkOrder) {
    if (!["draft", "pending"].includes(order.status)) return;
    if (!confirm("Delete this order? This action cannot be undone.")) return;
    deleteMut.mutate(order._id);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Bulk Orders</h1>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-600">Per page</span>
                <SelectEl value={String(limit)} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
                  {[4, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </SelectEl>
              </div>
              <Badge color="green">Green & white</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border shadow-sm">
          <div className="flex items-center justify-between border-b bg-green-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-800">Orders</span>
              {ordersQ.isFetching && <span className="text-xs text-green-700">Refreshing…</span>}
            </div>
            <div className="sm:hidden">
              <SelectEl value={String(limit)} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
                {[4, 10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
              </SelectEl>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.map((o) => {
                  const disabledActions = !canEditOrSend(o.status);
                  const showReceivedDropdown = o.status === "approved";
                  const showDeliveredDropdown = o.status === "received";
                  return (
                    <tr key={o._id} className="hover:bg-green-50/40">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{shortId(o._id)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.createdBy?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge color={["draft", "pending"].includes(o.status) ? "green" : "gray"}>{o.status}</Badge>
                          {showReceivedDropdown && (
                            <SelectEl
                              className="w-36"
                              onChange={(e) => {
                                if (e.target.value === "received") onStatusTransition(o, "received");
                                e.currentTarget.selectedIndex = 0;
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Actions</option>
                              <option value="received">Mark as received</option>
                            </SelectEl>
                          )}
                          {showDeliveredDropdown && (
                            <SelectEl
                              className="w-36"
                              onChange={(e) => {
                                if (e.target.value === "delivered") onStatusTransition(o, "delivered");
                                e.currentTarget.selectedIndex = 0;
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Actions</option>
                              <option value="delivered">Mark as delivered</option>
                            </SelectEl>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(o.totalSellingValue)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.updatedAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => openEdit(o)}
                            disabled={disabledActions}
                            title={disabledActions ? "Edit disabled for this status" : "Edit order"}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => sendOrder(o)}
                            disabled={disabledActions || sendMut.isPending}
                            title={disabledActions ? "Send disabled for this status" : "Send order"}
                          >
                            {sendMut.isPending ? "Sending…" : "Send"}
                          </Button>
                          <Button
                            variant="outline"
                            tone="danger"
                            onClick={() => onDelete(o)}
                            disabled={!["draft", "pending"].includes(o.status) || deleteMut.isPending}
                            title={["draft", "pending"].includes(o.status) ? "Delete order" : "Delete disabled for this status"}
                          >
                            {deleteMut.isPending ? "Deleting…" : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && !ordersQ.isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
            {orders.map((o) => {
              const disabledActions = !canEditOrSend(o.status);
              const showReceivedDropdown = o.status === "approved";
              const showDeliveredDropdown = o.status === "received";
              return (
                <div key={o._id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">Order {shortId(o._id)}</div>
                    <Badge color={["draft", "pending"].includes(o.status) ? "green" : "gray"}>{o.status}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Created by</div>
                    <div className="text-gray-900">{o.createdBy?.name || "—"}</div>
                    <div className="text-gray-500">Type</div>
                    <div className="text-gray-900">{o.type}</div>
                    <div className="text-gray-500">Total</div>
                    <div className="text-gray-900">{formatCurrency(o.totalSellingValue)}</div>
                    <div className="text-gray-500">Updated</div>
                    <div className="text-gray-900">{new Date(o.updatedAt).toLocaleString()}</div>
                  </div>

                  {(o.status === "approved" || o.status === "received") && (
                    <div className="mt-3">
                      <SelectEl
                        onChange={(e) => {
                          if (o.status === "approved" && e.target.value === "received") onStatusTransition(o, "received");
                          if (o.status === "received" && e.target.value === "delivered") onStatusTransition(o, "delivered");
                          e.currentTarget.selectedIndex = 0;
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Actions</option>
                        {o.status === "approved" && <option value="received">Mark as received</option>}
                        {o.status === "received" && <option value="delivered">Mark as delivered</option>}
                      </SelectEl>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEdit(o)}
                      disabled={disabledActions}
                      title={disabledActions ? "Edit disabled for this status" : "Edit order"}
                    >
                      Edit
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => sendOrder(o)}
                      disabled={disabledActions || sendMut.isPending}
                      title={disabledActions ? "Send disabled for this status" : "Send order"}
                    >
                      {sendMut.isPending ? "Sending…" : "Send"}
                    </Button>
                    <Button
                      variant="outline"
                      tone="danger"
                      className="flex-1"
                      onClick={() => onDelete(o)}
                      disabled={!["draft", "pending"].includes(o.status) || deleteMut.isPending}
                      title={["draft", "pending"].includes(o.status) ? "Delete order" : "Delete disabled for this status"}
                    >
                      {deleteMut.isPending ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && !ordersQ.isLoading && (
              <div className="rounded-lg border p-6 text-center text-sm text-gray-500">No orders found.</div>
            )}
          </div>

          {/* Loading and error states */}
          {ordersQ.isLoading && <div className="p-6 text-sm text-gray-600">Loading orders…</div>}
          {ordersQ.isError && <div className="p-4 text-sm text-red-600">Failed to load orders.</div>}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                tone="gray"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || ordersQ.isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                tone="gray"
                onClick={() => setPage((p) => (pagination ? Math.min(pagination.totalPages, p + 1) : p + 1))}
                disabled={!pagination || page >= pagination.totalPages || ordersQ.isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <EditOrderModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        order={selected}
        catalog={catalogQ.data}
        onSave={(rows) => editMut.mutate(rows)}
        saving={editMut.isPending}
      />
    </div>
  );
};

export default StockRefill;
