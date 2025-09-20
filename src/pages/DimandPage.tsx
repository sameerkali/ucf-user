import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios";
import { ILLUSTRATIONS } from "../assets/assets";
import DeleteModal from "../components/DeleteModal";

// Updated Post interface to match API response
interface Post {
  _id: string;
  type: string;
  createdBy: {
    id: string;
    role: string;
  };
  help: {
    name: string;
    demand: string;
    quantity: number;
    unit: string;
  };
  location: {
    state: string;
    district: string;
    tehsil: string;
    block: string;
    village: string;
    pincode: string;
  };
  status: string;
  readyByDate: string;
  createdAt: string;
  updatedAt: string;
  crops: any[];
  photos: any[];
  __v: number;
}

interface User {
  _id: string;
  name: string;
  fatherName: string;
  mobile: string;
  address: {
    state: string;
    district: string;
    tehsil: string;
    block: string;
    village: string;
    pincode: string;
  };
  authMethod: string;
  role: string;
  isVerified: boolean;
  mobileVerified: boolean;
  bankVerified: boolean;
  otherDetailsVerified: boolean;
  profileStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface DeleteModalState {
  isOpen: boolean;
  postId: string;
  postTitle: string;
}

// Updated API response interface
interface ApiResponse {
  status_code: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: Post[];
  message: string;
}

export default function DemandPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [kisaanId, setKisaanId] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    postId: "",
    postTitle: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        // If user data is an array as per new format, take the first element
        const user: User =
          Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed;
        setKisaanId(user._id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast.error("Invalid user data. Please login again.");
        navigate("/login");
      }
    } else {
      toast.error("Please login to continue");
      navigate("/login");
    }
  }, [navigate]);

  const { data: posts = [], isLoading: fetchingPosts } = useQuery<
    Post[],
    Error
  >({
    queryKey: ["user-demand-posts", kisaanId],
    queryFn: async (): Promise<Post[]> => {
      if (!kisaanId) return [];
      const { data } = await api.post<ApiResponse>(
        "/api/posts/details",
        { id: kisaanId, type: "FARMER_DEMAND" },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status_code === 200) {
        return data.data || [];
      }
      throw new Error(data.message || "Failed to fetch demand posts");
    },
    enabled: !!kisaanId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: async (postId: string) => {
      const response = await api.delete("/api/posts/delete", {
        data: { postId },
      });
      return response.data;
    },
    onSuccess: (_, postId) => {
      toast.success("Demand post deleted successfully!");
      queryClient.setQueryData<Post[] | undefined>(
        ["user-demand-posts", kisaanId],
        (oldPosts) => oldPosts?.filter((post) => post._id !== postId) || []
      );
      setDeleteModal({ isOpen: false, postId: "", postTitle: "" });
    },
    onError: (error: any) => {
      console.error("Error deleting demand post:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete demand post. Please try again."
      );
      queryClient.invalidateQueries({ queryKey: ["user-demand-posts", kisaanId] });
    },
  });

  const openDeleteModal = (postId: string) => {
    // Use help.name instead of title since title is "NA"
    const post = posts.find(p => p._id === postId);
    const postTitle = post ? `${post.help.name} - ${post.help.demand}` : "Demand Post";
    setDeleteModal({ isOpen: true, postId, postTitle });
  };

  const closeDeleteModal = () => {
    if (!deleteMutation.isPending) {
      setDeleteModal({ isOpen: false, postId: "", postTitle: "" });
    }
  };

  const confirmDeletePost = () => {
    if (deleteModal.postId) {
      deleteMutation.mutate(deleteModal.postId);
    }
  };

  if (fetchingPosts && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-green-500" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4 px-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">
              My Demands
            </h1>
           
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 mt-6">
              <img
                src={ILLUSTRATIONS.kisaan08}
                alt="No Demand Posts"
                className="w-28 lg:w-36 h-28 lg:h-36 mx-auto mb-6 object-contain opacity-70"
              />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-3">
                You haven't created any demand posts yet.
              </h3>
              <p className="text-gray-500 text-sm lg:text-base mb-6 max-w-md mx-auto">
                Click the "New Demand" button to request equipment, seeds, or other farming needs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {posts.map((post) => (
                <DemandPostCard
                  key={post._id}
                  post={post}
                  onDelete={openDeleteModal}
                  deletePending={
                    deleteMutation.isPending && deleteModal.postId === post._id
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeletePost}
        postTitle={deleteModal.postTitle}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}

// Updated PostCard component for demand posts
interface DemandPostCardProps {
  post: Post;
  onDelete: (postId: string, helpName: string) => void;
  deletePending: boolean;
}

function DemandPostCard({ post, onDelete, deletePending }: DemandPostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-4">
        {/* Header with type and status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
            {post.help.name}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
            {post.status}
          </span>
        </div>

        {/* Demand details */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 capitalize">
            {post.help.demand}
          </h3>
          <p className="text-sm text-gray-600">
            Quantity: {post.help.quantity} {post.help.unit}
          </p>
        </div>

        {/* Location */}
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            📍 {post.location.village}, {post.location.district}
          </p>
        </div>

      

        {/* Created date */}
        <div className="mb-4">
          <p className="text-xs text-gray-500">
            Created: {formatDate(post.createdAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(post._id, post.help.name)}
            disabled={deletePending}
            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200"
          >
            {deletePending ? (
              <div className="flex items-center justify-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
