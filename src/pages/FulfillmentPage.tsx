import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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

  // Updated queryFn to match the actual API response structure
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
          // Fixed: data.data contains the fulfillments array directly, not data.data.fulfillments
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
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );

  if (profileError)
    return <div className="text-red-600 text-center mt-10">{profileError}</div>;

  const statuses: FulfillmentStatus[] = [
    "pending",
    "approve",
    "reject",
    "pending for verification",
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Fulfillments</h1>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <label className="mr-3 font-semibold">Filter by Status:</label>
          <select
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as FulfillmentStatus | "")
            }
          >
            <option value="">All</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center gap-2">
          <span>
            Page {pagination.page} of {pagination.totalPages} • Total: {pagination.total}
          </span>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-2 py-1 rounded border border-gray-300 bg-white disabled:opacity-50 ml-2"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages}
            className="px-2 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {loadingFulfillments ? (
        <div className="text-center text-gray-600">Loading fulfillments...</div>
      ) : isError ? (
        <div className="text-red-600 text-center">Error: {error?.message}</div>
      ) : fulfillments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-300 text-gray-500">
          No fulfillments found.
        </div>
      ) : (
        <div className="space-y-6">
          {fulfillments.map((fulfillment) => (
            <div
              key={fulfillment._id}
              className="border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {fulfillment.post?.title ?? "Untitled Post"}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full font-semibold text-sm ${
                    fulfillment.status === "approve"
                      ? "bg-green-100 text-green-700"
                      : fulfillment.status === "reject"
                      ? "bg-red-100 text-red-700"
                      : fulfillment.status === "pending for verification"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {fulfillment.status.charAt(0).toUpperCase() +
                    fulfillment.status.slice(1)}
                </span>
              </div>
              <p className="mb-4 text-gray-700">
                {fulfillment.post?.description ?? "No description available."}
              </p>
              <div className="mb-4">
                <span className="font-semibold">Requested By:</span>{" "}
                {fulfillment.requestedBy.role.charAt(0).toUpperCase() +
                  fulfillment.requestedBy.role.slice(1)}{" "}
                (ID: {fulfillment.requestedBy.id})
              </div>
              <div className="mb-4">
                <span className="font-semibold">Crops Requested:</span>
                <ul className="list-disc list-inside">
                  {fulfillment.crops.map(({ name, quantity }, i) => (
                    <li key={i}>
                      {name} - {quantity}
                    </li>
                  ))}
                </ul>
              </div>
              {fulfillment.post && (
                <div className="mb-4">
                  <span className="font-semibold">Post Details:</span>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    <li>
                      <strong>Type:</strong> {fulfillment.post.type}
                    </li>
                    <li>
                      <strong>Status:</strong>{" "}
                      {fulfillment.post.status.charAt(0).toUpperCase() +
                        fulfillment.post.status.slice(1)}
                    </li>
                    <li>
                      <strong>Required By:</strong>{" "}
                      {new Date(
                        fulfillment.post.requiredByDate
                      ).toLocaleDateString()}
                    </li>
                    <li>
                      <strong>Location:</strong>{" "}
                      {`${fulfillment.post.location.village}, ${fulfillment.post.location.block}, ${fulfillment.post.location.tehsil}, ${fulfillment.post.location.district}, ${fulfillment.post.location.state} - ${fulfillment.post.location.pincode}`}
                    </li>
                    <li>
                      <strong>Created At:</strong>{" "}
                      {new Date(
                        fulfillment.post.createdAt
                      ).toLocaleDateString()}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
