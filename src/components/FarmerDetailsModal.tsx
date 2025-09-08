import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { X, Landmark, Info, Leaf, ShieldCheck } from "lucide-react";
import { PosFarmerDetailsModalSkeleton } from "../utils/Skeletons";
import React from "react";

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
  cropsHandled: string[];
  crops: string[];
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

const FarmerDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  farmerId: string | null;
}> = ({ isOpen, onClose, farmerId }) => {
  const token = localStorage.getItem("token");

  const { data, isLoading, isError, error } = useQuery<
    FarmerDetailResponse,
    Error
  >({
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
      if (!data.success || !data.data?.length)
        throw new Error("Failed to fetch or decode farmer details");
      return data;
    },
    enabled: !!farmerId && isOpen,
    refetchOnWindowFocus: false,
  });

  if (!isOpen) return null;
  const details = data?.data?.[0];

  const DetailItem: React.FC<{
    label: string;
    value: string | React.ReactNode;
  }> = ({ label, value }) => (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-base text-slate-800">{value}</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-emerald-800">
            Farmer Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <PosFarmerDetailsModalSkeleton />
          ) : isError ? (
            <p className="text-center text-red-600">
              {error?.message || "Failed to load."}
            </p>
          ) : details ? (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <h3 className="text-xl font-bold text-slate-900">
                  {details.name}
                </h3>
                <p className="text-slate-500">
                  Father's Name: {details.fatherName}
                </p>
              </div>
              <Section title="Personal Information" icon={Info}>
                <DetailItem label="Mobile Number" value={details.mobile} />
                <DetailItem label="Aadhar Number" value={details.adharNo} />
                <DetailItem label="Authentication" value={details.authMethod} />
                <DetailItem
                  label="Profile Status"
                  value={
                    <StatusPill text={details.profileStatus} color="blue" />
                  }
                />
                <DetailItem
                  label="Address"
                  value={`${details.address.village}, ${details.address.tehsil}, ${details.address.district}, ${details.address.state} - ${details.address.pincode}`}
                />
              </Section>
              <Section title="Bank Details" icon={Landmark}>
                {details.bankDetails?.map((bd) => (
                  <React.Fragment key={bd._id}>
                    <DetailItem label="Bank" value={bd.bankName} />
                    <DetailItem label="Account No." value={bd.accountNumber} />
                    <DetailItem label="IFSC Code" value={bd.ifscCode} />
                    <DetailItem label="Branch" value={bd.branch} />
                  </React.Fragment>
                ))}
              </Section>
              <Section title="Verification Status" icon={ShieldCheck}>
                <DetailItem
                  label="Overall"
                  value={
                    <StatusPill
                      text={details.isVerified ? "Verified" : "Not Verified"}
                      color={details.isVerified ? "green" : "red"}
                    />
                  }
                />
                <DetailItem
                  label="Bank"
                  value={
                    <StatusPill
                      text={details.bankVerified ? "Verified" : "Not Verified"}
                      color={details.bankVerified ? "green" : "red"}
                    />
                  }
                />
                <DetailItem
                  label="Mobile"
                  value={
                    <StatusPill
                      text={
                        details.mobileVerified ? "Verified" : "Not Verified"
                      }
                      color={details.mobileVerified ? "green" : "red"}
                    />
                  }
                />
                <DetailItem
                  label="Other"
                  value={
                    <StatusPill
                      text={
                        details.otherDetailsVerified
                          ? "Verified"
                          : "Not Verified"
                      }
                      color={details.otherDetailsVerified ? "green" : "red"}
                    />
                  }
                />
                {details.isVerifiedBy && (
                  <DetailItem
                    label="Verified By"
                    value={`${details.isVerifiedBy.role} (${details.isVerifiedBy.userId})`}
                  />
                )}
              </Section>
              <Section title="Agricultural Details" icon={Leaf}>
                <DetailItem
                  label="Crops Handled"
                  value={
                    details.otherDetails?.[0]?.cropsHandled?.join(", ") || "N/A"
                  }
                />
              </Section>
            </div>
          ) : (
            <p className="text-center text-slate-700">No details found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDetailsModal;

const Section: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div>
    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-700 border-b pb-2 mb-3">
      <Icon className="w-5 h-5 text-emerald-600" />
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {children}
    </div>
  </div>
);

const StatusPill: React.FC<{
  text: string;
  color: "green" | "red" | "blue";
}> = ({ text, color }) => {
  const colors = {
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`px-2.5 py-0.5 text-sm font-semibold rounded-full ${colors[color]}`}
    >
      {text}
    </span>
  );
};
