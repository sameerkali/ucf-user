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
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";
import SettingsPage from "./pages/SettingsPage";
import HelpAndSupportPage from "./pages/HelpAndSupportPage";
import LandingPage from "./pages/LandingPage";
import ProfileComplete from "./pages/ProfileCompletePage";

import OfflineBanner from "./components/OfflineBanner";
import InstallBanner from "./components/InstallBanner";
import Header from "./components/Headr";
import Dock from "./components/Dock";
import LoadingScreen from "./components/LoadingScreen";
import { useAppLoading } from "./hooks/useAppLoading";

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
      <OfflineBanner />
      <InstallBanner />
      <Routes>
        {/* Routes WITHOUT the Header and Dock */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/complete-profile" element={<ProfileComplete />} />

        {/* Routes WITH the Header and Dock */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpAndSupportPage />} />
        </Route>

        {/* Catch-all route to redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
