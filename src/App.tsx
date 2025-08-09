import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PostsPage from "./pages/PostsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";
import useOnlineStatus from "./hooks/useOnlineStatus";
import usePWAInstallPrompt from "./hooks/usePWAInstallPrompt";
import { useTranslation } from "react-i18next";

export default function App() {
  const isOnline = useOnlineStatus();
  const { isInstallable, promptInstall } = usePWAInstallPrompt();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");
  };

  return (
    <BrowserRouter>
      {/* Offline banner */}
      {!isOnline && (
        <div style={{ background: "orange", padding: "8px", textAlign: "center" }}>
          ⚠️ {t("offline")}
        </div>
      )}

      {/* Install App button */}
      {isInstallable && (
        <div style={{ background: "#4CAF50", padding: "8px", textAlign: "center" }}>
          <button
            onClick={promptInstall}
            style={{
              background: "white",
              color: "#4CAF50",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            📲 Install App
          </button>
        </div>
      )}

      {/* Top Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px" }}>
        {/* Theme Toggle */}
        

        {/* Language Toggle */}
        <button onClick={toggleLanguage}>
          {i18n.language === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
