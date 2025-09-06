import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

type FulfillmentStatus = "pending" | "approve" | "reject" | "pending for verification";

interface Fulfillment {
  _id: string;
  productName: string;
  quantity: number;
  date: string;
  status: FulfillmentStatus;
}

interface ProfileType {
  _id: string;
  role: string;
}

export default function FulfillmentPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string>("");

  const [filterStatus, setFilterStatus] = useState<FulfillmentStatus | "">("");

  // Load user profile from localStorage
  useEffect(() => {
    const getProfileFromStorage = () => {
      setLoadingProfile(true);
      setProfileError("");

      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedProfile = JSON.parse(userData) as ProfileType;
          setProfile(parsedProfile);
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
    };

    getProfileFromStorage();
  }, [navigate]);

  // React Query to fetch fulfillments
  const {
    data: fulfillments = [],
    isLoading: loadingFulfillments,
    isError,
    error,
  } = useQuery<Fulfillment[], Error>({
    queryKey: ["fulfillments-my", profile?._id, filterStatus],
    queryFn: async () => {
      if (!profile?._id) return [];
      const { data } = await api.post(
        "/fulfillments/my",
        { filters: filterStatus ? { status: filterStatus } : {} },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status_code === 200) {
        return data.data || [];
      }
      throw new Error(data.message || "Failed to fetch fulfillments");
    },
    enabled: !!profile?._id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

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

      <div className="mb-6">
        <label className="mr-3 font-semibold">Filter by Status:</label>
        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FulfillmentStatus | "")}
        >
          <option value="">All</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
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
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-green-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {fulfillments.map(({ _id, productName, quantity, date, status }) => (
              <tr key={_id} className="hover:bg-green-50 transition-colors even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{productName}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {new Date(date).toLocaleDateString()}
                </td>
                <td
                  className={`border border-gray-300 px-4 py-2 text-center font-semibold ${
                    status === "approve"
                      ? "text-green-700"
                      : status === "reject"
                      ? "text-red-700"
                      : status === "pending for verification"
                      ? "text-yellow-600"
                      : "text-gray-700"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
