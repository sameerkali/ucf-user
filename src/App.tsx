import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PostsPage from "./pages/PostsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";

import OfflineBanner from "./components/OfflineBanner";
import InstallBanner from "./components/InstallBanner";
import Header from "./components/Headr";
import Dock from "./components/Dock";
import SettingsPage from "./pages/SettingsPage";
import HelpAndSupportPage from "./pages/HelpAndSupportPage";

export default function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <InstallBanner />
      <Header />
      <div className="min-h-screen pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/404" element={<NotFoundPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/post" element={<PostsPage />} />
                    <Route path="/help" element={<HelpAndSupportPage />} />

          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
      <Dock />
    </BrowserRouter>
  );
}
