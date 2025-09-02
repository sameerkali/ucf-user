import { NavLink } from "react-router-dom";
import { Home, HelpCircle, Settings, StickyNote, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

const DOCK_ITEMS = [
  { labelKey: "home", to: "/kisaan/home", icon: Home },
  { labelKey: "post", to: "/kisaan/posts", icon: StickyNote },
  { labelKey: "helpSupport", to: "/kisaan/help", icon: HelpCircle },
  { labelKey: "settings", to: "/kisaan/settings", icon: Settings }
];

export default function Dock() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-sm md:hidden">
      <div className="relative max-w-md mx-auto flex items-center justify-between px-6 py-2">
        {DOCK_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              "flex flex-col items-center justify-center text-xs transition-colors duration-150 py-1 px-2 " +
              (isActive
                ? "text-gray-800"
                : "text-gray-500 hover:text-gray-700")
            }
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
        
        {/* Centered Floating Plus Button */}
        <NavLink
          to="/kisaan/posts"
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-300 hover:scale-110 z-10"
          aria-label="Add New Post"
        >
          <Plus className="w-8 h-8" />
        </NavLink>
      </div>
    </nav>
  );
}
