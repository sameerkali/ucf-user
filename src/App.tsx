import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import PostsPage from "./pages/PostsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";
import SettingsPage from "./pages/SettingsPage";
import HelpAndSupportPage from "./pages/HelpAndSupportPage";
import LandingPage from "./pages/LandingPage";

import OfflineBanner from "./components/OfflineBanner";
import InstallBanner from "./components/InstallBanner";
import Header from "./components/Headr";
import Dock from "./components/Dock";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (check localStorage, token, etc.)
    const token = localStorage.getItem("userToken");
    const hasCompletedLanding = localStorage.getItem("hasCompletedLanding");
    
    if (token && hasCompletedLanding) {
      setIsAuthenticated(true);
    }
  }, []);

  // Show only landing page without any navigation
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Show full app with navigation after authentication
  return (
    <BrowserRouter>
      <OfflineBanner />
      <InstallBanner />
      <Header />
      
      <div className="min-h-screen pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/post" element={<PostsPage />} />
          <Route path="/help" element={<HelpAndSupportPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
      
      <Dock />
    </BrowserRouter>
  );
}
