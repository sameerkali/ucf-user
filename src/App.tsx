import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import PostsPage from "./pages/PostsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";
import SettingsPage from "./pages/SettingsPage";
import HelpAndSupportPage from "./pages/HelpAndSupportPage";
import LandingPage from "./pages/LandingPage";
import ProfileComplete from "./pages/profileComplete/ProfileCompletePage";

import OfflineBanner from "./components/OfflineBanner";
import InstallBanner from "./components/InstallBanner";
import Header from "./components/Headr";
import Dock from "./components/Dock";
import LoadingScreen from "./components/LoadingScreen";
import { useAppLoading } from "./hooks/useAppLoading";
import { Toaster } from "react-hot-toast";
import Profile from "./components/Profile";

// Authentication guard for protected routes
function RequireAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

const MainLayout = () => (
  <>
    <Header />
    <main className="min-h-screen pb-16 md:pb-0">
      <Outlet />
    </main>
    <Dock />
  </>
);

export default function App() {
  const isLoading = useAppLoading();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <OfflineBanner />
      <InstallBanner />
      <Routes>
        {/* Public routes (no header/dock, no auth) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Protected routes (header, dock, must be authenticated) */}
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpAndSupportPage />} />
            <Route path="/complete-profile" element={<ProfileComplete />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
