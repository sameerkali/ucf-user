import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";

const MENU_ITEMS = [
  { labelKey: "home", to: "/kisaan/home" },
  { labelKey: "Dashboard", to: "/kisaan/dashboard" },
  { labelKey: "helpSupport", to: "/kisaan/help" },
  { labelKey: "settings", to: "/kisaan/settings" },
];

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <header className="hidden md:flex w-full items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow z-50">
      <Link to="/kisaan/home">
        <div className="font-bold text-xl text-gray-900">{t("appName")}</div>
      </Link>
      <nav className="flex items-center gap-8">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-2 text-sm font-medium transition-colors duration-150 border-b-2 ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 hover:text-blue-500 border-transparent hover:border-blue-300"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}

        {/* New Post Button */}
        <Link
          to="/kisaan/post-create"
          className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
          aria-label={t("createNewPost")}
        >
          <Plus className="w-4 h-4" />
          {t("newPost")}
        </Link>
      </nav>
    </header>
  );
}
