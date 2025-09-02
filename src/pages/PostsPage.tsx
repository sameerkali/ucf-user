import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { ILLUSTRATIONS } from "../assets/assets";
import api from "../api/axios";
import toast from "react-hot-toast";
import DeleteModal from "../components/DeleteModal";
import PostCard from "../components/PostCard";
import type { Post } from "../components/PostCard";

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
    error,
  } = useQuery<Post[], Error>({
    queryKey: ["user-posts", kisaanId],
    queryFn: async (): Promise<Post[]> => {
      if (!kisaanId) throw new Error("No user ID available");
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

  const deleteMutation = useMutation<
    unknown,
    any,
    string
  >({
    mutationFn: async (postId: string) => {
      const response = await api.delete("/api/posts/delete", {
        data: { postId },
      });
      return response.data;
    },
    onSuccess: ( postId) => {
      toast.success("Post deleted successfully!", {
        duration: 3000,
        position: "top-center",
      });

      queryClient.setQueryData<Post[] | undefined>(
        ["user-posts", kisaanId],
        (oldPosts) =>
          oldPosts?.filter((post) => post._id !== postId) || []
      );

      setDeleteModal({ isOpen: false, postId: "", postTitle: "" });
    },
    onError: (error: any) => {
      console.error("Error deleting post:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete post. Please try again.",
        { duration: 4000, position: "top-center" }
      );
    },
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching posts:", error);
      toast.success("No posts available! Create your first post.");
    }
  }, [error]);

  const openDeleteModal = (postId: string, postTitle: string) => {
    setDeleteModal({ isOpen: true, postId, postTitle });
  };

  const closeDeleteModal = () => {
    if (!deleteMutation.isPending) {
      setDeleteModal({ isOpen: false, postId: "", postTitle: "" });
    }
  };

  const confirmDeletePost = () => {
    if (!deleteModal.postId) return;

    deleteMutation.mutate(deleteModal.postId);
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

  if (error && !posts.length && !fetchingPosts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <img
            src={ILLUSTRATIONS.kisaan08}
            alt="Error"
            className="w-32 h-32 mx-auto mb-6 object-contain opacity-60"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            no posts available! Create your first post.
          </h3>

          <button
            onClick={() => navigate("/kisaan/post-create")}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            Create Your First Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto px-4">
          {fetchingPosts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-10 h-10 text-green-300" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border border-gray-200">
              <img
                src={ILLUSTRATIONS.kisaan08}
                alt="No Posts"
                className="w-28 lg:w-36 h-28 lg:h-36 mx-auto mb-6 object-contain opacity-60"
              />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-3">
                No posts yet
              </h3>
              <p className="text-gray-500 text-sm lg:text-base mb-6 max-w-md mx-auto">
                Create your first post to start selling your crops and connect
                with buyers in your area
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
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={openDeleteModal}
                  deletePending={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/kisaan/post-create")}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 text-lg font-bold text-white rounded-full bg-gradient-to-r from-green-600 to-emerald-600 shadow-2xl hover:from-green-700 hover:to-emerald-700 transition"
          aria-label="Create New Post"
        >
          <Plus className="w-6 h-6" />
          New Post
        </button>
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
