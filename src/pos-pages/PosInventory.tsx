import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

// Types
type Category = "FERTILIZER" | "SEED" | "EQUIPMENT" | "HELP" | string;
type ProductSummary = { _id: string; name: string; category: Category; buyingPrice: number; sellingPrice: number };
type InventoryItem = { posId: string; lastUpdated: string; product: ProductSummary; inventoryId: string; productId: string; quantity: number };
type InventoryResponse = { status_code: number; totalProducts: number; data: InventoryItem[] };
type DropdownResponse = { status_code: number; data: { category: Category; subCategories: { name: string; productId: string; price: number }[] }[] };

// Helpers
const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const formatCurrency = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// Spinner + Button with loader
const Spinner = ({ className }: { className?: string }) => (
  <svg className={cn("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
  </svg>
);

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md"; loading?: boolean }
) {
  const { className, variant = "primary", size = "md", loading, disabled, children, ...rest } = props;
  const base = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors";
  const sizes = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variants =
    variant === "primary"
      ? "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600"
      : variant === "secondary"
      ? "bg-white text-green-700 border border-green-200 hover:bg-green-50 focus-visible:ring-green-600"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
      : "bg-transparent text-green-700 hover:bg-green-50 focus-visible:ring-green-600";
  return (
    <button
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(base, sizes, variants, "disabled:opacity-60 disabled:cursor-not-allowed", className)}
      {...rest}
    >
      <span className="flex items-center gap-2">{loading ? <Spinner /> : null}<span>{children}</span></span>
    </button>
  );
}

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={cn(
      "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
      "focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 disabled:opacity-60",
      p.className
    )}
  />
);
const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...p}
    className={cn("w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600", p.className)}
  />
);

// Query keys
const QK = { dropdown: ["dropdown"] as const, inventory: (k?: string) => ["inventory", k ?? "initial"] as const };

// API
async function getDropdown(): Promise<DropdownResponse["data"]> {
  const res = await api.get("/api/products/dropdown");
  const data: DropdownResponse = res.data;
  if (data.status_code !== 200) throw new Error(`Dropdown error: ${data.status_code}`);
  return data.data;
}
type InventoryPayload = { filters?: { productId?: string; category?: string; lowStockBelow?: number }; page?: number; limit?: number };
async function postInventory(payload?: InventoryPayload): Promise<InventoryResponse> {
  const res = await api.post("api/inventory/my-stock", payload ?? { filters: {} });
  if (res.status !== 200) throw new Error(`Inventory error: ${res.status}`);
  return res.data as InventoryResponse;
}
async function patchStock(payload: { productId: string; quantity: number; source: "manual" | string }) {
  const res = await api.patch("api/inventory/set", payload, { headers: { "Content-Type": "application/json" } });
  if (res.status >= 400) throw new Error(`Update stock failed: ${res.status}`);
  return res.data;
}
async function deleteProduct(productId: string) {
  const res = await api.delete(`api/inventory/${productId}`);
  if (res.status >= 400) throw new Error(`Delete failed: ${res.status}`);
  return res.data;
}

// Page
const Inventory: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters (compact; no search/sort)
  const [filters, setFilters] = useState<{ category?: string; productId?: string; lowStockBelow?: number; page: number; limit: number }>({
    page: 1,
    limit: 20,
    category: undefined,
    productId: undefined,
    lowStockBelow: undefined,
  });

  // Small button loaders
  const [applyBusy, setApplyBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);

  // Queries
  const { data: dropdownData, error: dropdownError } = useQuery({ queryKey: QK.dropdown, queryFn: getDropdown, staleTime: 5 * 60 * 1000 });
  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError, refetch: refetchInitial } = useQuery({
    queryKey: QK.inventory("initial"),
    queryFn: () => postInventory({ filters: {} }),
    refetchOnWindowFocus: false,
  });

  const categoriesUI = useMemo(
    () => (dropdownData ?? []).map((c) => ({ category: c.category, subCategories: c.subCategories.map((s) => ({ name: s.name, productId: s.productId })) })),
    [dropdownData]
  );
  const items = inventoryData?.data ?? [];
  const total = inventoryData?.totalProducts ?? 0;

  const applyFilters = async () => {
    setApplyBusy(true);
    try {
      const payload: InventoryPayload = {
        filters: {
          productId: filters.productId || undefined,
          category: filters.category || undefined,
          lowStockBelow: typeof filters.lowStockBelow === "number" ? filters.lowStockBelow : undefined,
        },
        page: filters.page,
        limit: filters.limit,
      };
      const key = QK.inventory(JSON.stringify(payload));
      await queryClient.prefetchQuery({ queryKey: key, queryFn: () => postInventory(payload) });
      queryClient.setQueryData(QK.inventory("initial"), queryClient.getQueryData(key));
    } finally {
      setApplyBusy(false);
    }
  };

  // Mutations
  const adjustMutation = useMutation({
    mutationFn: (p: { productId: string; quantity: number }) => patchStock({ ...p, source: "manual" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
  const removeMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  // UI state
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  // Button handlers with loaders
  const onRefresh = async () => {
    setRefreshBusy(true);
    try {
      await refetchInitial();
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    } finally {
      setRefreshBusy(false);
    }
  };
  const onExport = () => {
    setExportBusy(true);
    try {
      const header = ["Name", "Category", "Quantity", "BuyingPrice", "SellingPrice", "LastUpdated"];
      const rows = items.map((i) => [i.product.name, i.product.category, i.quantity, i.product.buyingPrice, i.product.sellingPrice, new Date(i.lastUpdated).toISOString()]);
      const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportBusy(false);
    }
  };
  const onReset = async () => {
    setResetBusy(true);
    try {
      setFilters({ page: 1, limit: 20, category: undefined, productId: undefined, lowStockBelow: undefined });
      await refetchInitial();
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-600 text-white flex items-center justify-center">📦</div>
          <h1 className="text-xl font-semibold text-gray-900">POS Inventory</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onExport} loading={exportBusy}>Export CSV</Button>
          <Button onClick={onRefresh} loading={refreshBusy}>Refresh</Button>
        </div>
      </header>

      {/* Compact filters (no search/sort) */}
      <section aria-label="Inventory filters" className="rounded-lg border bg-white p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Category</label>
            <Select
              value={filters.category ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined, productId: undefined, page: 1 }))}
              aria-label="Filter by category"
            >
              <option value="">All</option>
              {categoriesUI.map((c) => (
                <option key={c.category} value={c.category}>{c.category}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Product</label>
            <Select
              value={filters.productId ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, productId: e.target.value || undefined, page: 1 }))}
              aria-label="Filter by product"
              disabled={!filters.category}
            >
              <option value="">All</option>
              {categoriesUI.find((c) => c.category === filters.category)?.subCategories.map((s) => (
                <option key={s.productId} value={s.productId}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Low stock below</label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 100"
              value={filters.lowStockBelow ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, lowStockBelow: e.target.value === "" ? undefined : Number(e.target.value), page: 1 }))}
              aria-label="Low stock threshold"
            />
          </div>
          <div className="sm:col-span-3 lg:col-span-2 flex items-end justify-end gap-2">
            <Button variant="ghost" onClick={onReset} loading={resetBusy} aria-label="Reset filters">Reset</Button>
            <Button onClick={applyFilters} loading={applyBusy} aria-label="Apply filters">Apply</Button>
          </div>
        </div>
      </section>

      {/* Errors */}
      {dropdownError ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{(dropdownError as any)?.message ?? "Failed to load categories"}</div> : null}
      {inventoryError ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{(inventoryError as any)?.message ?? "Failed to load inventory"}</div> : null}

      {/* Table */}
      <section className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table role="table" className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-800">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-green-800">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-green-800">Buy</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-green-800">Sell</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-green-800">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-green-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {inventoryLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-600">Loading...</td></tr>
              ) : (items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-600">No inventory found</td></tr>
              ) : (
                items.map((item) => {
                  const low = item.quantity < 100;
                  return (
                    <tr key={item.productId} className={cn(low && "bg-red-50/30")}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.product.category}</td>
                      <td className={cn("px-4 py-3 text-right text-sm", low ? "text-red-700" : "text-gray-900")}>{item.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(item.product.buyingPrice)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(item.product.sellingPrice)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{new Date(item.lastUpdated).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => { setSelected(item); setAdjustOpen(true); }}>Adjust</Button>
                          <Button size="sm" variant="danger" onClick={() => { setSelected(item); setRemoveOpen(true); }}>Remove</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
          <div className="text-sm text-gray-700">Page {filters.page} • {total.toLocaleString()} items</div>
          <div className="flex items-center gap-2">
            <Select className="w-auto" value={String(filters.limit)} onChange={(e) => setFilters((f) => ({ ...f, limit: Number(e.target.value), page: 1 }))}>
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))} disabled={filters.page <= 1}>‹</Button>
              <Button variant="secondary" size="sm" onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} disabled={(items.length ?? 0) < filters.limit}>›</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Adjust dialog */}
      {adjustOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdjustOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Adjust stock</h2>
            <p className="text-sm text-gray-700 mb-3">Update quantity for <span className="font-medium">{selected.product.name}</span></p>
            <div className="flex items-center gap-2">
              <Input type="number" id="adjustQty" placeholder="Enter positive or negative number" />
              <Button
                onClick={() => {
                  const el = document.getElementById("adjustQty") as HTMLInputElement | null;
                  const delta = el?.value ? Number(el.value) : 0;
                  if (Number.isNaN(delta) || delta === 0) return;
                  adjustMutation.mutate({ productId: selected.productId, quantity: delta });
                  setAdjustOpen(false);
                }}
                loading={adjustMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Remove dialog */}
      {removeOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRemoveOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Remove product</h2>
            <p className="text-sm text-gray-700 mb-3">This will remove <span className="font-medium">{selected.product.name}</span> from stock.</p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setRemoveOpen(false)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => { removeMutation.mutate(selected.productId); setRemoveOpen(false); }}
                loading={removeMutation.isPending}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default Inventory;
