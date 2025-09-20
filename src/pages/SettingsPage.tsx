import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  User,
  Languages,
  LogOut,
  ChevronDown,
  Check,FileText, Gem, Package, Users
} from "lucide-react";

type LanguageCode = "en" | "hi";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [pendingLang, setPendingLang] = useState<LanguageCode>(
    (i18n.language as LanguageCode) || "en"
  );
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिन्दी" },
  ];

  useEffect(() => {
    const getProfileFromStorage = () => {
      setLoading(true);
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          let parsedProfile: any = null;
          try {
            const parsed = JSON.parse(userData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedProfile = parsed[0];
            } else if (typeof parsed === "object" && parsed !== null) {
              parsedProfile = parsed;
            }
          } catch {
            parsedProfile = null;
          }
          setProfile(parsedProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getProfileFromStorage();
  }, []);

  const role = useMemo(() => {
    if (!profile?.role) return "kisaan";
    const r = String(profile.role).toLowerCase();
    return r === "farmer" || r === "kisaan" ? "kisaan" : r === "pos" ? "pos" : "kisaan";
  }, [profile]);

  const isFarmer = role === "kisaan";
  const isPOS = role === "pos";


  const openLanguagePopup = () => {
    setPendingLang((i18n.language as LanguageCode) || "en");
    setShowLanguagePopup(true);
    setShowDropdown(false);
  };

  const handleMyPosts = () => {
    navigate("/kisaan/posts");
  };
  const handleMyDimands = () => {
    navigate("/kisaan/dimand");
  }
  const handleMyfulfillments = () => {
    navigate("/kisaan/fulfillments");
  };
  const handleMyFarmers = () => {
    navigate("/pos/all-farmers-under-me");
  };

  const applyLanguageChange = () => {
    if (i18n.language !== pendingLang) {
      i18n.changeLanguage(pendingLang);
      localStorage.setItem("appLanguage", pendingLang);
    }
    setShowLanguagePopup(false);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    setShowLogoutPopup(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("_grecaptcha");

    if (isPOS) {
      navigate("/login?role=pos");
    } else {
      navigate("/login?role=kisaan");
    }
  };

  const handleLanguageSelect = (langCode: LanguageCode) => {
    setPendingLang(langCode);
    setShowDropdown(false);
  };

  const selectedLanguage = languageOptions.find(
    (opt) => opt.value === pendingLang
  );

const options = useMemo(() => {
  const baseOptions = [
    {
      labelKey: "Change Language",
      icon: Languages,
      onClick: openLanguagePopup,
      descriptionKey: "Select Preferred Language",
    },
  ];

  if (isFarmer) {
    baseOptions.push(
      {
        labelKey: "My Posts",
        icon: FileText,
        onClick: handleMyPosts,
        descriptionKey: "Select This To See All My Posts",
      },
      {
        labelKey: "My Dimands",
        icon: Gem,
        onClick: handleMyDimands,
        descriptionKey: "Select This To See All My Dimands",
      },
      {
        labelKey: "My Fulfillments",
        icon: Package,
        onClick: handleMyfulfillments,
        descriptionKey: "Select This To See My Fulfillments",
      }
    );
  }

  if (isPOS) {
    baseOptions.push({
      labelKey: "My Farmers",
      icon: Users,
      onClick: handleMyFarmers,
      descriptionKey: "Select This To See My Farmers",
    });
  }

  baseOptions.push({
    labelKey: "Logout",
    icon: LogOut,
    onClick: () => setShowLogoutPopup(true),
    descriptionKey: "signOutAccount",
  });

  return baseOptions;
}, [isFarmer, isPOS, navigate, profile]);


  return (
    <div className="min-h-screen px-4 py-6">
      <div
        className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white shadow hover:shadow-md transition cursor-pointer hover:bg-gray-50"
        onClick={() => {
          if (profile) {
            if (isPOS) {
              navigate("/pos/profile");
            } else {
              navigate("/kisaan/profile");
            }
          }
        }}
      >
       

        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">
            {loading ? t("loading") + "..." : profile?.name || t("profile")}
          </div>
          <div className="text-sm text-gray-500">
            {t("viewProfile")} • {profile?.role || "User"}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt, idx) => (
          <button
            key={idx}
            className="flex items-center sm:items-start sm:flex-col gap-3 p-4 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md hover:bg-gray-50 transition text-left"
            onClick={opt.onClick}
          >
            <div className="p-3 bg-gray-100 rounded-full flex items-center justify-center">
              <opt.icon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{t(opt.labelKey)}</div>
              <div className="text-sm text-gray-500">{t(opt.descriptionKey!)}</div>
            </div>
          </button>
        ))}
      </div>

      {showLanguagePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("changeLanguage")}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowLanguagePopup(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t("selectLanguage")}
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left bg-white focus:outline-none flex items-center justify-between"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span>{selectedLanguage?.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {languageOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between first:rounded-t-lg last:rounded-b-lg"
                        onClick={() =>
                          handleLanguageSelect(option.value as LanguageCode)
                        }
                      >
                        <span>{option.label}</span>
                        {pendingLang === option.value && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-3 border-t border-gray-200">
              <button
                onClick={() => setShowLanguagePopup(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition focus:outline-none"
              >
                {t("cancel")}
              </button>
              <button
                onClick={applyLanguageChange}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none"
              >
                {t("ok")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            <User className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="mb-5 text-gray-800">{t("areYouSureLogout")}</p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-800 transition focus:outline-none"
                onClick={() => setShowLogoutPopup(false)}
              >
                {t("cancel")}
              </button>
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition focus:outline-none"
                onClick={handleLogout}
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
