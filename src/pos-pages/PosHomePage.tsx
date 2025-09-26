import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  ClipboardCheck,
  PlusCircle,
  BarChart2,
  PieChart,
  Leaf,
  Crop,
  ChartBarIncreasingIcon,
  RefrigeratorIcon,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { LoadingSkeleton } from "../utils/Skeletons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface FarmerStatsResponse {
  status_code: number;
  message: string;
  data: {
    monthlyRegistrations: {
      year: number;
      month: number;
      total: number;
      verified: number;
    }[];
    crops: {
      crop: string;
      count: number;
    }[];
  };
}

const PosHomePage = () => {
  const navigate = useNavigate();

  // navigation handlers
  const handleCreateFarmerAccount = () =>
    navigate("/pos/create-farmer-account");
  const handleReviewRequests = () => navigate("/pos/review-requests");
  const handlePost = () => navigate("/pos/create-post");
  const handleFulfillment = () => navigate("/pos/fulfillment-requests");
  const handleMyPosts = () => navigate("/pos/posts");
  const handleFarmersPosts = () => navigate("/pos/farmers-posts");
  const handleFarmersDimands = () => navigate("/pos/farmers-dimands");
  const handleFarmersInventory = () => navigate("/pos/inventory");
  const handleStockRefill = () => navigate("/pos/stock-refill");

  // fetch stats
  const { data, isLoading, isError, error } = useQuery<
    FarmerStatsResponse,
    Error
  >({
    queryKey: ["farmer-stats"],
    queryFn: async () => {
      const { data } = await api.get<FarmerStatsResponse>(
        "/api/pos/farmers-stats"
      );
      if (data.status_code !== 200) {
        throw new Error(data.message || "Failed to fetch farmer stats");
      }
      return data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // action cards
  const cards = [
    { title: "New Farmer", icon: <UserPlus />, onClick: handleCreateFarmerAccount },
    { title: "Review Requests", icon: <ClipboardCheck />, onClick: handleReviewRequests },
    { title: "Create Post", icon: <PlusCircle />, onClick: handlePost },
    { title: "Fulfillment", icon: <BarChart2 />, onClick: handleFulfillment },
    { title: "My Posts", icon: <PieChart />, onClick: handleMyPosts },
    { title: "Farmers Posts", icon: <Leaf />, onClick: handleFarmersPosts },
    { title: "Farmers Dimands", icon: <Crop />, onClick: handleFarmersDimands },
    { title: "Inventory & Stock", icon: <ChartBarIncreasingIcon />, onClick: handleFarmersInventory },
    { title: "Stock Refill", icon: <RefrigeratorIcon />, onClick: handleStockRefill },
  ];

  if (isLoading) {
    return <LoadingSkeleton limit={6} />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600 text-lg">
        {error?.message || "Failed to load farmer stats"}
      </div>
    );
  }

  const stats = data?.data;

  // transform monthly registrations -> line chart
  const lineChartData = {
    labels: stats?.monthlyRegistrations.map(
      (r) => `${r.month}/${r.year}` // month-year
    ),
    datasets: [
      {
        label: "Farmers Registered",
        data: stats?.monthlyRegistrations.map((r) => r.total) || [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#fff",
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#10B981",
        pointHoverBorderColor: "#fff",
      },
      {
        label: "Verified Farmers",
        data: stats?.monthlyRegistrations.map((r) => r.verified) || [],
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#2563EB",
        pointBorderColor: "#fff",
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#2563EB",
        pointHoverBorderColor: "#fff",
      },
    ],
  };

  // transform crops -> doughnut chart
  const doughnutChartData = {
    labels: stats?.crops.map((c) => c.crop) || [],
    datasets: [
      {
        label: "Crop Posts by Category",
        data: stats?.crops.map((c) => c.count) || [],
        backgroundColor: [
          "#34D399",
          "#6EE7B7",
          "#A7F3D0",
          "#059669",
          "#047857",
          "#D1FAE5",
          "#065F46",
        ],
        borderColor: "#F9FAFB",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  // chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
  };
  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" as const },
    },
  };

  // total farmers = sum of all registrations
  const totalFarmers =
    stats?.monthlyRegistrations.reduce((sum, r) => sum + r.total, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-3 mb-1">
            <Leaf className="w-10 h-10 text-emerald-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Agriculture Dashboard
            </h1>
          </div>
        </header>

        {/* Action Cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-16">
          {cards.map(({ title, icon, onClick }) => (
            <button
              key={title}
              onClick={onClick}
              className="group flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-emerald-600 group-hover:text-emerald-500 transition-colors mb-2">
                {icon}
              </div>
              <span className="text-gray-700 font-medium text-sm text-center group-hover:text-emerald-800">
                {title}
              </span>
            </button>
          ))}
        </section>

        {/* Main Data Section */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Farmer Registration Growth
            </h2>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>

          {/* Stats & Crop Distribution */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Crop Distribution
              </h3>
              <Doughnut
                data={doughnutChartData}
                options={doughnutChartOptions}
              />
            </div>

            <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-semibold opacity-90 mb-1">Total Farmers</h3>
              <p className="text-4xl font-bold">{totalFarmers}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PosHomePage;
