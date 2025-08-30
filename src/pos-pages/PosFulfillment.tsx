import { useState } from 'react';
import type { FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, Filter, ArrowLeft, FileText, Clock, MapPin, Package, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Updated TypeScript interfaces based on actual API response
interface Location {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface PostCrop {
  name: string;
  type: string;
  quantity: number;
  pricePerQuintal: number;
}

interface FulfillmentCrop {
  name: string;
  quantity: number;
  _id: string;
}

interface Post {
  createdBy: { id: string; role: string };
  _id: string;
  type: string;
  crops: PostCrop[];
  title: string;
  description: string;
  requiredByDate: string;
  photos: string[];
  videos: string[];
  location: Location;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Fulfillment {
  requestedBy: { id: string; role: string };
  _id: string;
  post: Post;
  crops: FulfillmentCrop[];
  status: 'pending' | 'approved' | 'rejected';
  deliveryStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status_code: number;
  message: string;
  data: Fulfillment[];
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const PosFulfillment: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [postIdFilter, setPostIdFilter] = useState<string>('');

  // Fetch fulfillments query
  const { data, isLoading, isError, error } = useQuery<ApiResponse>({
    queryKey: ['fulfillments', postIdFilter],
    queryFn: async (): Promise<ApiResponse> => {
      const token = localStorage.getItem('token');
      const { data } = await api.post('/api/fulfillments/incoming-fulfillment', 
        { filters: { post: postIdFilter || undefined } },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ fulfillmentId, status }: { fulfillmentId: string; status: 'approve' | 'reject' }) => {
      const token = localStorage.getItem('token');
      const { data } = await api.post('/api/fulfillments/approve', 
        { fulfillmentId, status },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return data;
    },
    onSuccess: (_, { status }) => {
      toast.success(`🎉 Fulfillment ${status === 'approve' ? 'approved' : 'rejected'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
    },
    onError: (error: any) => {
      toast.error(`❌ ${error?.response?.data?.message || error.message || 'Failed to update status'}`);
    }
  });

  const fulfillments = data?.data || [];
  const filteredFulfillments = filter === 'all' ? fulfillments : fulfillments.filter(f => f.status === filter);

  // Status counts for filter badges
  const statusCounts = fulfillments.reduce(
    (acc, f) => ({ ...acc, [f.status]: (acc[f.status] || 0) + 1, all: acc.all + 1 }),
    { all: 0, pending: 0, approved: 0, rejected: 0 }
  );

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });

  const handleStatusUpdate = (fulfillmentId: string, status: 'approve' | 'reject') => {
    updateStatusMutation.mutate({ fulfillmentId, status });
  };

  if (isLoading) return <LoadingScreen />;
  if (isError || data?.status_code !== 200) return <ErrorScreen error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['fulfillments'] })} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 px-3 py-4 sm:px-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <Header navigate={navigate} />
        <FiltersSection {...{postIdFilter, setPostIdFilter, filter, setFilter, counts: statusCounts}} />
        
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          {filteredFulfillments.length === 0 ? (
            <EmptyState filter={filter} onShowAll={() => setFilter('all')} />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredFulfillments.map(fulfillment => (
                <FulfillmentCard 
                  key={fulfillment._id} 
                  fulfillment={fulfillment}
                  onUpdateStatus={handleStatusUpdate}
                  isUpdating={updateStatusMutation.isPending}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>

        {fulfillments.length > 0 && <SummaryStats counts={statusCounts} />}
      </div>
    </div>
  );
};

const Header: FC<{ navigate: any }> = ({ navigate }) => (
  <div className="flex items-center mb-6 sm:mb-8">
    <button 
      onClick={() => navigate('/pos/home')}
      className="mr-3 sm:mr-4 p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 focus:outline-none"
    >
      <ArrowLeft className="w-5 h-5 text-gray-600" />
    </button>
    <div className="flex items-center">
      <div className="p-2 bg-green-100 rounded-full mr-3">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fulfillment Requests</h1>
        <p className="text-xs sm:text-sm text-gray-600">Accept or reject incoming fulfillment requests</p>
      </div>
    </div>
  </div>
);

const FiltersSection: FC<{
  postIdFilter: string;
  setPostIdFilter: (value: string) => void;
  filter: FilterStatus;
  setFilter: (filter: FilterStatus) => void;
  counts: Record<string, number>;
}> = ({ postIdFilter, setPostIdFilter, filter, setFilter, counts }) => (
  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 space-y-4">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Post ID</label>
      <input
        type="text"
        placeholder="Enter post ID to filter fulfillments..."
        value={postIdFilter}
        onChange={(e) => setPostIdFilter(e.target.value)}
        className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
      />
    </div>

    <div>
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        <span className="font-medium text-gray-700 text-sm sm:text-base">Filter by status:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
              filter === status ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status] || 0})
          </button>
        ))}
      </div>
    </div>
  </div>
);

const FulfillmentCard: FC<{
  fulfillment: Fulfillment;
  onUpdateStatus: (id: string, status: 'approve' | 'reject') => void;
  isUpdating: boolean;
  formatDate: (date: string) => string;
}> = ({ fulfillment, onUpdateStatus, isUpdating, formatDate }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const totalFulfillmentQuantity = fulfillment.crops.reduce((sum, crop) => sum + crop.quantity, 0);
  const totalPostQuantity = fulfillment.post.crops.reduce((sum, crop) => sum + crop.quantity, 0);
  const totalPostValue = fulfillment.post.crops.reduce((sum, crop) => sum + (crop.quantity * crop.pricePerQuintal), 0);

  return (
    <div className="border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 leading-tight">{fulfillment.post.title}</h3>
          <p className="text-gray-600 text-sm">Fulfillment ID: {fulfillment._id}</p>
          <p className="text-xs sm:text-sm text-gray-500">Requested by: {fulfillment.requestedBy.role}</p>
        </div>
        <span className={`px-3 py-2 rounded-full text-xs sm:text-sm font-semibold self-start ${statusStyles[fulfillment.status]}`}>
          {fulfillment.status.toUpperCase()}
        </span>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Post Details */}
        <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-center mb-3">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
            <h4 className="font-bold text-blue-900 text-sm sm:text-base">Original Post</h4>
          </div>
          
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-1">
                <p><strong>Type:</strong> {fulfillment.post.type}</p>
                <p><strong>Required By:</strong> {formatDate(fulfillment.post.requiredByDate)}</p>
                <p><strong>Status:</strong> {fulfillment.post.status}</p>
              </div>
              <div className="space-y-1">
                <p><strong>Requested:</strong> {totalPostQuantity} quintals</p>
                <p><strong>Value:</strong> ₹{totalPostValue.toLocaleString()}</p>
                <p><strong>Created:</strong> {formatDate(fulfillment.post.createdAt)}</p>
              </div>
            </div>

            {/* Requested Crops */}
            <div className="mt-3">
              <p className="font-semibold">Requested Crops:</p>
              <div className="bg-white rounded p-2 mt-1 space-y-1">
                {fulfillment.post.crops.map((crop, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{crop.name} ({crop.type})</span>
                    <span>{crop.quantity}q @ ₹{crop.pricePerQuintal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start text-xs text-gray-600 mt-3">
              <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
              <span>{fulfillment.post.location.village}, {fulfillment.post.location.district}</span>
            </div>
          </div>
        </div>

        {/* Fulfillment Details */}
        <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-center mb-3">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
            <h4 className="font-bold text-green-900 text-sm sm:text-base">Fulfillment Offer</h4>
          </div>
          
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p><strong>Status:</strong> {fulfillment.status}</p>
                <p><strong>Payment:</strong> {fulfillment.paymentStatus}</p>
                <p><strong>Delivery:</strong> {fulfillment.deliveryStatus}</p>
              </div>
              <div className="space-y-1">
                <p><strong>Offered:</strong> {totalFulfillmentQuantity} quintals</p>
                <p><strong>Submitted:</strong> {formatDate(fulfillment.createdAt)}</p>
              </div>
            </div>

            {/* Offered Crops */}
            <div className="mt-3">
              <p className="font-semibold">Offered Crops:</p>
              <div className="bg-white rounded p-2 mt-1 space-y-1">
                {fulfillment.crops.map((crop) => (
                  <div key={crop._id} className="flex justify-between text-xs">
                    <span>{crop.name}</span>
                    <span className="font-semibold">{crop.quantity} quintals</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Comparison */}
            <div className="mt-3 bg-white rounded p-2">
              <p className="text-xs font-semibold text-gray-700">Match: {Math.round((totalFulfillmentQuantity / totalPostQuantity) * 100)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    totalFulfillmentQuantity >= totalPostQuantity ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min((totalFulfillmentQuantity / totalPostQuantity) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-start text-xs text-gray-500 mb-4 sm:mb-6">
        <Clock className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
        <span>Post: {formatDate(fulfillment.post.createdAt)} • Fulfillment: {formatDate(fulfillment.createdAt)}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {fulfillment.status === 'pending' ? (
          <>
            <button
              onClick={() => onUpdateStatus(fulfillment._id, 'approve')}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-md text-sm sm:text-base"
            >
              {isUpdating ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              Accept
            </button>
            <button
              onClick={() => onUpdateStatus(fulfillment._id, 'reject')}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-md text-sm sm:text-base"
            >
              {isUpdating ? <Loader2 className="animate-spin w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
          </>
        ) : (
          <div className={`px-4 sm:px-6 py-3 rounded-xl font-semibold text-center text-sm sm:text-base ${
            fulfillment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {fulfillment.status === 'approved' ? '✅ Accepted' : '❌ Rejected'}
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center px-4">
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col items-center max-w-sm w-full">
      <Loader2 className="animate-spin w-10 h-10 sm:w-12 sm:h-12 text-green-500 mb-4" />
      <p className="text-base sm:text-lg font-medium text-gray-600">Loading fulfillments...</p>
    </div>
  </div>
);

const ErrorScreen: FC<{ error: any; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center max-w-md w-full">
      <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Error Loading</h2>
      <p className="text-gray-600 mb-4 text-sm sm:text-base">{error?.message || 'Something went wrong'}</p>
      <button onClick={onRetry} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        Try Again
      </button>
    </div>
  </div>
);

const EmptyState: FC<{ filter: string; onShowAll: () => void }> = ({ filter, onShowAll }) => (
  <div className="text-center py-12 sm:py-16">
    <div className="bg-green-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
      <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
      No {filter === 'all' ? '' : filter} Fulfillments
    </h3>
    <p className="text-gray-500 text-base sm:text-lg mb-6 px-4">
      {filter === 'all' ? 'No requests received yet' : `No ${filter} fulfillments found`}
    </p>
    {filter !== 'all' && (
      <button onClick={onShowAll} className="px-4 sm:px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        View All
      </button>
    )}
  </div>
);

const SummaryStats: FC<{ counts: Record<string, number> }> = ({ counts }) => (
  <div className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-lg p-4 sm:p-6">
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Summary</h3>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[
        { key: 'all', label: 'Total', color: 'blue' },
        { key: 'pending', label: 'Pending', color: 'yellow' },
        { key: 'approved', label: 'Approved', color: 'green' },
        { key: 'rejected', label: 'Rejected', color: 'red' }
      ].map(({ key, label, color }) => (
        <div key={key} className={`text-center p-3 sm:p-4 bg-${color}-50 rounded-xl`}>
          <p className={`text-xl sm:text-2xl font-bold text-${color}-600`}>{counts[key] || 0}</p>
          <p className="text-xs sm:text-sm text-gray-600">{label}</p>
        </div>
      ))}
    </div>
  </div>
);

export default PosFulfillment;
