import { useEffect, useState } from "react";
import type { ProfileType } from "../components/Profile";
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

const PosFarmersPost = () => {
  const [userRole, setUserRole] = useState<string>("");
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getProfileFromStorage = () => {
      setLoading(true);
      setError("");
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedProfile = JSON.parse(userData) as ProfileType;
          setProfile(parsedProfile);
          setUserRole(parsedProfile.role?.toLowerCase() || "");
        } else {
          setError("No profile data found");
        }
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        setError("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };
    getProfileFromStorage();
  }, []);

  // Query posts when profile is loaded
  const {
    data: posts = [],
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorObj,
  } = useQuery<Post[], Error>({
    queryKey: ["farmer-demand-posts", profile?._id],
    queryFn: async () => {
      if (!profile?._id) return [];
      const { data } = await api.post<ApiResponse>(
        "/api/posts/details",
        { id: profile._id },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status_code === 200) {
        return data.data || [];
      }
      throw new Error(data.message || "Failed to fetch posts");
    },
    enabled: !!profile?._id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return <div className="text-center text-red-600 mt-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Role: <span className="capitalize">{userRole}</span></h1>
      {postsLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
        </div>
      ) : postsError ? (
        <div className="text-center text-red-600">{postsErrorObj?.message || "Failed to load posts"}</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-600">No posts found for this POS.</div>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post._id} className="border border-gray-300 rounded-lg p-6 bg-white hover:shadow transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="mb-3 text-gray-700">{post.description}</p>
              <div className="mb-2">
                <span className="font-semibold">Crops: </span>
                <ul className="list-disc list-inside space-y-1">
                  {post.crops.map((crop, idx) => (
                    <li key={idx}>
                      {crop.name} ({crop.type}) - Quantity: {crop.quantity} Quintals @ ₹{crop.pricePerQuintal} per Quintal
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Required By: </span>
                {post.requiredByDate && new Date(post.requiredByDate).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Location: </span>
                {post.location.village}, {post.location.block}, {post.location.tehsil}, {post.location.district}, {post.location.state} - {post.location.pincode}
              </div>
              <div className="flex flex-wrap gap-2 text-gray-600 text-sm mt-2">
                <div>Status: <span className={`font-semibold ${post.status === "active" ? "text-green-600" : "text-red-600"}`}>{post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span></div>
                <div>Created: {new Date(post.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(post.updatedAt).toLocaleDateString()}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PosFarmersPost;
