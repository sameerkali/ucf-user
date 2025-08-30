import { useState } from 'react';
import type { FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Users, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

// TypeScript interfaces updated for the new API response
interface Address {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface Request {
  _id: string;
  user: {
    _id: string;
    name: string;
    mobile: string;
  };
  userModel: string;
  userAddress: Address;
  type: string;
  title: string;
  description: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

type FilterStatus = 'all' | 'pending' | 'verified' | 'rejected';

const ReviewRequests: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('all');

  // Fetch requests
  const { data, isLoading, isError, error } = useQuery<{ success: boolean; requests: Request[] }>({
    queryKey: ['requests'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/requests/getAll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const requests = data?.requests || [];
  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'verified' | 'rejected' }) => {
      const token = localStorage.getItem('token');
      const { data } = await api.put('/api/requests/updateStatus', 
        { requestId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: (_, { status }) => {
      toast.success(`🎉 Request ${status === 'verified' ? 'approved' : 'rejected'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (error: any) => {
      toast.error(`❌ ${error?.response?.data?.message || error.message || 'Failed to update status'}`);
    }
  });

  // Calculate status counts
  const statusCounts = requests.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1, all: acc.all + 1 }),
    { all: 0, pending: 0, verified: 0, rejected: 0 }
  );

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  if (isLoading) return <LoadingScreen />;
  if (isError || !data?.success) return <ErrorScreen error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['requests'] })} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <Header navigate={navigate} />
        
        {requests.length > 0 && <FilterTabs filter={filter} setFilter={setFilter} counts={statusCounts} />}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {requests.length === 0 ? (
            <EmptyState onRefresh={() => queryClient.invalidateQueries({ queryKey: ['requests'] })} />
          ) : filteredRequests.length === 0 ? (
            <EmptyFilterState filter={filter} onShowAll={() => setFilter('all')} />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(request => (
                <RequestCard 
                  key={request._id} 
                  request={request} 
                  onUpdateStatus={(requestId, status) => updateStatusMutation.mutate({ requestId, status })}
                  isUpdating={updateStatusMutation.isPending}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>

        {requests.length > 0 && <SummaryStats counts={statusCounts} />}
      </div>
    </div>
  );
};

// Smaller components for better organization
const Header: FC<{ navigate: any }> = ({ navigate }) => (
  <div className="flex items-center mb-8">
    <button 
      onClick={() => navigate('/pos/home')}
      className="mr-4 p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 focus:outline-none"
    >
      <ArrowLeft className="w-5 h-5 text-gray-600" />
    </button>
    <div className="flex items-center">
      <div className="p-2 bg-green-100 rounded-full mr-3">
        <Users className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Farmer Requests</h1>
        <p className="text-sm text-gray-600">Approve or reject pending farmer applications</p>
      </div>
    </div>
  </div>
);

const FilterTabs: FC<{ filter: FilterStatus; setFilter: (f: FilterStatus) => void; counts: Record<string, number> }> = 
({ filter, setFilter, counts }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Filter className="w-5 h-5 text-gray-500" />
      <span className="font-medium text-gray-700">Filter by status:</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {(['all', 'pending', 'verified', 'rejected'] as FilterStatus[]).map(status => (
        <button
          key={status}
          onClick={() => setFilter(status)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === status ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status] || 0})
        </button>
      ))}
    </div>
  </div>
);

const RequestCard: FC<{
  request: Request;
  onUpdateStatus: (id: string, status: 'verified' | 'rejected') => void;
  isUpdating: boolean;
  formatDate: (date: string) => string;
}> = ({ request, onUpdateStatus, isUpdating, formatDate }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <div className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{request.user.name}</h3>
              <p className="text-gray-600">Mobile: {request.user.mobile}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[request.status]}`}>
              {request.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Type:</strong> {request.type}</p>
              <p><strong>Title:</strong> {request.title}</p>
            </div>
            <div>
              <p><strong>Village:</strong> {request.userAddress.village}</p>
              <p><strong>District:</strong> {request.userAddress.district}, {request.userAddress.state}</p>
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Submitted on {formatDate(request.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {request.status === 'pending' ? (
            <>
              <button
                onClick={() => onUpdateStatus(request._id, 'verified')}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve
              </button>
              <button
                onClick={() => onUpdateStatus(request._id, 'rejected')}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="animate-spin w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Reject
              </button>
            </>
          ) : (
            <div className={`px-6 py-3 rounded-xl font-semibold text-center ${
              request.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {request.status === 'verified' ? '✅ Approved' : '❌ Rejected'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center">
    <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center">
      <Loader2 className="animate-spin w-12 h-12 text-green-500 mb-4" />
      <p className="text-lg font-medium text-gray-600">Loading requests...</p>
    </div>
  </div>
);

const ErrorScreen: FC<{ error: any; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Requests</h2>
      <p className="text-gray-600 mb-4">{error?.message || 'Something went wrong'}</p>
      <button onClick={onRetry} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        Try Again
      </button>
    </div>
  </div>
);

const EmptyState: FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <div className="text-center py-16">
    <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
      <Users className="w-12 h-12 text-green-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Farmer Requests Yet</h3>
    <p className="text-gray-500 text-lg mb-6">There are no farmer requests to review at the moment.</p>
    <button onClick={onRefresh} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
      Refresh Requests
    </button>
  </div>
);

const EmptyFilterState: FC<{ filter: string; onShowAll: () => void }> = ({ filter, onShowAll }) => (
  <div className="text-center py-12">
    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No {filter} Requests</h3>
    <button onClick={onShowAll} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
      View All Requests
    </button>
  </div>
);

const SummaryStats: FC<{ counts: Record<string, number> }> = ({ counts }) => (
  <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { key: 'all', label: 'Total Requests', color: 'blue' },
        { key: 'pending', label: 'Pending', color: 'yellow' },
        { key: 'verified', label: 'Approved', color: 'green' },
        { key: 'rejected', label: 'Rejected', color: 'red' }
      ].map(({ key, label, color }) => (
        <div key={key} className={`text-center p-4 bg-${color}-50 rounded-xl`}>
          <p className={`text-2xl font-bold text-${color}-600`}>{counts[key] || 0}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      ))}
    </div>
  </div>
);

export default ReviewRequests;
