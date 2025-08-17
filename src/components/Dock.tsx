import { NavLink } from "react-router-dom";
import { Home, HelpCircle, Settings, StickyNote } from "lucide-react";
import { useTranslation } from "react-i18next";

const DOCK_ITEMS = [
  { labelKey: "home", to: "/home", icon: Home },
  { labelKey: "post", to: "/posts", icon: StickyNote },
  { labelKey: "helpSupport", to: "/help", icon: HelpCircle },
  { labelKey: "settings", to: "/settings", icon: Settings }
];

export default function Dock() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 shadow-sm flex items-center justify-around px-1 py-2 md:hidden">
      {DOCK_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            "flex flex-col items-center justify-center text-xs transition-colors duration-150 py-1 px-2 border-b-2 " +
            (isActive
              ? "text-gray-800 border-gray-800"
              : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-400")
          }
        >
          <item.icon className="h-6 w-6 mb-0.5" />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
