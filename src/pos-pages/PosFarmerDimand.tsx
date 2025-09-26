import React from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../api/axios';

type Address = {
  state?: string;
  district?: string;
  tehsil?: string;
  block?: string;
  village?: string;
  pincode?: string;
};

type Creator = {
  _id?: string;
  name?: string;
  fatherName?: string;
  mobile?: string;
  address?: Address;
  role?: string;
};

type Product = {
  _id?: string;
  category?: string;
  subCategory?: string;
  buyingPrice?: number;
  sellingPrice?: number;
  stock?: number;
  isActive?: boolean;
  createdBy?: string;
  createdByRole?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

type PendingOrder = {
  _id: string;
  createdBy?: Creator;
  product?: Product;
  quantity?: number;
  status?: string;
  createdAt?: string;
};

type PendingResponse = {
  status_code: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  orders: PendingOrder[];
};

type ListedOrder = {
  _id: string;
  createdBy?: Creator;
  createdByModel?: string;
  product?: Product;
  quantity?: number;
  status: 'accepted' | 'rejected' | 'delivered' | string;
  createdAt?: string;
  updatedAt?: string;
  handledBy?: any;
};

type ListResponse = {
  status_code: number;
  pagination: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: ListedOrder[];
};

type UpdateStatusPayload = {
  orderId: string;
  status: 'accepted' | 'rejected' | 'delivered';
};

type ListFilter = '' | 'accepted' | 'rejected' | 'delivered';

async function fetchIncomingOrders(page: number, limit: number): Promise<PendingResponse> {
  const { data } = await api.post<PendingResponse>('/api/order/incoming-order', { page, limit });
  if (data.status_code !== 200) throw new Error('Failed to fetch incoming orders');
  return data;
}

async function fetchOrdersList(status: ListFilter, page: number, limit: number): Promise<ListResponse> {
  const body: any = { page, limit };
  if (status) body.status = status;
  const { data } = await api.post<ListResponse>('/api/order/list', body);
  if (data.status_code !== 200) throw new Error('Failed to fetch orders list');
  return data;
} 

async function putOrderStatus(payload: UpdateStatusPayload): Promise<any> {
  const { data } = await api.put('/api/order/update-status', payload);
  return data;
} 

export default function PosFarmerDimand(){
  const queryClient = useQueryClient();

  const [pendingPage, setPendingPage] = React.useState<number>(1);
  const [pendingLimit, setPendingLimit] = React.useState<number>(6);

  // Extend tab type locally for UI only
  type UITab = ListFilter | 'pending';
  const [tab, setTab] = React.useState<UITab>('pending');

  const [listPage, setListPage] = React.useState<number>(1);
  const [listLimit, setListLimit] = React.useState<number>(6);

  const pendingQuery = useQuery<PendingResponse, Error>({
    queryKey: ['incoming-orders', pendingPage, pendingLimit],
    queryFn: () => fetchIncomingOrders(pendingPage, pendingLimit),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const listQuery = useQuery<ListResponse, Error>({
    queryKey: ['orders-list', tab === 'pending' ? '' : tab, listPage, listLimit],
    queryFn: () => fetchOrdersList(tab === 'pending' ? '' : (tab as ListFilter), listPage, listLimit),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: tab !== 'pending', // do not fetch list when viewing Pending tab UI
  });

  const mutateStatus = useMutation({
    mutationFn: async (vars: UpdateStatusPayload): Promise<any> => {
      const res = await putOrderStatus(vars);
      return res;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['incoming-orders', pendingPage, pendingLimit] }),
        queryClient.invalidateQueries({ queryKey: ['orders-list', tab === 'pending' ? '' : tab, listPage, listLimit] }),
      ]);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update status';
      alert(msg);
    },
  });

  const pendingTotal = pendingQuery.data?.pagination.total ?? 0;
  const pendingTotalPages = pendingQuery.data?.pagination.totalPages ?? 1;
  const pendingCanPrev = pendingPage > 1 && !pendingQuery.isPlaceholderData;
  const pendingCanNext = pendingPage < pendingTotalPages && !pendingQuery.isPlaceholderData;

  const listTotal = listQuery.data?.pagination.totalItems ?? 0;
  const listTotalPages = listQuery.data?.pagination.totalPages ?? 1;
  const listCanPrev = listPage > 1 && !listQuery.isPlaceholderData;
  const listCanNext = listPage < listTotalPages && !listQuery.isPlaceholderData;

  const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : '—');

  // Small helper to render a card (reused for both pending and listed orders)
  function OrderCard({
    id,
    createdBy,
    product,
    quantity,
    createdAt,
    showDeliveredToggle,
    showRejectedConfirm,
    address,
  }: {
    id: string;
    status?: string;
    createdBy?: Creator;
    product?: Product;
    quantity?: number;
    createdAt?: string;
    updatedAt?: string;
    showDeliveredToggle?: boolean;
    showRejectedConfirm?: boolean;
    address?: Address;
  }) {

    return (
      <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between bg-green-100 px-4 py-3">
        </div>
        <div className="grid gap-2 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Buyer</span>
            <span className="text-gray-800">{createdBy?.name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Mobile</span>
            <span className="text-gray-800">{createdBy?.mobile ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Product</span>
            <span className="text-gray-800">
              {(product?.category ?? '—') + ' • ' + (product?.subCategory ?? '—')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Qty</span>
            <span className="text-gray-800">{quantity ?? '—'}</span>
          </div>
          <div className="flex items-start justify-between text-sm">
            <span className="text-gray-500">Address</span>
            <span className="text-right text-gray-800">
              {(address?.village ?? '—') + ', ' + (address?.block ?? '—') + ', ' + (address?.tehsil ?? '—') + ', ' + (address?.district ?? '—') + ', ' + (address?.state ?? '—') + ' - ' + (address?.pincode ?? '—')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Created</span>
            <span className="text-gray-800">{fmt(createdAt)}</span>
          </div>
          
        </div>

        {/* Footer actions */}
        <div className="grid grid-cols-1 gap-2 px-4 pb-4">
          {showDeliveredToggle && (
            <label className="flex items-center gap-2 rounded-md border border-green-200 bg-white px-3 py-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-green-600"
                onChange={(e) => {
                  if (e.target.checked) {
                    mutateStatus.mutate({ orderId: id, status: 'delivered' });
                  }
                }}
              />
              <span className="font-semibold text-green-700">Mark as delivered</span>
            </label>
          )}

          {showRejectedConfirm && (
            <button
              onClick={() => mutateStatus.mutate({ orderId: id, status: 'rejected' })}
              disabled={mutateStatus.isPending}
              className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirm rejected
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <header className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-green-700">Orders Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              {pendingQuery.isFetching || listQuery.isFetching ? 'Refreshing…' : 'Up to date'}
            </span>
          </div>
        </header>

        {/* Tabs */}
        <section className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => { setTab('pending'); setListPage(1); }}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === 'pending' ? 'bg-green-600 text-white' : 'border border-green-200 bg-white text-green-700 hover:bg-green-50'}`}
            >
              Pending
            </button>
            <button
              onClick={() => { setTab('accepted'); setListPage(1); }}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === 'accepted' ? 'bg-green-600 text-white' : 'border border-green-200 bg-white text-green-700 hover:bg-green-50'}`}
            >
              Accepted
            </button>
            <button
              onClick={() => { setTab('rejected'); setListPage(1); }}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === 'rejected' ? 'bg-green-600 text-white' : 'border border-green-200 bg-white text-green-700 hover:bg-green-50'}`}
            >
              Rejected
            </button>
            <button
              onClick={() => { setTab('delivered'); setListPage(1); }}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === 'delivered' ? 'bg-green-600 text-white' : 'border border-green-200 bg-white text-green-700 hover:bg-green-50'}`}
            >
              Delivered
            </button>
            <button
              onClick={() => { setTab(''); setListPage(1); }}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === '' ? 'bg-green-600 text-white' : 'border border-green-200 bg-white text-green-700 hover:bg-green-50'}`}
            >
              All
            </button>
          </div>

          {/* Toolbar adapts to current tab */}
          <div className="mb-3 flex flex-col items-start justify-between gap-3 rounded-xl border border-green-100 bg-green-50 p-3 sm:flex-row sm:items-center">
            {tab === 'pending' ? (
              <div className="text-sm text-green-700">
                Status: <span className="font-semibold">pending</span> • Total: <span className="font-semibold">{pendingTotal}</span> • Page:{' '}
                <span className="font-semibold">{pendingQuery.data?.pagination.page ?? pendingPage}</span> / <span className="font-semibold">{pendingQuery.data?.pagination.totalPages ?? 1}</span>
              </div>
            ) : (
              <div className="text-sm text-green-700">
                Status: <span className="font-semibold">{tab || 'all'}</span> • Total: <span className="font-semibold">{listTotal}</span> • Page:{' '}
                <span className="font-semibold">{listQuery.data?.pagination.currentPage ?? listPage}</span> / <span className="font-semibold">{listTotalPages}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-sm text-green-700">Per page</label>

              {tab === 'pending' ? (
                <>
                  <select
                    className="rounded-md border border-green-200 bg-white px-2 py-1 text-sm text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={pendingLimit}
                    onChange={(e) => {
                      setPendingPage(1);
                      setPendingLimit(Number(e.target.value));
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                  </select>
                  <div className="ml-2 flex items-center gap-2">
                    <button
                      className="rounded-md border border-green-200 bg-white px-3 py-1 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                      disabled={!pendingCanPrev}
                    >
                      Prev
                    </button>
                    <button
                      className="rounded-md border border-green-200 bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setPendingPage((p) => Math.min(pendingTotalPages, p + 1))}
                      disabled={!pendingCanNext}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <select
                    className="rounded-md border border-green-200 bg-white px-2 py-1 text-sm text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={listLimit}
                    onChange={(e) => {
                      setListPage(1);
                      setListLimit(Number(e.target.value));
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                  </select>
                  <div className="ml-2 flex items-center gap-2">
                    <button
                      className="rounded-md border border-green-200 bg-white px-3 py-1 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setListPage((p) => Math.max(1, p - 1))}
                      disabled={!listCanPrev}
                    >
                      Prev
                    </button>
                    <button
                      className="rounded-md border border-green-200 bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                      disabled={!listCanNext}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tab content */}
          {tab === 'pending' ? (
            pendingQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: pendingLimit }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-4">
                    <div className="mb-3 h-6 w-2/3 rounded bg-gray-200" />
                    <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                    <div className="mb-2 h-4 w-5/6 rounded bg-gray-200" />
                    <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="h-10 rounded bg-gray-200" />
                      <div className="h-10 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingQuery.isError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                {(pendingQuery.error as Error)?.message || 'Failed to load pending orders'}
              </div>
            ) : pendingQuery.data?.orders?.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pendingQuery.data.orders.map((order) => {
                  const address = order.createdBy?.address;
                  return (
                    <div key={order._id} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <div className="flex items-center justify-between bg-green-100 px-4 py-3">
                      </div>
                      <div className="grid gap-2 px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Buyer</span>
                          <span className="text-gray-800">{order.createdBy?.name ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Mobile</span>
                          <span className="text-gray-800">{order.createdBy?.mobile ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Product</span>
                          <span className="text-gray-800">
                            {(order.product?.category ?? '—') + ' • ' + (order.product?.subCategory ?? '—')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Qty</span>
                          <span className="text-gray-800">{order.quantity ?? '—'}</span>
                        </div>
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-gray-500">Address</span>
                          <span className="text-right text-gray-800">
                            {(address?.village ?? '—') + ', ' + (address?.block ?? '—') + ', ' + (address?.tehsil ?? '—') + ', ' + (address?.district ?? '—') + ', ' + (address?.state ?? '—') + ' - ' + (address?.pincode ?? '—')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Created</span>
                          <span className="text-gray-800">{fmt(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                        <button
                          onClick={() => mutateStatus.mutate({ orderId: order._id, status: 'accepted' })}
                          disabled={mutateStatus.isPending}
                          className="rounded-md border border-green-600 bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => mutateStatus.mutate({ orderId: order._id, status: 'rejected' })}
                          disabled={mutateStatus.isPending}
                          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 bg-white p-6 text-center text-gray-600">No pending orders</div>
            )
          ) : listQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: listLimit }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-4">
                  <div className="mb-3 h-6 w-2/3 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-5/6 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="h-10 rounded bg-gray-200" />
                    <div className="h-10 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : listQuery.isError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
              {(listQuery.error as Error)?.message || 'Failed to load orders'}
            </div>
          ) : listQuery.data?.data?.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listQuery.data.data.map((order) => {
                const address = order.createdBy?.address;
                return (
                  <OrderCard
                    key={order._id}
                    id={order._id}
                    status={order.status}
                    createdBy={order.createdBy}
                    product={order.product}
                    quantity={order.quantity}
                    createdAt={order.createdAt}
                    updatedAt={order.updatedAt}
                    address={address}
                    showDeliveredToggle={tab === 'accepted'}
                    showRejectedConfirm={tab === 'rejected'}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 bg-white p-6 text-center text-gray-600">No orders</div>
          )}
        </section>
      </div>
    </div>
  );
}

