import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from "./pages/HomePage";
import PostsPage from "./pages/PostsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";
import SettingsPage from "./pages/SettingsPage";
import HelpAndSupportPage from "./pages/HelpAndSupportPage";
import LandingPage from "./pages/LandingPage";
import ProfileComplete from "./pages/profileComplete/ProfileCompletePage";

// POS Pages
import PosHomePage from "./pos-pages/PosHomePage";
import PosTransactionsPage from "./pos-pages/PosTransactionsPage";
import PosHelpAndSupportPage from "./pos-pages/PosHelpAndSupportPage";
import CreateFarmerAccount from "./pos-pages/CreateFarmerAccount";
import ReviewRequests from "./pos-pages/ReviewRequests";

import OfflineBanner from "./components/OfflineBanner";
import VerificationPendingBanner from "./components/VerificationPendingBanner";
import InstallBanner from "./components/InstallBanner";
import Header from "./components/Headr";
import PosHeader from "./components/PosHeader";
import Dock from "./components/Dock";
import PosDock from "./components/PosDock";
import LoadingScreen from "./components/LoadingScreen";
import { useAppLoading } from "./hooks/useAppLoading";
import { Toaster } from "react-hot-toast";
import Profile from "./components/Profile";
import PosCreatePost from "./pos-pages/PosCreatePost";
import PosFulfillment from "./pos-pages/PosFulfillment";
import CropDetailsPage from "./components/CropDetailsPage";
import CreatePostPage from "./pages/CreatePostPage";
import DashboardPage from "./pages/DashboardPage";
import FulfillmentPage from "./pages/FulfillmentPage";
import PosPosts from "./pos-pages/PosPosts";
import PosFarmersUnderMe from "./pos-pages/PosFarmersUnderMe";
import PosFarmersPost from "./pos-pages/PosFarmersPost";
import DimandPage from "./pages/DimandPage";
import PosFarmerDimand from "./pos-pages/PosFarmerDimand";
import Inventory from "./pos-pages/PosInventory";
import StockRefill from "./pos-pages/PosStockRefill";

// Authentication guard for protected routes
function RequireAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Redirect logged-in users away from the login/signup/landing pages
function RedirectIfAuthenticated() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

// Role-based layout components with banners inside
const KisaanLayout = () => (
  <>
    {/* Banners at the top of the layout */}
    <OfflineBanner />
    <VerificationPendingBanner />
    <InstallBanner />
    
    <Header />
    <main className="min-h-screen pb-16 md:pb-0">
      <Outlet />
    </main>
    <Dock />
  </>
);

const PosLayout = () => (
  <>
    {/* Banners at the top of the layout */}
    <OfflineBanner />
    <InstallBanner />
    
    <PosHeader />
    <main className="min-h-screen pb-16 md:pb-0">
      <Outlet />
    </main>
    <PosDock />
  </>
);

// Role-based route wrapper
function RoleBasedLayout() {
  const role = localStorage.getItem("role");
  
  if (role === "pos") {
    return <PosLayout />;
  } else {
    return <KisaanLayout />;
  }
}

// Home page router based on role
function RoleBasedHome() {
  const role = localStorage.getItem("role");
  
  if (role === "pos") {
    return <Navigate to="/pos/home" replace />;
  } else {
    return <Navigate to="/kisaan/home" replace />;
  }
}

export default function App() {
  const isLoading = useAppLoading();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
        
        <Routes>
          {/* Redirect logged-in users from auth and landing pages */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />

          {/* Protected routes with role-based routing */}
          <Route element={<RequireAuth />}>
            {/* Role-based home redirect */}
            <Route path="/home" element={<RoleBasedHome />} />
            
            {/* Kisaan routes */}
            <Route element={<KisaanLayout />}>
              <Route path="/kisaan/home" element={<HomePage />} />
              <Route path="/kisaan/crop-details/:id" element={<CropDetailsPage />} />
              <Route path="/kisaan/posts" element={<PostsPage />} />
              <Route path="/kisaan/dimand" element={<DimandPage />} />
              <Route path="/kisaan/fulfillments" element={<FulfillmentPage />} />
              <Route path="/kisaan/post-create" element={<CreatePostPage />} />
              <Route path="/kisaan/settings" element={<SettingsPage />} />
              <Route path="/kisaan/help" element={<HelpAndSupportPage />} />
              <Route path="/kisaan/profile" element={<Profile />} />
              <Route path="/kisaan/dashboard" element={<DashboardPage />} />
            </Route>

            {/* POS routes */}
            <Route element={<PosLayout />}>
              <Route path="/pos/home" element={<PosHomePage />} />
              <Route path="/pos/transactions" element={<PosTransactionsPage />} />
              <Route path="/pos/create-farmer-account" element={<CreateFarmerAccount />} />
              <Route path="/pos/review-requests" element={<ReviewRequests />} />
              <Route path="/pos/settings" element={<SettingsPage />} />
              <Route path="/pos/help" element={<PosHelpAndSupportPage />} />
              <Route path="/pos/profile" element={<Profile />} />
              <Route path="/pos/create-post" element={<PosCreatePost />} />
              <Route path="/pos/fulfillment-requests" element={<PosFulfillment />} />
              <Route path="/pos/posts" element={<PosPosts />} />
              <Route path="/pos/all-farmers-under-me" element={<PosFarmersUnderMe />} />
              <Route path="/pos/farmers-posts" element={<PosFarmersPost />} />
              <Route path="/pos/farmers-dimands" element={<PosFarmerDimand />} />
              <Route path="/pos/inventory" element={<Inventory />} />
              <Route path="/pos/stock-refill" element={<StockRefill />} />
            </Route>

            {/* Shared routes with role-based layout */}
            <Route element={<RoleBasedLayout />}>
              <Route path="/complete-profile" element={<ProfileComplete />} />
            </Route>
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
