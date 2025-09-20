import { useState } from 'react';
import type { FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, XCircle, Loader2, FileText, 
  Clock, MapPin, Package, Eye, Edit3, Check,
  Calendar, User, Scale, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import {FarmerDetailsModal} from '../components/FarmerDetailsModal';

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
  _id?: string;
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
  status: 'pending' | 'pending for verification' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status_code: number;
  message: string;
  data: Fulfillment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type FilterStatus = 'all' | 'pending' | 'pending for verification' | 'approved' | 'rejected';

interface PosFulfillmentProps {
  postId?: string;
}

const PosFulfillment: FC<PosFulfillmentProps> = () => {
const location = useLocation(); // Add this line
  const postId = location.state?.postId; // Get postId from location state
  console.log("postId in fulfillment page:", postId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showPartialModal, setShowPartialModal] = useState<string | null>(null);
  const [showFarmerModal, setShowFarmerModal] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  // Individual loading state management
  const setItemLoading = (fulfillmentId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [fulfillmentId]: loading }));
  };

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ['fulfillments', currentPage, filter, postId],
    queryFn: async (): Promise<ApiResponse> => {
      const token = localStorage.getItem('token');
      const filters: any = {};
      
      // Add post filter if postId is provided
      if (postId) {
        filters.post  = postId;
      }

      const { data } = await api.post(
        '/api/fulfillments/incoming-fulfillment', 
        { 
          filters,
          page: currentPage,
          limit
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Single mutation for all status updates with individual loading states
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      fulfillmentId, 
      status, 
      crops 
    }: { 
      fulfillmentId: string; 
      status: 'approve' | 'reject' | 'pending for verification'; 
      crops?: FulfillmentCrop[];
    }) => {
      setItemLoading(fulfillmentId, true);
      
      const token = localStorage.getItem('token');
      const payload: any = { fulfillmentId, status };
      if (crops) payload.crops = crops;

      const { data } = await api.post(
        '/api/fulfillments/update', 
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return data;
    },
    onSuccess: (_, { status, fulfillmentId }) => {
      toast.success(
        status === 'approve'
          ? '✅ Fulfillment approved!'
          : status === 'reject'
          ? '❌ Fulfillment rejected!'
          : '🔎 Sent for verification!'
      );
      queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
      setShowPartialModal(null);
      setItemLoading(fulfillmentId, false);
    },
    onError: (error: any, { fulfillmentId }) => {
      toast.error(`❌ ${error?.response?.data?.message || 'Failed to update status'}`);
      setItemLoading(fulfillmentId, false);
    }
  });

  const fulfillments = data?.data || [];
  const pagination = data?.pagination;
  const filteredFulfillments = filter === 'all' ? fulfillments : fulfillments.filter(f => f.status === filter);

  const statusCounts = fulfillments.reduce(
    (acc, f) => ({ ...acc, [f.status]: (acc[f.status] || 0) + 1, all: acc.all + 1 }),
    { all: 0, pending: 0, 'pending for verification': 0, approved: 0, rejected: 0 }
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorScreen onRetry={() => queryClient.invalidateQueries({ queryKey: ['fulfillments'] })} />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
       <div className="mb-6">
  <nav className="flex text-sm text-gray-600">
    <ol className="inline-flex items-center space-x-1 md:space-x-2">
      <li>
        <button
          onClick={() => navigate('/pos/home')}
          className="hover:text-blue-600 transition-colors"
        >
          Home
        </button>
      </li>
      <li>
        <span className="text-gray-400">/</span>
      </li>
      <li className="text-gray-900 font-medium">
        Fulfillment Requests
      </li>
    </ol>
  </nav>
</div>


      {/* Filters */}
<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-semibold text-gray-700">Filter by Status</h2>
  </div>
  <div className="flex flex-wrap gap-2">
    {(['all', 'pending', 'pending for verification', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
      <button
        key={status}
        onClick={() => setFilter(status)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          filter === status 
            ? 'bg-blue-500 text-white shadow-sm' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {status === 'all' 
          ? 'All' 
          : status.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        } ({statusCounts[status] || 0})
      </button>
    ))}
  </div>
</div>


        {/* Fulfillments */}
        <div className="space-y-6">
          {filteredFulfillments.length === 0 ? (
            <EmptyState filter={filter} onShowAll={() => setFilter('all')} />
          ) : (
            filteredFulfillments.map(fulfillment => (
              <FulfillmentCard 
                key={fulfillment._id} 
                fulfillment={fulfillment}
                onUpdateStatus={(id, status, crops) => updateStatusMutation.mutate({ fulfillmentId: id, status, crops })}
                isUpdating={loadingStates[fulfillment._id] || false}
                onShowPartialModal={setShowPartialModal}
                onShowFarmerModal={setShowFarmerModal}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <PaginationComponent
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.total}
            limit={pagination.limit}
          />
        )}

        {/* Partial Accept Modal */}
        {showPartialModal && (
          <PartialAcceptModal
            fulfillment={fulfillments.find(f => f._id === showPartialModal)!}
            onClose={() => setShowPartialModal(null)}
            onAccept={(crops) => updateStatusMutation.mutate({ fulfillmentId: showPartialModal, status: 'approve', crops })}
            isLoading={loadingStates[showPartialModal] || false}
          />
        )}

        {/* Farmer Details Modal */}
        {showFarmerModal && (
          <FarmerDetailsModal
            isOpen={!!showFarmerModal}
            onClose={() => setShowFarmerModal(null)}
            farmerId={showFarmerModal}
          />
        )}
      </div>
    </div>
  );
};

// Updated Progress Bar Component
const ProgressBar: FC<{ status: Fulfillment['status'] }> = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Submitted', icon: Clock, color: 'blue' },
    { key: 'pending for verification', label: 'Verification', icon: Eye, color: 'yellow' },
    { key: 'approved', label: 'Approved', icon: CheckCircle2, color: 'green' },
  ];

  if (status === 'rejected') {
    return (
      <div className="mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-red-600 font-semibold">
            <XCircle className="w-6 h-6 mr-2" />
            Request Rejected
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="mb-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="flex items-center justify-between relative z-10">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStepIndex > index;
            const isActive = currentStepIndex === index;
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 bg-white ${
                  isCompleted 
                    ? 'border-green-500 text-green-600' 
                    : isActive 
                    ? 'border-blue-500 text-blue-600 ring-4 ring-blue-200' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <span className={`text-xs font-medium block ${
                    isCompleted 
                      ? 'text-green-600' 
                      : isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="text-xs text-gray-500 mt-1 block">Current</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FulfillmentCard: FC<{
  fulfillment: Fulfillment;
  onUpdateStatus: (id: string, status: 'approve' | 'reject' | 'pending for verification', crops?: FulfillmentCrop[]) => void;
  isUpdating: boolean;
  onShowPartialModal: (id: string) => void;
  onShowFarmerModal: (farmerId: string) => void;
}> = ({ fulfillment, onUpdateStatus, isUpdating, onShowPartialModal, onShowFarmerModal }) => {
  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });

  const totalFulfillmentQuantity = fulfillment.crops.reduce((sum, crop) => sum + crop.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <ProgressBar status={fulfillment.status} />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{fulfillment.post.title}</h3>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(fulfillment.createdAt)}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              ID: {fulfillment._id.slice(-8)}
            </div>
            <button
              onClick={() => onShowFarmerModal(fulfillment.requestedBy.id)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <User className="w-4 h-4 mr-1" />
              View Farmer
            </button>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          fulfillment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          fulfillment.status === 'pending for verification' ? 'bg-blue-100 text-blue-800' :
          fulfillment.status === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {fulfillment.status.toUpperCase().replace('PENDING FOR VERIFICATION', 'PENDING VERIFICATION')}
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Original Request */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Original Request
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {fulfillment.post.location.village}, {fulfillment.post.location.district}
            </div>
            <div className="space-y-2">
              {fulfillment.post.crops.map((crop, index) => (
                <div key={index} className="bg-white rounded p-2 flex justify-between">
                  <span>{crop.name} ({crop.type})</span>
                  <span className="font-medium">{crop.quantity}q @ ₹{crop.pricePerQuintal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fulfillment Offer */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            Fulfillment Offer
          </h4>
          <div className="space-y-3 text-sm">
            <p className="text-gray-600">Total: {totalFulfillmentQuantity} quintals</p>
            <div className="space-y-2">
              {fulfillment.crops.map((crop, index) => (
                <div key={crop._id || index} className="bg-white rounded p-2 flex justify-between">
                  <span>{crop.name}</span>
                  <span className="font-semibold">{crop.quantity}q</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <ActionButtons
        fulfillment={fulfillment}
        onUpdateStatus={onUpdateStatus}
        onShowPartialModal={onShowPartialModal}
        isUpdating={isUpdating}
      />
    </div>
  );
};

const ActionButtons: FC<{
  fulfillment: Fulfillment;
  onUpdateStatus: (id: string, status: 'approve' | 'reject' | 'pending for verification', crops?: FulfillmentCrop[]) => void;
  onShowPartialModal: (id: string) => void;
  isUpdating: boolean;
}> = ({ fulfillment, onUpdateStatus, onShowPartialModal, isUpdating }) => {
  switch (fulfillment.status) {
    case 'pending':
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onUpdateStatus(fulfillment._id, 'pending for verification')}
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : <Eye className="w-5 h-5" />}
            Accept for Physical Verification
          </button>
          <button
            onClick={() => onUpdateStatus(fulfillment._id, 'reject')}
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            Reject
          </button>
        </div>
      );

    case 'pending for verification':
      return (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-800 font-medium text-sm">Physical verification required</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onUpdateStatus(fulfillment._id, 'approve')}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
              Accept Full Crop
            </button>
            <button
              onClick={() => onShowPartialModal(fulfillment._id)}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              Accept Partial Crop
            </button>
            <button
              onClick={() => onUpdateStatus(fulfillment._id, 'reject')}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              Reject
            </button>
          </div>
        </div>
      );

    case 'approved':
      return (
        <div className="bg-green-50 p-3 rounded-lg text-green-800 text-sm font-medium">
          ✅ Fulfillment approved
        </div>
      );

    case 'rejected':
      return (
        <div className="bg-red-50 p-3 rounded-lg text-red-800 text-sm font-medium">
          ❌ Fulfillment rejected
        </div>
      );

    default:
      return null;
  }
};

// New Pagination Component
const PaginationComponent: FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  limit: number;
}> = ({ currentPage, totalPages, onPageChange, totalItems, limit }) => {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Items Info */}
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex space-x-1">
            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PartialAcceptModal: FC<{
  fulfillment: Fulfillment;
  onClose: () => void;
  onAccept: (crops: FulfillmentCrop[]) => void;
  isLoading: boolean;
}> = ({ fulfillment, onClose, onAccept, isLoading }) => {
  const [crops, setCrops] = useState<FulfillmentCrop[]>(fulfillment.crops);

  const handleQuantityChange = (id: string, value: number) => {
    setCrops(prev =>
      prev.map(crop =>
        crop._id === id ? { ...crop, quantity: Math.max(0, value) } : crop
      )
    );
  };

  const totalQuantity = crops.reduce((sum, crop) => sum + crop.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold mb-4">Accept Partial Crop</h2>
        <p className="text-sm text-gray-600 mb-4">
          Adjust the quantities you want to accept for each crop:
        </p>
        
        <div className="space-y-4 mb-6">
          {crops.map(crop => (
            <div key={crop._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <span className="font-medium">{crop.name}</span>
                <p className="text-sm text-gray-500">Original: {fulfillment.crops.find(c => c._id === crop._id)?.quantity}q</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={fulfillment.crops.find(c => c._id === crop._id)?.quantity || crop.quantity}
                  className="border rounded px-3 py-2 w-20 text-center"
                  value={crop.quantity}
                  onChange={e => handleQuantityChange(crop._id!, Number(e.target.value))}
                />
                <span className="text-sm text-gray-500">quintals</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            <strong>Total accepting:</strong> {totalQuantity} quintals
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => onAccept(crops)}
            disabled={isLoading || totalQuantity === 0}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
            Confirm Acceptance
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen: FC = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading fulfillments...</p>
    </div>
  </div>
);

const ErrorScreen: FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <XCircle className="w-12 h-12 text-red-500" />
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load fulfillments</h3>
      <p className="text-gray-600 mb-4">Something went wrong while fetching the data.</p>
    </div>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Try Again
    </button>
  </div>
);

const EmptyState: FC<{ filter: FilterStatus; onShowAll: () => void }> = ({ filter, onShowAll }) => (
  <div className="bg-white rounded-lg p-12 text-center shadow-sm">
    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {filter === "all"
        ? "There are no fulfillment requests at the moment. Check back later for new requests."
        : `No ${filter} requests found. Try adjusting your filters or check other status categories.`}
    </p>
    {filter !== "all" && (
      <button
        onClick={onShowAll}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Show All Requests
      </button>
    )}
  </div>
);

export default PosFulfillment;







/*
"status": "approve", "status": "active", "status": "pending for verification", "status": "done",
*/