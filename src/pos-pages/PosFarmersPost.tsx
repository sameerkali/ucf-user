import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { LoadingSkeleton } from "../utils/Skeletons";
import PostCard from "../components/PosPostCard";

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
  photos: string[];
  videos: string[];
  location: Location;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponseData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  data: Post[];
}

interface ApiResponse {
  status_code: number;
  message: string;
  data: ApiResponseData;
}

interface ProfileType {
  _id: string;
  role: string;
}

const PosFarmersPost: React.FC = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const limit = 6;

  useEffect(() => {
    const getProfileFromStorage = () => {
      setLoadingProfile(true);
      setError("");
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedProfile = JSON.parse(userData) as ProfileType;
          setProfile(parsedProfile);
        } else {
          setError("No profile data found");
        }
      } catch {
        setError("Error loading profile data");
      } finally {
        setLoadingProfile(false);
      }
    };
    getProfileFromStorage();
  }, []);

  const {
    data: response,
    isLoading,
    isError,
    error: postsErrorObj,
    isFetching,
  } = useQuery<ApiResponse, Error>({
    queryKey: ["farmer-demand-posts", profile?._id, page],
    queryFn: async () => {
      if (!profile?._id)
        return {
          status_code: 200,
          message: "",
          data: {
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            limit,
            data: [],
          },
        };
      const { data } = await api.post<ApiResponse>(
        "/api/posts/list",
        {
          filters: {},
          page,
          limit,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status_code === 200) {
        return data;
      }
      throw new Error(data.message || "Failed to fetch posts");
    },
    enabled: !!profile?._id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const posts = response?.data?.data || [];
  const totalPages = response?.data?.totalPages || 1;

  if (loadingProfile || isLoading) return <LoadingSkeleton limit={limit} />;

  if (error || isError)
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex justify-center items-center">
        <p className="text-red-600 text-center text-lg">
          {error || postsErrorObj?.message || "Failed to load posts"}
        </p>
      </div>
    );

  if (posts.length === 0)
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600 text-center text-lg">
          No posts found for this POS.
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        All posts by your area farmer
      </h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </ul>

      <nav
        aria-label="Pagination"
        className="mt-10 flex justify-center space-x-3 flex-wrap gap-3"
      >
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || isFetching}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="button"
          aria-disabled={page <= 1}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => {
          const num = i + 1;
          if (
            num === 1 ||
            num === totalPages ||
            (num >= page - 1 && num <= page + 1)
          ) {
            return (
              <button
                key={num}
                onClick={() => setPage(num)}
                aria-current={page === num ? "page" : undefined}
                className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  page === num
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                type="button"
              >
                {num}
              </button>
            );
          }
          if (num === page - 2 || num === page + 2) {
            return (
              <span key={"dots" + num} className="px-2 py-2 select-none">
                ...
              </span>
            );
          }
          return null;
        })}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || isFetching}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="button"
          aria-disabled={page >= totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default PosFarmersPost;
