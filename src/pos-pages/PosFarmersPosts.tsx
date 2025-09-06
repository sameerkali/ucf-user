import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

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
  readyByDate: string;
  photos: string[]; // assume URLs or empty
  videos: string[]; // assume URLs or empty
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

const PosFarmersPosts = () => {
  const posId = "68b3dd0b90233bf9f06986fc";

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
        return data.data || [];
      }
      throw new Error(data.message || "Failed to fetch posts");
    },
    enabled: !!posId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

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
      <div className="text-center mt-10 text-gray-600">No posts found for this POS.</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">POS Farmer's Posts</h1>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li
            key={post._id}
            className="border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-700 mb-4">{post.description}</p>

            <div className="mb-4">
              <h3 className="font-semibold mb-1">Crops:</h3>
              <ul className="list-disc list-inside space-y-1">
                {post.crops.map((crop, i) => (
                  <li key={i}>
                    {crop.name} ({crop.type}) - Quantity: {crop.quantity} Quintals @ ₹
                    {crop.pricePerQuintal} per Quintal
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-1">Location:</h3>
              <p className="text-gray-600">
                {post.location.village}, {post.location.block},{" "}
                {post.location.tehsil}, {post.location.district}, {post.location.state} -{" "}
                {post.location.pincode}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
              <div>Status: <span className={`font-semibold ${
                post.status === "active" ? "text-green-600" : "text-red-600"
              }`}>{post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span></div>
              <div>Ready By: {new Date(post.readyByDate).toLocaleDateString()}</div>
              <div>Created: {new Date(post.createdAt).toLocaleDateString()}</div>
              <div>Updated: {new Date(post.updatedAt).toLocaleDateString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PosFarmersPosts;
