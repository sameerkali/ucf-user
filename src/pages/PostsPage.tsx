import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

// Assuming your project structure includes these imports
import api from "../api/axios";
import { ILLUSTRATIONS } from "../assets/assets";
import DeleteModal from "../components/DeleteModal";
import PostCard, { type Post } from "../components/PostCard";

// --- INTERFACES --- //
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

// --- MAIN PAGE COMPONENT --- //
export default function PostsPage() {
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

  const {
    data: posts = [],
    isLoading: fetchingPosts,
  } = useQuery<Post[], Error>({
    queryKey: ["user-posts", kisaanId],
    queryFn: async (): Promise<Post[]> => {
      if (!kisaanId) return [];
      const { data } = await api.post(
        "/api/posts/details",
        { id: kisaanId },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status_code === 200) {
        return data.data || [];
      }
      throw new Error(data.message || "Failed to fetch posts");
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
    onSuccess: (postId) => {
      toast.success("Post deleted successfully!");
      // Optimistically update the cache
      queryClient.setQueryData<Post[] | undefined>(
        ["user-posts", kisaanId],
        (oldPosts) => oldPosts?.filter((post) => post._id !== postId) || []
      );
      closeDeleteModal();
    },
    onError: (error: any) => {
      console.error("Error deleting post:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete post. Please try again."
      );
      // If the mutation fails, you might want to refetch to get the correct state
      queryClient.invalidateQueries({ queryKey: ["user-posts", kisaanId] });
    },
  });
  
  const openDeleteModal = (postId: string, postTitle: string) => {
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

  if (fetchingPosts && !posts.length) {
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
              My Posts
            </h1>
            <button
              onClick={() => navigate("/kisaan/post-create")}
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 px-3 py-2 md:px-4 text-sm"
              aria-label="Create New Post"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">New Post</span>
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 mt-6">
              <img
                src={ILLUSTRATIONS.kisaan08}
                alt="No Posts"
                className="w-28 lg:w-36 h-28 lg:h-36 mx-auto mb-6 object-contain opacity-70"
              />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-3">
                You haven't created any posts yet.
              </h3>
              <p className="text-gray-500 text-sm lg:text-base mb-6 max-w-md mx-auto">
                Click the "New Post" button to sell your crops and connect with buyers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={openDeleteModal}
                  deletePending={deleteMutation.isPending && deleteModal.postId === post._id}
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

