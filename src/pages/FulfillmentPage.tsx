import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { User, Hash, Calendar, MapPin, ArrowLeft, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";

type FulfillmentStatus = "pending" | "approve" | "reject" | "pending for verification";

interface UserRef {
  id: string;
  role: string;
}

interface CropDetail {
  name: string;
  type?: string;
  quantity: number;
  pricePerQuintal?: number;
}

interface Location {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface Post {
  _id: string;
  createdBy: UserRef;
  type: string;
  crops: CropDetail[];
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
  _id: string;
  requestedBy: UserRef;
  post: Post | null;
  crops: { name: string; quantity: number }[];
  status: FulfillmentStatus;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FulfillmentApiResponse {
  fulfillments: Fulfillment[];
  pagination: Pagination;
}

interface ProfileType {
  _id: string;
  role: string;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: FulfillmentStatus }) => {
  const getStatusConfig = (status: FulfillmentStatus) => {
    switch (status) {
      case 'approve':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'reject':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'pending for verification':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {status.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </span>
  );
};

// Info Pill Component
const InfoPill = ({ icon: Icon, text }: { icon: any, text: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    <Icon className="w-4 h-4 text-gray-500" />
    <span>{text}</span>
  </div>
);

// Enhanced Fulfillment Card Component
const FulfillmentCard = ({ fulfillment }: { fulfillment: Fulfillment }) => (
  <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row overflow-hidden">
    {/* Status color bar */}
    <div className={`absolute top-0 left-0 h-full w-1.5 ${
      fulfillment.status === 'approve' ? 'bg-green-500' :
      fulfillment.status === 'reject' ? 'bg-red-500' :
      fulfillment.status === 'pending for verification' ? 'bg-yellow-500' : 'bg-blue-500'
    }`} />
    
    {/* Left Side: Fulfillment Details */}
    <div className="p-6 md:w-3/5 lg:w-2/3 pl-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {fulfillment.post?.title ?? "Untitled Post"}
          <span className="text-2xl">🌾</span>
        </h2>
        <StatusBadge status={fulfillment.status} />
      </div>
      <p className="text-sm text-gray-600 mb-5 line-clamp-3">
        {fulfillment.post?.description ?? "No description available."}
      </p>
      
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Fulfillment Offer Details</h3>
      <div className="space-y-3">
        <InfoPill 
          icon={User} 
          text={
            <>
              <span className="font-medium">{fulfillment.requestedBy.role.toUpperCase()}</span>
              <span className="text-gray-500 text-xs ml-2">({fulfillment.requestedBy.id})</span>
            </>
          } 
        />
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Crops Requested</p>
          <div className="flex flex-wrap gap-6">
            {fulfillment.crops.map((crop, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {crop.quantity}
                  <span className="text-sm font-medium text-gray-500 ml-1">q</span>
                </p>
                <p className="text-xs text-gray-600 capitalize font-medium">{crop.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* Right Side: Post Context */}
    <div className="p-6 bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 md:w-2/5 lg:w-1/3">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-300 pb-2">
        Original Post Context
      </h3>
      {fulfillment.post ? (
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Hash className="w-4 h-4 text-slate-500 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Post ID</p>
              <p className="font-mono text-slate-700 text-xs break-all">{fulfillment.post._id}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Required By</p>
              <p className="font-medium text-slate-700">
                {new Date(fulfillment.post.requiredByDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Location</p>
              <p className="font-medium text-slate-700 text-sm leading-relaxed">
                {fulfillment.post.location.village}, {fulfillment.post.location.district}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {fulfillment.post.location.state} - {fulfillment.post.location.pincode}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Post Type</span>
              <span className="font-medium text-slate-700 capitalize">{fulfillment.post.type}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Post information unavailable</p>
        </div>
      )}
    </div>
  </div>
);

// Enhanced Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  total, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) => {
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{Math.min(10 * (currentPage - 1) + 1, total)}</span> to{' '}
        <span className="font-medium">{Math.min(10 * currentPage, total)}</span> of{' '}
        <span className="font-medium">{total}</span> fulfillments
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        <div className="flex">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
              disabled={typeof page !== 'number'}
              className={`px-3 py-2 text-sm font-medium border-t border-b transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600 z-10'
                  : typeof page === 'number'
                  ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                  : 'bg-white text-gray-400 border-gray-300 cursor-default'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function FulfillmentPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [filterStatus, setFilterStatus] = useState<FulfillmentStatus | "">("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        let parsedProfile: ProfileType | null = null;
        try {
          const parsed = JSON.parse(userData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedProfile = parsed[0];
          } else if (typeof parsed === "object" && parsed !== null) {
            parsedProfile = parsed;
          }
        } catch {
          setProfileError("Invalid profile data format, please login.");
          navigate("/login");
          setLoadingProfile(false);
          return;
        }
        if (parsedProfile) {
          setProfile(parsedProfile);
        } else {
          setProfileError("No profile data found, please login.");
          navigate("/login");
        }
      } else {
        setProfileError("No profile data found, please login.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error parsing user data from localStorage:", err);
      setProfileError("Error loading profile data, please login.");
      navigate("/login");
    } finally {
      setLoadingProfile(false);
    }
  }, [navigate]);

  const {
    data,
    isLoading: loadingFulfillments,
    isError,
    error,
  } = useQuery<FulfillmentApiResponse, Error>({
    queryKey: ["fulfillments-my", profile?._id, filterStatus, page],
    queryFn: async () => {
      if (!profile?._id) return { fulfillments: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
      const { data } = await api.post(
        "/api/fulfillments/incoming-fulfillment",
        {
          filters: filterStatus ? { status: filterStatus } : {},
          page
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status_code === 200) {
        return {
          fulfillments: data.data || [],
          pagination: data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
        };
      }
      throw new Error(data.message || "Failed to fetch fulfillments");
    },
    enabled: !!profile?._id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const fulfillments = data?.fulfillments || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  if (loadingProfile)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );

  if (profileError)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-red-600 mb-4">{profileError}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );

  const statuses: FulfillmentStatus[] = [
    "pending",
    "approve",
    "reject",
    "pending for verification",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">My Fulfillments</h1>
          </div>
          <p className="text-gray-600 ml-14">Track and manage your fulfillment requests</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Filter Fulfillments</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FulfillmentStatus | "")}
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            {filterStatus && (
              <div className="flex items-end">
                <button
                  onClick={() => setFilterStatus("")}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loadingFulfillments ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading fulfillments...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Fulfillments</h3>
            <p className="text-red-600 mb-4">{error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        ) : fulfillments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fulfillments Found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus 
                ? `No fulfillments found with status "${filterStatus}"`
                : "You don't have any fulfillment requests yet."
              }
            </p>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus("")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View all fulfillments
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {fulfillments.map((fulfillment) => (
                <FulfillmentCard key={fulfillment._id} fulfillment={fulfillment} />
              ))}
            </div>
            
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
