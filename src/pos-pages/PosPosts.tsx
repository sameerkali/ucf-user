import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api/axios"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Trash2 } from "lucide-react"

import DeleteModal from "../components/DeleteModal"

interface CreatedBy {
  id: string
  role: string
}

interface Crop {
  name: string
  type: string
  quantity: number
  pricePerQuintal: number
}

interface Location {
  state: string
  district: string
  tehsil: string
  block: string
  village: string
  pincode: string
}

interface Post {
  _id: string
  createdBy: CreatedBy
  type: string
  crops: Crop[]
  title: string
  description: string
  requiredByDate: string
  photos: string[]
  videos: string[]
  location: Location
  status: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  status_code: number
  message: string
  data: Post[]
}

interface ProfileType {
  _id: string
  role: string
}

const PosPosts: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePostId, setDeletePostId] = useState<string>("")
  const [deletePostTitle, setDeletePostTitle] = useState<string>("")

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedProfile = JSON.parse(userData) as ProfileType
        setProfile(parsedProfile)
      } else {
        toast.error("No profile data found, please login.")
        navigate("/login")
      }
    } catch {
      toast.error("Error loading profile data, please login.")
      navigate("/login")
    }
  }, [navigate])

  const posId = profile?._id

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery<Post[], Error>({
    queryKey: ["pos-posts", posId],
    queryFn: async () => {
      if (!posId) return []
      const { data } = await api.post<ApiResponse>(
        "/api/posts/details",
        { id: posId },
        { headers: { "Content-Type": "application/json" } }
      )
      if (data.status_code === 200) {
        return (data.data || [])
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
      throw new Error(data.message || "Failed to fetch posts")
    },
    enabled: !!posId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.delete("/api/posts/delete", {
        data: { postId },
      })
      return response.data
    },
    onSuccess: (_, postId) => {
      toast.success("Post deleted successfully!")
      queryClient.setQueryData<Post[] | undefined>(
        ["pos-posts", posId],
        (oldPosts) => oldPosts?.filter((post) => post._id !== postId) || []
      )
      closeDeleteModal()
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete post. Please try again.")
    },
  })

  const openDeleteModal = (postId: string, postTitle: string) => {
    setDeletePostId(postId)
    setDeletePostTitle(postTitle)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    if (!deleteMutation.isPending) {
      setDeleteModalOpen(false)
      setDeletePostId("")
      setDeletePostTitle("")
    }
  }

  const confirmDeletePost = () => {
    deleteMutation.mutate(deletePostId)
  }

  const formatDateToReadable = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading)
    return (
      <div className="min-h-screen p-4 bg-gray-50 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse border border-gray-200 rounded-lg p-6 bg-white"
            role="status"
            aria-label="Loading post skeleton"
          >
            <div className="h-6 bg-gray-300 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-5"></div>

            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-4/5"></div>
              <div className="h-4 bg-gray-300 rounded w-3/5"></div>
            </div>

            <div className="mt-6 flex space-x-4">
              <div className="h-8 w-20 bg-gray-300 rounded"></div>
              <div className="h-8 w-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )

  if (isError)
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex justify-center items-center">
        <p className="text-red-600 text-center text-lg">Error: {error?.message || "Failed to load posts"}</p>
      </div>
    )

  if (posts.length === 0)
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600 text-center text-lg">No posts found for this POS.</p>
      </div>
    )

  return (
    <>
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">My Posts</h1>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <li
              key={post._id}
              className="relative border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white flex flex-col"
            >
              <button
                type="button"
                onClick={() => openDeleteModal(post._id, post.title)}
                className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition disabled:opacity-50 disabled:pointer-events-none"
                aria-label={`Delete post ${post.title}`}
                title="Delete Post"
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-3 truncate">{post.title}</h2>
              <p className="text-gray-700 mb-4 flex-grow line-clamp-3 break-words">{post.description}</p>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Crops:</h3>
                <ul className="list-disc list-inside space-y-1 max-w-full break-words max-h-28 overflow-y-auto">
                  {post.crops.map((crop, i) => (
                    <li key={i} className="truncate">
                      {crop.name} ({crop.type}) - Qty: {crop.quantity} Quintals @ ₹
                      {crop.pricePerQuintal} per Quintal
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-1">Location:</h3>
                <p className="text-gray-600 break-words text-sm">
                  {post.location.village}, {post.location.block}, {post.location.tehsil},{" "}
                  {post.location.district}, {post.location.state} - {post.location.pincode}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-gray-600 text-xs break-words">
                <div>
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      post.status === "active" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
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
  )
}

export default PosPosts
