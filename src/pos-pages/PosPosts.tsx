import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

import DeleteModal from "../components/DeleteModal"; // Adjust path as needed

interface CreatedBy {
  id: string;
  role: string;
}

interface Crop {
  name: string;
  type: string;
  quantity: number;
  pricePerQuintal: number;
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
  createdBy: CreatedBy;
  type: string;
  crops: Crop[];
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

interface ApiResponse {
  status_code: number;
  message: string;
  data: Post[];
}

interface ProfileType {
  _id: string;
  role: string;
}

const PosPosts: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string>("");
  const [deletePostTitle, setDeletePostTitle] = useState<string>("");

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedProfile = JSON.parse(userData) as ProfileType;
        setProfile(parsedProfile);
      } else {
        toast.error("No profile data found, please login.");
        navigate("/login");
      }
    } catch {
      toast.error("Error loading profile data, please login.");
      navigate("/login");
    }
  }, [navigate]);

  const posId = profile?._id;

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery<Post[], Error>({
    queryKey: ["pos-posts", posId],
    queryFn: async () => {
      if (!posId) return [];
      const { data } = await api.post<ApiResponse>(
        "/api/posts/details",
        { id: posId },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status_code === 200) {
        return (data.data || []).slice().sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
      }
      throw new Error(data.message || "Failed to fetch posts");
    },
    enabled: !!posId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.delete("/api/posts/delete", {
        data: { postId },
      });
      return response.data;
    },
    onSuccess: (_, postId) => {
      toast.success("Post deleted successfully!");
      queryClient.setQueryData<Post[] | undefined>(
        ["pos-posts", posId],
        (oldPosts) =>
          oldPosts?.filter((post) => post._id !== postId) || []
      );
      closeDeleteModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete post. Please try again.");
    },
  });

  const openDeleteModal = (postId: string, postTitle: string) => {
    setDeletePostId(postId);
    setDeletePostTitle(postTitle);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (!deleteMutation.isPending) {
      setDeleteModalOpen(false);
      setDeletePostId("");
      setDeletePostTitle("");
    }
  };

  const confirmDeletePost = () => {
    deleteMutation.mutate(deletePostId);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );

  if (isError)
    return (
      <div className="text-red-600 text-center mt-10">
        Error: {error?.message || "Failed to load posts"}
      </div>
    );

  if (posts.length === 0)
    return (
      <div className="text-center mt-10 text-gray-600">
        No posts found for this POS.
      </div>
    );

  const formatDateToReadable = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Posts</h1>
        <ul className="space-y-6">
          {posts.map((post) => (
            <li
              key={post._id}
              className="relative border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
            >
              <button
                type="button"
                onClick={() => openDeleteModal(post._id, post.title)}
                className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition"
                aria-label={`Delete post ${post.title}`}
                title="Delete Post"
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-700 mb-4">{post.description}</p>

              <div className="mb-4">
                <h3 className="font-semibold mb-1">Crops:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {post.crops.map((crop, i) => (
                    <li key={i}>
                      {crop.name} ({crop.type}) - Quantity: {crop.quantity}{" "}
                      Quintals @ ₹{crop.pricePerQuintal} per Quintal
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-1">Location:</h3>
                <p className="text-gray-600">
                  {post.location.village}, {post.location.block},{" "}
                  {post.location.tehsil}, {post.location.district},{" "}
                  {post.location.state} - {post.location.pincode}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                <div>
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      post.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {post.status.charAt(0).toUpperCase() +
                      post.status.slice(1)}
                  </span>
                </div>
                <div>Required By: {formatDateToReadable(post.requiredByDate)}</div>
                <div>Created: {formatDateToReadable(post.createdAt)}</div>
                <div>Updated: {formatDateToReadable(post.updatedAt)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeletePost}
        postTitle={deletePostTitle}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
};

export default PosPosts;
