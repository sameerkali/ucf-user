import { NavLink } from "react-router-dom";
import { Home, HelpCircle, Settings, StickyNote } from "lucide-react";

const DOCK_ITEMS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Post", to: "/post", icon: StickyNote },
  { label: "Help & Support", to: "/help", icon: HelpCircle },
  { label: "Settings", to: "/settings", icon: Settings }
];

export default function Dock() {
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
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}