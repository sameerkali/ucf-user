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
  UserCheck
} from "lucide-react";

type Address = {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
};

type ProfileType = {
  _id: string;
  name: string;
  fatherName: string;
  mobile: string;
  address?: Address;
  authMethod: string;
  role: string;
  isVerified: boolean;
  mobileVerified: boolean;
  bankVerified: boolean;
  otherDetailsVerified: boolean;
  profileStatus: string;
  createdAt: string;
  updatedAt: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Get profile data from localStorage instead of API call
    const getProfileFromStorage = () => {
      setLoading(true);
      setError("");

      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedProfile = JSON.parse(userData) as ProfileType;
          setProfile(parsedProfile);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "No profile data available"}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("back")}
          </button>
        </div>
      </div>
    );
  }

  const profileItems = [
    {
      icon: User,
      title: t("name"),
      value: profile?.name ?? "N/A",
      description: t("fullName")
    },
    {
      icon: UserCheck,
      title: t("fatherName"),
      value: profile?.fatherName ?? "N/A",
      description: t("fatherFullName")
    },
    {
      icon: Phone,
      title: t("mobile"),
      value: profile?.mobile ?? "N/A",
      description: t("registeredMobile")
    },
    {
      icon: MapPin,
      title: t("address"),
      value: profile?.address
        ? `${profile.address.village}, ${profile.address.block}, ${profile.address.tehsil}, ${profile.address.district}, ${profile.address.state} - ${profile.address.pincode}`
        : "N/A",
      description: t("completeAddress")
    },
    {
      icon: Shield,
      title: t("role"),
      value: profile?.role ?? "N/A",
      description: t("userRole")
    },
    {
      icon: Calendar,
      title: t("memberSince"),
      value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A",
      description: t("accountCreationDate")
    }
  ];

  const statusItems = [
    {
      title: t("profileVerified"),
      status: profile?.isVerified,
      description: t("profileVerificationStatus")
    },
    {
      title: t("mobileVerified"),
      status: profile?.mobileVerified,
      description: t("mobileVerificationStatus")
    },
    {
      title: t("bankVerified"),
      status: profile?.bankVerified,
      description: t("bankVerificationStatus")
    },
    {
      title: t("otherDetailsVerified"),
      status: profile?.otherDetailsVerified,
      description: t("otherDetailsVerificationStatus")
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{profile?.name ?? t("profile")}</h1>
              <p className="text-sm text-gray-500">{t("viewProfile")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("profileInformation")}</h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {profileItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-xl bg-white shadow-sm border border-gray-200"
              >
                <div className="p-3 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-900 font-medium mt-1 break-words">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("verificationStatus")}</h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {statusItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm border border-gray-200"
              >
                <div className={`p-2 rounded-full ${item.status ? 'bg-green-100' : 'bg-red-100'}`}>
                  {item.status ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                  <div className={`text-xs font-medium mt-1 ${item.status ? 'text-green-600' : 'text-red-600'}`}>
                    {item.status ? t("verified") : t("notVerified")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("profileStatus")}</h3>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile?.profileStatus === 'completed' 
                ? 'bg-green-100 text-green-800'
                : profile?.profileStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {profile?.profileStatus ?? 'Unknown'}
            </div>
            <span className="text-sm text-gray-500">
              {profile?.profileStatus === 'completed' 
                ? t("profileCompleted")
                : profile?.profileStatus === 'pending'
                ? t("profilePending")
                : t("profileIncomplete")
              }
            </span>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("accountInformation")}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("authMethod")}:</span>
              <span className="font-medium text-gray-900 capitalize">{profile?.authMethod ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("accountCreated")}:</span>
              <span className="font-medium text-gray-900">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("lastUpdated")}:</span>
              <span className="font-medium text-gray-900">
                {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
