import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Farmer {
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
}

interface FarmerDetails extends Farmer {
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

interface ProfileType {
  _id: string;
  role: string;
}

interface ApiResponseList {
  status_code: number;
  message: string;
  data: Farmer[];
  totalPages: number;
}

interface ApiResponseDetail {
  status_code: number;
  message: string;
  data: FarmerDetails;
}

const FarmerDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  farmerId: string | null;
}> = ({ isOpen, onClose, farmerId }) => {
  const query = useQuery<ApiResponseDetail, Error>(
    ["farmer-details", farmerId],
    async () => {
      if (!farmerId) throw new Error("Invalid farmer Id");
      const { data } = await api.get<ApiResponseDetail>("/api/pos/get-farmer-details", {
        data: { id: farmerId },
        headers: { "Content-Type": "application/json" },
      });
      if (data.status_code !== 200) {
        throw new Error(data.message || "Failed to fetch farmer details");
      }
      return data;
    },
    {
      enabled: !!farmerId && isOpen,
      refetchOnWindowFocus: false,
    }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 font-bold text-gray-600 hover:text-gray-900"
          aria-label="Close modal"
        >
          &#x2715;
        </button>

        {query.isLoading ? (
          <p className="text-center">Loading details...</p>
        ) : query.isError ? (
          <p className="text-center text-red-600">
            Error: {query.error?.message || "Failed to load details"}
          </p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">{query.data?.data.name}</h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Father Name:</strong> {query.data?.data.fatherName}
              </p>
              <p>
                <strong>Mobile:</strong> {query.data?.data.mobile}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {`${query.data?.data.address.village}, ${query.data?.data.address.block}, ${query.data?.data.address.tehsil}, ${query.data?.data.address.district}, ${query.data?.data.address.state} - ${query.data?.data.address.pincode}`}
              </p>
              <p>
                <strong>Verified:</strong> {query.data?.data.isVerified ? "Yes" : "No"}
              </p>
              <p>
                <strong>Mobile Verified:</strong> {query.data?.data.mobileVerified ? "Yes" : "No"}
              </p>
              <p>
                <strong>Bank Verified:</strong> {query.data?.data.bankVerified ? "Yes" : "No"}
              </p>
              <p>
                <strong>Other Details Verified:</strong>{" "}
                {query.data?.data.otherDetailsVerified ? "Yes" : "No"}
              </p>
              <p>
                <strong>Profile Status:</strong> {query.data?.data.profileStatus}
              </p>
              <p>
                <strong>Auth Method:</strong> {query.data?.data.authMethod}
              </p>
              <p>
                <strong>Role:</strong> {query.data?.data.role}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(query.data?.data.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(query.data?.data.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PosFarmersUnderMe: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [page, setPage] = useState<number>(1);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

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

  const { data, isLoading, isError, error } = useQuery<ApiResponseList, Error>({
    queryKey: ["pos-farmers", posId, page],
    queryFn: async () => {
      if (!posId) return { status_code: 200, message: "", data: [], totalPages: 1 };
      const { data } = await api.get<ApiResponseList>("/api/pos/get-farmers", {
        data: { filters: { _id: posId }, page },
        headers: { "Content-Type": "application/json" },
      });
      if (data.status_code !== 200) throw new Error(data.message || "Failed to load farmers");
      return data;
    },
    enabled: !!posId,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const totalPages = data?.totalPages || 1;

  const farmers = data?.data || [];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Farmers Under Me</h1>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      ) : isError ? (
        <div className="text-center text-red-600 font-semibold">{error.message}</div>
      ) : farmers.length === 0 ? (
        <div className="text-center text-gray-600 font-medium">
          No farmers found under you.
        </div>
      ) : (
        <>
          <ul className="divide-y border border-gray-300 rounded-md">
            {farmers.map((farmer) => (
              <li
                key={farmer._id}
                className="p-4 cursor-pointer hover:bg-green-50 transition flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                onClick={() => setSelectedFarmerId(farmer._id)}
              >
                <div>
                  <p className="font-semibold text-lg">{farmer.name}</p>
                  <p className="text-gray-600 text-sm">{farmer.fatherName}</p>
                </div>
                <div className="text-gray-600">
                  {farmer.mobile}
                </div>
                <div className="text-gray-600 text-sm">
                  {`${farmer.address.village}, ${farmer.address.block}, ${farmer.address.tehsil}, ${farmer.address.district}, ${farmer.address.state}, ${farmer.address.pincode}`}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Farmer details modal */}
      {/* <FarmerDetailsModal
        isOpen={!!selectedFarmerId}
        onClose={() => setSelectedFarmerId(null)}
        farmerId={selectedFarmerId}
      /> */}
    </div>
  );
};

export default PosFarmersUnderMe;
