import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  User, 
  UserPlus, 
  FileText, 
  Settings, 
  Home,
  Wheat,
  Leaf,
  Sun
} from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();

  const navigationItems = [
    {
      to: "/landing",
      label: t("fullAuthFlow"),
      icon: <Home className="w-5 h-5" />,
      color: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
    },
    {
      to: "/login",
      label: t("login"),
      icon: <User className="w-5 h-5" />,
      color: "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
    },
    {
      to: "/signup",
      label: t("signup"),
      icon: <UserPlus className="w-5 h-5" />,
      color: "from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
    },
    {
      to: "/posts",
      label: t("posts"),
      icon: <FileText className="w-5 h-5" />,
      color: "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
    },
    {
      to: "/complete-profile",
      label: t("profileDetails"),
      icon: <Settings className="w-5 h-5" />,
      color: "from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
    }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-10">
        <Wheat className="w-32 h-32 text-green-600" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10">
        <Leaf className="w-28 h-28 text-emerald-600" />
      </div>
      <div className="absolute top-40 right-20 opacity-10">
        <Sun className="w-24 h-24 text-yellow-600" />
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-white/50">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg">
            <Wheat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
            {t("welcome")}
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            {t("dashboardDescription")}
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigationItems.map((item, index) => (
            <Link 
              key={index}
              to={item.to} 
              className="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-r ${item.color} text-white rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 bg-white/20 rounded-lg p-2">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight">
                      {item.label}
                    </h3>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            🌾 {t("agriConnectDashboard")}
          </p>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">{t("developmentModeActive")}</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
