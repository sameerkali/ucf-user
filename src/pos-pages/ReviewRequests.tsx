import React, { useState } from 'react';
import type { FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Users, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

// TypeScript interfaces
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
  name: string;
  fatherName: string;
  mobile: string;
  adharNo: string;
  address: Address;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  requests: Request[];
}

interface UpdateStatusPayload {
  requestId: string;
  status: 'verified' | 'rejected';
}

type FilterStatus = 'all' | 'pending' | 'verified' | 'rejected';

const ReviewRequests: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('all');

  // Fetch requests query with proper API response handling
  const { data: apiResponse, isLoading, isError, error } = useQuery<ApiResponse>({
    queryKey: ['requests'],
    queryFn: async (): Promise<ApiResponse> => {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/requests/getAll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  // Extract requests from API response, defaulting to empty array
  const requests = apiResponse?.requests || [];
  const isSuccessful = apiResponse?.success || false;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: UpdateStatusPayload): Promise<any> => {
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
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update status';
      toast.error(`❌ ${errorMessage}`);
    }
  });

  // Filter requests based on selected status
  const filteredRequests = requests.filter(request => 
    filter === 'all' ? true : request.status === filter
  );

  // Status counts for filter badges
  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    verified: requests.filter(r => r.status === 'verified').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const handleStatusUpdate = (requestId: string, status: 'verified' | 'rejected') => {
    updateStatusMutation.mutate({ requestId, status });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center">
          <Loader2 className="animate-spin w-12 h-12 text-green-500 mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Requests</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['requests'] })}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle API failure or unsuccessful response
  if (!isSuccessful) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">API Request Failed</h2>
          <p className="text-gray-600 mb-4">The server response was not successful</p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['requests'] })}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/pos/home')}
            className="mr-4 p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 focus:outline-none"
            aria-label="Back to POS Home"
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

        {/* Show filter tabs only if there are requests */}
        {requests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'verified', 'rejected'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Farmer Requests Yet</h3>
              <p className="text-gray-500 text-lg mb-6">
                There are no farmer requests to review at the moment.
              </p>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 max-w-md mx-auto text-left">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <strong>What's next?</strong> Farmer requests will appear here once they submit applications through the system.
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['requests'] })}
                className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Refresh Requests
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No {filter} Requests</h3>
              <p className="text-gray-500">
                No requests found with status: <strong>{filter}</strong>
              </p>
              <button 
                onClick={() => setFilter('all')}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                View All Requests
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div 
                  key={request._id} 
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{request.name}</h3>
                          <p className="text-gray-600">Father: {request.fatherName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'verified' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Mobile:</strong> {request.mobile}</p>
                          <p><strong>Aadhar:</strong> {request.adharNo}</p>
                        </div>
                        <div>
                          <p><strong>Village:</strong> {request.address.village}</p>
                          <p><strong>District:</strong> {request.address.district}, {request.address.state}</p>
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Submitted on {formatDate(request.createdAt)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(request._id, 'verified')}
                            disabled={updateStatusMutation.isPending}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request._id, 'rejected')}
                            disabled={updateStatusMutation.isPending}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </button>
                        </>
                      )}
                      {request.status !== 'pending' && (
                        <div className={`px-6 py-3 rounded-xl font-semibold text-center ${
                          request.status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'verified' ? '✅ Approved' : '❌ Rejected'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats - only show if there are requests */}
        {requests.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{statusCounts.all}</p>
                <p className="text-sm text-gray-600">Total Requests</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{statusCounts.verified}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewRequests;
