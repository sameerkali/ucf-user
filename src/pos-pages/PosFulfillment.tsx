import { useState } from 'react';
import type { FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, XCircle, Loader2, Filter, ArrowLeft, FileText, 
  Clock, MapPin, Package, Eye, Edit3, Check, X,
  Calendar, User, Scale
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

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
  status: 'pending' | 'pending for verification' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status_code: number;
  message: string;
  data: Fulfillment[];
}

type FilterStatus = 'all' | 'pending' | 'pending for verification' | 'approved' | 'rejected';

const PosFulfillment: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showPartialModal, setShowPartialModal] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ['fulfillments'],
    queryFn: async (): Promise<ApiResponse> => {
      const token = localStorage.getItem('token');
      const { data } = await api.post(
        '/api/fulfillments/incoming-fulfillment', 
        { filters: {} },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Single mutation for all status updates (approve/reject/pending for verification)
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
    onSuccess: (_, { status }) => {
      toast.success(
        status === 'approve'
          ? '✅ Fulfillment approved!'
          : status === 'reject'
          ? '❌ Fulfillment rejected!'
          : '🔎 Sent for verification!'
      );
      queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
      setShowPartialModal(null);
    },
    onError: (error: any) => {
      toast.error(`❌ ${error?.response?.data?.message || 'Failed to update status'}`);
    }
  });

  const fulfillments = data?.data || [];
  const filteredFulfillments = filter === 'all' ? fulfillments : fulfillments.filter(f => f.status === filter);

  const statusCounts = fulfillments.reduce(
    (acc, f) => ({ ...acc, [f.status]: (acc[f.status] || 0) + 1, all: acc.all + 1 }),
    { all: 0, pending: 0, 'pending for verification': 0, approved: 0, rejected: 0 }
  );

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorScreen onRetry={() => queryClient.invalidateQueries({ queryKey: ['fulfillments'] })} />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/pos/home')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fulfillment Requests</h1>
                <p className="text-gray-600">Manage crop fulfillment requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter by status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'pending for verification', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  filter === status 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ({statusCounts[status] || 0})
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
                isUpdating={updateStatusMutation.isPending}
                onShowPartialModal={setShowPartialModal}
              />
            ))
          )}
        </div>

        {/* Partial Accept Modal */}
        {showPartialModal && (
          <PartialAcceptModal
            fulfillment={fulfillments.find(f => f._id === showPartialModal)!}
            onClose={() => setShowPartialModal(null)}
            onAccept={(crops) => updateStatusMutation.mutate({ fulfillmentId: showPartialModal, status: 'approve', crops })}
            isLoading={updateStatusMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

const StepBar: FC<{ status: Fulfillment['status'] }> = ({ status }) => {
  if (status === 'rejected') {
    return (
      <div className="mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-center text-red-600 font-medium">
            <XCircle className="w-5 h-5 mr-2" />
            Rejected
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Submitted', icon: Clock },
    { key: 'pending for verification', label: 'Verification', icon: Eye },
    { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200"></div>
        
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = currentStepIndex >= idx;
          const isCurrent = currentStepIndex === idx;
          
          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all bg-white ${
                isActive ? 'border-blue-500' : 'border-gray-200'
              } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}>
                <StepIcon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <span className={`mt-2 text-xs font-medium text-center ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FulfillmentCard: FC<{
  fulfillment: Fulfillment;
  onUpdateStatus: (id: string, status: 'approve' | 'reject' | 'pending for verification', crops?: FulfillmentCrop[]) => void;
  isUpdating: boolean;
  onShowPartialModal: (id: string) => void;
}> = ({ fulfillment, onUpdateStatus, isUpdating, onShowPartialModal }) => {
  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });

  const totalFulfillmentQuantity = fulfillment.crops.reduce((sum, crop) => sum + crop.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <StepBar status={fulfillment.status} />
      
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
              {fulfillment.crops.map((crop) => (
                <div key={crop._id} className="bg-white rounded p-2 flex justify-between">
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
             
              {isUpdating ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Edit3 className="w-5 h-5" />
              )}
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
        crop._id === id ? { ...crop, quantity: value } : crop
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold mb-4">Accept Partial Crop</h2>
        <div className="space-y-3 mb-6">
          {crops.map(crop => (
            <div key={crop._id} className="flex items-center justify-between gap-3">
              <span className="font-medium">{crop.name}</span>
              <input
                type="number"
                min={0}
                className="border rounded px-2 py-1 w-24"
                value={crop.quantity}
                onChange={e => handleQuantityChange(crop._id, Number(e.target.value))}
              />
              <span className="text-sm text-gray-500">quintals</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onAccept(crops)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen: FC = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

const ErrorScreen: FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <XCircle className="w-10 h-10 text-red-500" />
    <p className="text-gray-700">Failed to load fulfillments</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      Retry
    </button>
  </div>
);

const EmptyState: FC<{ filter: FilterStatus; onShowAll: () => void }> = ({ filter, onShowAll }) => (
  <div className="bg-white rounded-lg p-10 text-center shadow-sm">
    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
    <p className="text-gray-600 mb-6">
      {filter === "all"
        ? "There are no fulfillment requests at the moment."
        : `No ${filter} requests found.`}
    </p>
    {filter !== "all" && (
      <button
        onClick={onShowAll}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Show All Requests
      </button>
    )}
  </div>
);

export default PosFulfillment;



































// import { useState } from 'react';
// import type { FC } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { CheckCircle2, XCircle, Loader2, Filter, ArrowLeft, FileText, Clock, MapPin, Package, DollarSign } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import api from '../api/axios';

// interface Location {
//   state: string;
//   district: string;
//   tehsil: string;
//   block: string;
//   village: string;
//   pincode: string;
// }

// interface PostCrop {
//   name: string;
//   type: string;
//   quantity: number;
//   pricePerQuintal: number;
// }

// interface FulfillmentCrop {
//   name: string;
//   quantity: number;
//   _id: string;
// }

// interface Post {
//   createdBy: { id: string; role: string };
//   _id: string;
//   type: string;
//   crops: PostCrop[];
//   title: string;
//   description: string;
//   requiredByDate: string;
//   photos: string[];
//   videos: string[];
//   location: Location;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Fulfillment {
//   requestedBy: { id: string; role: string };
//   _id: string;
//   post: Post;
//   crops: FulfillmentCrop[];
//   status: 'pending' | 'approved' | 'rejected';
//   createdAt: string;
//   updatedAt: string;
// }

// interface ApiResponse {
//   status_code: number;
//   message: string;
//   data: Fulfillment[];
// }

// type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

// const PosFulfillment: FC = () => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [filter, setFilter] = useState<FilterStatus>('all');
//   const [postIdFilter, setPostIdFilter] = useState<string>('');

//   const { data, isLoading, isError, error } = useQuery<ApiResponse>({
//     queryKey: ['fulfillments', postIdFilter],
//     queryFn: async (): Promise<ApiResponse> => {
//       const token = localStorage.getItem('token');
//       const { data } = await api.post('/api/fulfillments/incoming-fulfillment', 
//         { filters: { post: postIdFilter || undefined } },
//         { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//       );
//       return data;
//     },
//     refetchOnWindowFocus: false,
//     staleTime: 30000,
//   });

//   const updateStatusMutation = useMutation({
//     mutationFn: async ({ fulfillmentId, status }: { fulfillmentId: string; status: 'approve' | 'reject' }) => {
//       const token = localStorage.getItem('token');
//       const { data } = await api.post('/api/fulfillments/approve', 
//         { fulfillmentId, status },
//         { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//       );
//       return data;
//     },
//     onSuccess: (_, { status }) => {
//       toast.success(`🎉 Fulfillment ${status === 'approve' ? 'approved' : 'rejected'} successfully!`);
//       queryClient.invalidateQueries({ queryKey: ['fulfillments'] });
//     },
//     onError: (error: any) => {
//       toast.error(`❌ ${error?.response?.data?.message || error.message || 'Failed to update status'}`);
//     }
//   });

//   const fulfillments = data?.data || [];
//   const filteredFulfillments = filter === 'all' ? fulfillments : fulfillments.filter(f => f.status === filter);

//   const statusCounts = fulfillments.reduce(
//     (acc, f) => ({ ...acc, [f.status]: (acc[f.status] || 0) + 1, all: acc.all + 1 }),
//     { all: 0, pending: 0, approved: 0, rejected: 0 }
//   );

//   const formatDate = (dateString: string) => 
//     new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric', month: 'short', day: 'numeric', 
//       hour: '2-digit', minute: '2-digit'
//     });

//   const handleStatusUpdate = (fulfillmentId: string, status: 'approve' | 'reject') => {
//     updateStatusMutation.mutate({ fulfillmentId, status });
//   };

//   if (isLoading) return <LoadingScreen />;
//   if (isError || data?.status_code !== 200) return <ErrorScreen error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['fulfillments'] })} />;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 px-3 py-4 sm:px-4 sm:py-6">
//       <div className="max-w-6xl mx-auto">
//         <Header navigate={navigate} />
//         <FiltersSection {...{postIdFilter, setPostIdFilter, filter, setFilter, counts: statusCounts}} />
//         <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
//           {filteredFulfillments.length === 0 ? (
//             <EmptyState filter={filter} onShowAll={() => setFilter('all')} />
//           ) : (
//             <div className="space-y-4 sm:space-y-6">
//               {filteredFulfillments.map(fulfillment => (
//                 <FulfillmentCard 
//                   key={fulfillment._id} 
//                   fulfillment={fulfillment}
//                   onUpdateStatus={handleStatusUpdate}
//                   isUpdating={updateStatusMutation.isPending}
//                   formatDate={formatDate}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//         {fulfillments.length > 0 && <SummaryStats counts={statusCounts} />}
//       </div>
//     </div>
//   );
// };

// const Header: FC<{ navigate: any }> = ({ navigate }) => (
//   <div className="flex items-center mb-6 sm:mb-8">
//     <button 
//       onClick={() => navigate('/pos/home')}
//       className="mr-3 sm:mr-4 p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 focus:outline-none"
//     >
//       <ArrowLeft className="w-5 h-5 text-gray-600" />
//     </button>
//     <div className="flex items-center">
//       <div className="p-2 bg-green-100 rounded-full mr-3">
//         <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
//       </div>
//       <div>
//         <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fulfillment Requests</h1>
//         <p className="text-xs sm:text-sm text-gray-600">Accept or reject incoming fulfillment requests</p>
//       </div>
//     </div>
//   </div>
// );

// const FiltersSection: FC<{
//   postIdFilter: string;
//   setPostIdFilter: (value: string) => void;
//   filter: FilterStatus;
//   setFilter: (filter: FilterStatus) => void;
//   counts: Record<string, number>;
// }> = ({ postIdFilter, setPostIdFilter, filter, setFilter, counts }) => (
//   <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 space-y-4">
//     <div>
//       <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Post ID</label>
//       <input
//         type="text"
//         placeholder="Enter post ID to filter fulfillments..."
//         value={postIdFilter}
//         onChange={(e) => setPostIdFilter(e.target.value)}
//         className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
//       />
//     </div>
//     <div>
//       <div className="flex items-center gap-2 mb-3">
//         <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
//         <span className="font-medium text-gray-700 text-sm sm:text-base">Filter by status:</span>
//       </div>
//       <div className="flex flex-wrap gap-2">
//         {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
//           <button
//             key={status}
//             onClick={() => setFilter(status)}
//             className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
//               filter === status ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status] || 0})
//           </button>
//         ))}
//       </div>
//     </div>
//   </div>
// );



// const FulfillmentCard: FC<{
//   fulfillment: Fulfillment;
//   onUpdateStatus: (id: string, status: 'approve' | 'reject') => void;
//   isUpdating: boolean;
//   formatDate: (date: string) => string;
// }> = ({ fulfillment, onUpdateStatus, isUpdating, formatDate }) => {
//   const totalFulfillmentQuantity = fulfillment.crops.reduce((sum, crop) => sum + crop.quantity, 0);
//   const totalPostQuantity = fulfillment.post.crops.reduce((sum, crop) => sum + crop.quantity, 0);
//   const totalPostValue = fulfillment.post.crops.reduce((sum, crop) => sum + (crop.quantity * crop.pricePerQuintal), 0);

//   return (
//     <div className="border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
//  <StepBar status={fulfillment.status as any} />
//       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3">
//         <div className="flex-1">
//           <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 leading-tight">{fulfillment.post.title}</h3>
//         </div>
//         <span className={`px-3 py-2 rounded-full text-xs sm:text-sm font-semibold self-start ${
//           fulfillment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//           fulfillment.status === 'approved' ? 'bg-green-100 text-green-800' :
//           'bg-red-100 text-red-800'
//         }`}>
//           {fulfillment.status.toUpperCase()}
//         </span>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
//         <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
//           <h4 className="font-bold text-blue-900 text-sm sm:text-base mb-3 flex items-center">
//             <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />Original Post
//           </h4>
//           <div className="space-y-2 text-xs sm:text-sm">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
//               <div>
//                 <p><strong>Required By:</strong> {formatDate(fulfillment.post.requiredByDate)}</p>
//               </div>
//               <div>
//                 <p><strong>Requested:</strong> {totalPostQuantity} quintals</p>
//                 <p><strong>Value:</strong> ₹{totalPostValue.toLocaleString()}</p>
//                 <p><strong>Created:</strong> {formatDate(fulfillment.post.createdAt)}</p>
//               </div>
//             </div>
//             <div>
//               <p className="font-semibold mt-2">Requested Crops:</p>
//               <div className="bg-white rounded p-2 space-y-1 mt-1">
//                 {fulfillment.post.crops.map((crop, index) => (
//                   <div key={index} className="flex justify-between text-xs">
//                     <span>{crop.name} ({crop.type})</span>
//                     <span>{crop.quantity}q @ ₹{crop.pricePerQuintal}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="flex items-start text-xs text-gray-600 mt-3">
//               <MapPin className="w-3 h-3 mr-1 mt-0.5" />{fulfillment.post.location.village}, {fulfillment.post.location.district}
//             </div>
//           </div>
//         </div>
//         <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
//           <h4 className="font-bold text-green-900 text-sm sm:text-base mb-3 flex items-center">
//             <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />Fulfillment Offer
//           </h4>
//           <div className="space-y-2 text-xs sm:text-sm">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p><strong>Offered:</strong> {totalFulfillmentQuantity} quintals</p>
//                 <p><strong>Submitted:</strong> {formatDate(fulfillment.createdAt)}</p>
//               </div>
//             </div>
//             <div>
//               <p className="font-semibold mt-2">Offered Crops:</p>
//               <div className="bg-white rounded p-2 space-y-1 mt-1">
//                 {fulfillment.crops.map((crop) => (
//                   <div key={crop._id} className="flex justify-between text-xs">
//                     <span>{crop.name}</span>
//                     <span className="font-semibold">{crop.quantity} quintals</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-col gap-3 sm:flex-row">
//         {fulfillment.status === 'pending' ? (
//           <>
//             <button
//               onClick={() => onUpdateStatus(fulfillment._id, 'approve')}
//               disabled={isUpdating}
//               className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-md text-sm sm:text-base"
//             >
//               {isUpdating ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
//               Accept
//             </button>
//             <button
//               onClick={() => onUpdateStatus(fulfillment._id, 'reject')}
//               disabled={isUpdating}
//               className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-md text-sm sm:text-base"
//             >
//               {isUpdating ? <Loader2 className="animate-spin w-4 h-4" /> : <XCircle className="w-4 h-4" />}
//               Reject
//             </button>
//           </>
//         ) : (
//           <div className={`px-4 sm:px-6 py-3 rounded-xl font-semibold text-center text-sm sm:text-base ${
//             fulfillment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}>
//             {fulfillment.status === 'approved' ? '✅ Accepted' : '❌ Rejected'}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const LoadingScreen = () => (
//   <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center px-4">
//     <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col items-center max-w-sm w-full">
//       <Loader2 className="animate-spin w-10 h-10 sm:w-12 sm:h-12 text-green-500 mb-4" />
//       <p className="text-base sm:text-lg font-medium text-gray-600">Loading fulfillments...</p>
//     </div>
//   </div>
// );

// const ErrorScreen: FC<{ error: any; onRetry: () => void }> = ({ error, onRetry }) => (
//   <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center p-4">
//     <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center max-w-md w-full">
//       <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
//       <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Error Loading</h2>
//       <p className="text-gray-600 mb-4 text-sm sm:text-base">{error?.message || 'Something went wrong'}</p>
//       <button onClick={onRetry} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
//         Try Again
//       </button>
//     </div>
//   </div>
// );

// const EmptyState: FC<{ filter: string; onShowAll: () => void }> = ({ filter, onShowAll }) => (
//   <div className="text-center py-12 sm:py-16">
//     <div className="bg-green-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
//       <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
//     </div>
//     <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
//       No {filter === 'all' ? '' : filter} Fulfillments
//     </h3>
//     <p className="text-gray-500 text-base sm:text-lg mb-6 px-4">
//       {filter === 'all' ? 'No requests received yet' : `No ${filter} fulfillments found`}
//     </p>
//     {filter !== 'all' && (
//       <button onClick={onShowAll} className="px-4 sm:px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
//         View All
//       </button>
//     )}
//   </div>
// );

// const SummaryStats: FC<{ counts: Record<string, number> }> = ({ counts }) => (
//   <div className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-lg p-4 sm:p-6">
//     <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Summary</h3>
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//       {[
//         { key: 'all', label: 'Total', color: 'blue' },
//         { key: 'pending', label: 'Pending', color: 'yellow' },
//         { key: 'approved', label: 'Approved', color: 'green' },
//         { key: 'rejected', label: 'Rejected', color: 'red' }
//       ].map(({ key, label, color }) => (
//         <div key={key} className={`text-center p-3 sm:p-4 bg-${color}-50 rounded-xl`}>
//           <p className={`text-xl sm:text-2xl font-bold text-${color}-600`}>{counts[key] || 0}</p>
//           <p className="text-xs sm:text-sm text-gray-600">{label}</p>
//         </div>
//       ))}
//     </div>
//   </div>
// );

// export default PosFulfillment;





// // Minimal, horizontal step bar for fulfillment status
// const StepBar: FC<{ status: 'pending' | 'pending for verification' | 'approved' }> = ({ status }) => {
//   const steps = [
//     { key: 'pending', label: 'Pending' },
//     { key: 'pending for verification', label: 'Verification' },
//     { key: 'approved', label: 'Approved' }
//   ] as const;

//   const stepIndex = steps.findIndex(s => s.key === status);

//   return (
//     <div className="w-full flex items-center justify-between py-3">
//       {steps.map((step, idx) => (
//         <div key={step.key} className="flex items-center w-full">
//           <div
//             className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200
//               ${stepIndex >= idx ? 'border-amber-500 bg-white' : 'border-gray-300 bg-gray-100'}
//             `}
//             style={{
//               boxShadow: stepIndex === idx ? '0 0 0 2px #f59e42' : undefined,
//               transition: 'box-shadow 0.2s'
//             }}
//           >
//             <span className={`block w-3 h-3 rounded-full ${stepIndex >= idx ? 'bg-amber-400' : 'bg-gray-300'}`}></span>
//           </div>
//           {idx < steps.length - 1 && (
//             <div
//               className={`h-2 w-full border-t transition-all duration-200 ${stepIndex > idx ? 'border-amber-400 bg-amber-400' : 'border-gray-200 bg-gray-200'}`}
//               style={{ minWidth: 32 }}
//             >  <span className="mt-2 text-xs font-medium text-gray-700 w-16 text-center">{step.label}</span></div>
            
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };
