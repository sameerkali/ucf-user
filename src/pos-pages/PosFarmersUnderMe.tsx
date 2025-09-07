import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Farmer {
  _id: string;
  name: string;
  fatherName: string;
  mobile: string;
  adharNo: string;
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
  isVerifiedBy?: { userId: string; role: string };
}

interface ApiResponseList {
  success: boolean;
  page: number;
  totalPages: number;
  totalUsers: number;
  users: Farmer[];
  message?: string;
}

interface BankDetails {
  _id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  user: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface OtherDetails {
  _id: string;
  user: string;
  role: string;
  cropsHandled: any[];
  crops: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface FarmerDetailResponse {
  success: boolean;
  data: (Farmer & {
    bankDetails?: BankDetails[];
    otherDetails?: OtherDetails[];
  })[];
}

interface ProfileType {
  _id: string;
  role: string;
}

const FarmerDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  farmerId: string | null;
}> = ({ isOpen, onClose, farmerId }) => {
  const token = localStorage.getItem("token");

  const { data, isLoading, isError, error } = useQuery<FarmerDetailResponse, Error>({
    queryKey: ["farmer-details", farmerId],
    queryFn: async () => {
      if (!farmerId) throw new Error("Invalid farmer Id");
      const { data } = await api.post<FarmerDetailResponse>(
        "/api/pos/get-farmer-details",
        { id: farmerId },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!data.success || !data.data?.length) throw new Error("Failed to fetch or decode farmer details");
      return data;
    },
    enabled: !!farmerId && isOpen,
    refetchOnWindowFocus: false,
  });

  if (!isOpen) return null;

  const details = data?.data?.[0];

  return (
    <div className="fixed inset-0 bg-black/70  bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-2xl border border-green-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 font-bold text-gray-500 hover:text-red-500 text-2xl"
          aria-label="Close modal"
        >×</button>
        {isLoading ? (
          <div className="flex items-center justify-center my-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : isError ? (
          <p className="text-center text-red-600">{error?.message || "Failed to load details"}</p>
        ) : details ? (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-green-800">{details.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-gray-800 mb-2">
              <div><span className="font-semibold">Father Name:</span> {details.fatherName}</div>
              <div><span className="font-semibold">Mobile:</span> {details.mobile}</div>
              <div><span className="font-semibold">Adhar No:</span> {details.adharNo}</div>
              <div><span className="font-semibold">Role:</span> {details.role}</div>
              <div>
                <span className="font-semibold">Verified:</span>{" "}
                <span className={details.isVerified ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {details.isVerified ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Profile Status:</span> {details.profileStatus}
              </div>
              <div>
                <span className="font-semibold">Mobile Verified:</span>{" "}
                {details.mobileVerified ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-semibold">Bank Verified:</span>{" "}
                {details.bankVerified ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-semibold">Other Verified:</span>{" "}
                {details.otherDetailsVerified ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-semibold">Auth:</span> {details.authMethod}
              </div>
              <div>
                <span className="font-semibold">Created:</span> {new Date(details.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Updated:</span> {new Date(details.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Address:</span><br />
              <span className="text-gray-700">{details.address.village}, {details.address.block}, {details.address.tehsil}, {details.address.district}, {details.address.state} - {details.address.pincode}</span>
            </div>
            {details.bankDetails && details.bankDetails.length > 0 && (
              <div className="mt-3 mb-2">
                <h3 className="font-semibold text-lg text-green-700 mb-1">Bank Details</h3>
                <ul className="text-gray-700 pl-4 list-disc">
                  {details.bankDetails.map((bd: BankDetails) => (
                    <li key={bd._id}>
                      <span><strong>Bank:</strong> {bd.bankName}</span>, <span><strong>Account:</strong> {bd.accountNumber}</span>, <span><strong>Branch:</strong> {bd.branch}</span>, <span><strong>IFSC:</strong> {bd.ifscCode}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {details.otherDetails && details.otherDetails.length > 0 && (
              <div className="mt-2 mb-2">
                <h3 className="font-semibold text-lg text-green-700 mb-1">Other Details</h3>
                <span><strong>Crops handled:</strong> {details.otherDetails[0].cropsHandled?.join(", ") || "-"}</span>
              </div>
            )}
            {details.isVerifiedBy &&
              <div className="mt-2">
                <p className="font-semibold text-green-700">Verified By: {details.isVerifiedBy.role} (ID: {details.isVerifiedBy.userId})</p>
              </div>
            }
          </div>
        ) : (
          <p className="text-center text-gray-700">No details found.</p>
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
  const token = localStorage.getItem("token");

  // Use placeholderData for pagination instead of keepPreviousData
  const { data, isLoading, isError, error } = useQuery<ApiResponseList, Error>({
    queryKey: ["pos-farmers", posId, page],
    queryFn: async () => {
      if (!posId) return { success: true, page, totalPages: 1, totalUsers: 0, users: [] };
      const { data } = await api.post<ApiResponseList>(
        "/api/pos/get-farmers",
        { data: { filters: { _id: posId }, page } },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }
        }
      );
      if (!data.success) throw new Error(data.message || "Failed to load farmers");
      return data;
    },
    enabled: !!posId,
    placeholderData: { success: true, page, totalPages: 1, totalUsers: 0, users: [] },
    refetchOnWindowFocus: false,
  });

  const totalPages = data?.totalPages ?? 1;
  const farmers: Farmer[] = Array.isArray(data?.users) ? data.users : [];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Farmers Under Me</h1>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      ) : isError ? (
        <div className="text-center text-red-600 font-semibold">{error?.message}</div>
      ) : farmers.length === 0 ? (
        <div className="text-center text-gray-600 font-medium">
          No farmers found under you.
        </div>
      ) : (
        <>
          <ul className="divide-y border border-gray-300 rounded-md">
            {farmers.map((farmer: Farmer) => (
              <li
                key={farmer._id}
                className="p-4 cursor-pointer hover:bg-green-50 transition flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                onClick={() => setSelectedFarmerId(farmer._id)}
              >
                <div>
                  <p className="font-semibold text-lg">{farmer.name}</p>
                  <p className="text-gray-600 text-sm">{farmer.fatherName}</p>
                </div>
                <div className="text-gray-600">{farmer.mobile}</div>
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
      <FarmerDetailsModal
        isOpen={!!selectedFarmerId}
        onClose={() => setSelectedFarmerId(null)}
        farmerId={selectedFarmerId}
      />
    </div>
  );
};

export default PosFarmersUnderMe;
