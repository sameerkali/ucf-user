import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Camera, Video, Loader2, MapPin, Package, IndianRupee, Trash2, Plus } from "lucide-react";
import { ILLUSTRATIONS } from "../assets/assets";
import api from "../api/axios";
import toast from "react-hot-toast";
import DeleteModal from "../components/DeleteModal";

interface Crop {
  name: string;
  type: string;
  quantity: string;
  pricePerQuintal: string;
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
  type: string;
  title: string;
  description: string;
  crops: Crop[];
  readyByDate: string;
  photos: string[];
  videos: string[];
  location: Location;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    role: string;
  };
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

export default function PostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [kisaanId, setKisaanId] = useState<string | null>(null);
  
  // Delete modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: "",
    postTitle: "",
    isDeleting: false,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user: User = JSON.parse(userData);
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

  // Fetch posts using React Query
  const { 
    data: posts = [], 
    isLoading: fetchingPosts, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['user-posts', kisaanId],
    queryFn: async (): Promise<Post[]> => {
      if (!kisaanId) throw new Error('No user ID available');
      
      const { data } = await api.post("/api/posts/details", {
        id: kisaanId
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (data.status_code === 200) {
        return data.data || [];
      }
      throw new Error(data.message || 'Failed to fetch posts');
    },
    enabled: !!kisaanId, // Only run query when kisaanId is available
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Delete mutation using React Query
  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.delete("/api/posts/delete", {
        data: {
          postId: postId
        }
      });
      return response.data;
    },
    onSuccess: (data, postId) => {
      toast.success("Post deleted successfully!", {
        duration: 3000,
        position: 'top-center',
      });
      
      // Update the cache by removing the deleted post
      queryClient.setQueryData(['user-posts', kisaanId], (oldPosts: Post[] | undefined) => {
        return oldPosts?.filter(post => post._id !== postId) || [];
      });
      
      closeDeleteModal();
    },
    onError: (error: any) => {
      console.error("Error deleting post:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to delete post. Please try again.", 
        {
          duration: 4000,
          position: 'top-center',
        }
      );
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  });

  // Handle error state
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    }
  }, [error]);

  // Open delete modal
  const openDeleteModal = (postId: string, postTitle: string) => {
    setDeleteModal({
      isOpen: true,
      postId,
      postTitle,
      isDeleting: false,
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        postId: "",
        postTitle: "",
        isDeleting: false,
      });
    }
  };

  // Confirm delete post
  const confirmDeletePost = async () => {
    if (!deleteModal.postId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    deleteMutation.mutate(deleteModal.postId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatLocation = (location: Location) => {
    return `${location.village}, ${location.tehsil}, ${location.district}, ${location.state}`;
  };

  if (!kisaanId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !posts.length && !fetchingPosts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <img
            src={ILLUSTRATIONS.kisaan08}
            alt="Error"
            className="w-32 h-32 mx-auto mb-6 object-contain opacity-60"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Something went wrong</h3>
          <p className="text-gray-500 mb-6">
            {error instanceof Error ? error.message : 'Network error occurred'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={ILLUSTRATIONS.kisaan03}
              alt="Your Posts"
              className="w-24 lg:w-32 h-24 lg:h-32 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Your Posts
            </h1>
            <p className="text-gray-600 text-sm lg:text-base mb-6">
              Manage your crop listings
            </p>
            
            {/* Create Post Button */}
            <button
              onClick={() => navigate("/kisaan/post-create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New Post
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            {fetchingPosts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8 text-green-500" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border border-gray-200">
                <img
                  src={ILLUSTRATIONS.kisaan08}
                  alt="No Posts"
                  className="w-24 lg:w-32 h-24 lg:h-32 mx-auto mb-6 object-contain opacity-60"
                />
                <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-3">
                  No posts yet
                </h3>
                <p className="text-gray-500 text-sm lg:text-base mb-6 max-w-md mx-auto">
                  Create your first post to start selling your crops and connect with buyers in your area
                </p>
                <button
                  onClick={() => navigate("/kisaan/post-create")}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.description}</p>
                        
                        {/* Date and Location */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>Ready: {formatDate(post.readyByDate)}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{formatLocation(post.location)}</span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            post.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {post.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => openDeleteModal(post._id, post.title)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Crop Details */}
                    {post.crops && post.crops.length > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                        {post.crops.map((crop, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-green-800">{crop.name}</h4>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {crop.type}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">{crop.quantity} quintals</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <IndianRupee className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">₹{crop.pricePerQuintal}/quintal</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show message if no crop data */}
                    {(!post.crops || post.crops.length === 0) && (
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-sm">No crop details available</p>
                      </div>
                    )}

                    {/* Media indicators */}
                    {(post.photos.length > 0 || post.videos.length > 0) && (
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        {post.photos.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Camera className="w-4 h-4" />
                            <span>{post.photos.length} photo{post.photos.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {post.videos.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Video className="w-4 h-4" />
                            <span>{post.videos.length} video{post.videos.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeletePost}
        postTitle={deleteModal.postTitle}
        isDeleting={deleteModal.isDeleting || deleteMutation.isPending}
      />
    </>
  );
}
