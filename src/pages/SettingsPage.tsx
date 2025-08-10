// src/pages/SettingsPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  User,
  Languages,
  LogOut,
  HelpCircle,
  Info,
  Settings as SettingsIcon,
} from "lucide-react";

type LanguageCode = "en" | "hi";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [pendingLang, setPendingLang] = useState<LanguageCode>(
    i18n.language as LanguageCode
  );
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Dummy profile and version
  const profileImgUrl = "https://randomuser.me/api/portraits/men/75.jpg";
  const profileName = "John Doe";
  const appVersion = "v1.2.3";

  // Open language popup with current language loaded into a local "pending" state
  const openLanguagePopup = () => {
    setPendingLang((i18n.language as LanguageCode) || "en");
    setShowLanguagePopup(true);
  };

  // Apply language only on OK
  const applyLanguageChange = () => {
    if (i18n.language !== pendingLang) {
      i18n.changeLanguage(pendingLang);
      localStorage.setItem("appLanguage", pendingLang);
    }
    setShowLanguagePopup(false);
  };

  const handleLogout = () => {
    setShowLogoutPopup(false);
    alert("Logged out successfully!");
    navigate("/login");
  };

  const options = useMemo(
    () => [
      {
        label: "Profile",
        icon: User,
        onClick: () => navigate("/profile"),
        description: "View and edit your profile",
      },
      {
        label: "Change Language",
        icon: Languages,
        onClick: openLanguagePopup,
        description: "Select your preferred language",
      },
      {
        label: "FAQ",
        icon: HelpCircle,
        onClick: () => navigate("/faq"),
        description: "Frequently asked questions",
      },
      {
        label: "App Version",
        icon: Info,
        onClick: () => {},
        description: appVersion,
      },
      {
        label: "Preferences",
        icon: SettingsIcon,
        onClick: () => navigate("/preferences"),
        description: "Customize your experience",
      },
      {
        label: "Logout",
        icon: LogOut,
        onClick: () => setShowLogoutPopup(true),
        description: "Sign out of your account",
      },
    ],
    [navigate, appVersion]
  );

  return (
    <div className=" min-h-screen px-4 py-6">
      {/* Profile Card */}
      <div
        className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer hover:bg-gray-50"
        onClick={() => navigate("/profile")}
      >
        <img
          src={profileImgUrl}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover border border-gray-300"
        />
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">
            {profileName}
          </div>
          <div className="text-sm text-gray-500">View Profile</div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      {/* Options Grid: list on mobile, tiles on larger screens */}
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
              <div className="font-medium text-gray-900">{opt.label}</div>
              <div className="text-sm text-gray-500">{opt.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Language Modal (Apply on OK, not on select) */}
      {showLanguagePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Change Language
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowLanguagePopup(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Language
              </label>
              <select
                value={pendingLang}
                onChange={(e) => setPendingLang(e.target.value as LanguageCode)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 py-3 border-t border-gray-200">
              <button
                onClick={() => setShowLanguagePopup(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={applyLanguageChange}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            <User className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="mb-5 text-gray-800">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-800 transition"
                onClick={() => setShowLogoutPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
