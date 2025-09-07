import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  UserCheck,
  Mail,
  Edit3
} from "lucide-react";

type Address = {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
};

export type ProfileType = {
  _id: string;
  id?: string;
  name: string;
  fatherName?: string;
  mobile: string;
  email?: string;
  address?: Address;
  authMethod?: string;
  role: string;
  isVerified: boolean;
  mobileVerified: boolean;
  bankVerified: boolean;
  otherDetailsVerified: boolean;
  profileStatus: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Error</h2>
          <p className="text-red-600 mb-6">{error || "No profile data available"}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("back")}
          </button>
        </div>
      </div>
    );
  }

  const formatAddress = (address?: Address) => {
    if (!address) return "N/A";
    return `${address.village}, ${address.block}, ${address.tehsil}, ${address.district}, ${address.state} - ${address.pincode}`;
  };

  const profileItems = [
    {
      icon: User,
      title: t("name"),
      value: profile?.name ?? "N/A"
    },
    ...(userRole === "farmer" && profile?.fatherName ? [{
      icon: UserCheck,
      title: t("fatherName"),
      value: profile.fatherName
    }] : []),
    {
      icon: Phone,
      title: t("mobile"),
      value: profile?.mobile ?? "N/A"
    },
    ...(userRole === "pos" && profile?.email ? [{
      icon: Mail,
      title: t("email"),
      value: profile.email
    }] : []),
    {
      icon: MapPin,
      title: t("address"),
      value: formatAddress(profile?.address)
    },
    {
      icon: Shield,
      title: t("role"),
      value: profile?.role ?? "N/A"
    },
    {
      icon: Calendar,
      title: t("memberSince"),
      value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"
    }
  ];

  const statusItems = [
    {
      title: t("profileVerified"),
      status: profile?.isVerified
    },
    {
      title: t("bankVerified"),
      status: profile?.bankVerified
    },
    {
      title: t("otherDetailsVerified"),
      status: profile?.otherDetailsVerified
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{profile?.name}</h1>
              <p className="text-sm text-gray-500 capitalize">
                {userRole === "pos" ? "POS Profile" : "Farmer Profile"}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Edit3 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Profile Information - Simple List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("profileInformation")}</h2>
          <div className="bg-white rounded-lg divide-y divide-gray-100">
            {profileItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-600 break-words">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Status - Simple List */}
        {userRole !== 'pos' && 
       
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("verificationStatus")}</h2>
          <div className="bg-white rounded-lg divide-y divide-gray-100">
            {statusItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-4 py-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.status ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {item.status ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className={`text-sm ${item.status ? 'text-green-600' : 'text-red-600'}`}>
                    {item.status ? t("verified") : t("notVerified")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
         }
      </div>
    </div>
  );
}
