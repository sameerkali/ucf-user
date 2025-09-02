import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  HelpCircle,
  Settings,
  Plus,
  LayoutDashboard,
} from "lucide-react";

const t = (key: string) => {
  const translations: { [key: string]: string } = {
    home: "Home",
    Dashboard: "Dashboard",
    helpSupport: "Help",
    settings: "Settings",
  };
  return translations[key] || key;
};

const leftDockItems = [
  { labelKey: "home", to: "/kisaan/home", icon: Home },
  { labelKey: "Dashboard", to: "/kisaan/posts", icon: LayoutDashboard },
];

const rightDockItems = [
  { labelKey: "helpSupport", to: "/kisaan/help", icon: HelpCircle },
  { labelKey: "settings", to: "/kisaan/settings", icon: Settings },
];
const DockItem = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      "flex flex-col items-center justify-center text-xs transition-colors duration-200 w-16 " +
      (isActive
        ? "text-green-600 font-semibold"
        : "text-gray-500 hover:text-green-500")
    }
  >
    <Icon className="h-6 w-6 mb-1" />
    <span className="truncate">{label}</span>
  </NavLink>
);
export default function Dock() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.05)] md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {leftDockItems.map((item) => (
          <DockItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={t(item.labelKey)}
          />
        ))}

        <NavLink
          to="/kisaan/post-create"
          className={({ isActive }) =>
            "flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-105 " +
            (isActive ? "bg-green-700" : "bg-green-600 hover:bg-green-700")
          }
          aria-label="Add New Post"
        >
          <Plus className="w-8 h-8" />
        </NavLink>
        {rightDockItems.map((item) => (
          <DockItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={t(item.labelKey)}
          />
        ))}
      </div>
    </nav>
  );
}
